<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedMobileFilterItem {
  id: string
  label: string
  count?: number
  icon?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: string[]
  items: AnimatedMobileFilterItem[]
  label?: string
  allLabel?: string
  multiple?: boolean
  showAll?: boolean
  allowEmpty?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  modelValue: () => [],
  label: 'Filter results',
  allLabel: 'All',
  multiple: true,
  showAll: true,
  allowEmpty: true,
  duration: 220,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [value: string[], item: AnimatedMobileFilterItem | null]
  scrollEdge: [edges: { start: boolean, end: boolean }]
}>()

const allId = '__animated_filter_all__'
const viewport = ref<HTMLElement>()
const buttonRefs = new Map<string, HTMLButtonElement>()
const focusedId = ref('')
const atStart = ref(true)
const atEnd = ref(true)
let resizeObserver: ResizeObserver | undefined
let lastEdges = ''

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 220)
const selected = computed(() => new Set(props.modelValue))
const entries = computed(() => props.showAll
  ? [{ id: allId, label: props.allLabel, disabled: !props.allowEmpty } as AnimatedMobileFilterItem, ...props.items]
  : props.items)

function setButtonRef(id: string, element: unknown) {
  if (element instanceof HTMLButtonElement) buttonRefs.set(id, element)
  else buttonRefs.delete(id)
}

function isSelected(id: string) {
  return id === allId ? props.modelValue.length === 0 : selected.value.has(id)
}

function updateEdges() {
  const element = viewport.value
  if (!element) return
  atStart.value = element.scrollLeft <= 2
  atEnd.value = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2
  const key = `${atStart.value}:${atEnd.value}`
  if (key !== lastEdges) {
    lastEdges = key
    emit('scrollEdge', { start: atStart.value, end: atEnd.value })
  }
}

function scrollTo(id: string) {
  nextTick(() => buttonRefs.get(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' }))
}

function commit(value: string[], item: AnimatedMobileFilterItem | null) {
  emit('update:modelValue', value)
  emit('change', value, item)
  scrollTo(item?.id ?? allId)
}

function select(item: AnimatedMobileFilterItem | string | null) {
  const resolved = typeof item === 'string' ? props.items.find(option => option.id === item) ?? null : item
  if (props.disabled || resolved?.disabled) return false
  if (!resolved || resolved.id === allId) {
    if (!props.allowEmpty) return false
    if (props.modelValue.length) commit([], null)
    return true
  }

  if (!props.multiple) {
    if (selected.value.has(resolved.id)) {
      if (props.allowEmpty) commit([], resolved)
    }
    else commit([resolved.id], resolved)
    return true
  }

  const next = selected.value.has(resolved.id)
    ? props.modelValue.filter(value => value !== resolved.id)
    : [...props.modelValue, resolved.id]
  if (next.length || props.allowEmpty) commit(next, resolved)
  return true
}

function focusItem(id: string) {
  const item = entries.value.find(entry => entry.id === id && !entry.disabled)
  if (!item) return false
  focusedId.value = id
  nextTick(() => buttonRefs.get(id)?.focus())
  scrollTo(id)
  return true
}

function onKeydown(event: KeyboardEvent, id: string) {
  const enabled = entries.value.filter(item => !item.disabled)
  const index = enabled.findIndex(item => item.id === id)
  if (index < 0) return
  let target = index
  if (event.key === 'ArrowRight') target = (index + 1) % enabled.length
  else if (event.key === 'ArrowLeft') target = (index - 1 + enabled.length) % enabled.length
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = enabled.length - 1
  else return
  event.preventDefault()
  focusItem(enabled[target]?.id ?? '')
}

function reset() {
  if (props.disabled || !props.allowEmpty) return false
  commit([], null)
  focusItem(props.showAll ? allId : entries.value.find(item => !item.disabled)?.id ?? '')
  return true
}

watch([entries, () => props.modelValue], () => {
  const current = entries.value.find(item => item.id === focusedId.value && !item.disabled)
  if (!current) focusedId.value = entries.value.find(item => isSelected(item.id) && !item.disabled)?.id ?? entries.value.find(item => !item.disabled)?.id ?? ''
  nextTick(updateEdges)
}, { immediate: true, deep: true })

onMounted(() => {
  updateEdges()
  if (viewport.value) {
    resizeObserver = new ResizeObserver(updateEdges)
    resizeObserver.observe(viewport.value)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())

defineExpose({ select, reset, focus: focusItem, scrollTo, recalculate: updateEdges })
</script>

<template>
  <div
    data-testid="animated-mobile-filter-bar"
    class="relative min-w-0"
    :style="{ '--filter-duration': `${safeDuration}ms` }"
  >
    <div
      ref="viewport"
      role="toolbar"
      :aria-label="label"
      :aria-disabled="disabled || undefined"
      class="filter-scroll flex min-h-12 snap-x items-center gap-2 overflow-x-auto px-1 py-1 [touch-action:pan-x]"
      @scroll.passive="updateEdges"
    >
      <button
        v-for="item in entries"
        :key="item.id"
        :ref="element => setButtonRef(item.id, element)"
        type="button"
        :data-testid="item.id === allId ? 'filter-chip-all' : `filter-chip-${item.id}`"
        :data-selected="isSelected(item.id) || undefined"
        :aria-pressed="isSelected(item.id)"
        :disabled="disabled || item.disabled"
        :tabindex="focusedId === item.id ? 0 : -1"
        class="filter-chip inline-flex min-h-11 shrink-0 snap-center items-center gap-2 rounded-full border px-4 text-xs font-semibold outline-none transition-[color,background-color,border-color,transform] active:not-disabled:scale-[.97] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        :class="isSelected(item.id) ? 'border-[#1c1e1a] bg-[#1c1e1a] text-white' : 'border-black/10 bg-white/72 text-black/55 hover:not-disabled:border-black/20 hover:not-disabled:bg-white'"
        @click="focusedId = item.id; select(item)"
        @focus="focusedId = item.id"
        @keydown="onKeydown($event, item.id)"
      >
        <span v-if="item.icon" class="grid size-5 place-items-center rounded-full bg-current/10 text-[8px]" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <span v-if="Number.isFinite(item.count)" class="min-w-5 rounded-full px-1.5 py-0.5 text-center font-mono text-[9px]" :class="isSelected(item.id) ? 'bg-white/15 text-white/75' : 'bg-black/[0.055] text-black/40'">{{ item.count }}</span>
      </button>
    </div>
    <Transition name="filter-fade"><span v-if="!atStart" data-testid="filter-overflow-start" class="pointer-events-none absolute inset-y-0 left-0 w-9 bg-gradient-to-r from-[var(--filter-edge,#e7e2d5)] to-transparent" aria-hidden="true" /></Transition>
    <Transition name="filter-fade"><span v-if="!atEnd" data-testid="filter-overflow-end" class="pointer-events-none absolute inset-y-0 right-0 w-9 bg-gradient-to-l from-[var(--filter-edge,#e7e2d5)] to-transparent" aria-hidden="true" /></Transition>
  </div>
</template>

<style scoped>
.filter-scroll { scrollbar-width: none; overscroll-behavior-inline: contain; }
.filter-scroll::-webkit-scrollbar { display: none; }
.filter-chip { transition-duration: var(--filter-duration); }
.filter-fade-enter-active, .filter-fade-leave-active { transition: opacity var(--filter-duration) ease; }
.filter-fade-enter-from, .filter-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .filter-fade-enter-active, .filter-fade-leave-active { transition: none !important; } }
</style>
