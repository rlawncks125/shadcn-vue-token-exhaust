<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type AnimatedProgressBarSize = 'small' | 'medium' | 'large'
export type AnimatedProgressBarStatus = 'success' | 'error' | 'default'

const props = withDefaults(defineProps<{
  value?: number
  min?: number
  max?: number
  label?: string
  formatValue?: (value: number, max: number, min: number) => string
  duration?: number
  color?: string
  indeterminate?: boolean
  striped?: boolean
  paused?: boolean
  showValue?: boolean
  size?: AnimatedProgressBarSize
  status?: AnimatedProgressBarStatus
}>(), {
  value: 0,
  min: 0,
  max: 100,
  label: 'Progress',
  formatValue: undefined,
  duration: 600,
  color: 'var(--registry-accent, #d9ff57)',
  indeterminate: false,
  striped: false,
  paused: false,
  showValue: true,
  size: 'medium',
  status: 'default',
})

const emit = defineEmits<{
  complete: []
}>()

const track = ref<HTMLElement | null>(null)
const fill = ref<HTMLElement | null>(null)
const reducedMotion = ref(false)
let animation: Animation | undefined
let motionQuery: MediaQueryList | undefined
let replayVersion = 0

const bounds = computed(() => {
  const first = Number.isFinite(props.min) ? props.min : 0
  const second = Number.isFinite(props.max) ? props.max : 100
  const min = Math.min(first, second)
  const candidateMax = Math.max(first, second)
  return { min, max: candidateMax === min ? min + 1 : candidateMax }
})
const clampedValue = computed(() => {
  const value = Number.isFinite(props.value) ? props.value : bounds.value.min
  return Math.min(bounds.value.max, Math.max(bounds.value.min, value))
})
const percent = computed(() => (clampedValue.value - bounds.value.min) / (bounds.value.max - bounds.value.min) * 100)
const safeDuration = computed(() => Math.min(10_000, Math.max(0, Number.isFinite(props.duration) ? props.duration : 0)))
const isComplete = computed(() => clampedValue.value >= bounds.value.max)
const visualStatus = computed<AnimatedProgressBarStatus>(() => {
  if (props.status === 'error') return 'error'
  if (props.status === 'success' || isComplete.value) return 'success'
  return 'default'
})
const formattedValue = computed(() => {
  if (props.formatValue) return props.formatValue(clampedValue.value, bounds.value.max, bounds.value.min)
  return `${Math.round(percent.value)}%`
})
const rootStyle = computed(() => ({
  '--progress-color': visualStatus.value === 'success'
    ? '#86c232'
    : visualStatus.value === 'error'
      ? '#ef675d'
      : props.color,
  '--progress-duration': `${safeDuration.value}ms`,
}))

function cancelAnimation() {
  animation?.cancel()
  animation = undefined
}

function renderedPercent() {
  if (!fill.value || !track.value || track.value.clientWidth <= 0) return percent.value
  return Math.min(100, Math.max(0, fill.value.getBoundingClientRect().width / track.value.clientWidth * 100))
}

function setImmediate(target = percent.value) {
  cancelAnimation()
  if (fill.value) fill.value.style.width = `${target}%`
}

function animateTo(target: number, from = renderedPercent()) {
  if (!fill.value || props.indeterminate) return

  cancelAnimation()
  fill.value.style.width = `${target}%`
  if (reducedMotion.value || safeDuration.value === 0 || from === target) return

  const current = fill.value.animate([
    { width: `${from}%` },
    { width: `${target}%` },
  ], {
    duration: safeDuration.value,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'both',
  })
  animation = current
  if (props.paused) current.pause()
  current.finished.then(() => {
    if (animation !== current) return
    current.cancel()
    animation = undefined
  }).catch(() => undefined)
}

async function replay() {
  if (props.indeterminate) {
    const element = fill.value
    if (!element || reducedMotion.value) return
    element.classList.remove('progress-indeterminate')
    void element.offsetWidth
    element.classList.add('progress-indeterminate')
    return
  }

  const version = ++replayVersion
  setImmediate(0)
  await nextTick()
  if (version !== replayVersion || !fill.value) return
  void fill.value.offsetWidth
  animateTo(percent.value, 0)
}

