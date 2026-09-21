<script setup lang="ts">
import { ref } from 'vue'
import InteractiveHoverButton from '#registry/default/interactive-hover-button/InteractiveHoverButton.vue'
withDefaults(defineProps<{ label?: string, accent?: string, duration?: number, disabled?: boolean, loading?: boolean }>(), { label: 'Explore components', accent: '#d9ff57', duration: 300, disabled: false, loading: false })
const clicks = ref(0)
</script>

<template>
  <section data-testid="interactive-hover-button-preview" class="relative flex min-h-[500px] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[30px] border border-black/10 bg-[#e7e3d7] p-6 sm:min-h-[560px]">
    <div class="absolute -right-20 -top-20 size-72 rounded-full border-[44px] border-[#e4633f]/10" />
    <div class="relative text-center"><p class="mb-6 text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Pointer · touch · keyboard</p><InteractiveHoverButton :label="label" :accent="accent" :duration="duration" :disabled="disabled" :loading="loading" @click="clicks++" /><p data-testid="interactive-hover-button-status" class="mt-5 text-[10px] text-black/42" role="status">{{ clicks ? `Activated ${clicks} times.` : 'Press, hover, or focus the action.' }}</p></div>
  </section>
</template>
