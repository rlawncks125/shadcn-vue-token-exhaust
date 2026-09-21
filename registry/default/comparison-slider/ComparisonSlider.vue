<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  beforeLabel?: string
  afterLabel?: string
  ariaLabel?: string
  disabled?: boolean
}>(), {
  beforeLabel: 'Before',
  afterLabel: 'After',
  ariaLabel: 'Comparison position',
  disabled: false,
})
const model = defineModel<number>({ default: 50 })
const position = computed({
  get: () => Math.max(0, Math.min(100, Number.isFinite(model.value) ? model.value : 50)),
  set: value => model.value = Math.max(0, Math.min(100, value)),
})
</script>

<template>
  <div
    class="comparison-slider relative isolate min-h-60 w-full overflow-hidden rounded-3xl bg-[#171814] has-[.comparison-range:focus-visible]:outline-3 has-[.comparison-range:focus-visible]:outline-offset-4 has-[.comparison-range:focus-visible]:outline-[var(--registry-accent,#d9ff57)]"
    :class="{ 'is-disabled opacity-55': disabled }"
    :style="{ '--comparison-position': `${position}%` }"
  >
    <div class="comparison-layer comparison-before absolute inset-0 overflow-hidden [&>*]:size-full"><slot name="before" /></div>
    <div class="comparison-layer comparison-after absolute inset-0 z-1 overflow-hidden [clip-path:inset(0_calc(100%_-_var(--comparison-position))_0_0)] [&>*]:size-full"><slot name="after" /></div>
    <span class="comparison-label label-before pointer-events-none absolute top-4 right-4 z-2 rounded-full border border-[#ffffff30] bg-[#171814a8] px-[9px] py-[5px] text-[10px] font-semibold tracking-[.12em] text-white uppercase">{{ beforeLabel }}</span>
    <span class="comparison-label label-after pointer-events-none absolute top-4 left-4 z-2 rounded-full border border-[#ffffff30] bg-[#171814a8] px-[9px] py-[5px] text-[10px] font-semibold tracking-[.12em] text-white uppercase">{{ afterLabel }}</span>
    <div class="comparison-divider pointer-events-none absolute top-0 bottom-0 left-[var(--comparison-position)] z-3 w-0.5 -translate-x-px bg-white" aria-hidden="true">
      <span class="absolute top-1/2 left-1/2 grid size-[42px] -translate-1/2 place-items-center rounded-full border-2 border-white bg-[#171814] text-base text-white shadow-[0_6px_24px_#0005]">↔</span>
    </div>
    <input v-model.number="position" class="comparison-range absolute inset-0 z-4 m-0 size-full cursor-ew-resize opacity-0 disabled:cursor-not-allowed" type="range" min="0" max="100" step="1" :aria-label="props.ariaLabel" :disabled="disabled">
  </div>
</template>
