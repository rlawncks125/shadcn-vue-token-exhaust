<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileReadAloud from '#registry/default/animated-mobile-read-aloud/AnimatedMobileReadAloud.vue'
withDefaults(defineProps<{ rate?: number, pitch?: number, volume?: number, showVoicePicker?: boolean, duration?: number, disabled?: boolean }>(), { rate: 1, pitch: 1, volume: 1, showVoicePicker: true, duration: 220, disabled: false })
const status = ref('Tap Read aloud to use your device speech engine.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#c9c1d3] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Accessible reading</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Listen to this note.</h3></div><AnimatedMobileReadAloud text="Low tide reveals a dense field of anemones near the north marker. Move slowly across the exposed rocks." title="Tide pool observation" :rate="rate" :pitch="pitch" :volume="volume" :show-voice-picker="showVoicePicker" :duration="duration" :disabled="disabled" @start="status = 'Speech started.'" @pause="status = 'Speech paused.'" @resume="status = 'Speech resumed.'" @stop="status = 'Speech stopped.'" @end="status = 'Speech completed.'" @error="message => status = message" /><p data-testid="read-aloud-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
