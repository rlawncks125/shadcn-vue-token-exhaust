<script setup lang="ts">
import { ref } from 'vue'
import SplitTextReveal from '../../../registry/default/split-text-reveal/SplitTextReveal.vue'

const props = withDefaults(defineProps<{
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  stagger?: number
  disabled?: boolean
}>(), {
  direction: 'up',
  duration: 560,
  stagger: 34,
  disabled: false,
})

const version = ref(0)
const completed = ref(0)
</script>

<template>
  <div class="flex min-h-[420px] w-full max-w-2xl flex-col justify-between overflow-hidden rounded-[2rem] bg-[#171814] p-7 text-white sm:p-10">
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Editorial motion</span>
      <button type="button" class="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white" @click="version++">Replay</button>
    </div>
    <div>
      <SplitTextReveal :key="version" text="Motion, with meaning." as="h3" :direction="props.direction" :duration="props.duration" :stagger="props.stagger" :disabled="props.disabled" class="max-w-xl text-5xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-7xl" @complete="completed++" />
      <p class="mt-7 max-w-md text-sm leading-6 text-white/45">Each grapheme rises through its own mask, preserving readable text for assistive technology and reduced-motion preferences.</p>
    </div>
    <p data-testid="split-status" class="text-[10px] uppercase tracking-[0.16em] text-white/25">{{ completed }} sequences completed</p>
  </div>
</template>
