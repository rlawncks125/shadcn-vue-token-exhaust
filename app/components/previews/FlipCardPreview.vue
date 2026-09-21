<script setup lang="ts">
import { computed, ref } from 'vue'
import FlipCard, { type FlipCardAxis } from '#registry/default/flip-card/FlipCard.vue'

const props = withDefaults(defineProps<{
  axis?: FlipCardAxis
  duration?: number
  perspective?: number
  disabled?: boolean
}>(), {
  axis: 'y',
  duration: 650,
  perspective: 1100,
  disabled: false,
})

const flipped = ref(false)
const status = ref('Front of card shown')
const stateLabel = computed(() => flipped.value ? 'back' : 'front')

function handleChange(next: boolean) {
  status.value = next ? 'Travel details shown' : 'Front of card shown'
}
</script>

<template>
  <section
    data-testid="flip-card-preview"
    class="relative flex min-h-[540px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#ddd7ca] px-4 py-12 text-[#1e211d] sm:min-h-[640px] sm:px-8"
  >
    <div class="pointer-events-none absolute inset-0 opacity-65" aria-hidden="true">
      <div class="absolute -left-24 top-8 size-72 rounded-full border border-[#766d60]/20" />
      <div class="absolute -left-8 top-24 size-44 rounded-full border border-[#766d60]/20" />
      <div class="absolute -right-20 -bottom-24 size-80 rounded-full bg-[#c9744a]/20 blur-3xl" />
      <svg class="absolute inset-0 size-full text-[#625b50]/10" viewBox="0 0 900 640" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M-30 438C91 374 164 468 286 405s187-181 317-120 185 25 328-68" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 11" />
        <path d="M40 82c148 51 238 8 339 71s165 44 282-10 199-5 273 37" stroke="currentColor" />
      </svg>
    </div>

    <div class="relative w-full max-w-[520px]">
      <header class="mb-5 flex items-end justify-between gap-5 px-1">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#655e53]/65">Field Notes Society</p>
          <h2 class="mt-1.5 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Member travel pass</h2>
        </div>
        <div class="text-right">
          <p class="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#655e53]/55">Showing</p>
          <p data-testid="flip-card-state" class="mt-1 font-mono text-xs font-bold uppercase tracking-[0.12em]">{{ stateLabel }}</p>
        </div>
      </header>

      <FlipCard
        v-model="flipped"
        data-testid="flip-card"
        class="rounded-[26px] text-[#f5eedf] shadow-[0_30px_80px_-38px_rgba(54,39,31,0.72)] disabled:opacity-60"
        :axis="props.axis"
        :duration="props.duration"
        :perspective="props.perspective"
        :disabled="props.disabled"
        :aria-label="flipped ? 'Show front of travel membership card' : 'Show travel membership details'"
        @change="handleChange"
      >
        <template #front>
          <article data-testid="flip-card-front" class="relative flex min-h-[330px] flex-col overflow-hidden rounded-[26px] border border-white/15 bg-[#25362f] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:min-h-[350px] sm:p-8">
            <div class="absolute -right-16 -top-20 size-64 rounded-full border-[38px] border-[#d66e43] opacity-90" aria-hidden="true" />
            <div class="absolute -bottom-24 right-10 size-56 rounded-full border border-white/10" aria-hidden="true" />
            <svg class="absolute bottom-0 left-0 h-40 w-full text-[#f0d8b4]/10" viewBox="0 0 520 180" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M-10 157c52-82 85-58 130-91 49-37 73 25 122 1 47-23 76-76 126-49 52 28 85 17 164-4" stroke="currentColor" stroke-width="2" />
              <path d="M-9 171c59-77 93-48 135-81 48-38 74 27 122 3 47-24 75-73 124-47 53 28 87 16 159-6" stroke="currentColor" />
            </svg>

            <div class="relative flex items-start justify-between gap-6">
              <div class="grid size-11 place-items-center rounded-full border border-[#f5eedf]/35 font-serif text-lg italic">F</div>
              <div class="mr-12 text-right sm:mr-16">
                <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5eedf]/45">Expedition series</p>
                <p class="mt-1 font-mono text-xs tracking-[0.08em]">No. 0427</p>
              </div>
            </div>

            <div class="relative mt-auto pt-20">
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e99a6d]">Roaming member / 2026</p>
              <h3 class="mt-3 max-w-[330px] text-3xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-[40px]">The long way<br>is the point.</h3>
              <div class="mt-7 flex items-center justify-between gap-4 border-t border-white/15 pt-4 text-[10px] uppercase tracking-[0.14em] text-[#f5eedf]/55">
                <span>Mara Ellison</span>
                <span class="font-mono">FNS / AWAY</span>
              </div>
            </div>
          </article>
        </template>

        <template #back>
          <article data-testid="flip-card-back" class="relative flex min-h-[330px] flex-col overflow-hidden rounded-[26px] border border-black/10 bg-[#f3ead8] p-6 text-[#24332d] shadow-[inset_0_1px_0_white] sm:min-h-[350px] sm:p-8">
            <div class="absolute right-0 top-0 h-full w-3 bg-[#d66e43]" aria-hidden="true" />
            <div class="flex items-start justify-between gap-5 border-b border-[#24332d]/15 pb-5">
              <div>
                <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#24332d]/45">Next field trip</p>
                <h3 class="mt-1.5 text-2xl font-semibold tracking-[-0.045em]">Lisbon to Porto</h3>
              </div>
              <span class="rounded-full bg-[#24332d] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#f3ead8]">Confirmed</span>
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-6 sm:gap-5">
              <div>
                <p class="font-mono text-3xl font-bold tracking-[-0.07em]">LIS</p>
                <p class="mt-1 text-[10px] text-[#24332d]/50">08:20 / May 18</p>
              </div>
              <div class="flex items-center gap-1.5 text-[#d66e43]" aria-hidden="true">
                <span class="size-1.5 rounded-full bg-current" />
                <span class="h-px w-7 bg-current sm:w-12" />
                <svg class="size-4 fill-current" viewBox="0 0 20 20"><path d="m18 9-6.7-6.1-1.6.5 3.7 5.1-6.5-.8-2-2-1.2.4 1.1 3.3-2.7.9.4 1.2 2.9-.1.9 3.4 1.3-.4.4-2.8 6.4-2.2-1.1 6.2 1.6-.5L18 11Z" /></svg>
              </div>
              <div class="text-right">
                <p class="font-mono text-3xl font-bold tracking-[-0.07em]">OPO</p>
                <p class="mt-1 text-[10px] text-[#24332d]/50">11:05 / May 18</p>
              </div>
            </div>

            <div class="mt-auto flex items-end justify-between gap-5 rounded-2xl border border-[#24332d]/10 bg-white/35 p-4">
              <div>
                <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-[#24332d]/40">Member privileges</p>
                <p class="mt-2 max-w-[255px] text-xs leading-5 text-[#24332d]/70">Lounge access, one cabin bag, and a local field guide on arrival.</p>
              </div>
              <svg class="size-14 shrink-0 text-[#24332d]" viewBox="0 0 56 56" fill="currentColor" aria-label="Member code">
                <path d="M2 2h16v16H2zm4 4v8h8V6zM38 2h16v16H38zm4 4v8h8V6zM2 38h16v16H2zm4 4v8h8v-8zM24 2h6v6h-6zm6 8h6v8h-6zm-8 10h8v6h-8zm12 2h6v8h-6zm8 0h12v6H42zM22 30h6v8h-6zm8 2h6v6h-6zm10 0h14v6H40zM22 42h8v12h-8zm10-2h8v6h-8zm10 0h6v8h-6zm8 2h4v12h-4zm-16 8h12v4H34z" />
              </svg>
            </div>
          </article>
        </template>
      </FlipCard>

      <div class="mt-5 flex items-center justify-between gap-4 px-1 text-[11px] text-[#554f47]/65">
        <p data-testid="flip-card-status" role="status" aria-live="polite">{{ props.disabled ? 'Card interaction disabled' : status }}</p>
        <p class="hidden text-right sm:block">Click or press Space / Enter to turn the card</p>
      </div>
    </div>
  </section>
</template>
