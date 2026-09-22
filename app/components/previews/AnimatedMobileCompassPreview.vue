<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileCompass from '#registry/default/animated-mobile-compass/AnimatedMobileCompass.vue'
withDefaults(defineProps<{ heading?: number, targetBearing?: number, accuracy?: number, arrivalThreshold?: number, duration?: number, active?: boolean, disabled?: boolean }>(), { heading: 32, targetBearing: 118, accuracy: 6, arrivalThreshold: 8, duration: 420, active: true, disabled: false })
const status = ref('Compass ready.')
</script>
<template>
  <section class="grid min-h-[600px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#b7c6bb] p-5 sm:p-9">
    <div class="w-full max-w-sm"><div class="mb-4 flex items-center justify-between px-2"><div><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Field route 04</p><p class="mt-1 text-sm font-semibold">Tide pools · North marker</p></div><span class="rounded-full bg-white/45 px-3 py-1 text-[9px] font-bold">LIVE</span></div>
      <AnimatedMobileCompass target-label="North marker" distance="240 m" :heading="heading" :target-bearing="targetBearing" :accuracy="accuracy" :arrival-threshold="arrivalThreshold" :duration="duration" :active="active" :disabled="disabled" @calibrate="status = 'Calibration requested.'" @select="status = 'Destination selected.'" />
      <p data-testid="compass-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
    </div>
  </section>
</template>
