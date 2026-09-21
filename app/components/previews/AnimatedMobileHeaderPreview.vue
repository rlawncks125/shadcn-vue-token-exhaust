<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileHeader, { type AnimatedMobileHeaderState } from '#registry/default/animated-mobile-header/AnimatedMobileHeader.vue'

withDefaults(defineProps<{
  mode?: 'hide' | 'compact'
  duration?: number
  collapseAt?: number
  showProgress?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  mode: 'hide',
  duration: 260,
  collapseAt: 32,
  showProgress: true,
  safeArea: true,
  disabled: false,
})

const state = ref<AnimatedMobileHeaderState>('expanded')
const status = ref('Scroll down to collapse the header, then scroll up to reveal it.')

const entries = [
  { number: '01', title: 'Clay studies', detail: 'Material archive / 12 images', tone: 'bg-[#d8a27f]' },
  { number: '02', title: 'Tidal systems', detail: 'Field notes / 8 entries', tone: 'bg-[#74a4bc]' },
  { number: '03', title: 'Night index', detail: 'Research log / 16 entries', tone: 'bg-[#252b24]' },
  { number: '04', title: 'Type specimens', detail: 'Reference set / 24 images', tone: 'bg-[#c8cf89]' },
  { number: '05', title: 'Transit sketches', detail: 'Notebook / 31 pages', tone: 'bg-[#ef8354]' },
  { number: '06', title: 'Sound markers', detail: 'Audio archive / 9 clips', tone: 'bg-[#8c7aa9]' },
]

function onStateChange(next: AnimatedMobileHeaderState, previous: AnimatedMobileHeaderState) {
  status.value = `Header changed from ${previous} to ${next}.`
}
</script>

<template>
  <div class="w-full max-w-[390px] rounded-[34px] border border-black/10 bg-[#171814] p-2 shadow-[0_30px_80px_-35px_#000a]">
    <AnimatedMobileHeader
      v-model="state"
      title="Field Library"
      subtitle="North studio / Archive"
      :mode="mode"
      :duration="duration"
      :collapse-at="collapseAt"
      :show-progress="showProgress"
      :safe-area="safeArea"
      :disabled="disabled"
      height="min(620px, 78vh)"
      @state-change="onStateChange"
      @leading="status = 'Back action triggered.'"
      @trailing="status = 'More options triggered.'"
    >
      <div class="px-4 pb-5 pt-4">
        <div class="mb-5 rounded-[22px] bg-[#d9ff57] p-4">
          <p class="text-[9px] font-black uppercase tracking-[.18em] text-black/45">Pinned collection</p>
          <p class="mt-2 text-xl font-semibold leading-tight tracking-[-0.04em]">Objects that change after weather</p>
          <p class="mt-3 text-[10px] leading-4 text-black/50">Scroll this archive. The app bar yields to the content and returns when direction changes.</p>
        </div>

        <ul class="grid gap-2.5">
          <li v-for="entry in entries" :key="entry.number" class="flex items-center gap-3 rounded-[18px] border border-black/[.07] bg-white/75 p-3">
            <span class="grid size-12 shrink-0 place-items-center rounded-[14px] text-[10px] font-black text-white" :class="entry.tone">{{ entry.number }}</span>
            <span class="min-w-0 flex-1">
              <strong class="block truncate text-[12px] font-semibold">{{ entry.title }}</strong>
              <span class="mt-0.5 block truncate text-[10px] text-black/45">{{ entry.detail }}</span>
            </span>
            <span class="text-sm text-black/30" aria-hidden="true">&rarr;</span>
          </li>
        </ul>

        <div class="mt-5 rounded-[22px] bg-[#171814] p-5 text-white">
          <p class="text-[9px] font-black uppercase tracking-[.18em] text-white/40">End of index</p>
          <p class="mt-2 text-lg font-semibold tracking-[-0.03em]">6 collections reviewed</p>
        </div>
      </div>
    </AnimatedMobileHeader>
    <p data-testid="mobile-header-preview-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </div>
</template>
