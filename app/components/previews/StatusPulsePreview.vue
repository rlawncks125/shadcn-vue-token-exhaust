<script setup lang="ts">
import StatusPulse from '#registry/default/status-pulse/StatusPulse.vue'
withDefaults(defineProps<{ label?: string, tone?: 'lime' | 'blue' | 'orange', compact?: boolean, paused?: boolean, duration?: number }>(), { label: 'All systems operational', tone: 'lime', compact: false, paused: false, duration: 1600 })
</script>
<template>
  <section class="grid min-h-[500px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#ddd7c9] p-5">
    <div class="w-full max-w-sm rounded-[28px] bg-[#1b1d19] p-6 text-white"><p class="text-[9px] uppercase tracking-[.2em] text-white/35">System monitor</p><h3 class="mt-3 text-3xl font-semibold tracking-[-.05em]">Workspace health</h3><div class="mt-10 rounded-[22px] bg-white p-5 text-black"><StatusPulse :label="label" :tone="tone" :compact="compact" :paused="paused" :duration="duration" /><p class="mt-5 text-xs leading-5 text-black/42">Status updates are announced without interrupting the current task.</p></div></div>
  </section>
</template>
