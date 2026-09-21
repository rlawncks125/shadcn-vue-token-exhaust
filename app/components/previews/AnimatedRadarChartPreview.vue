<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedRadarChart from '../../../registry/default/animated-radar-chart/AnimatedRadarChart.vue'

const props = withDefaults(defineProps<{
  duration?: number
  levels?: number
  showLabels?: boolean
  showLegend?: boolean
  paused?: boolean
}>(), {
  duration: 850,
  levels: 5,
  showLabels: true,
  showLegend: true,
  paused: false,
})

const axes = [
  { id: 'task-success', label: 'Task success', max: 100 },
  { id: 'reliability', label: 'Reliability', max: 100 },
  { id: 'accessibility', label: 'Accessibility', max: 100 },
  { id: 'adoption', label: 'Adoption', max: 100 },
  { id: 'satisfaction', label: 'Satisfaction', max: 100 },
  { id: 'time-to-value', label: 'Time to value', max: 100 },
]

const series = [
  { id: 'release-28', label: 'Release 2.8', values: [92, 96, 88, 81, 90, 86], color: '#d9ff57' },
  { id: 'release-27', label: 'Release 2.7', values: [78, 91, 72, 84, 80, 69], color: '#8b82ff' },
]

const selected = ref<string | null>('release-28')
const selectedSeries = computed(() => series.find(item => item.id === selected.value) ?? null)
const selectedAverage = computed(() => {
  if (!selectedSeries.value) return null
  return Math.round(selectedSeries.value.values.reduce((total, value) => total + value, 0) / selectedSeries.value.values.length)
})
</script>

<template>
  <div class="flex min-h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e8eadf] p-4 text-[#171914] sm:p-8 lg:p-10">
    <section class="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/10 bg-[#11140f] text-white shadow-[0_30px_90px_rgba(31,39,18,0.22)]">
      <div class="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-[#d9ff57]/10 blur-3xl" aria-hidden="true" />
      <div class="grid lg:grid-cols-[0.76fr_1.24fr]">
        <header class="relative flex flex-col border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div class="flex items-center justify-between gap-4">
            <span class="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              <span class="size-1.5 rounded-full bg-[#d9ff57] shadow-[0_0_12px_#d9ff57]" />
              Product quality
            </span>
            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/55">Q3 review</span>
          </div>

          <div class="mt-10 lg:mt-16">
            <p class="text-sm font-medium text-[#d9ff57]">Release confidence</p>
            <h3 class="mt-3 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-4xl">A stronger release, from first click to daily use.</h3>
            <p class="mt-5 max-w-sm text-sm leading-6 text-white/45">Six normalized signals from production telemetry, usability studies, and customer feedback.</p>
          </div>

          <div class="mt-8 border-t border-white/10 pt-6 lg:mt-auto">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Selected series</p>
            <div class="mt-2 flex items-end justify-between gap-4" aria-live="polite" data-testid="radar-selection-readout">
              <div>
                <p class="text-base font-medium text-white">{{ selectedSeries?.label ?? 'All releases' }}</p>
                <p class="mt-1 text-xs text-white/40">{{ selectedSeries ? 'Composite quality score' : 'Select a release to inspect' }}</p>
              </div>
              <strong v-if="selectedAverage !== null" class="font-mono text-3xl font-medium tracking-[-0.05em] text-[#d9ff57]">{{ selectedAverage }}</strong>
            </div>
          </div>
        </header>

        <div class="relative flex min-w-0 items-center justify-center p-5 sm:p-8 lg:p-10">
          <AnimatedRadarChart
            v-model="selected"
            class="[--background:#11140f] [--border:rgba(255,255,255,0.14)] [--foreground:#f5f7ef] [--muted:rgba(255,255,255,0.09)] [--muted-foreground:rgba(255,255,255,0.55)] [--ring:#d9ff57]"
            :axes="axes"
            :series="series"
            :size="520"
            :duration="props.duration"
            :levels="props.levels"
            :show-labels="props.showLabels"
            :show-legend="props.showLegend"
            :paused="props.paused"
            aria-label="Product quality by release"
          />
        </div>
      </div>
    </section>
  </div>
</template>
