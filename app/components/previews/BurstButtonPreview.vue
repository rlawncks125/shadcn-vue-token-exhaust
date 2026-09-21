<script setup lang="ts">
import { ref } from 'vue'
import BurstButton from '../../../registry/default/burst-button/BurstButton.vue'

const props = withDefaults(defineProps<{
  particleCount?: number
  distance?: number
  duration?: number
  disabled?: boolean
  allowOverlap?: boolean
  colors?: string[]
}>(), {
  particleCount: 14,
  distance: 72,
  duration: 680,
  disabled: false,
  allowOverlap: false,
  colors: () => ['var(--registry-accent, #d9ff57)', '#8b5cf6', '#38bdf8', '#fb7185'],
})

const count = ref(0)
const message = ref('Trigger the action to launch a burst.')
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#171814] p-8 text-white sm:min-h-[560px]">
    <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Micro interaction</p>
    <h3 class="mt-3 text-center text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Make the moment visible.</h3>
    <div class="my-14">
      <BurstButton :particle-count="particleCount" :distance="distance" :duration="duration" :disabled="disabled" :allow-overlap="allowOverlap" :colors="colors" label="Launch celebration" @burst="count++" @complete="message = 'Burst animation completed.'">
        Celebrate · {{ count }}
      </BurstButton>
    </div>
    <p data-testid="burst-status" class="text-xs text-white/40" aria-live="polite">{{ message }}</p>
  </div>
</template>
