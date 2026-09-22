<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileNativeShare from '#registry/default/animated-mobile-native-share/AnimatedMobileNativeShare.vue'
withDefaults(defineProps<{ fallback?: 'clipboard' | 'none', duration?: number, disabled?: boolean }>(), { fallback: 'clipboard', duration: 240, disabled: false })
const status = ref('Tap Share now to open the real system share sheet.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#b9cac3] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Field note 042</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Share an observation.</h3></div><AnimatedMobileNativeShare title="Tide pool conditions" text="Low tide revealed a dense field of anemones near the north marker." url="https://example.com/field-notes/042" label="Send field note" :fallback="fallback" :duration="duration" :disabled="disabled" @shared="status = 'Field note shared.'" @copied="status = 'Field note copied.'" @cancel="status = 'Share sheet cancelled.'" @unsupported="status = 'Sharing and clipboard are unavailable.'" @error="message => status = message" /><p data-testid="native-share-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
