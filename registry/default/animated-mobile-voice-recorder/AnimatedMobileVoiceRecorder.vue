<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  recording?: boolean
  paused?: boolean
  maxDuration?: number
  label?: string
  pausedLabel?: string
  idleLabel?: string
  duration?: number
  disabled?: boolean
  haptic?: boolean
}>(), {
  recording: false,
  paused: false,
  maxDuration: 120,
  label: 'Recording voice note',
  pausedLabel: 'Recording paused',
  idleLabel: 'Record voice note',
  duration: 220,
  disabled: false,
  haptic: false,
})

const emit = defineEmits<{
  'update:recording': [value: boolean]
  'update:paused': [value: boolean]
  start: []
  pause: [elapsed: number]
  resume: [elapsed: number]
  cancel: [elapsed: number]
  send: [elapsed: number]
  tick: [elapsed: number]
  limit: [elapsed: number]
}>()

const elapsed = ref(0)
const startButton = ref<HTMLButtonElement>()
let timer: ReturnType<typeof setInterval> | undefined
const safeMax = computed(() => Math.max(1, Math.floor(props.maxDuration)))
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 220)
const progress = computed(() => Math.min(100, elapsed.value / safeMax.value * 100))
const time = computed(() => `${String(Math.floor(elapsed.value / 60)).padStart(2, '0')}:${String(elapsed.value % 60).padStart(2, '0')}`)
const bars = [7, 13, 20, 10, 17, 25, 12, 22, 16, 8, 18, 26, 13, 21, 9, 16, 24, 12]

function pulse() {
  if (props.haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8)
}
function stopTimer() { if (timer) clearInterval(timer); timer = undefined }
function syncTimer() {
  stopTimer()
  if (!props.recording || props.paused) return
  timer = setInterval(() => {
    elapsed.value += 1; emit('tick', elapsed.value)
    if (elapsed.value >= safeMax.value) { stopTimer(); emit('update:recording', false); emit('limit', elapsed.value); pulse() }
  }, 1000)
}
function start() {
  if (props.disabled) return false
  elapsed.value = 0; emit('update:recording', true); emit('update:paused', false); emit('start'); pulse(); return true
}
function togglePause() {
  if (props.disabled || !props.recording) return false
  const next = !props.paused; emit('update:paused', next); next ? emit('pause', elapsed.value) : emit('resume', elapsed.value); pulse(); return true
}
function cancel() {
  if (props.disabled || !props.recording) return false
  const value = elapsed.value; stopTimer(); emit('update:recording', false); emit('update:paused', false); emit('cancel', value); elapsed.value = 0; return true
}
function send() {
  if (props.disabled || !props.recording || elapsed.value < 1) return false
  const value = elapsed.value; stopTimer(); emit('update:recording', false); emit('update:paused', false); emit('send', value); elapsed.value = 0; pulse(); return true
}

watch(() => [props.recording, props.paused] as const, syncTimer, { immediate: true })
watch(safeMax, value => { if (elapsed.value >= value && props.recording) { stopTimer(); emit('update:recording', false); emit('limit', elapsed.value) } })
onBeforeUnmount(stopTimer)
defineExpose({ start, togglePause, cancel, send, focus: () => nextTick(() => startButton.value?.focus()), elapsed })
</script>

<template>
  <div data-testid="animated-mobile-voice-recorder" class="w-full" :style="{ '--recorder-duration': `${safeDuration}ms` }">
    <Transition name="recorder" mode="out-in">
      <button v-if="!recording" ref="startButton" key="idle" type="button" data-testid="voice-start" class="flex min-h-14 w-full items-center justify-center gap-3 rounded-[20px] bg-[#1b1d19] px-5 text-sm font-semibold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#d9ff57] focus-visible:ring-offset-2 disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="start"><span class="grid size-8 place-items-center rounded-full bg-[#d9ff57] text-[#1b1d19]" aria-hidden="true">●</span>{{ idleLabel }}</button>
      <section v-else key="active" class="rounded-[24px] border border-black/10 bg-white p-3 shadow-[0_16px_50px_-28px_rgba(0,0,0,.55)]" role="group" :aria-label="paused ? pausedLabel : label">
        <div class="flex items-center gap-3 px-1">
          <span class="relative flex size-3" aria-hidden="true"><span v-if="!paused" class="absolute size-full animate-ping rounded-full bg-red-500/30 motion-reduce:animate-none" /><span class="relative size-3 rounded-full" :class="paused ? 'bg-amber-400' : 'bg-red-500'" /></span>
          <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">{{ paused ? pausedLabel : label }}</p><p class="mt-0.5 font-mono text-[10px] text-black/42" aria-live="polite">{{ time }} / {{ String(Math.floor(safeMax / 60)).padStart(2, '0') }}:{{ String(safeMax % 60).padStart(2, '0') }}</p></div>
          <button type="button" data-testid="voice-cancel" class="min-h-11 rounded-[14px] px-3 text-xs font-semibold text-black/45 outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" @click="cancel">Cancel</button>
        </div>
        <div class="my-3 flex h-10 items-center justify-center gap-1 overflow-hidden rounded-[14px] bg-[#f0eee7] px-3" aria-hidden="true">
          <span v-for="(height, index) in bars" :key="index" class="voice-bar w-1 rounded-full bg-[#1b1d19]" :class="paused ? 'opacity-30' : ''" :style="{ height: `${height}px`, animationDelay: `${index * -75}ms` }" />
        </div>
        <div class="h-1 overflow-hidden rounded-full bg-black/8"><div class="h-full rounded-full bg-red-500 transition-[width] duration-300 motion-reduce:transition-none" :style="{ width: `${progress}%` }" /></div>
        <div class="mt-3 grid grid-cols-[1fr_1.5fr] gap-2">
          <button type="button" data-testid="voice-pause" class="min-h-12 rounded-[16px] border border-black/10 text-xs font-semibold outline-none active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" :aria-pressed="paused" @click="togglePause">{{ paused ? 'Resume' : 'Pause' }}</button>
          <button type="button" data-testid="voice-send" class="min-h-12 rounded-[16px] bg-[#d9ff57] text-xs font-bold outline-none active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled || elapsed < 1" @click="send">Send voice note</button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.recorder-enter-active,.recorder-leave-active { transition: opacity var(--recorder-duration) ease, transform var(--recorder-duration) cubic-bezier(.2,.8,.2,1); }
.recorder-enter-from,.recorder-leave-to { opacity: 0; transform: translateY(8px) scale(.98); }
.voice-bar { animation: voice-wave .9s ease-in-out infinite alternate; }
@keyframes voice-wave { to { transform: scaleY(.45); opacity: .55; } }
@media (prefers-reduced-motion: reduce) { .recorder-enter-active,.recorder-leave-active { transition: none !important; } .voice-bar { animation: none !important; } }
</style>
