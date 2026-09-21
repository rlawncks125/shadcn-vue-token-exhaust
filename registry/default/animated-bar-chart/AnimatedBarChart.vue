<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedBarChartItem {
  id: string
  label: string
  value: number
  color?: string
  description?: string
  disabled?: boolean
}

export interface AnimatedBarChartProps {
  items?: AnimatedBarChartItem[]
  modelValue?: string | null
  maxValue?: number
  height?: number
  barWidth?: number
  gap?: number
  duration?: number
  showValues?: boolean
  interactive?: boolean
  paused?: boolean
  ariaLabel?: string
}

export interface AnimatedBarChartEvents {
  'update:modelValue': [id: string | null]
  'select': [item: AnimatedBarChartItem | null]
}

export interface AnimatedBarChartExpose {
  replay: () => Promise<void>
  resetSelection: () => void
  focusSelected: () => Promise<void>
}

interface SafeItem extends AnimatedBarChartItem {
  color: string
  value: number
}

const DEFAULT_COLORS = ['#d9ff57', '#8b82ff', '#ff8a5b', '#47c8ff', '#f472b6', '#2dd4bf']
const PLOT_TOP = 30
const PLOT_BOTTOM = 46
const PLOT_LEFT = 52
const PLOT_RIGHT = 18

const props = withDefaults(defineProps<AnimatedBarChartProps>(), {
  items: () => [],
  modelValue: null,
  maxValue: undefined,
  height: 320,
  barWidth: 46,
  gap: 22,
  duration: 800,
  showValues: true,
  interactive: true,
  paused: false,
  ariaLabel: 'Bar chart',
})

const emit = defineEmits<AnimatedBarChartEvents>()
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const captionId = `bar-chart-caption-${uid}`
const titleId = `bar-chart-title-${uid}`
const descriptionId = `bar-chart-description-${uid}`
const activeId = ref<string | null>(null)
const rovingId = ref<string | null>(null)
const reducedMotion = ref(false)
const barElements = new Map<string, SVGRectElement>()
const interactiveElements = new Map<string, SVGGElement>()
const animations = new Set<Animation>()

let mounted = false
let animationGeneration = 0
let motionQuery: MediaQueryList | undefined

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const safeHeight = computed(() => Math.min(800, Math.max(180, finiteOr(props.height, 320))))
const safeBarWidth = computed(() => Math.min(120, Math.max(12, finiteOr(props.barWidth, 46))))
const safeGap = computed(() => Math.min(80, Math.max(0, finiteOr(props.gap, 22))))
const safeDuration = computed(() => Math.min(5000, Math.max(0, finiteOr(props.duration, 800))))
const plotHeight = computed(() => Math.max(1, safeHeight.value - PLOT_TOP - PLOT_BOTTOM))
const baseline = computed(() => PLOT_TOP + plotHeight.value)

// Bar charts use a zero baseline, so invalid and negative values are represented as zero.
const safeItems = computed<SafeItem[]>(() => props.items.map((item, index) => ({
  ...item,
  value: Math.max(0, finiteOr(item.value, 0)),
  color: item.color?.trim() || DEFAULT_COLORS[index % DEFAULT_COLORS.length]!,
})))
const dataMaximum = computed(() => Math.max(0, ...safeItems.value.map(item => item.value)))
const maximum = computed(() => {
  const requested = finiteOr(props.maxValue, 0)
  return Math.max(1, dataMaximum.value, requested > 0 ? requested : 0)
})
const enabledItems = computed(() => safeItems.value.filter(item => !item.disabled))
const selectedItem = computed(() => safeItems.value.find(item => item.id === props.modelValue) ?? null)
const emphasisId = computed(() => activeId.value ?? selectedItem.value?.id ?? null)
const contentWidth = computed(() => safeItems.value.length
  ? safeItems.value.length * safeBarWidth.value + Math.max(0, safeItems.value.length - 1) * safeGap.value
  : 0)
const chartWidth = computed(() => Math.max(240, PLOT_LEFT + contentWidth.value + PLOT_RIGHT))
const contentStart = computed(() => PLOT_LEFT + Math.max(0, (chartWidth.value - PLOT_LEFT - PLOT_RIGHT - contentWidth.value) / 2))
const ticks = computed(() => Array.from({ length: 5 }, (_, index) => maximum.value * (4 - index) / 4))
const chartDescription = computed(() => safeItems.value.length
  ? `${safeItems.value.length} bars. Values use a zero baseline; negative and non-finite values are shown as zero. A data table follows the chart.`
  : 'No bar chart data is available.')

