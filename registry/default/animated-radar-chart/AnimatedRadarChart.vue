<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedRadarChartAxis {
  id: string
  label: string
  max?: number
}

export interface AnimatedRadarChartSeries {
  id: string
  label: string
  values: number[]
  color?: string
  disabled?: boolean
}

export interface AnimatedRadarChartProps {
  axes?: AnimatedRadarChartAxis[]
  series?: AnimatedRadarChartSeries[]
  modelValue?: string | null
  size?: number
  levels?: number
  duration?: number
  showLabels?: boolean
  showLegend?: boolean
  interactive?: boolean
  paused?: boolean
  ariaLabel?: string
}

export interface AnimatedRadarChartEvents {
  'update:modelValue': [id: string | null]
  'select': [series: AnimatedRadarChartSeries | null]
}

export interface AnimatedRadarChartExpose {
  replay: () => Promise<void>
  resetSelection: () => void
}

interface SafeAxis extends AnimatedRadarChartAxis {
  max: number
}

interface SafeSeries extends AnimatedRadarChartSeries {
  color: string
  values: number[]
}

const DEFAULT_COLORS = ['#6d5dfc', '#13a47b', '#e06a3b', '#d9468d', '#1687c9']

const props = withDefaults(defineProps<AnimatedRadarChartProps>(), {
  axes: () => [],
  series: () => [],
  modelValue: null,
  size: 480,
  levels: 5,
  duration: 850,
  showLabels: true,
  showLegend: true,
  interactive: true,
  paused: false,
  ariaLabel: 'Radar chart',
})

const emit = defineEmits<AnimatedRadarChartEvents>()
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const captionId = `radar-caption-${uid}`
const titleId = `radar-title-${uid}`
const descriptionId = `radar-description-${uid}`
const activeId = ref<string | null>(null)
const reducedMotion = ref(false)
const seriesElements = new Map<string, SVGPolygonElement>()
const legendElements = new Map<string, HTMLButtonElement>()
const animations = new Set<Animation>()

let mounted = false
let animationGeneration = 0
let motionQuery: MediaQueryList | undefined

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

const safeSize = computed(() => Math.min(960, Math.max(240, finiteOr(props.size, 480))))
const safeLevels = computed(() => Math.min(10, Math.max(1, Math.floor(finiteOr(props.levels, 5)))))
const safeDuration = computed(() => Math.min(5000, Math.max(0, finiteOr(props.duration, 850))))
const center = computed(() => safeSize.value / 2)
const radius = computed(() => safeSize.value * (props.showLabels ? 0.31 : 0.42))

const safeAxes = computed<SafeAxis[]>(() => props.axes.map(axis => ({
  ...axis,
  max: Number.isFinite(axis.max) && (axis.max ?? 0) > 0 ? axis.max as number : 100,
})))

const safeSeries = computed<SafeSeries[]>(() => props.series.map((item, seriesIndex) => ({
  ...item,
  color: item.color?.trim() || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length]!,
  values: safeAxes.value.map((axis, axisIndex) => {
    const value = finiteOr(item.values?.[axisIndex] ?? 0, 0)
    return Math.min(axis.max, Math.max(0, value))
  }),
})))

const emphasisId = computed(() => {
  const candidate = activeId.value ?? props.modelValue
  return safeSeries.value.some(item => item.id === candidate && !item.disabled) ? candidate : null
})

const chartDescription = computed(() => {
  if (!safeAxes.value.length || !safeSeries.value.length) return 'No radar chart data is available.'
  return `${safeSeries.value.length} series compared across ${safeAxes.value.length} axes. A data table follows the chart.`
})

function pointAt(axisIndex: number, distance: number) {
  const angle = -Math.PI / 2 + axisIndex * Math.PI * 2 / Math.max(safeAxes.value.length, 1)
  return {
    x: center.value + Math.cos(angle) * distance,
    y: center.value + Math.sin(angle) * distance,
  }
}

function pointsAt(distance: number) {
  return safeAxes.value.map((_, index) => {
    const point = pointAt(index, distance)
    return `${point.x},${point.y}`
  }).join(' ')
}

function seriesPoints(item: SafeSeries) {
  return safeAxes.value.map((axis, index) => {
    const point = pointAt(index, radius.value * (item.values[index] ?? 0) / axis.max)
    return `${point.x},${point.y}`
  }).join(' ')
}

function labelPoint(index: number) {
  const point = pointAt(index, radius.value + Math.max(16, safeSize.value * 0.045))
  const delta = point.x - center.value
  const edgePadding = 8
  return {
    x: Math.min(safeSize.value - edgePadding, Math.max(edgePadding, point.x)),
    y: Math.min(safeSize.value - 12, Math.max(12, point.y)),
    anchor: Math.abs(delta) < 8 ? 'middle' : delta > 0 ? 'start' : 'end',
  }
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}

