<script setup lang="ts">
import { ref } from 'vue'
import WaveformPlayer from '../../../registry/default/waveform-player/WaveformPlayer.vue'

withDefaults(defineProps<{ loop?: boolean; playbackRate?: number; barCount?: number; disabled?: boolean }>(), { loop: false, playbackRate: 1, barCount: 36, disabled: false })
const message = ref('Ready to play the field note.')
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#f0c9b3] p-7 text-[#171814] sm:min-h-[560px] sm:p-10">
    <article class="w-full max-w-md rounded-[30px] bg-[#fff9f2] p-7 shadow-[0_24px_70px_rgba(82,42,20,0.15)] sm:p-9">
      <div class="flex items-start justify-between gap-6"><div><p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Field note · 014</p><h3 class="mt-3 text-3xl font-semibold tracking-[-0.045em]">Morning signals</h3></div><span class="rounded-full border border-black/10 px-3 py-1 text-[10px]">Lisbon</span></div>
      <p class="mt-4 text-sm leading-6 text-black/50">A short observation on rhythm, quiet interfaces, and what happens before the city wakes.</p>
      <div class="mt-9 border-y border-black/10 py-7">
        <WaveformPlayer label="Morning signals" :duration="18" :loop="loop" :playback-rate="playbackRate" :bar-count="barCount" :disabled="disabled" @play="message = 'Field note playing.'" @pause="message = 'Field note paused.'" @ended="message = 'Field note completed.'" />
      </div>
      <p data-testid="waveform-status" class="mt-5 text-xs text-black/40" aria-live="polite">{{ message }}</p>
    </article>
  </div>
</template>
