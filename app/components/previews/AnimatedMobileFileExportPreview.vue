<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileFileExport from '#registry/default/animated-mobile-file-export/AnimatedMobileFileExport.vue'
withDefaults(defineProps<{ fallbackDownload?: boolean, duration?: number, disabled?: boolean }>(), { fallbackDownload: true, duration: 260, disabled: false })
const status = ref('Tap Save to use the real file picker or download fallback.')
const csv = 'time,latitude,longitude,note\n08:30,37.7749,-122.4194,North marker\n08:48,37.7755,-122.4181,Tide pool\n'
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#d7c6b7] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Route complete</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Take your data with you.</h3></div><AnimatedMobileFileExport :content="csv" filename="coastal-route.csv" mime-type="text/csv" extension=".csv" title="Export route log" :fallback-download="fallbackDownload" :duration="duration" :disabled="disabled" @saved="name => status = `${name} saved.`" @download="name => status = `${name} download started.`" @cancel="status = 'File picker cancelled.'" @unsupported="status = 'File export is unavailable.'" @error="message => status = message" /><p data-testid="file-export-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
