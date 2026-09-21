<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, type CSSProperties } from 'vue'

export type BottomSheetSnapSource = 'drag' | 'keyboard' | 'programmatic' | 'open' | 'close'

export interface BottomSheetProps {
  title?: string
  description?: string
  snapPoints?: number[]
  initialSnap?: number
  duration?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<BottomSheetProps>(), {
  title: 'Sheet',
  description: '',
  snapPoints: () => [0.42, 0.72, 0.94],
  initialSnap: 0,
  duration: 300,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  open: []
  close: []
  snapChange: [index: number, source: BottomSheetSnapSource]
}>()

const uid = useId()
const titleId = `bottom-sheet-title-${uid}`
const descriptionId = `bottom-sheet-description-${uid}`
const handle = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const dragging = ref(false)
const activeSnap = ref(0)
const dragTranslate = ref(0)
const sheetHeight = ref(0)
const announcement = ref('')

let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false
let pointerId: number | undefined
let dragStartY = 0
let lastMoveY = 0
let lastMoveTime = 0
let dragVelocity = 0
let pendingSnap: number | undefined
let focusTimer: number | undefined

const safeSnapPoints = computed(() => {
  const valid = props.snapPoints
    .filter(point => Number.isFinite(point) && point > 0.05 && point <= 1)
    .sort((a, b) => a - b)
  return valid.length ? valid : [0.42, 0.72, 0.94]
})
const safeDuration = computed(() => (Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 300))
const maxSnap = computed(() => safeSnapPoints.value[safeSnapPoints.value.length - 1]!)
const snapHeights = computed(() => safeSnapPoints.value.map(point => (point / maxSnap.value) * sheetHeight.value))
const snapLabels = computed(() => safeSnapPoints.value.map(point => (point < 0.45 ? 'peek' : point < 0.75 ? 'half' : 'expanded')))
const baseTranslate = computed(() => {
  if (!sheetHeight.value) return 0
  const snapHeight = snapHeights.value[activeSnap.value] ?? sheetHeight.value
  return Math.max(0, sheetHeight.value - snapHeight)
})
const currentTranslate = computed(() =>
  Math.min(sheetHeight.value, Math.max(0, baseTranslate.value + (dragging.value ? dragTranslate.value : 0))),
)
const backdropOpacity = computed(() => {
  if (!open.value || !sheetHeight.value) return 0
  const exposed = Math.max(0, sheetHeight.value - currentTranslate.value)
  const lowestSnap = snapHeights.value[0] ?? sheetHeight.value
  return Math.min(0.55, 0.55 * (exposed / Math.max(1, lowestSnap * 1.6)))
})
const panelStyle = computed<CSSProperties>(() => ({
  height: `${maxSnap.value * 100}dvh`,
  transform: `translate3d(0, ${open.value ? `${currentTranslate.value}px` : sheetHeight.value ? `${sheetHeight.value}px` : '100%'}, 0)`,
  transitionProperty: dragging.value ? 'none' : 'transform, visibility',
  transitionDuration: `${safeDuration.value}ms`,
  visibility: open.value ? 'visible' : 'hidden',
}))
const backdropStyle = computed<CSSProperties>(() => ({
  opacity: String(open.value ? backdropOpacity.value : 0),
  transitionProperty: dragging.value ? 'none' : 'opacity',
  transitionDuration: `${safeDuration.value}ms`,
}))

function measure() {
  if (typeof window === 'undefined' || !panel.value) return
  sheetHeight.value = panel.value.getBoundingClientRect().height
}

function announce(message: string) {
  announcement.value = ''
  void nextTick(() => {
    announcement.value = message
  })
}

function clampSnap(index: number) {
  return Math.max(0, Math.min(safeSnapPoints.value.length - 1, index))
}

function getHandle() {
  return handle.value ?? panel.value?.querySelector<HTMLButtonElement>('[data-testid="bottom-sheet-handle"]') ?? null
}

function scheduleFocus(target: HTMLElement | null) {
  if (typeof window === 'undefined') return
  if (focusTimer !== undefined) window.clearTimeout(focusTimer)
  focusTimer = window.setTimeout(() => {
    target?.focus()
    focusTimer = undefined
  }, 50)
}

function applySnap(index: number, source: BottomSheetSnapSource) {
  const next = clampSnap(index)
  if (next === activeSnap.value && source !== 'programmatic' && source !== 'open') return
  activeSnap.value = next
  emit('snapChange', next, source)
  announce(`Sheet at ${snapLabels.value[next]} height.`)
}

function lockPageScroll() {
  if (!props.lockScroll || scrollLocked || typeof document === 'undefined') return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockPageScroll() {
  if (!scrollLocked || typeof document === 'undefined') return
  document.body.style.overflow = previousOverflow
  scrollLocked = false
}

async function openSheet(snap?: number) {
  if (props.disabled || open.value) return
  pendingSnap = snap
  previousFocus = typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null
  open.value = true
}

function closeSheet() {
  if (!open.value) return
  releasePointer()
  dragging.value = false
  open.value = false
}

function snapTo(index: number, source: BottomSheetSnapSource = 'programmatic') {
  if (!open.value || props.disabled) return false
  applySnap(index, source)
  return true
}

function releasePointer() {
  const id = pointerId
  pointerId = undefined
  const target = getHandle()
  if (id === undefined || !target) return
  try {
    if (target.hasPointerCapture(id)) target.releasePointerCapture(id)
  }
  catch {
    // Capture can already be released when the browser cancels the gesture.
  }
}

function nearestSnapIndex(exposedHeight: number) {
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  snapHeights.value.forEach((height, index) => {
    const distance = Math.abs(height - exposedHeight)
    if (distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  return best
}

function onHandlePointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0 || pointerId !== undefined) return
  pointerId = event.pointerId
  dragStartY = event.clientY
  dragTranslate.value = 0
  dragVelocity = 0
  lastMoveY = event.clientY
  lastMoveTime = event.timeStamp
  dragging.value = true
  try {
    getHandle()?.setPointerCapture(event.pointerId)
  }
  catch {
    // Synthetic pointer events may not support capture.
  }
}

function onHandlePointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || !dragging.value) return
  event.preventDefault()
  dragTranslate.value = event.clientY - dragStartY
  const elapsed = event.timeStamp - lastMoveTime
  if (elapsed > 0) {
    dragVelocity = (event.clientY - lastMoveY) / elapsed
    lastMoveY = event.clientY
    lastMoveTime = event.timeStamp
  }
}

function onHandlePointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerId || !dragging.value) return
  const exposedHeight = Math.max(0, sheetHeight.value - currentTranslate.value)
  releasePointer()
  dragging.value = false
  const lowestSnap = snapHeights.value[0] ?? sheetHeight.value
  if (exposedHeight < lowestSnap * 0.55 || (dragVelocity > 0.65 && activeSnap.value === 0 && exposedHeight < lowestSnap * 1.25)) {
    closeSheet()
    announce('Sheet closed.')
    return
  }
  let target = nearestSnapIndex(exposedHeight)
  if (dragVelocity > 0.65 && target > 0 && snapHeights.value[target - 1]! < exposedHeight) target -= 1
  else if (dragVelocity < -0.65 && target < safeSnapPoints.value.length - 1) target += 1
  applySnap(target, 'drag')
}

