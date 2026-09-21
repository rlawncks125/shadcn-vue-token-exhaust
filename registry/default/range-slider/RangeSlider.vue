<script setup lang="ts">
import { computed, ref, useId } from 'vue'

export type RangeSliderValues = [number, number]
export type RangeSliderHandle = 'min' | 'max'

const props = withDefaults(defineProps<{
  modelValue: RangeSliderValues
  min?: number
  max?: number
  step?: number
  minGap?: number
  label?: string
  minLabel?: string
  maxLabel?: string
  formatValue?: (value: number) => string
  showValues?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  min: 0,
  max: 100,
  step: 1,
  minGap: 0,
  label: 'Range',
  minLabel: 'Minimum',
  maxLabel: 'Maximum',
  formatValue: (value: number) => String(value),
  showValues: true,
  duration: 240,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [values: RangeSliderValues]
  input: [values: RangeSliderValues, changedHandle: RangeSliderHandle]
  change: [values: RangeSliderValues, changedHandle: RangeSliderHandle]
}>()

const uid = useId()
const groupId = `range-slider-${uid}`
const minId = `${groupId}-min`
const maxId = `${groupId}-max`
const minInput = ref<HTMLInputElement | null>(null)
const maxInput = ref<HTMLInputElement | null>(null)
const activeHandle = ref<RangeSliderHandle | null>(null)
const focusedHandle = ref<RangeSliderHandle | null>(null)

const bounds = computed(() => {
  const first = Number.isFinite(props.min) ? props.min : 0
  const second = Number.isFinite(props.max) ? props.max : 100
  return { min: Math.min(first, second), max: Math.max(first, second) }
})
const safeStep = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 240)

function decimalPlaces(value: number) {
  const text = String(value).toLowerCase()
  if (text.includes('e-')) return Math.min(10, Number(text.split('e-')[1]) || 0)
  return text.includes('.') ? Math.min(10, text.split('.')[1]!.length) : 0
}

const precision = computed(() => Math.max(
  decimalPlaces(bounds.value.min),
  decimalPlaces(bounds.value.max),
  decimalPlaces(safeStep.value),
))

function clean(value: number) {
  return Number(value.toFixed(precision.value))
}

function clamp(value: number) {
  return Math.min(bounds.value.max, Math.max(bounds.value.min, value))
}

function snap(value: number, mode: 'nearest' | 'floor' | 'ceil' = 'nearest') {
  if (bounds.value.min === bounds.value.max) return bounds.value.min
  const numeric = Number.isFinite(value) ? value : bounds.value.min
  const steps = (clamp(numeric) - bounds.value.min) / safeStep.value
  const roundedSteps = mode === 'floor'
    ? Math.floor(steps + 1e-10)
    : mode === 'ceil'
      ? Math.ceil(steps - 1e-10)
      : Math.round(steps)
  return clean(clamp(bounds.value.min + roundedSteps * safeStep.value))
}

const effectiveGap = computed(() => {
  const range = bounds.value.max - bounds.value.min
  const requested = Number.isFinite(props.minGap) ? Math.max(0, props.minGap) : 0
  if (range === 0 || requested === 0) return 0
  return clean(Math.min(range, Math.ceil((requested - 1e-10) / safeStep.value) * safeStep.value))
})

function normalizePair(source: RangeSliderValues): RangeSliderValues {
  const first = Number.isFinite(source?.[0]) ? source[0] : bounds.value.min
  const second = Number.isFinite(source?.[1]) ? source[1] : bounds.value.max
  let lower = snap(Math.min(first, second))
  let upper = snap(Math.max(first, second))

  if (upper - lower + 1e-10 < effectiveGap.value) {
    const expandedUpper = snap(lower + effectiveGap.value, 'ceil')
    if (expandedUpper <= bounds.value.max && expandedUpper - lower + 1e-10 >= effectiveGap.value) {
      upper = expandedUpper
    }
    else {
      lower = snap(upper - effectiveGap.value, 'floor')
    }
  }

  if (upper - lower + 1e-10 < effectiveGap.value) {
    lower = bounds.value.min
    upper = bounds.value.max
  }

  return [clean(lower), clean(upper)]
}

const values = computed(() => normalizePair(props.modelValue))
const rangeSize = computed(() => bounds.value.max - bounds.value.min)
const minPercentage = computed(() => rangeSize.value === 0 ? 0 : (values.value[0] - bounds.value.min) / rangeSize.value * 100)
const maxPercentage = computed(() => rangeSize.value === 0 ? 0 : (values.value[1] - bounds.value.min) / rangeSize.value * 100)
const minInputMax = computed(() => snap(values.value[1] - effectiveGap.value, 'floor'))
const maxInputMin = computed(() => snap(values.value[0] + effectiveGap.value, 'ceil'))
const crowded = computed(() => maxPercentage.value - minPercentage.value < 18)
const animationStyle = computed(() => ({ '--range-duration': `${safeDuration.value}ms` }))
const initialValues = normalizePair(props.modelValue)

