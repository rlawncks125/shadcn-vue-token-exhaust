<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedDonutChartSegment {
  id: string
  label: string
  value: number
  color?: string
  disabled?: boolean
}

export interface AnimatedDonutChartProps {
  segments?: AnimatedDonutChartSegment[]
  modelValue?: string | null
  size?: number
  strokeWidth?: number
  gap?: number
  duration?: number
  showLegend?: boolean
  interactive?: boolean
  paused?: boolean
  formatValue?: (value: number, total: number) => string
  ariaLabel?: string
}

export interface AnimatedDonutChartEvents {
  'update:modelValue': [id: string | null]
  'select': [segment: AnimatedDonutChartSegment | null]
}

export interface AnimatedDonutChartExpose {
  replay: () => Promise<void>
  resetSelection: () => void
}

interface SafeSegment extends AnimatedDonutChartSegment {
  color: string
  value: number
  length: number
  offset: number
  share: number
}

const DEFAULT_COLORS = ['#d9ff57', '#8b82ff', '#ff8a5b', '#47c8ff', '#f472b6', '#2dd4bf']

const props = withDefaults(defineProps<AnimatedDonutChartProps>(), {
  segments: () => [],
  modelValue: null,
  size: 360,
  strokeWidth: 28,
  gap: 4,
  duration: 900,
  showLegend: true,
  interactive: true,
  paused: false,
  formatValue: undefined,
  ariaLabel: 'Donut chart',
})

const emit = defineEmits<AnimatedDonutChartEvents>()
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const captionId = `donut-caption-${uid}`
const titleId = `donut-title-${uid}`
const descriptionId = `donut-description-${uid}`
const activeId = ref<string | null>(null)
const legendFocusId = ref<string | null>(null)
const reducedMotion = ref(false)
const segmentElements = new Map<string, SVGCircleElement>()
const legendElements = new Map<string, HTMLButtonElement>()
const animations = new Set<Animation>()

let mounted = false
let animationGeneration = 0
let motionQuery: MediaQueryList | undefined

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

const safeSize = computed(() => Math.min(800, Math.max(160, finiteOr(props.size, 360))))
const safeStrokeWidth = computed(() => Math.min(safeSize.value * 0.36, Math.max(1, finiteOr(props.strokeWidth, 28))))
const safeGap = computed(() => Math.min(90, Math.max(0, finiteOr(props.gap, 4))))
const safeDuration = computed(() => Math.min(5000, Math.max(0, finiteOr(props.duration, 900))))
const center = computed(() => safeSize.value / 2)
const radius = computed(() => Math.max(1, center.value - safeStrokeWidth.value / 2 - 2))

const sanitizedSegments = computed(() => props.segments.map((segment, index) => ({
  ...segment,
  value: Math.max(0, finiteOr(segment.value, 0)),
  color: segment.color?.trim() || DEFAULT_COLORS[index % DEFAULT_COLORS.length]!,
})))
const total = computed(() => sanitizedSegments.value.reduce((sum, segment) => sum + segment.value, 0))
const safeSegments = computed<SafeSegment[]>(() => {
  let offset = 0
  const gapLength = safeGap.value / 360 * 100

  return sanitizedSegments.value.map((segment) => {
    const share = total.value > 0 ? segment.value / total.value : 0
    const rawLength = share * 100
    const result = {
      ...segment,
      share,
      offset,
      length: Math.max(0, rawLength - Math.min(gapLength, rawLength)),
    }
    offset += rawLength
    return result
  })
})
const enabledSegments = computed(() => safeSegments.value.filter(segment => !segment.disabled))
const selectedSegment = computed(() => safeSegments.value.find(segment => segment.id === props.modelValue) ?? null)
const emphasisId = computed(() => activeId.value ?? selectedSegment.value?.id ?? null)
const chartDescription = computed(() => total.value > 0
  ? `${safeSegments.value.length} segments with a total of ${formatDisplayValue(total.value)}. A data table follows the chart.`
  : 'No donut chart data is available.')