function onHandlePointerCancel(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  releasePointer()
  dragging.value = false
}

function onHandleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
    event.preventDefault()
    if (activeSnap.value < safeSnapPoints.value.length - 1) applySnap(activeSnap.value + 1, 'keyboard')
  }
  else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
    event.preventDefault()
    if (activeSnap.value <= 0) {
      closeSheet()
      return
    }
    applySnap(activeSnap.value - 1, 'keyboard')
  }
  else if (event.key === 'Home') {
    event.preventDefault()
    applySnap(safeSnapPoints.value.length - 1, 'keyboard')
  }
  else if (event.key === 'End') {
    event.preventDefault()
    applySnap(0, 'keyboard')
  }
  else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    applySnap(activeSnap.value >= safeSnapPoints.value.length - 1 ? 0 : activeSnap.value + 1, 'keyboard')
  }
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeSheet()
  }
  else if (event.key === 'Tab' && panel.value) {
    const focusable = [...panel.value.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hasAttribute('hidden'))
    if (!focusable.length) return
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
    else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

function onBackdropPointerDown() {
  if (props.closeOnBackdrop) closeSheet()
}

function onWindowResize() {
  measure()
}

async function performOpen() {
  if (!previousFocus && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    previousFocus = document.activeElement
  }
  emit('open')
  lockPageScroll()
  await nextTick()
  measure()
  applySnap(pendingSnap ?? props.initialSnap, 'open')
  pendingSnap = undefined
  await nextTick()
  scheduleFocus(getHandle())
}

function performClose() {
  emit('close')
  if (activeSnap.value !== 0) {
    activeSnap.value = 0
    emit('snapChange', 0, 'close')
  }
  unlockPageScroll()
  scheduleFocus(previousFocus)
  previousFocus = null
}

watch(
  open,
  (value, previous) => {
    if (value) void performOpen()
    else if (previous === true) performClose()
  },
  { immediate: true },
)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && open.value) closeSheet()
  },
)

