<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileComposer from '#registry/default/animated-mobile-composer/AnimatedMobileComposer.vue'

const props = withDefaults(defineProps<{ maxLength?: number, maxRows?: number, duration?: number, submitOnEnter?: boolean, allowAttachment?: boolean, safeArea?: boolean, disabled?: boolean, loading?: boolean }>(), {
  maxLength: 280, maxRows: 5, duration: 220, submitOnEnter: true, allowAttachment: true, safeArea: true, disabled: false, loading: false,
})
const message = ref('')
const status = ref('Composer ready.')
const sent = ref(['The tide is low enough for the north path.', 'Perfect. I will meet you by the old marker.'])
function submit(value: string) {
  sent.value.push(value)
  message.value = ''
  status.value = 'Message sent.'
}
</script>

<template>
  <section data-testid="animated-mobile-composer-preview" class="relative flex min-h-[560px] w-full max-w-[620px] flex-col overflow-hidden rounded-[30px] border border-black/10 bg-[#e8e4d8] text-[#1c1d1a] shadow-[0_35px_100px_-65px_rgba(28,29,26,.9)]">
    <header class="flex items-center gap-3 border-b border-black/[0.07] bg-white/45 px-5 py-4"><span class="grid size-10 place-items-center rounded-full bg-[#1c1d1a] text-[9px] font-black text-[#d9ff57]">NW</span><div><h3 class="text-sm font-semibold">North path group</h3><p class="text-[10px] text-black/40">3 members · field channel</p></div></header>
    <div class="flex flex-1 flex-col justify-end gap-2 p-4 sm:p-6">
      <p v-for="(item, index) in sent" :key="`${item}-${index}`" class="max-w-[82%] rounded-[18px] px-4 py-3 text-xs leading-5" :class="index % 2 ? 'ml-auto rounded-br-md bg-[#1c1d1a] text-white' : 'rounded-bl-md bg-white/75'">{{ item }}</p>
    </div>
    <div class="relative p-3 pt-0 sm:p-4 sm:pt-0">
      <AnimatedMobileComposer v-model="message" placeholder="Message the group..." :max-length="maxLength" :max-rows="maxRows" :duration="duration" :submit-on-enter="submitOnEnter" :allow-attachment="allowAttachment" :safe-area="safeArea" :disabled="disabled" :loading="loading" label="Group message" @submit="submit" @attach="status = 'Attachment picker requested.'" />
      <p data-testid="mobile-composer-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
    </div>
  </section>
</template>