function formatDisplayValue(value: number) {
  if (props.formatValue) return props.formatValue(value, total.value)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function segmentSummary(segment: SafeSegment) {
  const percent = total.value > 0 ? Math.round(segment.share * 1000) / 10 : 0
  return `${segment.label}: ${formatDisplayValue(segment.value)}, ${percent}% of total.`
}

function segmentStyle(segment: SafeSegment): CSSProperties {
  return {
    color: segment.color,
    stroke: segment.color,
    strokeDasharray: `${segment.length} ${100 - segment.length}`,
    strokeDashoffset: String(-segment.offset),
    transform: `rotate(-90deg)`,
    transformOrigin: `${center.value}px ${center.value}px`,
  }
}

function segmentClass(segment: SafeSegment) {
  if (segment.disabled) return 'cursor-not-allowed opacity-25'
  if (!emphasisId.value) return props.interactive ? 'cursor-pointer opacity-90 hover:opacity-100' : 'opacity-90'
  return emphasisId.value === segment.id ? 'opacity-100 [filter:drop-shadow(0_0_5px_currentColor)]' : 'opacity-25'
}

function setSegmentElement(element: unknown, id: string) {
  if (element instanceof SVGCircleElement) segmentElements.set(id, element)
  else segmentElements.delete(id)
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
  if (generation !== animationGeneration || props.paused || reducedMotion.value || safeDuration.value === 0 || total.value <= 0) return

  safeSegments.value.forEach((segment, index) => {
    const element = segmentElements.get(segment.id)
    if (!element || segment.length <= 0) return
    const delay = Math.min(index * 55, safeDuration.value * 0.2)
    trackAnimation(element.animate([
      { strokeDasharray: `0 100` },
      { strokeDasharray: `${segment.length} ${100 - segment.length}` },
    ], {
      duration: safeDuration.value,
      delay,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    }))
  })
}

function selectSegment(segment: SafeSegment) {
  if (!props.interactive || segment.disabled) return
  const nextId = props.modelValue === segment.id ? null : segment.id
  emit('update:modelValue', nextId)
  emit('select', nextId === null ? null : props.segments.find(item => item.id === segment.id) ?? segment)
}

function resetSelection() {
  activeId.value = null
  emit('update:modelValue', null)
  emit('select', null)
}

function handleSegmentKeydown(event: KeyboardEvent, segment: SafeSegment) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  selectSegment(segment)
}

function moveLegendFocus(event: KeyboardEvent, id: string) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  const current = enabledSegments.value.findIndex(segment => segment.id === id)
  if (current < 0 || !enabledSegments.value.length) return

  event.preventDefault()
  let next = current
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = enabledSegments.value.length - 1
  else next = (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + enabledSegments.value.length) % enabledSegments.value.length

  const nextId = enabledSegments.value[next]!.id
  legendFocusId.value = nextId
  void nextTick(() => legendElements.get(nextId)?.focus())
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  clearAnimations()
  if (!event.matches && !props.paused) void replay()
}

