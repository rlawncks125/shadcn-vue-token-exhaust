<script setup lang="ts">
import { ref } from 'vue'
import DirectionAwareCard from '../../../registry/default/direction-aware-card/DirectionAwareCard.vue'

withDefaults(defineProps<{
  duration?: number
  accent?: string
  disabled?: boolean
}>(), {
  duration: 420,
  accent: 'var(--registry-accent, #d9ff57)',
  disabled: false,
})

const direction = ref('Move through any edge')
const activations = ref(0)
</script>

<template>
  <div class="w-full max-w-lg">
    <DirectionAwareCard :duration="duration" :accent="accent" :disabled="disabled" label="Open Studio North case study" @enter="value => direction = `Entered from ${value}`" @leave="value => direction = `Left through ${value}`" @activate="activations++">
      <article class="flex min-h-80 flex-col justify-between p-7 sm:p-9">
        <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-current/45">
          <span>Case study / 04</span>
          <span>2026</span>
        </div>
        <div>
          <p class="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-current/45">Studio North</p>
          <h3 class="max-w-sm text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">A system that meets you halfway.</h3>
          <p class="mt-5 max-w-sm text-sm leading-6 text-current/55">Enter from every edge to reveal a spatial response that preserves direction.</p>
        </div>
      </article>
      <template #overlay="{ direction: current }">
        <span class="absolute right-6 top-6 rounded-full border border-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">{{ current }}</span>
      </template>
    </DirectionAwareCard>
    <div class="mt-4 flex justify-between px-2 text-xs text-black/40"><span data-testid="direction-state">{{ direction }}</span><span>{{ activations }} opens</span></div>
  </div>
</template>
