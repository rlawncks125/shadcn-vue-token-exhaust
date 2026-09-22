<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileLocationCheckIn from '#registry/default/animated-mobile-location-check-in/AnimatedMobileLocationCheckIn.vue'
withDefaults(defineProps<{ highAccuracy?: boolean, timeout?: number, maximumAge?: number, autoRequest?: boolean, duration?: number, disabled?: boolean }>(), { highAccuracy: true, timeout: 10000, maximumAge: 0, autoRequest: false, duration: 280, disabled: false })
const status = ref('Tap Use current location to request real coordinates.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#c2cec3] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Field log 042</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Mark this observation.</h3></div><AnimatedMobileLocationCheckIn :high-accuracy="highAccuracy" :timeout="timeout" :maximum-age="maximumAge" :auto-request="autoRequest" :duration="duration" :disabled="disabled" @located="value => status = `Located within ${Math.round(value.accuracy)} meters.`" @confirm="status = 'Location check-in confirmed.'" @denied="message => status = message" @error="message => status = message" /><p data-testid="location-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
