<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

const props = withDefaults(defineProps<{
  actionWidth?: number
  threshold?: number
  disabled?: boolean
  closeOnAction?: boolean
  label?: string
}>(), {
  actionWidth: 184,
  threshold: 0.35,
  disabled: false,
  closeOnAction: true,
  label: 'Swipe left for actions',
})
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ opened: []; closed: [] }>()
const content = ref<HTMLElement>()
const dragging = ref(false)
const offset = ref(0)
const startX = ref(0)
const startY = ref(0)
const startOffset = ref(0)
let axis: 'horizontal' | 'vertical' | undefined
let moved = false
const actionsId = `swipe-actions-${useId()}`
const hintId = `${actionsId}-hint`
const width = computed(() => Math.max(72, props.actionWidth))
const style = computed(() => ({ '--action-width': `${width.value}px` }))

function setOpen(value: boolean) {
  if (open.value === value) return
  open.value = value
  if (value) emit('opened')
  else emit('closed')
}
function settle(value: boolean) {
  dragging.value = false
  axis = undefined
  offset.value = value ? -width.value : 0
  setOpen(value)
}
function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0 || (event.target as HTMLElement).closest('button, a, input, select, textarea')) return
  dragging.value = true
  moved = false
  axis = undefined
  startX.value = event.clientX
  startY.value = event.clientY
  startOffset.value = open.value ? -width.value : 0
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value
  if (!axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 6) axis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'
  if (axis === 'vertical') { settle(open.value); return }
  if (axis === 'horizontal') { moved = true; offset.value = Math.max(-width.value, Math.min(0, startOffset.value + deltaX)) }
}
function onPointerEnd() {
  if (!dragging.value) return
  settle(Math.abs(offset.value) >= width.value * Math.max(0.1, Math.min(0.9, props.threshold)))
}
function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'ArrowLeft') { event.preventDefault(); settle(true) }
  else if (event.key === 'ArrowRight' || event.key === 'Escape') { event.preventDefault(); settle(false) }
}
function onContentClick(event: MouseEvent) {
  if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; return }
  if (open.value && !dragging.value) { event.preventDefault(); event.stopPropagation(); settle(false) }
}
function onAction() {
  if (!props.closeOnAction) return
  settle(false)
  nextTick(() => content.value?.focus())
}

watch([open, width], ([value]) => { if (!dragging.value) offset.value = value ? -width.value : 0 }, { immediate: true })
defineExpose({ open: () => settle(true), close: () => settle(false) })
</script>

<template>
  <div class="swipe-actions relative w-full overflow-hidden rounded-[20px] bg-[#171814]" :class="{ 'opacity-50': disabled }" :style="style">
    <div
      ref="content"
      class="swipe-content relative z-[2] min-h-full touch-pan-y select-none bg-white outline-none transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] focus-visible:shadow-[inset_0_0_0_3px_var(--registry-accent,#d9ff57)] motion-reduce:transition-none"
      :class="{ '!transition-none cursor-grabbing': dragging, 'cursor-not-allowed': disabled }"
      :style="{ transform: `translateX(${offset}px)` }"
      :tabindex="disabled ? -1 : 0" :aria-label="label" :aria-expanded="open"
      :aria-controls="actionsId" :aria-describedby="hintId" @pointerdown="onPointerDown" @pointermove="onPointerMove"
      @pointerup="onPointerEnd" @pointercancel="onPointerEnd" @keydown="onKeydown" @click.capture="onContentClick"
    ><slot /></div>
    <div :id="actionsId" class="swipe-actions-panel absolute inset-y-0 right-0 z-[1] flex w-[var(--action-width)] items-stretch justify-end [&>*]:flex-1" :aria-hidden="!open" :inert="!open" @click="onAction"><slot name="actions" /></div>
    <span :id="hintId" class="sr-only">Use Left Arrow to reveal actions, Right Arrow or Escape to close.</span>
  </div>
</template>
