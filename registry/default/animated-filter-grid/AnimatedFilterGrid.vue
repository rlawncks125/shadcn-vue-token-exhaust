<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedFilterGridItem {
  id: string
  title: string
  category: string
  description?: string
  meta?: string
  disabled?: boolean
}

export type AnimatedFilterGridSort = 'default' | 'title-asc' | 'title-desc' | 'category-asc' | 'category-desc'
export type AnimatedFilterGridColumns = 1 | 2 | 3 | 4

export interface AnimatedFilterGridProps {
  items: AnimatedFilterGridItem[]
  filter?: string
  sort?: AnimatedFilterGridSort
  label?: string
  columns?: AnimatedFilterGridColumns
  duration?: number
  stagger?: number
  disabled?: boolean
}

export interface AnimatedFilterGridEvents {
  select: [item: AnimatedFilterGridItem]
  settled: [items: AnimatedFilterGridItem[]]
}

export interface AnimatedFilterGridExpose {
  focus: (id?: string) => Promise<boolean>
  select: (id: string) => boolean
}

const props = withDefaults(defineProps<AnimatedFilterGridProps>(), {
  filter: 'all',
  sort: 'default',
  label: 'Items',
  columns: 3,
  duration: 360,
  stagger: 45,
  disabled: false,
})

const model = defineModel<string | null>({ default: null })
const emit = defineEmits<AnimatedFilterGridEvents>()

const root = ref<HTMLDivElement>()
const rovingId = ref('')
const buttons = new Map<string, HTMLButtonElement>()
let mounted = false
let settleTimer: ReturnType<typeof setTimeout> | undefined

const safeDuration = computed(() => Math.max(0, Math.min(2000, props.duration)))
const safeStagger = computed(() => Math.max(0, Math.min(250, props.stagger)))
const visibleItems = computed(() => {
  const requestedCategory = props.filter.trim().toLocaleLowerCase()
  const filtered = !requestedCategory || requestedCategory === 'all'
    ? [...props.items]
    : props.items.filter(item => item.category.toLocaleLowerCase() === requestedCategory)

  if (props.sort === 'default') return filtered

  const direction = props.sort.endsWith('desc') ? -1 : 1
  const field: 'title' | 'category' = props.sort.startsWith('category') ? 'category' : 'title'
  return filtered.sort((a, b) => direction * a[field].localeCompare(b[field], undefined, { sensitivity: 'base' }))
})
const enabledItems = computed(() => props.disabled ? [] : visibleItems.value.filter(item => !item.disabled))
const gridClass = computed(() => ({
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
})[props.columns])

function setButton(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) buttons.set(id, element)
  else buttons.delete(id)
}

