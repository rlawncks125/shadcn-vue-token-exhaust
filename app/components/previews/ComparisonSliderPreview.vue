<script setup lang="ts">
import ComparisonSlider from '#registry/default/comparison-slider/ComparisonSlider.vue'
const model = defineModel<number>({ default: 52 })
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
</script>

<template>
  <ComparisonSlider v-model="model" :disabled="disabled" class="max-w-xl shadow-xl">
    <template #before><div class="grid place-items-center bg-[#ddd9cf] p-8 text-[#171814]"><div><p class="text-[10px] uppercase tracking-[0.15em] text-black/45">Raw idea</p><p class="mt-3 text-3xl font-semibold tracking-[-0.05em]">Structure</p></div></div></template>
    <template #after><div class="grid place-items-center bg-[#171814] p-8 text-white"><div><p class="text-[10px] uppercase tracking-[0.15em] text-brand">Refined system</p><p class="mt-3 text-3xl font-semibold tracking-[-0.05em]">Expression</p></div></div></template>
  </ComparisonSlider>
</template>
