<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedCalendarHeatmap, {
  type AnimatedCalendarHeatmapDay,
  type AnimatedCalendarHeatmapExpose,
} from '../../../registry/default/animated-calendar-heatmap/AnimatedCalendarHeatmap.vue'

const props = withDefaults(defineProps<{
  weeks?: number
  duration?: number
  cellSize?: number
  gap?: number
  disabled?: boolean
}>(), {
  weeks: 20,
  duration: 700,
  cellSize: 14,
  gap: 4,
  disabled: false,
})

const DAY_MS = 86_400_000
const END_DATE = Date.parse('2026-09-19T00:00:00Z')
const heatmap = ref<AnimatedCalendarHeatmapExpose | null>(null)
const dataVersion = ref(0)
const selected = ref<string | null>('2026-09-17')
const status = ref('Activity calendar ready. Use the arrow keys to explore.')

function makeDays(weeks: number, version: number): AnimatedCalendarHeatmapDay[] {
  const count = Math.max(1, Math.floor(weeks)) * 7
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(END_DATE - (count - 1 - index) * DAY_MS)
    const dayOfWeek = (date.getUTCDay() + 6) % 7
    const pulse = Math.round((Math.sin((index + version * 5) * 0.47) + 1) * 3.2)
    const cadence = (index * 11 + version * 17 + Math.floor(index / 9) * 3) % 8
    const quietDay = (index + version * 3) % 13 === 0
    const value = quietDay ? 0 : Math.max(0, pulse + cadence - (dayOfWeek > 4 ? 3 : 0))
    const key = date.toISOString().slice(0, 10)
    const label = key === '2026-09-17' ? 'Release day' : key === '2026-08-24' ? 'Sprint kickoff' : undefined
    return { date: key, value, label }
  })
}

const days = computed(() => makeDays(props.weeks, dataVersion.value))
const total = computed(() => days.value.reduce((sum, day) => sum + day.value, 0))
const activeDays = computed(() => days.value.filter(day => day.value > 0).length)
const average = computed(() => days.value.length ? Math.round(total.value / days.value.length) : 0)

function formatValue(value: number) {
  return `${value} ${value === 1 ? 'contribution' : 'contributions'}`
}

function updateData() {
  dataVersion.value = (dataVersion.value + 1) % 5
  status.value = `Activity data updated. Dataset ${dataVersion.value + 1} of 5.`
}

async function replay() {
  status.value = 'Replaying the activity reveal.'
  await heatmap.value?.replay()
  status.value = 'Activity reveal complete.'
}

function reportSelection(day: AnimatedCalendarHeatmapDay) {
  status.value = `${day.label ?? day.date} selected with ${formatValue(day.value)}.`
}
</script>

<template>
  <div class="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e9efe9] p-4 text-[#17231c] sm:min-h-[600px] sm:p-8 lg:p-12">
    <section class="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#173d2c]/10 bg-[#fbfdf9] shadow-[0_28px_80px_-42px_rgba(21,61,43,0.48)]">
      <div class="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#b9f5c9]/35 blur-3xl" aria-hidden="true" />

      <header class="relative flex flex-col gap-5 border-b border-[#173d2c]/10 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-7">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <span class="size-2 rounded-full bg-[#22a05a] shadow-[0_0_0_4px_rgba(34,160,90,0.12)]" aria-hidden="true" />
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#41614f]">Engineering pulse</p>
          </div>
          <h3 class="text-2xl font-semibold tracking-[-0.04em] text-[#102219] sm:text-[28px]">Contribution activity</h3>
          <p class="mt-1 max-w-md text-xs leading-5 text-[#5f7467]">A focused view of commits, reviews, and shipped changes across the team.</p>
        </div>

        <div class="flex shrink-0 gap-2">
          <button type="button" class="inline-flex h-9 items-center gap-2 rounded-full border border-[#173d2c]/12 bg-white px-3.5 text-[11px] font-semibold text-[#284b37] shadow-sm outline-none transition hover:-translate-y-px hover:border-[#173d2c]/25 hover:bg-[#f5faf5] focus-visible:ring-2 focus-visible:ring-[#228a51] focus-visible:ring-offset-2 active:translate-y-0 motion-reduce:transition-none" @click="updateData">
            <svg class="size-3.5 fill-none stroke-current stroke-[1.8]" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 5.5A5.5 5.5 0 1 0 13.2 10M13 2v3.5H9.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Update data
          </button>
          <button type="button" class="inline-flex h-9 items-center gap-2 rounded-full bg-[#173d2c] px-3.5 text-[11px] font-semibold text-white shadow-sm outline-none transition hover:-translate-y-px hover:bg-[#224f39] focus-visible:ring-2 focus-visible:ring-[#228a51] focus-visible:ring-offset-2 active:translate-y-0 motion-reduce:transition-none" @click="replay">
            <svg class="size-3.5 fill-none stroke-current stroke-[1.8]" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.3 6A5 5 0 1 1 3 9.5M3 3v3.2h3.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            Replay
          </button>
        </div>
      </header>

      <div class="relative px-5 py-6 sm:px-8 sm:py-8">
        <div class="mb-7 grid grid-cols-3 divide-x divide-[#173d2c]/10 rounded-2xl border border-[#173d2c]/10 bg-[#f3f7f2] py-3">
          <div class="px-3 sm:px-5"><span class="block text-lg font-semibold tabular-nums tracking-[-0.03em] text-[#173d2c]">{{ total.toLocaleString('en') }}</span><span class="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#688071]">Contributions</span></div>
          <div class="px-3 sm:px-5"><span class="block text-lg font-semibold tabular-nums tracking-[-0.03em] text-[#173d2c]">{{ activeDays }}</span><span class="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#688071]">Active days</span></div>
          <div class="px-3 sm:px-5"><span class="block text-lg font-semibold tabular-nums tracking-[-0.03em] text-[#173d2c]">{{ average }}</span><span class="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#688071]">Daily avg.</span></div>
        </div>

        <AnimatedCalendarHeatmap
          ref="heatmap"
          v-model="selected"
          :days="days"
          :weeks="weeks"
          :duration="duration"
          :cell-size="cellSize"
          :gap="gap"
          :disabled="disabled"
          :levels="5"
          :format-value="formatValue"
          label="Team contribution activity"
          @select="reportSelection"
        />

        <p data-testid="calendar-heatmap-status" class="mt-6 min-h-5 border-t border-[#173d2c]/10 pt-4 text-[11px] text-[#64796b]" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
      </div>
    </section>
  </div>
</template>