function nextValues(rawValue: number, handle: RangeSliderHandle): RangeSliderValues {
  const [lower, upper] = values.value
  if (handle === 'min') return [Math.min(snap(rawValue), minInputMax.value), upper]
  return [lower, Math.max(snap(rawValue), maxInputMin.value)]
}

function sameValues(first: RangeSliderValues, second: RangeSliderValues) {
  return first[0] === second[0] && first[1] === second[1]
}

function onInput(event: Event, handle: RangeSliderHandle) {
  const target = event.currentTarget as HTMLInputElement
  const next = nextValues(Number(target.value), handle)
  target.value = String(next[handle === 'min' ? 0 : 1])
  if (sameValues(next, values.value)) return
  emit('update:modelValue', next)
  emit('input', next, handle)
}

function onChange(event: Event, handle: RangeSliderHandle) {
  const target = event.currentTarget as HTMLInputElement
  const next = nextValues(Number(target.value), handle)
  target.value = String(next[handle === 'min' ? 0 : 1])
  if (!sameValues(next, values.value)) emit('update:modelValue', next)
  emit('change', next, handle)
}

function onFocus(handle: RangeSliderHandle) {
  focusedHandle.value = handle
  activeHandle.value = handle
}

function onBlur(handle: RangeSliderHandle) {
  if (focusedHandle.value === handle) focusedHandle.value = null
  if (activeHandle.value === handle) activeHandle.value = null
}

function finishPointer(handle: RangeSliderHandle) {
  if (focusedHandle.value !== handle) activeHandle.value = null
}

function focusMin() {
  minInput.value?.focus()
}

function focusMax() {
  maxInput.value?.focus()
}

function reset() {
  const next = normalizePair(initialValues)
  if (!sameValues(next, values.value)) emit('update:modelValue', next)
}

defineExpose({ focusMin, focusMax, reset })
</script>

<template>
  <fieldset
    data-slot="range-slider"
    class="range-slider min-w-0 border-0 p-0 text-[#171814]"
    :class="{ 'cursor-not-allowed opacity-45': disabled }"
    :disabled="disabled"
    :style="animationStyle"
  >
    <legend class="sr-only">{{ label }}</legend>

    <div class="flex items-end justify-between gap-4">
      <span aria-hidden="true" class="text-[11px] font-semibold tracking-[0.01em] text-[#17181499]">{{ label }}</span>
      <span class="text-[10px] font-medium tabular-nums text-[#17181466]" aria-hidden="true">
        {{ formatValue(values[0]) }} - {{ formatValue(values[1]) }}
      </span>
    </div>

    <label :for="minId" class="sr-only">{{ minLabel }}</label>
    <label :for="maxId" class="sr-only">{{ maxLabel }}</label>

    <div class="relative mt-8 h-10" :class="{ 'mt-11': showValues }">
      <div class="pointer-events-none absolute inset-x-3 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-[#17181414]" aria-hidden="true">
        <span
          class="range-slider-fill absolute inset-y-0 rounded-full bg-[var(--registry-accent,#d9ff57)] shadow-[inset_0_0_0_1px_#17181414]"
          :style="{ left: `${minPercentage}%`, right: `${100 - maxPercentage}%` }"
        />
      </div>

      <div class="pointer-events-none absolute inset-x-3 top-1/2" aria-hidden="true">
        <span
          class="range-slider-thumb absolute left-0 top-0 z-[2] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#171814] shadow-[0_4px_12px_#17181438]"
          :class="{ 'range-slider-thumb--active': activeHandle === 'min', 'range-slider-thumb--focused': focusedHandle === 'min' }"
          :style="{ left: `${minPercentage}%` }"
        >
          <span
            v-if="showValues"
            class="range-slider-bubble range-slider-bubble--min absolute bottom-[calc(100%+10px)] left-1/2 whitespace-nowrap rounded-lg bg-[#171814] px-2.5 py-1.5 text-[10px] font-semibold tabular-nums text-white shadow-[0_8px_20px_#17181424]"
            :class="{ 'range-slider-bubble--crowded': crowded }"
          >{{ formatValue(values[0]) }}</span>
        </span>

        <span
          class="range-slider-thumb absolute left-0 top-0 z-[2] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#171814] shadow-[0_4px_12px_#17181438]"
          :class="{ 'range-slider-thumb--active': activeHandle === 'max', 'range-slider-thumb--focused': focusedHandle === 'max' }"
          :style="{ left: `${maxPercentage}%` }"
        >
          <span
            v-if="showValues"
            class="range-slider-bubble range-slider-bubble--max absolute bottom-[calc(100%+10px)] left-1/2 whitespace-nowrap rounded-lg bg-[#171814] px-2.5 py-1.5 text-[10px] font-semibold tabular-nums text-white shadow-[0_8px_20px_#17181424]"
            :class="{ 'range-slider-bubble--crowded': crowded }"
          >{{ formatValue(values[1]) }}</span>
        </span>
      </div>

      <input
        :id="minId"
        ref="minInput"
        data-handle="min"
        class="range-slider-input absolute inset-0 m-0 h-10 w-full border-0 p-0 outline-none"
        :class="activeHandle === 'min' ? 'z-[4]' : 'z-[3]'"
        type="range"
        :min="bounds.min"
        :max="minInputMax"
        :step="safeStep"
        :value="values[0]"
        :disabled="disabled"
        :aria-valuetext="formatValue(values[0])"
        @input="onInput($event, 'min')"
        @change="onChange($event, 'min')"
        @focus="onFocus('min')"
        @blur="onBlur('min')"
        @pointerdown="activeHandle = 'min'"
        @pointerup="finishPointer('min')"
        @pointercancel="finishPointer('min')"
      >
      <input
        :id="maxId"
        ref="maxInput"
        data-handle="max"
        class="range-slider-input absolute inset-0 m-0 h-10 w-full border-0 p-0 outline-none"
        :class="activeHandle === 'max' ? 'z-[4]' : 'z-[3]'"
        type="range"
        :min="maxInputMin"
        :max="bounds.max"
        :step="safeStep"
        :value="values[1]"
        :disabled="disabled"
        :aria-valuetext="formatValue(values[1])"
        @input="onInput($event, 'max')"
        @change="onChange($event, 'max')"
        @focus="onFocus('max')"
        @blur="onBlur('max')"
        @pointerdown="activeHandle = 'max'"
        @pointerup="finishPointer('max')"
        @pointercancel="finishPointer('max')"
      >
    </div>
  </fieldset>
