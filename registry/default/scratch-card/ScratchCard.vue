<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  coverColor?: string
  coverText?: string
  brushSize?: number
  revealThreshold?: number
  disabled?: boolean
  resettable?: boolean
  duration?: number
  ariaLabel?: string
}>(), {
  modelValue: false,
  coverColor: '#b7f34a',
  coverText: 'Scratch to reveal',
  brushSize: 36,
  revealThreshold: 0.5,
  disabled: false,
  resettable: true,
  duration: 420,
  ariaLabel: 'Reveal scratch card',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  progress: [progress: number]
  start: []
  complete: []
  reset: []
  reveal: [progress: number]
}>()

interface Point {
  x: number
  y: number
}

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const reducedMotion = ref(false)

const safeBrushSize = computed(() => clamp(props.brushSize, 4, 240))
const safeThreshold = computed(() => clamp(props.revealThreshold, 0, 1))
const safeDuration = computed(() => clamp(props.duration, 0, 10000))
const overlayStyle = computed<CSSProperties>(() => ({
  opacity: props.modelValue ? '0' : '1',
  pointerEvents: props.modelValue ? 'none' : undefined,
  transitionDuration: reducedMotion.value ? '0ms' : `${safeDuration.value}ms`,
}))

let context: CanvasRenderingContext2D | null = null
let resizeObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let initializeRaf = 0
let sampleRaf = 0
let completionTimer: ReturnType<typeof setTimeout> | undefined
let initializeShouldEmit = false
let baselineAlpha = 0
let lastProgress = 0
let lastSampleTime = 0
let activePointerId: number | null = null
let previousPoint: Point | null = null
let completionPending = false
let mounted = false

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max)
}

function textColor(background: string) {
  const shortHex = /^#([\da-f])([\da-f])([\da-f])$/i.exec(background)
  const longHex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(background)
  const rgb = /^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/i.exec(background)
  const channels = shortHex
    ? shortHex.slice(1).map(value => Number.parseInt(`${value}${value}`, 16))
    : longHex
      ? longHex.slice(1).map(value => Number.parseInt(value, 16))
      : rgb
        ? rgb.slice(1).map(Number)
        : [255, 255, 255]
  const luminance = channels[0]! * 0.299 + channels[1]! * 0.587 + channels[2]! * 0.114
  return luminance > 155 ? 'rgba(14, 24, 12, 0.72)' : 'rgba(255, 255, 255, 0.9)'
}

function sampledAlpha() {
  const element = canvas.value
  if (!element || !context || element.width === 0 || element.height === 0) return 0

  const pixels = context.getImageData(0, 0, element.width, element.height).data
  const step = Math.max(1, Math.floor(Math.sqrt(element.width * element.height / 12000)))
  let alpha = 0
  for (let y = 0; y < element.height; y += step) {
    for (let x = 0; x < element.width; x += step) alpha += pixels[(y * element.width + x) * 4 + 3]!
  }
  return alpha
}

function initializeCanvas(emitProgress = false) {
  const element = canvas.value
  const container = root.value
  if (!mounted || !element || !container) return

  const rect = container.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const ratio = clamp(window.devicePixelRatio || 1, 1, 3)
  element.width = Math.max(1, Math.round(rect.width * ratio))
  element.height = Math.max(1, Math.round(rect.height * ratio))
  context = element.getContext('2d', { willReadFrequently: true })
  if (!context) return

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.globalCompositeOperation = 'source-over'
  context.clearRect(0, 0, rect.width, rect.height)
  context.fillStyle = props.coverColor
  context.fillRect(0, 0, rect.width, rect.height)

  const fontSize = clamp(Math.min(rect.width, rect.height) * 0.055, 14, 22)
  context.fillStyle = textColor(props.coverColor)
  context.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(props.coverText, rect.width / 2, rect.height / 2, rect.width * 0.76)

  baselineAlpha = sampledAlpha()
  const pointerId = activePointerId
  activePointerId = null
  previousPoint = null
  if (pointerId !== null && element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  if (emitProgress && lastProgress !== 0) emit('progress', 0)
  lastProgress = 0
}

function scheduleInitialize(emitProgress = false) {
  if (!mounted) return
  initializeShouldEmit ||= emitProgress
  if (initializeRaf) return
  initializeRaf = window.requestAnimationFrame(() => {
    initializeRaf = 0
    const shouldEmit = initializeShouldEmit
    initializeShouldEmit = false
    initializeCanvas(shouldEmit)
  })
}

function pointFromEvent(event: PointerEvent): Point {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: clamp(event.clientX - rect.left, 0, rect.width),
    y: clamp(event.clientY - rect.top, 0, rect.height),
  }
}

function erase(from: Point, to: Point) {
  if (!context) return
  context.save()
  context.globalCompositeOperation = 'destination-out'
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = safeBrushSize.value
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
  context.restore()
}

function requestReveal(progress = 1) {
  if (props.disabled || props.modelValue) return
  const normalized = clamp(progress, 0, 1)
  const pointerId = activePointerId
  activePointerId = null
  previousPoint = null
  if (pointerId !== null && canvas.value?.hasPointerCapture(pointerId)) canvas.value.releasePointerCapture(pointerId)
  if (normalized !== lastProgress) {
    lastProgress = normalized
    emit('progress', normalized)
  }
  emit('update:modelValue', true)
  emit('reveal', normalized)
}

