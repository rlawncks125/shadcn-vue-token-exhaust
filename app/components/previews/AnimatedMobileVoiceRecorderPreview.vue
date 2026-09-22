<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileVoiceRecorder from '#registry/default/animated-mobile-voice-recorder/AnimatedMobileVoiceRecorder.vue'
withDefaults(defineProps<{ maxDuration?: number, duration?: number, haptic?: boolean, disabled?: boolean }>(), { maxDuration: 120, duration: 220, haptic: false, disabled: false })
const recording = ref(false)
const paused = ref(false)
const status = ref('Ready for a voice note.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#c8d2ca] p-5 sm:p-9">
    <div class="w-full max-w-sm rounded-[30px] bg-[#f5f1e8] p-5 shadow-[0_30px_80px_-45px_rgba(0,0,0,.65)]">
      <div class="mb-12 flex items-center gap-3"><div class="grid size-11 place-items-center rounded-full bg-[#e36845] text-sm font-bold text-white">MA</div><div><p class="text-sm font-semibold">Mara A.</p><p class="text-[10px] text-black/40">Field channel · online</p></div></div>
      <div class="ml-auto max-w-[82%] rounded-[20px_20px_5px_20px] bg-[#1b1d19] px-4 py-3 text-xs leading-5 text-white">Can you capture the sound near the north marker?</div>
      <p data-testid="voice-status" class="my-5 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
      <AnimatedMobileVoiceRecorder v-model:recording="recording" v-model:paused="paused" :max-duration="maxDuration" :duration="duration" :haptic="haptic" :disabled="disabled" @start="status = 'Recording started.'" @pause="status = 'Recording paused.'" @resume="status = 'Recording resumed.'" @cancel="status = 'Voice note discarded.'" @send="seconds => status = `Sent ${seconds}s voice note.`" @limit="status = 'Time limit reached.'" />
    </div>
  </section>
</template>
