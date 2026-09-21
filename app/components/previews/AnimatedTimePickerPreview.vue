<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedTimePicker, { type AnimatedTimePickerChangeSource, type AnimatedTimePickerExpose, type AnimatedTimePickerFormat } from '#registry/default/animated-time-picker/AnimatedTimePicker.vue'

const props = withDefaults(defineProps<{
  min?: string
  max?: string
  stepMinutes?: number
  format?: AnimatedTimePickerFormat
  duration?: number
  disabled?: boolean
}>(), {
  min: '16:00',
  max: '22:30',
  stepMinutes: 15,
  format: 12,
  duration: 240,
  disabled: false,
})

const picker = ref<AnimatedTimePickerExpose | null>(null)
const time = ref('18:30')
const status = ref('Terrace seating is held for 6:30 PM.')

const displayTime = computed(() => {
  const [hourText = '0', minute = '00'] = time.value.split(':')
  const hour = Number(hourText)
  if (props.format === 24) return `${String(hour).padStart(2, '0')}:${minute}`
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`
})

const serviceNote = computed(() => {
  const hour = Number(time.value.slice(0, 2))
  return hour < 18 ? 'Golden hour' : hour < 21 ? 'Dinner service' : 'Late seating'
})

function reportChange(value: string, _previous: string, source: AnimatedTimePickerChangeSource) {
  time.value = value
  status.value = `${displayTime.value} selected via ${source}.`
}
</script>

<template>
  <div data-testid="animated-time-picker-preview" class="flex min-h-[690px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#d9c7ad] p-4 text-[#17221c] sm:p-8 lg:min-h-[720px] lg:p-12">
    <section class="relative grid w-full max-w-[960px] overflow-hidden rounded-[34px] border border-[#183125]/10 bg-[#f1eadc] shadow-[0_40px_110px_-55px_rgba(45,32,21,0.72)] lg:grid-cols-[0.95fr_1.05fr]">
      <div class="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#b84e35] p-6 text-[#fff8ea] sm:p-9 lg:min-h-[610px] lg:p-10">
        <div class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border-[52px] border-[#f5b85b]/20" aria-hidden="true" />
        <div class="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full opacity-30 [background-image:linear-gradient(135deg,transparent_45%,rgba(255,255,255,.18)_46%,rgba(255,255,255,.18)_47%,transparent_48%)] [background-size:28px_28px]" aria-hidden="true" />

        <div class="relative">
          <p class="text-[9px] font-bold uppercase tracking-[0.25em] text-[#ffd58d]">Afterlight / Table 08</p>
          <h2 class="mt-7 max-w-sm text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Dinner moves at your pace.</h2>
          <p class="mt-5 max-w-xs text-xs leading-5 text-white/65">Choose a terrace arrival and we will time the first course to the last of the daylight.</p>
        </div>

        <div class="relative mt-10 rounded-[24px] border border-white/15 bg-[#8f3827]/55 p-5 backdrop-blur-sm">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Your arrival</p>
              <p data-testid="time-picker-preview-value" class="mt-2 text-3xl font-semibold tracking-[-0.055em] tabular-nums">{{ displayTime }}</p>
            </div>
            <span class="mb-1 size-2.5 rounded-full bg-[#d9ff83] shadow-[0_0_0_6px_rgba(217,255,131,0.14)]" aria-hidden="true" />
          </div>
          <div class="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-white/55">
            <span>{{ serviceNote }}</span>
            <span>Terrace &middot; 2 guests</span>
          </div>
        </div>
      </div>

      <div class="relative flex items-center justify-center p-5 sm:p-9 lg:p-11">
        <div class="pointer-events-none absolute right-8 top-8 size-20 rounded-full bg-[#d9ff83]/35 blur-2xl" aria-hidden="true" />
        <div class="relative w-full max-w-[430px]">
          <div class="mb-5 flex items-end justify-between gap-4 px-1">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#17221c]/35">Reservation time</p>
              <p class="mt-1.5 text-lg font-semibold tracking-[-0.035em]">When should we expect you?</p>
            </div>
            <button type="button" data-testid="time-picker-preview-focus" class="grid size-10 shrink-0 place-items-center rounded-full border border-[#17221c]/10 bg-white/60 text-[#31513f] outline-none transition hover:-translate-y-0.5 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#b84e35] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" aria-label="Focus time picker" @click="picker?.focus()">
              <svg class="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>

          <AnimatedTimePicker
            ref="picker"
            v-model="time"
            name="arrival_time"
            :min="min"
            :max="max"
            :step-minutes="stepMinutes"
            :format="format"
            :duration="duration"
            :disabled="disabled"
            label="Arrival time"
            @change="reportChange"
            @invalid="(_value, reason) => status = reason"
          />

          <div class="mt-4 grid grid-cols-3 gap-2">
            <button type="button" data-testid="time-picker-preview-earlier" class="rounded-xl border border-[#17221c]/10 bg-white/45 px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#31513f] outline-none transition hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-[#b84e35] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" @click="picker?.decrement()">Earlier</button>
            <button type="button" data-testid="time-picker-preview-reset" class="rounded-xl border border-[#17221c]/10 bg-transparent px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#17221c]/45 outline-none transition hover:bg-white/45 focus-visible:ring-2 focus-visible:ring-[#b84e35] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" @click="picker?.reset()">Reset</button>
            <button type="button" data-testid="time-picker-preview-later" class="rounded-xl bg-[#20372b] px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#d9ff83] outline-none transition hover:bg-[#2d4939] focus-visible:ring-2 focus-visible:ring-[#b84e35] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" @click="picker?.increment()">Later</button>
          </div>

          <p data-testid="time-picker-preview-status" class="mt-4 min-h-4 px-1 text-[10px] leading-4 text-[#17221c]/45" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
