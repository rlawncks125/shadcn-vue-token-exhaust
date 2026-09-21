<script setup lang="ts">
import { ref } from 'vue'
import FlipCountdown from '../../../registry/default/flip-countdown/FlipCountdown.vue'
const props = withDefaults(defineProps<{ duration?: number; loop?: boolean; paused?: boolean; showHours?: boolean; flipDuration?: number }>(), { duration: 12, loop: false, paused: false, showHours: true, flipDuration: 520 })
const timer = ref<InstanceType<typeof FlipCountdown> | null>(null)
const message = ref('Timer ready.')
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#c8d5ff] p-7 text-[#171814] sm:min-h-[560px] sm:p-10">
    <section class="w-full max-w-xl rounded-[30px] bg-[#f9f8f4] p-7 shadow-[0_24px_70px_rgba(40,55,110,0.16)] sm:p-10"><div class="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><FlipCountdown ref="timer" label="Next session" :duration="props.duration" :loop="loop" :paused="paused" :show-hours="showHours" :flip-duration="flipDuration" @start="message = 'Countdown running.'" @pause="message = 'Countdown paused.'" @complete="message = 'Countdown complete.'"/><div class="flex flex-wrap gap-2"><button type="button" class="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white" @click="timer?.start()">Start</button><button type="button" class="rounded-full border border-black/10 px-4 py-2 text-xs" @click="timer?.pause()">Pause</button><button type="button" class="rounded-full border border-black/10 px-4 py-2 text-xs" @click="timer?.reset(); message = 'Timer reset.'">Reset</button></div></div><p data-testid="countdown-status" class="mt-8 border-t border-black/10 pt-5 text-xs text-black/40" aria-live="polite">{{ message }}</p></section>
  </div>
</template>
