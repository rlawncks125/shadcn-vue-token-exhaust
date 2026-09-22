<script setup lang="ts">
import { ref } from 'vue'
import AnimatedSlideToConfirm from '#registry/default/animated-slide-to-confirm/AnimatedSlideToConfirm.vue'

withDefaults(defineProps<{ threshold?: number, duration?: number, resetAfter?: number, tone?: 'dark' | 'success' | 'danger', haptic?: boolean, loading?: boolean, disabled?: boolean }>(), { threshold: 0.82, duration: 260, resetAfter: 0, tone: 'dark', haptic: false, loading: false, disabled: false })
const confirmed = ref(false)
const status = ref('Slide the handle to publish.')
</script>

<template>
  <section data-testid="animated-slide-to-confirm-preview" class="grid min-h-[560px] w-full max-w-[760px] place-items-center overflow-hidden rounded-[30px] border border-black/10 bg-[#ddd7c9] p-5 sm:p-9">
    <div class="w-full max-w-sm rounded-[28px] bg-[#f7f3e8] p-5 shadow-[0_26px_70px_-40px_rgba(0,0,0,.5)]">
      <p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Publish field log</p>
      <h3 class="mt-3 text-3xl font-semibold tracking-[-.055em]">North coast, low tide.</h3>
      <div class="my-6 grid grid-cols-3 gap-2"><span class="h-20 rounded-[16px] bg-[#df7650]" /><span class="h-20 rounded-[16px] bg-[#668879]" /><span class="h-20 rounded-[16px] bg-[#e5bd55]" /></div>
      <AnimatedSlideToConfirm v-model="confirmed" label="Slide to publish" confirmed-label="Field log published" :threshold="threshold" :duration="duration" :reset-after="resetAfter" :tone="tone" :haptic="haptic" :loading="loading" :disabled="disabled" @confirm="status = 'Field log published.'" @reset="status = 'Confirmation reset.'" />
      <p data-testid="slide-confirm-status" class="mt-4 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
      <button v-if="confirmed && !resetAfter" type="button" class="mt-2 w-full text-center text-[10px] font-semibold text-black/40" @click="confirmed = false">Reset</button>
    </div>
  </section>
</template>
