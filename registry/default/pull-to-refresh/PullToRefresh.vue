<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  threshold?: number
  maxPull?: number
  resistance?: number
  duration?: number
  disabled?: boolean
  label?: string
  onRefresh?: () => void | Promise<void>
}>(), {
  threshold: 64,
  maxPull: 112,
  resistance: 0.55,
  duration: 280,
  disabled: false,
  label: 'Refresh content',
})

const refreshing = defineModel<boolean>('refreshing', { default: false })
const emit = defineEmits<{
  pull: [progress: number]
  release: [ready: boolean]
  refresh: []
  complete: []
  cancel: []
}>()

const viewport = ref<HTMLElement>()
const pull = ref(0)
const dragging = ref(false)
const active = ref(false)
const safeThreshold = computed(() => Math.max(1, props.threshold))
const safeMaxPull = computed(() => Math.max(safeThreshold.value, props.maxPull))
const progress = computed(() => Math.min(1, pull.value / safeThreshold.value))
const state = computed<'idle' | 'pulling' | 'ready' | 'refreshing'>(() => {
  if (active.value) return 'refreshing'
  if (progress.value >= 1) return 'ready'
  if (pull.value > 0) return 'pulling'
  return 'idle'
})
const stateLabel = computed(() => ({
  idle: 'Pull down to refresh',
  pulling: `Pull to refresh, ${Math.round(progress.value * 100)} percent`,
  ready: 'Release to refresh',
  refreshing: 'Refreshing content',
}[state.value]))
const contentStyle = computed(() => ({
  transform: `translate3d(0, ${pull.value}px, 0)`,
  transitionDuration: dragging.value ? '0ms' : `${Math.max(0, props.duration)}ms`,
}))
const indicatorStyle = computed(() => ({ height: `${safeMaxPull.value}px` }))

let pointerId: number | undefined
let startX = 0
let startY = 0
let axis: 'horizontal' | 'vertical' | undefined
let captureTarget: HTMLElement | undefined
let refreshRun = 0

function releaseCapture() {
  const id = pointerId
  const target = captureTarget
  pointerId = undefined
  captureTarget = undefined
  if (id === undefined || !target) return
  try {
    if (target.hasPointerCapture(id)) target.releasePointerCapture(id)
  }
  catch {
    // Capture can already be gone when the browser cancels a native gesture.
  }
}

function settle() {
  dragging.value = false
  axis = undefined
  pull.value = active.value ? safeThreshold.value : 0
}

function cancelGesture(announce = true) {
  const hadPull = pull.value > 0 && !active.value
  releaseCapture()
  settle()
  if (hadPull && announce) emit('cancel')
}

function complete(run = refreshRun) {
  if (!active.value || run !== refreshRun) return
  active.value = false
  refreshRun++
  if (refreshing.value) refreshing.value = false
  pull.value = 0
  emit('complete')
}

async function refresh() {
  if (props.disabled || active.value) return
  cancelGesture(false)
  const run = ++refreshRun
  active.value = true
  pull.value = safeThreshold.value
  if (!refreshing.value) refreshing.value = true

  if (!props.onRefresh) {
    emit('refresh')
    return
  }

  // In Vue, an onRefresh prop is also the refresh event listener. Calling it
  // directly lets its promise drive completion without firing it twice.
  try {
    await props.onRefresh()
  }
  finally {
    complete(run)
  }
}

