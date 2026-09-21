<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue'

export type AnimatedSwipeSnackbarTone = 'default' | 'success' | 'warning' | 'error'
export type AnimatedSwipeSnackbarDismissSource = 'timeout' | 'swipe' | 'action' | 'close' | 'programmatic'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  message: string
  title?: string
  actionLabel?: string
  tone?: AnimatedSwipeSnackbarTone
  timeout?: number
  duration?: number
  swipeThreshold?: number
  closeOnAction?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  modelValue: false,
  title: '',
  actionLabel: '',
  tone: 'default',
  timeout: 5000,
  duration: 260,
  swipeThreshold: 84,
  closeOnAction: true,
  safeArea: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  show: []
  dismiss: [source: AnimatedSwipeSnackbarDismissSource]
  action: []
}>()

const bar = ref<HTMLElement | null>(null)
const dragging = ref(false)
const translateX = ref(0)
let pointerId: number | undefined
let startX = 0
let timer: ReturnType<typeof setTimeout> | undefined
let timerStartedAt = 0
let remaining = 0
let paused = false
let focusReturn: HTMLElement | null = null

const tones = {
  default: { shell: 'bg-[#1d1f1b] text-white', accent: 'bg-[#d9ff57]', action: 'text-[#d9ff57]' },
  success: { shell: 'bg-[#173d27] text-white', accent: 'bg-[#78df91]', action: 'text-[#9cf0ad]' },
  warning: { shell: 'bg-[#4a3513] text-white', accent: 'bg-[#f0c84b]', action: 'text-[#f7d96f]' },
  error: { shell: 'bg-[#51221d] text-white', accent: 'bg-[#ed7468]', action: 'text-[#ff9c92]' },
} as const
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)
const safeTimeout = computed(() => Number.isFinite(props.timeout) ? Math.max(0, props.timeout) : 5000)
const safeThreshold = computed(() => Number.isFinite(props.swipeThreshold) ? Math.min(240, Math.max(32, props.swipeThreshold)) : 84)
const rootStyle = computed<CSSProperties>(() => ({ '--snackbar-duration': `${safeDuration.value}ms` }))
const barStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(${translateX.value}px, 0, 0)`,
  opacity: String(Math.max(0.35, 1 - Math.abs(translateX.value) / (safeThreshold.value * 2.4))),
  transition: dragging.value ? 'none' : `transform ${safeDuration.value}ms cubic-bezier(.2,.8,.2,1), opacity ${safeDuration.value}ms ease`,
}))

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function startTimer(delay = safeTimeout.value) {
  clearTimer()
  remaining = delay
  if (!props.modelValue || props.disabled || delay <= 0 || paused) return
  timerStartedAt = Date.now()
  timer = setTimeout(() => dismiss('timeout'), delay)
}

function pauseTimer() {
  if (paused) return
  paused = true
  if (timer) remaining = Math.max(0, remaining - (Date.now() - timerStartedAt))
  clearTimer()
}

function resumeTimer() {
  if (!paused) return
  paused = false
  startTimer(remaining || safeTimeout.value)
}

function show() {
  if (props.disabled || props.modelValue) return false
  emit('update:modelValue', true)
  return true
}

function dismiss(source: AnimatedSwipeSnackbarDismissSource = 'programmatic') {
  if (!props.modelValue) return false
  const restoreFocus = typeof document !== 'undefined' && Boolean(bar.value?.contains(document.activeElement))
  clearTimer()
  emit('update:modelValue', false)
  emit('dismiss', source)
  if (restoreFocus) nextTick(() => focusReturn?.isConnected && focusReturn.focus({ preventScroll: true }))
  return true
}

function runAction() {
  if (props.disabled) return
  emit('action')
  if (props.closeOnAction) dismiss('action')
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  pointerId = event.pointerId
  startX = event.clientX
  dragging.value = true
  pauseTimer()
  try {
    bar.value?.setPointerCapture(event.pointerId)
  } catch {
    // Synthetic pointer events may not support capture.
  }
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  translateX.value = event.clientX - startX
}

function onPointerEnd(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== pointerId) return
  dragging.value = false
  pointerId = undefined
  if (Math.abs(translateX.value) >= safeThreshold.value) {
    translateX.value = Math.sign(translateX.value) * Math.max(window.innerWidth, 420)
    window.setTimeout(() => dismiss('swipe'), safeDuration.value)
    return
  }
  translateX.value = 0
  resumeTimer()
}

watch(() => props.modelValue, async visible => {
  clearTimer()
  dragging.value = false
  translateX.value = 0
  paused = false
  if (!visible) return
  if (typeof document !== 'undefined') focusReturn = document.activeElement instanceof HTMLElement && !bar.value?.contains(document.activeElement) ? document.activeElement : null
  emit('show')
  await nextTick()
  startTimer()
}, { immediate: true })
watch(() => props.timeout, () => props.modelValue && startTimer())
watch(() => props.disabled, disabled => disabled ? clearTimer() : props.modelValue && startTimer())

onBeforeUnmount(clearTimer)
defineExpose({ show, dismiss, focus: () => bar.value?.focus() })
</script>

<template>
  <Teleport to="body">
    <Transition name="swipe-snackbar">
      <div v-if="modelValue" class="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex justify-center px-3" :class="safeArea ? 'pb-[max(.75rem,env(safe-area-inset-bottom))]' : 'pb-3'" :style="rootStyle">
        <section
          ref="bar"
          data-testid="animated-swipe-snackbar"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          tabindex="-1"
          class="pointer-events-auto relative flex w-full max-w-lg touch-pan-y items-center gap-3 overflow-hidden rounded-[18px] px-4 py-3 shadow-[0_22px_65px_-22px_rgba(0,0,0,.75)] outline-none focus-visible:ring-2 focus-visible:ring-[#e4633f]"
          :class="tones[tone].shell"
          :style="barStyle"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerEnd"
          @pointercancel="onPointerEnd"
          @mouseenter="pauseTimer"
          @mouseleave="resumeTimer"
          @focusin="pauseTimer"
          @focusout="resumeTimer"
        >
          <span class="h-8 w-1 shrink-0 rounded-full" :class="tones[tone].accent" aria-hidden="true" />
          <div class="min-w-0 flex-1">
            <strong v-if="title" class="block truncate text-xs font-semibold">{{ title }}</strong>
            <p class="text-xs leading-5" :class="title ? 'mt-0.5 text-white/62' : 'text-white/85'">{{ message }}</p>
          </div>
          <button v-if="actionLabel" type="button" data-testid="swipe-snackbar-action" class="min-h-10 shrink-0 rounded-xl px-2.5 text-xs font-bold outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-current disabled:opacity-35" :class="tones[tone].action" :disabled="disabled" @pointerdown.stop @click="runAction">{{ actionLabel }}</button>
          <button type="button" data-testid="swipe-snackbar-close" class="grid size-10 shrink-0 place-items-center rounded-xl text-white/50 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-35" :disabled="disabled" aria-label="Dismiss notification" @pointerdown.stop @click="dismiss('close')">&#215;</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.swipe-snackbar-enter-active,
.swipe-snackbar-leave-active { transition: opacity var(--snackbar-duration) ease, transform var(--snackbar-duration) cubic-bezier(.2,.8,.2,1); }
.swipe-snackbar-enter-from,
.swipe-snackbar-leave-to { opacity: 0; transform: translateY(20px); }
@media (prefers-reduced-motion: reduce) {
  .swipe-snackbar-enter-active,
  .swipe-snackbar-leave-active { transition: none !important; }
}
</style>
