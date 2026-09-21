<script setup lang="ts">
import TiltCard from '#registry/default/tilt-card/TiltCard.vue'
withDefaults(defineProps<{ maxTilt?: number; glare?: boolean; disabled?: boolean }>(), { maxTilt: 10, glare: true, disabled: false })
</script>

<template>
  <TiltCard :max-tilt="maxTilt" :glare="glare" :disabled="disabled" class="w-[280px] rounded-[1.6rem] border border-black/10 bg-[#171814] p-6 text-white shadow-xl">
    <div class="flex items-center justify-between">
      <span class="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">Perspective</span>
      <span class="size-2 rounded-full bg-brand" />
    </div>
    <div class="mt-20">
      <p class="text-xl font-semibold tracking-[-0.04em]">Move with intention.</p>
      <p class="mt-2 text-xs leading-5 text-white/45">A tactile surface that responds without getting in the way.</p>
    </div>
  </TiltCard>
</template>