function reset() {
  replayVersion += 1
  setImmediate(0)
}

function syncPlayback() {
  if (!animation) return
  if (props.paused) animation.pause()
  else animation.play()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) setImmediate(percent.value)
  else animateTo(percent.value)
}

watch(percent, value => animateTo(value))
watch(() => props.duration, value => {
  if (!Number.isFinite(value) || value <= 0) setImmediate(percent.value)
})
watch(() => props.indeterminate, (indeterminate) => {
  replayVersion += 1
  if (indeterminate) cancelAnimation()
  else nextTick(() => setImmediate(percent.value))
})
watch(() => props.paused, syncPlayback)
watch(isComplete, (complete, wasComplete) => {
  if (complete && !wasComplete) emit('complete')
}, { flush: 'sync' })

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  setImmediate(percent.value)
})

onBeforeUnmount(() => {
  replayVersion += 1
  cancelAnimation()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay, reset })
</script>

<template>
  <div
    class="animated-progress-bar w-full text-foreground"
    :class="`progress-${size}`"
    :style="rootStyle"
    :data-status="visualStatus"
    :data-indeterminate="indeterminate ? '' : undefined"
    :data-paused="paused || reducedMotion ? '' : undefined"
  >
    <div v-if="label || showValue" class="mb-2.5 flex min-w-0 items-center justify-between gap-4">
      <span v-if="label" class="truncate text-xs font-semibold tracking-[-0.01em]">{{ label }}</span>
      <span
        v-if="showValue"
        class="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground"
        aria-hidden="true"
      >
        {{ indeterminate ? 'In progress' : formattedValue }}
      </span>
    </div>

    <div
      ref="track"
      class="progress-track relative w-full overflow-hidden rounded-full bg-foreground/10 ring-1 ring-inset ring-foreground/5"
      :class="{
        'h-1.5': size === 'small',
        'h-2.5': size === 'medium',
        'h-4': size === 'large',
      }"
      role="progressbar"
      :aria-label="label"
      :aria-valuemin="bounds.min"
      :aria-valuemax="bounds.max"
      :aria-valuenow="indeterminate ? undefined : clampedValue"
      :aria-valuetext="indeterminate ? `${label}, in progress` : formattedValue"
      :aria-busy="indeterminate || undefined"
    >
      <span
        ref="fill"
        class="progress-fill absolute inset-y-0 left-0 block rounded-full bg-[var(--progress-color)] shadow-[0_0_12px_color-mix(in_srgb,var(--progress-color)_45%,transparent)]"
        :class="{ 'progress-indeterminate': indeterminate }"
        :style="indeterminate ? undefined : { width: `${percent}%` }"
        aria-hidden="true"
      >
        <span
          v-if="striped"
          class="progress-stripes absolute inset-0 rounded-[inherit] opacity-30"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.progress-indeterminate {
  left: 30%;
  width: 40%;
  animation: progress-indeterminate max(700ms, calc(var(--progress-duration) * 1.8)) ease-in-out infinite;
  animation-play-state: running;
}

.progress-stripes {
  background-image: linear-gradient(135deg, transparent 25%, rgb(255 255 255 / 70%) 25%, rgb(255 255 255 / 70%) 50%, transparent 50%, transparent 75%, rgb(255 255 255 / 70%) 75%);
  background-size: 1rem 1rem;
  animation: progress-stripes max(500ms, var(--progress-duration)) linear infinite;
  animation-play-state: running;
}

[data-paused] .progress-indeterminate,
[data-paused] .progress-stripes {
  animation-play-state: paused;
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-210%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(210%); }
}

@keyframes progress-stripes {
  to { background-position: 1rem 0; }
}

@media (prefers-reduced-motion: reduce) {
  .progress-indeterminate,
  .progress-stripes {
    animation: none;
  }

  .progress-indeterminate {
    transform: none;
  }
}
</style>
