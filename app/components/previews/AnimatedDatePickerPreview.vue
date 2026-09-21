<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedDatePicker, { type AnimatedDatePickerExpose } from '#registry/default/animated-date-picker/AnimatedDatePicker.vue'

const props = withDefaults(defineProps<{
  min?: string
  max?: string
  locale?: string
  firstDayOfWeek?: number
  duration?: number
  disabled?: boolean
}>(), {
  min: '2026-09-01',
  max: '2026-12-20',
  locale: 'en-US',
  firstDayOfWeek: 0,
  duration: 280,
  disabled: false,
})

const picker = ref<AnimatedDatePickerExpose | null>(null)
const selected = ref('2026-10-16')
const visibleMonth = ref('2026-10')
const status = ref('October itinerary is ready to schedule.')
const unavailable = ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']

const formattedSelection = computed(() => {
  const date = new Date(`${selected.value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return 'No date selected'
  try {
    return new Intl.DateTimeFormat(props.locale, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
  }
  catch {
    return selected.value
  }
})

function reportDate(value: string) {
  selected.value = value
  status.value = `${formattedSelection.value} selected for the studio visit.`
}
</script>

<template>
  <div data-testid="animated-date-picker-preview" class="flex min-h-[650px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#c8c0af] p-4 text-[#23221f] sm:p-8 lg:min-h-[700px] lg:p-12">
    <section class="relative grid w-full max-w-[920px] overflow-hidden rounded-[32px] border border-black/10 bg-[#f4efe5] shadow-[0_36px_100px_-52px_rgba(40,31,24,0.72)] lg:grid-cols-[0.82fr_1.18fr]">
      <div class="relative overflow-hidden bg-[#2d3b32] p-6 text-[#f8f2e7] sm:p-8 lg:min-h-[590px] lg:p-10">
        <div class="pointer-events-none absolute -left-20 bottom-10 size-64 rounded-full border border-[#ffb38e]/20" aria-hidden="true" />
        <div class="pointer-events-none absolute -left-10 bottom-20 size-44 rounded-full border border-[#ffb38e]/25" aria-hidden="true" />
        <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffb38e]">Field notes / 04</p>
        <h2 class="mt-6 max-w-xs text-3xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-4xl">Reserve a quiet day in the city.</h2>
        <p class="mt-4 max-w-sm text-xs leading-5 text-white/55">Choose an open studio date, then we will shape a slow itinerary around galleries, lunch, and good light.</p>

        <div class="mt-8 rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:mt-12">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Your date</p>
              <p data-testid="date-picker-preview-value" class="mt-1.5 text-xl font-semibold tracking-[-0.035em]">{{ formattedSelection }}</p>
            </div>
            <span class="grid size-11 place-items-center rounded-full bg-[#ffb38e] text-[#2d3b32]" aria-hidden="true">
              <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20"><path d="M4 6.5h12M6.5 3v3M13.5 3v3M5 4.5h10a1 1 0 0 1 1 1V16H4V5.5a1 1 0 0 1 1-1Z" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-2 text-[10px]">
            <span class="rounded-xl bg-black/15 px-3 py-2.5 text-white/65">11:00 arrival</span>
            <span class="rounded-xl bg-black/15 px-3 py-2.5 text-white/65">3 stops planned</span>
          </div>
        </div>

        <button type="button" class="relative mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffb38e] underline decoration-[#ffb38e]/35 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#ffb38e]" :disabled="disabled" @click="picker?.focusSelected()">Return focus to date</button>
      </div>

      <div class="relative flex items-center justify-center p-5 sm:p-8 lg:p-10">
        <div class="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-[radial-gradient(circle_at_top_right,rgba(208,93,56,0.16),transparent_68%)]" aria-hidden="true" />
        <div class="w-full max-w-[390px]">
          <div class="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">Studio calendar</p>
              <p class="mt-1 text-sm font-semibold">Pick an available day</p>
            </div>
            <div class="flex gap-1.5">
              <button type="button" class="grid size-8 place-items-center rounded-full border border-black/10 bg-white text-black/55 outline-none transition hover:bg-[#eadfce] focus-visible:ring-2 focus-visible:ring-[#d05d38] disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" aria-label="Show previous month" @click="picker?.previousMonth()"><span aria-hidden="true">&#8592;</span></button>
              <button type="button" class="grid size-8 place-items-center rounded-full border border-black/10 bg-white text-black/55 outline-none transition hover:bg-[#eadfce] focus-visible:ring-2 focus-visible:ring-[#d05d38] disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" aria-label="Show next month" @click="picker?.nextMonth()"><span aria-hidden="true">&#8594;</span></button>
            </div>
          </div>

          <AnimatedDatePicker
            ref="picker"
            v-model="selected"
            v-model:visible-month="visibleMonth"
            :min="min"
            :max="max"
            :disabled-dates="unavailable"
            :locale="locale"
            :first-day-of-week="firstDayOfWeek"
            :duration="duration"
            :disabled="disabled"
            label="Visit date"
            @change="reportDate"
          />

          <p data-testid="date-picker-preview-status" class="mt-4 min-h-4 px-1 text-[10px] leading-4 text-black/45" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
