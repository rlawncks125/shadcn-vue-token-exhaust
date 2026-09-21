<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, type CSSProperties } from 'vue'

export type SwipeDrawerPlacement = 'bottom' | 'right'

interface SwipeDrawerProps {
  placement?: SwipeDrawerPlacement
  title?: string
  description?: string
  duration?: number
  threshold?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<SwipeDrawerProps>(), {
  placement: 'bottom',
  title: 'Drawer',
  description: '',
  duration: 320,
  threshold: 0.3,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  open: []
  close: []
  opened: []
  closed: []
}>()
const slots = defineSlots<{
  trigger(props: { open: boolean; openDrawer: () => void }): unknown
  title(props: { titleId: string }): unknown
  description(props: { descriptionId: string }): unknown
  default(props: { close: () => void; titleId: string; descriptionId: string }): unknown
}>()

const uid = useId()
const panelId = `swipe-drawer-${uid}`
const titleId = `swipe-drawer-title-${uid}`
const descriptionId = `swipe-drawer-description-${uid}`
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const reducedMotion = ref(false)
const dragging = ref(false)
const returning = ref(false)
const dragDistance = ref(0)

let mounted = false
let activePointerId: number | null = null
let pointerStart = 0
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false
let returnTimer: ReturnType<typeof setTimeout> | undefined
let motionQuery: MediaQueryList | undefined

const hasDescription = computed(() => Boolean(props.description || slots.description))
const transitionDuration = computed(() => reducedMotion.value || !Number.isFinite(props.duration) ? 0 : Math.max(0, props.duration))
const panelPositionClass = computed(() => props.placement === 'bottom'
  ? 'inset-x-0 bottom-0 max-h-[min(88dvh,760px)] sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-2xl'
  : 'inset-y-0 right-0 h-full w-[min(92vw,440px)] sm:inset-y-4 sm:right-4 sm:h-auto sm:max-h-[calc(100dvh-2rem)]')
const enterFromClass = computed(() => props.placement === 'bottom'
  ? 'opacity-0 [&_.swipe-drawer-panel]:translate-y-full'
  : 'opacity-0 [&_.swipe-drawer-panel]:translate-x-full')
const leaveToClass = computed(() => props.placement === 'bottom'
  ? 'opacity-0 [&_.swipe-drawer-panel]:translate-y-full'
  : 'opacity-0 [&_.swipe-drawer-panel]:translate-x-full')
const backdropStyle = computed<CSSProperties>(() => ({ transitionDuration: `${transitionDuration.value}ms` }))
const panelStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = { transitionDuration: `${transitionDuration.value}ms` }
  if (dragging.value || returning.value || dragDistance.value > 0) {
    style.transform = props.placement === 'bottom'
      ? `translate3d(0, ${dragDistance.value}px, 0)`
      : `translate3d(${dragDistance.value}px, 0, 0)`
    style.transitionProperty = dragging.value ? 'none' : 'transform'
  }
  return style
})

function focusableElements(): HTMLElement[] {
  if (!panel.value) return []
  return [...panel.value.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
  )].filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function lockPage(): void {
  if (!props.lockScroll || scrollLocked) return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockPage(): void {
  if (!scrollLocked) return
  document.body.style.overflow = previousOverflow
  scrollLocked = false
}

async function activate(): Promise<void> {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lockPage()
  await nextTick()
  ;(focusableElements()[0] ?? panel.value)?.focus()
}

function restoreFocus(): void {
  unlockPage()
  if (previousFocus?.isConnected) previousFocus.focus()
  else trigger.value?.focus()
  previousFocus = null
}

function open(): void {
  if (!props.disabled) model.value = true
}

function close(): void {
  model.value = false
}

function handleBackdrop(): void {
  if (props.closeOnBackdrop) close()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!model.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return

  const elements = focusableElements()
  if (!elements.length) {
    event.preventDefault()
    panel.value?.focus()
    return
  }

  const first = elements[0]!
  const last = elements[elements.length - 1]!
  const active = document.activeElement
  if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || !panel.value?.contains(active))) {
    event.preventDefault()
    first.focus()
  }
}

function pointerCoordinate(event: PointerEvent): number {
  return props.placement === 'bottom' ? event.clientY : event.clientX
}

function handlePointerDown(event: PointerEvent): void {
  if (props.disabled || event.button !== 0 || !event.isPrimary) return
  clearTimeout(returnTimer)
  activePointerId = event.pointerId
  pointerStart = pointerCoordinate(event)
  dragDistance.value = 0
  returning.value = false
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragging.value || activePointerId !== event.pointerId) return
  event.preventDefault()
  dragDistance.value = Math.max(0, pointerCoordinate(event) - pointerStart)
}

function dismissDistance(): number {
  const threshold = Number.isFinite(props.threshold) ? Math.max(0, props.threshold) : 0.3
  if (threshold > 1) return threshold
  const size = props.placement === 'bottom'
    ? panel.value?.getBoundingClientRect().height
    : panel.value?.getBoundingClientRect().width
  return threshold * (size ?? Number.POSITIVE_INFINITY)
}

