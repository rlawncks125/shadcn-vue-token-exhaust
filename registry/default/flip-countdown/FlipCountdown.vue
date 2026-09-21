<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  autoStart?: boolean
  loop?: boolean
  paused?: boolean
  showHours?: boolean
  label?: string
  flipDuration?: number
}>(), {
  duration: 90,
  autoStart: false,
  loop: false,
  paused: false,
  showHours: true,
  label: 'Countdown',
  flipDuration: 520,
})

const emit = defineEmits<{ start: []; pause: []; tick: [seconds: number]; complete: [] }>()
const remaining = ref(Math.max(props.duration, 0))
const running = ref(false)
const reducedMotion = ref(false)
const digitElements = ref<HTMLElement[]>([])
const display = computed(() => {
  const total = Math.max(Math.ceil(remaining.value), 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor(total % 3600 / 60)
  const seconds = total % 60
  return `${props.showHours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

let frame = 0
let endsAt = 0
let lastDisplay = display.value
let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function setDigit(element: unknown, index: number) {
  if (element instanceof HTMLElement) digitElements.value[index] = element
}

async function animateChangedDigits(previous: string) {
  await nextTick()
  animations.forEach(animation => animation.cancel())
  animations = []
  if (reducedMotion.value) return
  ;[...display.value].forEach((character, index) => {
    if (character === ':' || character === previous[index]) return
    const element = digitElements.value[index]
    if (element) animations.push(element.animate([
      { transform: 'perspective(500px) rotateX(-88deg)', opacity: 0.2 },
      { transform: 'perspective(500px) rotateX(10deg)', opacity: 1, offset: 0.72 },
      { transform: 'perspective(500px) rotateX(0deg)', opacity: 1 },
    ], { duration: Math.max(props.flipDuration, 180), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))
  })
}

function tick(now: number) {
  if (!running.value || props.paused) return
  remaining.value = Math.max((endsAt - now) / 1000, 0)
  const nextDisplay = display.value
  if (nextDisplay !== lastDisplay) {
    animateChangedDigits(lastDisplay)
    lastDisplay = nextDisplay
    emit('tick', Math.ceil(remaining.value))
  }
  if (remaining.value <= 0) {
    emit('complete')
    if (props.loop) {
      remaining.value = Math.max(props.duration, 0)
      endsAt = now + remaining.value * 1000
    } else {
      running.value = false
      return
    }
  }
  frame = requestAnimationFrame(tick)
}

function start() {
  if (running.value || remaining.value <= 0) return
  running.value = true
  endsAt = performance.now() + remaining.value * 1000
  if (!props.paused) frame = requestAnimationFrame(tick)
  emit('start')
}

function pause() {
  if (!running.value) return
  running.value = false
  cancelAnimationFrame(frame)
  emit('pause')
}

function reset(seconds = props.duration) {
  cancelAnimationFrame(frame)
  running.value = false
  remaining.value = Math.max(seconds, 0)
  lastDisplay = display.value
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) { animations.forEach(animation => animation.cancel()); animations = [] }
}

watch(() => props.paused, value => {
  if (!running.value) return
  if (value) cancelAnimationFrame(frame)
  else { endsAt = performance.now() + remaining.value * 1000; frame = requestAnimationFrame(tick) }
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  if (props.autoStart) start()
})
onBeforeUnmount(() => { cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel()); motionQuery?.removeEventListener('change', handleMotionChange) })
defineExpose({ start, pause, reset })
</script>

<template>
  <div class="flip-countdown inline-flex flex-col gap-3" role="timer" :aria-label="`${label}: ${display}`" :data-running="running ? '' : undefined">
    <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">{{ label }}</span>
    <span class="flex items-center gap-1 font-mono text-2xl font-semibold tabular-nums sm:gap-1.5 sm:text-5xl" aria-hidden="true">
      <template v-for="(character, index) in [...display]" :key="index">
        <span v-if="character === ':'" class="text-foreground/30 sm:px-0.5">:</span>
        <span v-else :ref="element => setDigit(element, index)" class="flip-countdown-digit grid min-w-[1em] place-items-center rounded-lg border border-foreground/10 bg-foreground px-1 py-2 text-background shadow-sm sm:min-w-[1.15em] sm:px-1.5">{{ character }}</span>
      </template>
    </span>
  </div>
</template>
