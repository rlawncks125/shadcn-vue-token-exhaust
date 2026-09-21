<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedColorPicker, { type AnimatedColorPickerExpose, type AnimatedColorPickerSource } from '#registry/default/animated-color-picker/AnimatedColorPicker.vue'

const props = withDefaults(defineProps<{
  alpha?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  alpha: true,
  duration: 220,
  disabled: false,
})

const picker = ref<AnimatedColorPickerExpose | null>(null)
const color = ref(props.alpha ? '#7C5CFCE8' : '#7C5CFC')
const status = ref('Brand color ready.')
const swatches = ['#FF6B6BE8', '#FFB84DE8', '#42D392E8', '#38BDF8E8', '#7C5CFCE8', '#EC4899E8', '#F4E76EE8', '#20242CE8']

const opaqueColor = computed(() => color.value.slice(0, 7))
const tintStyle = computed(() => ({
  backgroundImage: `linear-gradient(135deg, ${color.value}, ${opaqueColor.value}33)`,
}))

function reportCommit(value: string, source: AnimatedColorPickerSource) {
  status.value = `${value} committed from ${source}.`
}
</script>

<template>
  <div data-testid="animated-color-picker-preview" class="flex min-h-[760px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#d9dff0] p-4 text-[#151722] sm:p-8 lg:p-12">
    <section class="relative grid w-full max-w-[980px] overflow-hidden rounded-[34px] border border-white/70 bg-[#eef1f8] shadow-[0_40px_110px_-56px_rgba(30,38,75,0.65)] lg:grid-cols-[1.08fr_0.92fr]">
      <div class="relative flex items-center justify-center overflow-hidden bg-[#171a24] p-5 sm:p-8 lg:min-h-[690px] lg:p-10">
        <div class="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
        <div class="relative w-full max-w-[420px]">
          <div class="mb-5 flex items-center justify-between px-1 text-white">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">Chromatic system</p>
              <h2 class="mt-1.5 text-xl font-semibold tracking-[-0.04em]">Tune the signal.</h2>
            </div>
            <button type="button" class="rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/60 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" @click="picker?.reset()">Reset</button>
          </div>

          <AnimatedColorPicker
            ref="picker"
            v-model="color"
            :alpha="alpha"
            :swatches="swatches"
            :duration="duration"
            :disabled="disabled"
            label="Interface accent"
            @commit="reportCommit"
            @invalid="(_value, reason) => status = reason"
          />

          <p data-testid="color-picker-preview-status" class="mt-4 min-h-4 px-1 text-[10px] text-white/38" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
        </div>
      </div>

      <div class="relative flex flex-col justify-between overflow-hidden p-6 sm:p-9 lg:p-10">
        <div class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl transition-colors motion-reduce:transition-none" :style="{ backgroundColor: `${opaqueColor}2A`, transitionDuration: `${duration}ms` }" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#151722]/38">Live specimen</p>
              <h3 class="mt-2 text-3xl font-semibold tracking-[-0.055em]">One color,<br>many voices.</h3>
            </div>
            <button type="button" class="grid size-11 place-items-center rounded-full border border-black/10 bg-white/70 outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#151722] disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" aria-label="Focus hex color input" @click="picker?.focus()">
              <svg class="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2v16M2 10h16" stroke-linecap="round" /></svg>
            </button>
          </div>

          <div class="mt-9 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_55px_-40px_rgba(26,30,54,.7)]">
            <div class="h-36 p-5 transition-[background-image] motion-reduce:transition-none" :style="{ ...tintStyle, transitionDuration: `${duration}ms` }">
              <div class="flex items-center justify-between">
                <span class="rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">Edition 07</span>
                <span class="size-2 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,.18)]" />
              </div>
            </div>
            <div class="p-5">
              <div class="flex items-end justify-between gap-4">
                <div>
                  <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">Current token</p>
                  <p data-testid="color-picker-preview-value" class="mt-1.5 font-mono text-lg font-bold tracking-[-0.02em]">{{ color }}</p>
                </div>
                <span class="rounded-full px-3 py-1.5 text-[9px] font-bold text-white transition-colors motion-reduce:transition-none" :style="{ backgroundColor: color, transitionDuration: `${duration}ms` }">Active</span>
              </div>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-3 gap-2">
            <div class="rounded-2xl border border-black/[0.07] bg-white/55 p-3">
              <span class="block h-1.5 rounded-full transition-colors motion-reduce:transition-none" :style="{ backgroundColor: color, transitionDuration: `${duration}ms` }" />
              <p class="mt-3 text-[9px] font-semibold text-black/40">Primary</p>
            </div>
            <div class="rounded-2xl border border-black/[0.07] bg-white/55 p-3">
              <span class="block h-1.5 rounded-full opacity-55 transition-colors motion-reduce:transition-none" :style="{ backgroundColor: color, transitionDuration: `${duration}ms` }" />
              <p class="mt-3 text-[9px] font-semibold text-black/40">Muted</p>
            </div>
            <div class="rounded-2xl border border-black/[0.07] bg-white/55 p-3">
              <span class="block h-1.5 rounded-full opacity-20 transition-colors motion-reduce:transition-none" :style="{ backgroundColor: color, transitionDuration: `${duration}ms` }" />
              <p class="mt-3 text-[9px] font-semibold text-black/40">Wash</p>
            </div>
          </div>
        </div>

        <p class="relative mt-10 max-w-xs text-[10px] leading-5 text-black/42">Use the spectrum for broad changes, then refine with keyboard-friendly HSV and opacity controls.</p>
      </div>
    </section>
  </div>
</template>
