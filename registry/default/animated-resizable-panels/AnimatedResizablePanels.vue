<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export type ResizablePanelsOrientation = 'horizontal' | 'vertical'

const props = withDefaults(defineProps<{
  modelValue: number
  orientation?: ResizablePanelsOrientation
  min?: number
  max?: number
  step?: number
  snapPoints?: number[]
  snapThreshold?: number
  collapsible?: boolean
  duration?: number
  disabled?: boolean
  label?: string
}>(), {
  orientation: 'horizontal',
  min: 20,
  max: 80,
  step: 1,
  snapPoints: () => [],
  snapThreshold: 3,
  collapsible: false,
  duration: 260,
  disabled: false,
  label: 'Resize panels',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  resizeStart: [value: number]
  resize: [value: number]
  resizeEnd: [value: number]
  collapse: []
  expand: [value: number]
}>()

const root = ref<HTMLElement | null>(null)
const separator = ref<HTMLElement | null>(null)
const dragging = ref(false)
let activePointer: number | null = null

const bounds = computed(() => {
  const first = Number.isFinite(props.min) ? Math.min(100, Math.max(0, props.min)) : 20
  const second = Number.isFinite(props.max) ? Math.min(100, Math.max(0, props.max)) : 80
  return { min: Math.min(first, second), max: Math.max(first, second) }
})
const safeStep = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 260)
const safeThreshold = computed(() => Number.isFinite(props.snapThreshold) ? Math.max(0, props.snapThreshold) : 3)

function round(value: number) {
  return Number(value.toFixed(4))
}

function clamp(value: number, allowCollapse = true) {
  const numeric = Number.isFinite(value) ? value : bounds.value.min
  if (props.collapsible && allowCollapse && numeric <= bounds.value.min / 2) return 0
  return round(Math.min(bounds.value.max, Math.max(bounds.value.min, numeric)))
}

function snap(value: number) {
  const candidates = props.snapPoints
    .filter(Number.isFinite)
    .map(point => clamp(point, false))
    .concat(props.collapsible ? [0] : [])
  const nearest = candidates.reduce<number | null>((match, point) => {
    if (Math.abs(point - value) > safeThreshold.value) return match
    return match === null || Math.abs(point - value) < Math.abs(match - value) ? point : match
  }, null)
  return clamp(nearest ?? value)
}

const primarySize = computed(() => clamp(props.modelValue))
const isCollapsed = computed(() => props.collapsible && primarySize.value === 0)
const axis = computed(() => props.orientation === 'vertical' ? 'vertical' : 'horizontal')
const panelStyle = computed(() => axis.value === 'horizontal'
  ? { width: `${primarySize.value}%`, height: '100%' }
  : { width: '100%', height: `${primarySize.value}%` })
const separatorStyle = computed(() => axis.value === 'horizontal'
  ? { left: `${primarySize.value}%`, top: '0', bottom: '0' }
  : { top: `${primarySize.value}%`, left: '0', right: '0' })
const rootStyle = computed(() => ({ '--panels-duration': `${safeDuration.value}ms` }))
const initialValue = clamp(props.modelValue)
let lastExpanded = initialValue === 0 ? bounds.value.min : initialValue

function commit(value: number, reason: 'resize' | 'resizeEnd' | 'keyboard' | 'api') {
  const next = reason === 'resize' || reason === 'keyboard' ? clamp(value) : snap(value)
  const wasCollapsed = isCollapsed.value
  if (next > 0) lastExpanded = next
  if (next !== primarySize.value) emit('update:modelValue', next)
  if (reason === 'resize') emit('resize', next)
  if (reason === 'resizeEnd') emit('resizeEnd', next)
  if (!wasCollapsed && next === 0) emit('collapse')
  if (wasCollapsed && next > 0) emit('expand', next)
  return next
}

function valueFromPointer(event: PointerEvent) {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return primarySize.value
  const length = axis.value === 'horizontal' ? rect.width : rect.height
  if (length <= 0) return primarySize.value
  const offset = axis.value === 'horizontal' ? event.clientX - rect.left : event.clientY - rect.top
  return offset / length * 100
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  event.preventDefault()
  activePointer = event.pointerId
  dragging.value = true
  separator.value?.setPointerCapture(event.pointerId)
  emit('resizeStart', primarySize.value)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== activePointer) return
  commit(valueFromPointer(event), 'resize')
}

