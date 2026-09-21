<script setup lang="ts">
import { ref } from 'vue'
import ScratchCard from '#registry/default/scratch-card/ScratchCard.vue'

const props = withDefaults(defineProps<{
  coverColor?: string
  brushSize?: number
  revealThreshold?: number
  resettable?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  coverColor: '#b7f34a',
  brushSize: 38,
  revealThreshold: 0.48,
  resettable: true,
  duration: 420,
  disabled: false,
})

const revealed = ref(false)
const progress = ref(0)
const status = ref('Ready to scratch')

function handleProgress(value: number) {
  progress.value = value
  if (!revealed.value) status.value = `${Math.round(value * 100)}% uncovered`
}

function handleReset() {
  progress.value = 0
  status.value = 'Ready to scratch again'
}
</script>

<template>
  <section
    class="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#f1eee6] px-4 py-10 sm:min-h-[620px] sm:px-8"
    data-testid="scratch-card-preview"
  >
    <div class="w-full max-w-[620px]">
      <div class="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p class="text-[10px] font-bold tracking-[0.2em] text-[#26352d]/45 uppercase">Northline Club</p>
          <h2 class="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#17251e] sm:text-2xl">Your member reward</h2>
        </div>
        <div class="text-right">
          <p class="font-mono text-xs font-semibold text-[#26352d]" data-testid="scratch-progress">{{ Math.round(progress * 100) }}%</p>
          <p class="mt-0.5 text-[10px] text-[#26352d]/45">uncovered</p>
        </div>
      </div>

      <ScratchCard
        v-model="revealed"
        class="min-h-[350px] shadow-[0_28px_70px_rgba(35,49,40,0.18)] sm:min-h-[390px]"
        cover-text="Scratch here to unlock your reward"
        aria-label="Reveal your Northline Club reward"
        :cover-color="props.coverColor"
        :brush-size="props.brushSize"
        :reveal-threshold="props.revealThreshold"
        :resettable="props.resettable"
        :duration="props.duration"
        :disabled="props.disabled"
        data-testid="scratch-card"
        @start="status = 'Scratching in progress'"
        @progress="handleProgress"
        @reveal="status = 'Reward unlocked'"
        @complete="status = 'Reveal complete'"
        @reset="handleReset"
      >
        <article class="relative flex min-h-[350px] flex-col overflow-hidden bg-[#183b2f] p-6 text-[#f8f5ea] sm:min-h-[390px] sm:p-9">
          <div class="absolute -top-20 -right-12 size-56 rounded-full border-[34px] border-[#dbff68]/80 sm:size-72 sm:border-[44px]" aria-hidden="true" />
          <div class="absolute right-16 -bottom-24 size-48 rounded-full border border-white/10 sm:size-64" aria-hidden="true" />
          <div class="relative flex items-start justify-between gap-6">
            <div class="grid size-10 place-items-center rounded-full border border-white/25 font-mono text-xs font-bold">N/C</div>
            <div class="mr-14 text-right sm:mr-20">
              <p class="text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">Member since</p>
              <p class="mt-1 font-mono text-xs">2026</p>
            </div>
          </div>

          <div class="relative mt-auto max-w-[430px] pt-20">
            <p class="text-[10px] font-bold tracking-[0.22em] text-[#dbff68] uppercase">Unlocked benefit</p>
            <div class="mt-3 flex items-end gap-3 sm:mt-4">
              <span class="text-6xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">30</span>
              <span class="pb-1 text-lg font-semibold leading-tight sm:pb-2 sm:text-2xl">% off<br>your next stay</span>
            </div>
            <div class="mt-7 flex flex-col gap-3 border-t border-white/15 pt-4 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
              <span>Valid through Dec 31, 2026</span>
              <span class="font-mono tracking-[0.14em] text-white/80">NORTH-30</span>
            </div>
          </div>
        </article>
      </ScratchCard>

      <div class="mt-4 flex items-center justify-between gap-4 px-1 text-xs text-[#26352d]/55">
        <p role="status" aria-live="polite" data-testid="scratch-status">{{ disabled ? 'Scratch card disabled' : status }}</p>
        <p class="hidden sm:block">Scratch with a pointer or use the reveal button</p>
      </div>
    </div>
  </section>
</template>
