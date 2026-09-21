<script setup lang="ts">
import SpotlightCard from '#registry/default/spotlight-card/SpotlightCard.vue'
withDefaults(defineProps<{ title?: string, glow?: string, radius?: number, intensity?: number, duration?: number, interactive?: boolean, disabled?: boolean }>(), {
  title: 'Built for deliberate interfaces.', glow: '#d9ff57', radius: 300, intensity: 0.28, duration: 420, interactive: true, disabled: false,
})
</script>

<template>
  <section data-testid="spotlight-card-preview" class="relative flex min-h-[500px] w-full max-w-[820px] items-center justify-center overflow-hidden rounded-[30px] border border-black/10 bg-[#dad7cc] p-6 sm:min-h-[560px] sm:p-12">
    <div class="absolute inset-0 opacity-20 [background-image:linear-gradient(#17181420_1px,transparent_1px),linear-gradient(90deg,#17181420_1px,transparent_1px)] [background-size:30px_30px]" />
    <SpotlightCard eyebrow="Touch / focus / pointer" :title="title" description="The radial light follows precise pointers, responds to touch presses, and centers itself for keyboard focus." :glow="glow" :radius="radius" :intensity="intensity" :duration="duration" :interactive="interactive" :disabled="disabled" />
  </section>
</template>
