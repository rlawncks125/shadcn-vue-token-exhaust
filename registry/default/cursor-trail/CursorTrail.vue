<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Point {
  x: number
  y: number
}

interface TrailParticle extends Point {
  id: number
}

interface TrailDetail extends Point {
  count: number
}

const props = withDefaults(defineProps<{
  color?: string
  count?: number
  size?: number
  duration?: number
  distance?: number
  shape?: 'circle' | 'square'
  paused?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  color: 'var(--registry-accent, #d9ff57)',
  count: 24,
  size: 10,
  duration: 700,
  distance: 12,
  shape: 'circle',
  paused: false,
  disabled: false,
  ariaLabel: 'Cursor trail area',
})

const emit = defineEmits<{
  trail: [detail: TrailDetail]
  clear: []
}>()

const container = ref<HTMLElement | null>(null)
const particles = ref<TrailParticle[]>([])
const reducedMotion = ref(false)

const safeCount = computed(() => Math.round(clamp(props.count, 0, 100, 24)))
const safeSize = computed(() => clamp(props.size, 2, 64, 10))
const safeDuration = computed(() => Math.round(clamp(props.duration, 100, 10000, 700)))
const safeDistance = computed(() => clamp(props.distance, 0, 240, 12))
const variables = computed(() => ({
  '--cursor-trail-color': props.color,
  '--cursor-trail-size': `${safeSize.value}px`,
  '--cursor-trail-duration': `${safeDuration.value}ms`,
  '--cursor-trail-radius': props.shape === 'square' ? '2px' : '999px',
}))

const removalTimers = new Map<number, ReturnType<typeof setTimeout>>()
const removalDeadlines = new Map<number, number>()
const remainingDurations = new Map<number, number>()

let motionQuery: MediaQueryList | undefined
let frame: number | undefined
let pendingPoint: { clientX: number; clientY: number } | undefined
let lastPoint: Point | undefined
let sequence = 0
let emittedCount = 0

function clamp(value: number, min: number, max: number, fallback: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : fallback, min), max)
}

function cancelPendingFrame() {
  if (frame !== undefined) window.cancelAnimationFrame(frame)
  frame = undefined
  pendingPoint = undefined
}

function cancelRemoval(id: number) {
  const timer = removalTimers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  removalTimers.delete(id)
  removalDeadlines.delete(id)
  remainingDurations.delete(id)
}

function removeParticle(id: number) {
  cancelRemoval(id)
  particles.value = particles.value.filter(particle => particle.id !== id)
}

function scheduleRemoval(id: number, delay = safeDuration.value) {
  cancelRemoval(id)
  const timeout = Math.max(0, delay)
  remainingDurations.set(id, timeout)

  if (props.paused) return

  removalDeadlines.set(id, performance.now() + timeout)
  removalTimers.set(id, setTimeout(() => removeParticle(id), timeout))
}

function clearVisuals() {
  cancelPendingFrame()
  removalTimers.forEach(timer => clearTimeout(timer))
  removalTimers.clear()
  removalDeadlines.clear()
  remainingDurations.clear()
  particles.value = []
  lastPoint = undefined
}

function clear() {
  clearVisuals()
  emittedCount = 0
  emit('clear')
}

function trimParticles() {
  const overflow = particles.value.length - safeCount.value
  if (overflow <= 0) return

  const removed = particles.value.slice(0, overflow)
  removed.forEach(particle => cancelRemoval(particle.id))
  particles.value = particles.value.slice(overflow)
}

function addParticle(point: Point) {
  if (safeCount.value === 0) return

  const particle: TrailParticle = { ...point, id: ++sequence }
  particles.value.push(particle)
  trimParticles()
  scheduleRemoval(particle.id)
  emittedCount += 1
  emit('trail', { ...point, count: emittedCount })
}

function flushPointerMove() {
  frame = undefined
  const point = pendingPoint
  pendingPoint = undefined

  if (!point || !container.value || props.paused || props.disabled || reducedMotion.value) return

  const bounds = container.value.getBoundingClientRect()
  if (bounds.width <= 0 || bounds.height <= 0) return

  const localPoint = {
    x: clamp(point.clientX - bounds.left, 0, bounds.width, 0),
    y: clamp(point.clientY - bounds.top, 0, bounds.height, 0),
  }

  if (lastPoint && Math.hypot(localPoint.x - lastPoint.x, localPoint.y - lastPoint.y) < safeDistance.value) return

  lastPoint = localPoint
  addParticle(localPoint)
}

function handlePointerMove(event: PointerEvent) {
  if (props.paused || props.disabled || reducedMotion.value) return

  pendingPoint = { clientX: event.clientX, clientY: event.clientY }
  if (frame === undefined) frame = window.requestAnimationFrame(flushPointerMove)
}

function handlePointerLeave() {
  cancelPendingFrame()
  lastPoint = undefined
}

function pauseRemovals() {
  const now = performance.now()
  particles.value.forEach((particle) => {
    const deadline = removalDeadlines.get(particle.id)
    if (deadline !== undefined) remainingDurations.set(particle.id, Math.max(0, deadline - now))
    const timer = removalTimers.get(particle.id)
    if (timer !== undefined) clearTimeout(timer)
  })
  removalTimers.clear()
  removalDeadlines.clear()
}

function resumeRemovals() {
  particles.value.forEach((particle) => {
    scheduleRemoval(particle.id, remainingDurations.get(particle.id) ?? safeDuration.value)
  })
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearVisuals()
}

watch(() => props.paused, (paused) => {
  cancelPendingFrame()
  lastPoint = undefined
  if (paused) pauseRemovals()
  else resumeRemovals()
})

watch(() => props.disabled, (disabled) => {
  if (disabled) clearVisuals()
})

watch(safeCount, trimParticles)
watch(safeDuration, clearVisuals)
watch(safeDistance, () => {
  lastPoint = undefined
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  clearVisuals()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ clear })
</script>

<template>
  <div
    ref="container"
    class="cursor-trail relative isolate"
    role="group"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :data-paused="paused ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :style="variables"
    data-testid="cursor-trail"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    @pointercancel="handlePointerLeave"
  >
    <div class="relative z-0">
      <slot />
    </div>

    <div
      class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
      data-testid="cursor-trail-overlay"
    >
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="cursor-trail__particle absolute left-0 top-0 block"
        :style="{ left: `${particle.x}px`, top: `${particle.y}px` }"
        data-testid="cursor-trail-particle"
      />
    </div>
  </div>
</template>

<style scoped>
.cursor-trail__particle {
  width: var(--cursor-trail-size);
  height: var(--cursor-trail-size);
  border-radius: var(--cursor-trail-radius);
  background: var(--cursor-trail-color);
  box-shadow: 0 0 calc(var(--cursor-trail-size) * 1.4) var(--cursor-trail-color);
  animation: cursor-trail-fade var(--cursor-trail-duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-play-state: running;
}

.cursor-trail[data-paused] .cursor-trail__particle {
  animation-play-state: paused;
}

@keyframes cursor-trail-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }
  14% {
    opacity: 0.95;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-trail__particle {
    display: none;
    animation: none;
  }
}
</style>