function transitionStyle(index: number): CSSProperties {
  return {
    transitionDuration: `${safeDuration.value}ms`,
    transitionDelay: `${index * safeStagger.value}ms`,
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function queueSettled(itemCount = visibleItems.value.length) {
  if (!mounted) return
  if (settleTimer) clearTimeout(settleTimer)
  const wait = prefersReducedMotion() ? 0 : safeDuration.value + Math.max(0, itemCount - 1) * safeStagger.value
  settleTimer = setTimeout(() => emit('settled', [...visibleItems.value]), wait)
}

async function focusItem(id?: string): Promise<boolean> {
  const target = id
    ? enabledItems.value.find(item => item.id === id)
    : enabledItems.value.find(item => item.id === model.value) ?? enabledItems.value[0]
  if (!target) return false
  rovingId.value = target.id
  await nextTick()
  const button = buttons.get(target.id)
  if (!button) return false
  button.focus()
  return true
}

function selectItem(id: string): boolean {
  const item = enabledItems.value.find(candidate => candidate.id === id)
  if (!item) return false
  rovingId.value = item.id
  model.value = item.id
  emit('select', item)
  return true
}

function onKeydown(event: KeyboardEvent, item: AnimatedFilterGridItem) {
  const index = enabledItems.value.findIndex(candidate => candidate.id === item.id)
  if (index < 0) return

  let nextIndex = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % enabledItems.value.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + enabledItems.value.length) % enabledItems.value.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = enabledItems.value.length - 1
  else return

  event.preventDefault()
  void focusItem(enabledItems.value[nextIndex]?.id)
}

watch(() => visibleItems.value.map(item => item.id).join('\u0000'), (ids, previousIds) => {
  queueSettled(Math.max(ids ? ids.split('\u0000').length : 0, previousIds ? previousIds.split('\u0000').length : 0))
}, { flush: 'post' })
watch(() => [safeDuration.value, safeStagger.value], () => queueSettled())
watch(() => enabledItems.value.map(item => item.id), async (ids) => {
  if (ids.includes(rovingId.value)) return
  const hadGridFocus = typeof document !== 'undefined' && Boolean(root.value?.contains(document.activeElement))
  rovingId.value = ids.includes(model.value ?? '') ? model.value ?? '' : ids[0] ?? ''
  if (!hadGridFocus) return
  await nextTick()
  if (rovingId.value) buttons.get(rovingId.value)?.focus()
  else root.value?.focus()
}, { immediate: true })
watch(model, (id) => {
  if (id && enabledItems.value.some(item => item.id === id)) rovingId.value = id
})

onMounted(() => { mounted = true })
onBeforeUnmount(() => { if (settleTimer) clearTimeout(settleTimer) })

defineExpose<AnimatedFilterGridExpose>({ focus: focusItem, select: selectItem })
</script>

<template>
  <div ref="root" tabindex="-1" class="animated-filter-grid relative w-full min-w-0 text-[#171814] outline-none">
    <TransitionGroup
      tag="ul"
      role="list"
      :aria-label="label"
      class="m-0 grid list-none gap-3 p-0 outline-none"
      :class="gridClass"
      enter-active-class="transition-[opacity,transform] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none motion-reduce:delay-0"
      leave-active-class="transition-[opacity,transform] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none motion-reduce:delay-0"
      move-class="transition-transform ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none motion-reduce:delay-0"
      enter-from-class="translate-y-3 scale-[.97] opacity-0"
      leave-to-class="-translate-y-2 scale-[.97] opacity-0"
    >
      <li
        v-for="(item, index) in visibleItems"
        :key="item.id"
        role="listitem"
        class="min-w-0"
        :style="transitionStyle(index)"
      >
        <button
          :ref="element => setButton(element, item.id)"
          type="button"
          :data-item-id="item.id"
          :tabindex="!disabled && !item.disabled && item.id === rovingId ? 0 : -1"
          :disabled="disabled || item.disabled"
          :aria-pressed="model === item.id"
          class="group relative flex min-h-40 w-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[#1718141a] bg-[#ffffffd9] p-4 text-left [font:inherit] shadow-[0_18px_42px_-34px_#171814b3] outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:border-[#17181455] hover:not-disabled:bg-white hover:not-disabled:shadow-[0_22px_46px_-30px_#17181499] focus-visible:border-[#171814] focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57),0_22px_46px_-30px_#17181499] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none aria-pressed:border-[#171814] aria-pressed:bg-[color-mix(in_srgb,var(--registry-accent,#d9ff57)_20%,white)]"
          @focus="rovingId = item.id"
          @keydown="onKeydown($event, item)"
          @click="selectItem(item.id)"
        >
          <span class="mb-5 flex w-full items-center justify-between gap-3">
            <span class="rounded-full bg-[#1718140a] px-2.5 py-1 text-[9px] font-bold tracking-[.12em] text-[#17181480] uppercase group-aria-pressed:bg-[#171814] group-aria-pressed:text-[var(--registry-accent,#d9ff57)]">{{ item.category }}</span>
            <span v-if="model === item.id" class="grid size-5 place-items-center rounded-full bg-[#171814] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
              <svg class="size-3 fill-none stroke-current stroke-2" viewBox="0 0 16 16"><path d="m3.5 8 2.8 2.8 6.2-6.2" /></svg>
            </span>
          </span>
          <slot name="item" :item="item" :selected="model === item.id">
            <strong class="text-[14px] leading-tight font-semibold tracking-[-.015em]">{{ item.title }}</strong>
            <span v-if="item.description" class="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#1718148c]">{{ item.description }}</span>
            <span v-if="item.meta" class="mt-auto pt-5 text-[10px] font-semibold text-[#1718148c]">{{ item.meta }}</span>
          </slot>
        </button>
      </li>
    </TransitionGroup>
    <p v-if="!visibleItems.length" class="rounded-[20px] border border-dashed border-[#17181426] bg-white/45 px-5 py-12 text-center text-xs text-[#17181480]" role="status">No items match this filter.</p>
  </div>
</template>
