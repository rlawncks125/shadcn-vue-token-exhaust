<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedDonutChart from '../../../registry/default/animated-donut-chart/AnimatedDonutChart.vue'

const props = withDefaults(defineProps<{
  duration?: number
  strokeWidth?: number
  gap?: number
  showLegend?: boolean
  paused?: boolean
}>(), {
  duration: 900,
  strokeWidth: 30,
  gap: 4,
  showLegend: true,
  paused: false,
})

const segments = [
  { id: 'organic', label: 'Organic search', value: 48200, color: '#d9ff57' },
  { id: 'direct', label: 'Direct', value: 31400, color: '#8b82ff' },
  { id: 'referral', label: 'Referral', value: 18600, color: '#ff8a5b' },
  { id: 'social', label: 'Social', value: 12400, color: '#47c8ff' },
]

const selected = ref<string | null>('organic')
const selectedSegment = computed(() => segments.find(segment => segment.id === selected.value) ?? null)
const total = segments.reduce((sum, segment) => sum + segment.value, 0)
const selectedShare = computed(() => selectedSegment.value ? selectedSegment.value.value / total * 100 : 100)

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
</script>

<template>
  <div data-testid="animated-donut-chart-preview" class="flex min-h-[620px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e9ece3] p-4 text-[#171914] sm:p-8 lg:p-10">
    <section class="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/10 bg-[#11140f] text-white shadow-[0_32px_100px_rgba(28,36,17,0.24)]">
      <div class="pointer-events-none absolute -left-24 -top-32 size-80 rounded-full bg-[#8b82ff]/10 blur-3xl" aria-hidden="true" />
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Acquisition pulse</p>
          <h3 class="mt-1.5 text-lg font-semibold tracking-[-0.025em]">Traffic by channel</h3>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium text-white/55">
          <span class="size-1.5 rounded-full bg-[#d9ff57] shadow-[0_0_10px_#d9ff57]" />
          Live, last 30 days
        </div>
      </div>

      <div class="grid lg:grid-cols-[1.18fr_0.82fr]">
        <div class="flex min-w-0 items-center justify-center border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <AnimatedDonutChart
            v-model="selected"
            class="[--background:#11140f] [--border:rgba(255,255,255,0.13)] [--foreground:#f7f8f3] [--muted:rgba(255,255,255,0.08)] [--muted-foreground:rgba(255,255,255,0.52)] [--ring:#d9ff57]"
            :segments="segments"
            :size="390"
            :stroke-width="props.strokeWidth"
            :gap="props.gap"
            :duration="props.duration"
            :show-legend="props.showLegend"
            :paused="props.paused"
            :format-value="compactNumber"
            aria-label="Website traffic by acquisition channel"
          >
            <template #default="{ total: chartTotal, selectedSegment: activeSegment }">
              <div class="max-w-[130px]">
                <p class="font-mono text-3xl font-medium tracking-[-0.06em] sm:text-4xl">{{ compactNumber(activeSegment?.value ?? chartTotal) }}</p>
                <p class="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{{ activeSegment?.label ?? 'Total visits' }}</p>
              </div>
            </template>
          </AnimatedDonutChart>
        </div>

        <aside class="relative flex flex-col p-6 sm:p-8 lg:p-10">
          <div>
            <p class="text-xs font-medium text-[#d9ff57]">Channel detail</p>
            <div class="mt-5" aria-live="polite" data-testid="donut-selection-readout">
              <p class="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{{ selectedShare.toFixed(1) }}%</p>
              <p class="mt-2 text-sm text-white/50">{{ selectedSegment ? `${selectedSegment.label} share of traffic` : 'All acquisition traffic' }}</p>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            <div class="bg-[#171a15] p-4">
              <p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">Visitors</p>
              <p class="mt-2 font-mono text-lg text-white">{{ compactNumber(total) }}</p>
            </div>
            <div class="bg-[#171a15] p-4">
              <p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">Conversion</p>
              <p class="mt-2 font-mono text-lg text-white">4.8%</p>
            </div>
          </div>

          <div class="mt-8 border-t border-white/10 pt-6 lg:mt-auto">
            <div class="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.15em] text-white/35">
              <span>Month over month</span>
              <span class="text-[#d9ff57]">+12.6%</span>
            </div>
            <div class="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
              <span v-for="height in [30, 42, 35, 54, 48, 65, 58, 72, 69, 88, 78, 100]" :key="height" class="min-w-0 flex-1 rounded-sm bg-white/10 last:bg-[#d9ff57]" :style="{ height: `${height}%` }" />
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
