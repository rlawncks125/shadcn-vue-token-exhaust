<script setup lang="ts">
import { ref } from 'vue'
import TextScramble from '#registry/default/text-scramble/TextScramble.vue'

const props = withDefaults(defineProps<{ text?: string, trigger?: 'hover' | 'click' | 'load', duration?: number, disabled?: boolean }>(), {
  text: 'Build remarkable interfaces.', trigger: 'hover', duration: 800, disabled: false,
})
const status = ref('Ready to decode.')
</script>

<template>
  <section data-testid="text-scramble-preview" class="relative flex min-h-[500px] w-full max-w-[860px] items-center overflow-hidden rounded-[30px] border border-black/10 bg-[#171916] p-6 text-white sm:min-h-[560px] sm:p-12">
    <div class="absolute inset-0 opacity-25 [background-image:linear-gradient(#d9ff5718_1px,transparent_1px),linear-gradient(90deg,#d9ff5718_1px,transparent_1px)] [background-size:28px_28px]" />
    <div class="relative max-w-3xl">
      <div class="mb-8 flex items-center gap-3"><span class="size-2 rounded-full bg-[#d9ff57]" /><span class="font-mono text-[9px] uppercase tracking-[.24em] text-white/38">Signal decoder / mobile ready</span></div>
      <TextScramble :key="`${trigger}-${duration}`" :text="text" characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" :trigger="trigger" :duration="duration" :disabled="disabled" class="text-4xl font-semibold leading-[.95] tracking-[-.065em] text-[#f3f1e8] sm:text-6xl" @start="status = 'Decoding signal.'" @complete="status = 'Signal resolved.'" />
      <p class="mt-8 max-w-md text-xs leading-6 text-white/38">Hover or focus with a pointer. On touch screens, tap the phrase. Enter and Space replay it from the keyboard.</p>
      <p data-testid="text-scramble-status" class="mt-5 font-mono text-[9px] uppercase tracking-[.16em] text-[#d9ff57]" role="status" aria-live="polite">{{ status }}</p>
    </div>
  </section>
</template>
