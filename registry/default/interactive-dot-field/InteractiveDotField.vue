<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

interface Point {
  x: number
  y: number
}

interface Dot extends Point {
  id: string
  baseOpacity: number
  baseRadius: number
}

interface RenderedDot extends Dot {
  opacity: number
  radius: number
}

interface Pulse extends Point {
  id: number
}

interface PulseDetail extends Point {
  count: number
}

const props = withDefaults(defineProps<{
  rows?: number
  columns?: number
  intensity?: number
  color?: string
  duration?: number
  paused?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  rows: 13,
  columns: 21,
  intensity: 0.8,
  color: 'var(--registry-accent, #a3e635)',
  duration: 1100,
  paused: false,
  disabled: false,
  ariaLabel: 'Interactive dot field',
})

const emit = defineEmits<{
  pulse: [detail: PulseDetail]
  reset: []
}>()

const surface = ref<HTMLElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const pointer = ref<Point>({ x: 50, y: 50 })
const pointerActive = ref(false)
const focused = ref(false)
const reducedMotion = ref(false)
const viewBoxWidth = ref(100)
const pulseCount = ref(0)
const pulses = ref<Pulse[]>([])

const pulseElements = new Map<number, SVGCircleElement>()
const pulseAnimations = new Map<number, Animation>()
const gradientId = `interactive-dot-field-${useId().replace(/:/g, '')}`

let pulseSequence = 0
let motionQuery: MediaQueryList | undefined
let resizeObserver: ResizeObserver | undefined

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max)
}

const safeRows = computed(() => Math.round(clamp(props.rows, 2, 32)))
const safeColumns = computed(() => Math.round(clamp(props.columns, 2, 48)))
const safeIntensity = computed(() => clamp(props.intensity, 0, 1))
const safeDuration = computed(() => clamp(props.duration, 0, 10000))
const interactionActive = computed(() => !props.paused && !props.disabled && (pointerActive.value || focused.value))
const viewBox = computed(() => `0 0 ${viewBoxWidth.value} 100`)

const dots = computed<Dot[]>(() => {
  const horizontalInset = 4
  const verticalInset = 4

  return Array.from({ length: safeRows.value * safeColumns.value }, (_, index) => {
    const row = Math.floor(index / safeColumns.value)
    const column = index % safeColumns.value
    const variation = ((row * 17 + column * 29) % 11) / 10

    return {
      id: `${row}-${column}`,
      x: horizontalInset + column / (safeColumns.value - 1) * (100 - horizontalInset * 2),
      y: verticalInset + row / (safeRows.value - 1) * (100 - verticalInset * 2),
      baseRadius: 0.14 + variation * 0.16,
      baseOpacity: 0.14 + variation * 0.2,
    }
  })
})

const renderedDots = computed<RenderedDot[]>(() => {
  const reach = 14 + safeIntensity.value * 20

  return dots.value.map((dot) => {
    const distance = interactionActive.value
      ? Math.hypot((dot.x - pointer.value.x) * viewBoxWidth.value / 100, dot.y - pointer.value.y)
      : Number.POSITIVE_INFINITY
    const proximity = Math.max(0, 1 - distance / reach) * safeIntensity.value

    return {
      ...dot,
      radius: dot.baseRadius + proximity * 1.15,
      opacity: Math.min(1, dot.baseOpacity * (0.55 + safeIntensity.value * 0.55) + proximity * 0.78),
    }
  })
})

function clientToViewBox(clientX: number, clientY: number): Point {
  if (!svg.value) return { x: 50, y: 50 }

  const matrix = svg.value.getScreenCTM()
  if (!matrix) return { x: 50, y: 50 }

  const point = svg.value.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const transformed = point.matrixTransform(matrix.inverse())
  return {
    x: clamp(transformed.x / viewBoxWidth.value * 100, 0, 100),
    y: clamp(transformed.y, 0, 100),
  }
}

function setPulseElement(id: number, element: unknown) {
  if (element instanceof SVGCircleElement) pulseElements.set(id, element)
  else pulseElements.delete(id)
}

function removePulse(id: number) {
  pulseAnimations.delete(id)
  pulseElements.delete(id)
  pulses.value = pulses.value.filter(pulse => pulse.id !== id)
}

function clearPulseVisuals() {
  pulseAnimations.forEach(animation => animation.cancel())
  pulseAnimations.clear()
  pulseElements.clear()
  pulses.value = []
}