function resetDrag(): void {
  dragging.value = false
  if (reducedMotion.value) {
    dragDistance.value = 0
    returning.value = false
    return
  }
  returning.value = true
  requestAnimationFrame(() => {
    dragDistance.value = 0
    returnTimer = setTimeout(() => { returning.value = false }, transitionDuration.value)
  })
}

function handlePointerEnd(event: PointerEvent): void {
  if (!dragging.value || activePointerId !== event.pointerId) return
  const target = event.currentTarget as HTMLElement
  activePointerId = null
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
  if (dragDistance.value >= dismissDistance()) {
    dragging.value = false
    close()
  } else {
    resetDrag()
  }
}

function handlePointerCancel(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  activePointerId = null
  resetDrag()
}

function handleAfterEnter(): void {
  emit('opened')
}

function handleAfterLeave(): void {
  dragDistance.value = 0
  dragging.value = false
  returning.value = false
  restoreFocus()
  emit('closed')
}

function handleMotionChange(event: MediaQueryListEvent): void {
  reducedMotion.value = event.matches
  if (event.matches && returning.value) {
    clearTimeout(returnTimer)
    dragDistance.value = 0
    returning.value = false
  }
}

watch(model, (isOpen) => {
  if (!mounted) return
  if (isOpen) {
    emit('open')
    activate()
  } else {
    emit('close')
  }
})

watch(() => props.lockScroll, (shouldLock) => {
  if (!mounted || !model.value) return
  if (shouldLock) lockPage()
  else unlockPage()
})

watch(() => props.placement, () => {
  clearTimeout(returnTimer)
  activePointerId = null
  dragging.value = false
  returning.value = false
  dragDistance.value = 0
})

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  document.addEventListener('keydown', handleKeydown)
  if (model.value) activate()
})

onBeforeUnmount(() => {
  mounted = false
  clearTimeout(returnTimer)
  motionQuery?.removeEventListener('change', handleMotionChange)
  document.removeEventListener('keydown', handleKeydown)
  if (model.value) restoreFocus()
  else unlockPage()
})

defineExpose({ open, close })
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="swipe-drawer-trigger inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background outline-none transition-colors hover:bg-foreground/85 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-45"
    aria-haspopup="dialog"
    :aria-controls="panelId"
    :aria-expanded="model"
    :disabled="disabled"
    @click="open"
  >
    <slot name="trigger" :open="model" :open-drawer="open">Open drawer</slot>
  </button>

  <Teleport to="body">
    <Transition
      :duration="transitionDuration"
      enter-active-class="transition-opacity ease-out motion-reduce:transition-none [&_.swipe-drawer-panel]:transition-transform [&_.swipe-drawer-panel]:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:[&_.swipe-drawer-panel]:transition-none"
      leave-active-class="transition-opacity ease-in motion-reduce:transition-none [&_.swipe-drawer-panel]:transition-transform [&_.swipe-drawer-panel]:ease-[cubic-bezier(0.4,0,1,1)] motion-reduce:[&_.swipe-drawer-panel]:transition-none"
      :enter-from-class="enterFromClass"
      :leave-to-class="leaveToClass"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="model"
        class="swipe-drawer-backdrop fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]"
        :style="backdropStyle"
        @click.self="handleBackdrop"
      >
        <section
          :id="panelId"
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="hasDescription ? descriptionId : undefined"
          tabindex="-1"
          class="swipe-drawer-panel fixed flex min-h-0 flex-col overflow-hidden outline-none"
          :class="panelPositionClass"
          :data-placement="placement"
        >
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden border border-black/10 bg-background text-foreground shadow-[0_24px_100px_rgb(0_0_0/0.32)]" :class="placement === 'bottom' ? 'rounded-t-[28px] sm:rounded-[28px]' : 'rounded-l-[28px] sm:rounded-[28px]'" :style="panelStyle">
            <div
              class="flex h-7 shrink-0 touch-none cursor-grab items-center justify-center active:cursor-grabbing"
              aria-hidden="true"
              @pointerdown="handlePointerDown"
              @pointermove="handlePointerMove"
              @pointerup="handlePointerEnd"
              @pointercancel="handlePointerCancel"
              @lostpointercapture="handlePointerCancel"
            >
              <span class="h-1.5 w-12 rounded-full bg-foreground/15" />
            </div>

            <header class="flex shrink-0 items-start gap-4 border-b border-border px-5 pb-5 pt-2 sm:px-7">
              <div class="min-w-0 flex-1">
                <h2 :id="titleId" class="text-lg font-semibold tracking-tight">
                  <slot name="title" :title-id="titleId">{{ title }}</slot>
                </h2>
                <p v-if="hasDescription" :id="descriptionId" class="mt-1 text-sm leading-5 text-muted-foreground">
                  <slot name="description" :description-id="descriptionId">{{ description }}</slot>
                </p>
              </div>
              <button
                type="button"
                class="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-muted/60 text-lg leading-none text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-primary/20"
                aria-label="Close drawer"
                @click="close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <slot :close="close" :title-id="titleId" :description-id="descriptionId" />
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
