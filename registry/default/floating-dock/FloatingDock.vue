<script setup lang="ts">
import { computed, ref } from 'vue'

export interface DockItem {
  value: string
  label: string
  symbol?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: DockItem[]
  label?: string
  magnification?: number
  accent?: string
}>(), { label: 'Quick actions', magnification: 1.35, accent: 'var(--registry-accent, #d9ff57)' })
const model = defineModel<string>()
const emit = defineEmits<{ select: [item: DockItem] }>()
const hovered = ref<string>()
const focused = ref<string>()
const activeIndex = computed(() => props.items.findIndex(item => item.value === (hovered.value ?? focused.value)))

function scale(index: number) {
  if (activeIndex.value < 0 || props.items[index]?.disabled)
    return 1
  const amount = Number.isFinite(props.magnification) ? Math.max(1, Math.min(1.6, props.magnification)) : 1
  return 1 + (amount - 1) * Math.max(0, 1 - Math.abs(index - activeIndex.value) / 2)
}

function select(item: DockItem) {
  if (item.disabled) return
  model.value = item.value
  emit('select', item)
}
</script>

<template>
  <div
    class="floating-dock inline-flex max-w-full flex-wrap justify-center gap-3 rounded-3xl border border-[#ffffff30] bg-[#171814ed] p-3.5 shadow-[0_20px_50px_-24px_#17181499]"
    role="group" :aria-label="label" :style="{ '--dock-accent': accent }" @pointerleave="hovered = undefined"
  >
    <button
      v-for="(item, index) in items" :key="item.value" type="button"
      class="dock-item relative grid size-11 origin-bottom cursor-pointer place-items-center rounded-[14px] border-0 bg-[#ffffff12] [font:inherit] text-white [transform:scale(var(--dock-scale))] [transition:transform_220ms_cubic-bezier(.16,1,.3,1),background_180ms] aria-pressed:bg-[var(--dock-accent)] aria-pressed:text-[#171814] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dock-accent)] disabled:cursor-not-allowed disabled:opacity-[.35] [&:focus-visible_.dock-tooltip]:opacity-100 [@media(hover:hover)]:[&:hover:not(:disabled)_.dock-tooltip]:opacity-100 motion-reduce:transform-none motion-reduce:transition-none [@media(hover:none)]:transform-none [@media(hover:none)]:transition-none"
      :disabled="item.disabled" :aria-label="item.label"
      :aria-pressed="model === item.value" :style="{ '--dock-scale': scale(index) }"
      @pointerenter="event => { if (event.pointerType === 'mouse' && !item.disabled) hovered = item.value }"
      @focus="focused = item.value" @blur="focused = undefined" @click="select(item)"
    >
      <span class="dock-tooltip pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 rounded-[7px] bg-[#171814] px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0" aria-hidden="true">{{ item.label }}</span>
      <span class="dock-symbol grid place-items-center text-xl [&_svg]:size-5" aria-hidden="true"><slot name="icon" :item="item">{{ item.symbol ?? item.label.slice(0, 1) }}</slot></span>
      <span v-if="model === item.value" class="dock-dot absolute -bottom-[7px] size-[3px] rounded-full bg-[var(--dock-accent)]" aria-hidden="true" />
    </button>
  </div>
</template>
