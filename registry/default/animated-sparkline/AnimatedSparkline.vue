<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = withDefaults(defineProps<{
  values: number[]
  labels?: string[]
  color?: string
  duration?: number
  showArea?: boolean
  showPoints?: boolean
  paused?: boolean
  label?: string
  formatValue?: (value: number) => string
}>(), {
  labels: () => [],
  color: '#7c3aed',
  duration: 900,
  showArea: true,
  showPoints: true,
  paused: false,
  label: 'Trend',
  formatValue: (value: number) => String(value),
})

const emit = defineEmits<{ pointChange: [index: number, value: number] }>()
const gradientId = `sparkline-${useId()}`
const line = ref<SVGPathElement | null>(null)
const area = ref<SVGPathElement | null>(null)
const circles = ref<SVGCircleElement[]>([])
const activeIndex = ref(props.values.length - 1)
const reducedMotion = ref(false)

const points = computed(() => {
  const values = props.values.length ? props.values : [0]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  return values.map((value, index) => ({
    value,
    x: 12 + index / Math.max(values.length - 1, 1) * 376,
    y: 122 - (value - min) / range * 104,
  }))
})
const linePath = computed(() => points.value.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '))
const areaPath = computed(() => `${linePath.value} L ${points.value.at(-1)?.x ?? 388} 134 L ${points.value[0]?.x ?? 12} 134 Z`)

let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function setCircle(element: unknown, index: number) {
  if (element instanceof SVGCircleElement) circles.value[index] = element
}

function clearAnimations() {
  animations.forEach(animation => animation.cancel())
  animations = []
}

function syncPlayback() {
  animations.forEach(animation => props.paused ? animation.pause() : animation.play())
}

async function replay() {
  clearAnimations()
  await nextTick()
  if (reducedMotion.value || !line.value) return
  const length = line.value.getTotalLength()
  animations.push(line.value.animate([
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDasharray: length, strokeDashoffset: 0 },
  ], { duration: Math.max(props.duration, 240), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }))
  if (area.value) animations.push(area.value.animate([{ opacity: 0 }, { opacity: 1 }], { duration: props.duration * 0.65, delay: props.duration * 0.3, fill: 'both' }))
  if (props.showPoints) circles.value.filter(Boolean).forEach((circle, index) => {
    animations.push(circle.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 280, delay: props.duration * 0.45 + index * 45, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }))
  })
  syncPlayback()
}

function selectPoint(index: number) {
  activeIndex.value = index
  emit('pointChange', index, props.values[index] ?? 0)
}

function movePoint(event: KeyboardEvent, index: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  let next = event.key === 'Home' ? 0 : event.key === 'End' ? points.value.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1)
  next = Math.min(Math.max(next, 0), points.value.length - 1)
  circles.value[next]?.focus()
  selectPoint(next)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  replay()
}

watch(() => props.values, () => { activeIndex.value = props.values.length - 1; replay() }, { deep: true })
watch(() => [props.duration, props.showArea, props.showPoints], replay)
watch(() => props.paused, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  replay()
})
onBeforeUnmount(() => { clearAnimations(); motionQuery?.removeEventListener('change', handleMotionChange) })
defineExpose({ replay })
</script>

<template>
  <figure class="animated-sparkline w-full" :aria-label="label">
    <div class="mb-3 flex items-end justify-between gap-4"><figcaption class="text-sm font-medium text-foreground">{{ label }}</figcaption><strong class="text-xl tabular-nums text-foreground">{{ formatValue(values[activeIndex] ?? 0) }}</strong></div>
    <svg viewBox="0 0 400 140" class="block h-auto w-full overflow-visible" role="img" :aria-label="`${label}: ${values.map(formatValue).join(', ')}`">
      <defs><linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1"><stop offset="0" :stop-color="color" stop-opacity="0.28"/><stop offset="1" :stop-color="color" stop-opacity="0"/></linearGradient></defs>
      <path v-if="showArea" ref="area" :d="areaPath" :fill="`url(#${gradientId})`" class="animated-sparkline-area" />
      <path ref="line" :d="linePath" fill="none" :stroke="color" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" class="animated-sparkline-line" />
      <circle v-for="(point, index) in points" v-show="showPoints" :key="index" :ref="element => setCircle(element, index)" :cx="point.x" :cy="point.y" :r="activeIndex === index ? 6 : 4" :fill="activeIndex === index ? color : 'white'" :stroke="color" stroke-width="3" class="animated-sparkline-point cursor-pointer outline-none [transform-box:fill-box] [transform-origin:center] focus-visible:stroke-[5]" tabindex="0" role="button" :aria-label="`${labels[index] ?? `Point ${index + 1}`}: ${formatValue(point.value)}`" @mouseenter="selectPoint(index)" @focus="selectPoint(index)" @keydown="movePoint($event, index)" />
    </svg>
  </figure>
</template>