function sampleProgress() {
  if (!context || props.modelValue || baselineAlpha <= 0) return
  const progress = clamp(1 - sampledAlpha() / baselineAlpha, 0, 1)
  lastSampleTime = performance.now()
  if (Math.abs(progress - lastProgress) >= 0.001) {
    lastProgress = progress
    emit('progress', progress)
  }
  if (progress >= safeThreshold.value) requestReveal(progress)
}

function scheduleSample() {
  if (sampleRaf || performance.now() - lastSampleTime < 100) return
  sampleRaf = window.requestAnimationFrame(() => {
    sampleRaf = 0
    sampleProgress()
  })
}

function handlePointerDown(event: PointerEvent) {
  if (props.disabled || props.modelValue || activePointerId !== null) return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.preventDefault()
  activePointerId = event.pointerId
  canvas.value?.setPointerCapture(event.pointerId)
  previousPoint = pointFromEvent(event)
  erase(previousPoint, { x: previousPoint.x + 0.01, y: previousPoint.y })
  emit('start')
  scheduleSample()
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId || !previousPoint || props.disabled || props.modelValue) return
  event.preventDefault()
  const point = pointFromEvent(event)
  erase(previousPoint, point)
  previousPoint = point
  scheduleSample()
}

function finishPointer(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return
  activePointerId = null
  previousPoint = null
  if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
  if (sampleRaf) window.cancelAnimationFrame(sampleRaf)
  sampleRaf = 0
  sampleProgress()
}

function handleLostPointerCapture(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return
  activePointerId = null
  previousPoint = null
  if (sampleRaf) window.cancelAnimationFrame(sampleRaf)
  sampleRaf = 0
  sampleProgress()
}

function finishComplete() {
  if (!completionPending || !props.modelValue) return
  completionPending = false
  completionTimer = undefined
  emit('complete')
}

function scheduleComplete() {
  if (completionTimer) clearTimeout(completionTimer)
  completionPending = true
  if (reducedMotion.value || safeDuration.value === 0) {
    nextTick(finishComplete)
    return
  }
  completionTimer = setTimeout(finishComplete, safeDuration.value)
}

function reveal() {
  requestReveal(1)
}

function reset() {
  if (props.disabled) return
  if (completionTimer) clearTimeout(completionTimer)
  completionTimer = undefined
  completionPending = false
  lastProgress = 0
  emit('update:modelValue', false)
  emit('progress', 0)
  emit('reset')
  if (!props.modelValue) scheduleInitialize()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches && completionPending) {
    if (completionTimer) clearTimeout(completionTimer)
    completionTimer = undefined
    finishComplete()
  }
}

watch(() => props.modelValue, (revealed, wasRevealed) => {
  if (revealed && !wasRevealed) scheduleComplete()
  if (!revealed && wasRevealed) {
    if (completionTimer) clearTimeout(completionTimer)
    completionTimer = undefined
    completionPending = false
    nextTick(() => scheduleInitialize(true))
  }
})
watch(() => [props.coverColor, props.coverText], () => nextTick(() => scheduleInitialize(true)))

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  resizeObserver = new ResizeObserver(() => scheduleInitialize(true))
  if (root.value) resizeObserver.observe(root.value)
  scheduleInitialize()
})

onBeforeUnmount(() => {
  mounted = false
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionChange)
  if (initializeRaf) window.cancelAnimationFrame(initializeRaf)
  if (sampleRaf) window.cancelAnimationFrame(sampleRaf)
  if (completionTimer) clearTimeout(completionTimer)
})

defineExpose({ reveal, reset })
</script>

<template>
  <div
    ref="root"
    class="scratch-card group relative isolate overflow-hidden rounded-3xl"
    :data-revealed="modelValue ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <div :aria-hidden="!modelValue" :inert="!modelValue || undefined">
      <slot />
    </div>

    <div
      class="absolute inset-0 z-10 overflow-hidden rounded-[inherit] transition-opacity ease-out motion-reduce:transition-none"
      :style="overlayStyle"
      :aria-hidden="modelValue"
    >
      <canvas
        ref="canvas"
        aria-hidden="true"
        class="absolute inset-0 size-full touch-none select-none"
        :class="disabled ? 'cursor-not-allowed' : 'cursor-crosshair'"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="finishPointer"
        @pointercancel="finishPointer"
        @lostpointercapture="handleLostPointerCapture"
      />
      <button
        v-if="!modelValue"
        type="button"
        class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-black/15 bg-white/90 px-4 py-2 text-xs font-semibold text-black shadow-sm outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none"
        :aria-label="ariaLabel"
        :disabled="disabled"
        @click="reveal"
      >
        Reveal without scratching
      </button>
    </div>

    <button
      v-if="modelValue && resettable"
      type="button"
      class="absolute top-4 right-4 z-20 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold text-black shadow-sm outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none"
      :disabled="disabled"
      aria-label="Reset scratch card"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>