function seriesSummary(item: SafeSeries) {
  const details = safeAxes.value.map((axis, index) => `${axis.label}: ${formatValue(item.values[index] ?? 0)} of ${formatValue(axis.max)}`)
  return `${item.label}. ${details.join(', ')}.`
}

function seriesStyle(item: SafeSeries): CSSProperties {
  return {
    fill: item.color,
    stroke: item.color,
    transformBox: 'view-box',
    transformOrigin: 'center',
  }
}

function seriesOpacity(item: SafeSeries) {
  if (item.disabled) return 'opacity-25'
  if (!emphasisId.value) return 'opacity-80 hover:opacity-100 focus:opacity-100'
  return emphasisId.value === item.id ? 'opacity-100' : 'opacity-20'
}

function setSeriesElement(element: unknown, id: string) {
  if (element instanceof SVGPolygonElement) seriesElements.set(id, element)
  else seriesElements.delete(id)
}

function setLegendElement(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) legendElements.set(id, element)
  else legendElements.delete(id)
}

function clearAnimations() {
  animationGeneration += 1
  animations.forEach(animation => animation.cancel())
  animations.clear()
}

function trackAnimation(animation: Animation) {
  animations.add(animation)
  animation.finished.finally(() => animations.delete(animation)).catch(() => undefined)
}

async function replay(): Promise<void> {
  clearAnimations()
  const generation = animationGeneration
  await nextTick()
  if (generation !== animationGeneration || props.paused || reducedMotion.value || safeDuration.value === 0) return

  safeSeries.value.forEach((item, index) => {
    const element = seriesElements.get(item.id)
    if (!element) return
    const delay = Math.min(index * 70, safeDuration.value * 0.25)
    trackAnimation(element.animate([
      { transform: 'scale(0)' },
      { transform: 'scale(1)' },
    ], {
      duration: safeDuration.value,
      delay,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    }))
  })
}

function selectSeries(item: SafeSeries) {
  if (!props.interactive || item.disabled) return
  const nextId = props.modelValue === item.id ? null : item.id
  emit('update:modelValue', nextId)
  emit('select', nextId === null ? null : props.series.find(series => series.id === item.id) ?? item)
}

function resetSelection() {
  activeId.value = null
  emit('update:modelValue', null)
  emit('select', null)
}

function handleSeriesKeydown(event: KeyboardEvent, item: SafeSeries) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  selectSeries(item)
}

function moveLegendFocus(event: KeyboardEvent, id: string) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  const enabled = safeSeries.value.filter(item => !item.disabled)
  const current = enabled.findIndex(item => item.id === id)
  if (current < 0 || !enabled.length) return

  event.preventDefault()
  let next = current
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = enabled.length - 1
  else next = (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
  legendElements.get(enabled[next]!.id)?.focus()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  clearAnimations()
  if (!event.matches && !props.paused) void replay()
}

watch(() => [props.axes, props.series], () => {
  if (mounted) void replay()
}, { deep: true })
watch(() => props.duration, () => {
  if (mounted) void replay()
})
watch(() => props.paused, (paused) => {
  if (paused) clearAnimations()
  else if (mounted) void replay()
})

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  void replay()
})

