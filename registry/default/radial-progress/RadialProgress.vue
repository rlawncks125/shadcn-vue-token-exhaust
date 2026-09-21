<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  max?: number
  size?: number
  strokeWidth?: number
  duration?: number
  indeterminate?: boolean
  paused?: boolean
  showValue?: boolean
  label?: string
  color?: string
  trackColor?: string
  formatValue?: (value: number, max: number) => string
}>(), {
  max: 100,
  size: 180,
  strokeWidth: 10,
  duration: 900,
  indeterminate: false,
  paused: false,
  showValue: true,
  label: 'Progress',
  color: 'var(--registry-accent, #d9ff57)',
  trackColor: 'currentColor',
  formatValue: undefined,
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  complete: []
}>()

const progressCircle = ref<SVGCircleElement | null>(null)
const spinner = ref<SVGGElement | null>(null)
const displayedValue = ref(0)
const reducedMotion = ref(false)

let animations: Animation[] = []
let numberFrame: number | undefined
let motionQuery: MediaQueryList | undefined

const safeMax = computed(() => Math.max(props.max, 0.0001))
const clampedValue = computed(() => Math.min(Math.max(model.value, 0), safeMax.value))
const percent = computed(() => clampedValue.value / safeMax.value * 100)
const safeStrokeWidth = computed(() => Math.min(Math.max(props.strokeWidth, 1), 24))
const radius = computed(() => 50 - safeStrokeWidth.value / 2)
const valueLabel = computed(() => {
  if (props.formatValue) return props.formatValue(displayedValue.value, safeMax.value)
  return `${Math.round(displayedValue.value / safeMax.value * 100)}%`
})
const ariaValueText = computed(() => {
  if (props.formatValue) return props.formatValue(clampedValue.value, safeMax.value)
  return `${Math.round(percent.value)}%`
})

function cancelAnimations() {
  animations.forEach(animation => animation.cancel())
  animations = []
  if (numberFrame !== undefined) cancelAnimationFrame(numberFrame)
  numberFrame = undefined
}

function syncPlayback() {
  animations.forEach((animation) => {
    if (props.paused) animation.pause()
    else animation.play()
  })
}

function setImmediate(value = clampedValue.value) {
  cancelAnimations()
  displayedValue.value = value
  if (progressCircle.value) progressCircle.value.style.strokeDashoffset = String(100 - value / safeMax.value * 100)
}

function animateValue(target: number, replayFromZero = false) {
  if (!progressCircle.value || props.indeterminate) return

  const fromValue = replayFromZero ? 0 : displayedValue.value
  const computedOffset = Number.parseFloat(getComputedStyle(progressCircle.value).strokeDashoffset)
  const fromOffset = replayFromZero || !Number.isFinite(computedOffset)
    ? 100 - fromValue / safeMax.value * 100
    : computedOffset
  const targetOffset = 100 - target / safeMax.value * 100

  cancelAnimations()
  if (reducedMotion.value || props.duration <= 0) {
    setImmediate(target)
    if (target >= safeMax.value) emit('complete')
    return
  }

  const duration = Math.max(props.duration, 0)
  const strokeAnimation = progressCircle.value.animate([
    { strokeDashoffset: String(fromOffset) },
    { strokeDashoffset: String(targetOffset) },
  ], {
    duration,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'both',
  })
  animations.push(strokeAnimation)
  syncPlayback()

  const tick = () => {
    if (!animations.includes(strokeAnimation)) return
    const elapsed = Math.min(Math.max(Number(strokeAnimation.currentTime) || 0, 0), duration)
    const linear = duration ? elapsed / duration : 1
    const eased = 1 - Math.pow(1 - linear, 3)
    displayedValue.value = fromValue + (target - fromValue) * eased
    if (strokeAnimation.playState !== 'finished') numberFrame = requestAnimationFrame(tick)
  }
  numberFrame = requestAnimationFrame(tick)

  strokeAnimation.finished.then(() => {
    if (!animations.includes(strokeAnimation)) return
    progressCircle.value && (progressCircle.value.style.strokeDashoffset = String(targetOffset))
    displayedValue.value = target
    cancelAnimations()
    if (target >= safeMax.value) emit('complete')
  }).catch(() => undefined)
}

async function setupMode() {
  await nextTick()
  cancelAnimations()
  if (!progressCircle.value || !spinner.value) return

  if (!props.indeterminate) {
    setImmediate(clampedValue.value)
    return
  }

  displayedValue.value = clampedValue.value
  progressCircle.value.style.strokeDashoffset = ''
  if (reducedMotion.value) return

  const duration = Math.max(props.duration * 1.8, 1000)
  animations = [
    spinner.value.animate([
      { transform: 'rotate(-90deg)' },
      { transform: 'rotate(270deg)' },
    ], { duration, easing: 'linear', iterations: Infinity }),
    progressCircle.value.animate([
      { strokeDasharray: '12 88', strokeDashoffset: '0' },
      { strokeDasharray: '42 58', strokeDashoffset: '-18' },
      { strokeDasharray: '12 88', strokeDashoffset: '-100' },
    ], { duration, easing: 'ease-in-out', iterations: Infinity }),
  ]
  syncPlayback()
}

function replay() {
  if (props.indeterminate) setupMode()
  else animateValue(clampedValue.value, true)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  setupMode()
}

watch(clampedValue, value => animateValue(value))
watch(() => [props.indeterminate, props.duration], setupMode)
watch(() => props.paused, syncPlayback)
watch(safeMax, () => setImmediate(clampedValue.value))

onMounted(() => {
  displayedValue.value = clampedValue.value
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  setupMode()
})

onBeforeUnmount(() => {
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay })
</script>

<template>
  <div
    class="radial-progress relative inline-grid shrink-0 place-items-center text-foreground"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : safeMax"
    :aria-valuenow="indeterminate ? undefined : clampedValue"
    :aria-valuetext="indeterminate ? `${label}, loading` : ariaValueText"
    :data-indeterminate="indeterminate ? '' : undefined"
    :data-paused="paused || reducedMotion ? '' : undefined"
  >
    <svg class="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="safeStrokeWidth"
        class="opacity-15 [vector-effect:non-scaling-stroke]"
      />
      <g ref="spinner" class="origin-center">
        <circle
          ref="progressCircle"
          class="radial-progress-circle [vector-effect:non-scaling-stroke] drop-shadow-[0_0_6px_currentColor]"
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          :stroke="color"
          :stroke-width="safeStrokeWidth"
          stroke-linecap="round"
          pathLength="100"
          :stroke-dasharray="indeterminate ? '28 72' : '100 100'"
          :stroke-dashoffset="indeterminate ? 0 : 100 - percent"
        />
      </g>
    </svg>

    <div class="relative z-10 text-center">
      <slot :value="displayedValue" :percent="displayedValue / safeMax * 100" :indeterminate="indeterminate">
        <p v-if="showValue && !indeterminate" class="radial-progress-value text-3xl font-semibold tracking-[-0.05em]">{{ valueLabel }}</p>
        <p v-else-if="indeterminate" class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Loading</p>
        <p class="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ label }}</p>
      </slot>
    </div>
  </div>
</template>
