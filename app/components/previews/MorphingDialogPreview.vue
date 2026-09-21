<script setup lang="ts">
import { ref } from 'vue'
import MorphingDialog from '../../../registry/default/morphing-dialog/MorphingDialog.vue'

withDefaults(defineProps<{
  duration?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
}>(), {
  duration: 480,
  closeOnBackdrop: true,
  lockScroll: true,
})

const message = ref('Select the brief to expand it.')
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-brand-soft p-8 text-[#171814] sm:min-h-[560px]">
    <p class="mb-5 max-w-xs text-center text-xs leading-5 text-black/55">A compact action becomes the surface that carries its next decision.</p>
    <MorphingDialog label="Project brief" :duration="duration" :close-on-backdrop="closeOnBackdrop" :lock-scroll="lockScroll" initial-focus="[data-primary]" @opened="message = 'Dialog opened and focus moved inside.'" @closed="message = 'Dialog closed and focus returned.'">
      <template #trigger>Open project brief ↗</template>
      <template #default="{ close }">
        <div class="p-7 sm:p-9">
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">Next release</p>
          <h3 class="mt-4 text-3xl font-semibold tracking-[-0.045em]">Turn intent into momentum.</h3>
          <p class="mt-4 text-sm leading-6 text-white/55">Review the final interaction pass, confirm the launch window, and share the brief with the product crew.</p>
          <div class="mt-8 grid grid-cols-3 gap-2 border-y border-white/10 py-5 text-center">
            <div><strong class="block text-xl">04</strong><span class="text-[10px] text-white/40">flows</span></div>
            <div><strong class="block text-xl">12</strong><span class="text-[10px] text-white/40">screens</span></div>
            <div><strong class="block text-xl">Fri</strong><span class="text-[10px] text-white/40">review</span></div>
          </div>
          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-full border border-white/15 px-5 py-2.5 text-sm" @click="close">Not now</button>
            <button data-primary type="button" class="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground" @click="message = 'Brief shared with the team.'; close()">Share brief</button>
          </div>
        </div>
      </template>
    </MorphingDialog>
    <p data-testid="morph-status" class="mt-5 text-xs text-black/45" aria-live="polite">{{ message }}</p>
  </div>
</template>
