<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileWakeLock from '#registry/default/animated-mobile-wake-lock/AnimatedMobileWakeLock.vue'
withDefaults(defineProps<{ autoReacquire?: boolean, duration?: number, disabled?: boolean }>(), { autoReacquire: true, duration: 280, disabled: false })
const enabled = ref(false)
const status = ref('Tap the control to request a real screen wake lock.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#c7d0c4] p-5 sm:p-9">
    <div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Live field session</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Route recorder</h3><p class="mt-2 text-xs text-black/45">42 min · 6.8 km · recording</p></div>
      <AnimatedMobileWakeLock v-model="enabled" :auto-reacquire="autoReacquire" :duration="duration" :disabled="disabled" @acquired="status = 'Wake lock acquired.'" @release="reason => status = `Wake lock released: ${reason}.`" @unsupported="status = 'Wake Lock API is unavailable.'" @error="message => status = message" />
      <p data-testid="wake-lock-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
    </div>
  </section>
</template>
