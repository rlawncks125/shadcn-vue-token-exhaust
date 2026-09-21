<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AnimatedRating from '#registry/default/animated-rating/AnimatedRating.vue'

const props = withDefaults(defineProps<{
  max?: number
  duration?: number
  clearable?: boolean
  disabled?: boolean
  showValue?: boolean
}>(), {
  max: 5,
  duration: 320,
  clearable: true,
  disabled: false,
  showValue: true,
})

const safeMax = computed(() => Number.isFinite(props.max) ? Math.max(1, Math.floor(props.max)) : 5)
const rating = ref(Math.min(4, safeMax.value))
const status = ref(`Your rating is ${rating.value} out of ${safeMax.value}.`)
const average = computed(() => (safeMax.value * 0.94).toFixed(1))

watch(safeMax, (maximum) => {
  rating.value = Math.min(rating.value, maximum)
  status.value = rating.value
    ? `Your rating is ${rating.value} out of ${maximum}.`
    : 'No rating selected.'
})

function handleSelect(value: number) {
  status.value = `You selected ${value} out of ${safeMax.value}.`
}

function handleClear() {
  status.value = 'Rating cleared. Choose a new rating when you are ready.'
}
</script>

<template>
  <section class="w-full max-w-3xl overflow-hidden rounded-[30px] border border-black/10 bg-[#f7f3e9] text-[#1d211b] shadow-[0_30px_90px_-50px_rgba(38,48,30,0.45)]">
    <div class="grid sm:grid-cols-[0.82fr_1.18fr]">
      <div class="relative overflow-hidden bg-[#20251d] p-6 text-white sm:p-8">
        <div class="absolute -right-12 -top-14 size-40 rounded-full border-[28px] border-[var(--registry-accent,#d7ff5f)] opacity-10" aria-hidden="true" />
        <p class="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--registry-accent,#d7ff5f)]">Review summary</p>
        <div class="relative mt-8 flex items-end gap-2">
          <span class="text-6xl font-semibold leading-none tracking-[-0.08em]">{{ average }}</span>
          <span class="mb-1 text-sm font-medium text-white/40">/ {{ safeMax }}</span>
        </div>
        <div class="relative mt-5 flex flex-wrap gap-1" aria-hidden="true">
          <svg v-for="value in safeMax" :key="value" viewBox="0 0 24 24" class="size-4 fill-[var(--registry-accent,#d7ff5f)] stroke-[var(--registry-accent,#d7ff5f)] stroke-[1.7]"><path stroke-linecap="round" stroke-linejoin="round" d="m12 2.75 2.84 5.76 6.36.92-4.6 4.49 1.08 6.33L12 17.26l-5.68 2.99 1.08-6.33-4.6-4.49 6.36-.92L12 2.75Z" /></svg>
        </div>
        <p class="relative mt-3 text-xs leading-5 text-white/50">From 1,284 verified stays</p>
        <div class="relative mt-8 border-t border-white/10 pt-5">
          <div class="flex items-center justify-between text-[11px] font-semibold"><span>Would return</span><span class="tabular-nums text-[var(--registry-accent,#d7ff5f)]">94%</span></div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full w-[94%] rounded-full bg-[var(--registry-accent,#d7ff5f)]" /></div>
        </div>
      </div>

      <div class="flex min-w-0 flex-col justify-between p-6 sm:p-8">
        <div>
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
            <span class="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Verified booking
          </div>
          <h3 class="mt-4 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">How was your stay?</h3>
          <p class="mt-2 max-w-sm text-xs leading-5 text-black/45">Your rating helps future guests choose with confidence.</p>
        </div>

        <div class="mt-8 rounded-2xl border border-black/8 bg-white/70 p-4 shadow-[0_18px_40px_-32px_rgba(35,42,28,0.5)] sm:p-5">
          <AnimatedRating
            v-model="rating"
            class="w-full"
            label="Overall experience"
            :max="max"
            :duration="duration"
            :clearable="clearable"
            :disabled="disabled"
            :show-value="showValue"
            @select="handleSelect"
            @clear="handleClear"
          />
        </div>

        <p data-testid="animated-rating-status" class="mt-5 min-h-5 text-xs leading-5 text-black/40" role="status" aria-live="polite">{{ status }}</p>
      </div>
    </div>
  </section>
</template>
