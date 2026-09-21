<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedSegmentedControl, { type AnimatedSegmentedControlItem } from '#registry/default/animated-segmented-control/AnimatedSegmentedControl.vue'

const props = withDefaults(defineProps<{ duration?: number, fullWidth?: boolean, disabled?: boolean }>(), {
  duration: 260,
  fullWidth: true,
  disabled: false,
})
const selected = ref('nearby')
const items: AnimatedSegmentedControlItem[] = [
  { id: 'nearby', label: 'Nearby', icon: 'N', badge: 8 },
  { id: 'saved', label: 'Saved', icon: 'S', badge: 3 },
  { id: 'visited', label: 'Visited', icon: 'V' },
]
const copy = computed(() => ({
  nearby: ['Salt path', 'Forest cabin', 'Tidal pool'],
  saved: ['Old lighthouse', 'Hill studio', 'River room'],
  visited: ['North pier', 'Stone orchard', 'West inlet'],
}[selected.value] ?? []))
</script>

<template>
  <section data-testid="animated-segmented-control-preview" class="w-full max-w-[720px] rounded-[30px] border border-black/10 bg-[#e9e5da] p-5 text-[#1c1d1a] sm:p-9">
    <header class="mb-7 flex items-end justify-between gap-4">
      <div><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Field map</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.055em]">Places worth a pause.</h3></div>
      <span class="hidden rounded-full bg-[#d9ff57] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] sm:block">Offline ready</span>
    </header>
    <AnimatedSegmentedControl v-model="selected" :items="items" :duration="duration" :full-width="fullWidth" :disabled="disabled" label="Filter places" />
    <div class="mt-5 grid gap-2 sm:grid-cols-3">
      <article v-for="(place, index) in copy" :key="place" class="min-h-36 rounded-[20px] border border-black/[0.07] p-4" :class="index === 0 ? 'bg-[#1c1d1a] text-white' : 'bg-white/65'">
        <span class="text-[9px] font-bold opacity-45">0{{ index + 1 }}</span>
        <p class="mt-14 text-sm font-semibold tracking-[-.025em]">{{ place }}</p>
        <p class="mt-1 text-[10px] opacity-45">{{ selected === 'nearby' ? `${12 + index * 7} min away` : selected }}</p>
      </article>
    </div>
    <p data-testid="segmented-control-status" class="mt-4 text-center text-[10px] text-black/42" role="status" aria-live="polite">Showing {{ selected }} places.</p>
  </section>
</template>
