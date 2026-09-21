<script setup lang="ts">
import GradientText from '../../../registry/default/gradient-text/GradientText.vue'
withDefaults(defineProps<{ duration?: number; direction?: 'horizontal' | 'vertical' | 'diagonal'; reverse?: boolean; paused?: boolean; pauseOnHover?: boolean; colors?: string[] }>(), { duration: 5000, direction: 'horizontal', reverse: false, paused: false, pauseOnHover: true, colors: () => ['#a78bfa', '#38bdf8', 'var(--registry-accent, #d9ff57)', '#fb7185'] })
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#11120f] p-8 text-white sm:min-h-[560px]">
    <div class="max-w-3xl text-center"><p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">Spectrum study</p><GradientText class="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.065em] sm:text-7xl" text="Ideas change color when they move." :colors="colors" :duration="duration" :direction="direction" :reverse="reverse" :paused="paused" :pause-on-hover="pauseOnHover" /><p class="mx-auto mt-8 max-w-md text-sm leading-6 text-white/35">Hover the headline to hold one moment in the spectrum.</p></div>
  </div>
</template>
