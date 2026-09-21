<script setup lang="ts">
import { ref } from 'vue'
import GuidedTour, { type GuidedTourStep } from '../../../registry/default/guided-tour/GuidedTour.vue'

withDefaults(defineProps<{
  duration?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}>(), {
  duration: 280,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const open = ref(false)
const step = ref(0)
const status = ref('Tour ready')

const steps: GuidedTourStep[] = [
  {
    id: 'pulse',
    title: 'Your weekly pulse',
    description: 'Start with the headline numbers. Revenue, conversion, and active accounts update as new events arrive.',
    target: '[data-tour="pulse"]',
    placement: 'bottom',
  },
  {
    id: 'signal',
    title: 'Follow the signal',
    description: 'The live curve compares this week against your rolling baseline, making unusual movement easy to spot.',
    target: '[data-tour="signal"]',
    placement: 'right',
  },
  {
    id: 'channels',
    title: 'See what is driving growth',
    description: 'Channel contribution separates durable acquisition from short-lived spikes before you allocate budget.',
    target: '[data-tour="channels"]',
    placement: 'left',
  },
  {
    id: 'range',
    title: 'Tune the reporting window',
    description: 'Change the range whenever you need a tighter diagnostic view. Your dashboard stays in context.',
    target: '[data-tour="range"]',
    placement: 'bottom',
  },
]

function handleOpen(index: number, activeStep: GuidedTourStep): void {
  status.value = `Tour opened: ${activeStep.title} (${index + 1}/${steps.length})`
}

function handleChange(index: number, activeStep: GuidedTourStep): void {
  status.value = `Viewing ${index + 1} of ${steps.length}: ${activeStep.title}`
}

function handleClose(reason: string): void {
  status.value = `Tour closed (${reason})`
}
</script>

<template>
  <div data-guided-tour-root class="w-full overflow-hidden rounded-[28px] border border-[#dfe3d8] bg-[#f3f5ed] text-[#172016] shadow-[0_24px_70px_rgb(31_41_26/0.10)]">
    <header class="flex flex-col gap-5 border-b border-[#dfe3d8] bg-[#fbfcf7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div class="flex items-center gap-3">
        <div class="grid size-10 place-items-center rounded-xl bg-[#1d271a] text-[#c7f57d] shadow-sm">
          <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 16l4-5 4 3 7-9" />
            <path d="M16 5h3v3" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-bold tracking-[-0.02em]">Northstar</p>
          <p class="text-[11px] text-[#778072]">Growth analytics</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button data-tour="range" type="button" class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8ddd2] bg-white px-3.5 text-xs font-semibold text-[#4f5b4b] shadow-sm outline-none transition-colors hover:border-[#b9c2b0] focus-visible:ring-4 focus-visible:ring-[#a8d85d]/25">
          Last 30 days
          <svg viewBox="0 0 20 20" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
        </button>
        <GuidedTour
          v-model="open"
          v-model:step="step"
          :steps="steps"
          label="Open analytics tour"
          :duration="duration"
          :close-on-backdrop="closeOnBackdrop"
          :lock-scroll="lockScroll"
          :disabled="disabled"
          @open="handleOpen"
          @change="handleChange"
          @skip="status = 'Tour skipped'"
          @finish="status = 'Tour complete'"
          @close="handleClose"
        >
          <template #trigger>
            <span class="flex items-center gap-2">
              <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="10" cy="10" r="7" /><path d="m8.5 7 4 3-4 3V7Z" />
              </svg>
              Take a tour
            </span>
          </template>
        </GuidedTour>
      </div>
    </header>

    <main class="p-5 sm:p-7">
      <div data-tour="pulse" class="grid gap-3 sm:grid-cols-3">
        <article class="rounded-2xl border border-[#dde2d7] bg-white p-4 shadow-[0_8px_24px_rgb(34_49_27/0.05)]">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8576]">Net revenue</p>
            <span class="rounded-full bg-[#eaf7d5] px-2 py-1 text-[10px] font-bold text-[#4e711f]">+18.4%</span>
          </div>
          <p class="mt-5 text-2xl font-bold tracking-[-0.04em]">$128.4k</p>
          <p class="mt-1 text-[11px] text-[#8a9385]">vs. $108.5k last period</p>
        </article>
        <article class="rounded-2xl border border-[#dde2d7] bg-white p-4 shadow-[0_8px_24px_rgb(34_49_27/0.05)]">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8576]">Conversion</p>
            <span class="rounded-full bg-[#eaf7d5] px-2 py-1 text-[10px] font-bold text-[#4e711f]">+2.1%</span>
          </div>
          <p class="mt-5 text-2xl font-bold tracking-[-0.04em]">7.82%</p>
          <p class="mt-1 text-[11px] text-[#8a9385]">4,812 qualified sessions</p>
        </article>
        <article class="rounded-2xl border border-[#dde2d7] bg-white p-4 shadow-[0_8px_24px_rgb(34_49_27/0.05)]">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8576]">Active accounts</p>
            <span class="rounded-full bg-[#fff0ce] px-2 py-1 text-[10px] font-bold text-[#91631a]">+6.8%</span>
          </div>
          <p class="mt-5 text-2xl font-bold tracking-[-0.04em]">2,941</p>
          <p class="mt-1 text-[11px] text-[#8a9385]">187 joined this month</p>
        </article>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-[1.55fr_0.8fr]">
        <article data-tour="signal" class="rounded-2xl border border-[#dde2d7] bg-white p-5 shadow-[0_8px_24px_rgb(34_49_27/0.05)]">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-bold tracking-[-0.02em]">Revenue signal</p>
              <p class="mt-1 text-[11px] text-[#899384]">Daily recurring revenue</p>
            </div>
            <span class="flex items-center gap-1.5 text-[10px] font-semibold text-[#667060]"><span class="size-2 rounded-full bg-[#90c83e]" /> Current</span>
          </div>
          <div class="relative mt-7 h-36 overflow-hidden">
            <div class="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
              <span v-for="line in 5" :key="line" class="border-t border-dashed border-[#e7eae3]" />
            </div>
            <svg viewBox="0 0 620 150" class="absolute inset-0 size-full" preserveAspectRatio="none" aria-label="Revenue rose steadily across the month">
              <defs>
                <linearGradient id="guided-tour-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bd146" stop-opacity=".32" /><stop offset="1" stop-color="#9bd146" stop-opacity="0" /></linearGradient>
              </defs>
              <path d="M0 124 C54 118 70 104 116 108 S181 91 225 97 S289 74 338 81 S403 50 450 58 S525 37 620 21 V150 H0Z" fill="url(#guided-tour-chart-fill)" />
              <path d="M0 124 C54 118 70 104 116 108 S181 91 225 97 S289 74 338 81 S403 50 450 58 S525 37 620 21" fill="none" stroke="#7db72d" stroke-width="3" stroke-linecap="round" />
              <circle cx="450" cy="58" r="5" fill="#fff" stroke="#7db72d" stroke-width="3" />
            </svg>
          </div>
          <div class="mt-2 flex justify-between text-[9px] font-medium uppercase tracking-[0.1em] text-[#9aa294]">
            <span>Aug 22</span><span>Aug 29</span><span>Sep 05</span><span>Sep 12</span><span>Sep 19</span>
          </div>
        </article>

        <article data-tour="channels" class="rounded-2xl border border-[#293225] bg-[#1c2519] p-5 text-white shadow-[0_12px_30px_rgb(28_37_25/0.16)]">
          <p class="text-sm font-bold tracking-[-0.02em]">Channel mix</p>
          <p class="mt-1 text-[11px] text-white/40">Share of converted revenue</p>
          <div class="mt-6 space-y-5">
            <div v-for="channel in [{ name: 'Organic', value: 72 }, { name: 'Partner', value: 48 }, { name: 'Paid', value: 31 }]" :key="channel.name">
              <div class="mb-2 flex justify-between text-[11px]"><span class="font-medium text-white/70">{{ channel.name }}</span><span class="font-bold">{{ channel.value }}%</span></div>
              <div class="h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-[var(--registry-accent,#b7f36b)]" :style="{ width: `${channel.value}%` }" /></div>
            </div>
          </div>
          <div class="mt-7 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[10px] leading-5 text-white/45">Organic has held above 65% for six consecutive weeks.</div>
        </article>
      </div>
    </main>

    <footer class="flex items-center justify-between border-t border-[#dfe3d8] bg-[#eef1e8] px-5 py-3 sm:px-7">
      <p data-testid="guided-tour-status" class="text-[11px] font-medium text-[#697364]" aria-live="polite">{{ status }}</p>
      <span class="hidden items-center gap-1.5 text-[10px] text-[#8a9385] sm:flex"><span class="size-1.5 rounded-full bg-[#83b936]" /> Live data</span>
    </footer>
  </div>
</template>
