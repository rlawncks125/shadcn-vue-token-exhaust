<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileInstallPrompt from '#registry/default/animated-mobile-install-prompt/AnimatedMobileInstallPrompt.vue'
withDefaults(defineProps<{ autoShow?: boolean, closeOnChoice?: boolean, dismissible?: boolean, duration?: number, disabled?: boolean }>(), { autoShow: true, closeOnChoice: true, dismissible: true, duration: 280, disabled: false })
const open = ref(true)
const status = ref('Waiting for browser install eligibility.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#c7bfaf] p-5 sm:p-9"><div class="w-full max-w-sm"><button v-if="!open" type="button" class="mx-auto mb-4 block min-h-11 rounded-full bg-black px-5 text-xs font-semibold text-white" @click="open = true">Show install card</button><AnimatedMobileInstallPrompt v-model="open" app-name="Field Notes" :auto-show="autoShow" :close-on-choice="closeOnChoice" :dismissible="dismissible" :duration="duration" :disabled="disabled" @available="status = 'Install prompt available.'" @prompt="status = 'Native install prompt opened.'" @choice="outcome => status = `Install ${outcome}.`" @installed="status = 'Application installed.'" @dismiss="status = 'Install card dismissed.'" @error="message => status = message" /><p data-testid="install-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