onBeforeUnmount(() => {
  mounted = false
  clearAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose<AnimatedRadarChartExpose>({ replay, resetSelection })
</script>

<template>
  <figure
    class="animated-radar-chart m-0 w-full min-w-0 text-foreground"
    :style="{ maxWidth: `${safeSize}px` }"
    role="group"
    :aria-labelledby="captionId"
    :data-paused="paused || reducedMotion ? '' : undefined"
    data-testid="animated-radar-chart"
  >
    <figcaption :id="captionId" class="sr-only">{{ ariaLabel }}</figcaption>

    <div class="relative aspect-square w-full">
      <svg
        class="block size-full overflow-visible"
        :viewBox="`0 0 ${safeSize} ${safeSize}`"
        role="img"
        :aria-labelledby="`${titleId} ${descriptionId}`"
        data-testid="radar-chart-svg"
      >
        <title :id="titleId">{{ ariaLabel }}</title>
        <desc :id="descriptionId">{{ chartDescription }}</desc>

        <g v-if="safeAxes.length" class="text-border" data-testid="radar-grid" aria-hidden="true">
          <polygon
            v-for="level in safeLevels"
            :key="level"
            :points="pointsAt(radius * level / safeLevels)"
            fill="none"
            stroke="currentColor"
            :stroke-opacity="level === safeLevels ? 0.95 : 0.65"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
          <line
            v-for="(_, index) in safeAxes"
            :key="index"
            :x1="center"
            :y1="center"
            :x2="pointAt(index, radius).x"
            :y2="pointAt(index, radius).y"
            stroke="currentColor"
            stroke-opacity="0.75"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </g>

        <g v-for="item in safeSeries" :key="item.id" role="group" :aria-label="seriesSummary(item)">
          <polygon
            :ref="element => setSeriesElement(element, item.id)"
            :points="seriesPoints(item)"
            :style="seriesStyle(item)"
            :class="seriesOpacity(item)"
            :tabindex="interactive && !item.disabled ? 0 : undefined"
            :role="interactive && !item.disabled ? 'button' : undefined"
            :aria-label="interactive && !item.disabled ? `Select ${item.label}` : undefined"
            :aria-pressed="interactive && !item.disabled ? modelValue === item.id : undefined"
            :aria-disabled="item.disabled || undefined"
            :data-testid="`radar-series-${item.id}`"
            fill-opacity="0.16"
            stroke-width="2.5"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
            class="animated-radar-chart__series outline-none transition-[opacity,filter] duration-200 focus-visible:[filter:drop-shadow(0_0_5px_currentColor)] motion-reduce:transition-none"
            @mouseenter="interactive && !item.disabled && (activeId = item.id)"
            @mouseleave="activeId === item.id && (activeId = null)"
            @focus="activeId = item.id"
            @blur="activeId === item.id && (activeId = null)"
            @click="selectSeries(item)"
            @keydown="handleSeriesKeydown($event, item)"
          >
            <title>{{ seriesSummary(item) }}</title>
          </polygon>
          <circle
            v-for="(axis, index) in safeAxes"
            :key="axis.id"
            :cx="pointAt(index, radius * (item.values[index] ?? 0) / axis.max).x"
            :cy="pointAt(index, radius * (item.values[index] ?? 0) / axis.max).y"
            r="3.5"
            :fill="item.color"
            class="pointer-events-none transition-opacity duration-200 motion-reduce:transition-none"
            :class="seriesOpacity(item)"
            aria-hidden="true"
          />
        </g>

        <g v-if="showLabels" class="pointer-events-none fill-current text-muted-foreground" aria-hidden="true">
          <text
            v-for="(axis, index) in safeAxes"
            :key="axis.id"
            :x="labelPoint(index).x"
            :y="labelPoint(index).y"
            :text-anchor="labelPoint(index).anchor"
            dominant-baseline="middle"
            class="text-[11px] font-semibold"
          >{{ axis.label }}</text>
        </g>

        <text
          v-if="!safeAxes.length || !safeSeries.length"
          :x="center"
          :y="center"
          text-anchor="middle"
          dominant-baseline="middle"
          class="fill-current text-xs font-medium text-muted-foreground"
          data-testid="radar-empty"
        >No data to display</text>
      </svg>
    </div>

    <div v-if="showLegend && safeSeries.length" class="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2" data-testid="radar-legend" aria-label="Chart series">
      <button
        v-for="item in safeSeries"
        v-if="interactive"
        :key="item.id"
        :ref="element => setLegendElement(element, item.id)"
        type="button"
        :disabled="item.disabled"
        :aria-pressed="modelValue === item.id"
        :data-testid="`radar-legend-${item.id}`"
        class="group inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        :class="modelValue === item.id ? 'bg-muted text-foreground' : ''"
        @mouseenter="!item.disabled && (activeId = item.id)"
        @mouseleave="activeId === item.id && (activeId = null)"
        @focus="activeId = item.id"
        @blur="activeId === item.id && (activeId = null)"
        @keydown="moveLegendFocus($event, item.id)"
        @click="selectSeries(item)"
      >
        <span class="size-2.5 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background group-aria-pressed:ring-current" :style="{ backgroundColor: item.color, color: item.color }" />
        {{ item.label }}
      </button>
      <span v-for="item in safeSeries" v-else :key="item.id" class="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
        <span class="size-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </div>

    <table v-if="safeAxes.length && safeSeries.length" class="sr-only" data-testid="radar-summary">
      <caption>{{ ariaLabel }} data</caption>
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th v-for="item in safeSeries" :key="item.id" scope="col">{{ item.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(axis, axisIndex) in safeAxes" :key="axis.id">
          <th scope="row">{{ axis.label }}</th>
          <td v-for="item in safeSeries" :key="item.id">{{ formatValue(item.values[axisIndex] ?? 0) }} of {{ formatValue(axis.max) }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animated-radar-chart__series {
    transition: none !important;
  }
}
</style>
