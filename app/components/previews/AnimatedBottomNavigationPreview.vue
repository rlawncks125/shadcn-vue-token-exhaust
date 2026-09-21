<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedBottomNavigation, { type AnimatedBottomNavigationItem } from '#registry/default/animated-bottom-navigation/AnimatedBottomNavigation.vue'

const props = withDefaults(defineProps<{
  duration?: number
  hideLabels?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  duration: 320,
  hideLabels: false,
  safeArea: true,
  disabled: false,
})

const items: AnimatedBottomNavigationItem[] = [
  { value: 'home', label: 'Home' },
  { value: 'trips', label: 'Trips' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'alerts', label: 'Alerts', badge: 3 },
  { value: 'profile', label: 'Profile' },
]

const selected = ref('home')
const currentItem = computed(() => items.find(item => item.value === selected.value) ?? items[0]!)
const pageCopy = computed(() => ({
  home: ['Good morning, Mina.', 'Your next departure is in 12 days.'],
  trips: ['Three places, one plan.', 'Lisbon is ready for final details.'],
  wallet: ['Travel funds, in view.', 'Your monthly pace is right on target.'],
  alerts: ['A small heads-up.', 'Three updates need your attention.'],
  profile: ['Make the journey yours.', 'Preferences and documents are in one place.'],
}[selected.value] ?? ['', '']))
</script>

<template>
  <section
    class="w-full max-w-[820px] overflow-hidden rounded-[28px] border border-[#17211b]/10 bg-[#eef0e8] text-[#17211b] shadow-[0_38px_100px_-62px_rgba(23,33,27,0.85)] sm:rounded-[36px]"
    data-testid="animated-bottom-navigation-preview"
    :data-current="selected"
  >
    <header class="flex items-center justify-between px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-full bg-[#17211b] text-[10px] font-black tracking-[0.12em] text-[#d9ff57]">NR</span>
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#17211b]/45">North / Roam</p>
          <p class="mt-0.5 text-xs font-semibold">Travel account</p>
        </div>
      </div>
      <div class="rounded-full border border-[#17211b]/10 bg-white/55 px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#17211b]/55">
        Sep 20 / 09:42
      </div>
    </header>

    <main
      class="grid gap-4 px-4 pb-4 pt-3 sm:grid-cols-[1.08fr_.92fr] sm:gap-5 sm:px-7 sm:pb-6 sm:pt-5"
      data-testid="animated-bottom-navigation-panel"
      :data-current="selected"
    >
      <article class="relative min-h-[260px] overflow-hidden rounded-[26px] bg-[#17211b] p-6 text-white sm:min-h-[318px] sm:p-8">
        <div class="absolute -right-12 -top-14 size-44 rounded-full border-[28px] border-[#d9ff57]/10" aria-hidden="true" />
        <div class="relative flex h-full flex-col justify-between">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">Available to roam</p>
            <p class="mt-3 text-[42px] font-medium leading-none tracking-[-0.07em] sm:text-[52px]">$8,420<span class="text-white/25">.60</span></p>
            <div class="mt-4 flex items-center gap-2 text-[10px] text-white/55">
              <span class="rounded-full bg-[#d9ff57] px-2 py-1 font-bold text-[#17211b]">+4.8%</span>
              since last month
            </div>
          </div>
          <div class="mt-10">
            <p class="text-[9px] uppercase tracking-[0.2em] text-white/35">{{ currentItem.label }} view</p>
            <h2 class="mt-2 max-w-sm text-2xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-3xl">{{ pageCopy[0] }}</h2>
            <p class="mt-2 text-xs leading-5 text-white/50">{{ pageCopy[1] }}</p>
          </div>
        </div>
      </article>

      <div class="grid gap-4 sm:grid-rows-[1fr_auto]">
        <article class="overflow-hidden rounded-[26px] border border-[#17211b]/10 bg-[#f8f8f3] p-5 sm:p-6">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#17211b]/40">Next itinerary</p>
              <h3 class="mt-2 text-2xl font-semibold tracking-[-0.05em]">Lisbon</h3>
              <p class="mt-1 text-[11px] text-[#17211b]/45">Oct 02-08 / 6 nights</p>
            </div>
            <span class="grid size-10 place-items-center rounded-full bg-[#f1b89f] text-lg" aria-hidden="true">↗</span>
          </div>
          <div class="mt-7 flex items-end justify-between border-t border-[#17211b]/10 pt-4">
            <div class="flex -space-x-2" aria-label="Three travelers">
              <span class="grid size-7 place-items-center rounded-full border-2 border-[#f8f8f3] bg-[#b9d8ec] text-[8px] font-bold">MK</span>
              <span class="grid size-7 place-items-center rounded-full border-2 border-[#f8f8f3] bg-[#d9ff57] text-[8px] font-bold">JL</span>
              <span class="grid size-7 place-items-center rounded-full border-2 border-[#f8f8f3] bg-[#dfd7ca] text-[8px] font-bold">AR</span>
            </div>
            <p class="font-mono text-[9px] font-semibold text-[#17211b]/45">LIS / 12 DAYS</p>
          </div>
        </article>

        <article class="flex items-center justify-between rounded-[22px] bg-[#d9ff57] px-5 py-4 text-[#17211b] sm:px-6">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-[#17211b]/45">Daily travel budget</p>
            <p class="mt-1 text-lg font-semibold tracking-[-0.04em]">$124 <span class="text-xs font-medium text-[#17211b]/45">/ $160</span></p>
          </div>
          <div class="grid size-11 place-items-center rounded-full border border-[#17211b]/15 bg-white/35 text-[10px] font-bold">78%</div>
        </article>
      </div>
    </main>

    <footer class="border-t border-[#17211b]/10 bg-[#f8f8f3]/85 p-3 sm:p-4">
      <AnimatedBottomNavigation
        v-model="selected"
        :items="items"
        :duration="props.duration"
        :hide-labels="props.hideLabels"
        :safe-area="props.safeArea"
        :disabled="props.disabled"
        label="North Roam app navigation"
        class="mx-auto max-w-[620px]"
      >
        <template #icon="{ item }">
          <svg v-if="item.value === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3.5 10.5 8.5-7 8.5 7" /><path d="M5.5 9.2V21h13V9.2M9.5 21v-6h5v6" />
          </svg>
          <svg v-else-if="item.value === 'trips'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21 16-8-4V5.5a2 2 0 0 0-4 0V12l-6 4v2l6-2v3.5L7 21v1l4-1 4 1v-1l-2-1.5V16l8 2Z" />
          </svg>
          <svg v-else-if="item.value === 'wallet'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6.5h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h13" /><path d="M15 11h7v4h-7a2 2 0 0 1 0-4Z" />
          </svg>
          <svg v-else-if="item.value === 'alerts'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
          </svg>
        </template>
      </AnimatedBottomNavigation>
      <p
        class="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="animated-bottom-navigation-status"
      >Current section: {{ currentItem.label }}</p>
    </footer>
  </section>
</template>