function reset() {
  releaseCapture()
  refreshRun++
  active.value = false
  dragging.value = false
  axis = undefined
  pull.value = 0
  if (refreshing.value) refreshing.value = false
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || active.value || event.button !== 0 || pointerId !== undefined || !viewport.value || viewport.value.scrollTop > 0) return
  pointerId = event.pointerId
  startX = event.clientX
  startY = event.clientY
  axis = undefined
  captureTarget = event.currentTarget as HTMLElement
  try {
    captureTarget.setPointerCapture(event.pointerId)
  }
  catch {
    // Synthetic pointer events and older browsers may not support capture.
  }
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || active.value) return
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  if (!axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 5) {
    axis = Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal'
    if (axis === 'horizontal' || deltaY < 0) {
      cancelGesture(false)
      return
    }
  }
  if (axis !== 'vertical' || deltaY <= 0) return

  event.preventDefault()
  dragging.value = true
  const resistance = Math.max(0.05, Math.min(1, props.resistance))
  const resisted = deltaY * resistance
  const softened = resisted > safeThreshold.value
    ? safeThreshold.value + (resisted - safeThreshold.value) * 0.35
    : resisted
  pull.value = Math.min(safeMaxPull.value, softened)
  emit('pull', progress.value)
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  const wasDragging = dragging.value
  const ready = progress.value >= 1
  releaseCapture()
  dragging.value = false
  axis = undefined
  if (!wasDragging) {
    pull.value = 0
    return
  }
  emit('release', ready)
  if (ready) void refresh()
  else cancelGesture()
}

function onPointerCancel(event: PointerEvent) {
  if (event.pointerId === pointerId) cancelGesture()
}

function onLostPointerCapture(event: PointerEvent) {
  if (event.pointerId === pointerId) cancelGesture()
}

watch(refreshing, (value) => {
  if (value && !active.value) {
    refreshRun++
    active.value = true
    pull.value = safeThreshold.value
  }
  else if (!value && active.value) complete(refreshRun)
}, { immediate: true })

watch(() => props.disabled, (disabled) => {
  if (disabled && pointerId !== undefined) cancelGesture()
})

watch(safeThreshold, (value) => {
  if (active.value) pull.value = value
})

onBeforeUnmount(() => {
  releaseCapture()
  refreshRun++
})

defineExpose({ refresh, reset })
</script>

<template>
  <div
    class="pull-to-refresh relative h-full min-h-0 w-full overflow-hidden bg-inherit"
    :class="{ 'is-disabled': disabled, 'is-refreshing': state === 'refreshing' }"
    :aria-busy="state === 'refreshing'"
  >
    <div
      class="pull-to-refresh-indicator pointer-events-none absolute inset-x-0 top-0 grid place-items-end pb-3 text-current"
      :style="indicatorStyle"
      aria-hidden="true"
    >
      <div
        data-testid="pull-to-refresh-handle"
        data-pull-to-refresh-handle
        class="pull-to-refresh-handle flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3.5 text-[11px] font-semibold text-black/65 shadow-[0_10px_30px_-14px_#0008] backdrop-blur-sm transition-[opacity,transform] ease-out motion-reduce:transition-none dark:border-white/10 dark:bg-neutral-900/95 dark:text-white/70"
        :class="pull > 0 || state === 'refreshing' ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'"
        :style="{ transitionDuration: `${Math.max(0, duration)}ms` }"
      >
        <svg v-if="state === 'refreshing'" class="size-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" />
          <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <svg v-else class="size-4 -rotate-90 transition-transform duration-200 motion-reduce:transition-none" :class="{ '!rotate-0': state === 'ready' }" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".18" stroke-width="2" />
          <circle cx="12" cy="12" r="9" pathLength="100" stroke="currentColor" stroke-width="2" stroke-linecap="round" :stroke-dasharray="100" :stroke-dashoffset="100 - progress * 100" />
          <path v-if="state === 'ready'" d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ state === 'refreshing' ? 'Refreshing' : state === 'ready' ? 'Release' : 'Pull down' }}</span>
      </div>
    </div>

    <div
      ref="viewport"
      data-testid="pull-to-refresh-viewport"
      data-pull-to-refresh-viewport
      class="pull-to-refresh-viewport h-full min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-x_pan-down]"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @lostpointercapture="onLostPointerCapture"
    >
      <div
        class="pull-to-refresh-content relative z-10 min-h-full bg-inherit will-change-transform transition-transform ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
        :class="{ 'select-none': dragging }"
        :style="contentStyle"
      >
        <slot />
      </div>
    </div>

    <button type="button" class="sr-only" :disabled="disabled || state === 'refreshing'" :aria-label="label" @click="refresh">
      {{ label }}
    </button>
    <span class="sr-only" role="status" aria-live="polite">{{ stateLabel }}</span>
  </div>
</template>