onMounted(() => {
  measure()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (focusTimer !== undefined) window.clearTimeout(focusTimer)
  releasePointer()
  unlockPageScroll()
})

defineExpose({ open: openSheet, close: closeSheet, snapTo })
</script>

<template>
  <div class="bottom-sheet-root">
    <div
      v-if="open"
      data-testid="bottom-sheet-backdrop"
      class="bottom-sheet-backdrop fixed inset-0 z-[60] bg-[#0d120c] motion-reduce:transition-none"
      :style="backdropStyle"
      aria-hidden="true"
      @pointerdown="onBackdropPointerDown"
    />
    <section
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      data-testid="bottom-sheet-panel"
      class="bottom-sheet-panel fixed inset-x-0 bottom-0 z-[70] mx-auto flex w-full max-w-[min(100vw,560px)] flex-col overflow-hidden rounded-t-[28px] border-t border-black/10 bg-[#f7f5ee] text-[#171814] shadow-[0_-24px_80px_-30px_rgba(13,18,12,0.55)] ease-[cubic-bezier(.16,1,.3,1)] will-change-transform motion-reduce:transition-none sm:inset-x-4"
      :class="{ 'is-disabled': disabled }"
      :style="panelStyle"
      @keydown="onPanelKeydown"
    >
      <button
        ref="handle"
        type="button"
        data-testid="bottom-sheet-handle"
        class="group flex w-full shrink-0 cursor-grab touch-none select-none flex-col items-center gap-1.5 rounded-t-[28px] px-4 pb-1 pt-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#171814] active:cursor-grabbing"
        aria-label="Drag or use arrow keys to change sheet height"
        @pointerdown="onHandlePointerDown"
        @pointermove="onHandlePointerMove"
        @pointerup="onHandlePointerUp"
        @pointercancel="onHandlePointerCancel"
        @keydown="onHandleKeydown"
      >
        <span class="h-1.5 w-11 rounded-full bg-[#171814]/25 transition-colors group-hover:bg-[#171814]/45" />
        <span class="sr-only">Sheet handle</span>
      </button>
      <header class="shrink-0 px-5 pb-3 pt-1 sm:px-6">
        <h2 :id="titleId" class="text-lg font-semibold tracking-[-0.03em]">{{ title }}</h2>
        <p v-if="description" :id="descriptionId" class="mt-1 text-xs leading-5 text-[#171814]/55">{{ description }}</p>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <slot />
      </div>
      <p data-testid="bottom-sheet-announcement" class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
    </section>
  </div>
</template>

<style scoped>
.bottom-sheet-root{display:contents}
@media (prefers-reduced-motion:reduce){.bottom-sheet-panel,.bottom-sheet-backdrop{transition:none!important}}
</style>
