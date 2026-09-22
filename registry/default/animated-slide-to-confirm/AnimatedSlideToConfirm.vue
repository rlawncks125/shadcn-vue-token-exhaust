<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  confirmedLabel?: string
  threshold?: number
  duration?: number
  resetAfter?: number
  tone?: 'dark' | 'success' | 'danger'
  haptic?: boolean
  loading?: boolean
  disabled?: boolean
}>(), {
  modelValue: false,
  label: 'Slide to confirm',
  confirmedLabel: 'Confirmed',
  threshold: 0.82,
  duration: 260,
  resetAfter: 0,
  tone: 'dark',
  haptic: false,
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  progress: [value: number]
  confirm: []
  reset: []
}>()

const track = ref<HTMLElement>()
const handle = ref<HTMLButtonElement>()
const progress = ref(props.modelValue ? 1 : 0)
const dragging = ref(false)
const maxDistance = ref(0)
let startX = 0
let startProgress = 0
let pointerId: number | null = null
let resizeObserver: ResizeObserver | undefined
let resetTimer: ReturnType<typeof setTimeout> | undefined

const safeThreshold = computed(() => Number.isFinite(props.threshold) ? Math.min(1, Math.max(0.5, props.threshold)) : 0.82)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)
const safeResetAfter = computed(() => Number.isFinite(props.resetAfter) ? Math.max(0, props.resetAfter) : 0)
const locked = computed(() => props.disabled || props.loading || props.modelValue)
const toneClass = computed(() => ({ dark: 'bg-[#1b1d19]', success: 'bg-[#4f7b62]', danger: 'bg-[#a8493d]' })[props.tone])
const rootStyle = computed(() => ({ '--slide-duration': `${safeDuration.value}ms`, '--slide-offset': `${progress.value * maxDistance.value}px`, '--slide-progress': `${progress.value * 100}%` }))

function measure() {
  if (!track.value || !handle.value) return
  maxDistance.value = Math.max(0, track.value.clientWidth - handle.value.offsetWidth - 8)
}

function vibrate(pattern: number | number[]) {
  if (props.haptic && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

function setProgress(value: number) {
  progress.value = Math.min(1, Math.max(0, value))
  emit('progress', progress.value)
}

function confirm() {
  if (props.disabled || props.loading || props.modelValue) return false
  setProgress(1)
  vibrate([12, 30, 18])
  emit('update:modelValue', true)
  emit('confirm')
  if (resetTimer) clearTimeout(resetTimer)
  if (safeResetAfter.value > 0) resetTimer = setTimeout(reset, safeResetAfter.value)
  return true
}

function reset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = undefined
  setProgress(0)
  emit('update:modelValue', false)
  emit('reset')
  return true
}

function onPointerDown(event: PointerEvent) {
  if (locked.value || event.button !== 0) return
  pointerId = event.pointerId
  startX = event.clientX
  startProgress = progress.value
  dragging.value = true
  handle.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value || pointerId !== event.pointerId || !maxDistance.value) return
  event.preventDefault()
  const next = startProgress + (event.clientX - startX) / maxDistance.value
  setProgress(next > 1 ? 1 + (next - 1) * 0.12 : next)
}

function onPointerUp(event: PointerEvent) {
  if (pointerId !== event.pointerId) return
  if (handle.value?.hasPointerCapture(event.pointerId)) handle.value.releasePointerCapture(event.pointerId)
  pointerId = null
  dragging.value = false
  if (progress.value >= safeThreshold.value) confirm()
  else setProgress(0)
}

function onPointerCancel(event: PointerEvent) {
  if (pointerId !== event.pointerId) return
  if (handle.value?.hasPointerCapture(event.pointerId)) handle.value.releasePointerCapture(event.pointerId)
  pointerId = null
  dragging.value = false
  setProgress(props.modelValue ? 1 : 0)
}

function onKeydown(event: KeyboardEvent) {
  if (locked.value) return
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setProgress(progress.value + 0.1) }
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setProgress(progress.value - 0.1) }
  else if (event.key === 'Home') { event.preventDefault(); setProgress(0) }
  else if (event.key === 'End' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); confirm() }
}

watch(() => props.modelValue, (value) => {
  if (!value && resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = undefined
  }
  setProgress(value ? 1 : 0)
})
watch(() => props.loading, (value) => { if (value && !props.modelValue) setProgress(0) })

onMounted(() => {
  nextTick(measure)
  if (track.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track.value)
  }
})
onBeforeUnmount(() => { resizeObserver?.disconnect(); if (resetTimer) clearTimeout(resetTimer) })

defineExpose({ confirm, reset, setProgress, focus: () => handle.value?.focus(), recalculate: measure })
</script>

<template>
  <div ref="track" data-testid="animated-slide-to-confirm" class="relative h-16 w-full min-w-64 overflow-hidden rounded-[22px] bg-black/[0.07] p-1" :class="disabled ? 'opacity-45' : ''" :style="rootStyle">
    <span class="absolute inset-y-1 left-1 rounded-[18px] opacity-15 transition-[width] motion-reduce:transition-none" :class="toneClass" :style="{ width: `calc(var(--slide-progress) + 3.5rem)` }" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center px-16 text-center">
      <span class="text-xs font-semibold transition-opacity motion-reduce:transition-none" :class="modelValue ? 'opacity-0' : 'opacity-55'">{{ loading ? 'Please wait…' : label }}</span>
      <span class="absolute text-xs font-semibold transition-opacity motion-reduce:transition-none" :class="modelValue ? 'opacity-100' : 'opacity-0'">{{ confirmedLabel }}</span>
    </div>
    <button
      ref="handle"
      type="button"
      data-testid="slide-confirm-handle"
      role="slider"
      :aria-label="label"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress * 100)"
      :aria-valuetext="modelValue ? confirmedLabel : `${Math.round(progress * 100)} percent`"
      :aria-disabled="locked || undefined"
      class="slide-handle relative z-10 grid size-14 touch-none place-items-center rounded-[18px] text-lg text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,.65)] outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      :class="[toneClass, dragging ? 'is-dragging' : '', locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing']"
      :style="{ transform: 'translateX(var(--slide-offset))' }"
      :disabled="disabled"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @keydown="onKeydown"
    >
      <span v-if="loading" class="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none" aria-hidden="true" />
      <span v-else aria-hidden="true">{{ modelValue ? '✓' : '→' }}</span>
    </button>
    <p class="sr-only" role="status" aria-live="polite">{{ modelValue ? confirmedLabel : '' }}</p>
  </div>
</template>

<style scoped>
.slide-handle { transition: transform var(--slide-duration) cubic-bezier(.2,.8,.2,1), background-color var(--slide-duration) ease; }
.slide-handle.is-dragging { transition: none; }
@media (prefers-reduced-motion: reduce) { .slide-handle { transition: none !important; } }
</style>
