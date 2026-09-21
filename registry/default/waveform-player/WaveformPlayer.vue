<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  defaultPlaying?: boolean
  loop?: boolean
  playbackRate?: number
  barCount?: number
  label?: string
  disabled?: boolean
}>(), {
  duration: 42,
  defaultPlaying: false,
  loop: false,
  playbackRate: 1,
  barCount: 36,
  label: 'Audio preview',
  disabled: false,
})

const emit = defineEmits<{
  play: []
  pause: []
  timeupdate: [value: number]
  ended: []
}>()

const playing = ref(props.defaultPlaying)
const currentTime = ref(0)
const reducedMotion = ref(false)
const bars = ref<HTMLElement[]>([])
const progress = computed(() => Math.min(currentTime.value / Math.max(props.duration, 0.01) * 100, 100))
const heights = computed(() => Array.from({ length: Math.min(Math.max(props.barCount, 12), 72) }, (_, index) => 28 + ((index * 37 + index * index * 11) % 68)))

let frame = 0
let startedAt = 0
let barAnimations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function setBar(element: unknown, index: number) {
  if (element instanceof HTMLElement) bars.value[index] = element
}

function formatTime(value: number) {
  const seconds = Math.max(Math.round(value), 0)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function stopBarAnimations() {
  barAnimations.forEach(animation => animation.cancel())
  barAnimations = []
}

async function syncBarAnimations() {
  stopBarAnimations()
  if (!playing.value || reducedMotion.value) return
  await nextTick()
  barAnimations = bars.value.filter(Boolean).map((bar, index) => {
    const animation = bar.animate([
      { transform: 'scaleY(0.72)' },
      { transform: `scaleY(${1.02 + (index % 5) * 0.035})`, offset: 0.5 },
      { transform: 'scaleY(0.72)' },
    ], { duration: 720 + index % 7 * 85, iterations: Infinity, easing: 'ease-in-out' })
    animation.currentTime = (index * 137) % (720 + index % 7 * 85)
    return animation
  })
}

function tick(now: number) {
  if (!playing.value) return
  currentTime.value = Math.min((now - startedAt) / 1000 * props.playbackRate, props.duration)
  emit('timeupdate', currentTime.value)
  if (currentTime.value >= props.duration) {
    emit('ended')
    if (props.loop) {
      currentTime.value = 0
      startedAt = now
    } else {
      playing.value = false
      stopBarAnimations()
      return
    }
  }
  frame = requestAnimationFrame(tick)
}

function play() {
  if (props.disabled || playing.value) return
  if (currentTime.value >= props.duration) currentTime.value = 0
  playing.value = true
  startedAt = performance.now() - currentTime.value / Math.max(props.playbackRate, 0.01) * 1000
  frame = requestAnimationFrame(tick)
  syncBarAnimations()
  emit('play')
}

function pause() {
  if (!playing.value) return
  playing.value = false
  cancelAnimationFrame(frame)
  stopBarAnimations()
  emit('pause')
}

function toggle() {
  if (playing.value) pause()
  else play()
}

function seek(value: number) {
  currentTime.value = Math.min(Math.max(value, 0), props.duration)
  if (playing.value) startedAt = performance.now() - currentTime.value / Math.max(props.playbackRate, 0.01) * 1000
  emit('timeupdate', currentTime.value)
}

function handleSeek(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  syncBarAnimations()
}

watch(() => props.playbackRate, () => {
  if (playing.value) startedAt = performance.now() - currentTime.value / Math.max(props.playbackRate, 0.01) * 1000
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  if (playing.value) {
    startedAt = performance.now()
    frame = requestAnimationFrame(tick)
    syncBarAnimations()
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  stopBarAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ play, pause, toggle, seek })
</script>

<template>
  <div class="waveform-player flex w-full items-center gap-4" :data-playing="playing ? '' : undefined">
    <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none" :disabled="disabled" :aria-label="playing ? `Pause ${label}` : `Play ${label}`" @click="toggle">
      <span aria-hidden="true" class="text-sm">{{ playing ? 'Ⅱ' : '▶' }}</span>
    </button>
    <div class="min-w-0 flex-1">
      <div class="relative h-12">
        <div class="pointer-events-none absolute inset-0 flex items-center gap-0.5 overflow-hidden" aria-hidden="true">
          <span v-for="(height, index) in heights" :key="index" :ref="element => setBar(element, index)" class="waveform-player-bar min-w-0 flex-1 origin-center rounded-full transition-colors duration-150 motion-reduce:transition-none" :class="index / heights.length * 100 <= progress ? 'bg-foreground' : 'bg-foreground/15'" :style="{ height: `${height}%` }" />
        </div>
        <input type="range" class="waveform-player-range absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" min="0" :max="duration" step="0.1" :value="currentTime" :disabled="disabled" :aria-label="`Seek ${label}`" @input="handleSeek">
      </div>
      <div class="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-foreground/45"><span>{{ formatTime(currentTime) }}</span><span>{{ formatTime(duration) }}</span></div>
    </div>
  </div>
</template>
