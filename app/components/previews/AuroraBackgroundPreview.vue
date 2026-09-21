<script setup lang="ts">
import AuroraBackground from '#registry/default/aurora-background/AuroraBackground.vue'
withDefaults(defineProps<{ duration?: number; intensity?: number; paused?: boolean; colors?: [string, string, string] }>(), { duration: 16, intensity: 0.6, paused: false })
</script>

<template>
  <AuroraBackground :duration="duration" :intensity="intensity" :paused="paused" :colors="colors" class="w-full rounded-3xl">
    <div class="px-7 py-16 text-center">
      <p class="text-[10px] uppercase tracking-[0.16em] text-white/55">Light in motion</p>
      <h3 class="mt-5 text-3xl font-semibold tracking-[-0.04em]">Beyond the ordinary.</h3>
      <p class="mt-4 text-xs leading-6 text-white/65">A quiet atmosphere for your next idea.</p>
    </div>
  </AuroraBackground>
</template>
