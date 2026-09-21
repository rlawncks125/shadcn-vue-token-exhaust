<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  resetAfter?: number
  label?: string
  holdingLabel?: string
  completeLabel?: string
  tone?: 'default' | 'danger'
  disabled?: boolean
}>(), {
  duration: 1200,
  resetAfter: 1400,
  label: 'Hold to confirm',
  holdingLabel: 'Keep holding',
  completeLabel: 'Confirmed',
  tone: 'default',
  disabled: false,
})
const emit = defineEmits<{ start: []; cancel: []; complete: [] }>()
const state = ref<'idle' | 'holding' | 'complete'>('idle')
const progress = ref(0)
const hintId = `hold-hint-${useId()}`
let startedAt = 0
let frame: number | undefined
let resetTimer: ReturnType<typeof setTimeout> | undefined
const displayLabel = computed(() => state.value === 'holding' ? props.holdingLabel : state.value === 'complete' ? props.completeLabel : props.label)
const safeDuration = computed(() => Math.max(300, props.duration))

function clearFrame() {
  if (frame !== undefined) cancelAnimationFrame(frame)
  frame = undefined
}
function clearReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = undefined
}
function reset() {
  clearFrame()
  clearReset()
  progress.value = 0
  state.value = 'idle'
}
function finish() {
  clearFrame()
  progress.value = 1
  state.value = 'complete'
  emit('complete')
  if (props.resetAfter > 0) resetTimer = setTimeout(reset, Math.max(500, props.resetAfter))
}
function tick(now: number) {
  if (state.value !== 'holding') return
  progress.value = Math.min(1, (now - startedAt) / safeDuration.value)
  if (progress.value >= 1) finish()
  else frame = requestAnimationFrame(tick)
}
function start() {
  if (props.disabled || state.value !== 'idle') return
  clearReset()
  state.value = 'holding'
  progress.value = 0
  startedAt = performance.now()
  emit('start')
  frame = requestAnimationFrame(tick)
}
function cancel() {
  if (state.value !== 'holding') return
  clearFrame()
  progress.value = 0
  state.value = 'idle'
  emit('cancel')
}
function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  start()
}
function onKeydown(event: KeyboardEvent) {
  if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); start() }
}
function onKeyup(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); cancel() }
}

onBeforeUnmount(() => { clearFrame(); clearReset() })
defineExpose({ reset })
</script>

<template>
  <div class="relative inline-grid">
    <button
      type="button"
      class="relative isolate h-14 min-w-56 touch-none select-none overflow-hidden rounded-full border-0 bg-[#171814] px-7 font-[inherit] text-sm font-semibold text-white shadow-[0_16px_36px_-22px_#000c] outline-none transition-[transform,box-shadow,background-color] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_20px_40px_-20px_#000c] active:not-disabled:translate-y-0 focus-visible:ring-3 focus-visible:ring-[var(--registry-accent,#d9ff57)] focus-visible:ring-offset-3 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      :class="{ 'bg-[#6d1010]': tone === 'danger', 'cursor-wait': state === 'holding', '!bg-[#78a51d] !text-[#172000]': state === 'complete' && tone === 'default', '!bg-[#d9483f]': state === 'complete' && tone === 'danger' }"
      :disabled="disabled" :aria-describedby="hintId" :aria-busy="state === 'holding'" :aria-pressed="state === 'complete'"
      @pointerdown="onPointerDown" @pointerup="cancel" @pointercancel="cancel" @pointerleave="cancel"
      @keydown="onKeydown" @keyup="onKeyup" @blur="cancel" @click.prevent
    >
      <span
        class="absolute inset-y-0 left-0 z-0 bg-[var(--registry-accent,#d9ff57)] transition-[width] duration-75 motion-reduce:transition-none"
        :class="tone === 'danger' ? 'bg-[#ef665b]' : 'bg-[var(--registry-accent,#d9ff57)]'" :style="{ width: `${progress * 100}%` }" aria-hidden="true"
      />
      <span class="relative z-10 flex items-center justify-center gap-2" :class="{ 'text-[#172000]': state === 'holding' && tone === 'default' }">
        <span class="grid size-5 place-items-center rounded-full border border-current/25 text-[10px]" aria-hidden="true">{{ state === 'complete' ? 'OK' : state === 'holding' ? Math.round(progress * 100) : '!' }}</span>
        {{ displayLabel }}
      </span>
    </button>
    <div class="sr-only" role="progressbar" aria-label="Confirmation progress" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(progress * 100)" />
    <span :id="hintId" class="sr-only">Press and hold with a pointer, Space, or Enter until progress reaches 100 percent.</span>
  </div>
</template>