watch(enabledSegments, (segments) => {
  if (segments.some(segment => segment.id === legendFocusId.value)) return
  legendFocusId.value = segments.find(segment => segment.id === props.modelValue)?.id ?? segments[0]?.id ?? null
}, { immediate: true })
watch(() => [props.segments, props.gap], () => {
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

defineExpose<AnimatedDonutChartExpose>({ replay, resetSelection })
</script>

<template>
  <figure
    class="animated-donut-chart m-0 w-full min-w-0 text-foreground"
    :style="{ maxWidth: `${safeSize}px` }"
    role="group"
    :aria-labelledby="captionId"
    :data-paused="paused || reducedMotion ? '' : undefined"
    data-testid="animated-donut-chart"
  >
    <figcaption :id="captionId" class="sr-only">{{ ariaLabel }}</figcaption>

    <div class="relative aspect-square w-full">
      <svg
        class="block size-full overflow-visible"
        :viewBox="`0 0 ${safeSize} ${safeSize}`"
        role="img"
        :aria-labelledby="`${titleId} ${descriptionId}`"
        data-testid="donut-chart-svg"
      >
        <title :id="titleId">{{ ariaLabel }}</title>
        <desc :id="descriptionId">{{ chartDescription }}</desc>

        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          stroke="currentColor"
          :stroke-width="safeStrokeWidth"
          class="text-border opacity-50"
          aria-hidden="true"
        />

        <circle
          v-for="segment in safeSegments"
          :key="segment.id"
          :ref="element => setSegmentElement(element, segment.id)"
          :cx="center"
          :cy="center"
          :r="radius"
          pathLength="100"
          fill="none"
          :stroke-width="emphasisId === segment.id && !segment.disabled ? safeStrokeWidth + 2 : safeStrokeWidth"
          stroke-linecap="butt"
          :style="segmentStyle(segment)"
          :class="segmentClass(segment)"
          :tabindex="interactive && !segment.disabled && segment.length > 0 ? 0 : undefined"
          :role="interactive && !segment.disabled && segment.length > 0 ? 'button' : undefined"
          :aria-label="interactive && !segment.disabled && segment.length > 0 ? `Select ${segmentSummary(segment)}` : undefined"
          :aria-pressed="interactive && !segment.disabled && segment.length > 0 ? modelValue === segment.id : undefined"
          :aria-disabled="segment.disabled || undefined"
          :data-testid="`donut-segment-${segment.id}`"
          class="animated-donut-chart__segment outline-none transition-[opacity,filter,stroke-width] duration-200 focus-visible:[filter:drop-shadow(0_0_6px_currentColor)] motion-reduce:transition-none"
          @mouseenter="interactive && !segment.disabled && (activeId = segment.id)"
          @mouseleave="activeId === segment.id && (activeId = null)"
          @focus="activeId = segment.id"
          @blur="activeId === segment.id && (activeId = null)"
          @click="selectSegment(segment)"
          @keydown="handleSegmentKeydown($event, segment)"
        >
          <title>{{ segmentSummary(segment) }}</title>
        </circle>
      </svg>

      <div class="pointer-events-none absolute inset-[23%] grid place-items-center text-center" data-testid="donut-center">
        <slot :total="total" :selected-segment="selectedSegment">
          <div>
            <p class="text-3xl font-semibold tracking-[-0.05em]">{{ formatDisplayValue(selectedSegment?.value ?? total) }}</p>
            <p class="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ selectedSegment?.label ?? 'Total' }}</p>
          </div>
        </slot>
      </div>
    </div>

    <div v-if="showLegend && safeSegments.length" class="mt-5 grid gap-1.5 sm:grid-cols-2" data-testid="donut-legend" aria-label="Chart segments">
      <button
        v-for="segment in safeSegments"
        v-if="interactive"
        :key="segment.id"
        :ref="element => setLegendElement(element, segment.id)"
        type="button"
        :disabled="segment.disabled"
        :tabindex="segment.id === legendFocusId ? 0 : -1"
        :aria-pressed="modelValue === segment.id"
        :aria-label="`Select ${segmentSummary(segment)}`"
        :data-testid="`donut-legend-${segment.id}`"
        class="group flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        :class="modelValue === segment.id ? 'bg-muted text-foreground' : ''"
        @mouseenter="!segment.disabled && (activeId = segment.id)"
        @mouseleave="activeId === segment.id && (activeId = null)"
        @focus="legendFocusId = segment.id; activeId = segment.id"
        @blur="activeId === segment.id && (activeId = null)"
        @keydown="moveLegendFocus($event, segment.id)"
        @click="selectSegment(segment)"
      >
        <span class="size-2.5 shrink-0 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background group-aria-pressed:ring-current" :style="{ backgroundColor: segment.color, color: segment.color }" />
        <span class="min-w-0 flex-1 truncate font-medium">{{ segment.label }}</span>
        <span class="shrink-0 font-mono text-[11px] text-foreground">{{ formatDisplayValue(segment.value) }}</span>
      </button>

      <div v-for="segment in safeSegments" v-else :key="segment.id" class="flex min-w-0 items-center gap-2.5 px-2.5 py-2 text-xs text-muted-foreground">
        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
        <span class="min-w-0 flex-1 truncate font-medium">{{ segment.label }}</span>
        <span class="shrink-0 font-mono text-[11px] text-foreground">{{ formatDisplayValue(segment.value) }}</span>
      </div>
    </div>

    <table class="sr-only" data-testid="donut-summary">
      <caption>{{ ariaLabel }} data</caption>
      <thead>
        <tr><th scope="col">Segment</th><th scope="col">Value</th><th scope="col">Share</th></tr>
      </thead>
      <tbody>
        <tr v-for="segment in safeSegments" :key="segment.id">
          <th scope="row">{{ segment.label }}</th>
          <td>{{ formatDisplayValue(segment.value) }}</td>
          <td>{{ total > 0 ? `${Math.round(segment.share * 1000) / 10}%` : '0%' }}</td>
        </tr>
        <tr v-if="!safeSegments.length"><td colspan="3">No data to display</td></tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animated-donut-chart__segment {
    transition: none !important;
  }
}
</style>