function finishPointer(event?: PointerEvent) {
  if (!dragging.value || (event && event.pointerId !== activePointer)) return
  const pointerId = activePointer
  activePointer = null
  dragging.value = false
  if (pointerId !== null && separator.value?.hasPointerCapture(pointerId)) separator.value.releasePointerCapture(pointerId)
  commit(event ? valueFromPointer(event) : primarySize.value, 'resizeEnd')
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const increment = safeStep.value * (event.shiftKey ? 5 : 1)
  let next: number | null = null
  if (event.key === 'Home') next = props.collapsible ? 0 : bounds.value.min
  else if (event.key === 'End') next = bounds.value.max
  else if (event.key === 'ArrowLeft' && axis.value === 'horizontal') next = primarySize.value - increment
  else if (event.key === 'ArrowRight' && axis.value === 'horizontal') next = primarySize.value + increment
  else if (event.key === 'ArrowUp' && axis.value === 'vertical') next = primarySize.value - increment
  else if (event.key === 'ArrowDown' && axis.value === 'vertical') next = primarySize.value + increment
  else if ((event.key === 'Enter' || event.key === ' ') && props.collapsible) next = isCollapsed.value ? lastExpanded : 0
  if (next === null) return
  event.preventDefault()
  const value = commit(next, 'keyboard')
  emit('resizeEnd', value)
}

function collapse() {
  if (props.disabled || !props.collapsible) return
  commit(0, 'api')
}

function expand() {
  if (props.disabled) return
  commit(lastExpanded || bounds.value.min, 'api')
}

function reset() {
  if (props.disabled) return
  commit(initialValue, 'api')
}

function focus() {
  separator.value?.focus()
}

watch(() => props.disabled, (disabled) => {
  if (disabled) finishPointer()
})

onBeforeUnmount(() => finishPointer())
defineExpose({ collapse, expand, reset, focus })
</script>

<template>
  <div
    ref="root"
    data-slot="animated-resizable-panels"
    data-testid="resizable-panels"
    class="relative flex size-full min-h-0 min-w-0 overflow-hidden"
    :class="[
      axis === 'horizontal' ? 'flex-row' : 'flex-col',
      { 'opacity-55': disabled },
    ]"
    :style="rootStyle"
  >
    <div
      data-slot="primary-panel"
      data-testid="resizable-primary"
      class="resizable-panel min-h-0 min-w-0 shrink-0 overflow-hidden"
      :class="{ 'resizable-panel--dragging': dragging }"
      :style="panelStyle"
    >
      <slot name="primary" :size="primarySize" :collapsed="isCollapsed" />
    </div>

    <div data-slot="secondary-panel" data-testid="resizable-secondary" class="min-h-0 min-w-0 flex-1 overflow-hidden">
      <slot name="secondary" :size="100 - primarySize" />
    </div>

    <div
      ref="separator"
      data-slot="resize-handle"
      data-testid="resizable-separator"
      role="separator"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-orientation="axis"
      :aria-valuemin="collapsible ? 0 : bounds.min"
      :aria-valuemax="bounds.max"
      :aria-valuenow="primarySize"
      :aria-valuetext="isCollapsed ? 'Collapsed' : `${Math.round(primarySize)} percent`"
      :aria-disabled="disabled"
      class="resizable-separator group absolute z-10 flex touch-none select-none items-center justify-center outline-none"
      :class="[
        axis === 'horizontal'
          ? 'w-5 -translate-x-1/2 cursor-col-resize py-3'
          : 'h-5 -translate-y-1/2 cursor-row-resize px-3',
        { 'resizable-separator--dragging': dragging },
      ]"
      :style="separatorStyle"
      @keydown="onKeydown"
      @dblclick="reset"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="finishPointer"
      @pointercancel="finishPointer"
      @lostpointercapture="finishPointer"
    >
      <span
        aria-hidden="true"
        class="grid place-items-center rounded-full border border-black/10 bg-white text-black/55 shadow-[0_4px_18px_rgba(0,0,0,.18)] transition-[width,height,background-color,color,transform] duration-200 group-hover:bg-[#171814] group-hover:text-white group-focus-visible:ring-3 group-focus-visible:ring-[var(--registry-accent,#d9ff57)] group-active:scale-95 motion-reduce:transition-none"
        :class="axis === 'horizontal' ? 'h-12 w-2.5' : 'h-2.5 w-12'"
      >
        <span :class="axis === 'horizontal' ? 'h-4 w-px' : 'h-px w-4'" class="bg-current opacity-55" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.resizable-panel,
.resizable-separator {
  transition-duration: var(--panels-duration);
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.resizable-panel {
  transition-property: width, height;
}

.resizable-separator {
  transition-property: left, top;
}

.resizable-panel--dragging,
.resizable-separator--dragging {
  transition-duration: 0ms;
}

@media (prefers-reduced-motion: reduce) {
  .resizable-panel,
  .resizable-separator {
    transition-duration: 0ms;
  }
}
</style>
