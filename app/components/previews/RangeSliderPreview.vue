<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RangeSlider, { type RangeSliderHandle, type RangeSliderValues } from '#registry/default/range-slider/RangeSlider.vue'

const props = withDefaults(defineProps<{
  min?: number
  max?: number
  step?: number
  minGap?: number
  showValues?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  min: 200000,
  max: 1200000,
  step: 25000,
  minGap: 100000,
  showValues: true,
  duration: 240,
  disabled: false,
})

function makeInitialRange(): RangeSliderValues {
  const firstBound = Number.isFinite(props.min) ? props.min : 0
  const secondBound = Number.isFinite(props.max) ? props.max : 100
  const lower = Math.min(firstBound, secondBound)
  const upper = Math.max(firstBound, secondBound)
  const step = Number.isFinite(props.step) && props.step > 0 ? props.step : 1
  const snap = (value: number) => Math.min(upper, Math.max(lower, lower + Math.round((value - lower) / step) * step))
  let first = snap(lower + (upper - lower) * 0.25)
  let second = snap(lower + (upper - lower) * 0.7)
  const requestedGap = Number.isFinite(props.minGap) ? Math.max(0, props.minGap) : 0
  const gap = Math.min(upper - lower, requestedGap)
  if (second - first < gap) second = Math.min(upper, snap(first + gap))
  if (second - first < gap) first = Math.max(lower, snap(second - gap))
  return [first, second]
}

const budget = ref<RangeSliderValues>(makeInitialRange())
const lastHandle = ref<RangeSliderHandle | null>(null)
const resultCount = computed(() => {
  const firstBound = Number.isFinite(props.min) ? props.min : 0
  const secondBound = Number.isFinite(props.max) ? props.max : 100
  const total = Math.max(Math.abs(secondBound - firstBound), 1)
  const selected = Math.max(0, budget.value[1] - budget.value[0])
  return Math.max(4, Math.round(16 + selected / total * 78))
})

function formatPrice(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0
  const absolute = Math.abs(safeValue)
  if (absolute >= 1000000) return `$${(safeValue / 1000000).toFixed(safeValue % 1000000 === 0 ? 0 : 1)}m`
  if (absolute >= 1000) return `$${Math.round(safeValue / 1000)}k`
  return `$${safeValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

function onRangeInput(_values: RangeSliderValues, handle: RangeSliderHandle) {
  lastHandle.value = handle
}

watch(() => [props.min, props.max, props.step, props.minGap], () => {
  budget.value = makeInitialRange()
  lastHandle.value = null
})
</script>

<template>
  <div data-testid="range-slider-preview" class="flex min-h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-[#e8e3d6] p-5 text-[#171814] sm:min-h-[580px] sm:p-10">
    <section class="w-full max-w-[560px] overflow-hidden rounded-[30px] border border-black/10 bg-[#f9f8f3] shadow-[0_30px_80px_-46px_rgba(31,36,24,0.65)]">
      <header class="flex items-start justify-between gap-6 border-b border-black/10 px-6 py-6 sm:px-8">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#68705d]">Property search</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-[-0.045em] sm:text-[28px]">Shape your shortlist.</h3>
          <p class="mt-2 max-w-sm text-xs leading-5 text-black/45">Set a comfortable purchase range and see matching homes update instantly.</p>
        </div>
        <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[#d9ff57] text-[#171814]" aria-hidden="true">
          <svg class="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20"><path d="M3 9.2 10 3l7 6.2V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1Z" /></svg>
        </span>
      </header>

      <div class="px-6 py-7 sm:px-8 sm:py-8">
        <div class="mb-8 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5">
            <p class="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35">From</p>
            <p data-testid="range-slider-min-value" class="mt-1 text-lg font-semibold tracking-[-0.035em] tabular-nums">{{ formatPrice(budget[0]) }}</p>
          </div>
          <div class="rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5">
            <p class="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35">Up to</p>
            <p data-testid="range-slider-max-value" class="mt-1 text-lg font-semibold tracking-[-0.035em] tabular-nums">{{ formatPrice(budget[1]) }}</p>
          </div>
        </div>

        <RangeSlider
          v-model="budget"
          label="Purchase budget"
          min-label="Minimum purchase budget"
          max-label="Maximum purchase budget"
          :min="min"
          :max="max"
          :step="step"
          :min-gap="minGap"
          :show-values="showValues"
          :duration="duration"
          :disabled="disabled"
          :format-value="formatPrice"
          @input="onRangeInput"
        />

        <div class="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-[#171814] px-4 py-4 text-white sm:px-5">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex -space-x-2" aria-hidden="true">
              <span class="size-7 rounded-full border-2 border-[#171814] bg-[#d9ff57]" />
              <span class="size-7 rounded-full border-2 border-[#171814] bg-[#d7c5ff]" />
              <span class="size-7 rounded-full border-2 border-[#171814] bg-[#ffb9a9]" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold">{{ resultCount }} homes match</p>
              <p class="mt-0.5 text-[10px] text-white/45">Across 8 active neighborhoods</p>
            </div>
          </div>
          <span class="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#d9ff57]">Live results</span>
        </div>

        <p data-testid="range-slider-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Budget from {{ formatPrice(budget[0]) }} to {{ formatPrice(budget[1]) }}. {{ resultCount }} homes match.<template v-if="lastHandle"> {{ lastHandle === 'min' ? 'Minimum' : 'Maximum' }} value changed.</template>
        </p>
      </div>
    </section>
  </div>
</template>