function syncPlayback() {
  pulseAnimations.forEach((animation) => {
    if (props.paused) animation.pause()
    else animation.play()
  })
}

async function pulse(x = 50, y = 50) {
  if (props.disabled) return

  const origin = {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
  }
  pointer.value = origin
  pulseCount.value += 1
  emit('pulse', { ...origin, count: pulseCount.value })

  if (reducedMotion.value || safeDuration.value === 0) return

  const nextPulse: Pulse = { ...origin, id: ++pulseSequence }
  pulses.value.push(nextPulse)
  await nextTick()

  const element = pulseElements.get(nextPulse.id)
  if (!element || !pulses.value.some(item => item.id === nextPulse.id)) {
    removePulse(nextPulse.id)
    return
  }

  const animation = element.animate([
    { opacity: 0.82 * safeIntensity.value, r: '0.75', strokeWidth: '1.4' },
    { opacity: 0.48 * safeIntensity.value, offset: 0.24, r: '8', strokeWidth: '0.8' },
    { opacity: 0, r: '68', strokeWidth: '0.16' },
  ], {
    duration: safeDuration.value,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'both',
  })

  pulseAnimations.set(nextPulse.id, animation)
  if (props.paused) animation.pause()

  animation.finished
    .then(() => removePulse(nextPulse.id))
    .catch(() => undefined)
}

function reset() {
  clearPulseVisuals()
  pulseCount.value = 0
  emit('reset')
}

function handlePointerMove(event: PointerEvent) {
  if (props.disabled || props.paused) return
  pointerActive.value = true
  pointer.value = clientToViewBox(event.clientX, event.clientY)
}

function handlePointerLeave() {
  pointerActive.value = false
  if (focused.value) pointer.value = { x: 50, y: 50 }
}

function handleFocus() {
  focused.value = true
  pointer.value = { x: 50, y: 50 }
}

function handleBlur() {
  focused.value = false
}

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  surface.value?.focus({ preventScroll: true })
  const origin = clientToViewBox(event.clientX, event.clientY)
  pointer.value = origin
  pulse(origin.x, origin.y)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  pointer.value = { x: 50, y: 50 }
  pulse()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearPulseVisuals()
}

watch(() => props.paused, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)

  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry || entry.contentRect.height <= 0) return
    viewBoxWidth.value = clamp(entry.contentRect.width / entry.contentRect.height * 100, 40, 400)
  })
  if (surface.value) resizeObserver.observe(surface.value)
})

onBeforeUnmount(() => {
  clearPulseVisuals()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ pulse, reset })
</script>

<template>
  <div
    ref="surface"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :data-paused="paused ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    class="interactive-dot-field group relative isolate min-h-64 overflow-hidden rounded-3xl bg-[#070a12] text-white outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--dot-color)]/70 motion-reduce:transition-none"
    :class="disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'"
    :style="{ '--dot-color': color }"
    @pointerenter="handlePointerMove"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <svg
      ref="svg"
      class="pointer-events-none absolute inset-0 size-full"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <radialGradient :id="gradientId">
          <stop offset="0" :stop-color="color" :stop-opacity="0.16 * safeIntensity" />
          <stop offset="0.55" :stop-color="color" :stop-opacity="0.05 * safeIntensity" />
          <stop offset="1" :stop-color="color" stop-opacity="0" />
        </radialGradient>
      </defs>

      <circle
        v-if="interactionActive"
        :cx="pointer.x / 100 * viewBoxWidth"
        :cy="pointer.y"
        r="34"
        :fill="`url(#${gradientId})`"
        class="transition-[cx,cy] duration-100 motion-reduce:transition-none"
      />

      <circle
        v-for="dot in renderedDots"
        :key="dot.id"
        :cx="dot.x / 100 * viewBoxWidth"
        :cy="dot.y"
        :r="dot.radius"
        :fill="color"
        :fill-opacity="dot.opacity"
        class="[transition:opacity_180ms_ease,r_180ms_ease] motion-reduce:transition-none"
      />

      <circle
        v-for="item in pulses"
        :key="item.id"
        :ref="element => setPulseElement(item.id, element)"
        :cx="item.x / 100 * viewBoxWidth"
        :cy="item.y"
        r="0.75"
        fill="none"
        :stroke="color"
        stroke-width="1.4"
        class="drop-shadow-[0_0_4px_var(--dot-color)]"
      />
    </svg>

    <div class="pointer-events-none relative z-10 size-full">
      <slot :pulse-count="pulseCount" :paused="paused" />
    </div>
  </div>
</template>
