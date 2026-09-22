<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileContactPicker, { type AnimatedMobileContact } from '#registry/default/animated-mobile-contact-picker/AnimatedMobileContactPicker.vue'
withDefaults(defineProps<{ multiple?: boolean, duration?: number, disabled?: boolean }>(), { multiple: false, duration: 260, disabled: false })
const contacts = ref<AnimatedMobileContact[]>([])
const status = ref('Tap Open contacts to use the real device picker.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#d7cbbd] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Invite collaborator</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Share the field log.</h3></div><AnimatedMobileContactPicker v-model="contacts" :multiple="multiple" :duration="duration" :disabled="disabled" @select="value => status = `${value.length} contact selected.`" @clear="status = 'Selection cleared.'" @cancel="status = 'Picker closed without a selection.'" @unsupported="status = 'Contact Picker API is unavailable.'" @error="message => status = message" /><p data-testid="contact-picker-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
