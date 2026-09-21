<script setup lang="ts">
import { ref } from 'vue'
import MaskReveal from '../../../registry/default/mask-reveal/MaskReveal.vue'
const props = withDefaults(defineProps<{ direction?: 'left'|'right'|'up'|'down'|'center'; duration?: number; once?: boolean; paused?: boolean }>(), { direction: 'left', duration: 900, once: true, paused: false })
const reveal = ref<InstanceType<typeof MaskReveal> | null>(null)
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e9e4dc] p-7 sm:min-h-[560px] sm:p-10">
    <div class="w-full max-w-xl"><div class="mb-5 flex items-center justify-between gap-3"><p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Studio archive · 08</p><button type="button" class="shrink-0 rounded-full border border-black/10 bg-white/50 px-4 py-2 text-xs" @click="reveal?.replay()">Replay reveal</button></div><MaskReveal ref="reveal" :direction="props.direction" :duration="duration" :once="once" :paused="paused" @complete="undefined"><article class="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-[#26453c] p-5 text-white shadow-[0_24px_70px_rgba(30,55,45,0.18)] sm:aspect-[4/3] sm:p-10"><div class="absolute -right-12 -top-10 size-44 rounded-full border-[28px] border-brand/80 sm:size-56 sm:border-[34px]"/><div class="absolute bottom-5 right-5 grid size-16 place-items-center rounded-full bg-[#f4b7c3] text-2xl text-[#26453c] sm:bottom-8 sm:right-8 sm:size-28 sm:text-4xl">↗</div><div class="relative flex h-full max-w-xs flex-col justify-end"><span class="text-[9px] uppercase tracking-[0.2em] text-white/45 sm:text-[10px]">Material study</span><h3 class="mt-2 max-w-[12rem] text-2xl font-semibold tracking-[-0.05em] sm:mt-3 sm:text-4xl">Shape follows attention.</h3><p class="mt-3 max-w-[11rem] text-xs leading-5 text-white/55 sm:mt-4 sm:max-w-xs sm:text-sm sm:leading-6">An editorial surface revealed with spatial intent.</p></div></article></MaskReveal></div>
  </div>
</template>