function formatValue(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function xFor(index: number) {
  return contentStart.value + index * (safeBarWidth.value + safeGap.value)
}

function rawBarHeight(item: SafeItem) {
  return item.value / maximum.value * plotHeight.value
}

function selectedLift(item: SafeItem) {
  return props.modelValue === item.id && item.value > 0 ? Math.min(4, PLOT_TOP + rawBarHeight(item)) : 0
}

function barHeight(item: SafeItem) {
  return rawBarHeight(item) + selectedLift(item)
}

function yFor(item: SafeItem) {
  return baseline.value - rawBarHeight(item) - selectedLift(item)
}

function tickY(value: number) {
  return PLOT_TOP + (1 - value / maximum.value) * plotHeight.value
}

function itemSummary(item: SafeItem) {
  return `${item.label}: ${formatValue(item.value)}${item.description ? `. ${item.description}` : ''}`
}

function barStyle(item: SafeItem, index: number): CSSProperties {
  return {
    fill: item.color,
    color: item.color,
    transformBox: 'view-box',
    transformOrigin: `${xFor(index) + safeBarWidth.value / 2}px ${baseline.value}px`,
  }
}

function itemClass(item: SafeItem) {
  if (item.disabled) return 'cursor-not-allowed opacity-25'
  if (!emphasisId.value) return props.interactive ? 'cursor-pointer opacity-90 hover:opacity-100' : 'opacity-90'
  return emphasisId.value === item.id ? 'opacity-100' : 'opacity-25'
}

function setBarElement(element: unknown, id: string) {
  if (element instanceof SVGRectElement) barElements.set(id, element)
  else barElements.delete(id)
}

function setInteractiveElement(element: unknown, id: string) {
  if (element instanceof SVGGElement) interactiveElements.set(id, element)
  else interactiveElements.delete(id)
}

function clearAnimations() {
  animationGeneration += 1
  animations.forEach(animation => animation.cancel())
  animations.clear()
}

function trackAnimation(animation: Animation) {
  animations.add(animation)
  animation.finished.finally(() => animations.delete(animation)).catch(() => undefined)
  return animation
}

async function replay(): Promise<void> {
  clearAnimations()
  const generation = animationGeneration
  await nextTick()
  if (generation !== animationGeneration || props.paused || reducedMotion.value || safeDuration.value === 0) return

  const running = safeItems.value.flatMap((item, index) => {
    const element = barElements.get(item.id)
    if (!element || item.value <= 0) return []
    const delay = Math.min(index * 65, safeDuration.value * 0.3)
    return [trackAnimation(element.animate([
      { transform: 'scaleY(0)', opacity: 0.35 },
      { transform: 'scaleY(1)', opacity: 1 },
    ], {
      duration: safeDuration.value,
      delay,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    }))]
  })

  await Promise.all(running.map(animation => animation.finished.catch(() => undefined)))
}

function selectItem(item: SafeItem) {
  if (!props.interactive || item.disabled) return
  const nextId = props.modelValue === item.id ? null : item.id
  emit('update:modelValue', nextId)
  emit('select', nextId === null ? null : props.items.find(candidate => candidate.id === item.id) ?? item)
}

function resetSelection() {
  activeId.value = null
  emit('update:modelValue', null)
  emit('select', null)
}

async function focusSelected(): Promise<void> {
  if (!props.interactive) return
  const selected = enabledItems.value.find(item => item.id === props.modelValue)
  if (!selected) return
  rovingId.value = selected.id
  await nextTick()
  interactiveElements.get(selected.id)?.focus()
}

function handleKeydown(event: KeyboardEvent, item: SafeItem) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectItem(item)
    return
  }

  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  const current = enabledItems.value.findIndex(candidate => candidate.id === item.id)
  if (current < 0 || !enabledItems.value.length) return

  event.preventDefault()
  let next = current
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = enabledItems.value.length - 1
  else next = (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + enabledItems.value.length) % enabledItems.value.length

  const nextId = enabledItems.value[next]!.id
  rovingId.value = nextId
  void nextTick(() => interactiveElements.get(nextId)?.focus())
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  clearAnimations()
  if (!event.matches && !props.paused) void replay()
}

watch(enabledItems, (items) => {
  if (items.some(item => item.id === rovingId.value)) return
  rovingId.value = items.find(item => item.id === props.modelValue)?.id ?? items[0]?.id ?? null
}, { immediate: true })

watch(() => props.modelValue, (id) => {
  if (enabledItems.value.some(item => item.id === id)) rovingId.value = id
})