</template>

<style scoped>
.range-slider-fill,
.range-slider-thumb {
  transition-duration: var(--range-duration);
  transition-property: left, right, transform, box-shadow;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.range-slider-thumb--active {
  transform: translate(-50%, -50%) scale(1.16);
}

.range-slider-thumb--focused {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--registry-accent, #d9ff57) 45%, transparent), 0 4px 12px #17181438;
}

.range-slider-bubble {
  transform: translateX(-50%) scale(0.96);
  transition: transform var(--range-duration) cubic-bezier(0.22, 1, 0.36, 1), opacity var(--range-duration) ease;
}

.range-slider-thumb--active .range-slider-bubble,
.range-slider-thumb--focused .range-slider-bubble {
  transform: translateX(-50%) scale(1.04);
}

.range-slider-bubble--min.range-slider-bubble--crowded {
  left: auto;
  right: 7px;
  transform-origin: right center;
  transform: scale(0.96);
}

.range-slider-bubble--max.range-slider-bubble--crowded {
  left: 7px;
  transform-origin: left center;
  transform: scale(0.96);
}

.range-slider-thumb--active .range-slider-bubble--crowded,
.range-slider-thumb--focused .range-slider-bubble--crowded {
  transform: scale(1.04);
}

.range-slider-input {
  appearance: none;
  background: transparent;
  pointer-events: none;
  touch-action: none;
}

.range-slider-input::-webkit-slider-runnable-track {
  height: 100%;
  background: transparent;
}

.range-slider-input::-webkit-slider-thumb {
  width: 24px;
  height: 40px;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: grab;
  pointer-events: auto;
}

.range-slider-input::-moz-range-track {
  height: 100%;
  border: 0;
  background: transparent;
}

.range-slider-input::-moz-range-progress {
  background: transparent;
}

.range-slider-input::-moz-range-thumb {
  width: 24px;
  height: 40px;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: grab;
  pointer-events: auto;
}

.range-slider-input:active::-webkit-slider-thumb {
  cursor: grabbing;
}

.range-slider-input:active::-moz-range-thumb {
  cursor: grabbing;
}

.range-slider-input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.range-slider-input:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .range-slider-fill,
  .range-slider-thumb,
  .range-slider-bubble {
    transition-duration: 0ms;
  }
}
</style>
