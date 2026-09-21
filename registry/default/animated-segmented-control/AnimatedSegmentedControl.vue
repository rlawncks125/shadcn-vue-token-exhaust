<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'

export interface AnimatedSegmentedControlItem {
  id: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string
  items: AnimatedSegmentedControlItem[]
  label?: string
  duration?: number
  fullWidth?: boolean
  disabled?: boolean
}>(), {
  label: 'View options',
  duration: 260,
  fullWidth: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [item: AnimatedSegmentedControlItem]
}>()

const root = ref<HTMLElement | null>(null)
const elements = new Map<string, HTMLButtonElement>()
const indicator = ref({ x: 0, width: 0, visible: false })
let observer: ResizeObserver | undefined
let frame: number | undefined

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)
const rootStyle = computed<CSSProperties>(() => ({ '--segmented-duration': `${safeDuration.value}ms` }))
const indicatorStyle = computed<CSSProperties>(() => ({
  width: `${indicator.value.width}px`,
  transform: `translate3d(${indicator.value.x}px, 0, 0)`,
  opacity: indicator.value.visible ? '1' : '0',
}))
const enabledItems = computed(() => props.items.filter(item => !item.disabled))

function setElement(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) elements.set(id, element)
  else elements.delete(id)
}

function measure() {
  if (typeof window === 'undefined') return
  if (frame !== undefined) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const active = elements.get(props.modelValue)
    const container = root.value
    if (!active || !container) {
      indicator.value.visible = false
      return
    }
    indicator.value = { x: active.offsetLeft, width: active.offsetWidth, visible: true }
  })
}

function select(id: string) {
  const item = props.items.find(candidate => candidate.id === id)
  if (props.disabled || !item || item.disabled || item.id === props.modelValue) return false
  emit('update:modelValue', item.id)
  emit('change', item)
  return true
}

function focus(id?: string) {
  const target = id ? elements.get(id) : elements.get(props.modelValue) ?? elements.get(enabledItems.value[0]?.id ?? '')
  target?.focus()
  return Boolean(target)
}

function onKeydown(event: KeyboardEvent, currentId: string) {
  const items = enabledItems.value
  if (!items.length) return
  const current = Math.max(0, items.findIndex(item => item.id === currentId))
  let index: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') index = (current + 1) % items.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') index = (current - 1 + items.length) % items.length
  else if (event.key === 'Home') index = 0
  else if (event.key === 'End') index = items.length - 1
  if (index === undefined) return
  event.preventDefault()
  const target = items[index]!
  select(target.id)
  nextTick(() => elements.get(target.id)?.focus())
}

watch(() => [props.modelValue, props.items, props.fullWidth], () => nextTick(measure), { deep: true })

onMounted(() => {
  observer = new ResizeObserver(measure)
  if (root.value) observer.observe(root.value)
  measure()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame !== undefined) cancelAnimationFrame(frame)
})

defineExpose({ select, focus, recalculate: measure })
</script>

<template>
  <div
    ref="root"
    data-testid="animated-segmented-control"
    role="tablist"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    class="relative isolate flex max-w-full overflow-x-auto rounded-[16px] bg-black/[0.065] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    :class="fullWidth ? 'w-full' : 'w-fit'"
    :style="rootStyle"
  >
    <span aria-hidden="true" class="pointer-events-none absolute inset-y-1 left-0 -z-0 rounded-[12px] bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,.45)] transition-[transform,width,opacity] motion-reduce:transition-none" :style="indicatorStyle" />
    <button
      v-for="item in items"
      :key="item.id"
      :ref="element => setElement(element, item.id)"
      type="button"
      role="tab"
      :data-testid="`segmented-control-item-${item.id}`"
      :aria-selected="modelValue === item.id"
      :tabindex="modelValue === item.id ? 0 : -1"
      :disabled="disabled || item.disabled"
      class="relative z-10 flex min-h-10 min-w-max items-center justify-center gap-2 rounded-[12px] px-3 text-xs font-semibold text-black/48 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
      :class="[{ 'flex-1': fullWidth }, modelValue === item.id ? 'text-black' : 'hover:not-disabled:text-black/75']"
      @click="select(item.id)"
      @keydown="onKeydown($event, item.id)"
    >
      <span v-if="item.icon" class="text-[11px] font-black" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
      <span v-if="item.badge !== undefined" class="rounded-full bg-black/[0.07] px-1.5 py-0.5 text-[9px] tabular-nums">{{ item.badge }}</span>
    </button>
  </div>
</template>

<style scoped>
.animated-segmented-control > span { transition-duration: var(--segmented-duration); transition-timing-function: cubic-bezier(.2,.8,.2,1); }
</style>