watch(() => [props.items, props.maxValue, props.height, props.barWidth, props.gap], () => {
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

defineExpose<AnimatedBarChartExpose>({ replay, resetSelection, focusSelected })
</script>

<template>
  <figure
    class="animated-bar-chart m-0 w-full min-w-0 text-foreground"
    role="group"
    :aria-labelledby="captionId"
    :data-paused="paused || reducedMotion ? '' : undefined"
    data-testid="animated-bar-chart"
  >
    <figcaption :id="captionId" class="sr-only">{{ ariaLabel }}</figcaption>

    <div class="w-full overflow-x-auto pb-1 [scrollbar-width:thin]">
      <svg
        class="block h-auto w-full overflow-visible"
        :style="{ minWidth: `${chartWidth}px` }"
        :viewBox="`0 0 ${chartWidth} ${safeHeight}`"
        :role="interactive ? 'group' : 'img'"
        :aria-labelledby="`${titleId} ${descriptionId}`"
        data-testid="bar-chart-svg"
      >
        <title :id="titleId">{{ ariaLabel }}</title>
        <desc :id="descriptionId">{{ chartDescription }}</desc>

        <g class="text-border" aria-hidden="true">
          <template v-for="tick in ticks" :key="tick">
            <line :x1="PLOT_LEFT" :x2="chartWidth - PLOT_RIGHT" :y1="tickY(tick)" :y2="tickY(tick)" stroke="currentColor" stroke-width="1" :stroke-opacity="tick === 0 ? 0.95 : 0.55" vector-effect="non-scaling-stroke" />
            <text :x="PLOT_LEFT - 9" :y="tickY(tick)" text-anchor="end" dominant-baseline="middle" class="fill-current text-[9px] font-medium text-muted-foreground">{{ formatValue(tick) }}</text>
          </template>
        </g>

        <g
          v-for="(item, index) in safeItems"
          :key="item.id"
          :ref="element => setInteractiveElement(element, item.id)"
          :role="interactive && !item.disabled ? 'button' : undefined"
          :tabindex="interactive && !item.disabled && rovingId === item.id ? 0 : undefined"
          :aria-label="interactive && !item.disabled ? `Select ${itemSummary(item)}` : undefined"
          :aria-pressed="interactive && !item.disabled ? modelValue === item.id : undefined"
          :aria-disabled="item.disabled || undefined"
          :data-testid="`bar-chart-item-${item.id}`"
          :class="itemClass(item)"
          class="animated-bar-chart__item outline-none transition-[opacity,filter] duration-200 focus-visible:[filter:drop-shadow(0_0_5px_currentColor)] motion-reduce:transition-none"
          @mouseenter="interactive && !item.disabled && (activeId = item.id)"
          @mouseleave="activeId === item.id && (activeId = null)"
          @focus="rovingId = item.id; activeId = item.id"
          @blur="activeId === item.id && (activeId = null)"
          @click="selectItem(item)"
          @keydown="handleKeydown($event, item)"
        >
          <title>{{ itemSummary(item) }}</title>
          <rect
            v-if="interactive && !item.disabled"
            :x="xFor(index) - safeGap / 2"
            :y="PLOT_TOP"
            :width="safeBarWidth + safeGap"
            :height="plotHeight"
            fill="transparent"
            class="animated-bar-chart__hit-area"
          />
          <rect
            :ref="element => setBarElement(element, item.id)"
            :x="xFor(index)"
            :y="yFor(item)"
            :width="safeBarWidth"
            :height="barHeight(item)"
            :rx="Math.min(8, safeBarWidth / 5)"
            :style="barStyle(item, index)"
            :stroke="modelValue === item.id ? item.color : 'transparent'"
            :stroke-width="modelValue === item.id ? 3 : 0"
            vector-effect="non-scaling-stroke"
            class="animated-bar-chart__bar pointer-events-none"
            aria-hidden="true"
          />
          <text
            v-if="showValues"
            :x="xFor(index) + safeBarWidth / 2"
            :y="Math.max(14, yFor(item) - 9)"
            text-anchor="middle"
            class="pointer-events-none fill-current text-[10px] font-semibold tabular-nums text-foreground"
            aria-hidden="true"
          >{{ formatValue(item.value) }}</text>
          <text
            :x="xFor(index) + safeBarWidth / 2"
            :y="baseline + 23"
            text-anchor="middle"
            class="pointer-events-none fill-current text-[10px] font-medium text-muted-foreground"
            aria-hidden="true"
          >{{ item.label }}</text>
        </g>

        <text
          v-if="!safeItems.length"
          :x="chartWidth / 2"
          :y="safeHeight / 2"
          text-anchor="middle"
          dominant-baseline="middle"
          class="fill-current text-xs font-medium text-muted-foreground"
          data-testid="bar-chart-empty"
        >No data to display</text>
      </svg>
    </div>

    <table class="sr-only" data-testid="bar-chart-summary">
      <caption>{{ ariaLabel }} data. Negative and non-finite values are shown as zero.</caption>
      <thead>
        <tr><th scope="col">Item</th><th scope="col">Value</th><th scope="col">Description</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in safeItems" :key="item.id">
          <th scope="row">{{ item.label }}</th>
          <td>{{ formatValue(item.value) }}</td>
          <td>{{ item.description ?? '' }}</td>
        </tr>
        <tr v-if="!safeItems.length"><td colspan="3">No data to display</td></tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
.animated-bar-chart__bar {
  transition: y 240ms cubic-bezier(0.22, 1, 0.36, 1), height 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease, filter 180ms ease, stroke-width 180ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .animated-bar-chart__bar,
  .animated-bar-chart__item {
    transition: none !important;
  }
}
</style>
