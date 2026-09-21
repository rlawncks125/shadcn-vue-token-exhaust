<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedImageCropper, { type CropGeometry, type CropShape } from '#registry/default/animated-image-cropper/AnimatedImageCropper.vue'

const props = withDefaults(defineProps<{
  aspectRatio?: number
  shape?: CropShape
  duration?: number
  disabled?: boolean
}>(), {
  aspectRatio: 4 / 3,
  shape: 'rectangle',
  duration: 260,
  disabled: false,
})

const landscape = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750"><defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="#89a5aa"/><stop offset="1" stop-color="#d9c7a5"/></linearGradient><linearGradient id="m" x2="1" y2="1"><stop stop-color="#40534a"/><stop offset="1" stop-color="#17251f"/></linearGradient></defs><rect width="1200" height="750" fill="url(#s)"/><circle cx="910" cy="145" r="72" fill="#fff3c4" opacity=".85"/><path d="M0 460 225 245l145 130 180-205 300 300 145-120 205 190v210H0Z" fill="#65786d"/><path d="M0 520 245 365l165 112 160-151 245 181 165-99 220 152v190H0Z" fill="url(#m)"/><path d="M0 628c180-86 318-56 465-9 171 55 314 52 735-46v177H0Z" fill="#c5b27f"/><path d="M610 750c-18-142 15-251 110-326-47 110-42 219 22 326Z" fill="#e8ddbd" opacity=".8"/></svg>`
const imageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(landscape)}`
const crop = ref<CropGeometry>({ x: 22, y: 14, width: 56, height: 67.2 })
const zoom = ref(1.12)
const rotation = ref(0)
const cropper = ref<InstanceType<typeof AnimatedImageCropper> | null>(null)
const cropSummary = computed(() => `${Math.round(crop.value.width)} x ${Math.round(crop.value.height)}% at ${Math.round(crop.value.x)}, ${Math.round(crop.value.y)}`)
</script>

<template>
  <div data-testid="animated-image-cropper-preview" class="flex min-h-[620px] w-full items-center justify-center rounded-2xl border border-border bg-[#1d2421] p-3 text-[#171814] sm:min-h-[720px] sm:p-8">
    <section class="w-full max-w-[760px] rounded-[28px] border border-white/10 bg-[#e9e4d8] p-4 shadow-[0_35px_90px_-42px_rgba(0,0,0,.9)] sm:p-7">
      <header class="mb-5 flex items-start justify-between gap-4">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#667064]">Cover studio / 06</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-[-.05em] sm:text-3xl">Frame the quiet.</h3>
          <p class="mt-1 max-w-md text-[11px] leading-5 text-black/45">Pan the selection, resize from its corner, then tune scale and horizon.</p>
        </div>
        <button type="button" class="shrink-0 rounded-full border border-black/10 bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled" @click="cropper?.reset()">Reset</button>
      </header>

      <AnimatedImageCropper
        ref="cropper"
        v-model="crop"
        v-model:zoom="zoom"
        v-model:rotation="rotation"
        :src="imageSrc"
        alt="Layered mountain landscape illustration"
        :aspect-ratio="aspectRatio"
        :shape="shape"
        :duration="duration"
        :disabled="disabled"
        crop-label="Cover image crop selection"
      />

      <footer class="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="grid size-9 place-items-center rounded-full bg-[#d9ff57] text-xs font-bold">4:3</span>
          <div>
            <p class="text-[10px] font-semibold">Editorial cover</p>
            <p data-testid="image-cropper-status" class="mt-0.5 text-[9px] tabular-nums text-black/45">{{ cropSummary }}</p>
          </div>
        </div>
        <div class="flex gap-1.5 text-[8px] font-bold uppercase tracking-[.13em] text-black/40">
          <span class="rounded-full border border-black/10 px-2.5 py-1.5">{{ zoom.toFixed(2) }}x zoom</span>
          <span class="rounded-full border border-black/10 px-2.5 py-1.5">{{ Math.round(rotation) }}&deg; tilt</span>
        </div>
      </footer>
      <p class="sr-only" role="status" aria-live="polite">Crop {{ cropSummary }}. Zoom {{ zoom.toFixed(2) }}. Rotation {{ Math.round(rotation) }} degrees.</p>
    </section>
  </div>
</template>
