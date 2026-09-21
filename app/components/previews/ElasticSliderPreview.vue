<script setup lang="ts">
import { ref } from 'vue'
import ElasticSlider from '../../../registry/default/elastic-slider/ElasticSlider.vue'

withDefaults(defineProps<{ duration?: number; disabled?: boolean; showValue?: boolean }>(), { duration: 360, disabled: false, showValue: true })
const exposure = ref(68)
const contrast = ref(42)
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#dbe8ff] p-7 text-[#171814] sm:min-h-[560px] sm:p-10">
    <section class="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(42,70,120,0.15)] sm:p-9">
      <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Image calibration</p>
      <h3 class="mt-3 text-3xl font-semibold tracking-[-0.045em]">Tune the atmosphere.</h3>
      <div class="mt-12 space-y-10">
        <ElasticSlider v-model="exposure" label="Exposure" :duration="duration" :disabled="disabled" :show-value="showValue" :format-value="value => `${value}%`" />
        <ElasticSlider v-model="contrast" label="Contrast" :duration="duration" :disabled="disabled" :show-value="showValue" :format-value="value => `${value}%`" />
      </div>
      <p data-testid="slider-status" class="mt-8 border-t border-black/10 pt-5 text-xs text-black/40" aria-live="polite">Exposure {{ exposure }}%, contrast {{ contrast }}%.</p>
    </section>
  </div>
</template>
