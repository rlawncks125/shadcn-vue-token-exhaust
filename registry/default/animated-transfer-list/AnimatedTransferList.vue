<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface AnimatedTransferItem {
  id: string
  label: string
  description?: string
  meta?: string
  disabled?: boolean
}

interface NormalizedTransferItem extends AnimatedTransferItem {
  disabled: boolean
  source: AnimatedTransferItem
}

type TransferSide = 'source' | 'destination'
type TransferDirection = 'toDestination' | 'toSource'

const props = withDefaults(defineProps<{
  items: AnimatedTransferItem[]
  modelValue: string[]
  activeIds?: string[]
  sourceLabel?: string
  destinationLabel?: string
  disabled?: boolean
  duration?: number
}>(), {
  activeIds: () => [],
  sourceLabel: 'Available',
  destinationLabel: 'Selected',
  disabled: false,
  duration: 280,
})

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
  'update:activeIds': [ids: string[]]
  transfer: [items: AnimatedTransferItem[], direction: TransferDirection]
}>()

const instanceId = `animated-transfer-${useId()}`
const announcement = ref('')
const focused = ref<Record<TransferSide, string>>({ source: '', destination: '' })
const anchors = ref<Record<TransferSide, string>>({ source: '', destination: '' })
const optionElements = new Map<string, HTMLElement>()
const listElements = ref<Record<TransferSide, HTMLElement | null>>({ source: null, destination: null })

const safeDuration = computed(() => {
  const duration = Number(props.duration)
  return Number.isFinite(duration) ? Math.min(2000, Math.max(0, duration)) : 280
})
const normalizedItems = computed<NormalizedTransferItem[]>(() => {
  if (!Array.isArray(props.items)) return []
  const seen = new Set<string>()
  const result: NormalizedTransferItem[] = []
  for (const candidate of props.items as unknown[]) {
    if (!candidate || typeof candidate !== 'object') continue
    const item = candidate as Partial<AnimatedTransferItem>
    if (typeof item.id !== 'string' || !item.id.trim() || seen.has(item.id)) continue
    seen.add(item.id)
    result.push({
      id: item.id,
      label: typeof item.label === 'string' && item.label.trim() ? item.label : item.id,
      description: typeof item.description === 'string' && item.description.trim() ? item.description : undefined,
      meta: typeof item.meta === 'string' && item.meta.trim() ? item.meta : undefined,
      disabled: Boolean(item.disabled),
      source: candidate as AnimatedTransferItem,
    })
  }
  return result
})
const itemById = computed(() => new Map(normalizedItems.value.map((item) => [item.id, item])))

function normalizeIds(value: unknown, available: Set<string>) {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.filter((id): id is string => {
    if (typeof id !== 'string' || !available.has(id) || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const destinationIds = computed(() => normalizeIds(props.modelValue, new Set(itemById.value.keys())))
const destinationSet = computed(() => new Set(destinationIds.value))
const sourceItems = computed(() => normalizedItems.value.filter((item) => !destinationSet.value.has(item.id)))
const destinationItems = computed(() => destinationIds.value.map((id) => itemById.value.get(id)).filter((item): item is NormalizedTransferItem => Boolean(item)))
const activeValues = computed(() => normalizeIds(props.activeIds, new Set(itemById.value.keys())))
const activeSet = computed(() => new Set(activeValues.value))
const activeSource = computed(() => sourceItems.value.filter((item) => activeSet.value.has(item.id) && !item.disabled))
const activeDestination = computed(() => destinationItems.value.filter((item) => activeSet.value.has(item.id) && !item.disabled))

function itemsFor(side: TransferSide) {
  return side === 'source' ? sourceItems.value : destinationItems.value
}

function setOptionElement(element: unknown, side: TransferSide, id: string) {
  const key = `${side}:${id}`
  if (element instanceof HTMLElement) optionElements.set(key, element)
  else optionElements.delete(key)
}

function setListElement(element: unknown, side: TransferSide) {
  listElements.value[side] = element instanceof HTMLElement ? element : null
}

async function focus(side: TransferSide = 'source', id?: string) {
  if (props.disabled) return
  const items = itemsFor(side)
  const requested = items.find((item) => item.id === id)
  const current = items.find((item) => item.id === focused.value[side])
  const target = requested ?? current ?? items[0]
  if (!target) {
    await nextTick()
    listElements.value[side]?.focus()
    return
  }
  focused.value[side] = target.id
  await nextTick()
  optionElements.get(`${side}:${target.id}`)?.focus()
}

function setActive(ids: string[]) {
  const available = new Set(itemById.value.keys())
  emit('update:activeIds', normalizeIds(ids, available))
}

function toggleActive(item: NormalizedTransferItem, side: TransferSide) {
  if (props.disabled || item.disabled) {
    announcement.value = `${item.label} is unavailable.`
    return
  }
  focused.value[side] = item.id
  anchors.value[side] = item.id
  setActive(activeSet.value.has(item.id) ? activeValues.value.filter((id) => id !== item.id) : [...activeValues.value, item.id])
}

function selectRange(side: TransferSide, item: NormalizedTransferItem) {
  if (props.disabled || item.disabled) return
  const items = itemsFor(side)
  const anchorIndex = items.findIndex((candidate) => candidate.id === anchors.value[side])
  const targetIndex = items.findIndex((candidate) => candidate.id === item.id)
  if (anchorIndex < 0 || targetIndex < 0) {
    toggleActive(item, side)
    return
  }
  const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex]
  const range = items.slice(start, end + 1).filter((candidate) => !candidate.disabled).map((candidate) => candidate.id)
  setActive([...activeValues.value, ...range])
}

function handleClick(event: MouseEvent, item: NormalizedTransferItem, side: TransferSide) {
  if (event.shiftKey) selectRange(side, item)
  else toggleActive(item, side)
}

function move(ids: string[], direction: TransferDirection) {
  if (props.disabled) return
  const fromSide: TransferSide = direction === 'toDestination' ? 'source' : 'destination'
  const toSide: TransferSide = direction === 'toDestination' ? 'destination' : 'source'
  const available = new Set(itemsFor(fromSide).filter((item) => !item.disabled).map((item) => item.id))
  const movingIds = normalizeIds(ids, available)
  if (!movingIds.length) {
    announcement.value = `No available items to move to ${toSide}.`
    return
  }
  const movingSet = new Set(movingIds)
  const next = direction === 'toDestination'
    ? [...destinationIds.value, ...sourceItems.value.filter((item) => movingSet.has(item.id)).map((item) => item.id)]
    : destinationIds.value.filter((id) => !movingSet.has(id))
  const movedItems = movingIds.map((id) => itemById.value.get(id)).filter((item): item is NormalizedTransferItem => Boolean(item))
  emit('update:modelValue', next)
  setActive(activeValues.value.filter((id) => !movingSet.has(id)))
  emit('transfer', movedItems.map((item) => item.source), direction)
  announcement.value = `${movedItems.length} item${movedItems.length === 1 ? '' : 's'} moved to ${toSide}.`
  focused.value[toSide] = movedItems[0]?.id ?? ''
  nextTick(() => focus(toSide, movedItems[0]?.id))
}

function moveSelected(direction: TransferDirection) {
  move(direction === 'toDestination' ? activeSource.value.map((item) => item.id) : activeDestination.value.map((item) => item.id), direction)
}

function moveAll(direction: TransferDirection) {
  const side: TransferSide = direction === 'toDestination' ? 'source' : 'destination'
  move(itemsFor(side).filter((item) => !item.disabled).map((item) => item.id), direction)
}

function clear() {
  moveAll('toSource')
}

function handleKeydown(event: KeyboardEvent, item: NormalizedTransferItem, side: TransferSide) {
  const items = itemsFor(side)
  const index = items.findIndex((candidate) => candidate.id === item.id)
  let targetIndex = index
  if (event.key === 'ArrowDown') targetIndex = Math.min(items.length - 1, index + 1)
  else if (event.key === 'ArrowUp') targetIndex = Math.max(0, index - 1)
  else if (event.key === 'Home') targetIndex = 0
  else if (event.key === 'End') targetIndex = items.length - 1
  else if (event.key === ' ' || event.key === 'Enter') {
    toggleActive(item, side)
    event.preventDefault()
    return
  }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'a') {
    const ids = items.filter((candidate) => !candidate.disabled).map((candidate) => candidate.id)
    setActive([...activeValues.value, ...ids])
    announcement.value = `${ids.length} ${side} item${ids.length === 1 ? '' : 's'} selected.`
    event.preventDefault()
    return
  }
  else return

  event.preventDefault()
  const target = items[targetIndex]
  if (!target) return
  if (event.shiftKey) selectRange(side, target)
  focus(side, target.id)
}

watch([sourceItems, destinationItems], ([source, destination]) => {
  for (const [side, items] of [['source', source], ['destination', destination]] as const) {
    if (!items.length) focused.value[side] = ''
    else if (!items.some((item) => item.id === focused.value[side])) focused.value[side] = items[0]!.id
  }
}, { immediate: true })

onBeforeUnmount(() => optionElements.clear())

defineExpose({ moveSelected, moveAll, clear, focus })
</script>

<template>
  <div class="animated-transfer-list min-w-0 text-[#171a19]" :class="{ 'opacity-55': disabled }" :style="{ '--transfer-duration': `${safeDuration}ms` }" data-testid="animated-transfer-list">
    <div class="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] lg:items-center">
      <section class="min-w-0 overflow-hidden rounded-[22px] border border-[#171a191f] bg-white/80 shadow-[0_20px_45px_-40px_rgba(23,26,25,0.8)]">
        <header class="flex items-center justify-between gap-3 border-b border-[#171a1914] px-4 py-3.5">
          <div><h3 :id="`${instanceId}-source-label`" class="text-xs font-bold">{{ sourceLabel }}</h3><p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#171a1966]">{{ sourceItems.length }} records</p></div>
          <span class="rounded-full bg-[#171a190a] px-2.5 py-1 text-[9px] font-bold tabular-nums">{{ activeSource.length }} active</span>
        </header>
        <TransitionGroup
          :ref="element => setListElement(element, 'source')"
          tag="ul"
          role="listbox"
          aria-multiselectable="true"
          :aria-labelledby="`${instanceId}-source-label`"
          :aria-disabled="disabled || undefined"
          :tabindex="sourceItems.length ? -1 : 0"
          data-testid="transfer-source-list"
          name="transfer-item"
          move-class="transfer-item-move"
          class="m-0 grid min-h-[250px] list-none content-start gap-2 p-3 outline-none sm:min-h-[290px]"
        >
          <li
            v-for="item in sourceItems"
            :key="item.id"
            :ref="element => setOptionElement(element, 'source', item.id)"
            role="option"
            :aria-selected="activeSet.has(item.id)"
            :aria-disabled="disabled || item.disabled || undefined"
            :tabindex="!disabled && focused.source === item.id ? 0 : -1"
            :data-testid="`transfer-source-${item.id}`"
            class="group flex min-w-0 cursor-default items-center gap-3 rounded-2xl border p-3 outline-none transition-[border-color,background-color,box-shadow,opacity] focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] motion-reduce:transition-none"
            :class="[
              activeSet.has(item.id) ? 'border-[#171a19] bg-[#eef9c9]' : 'border-[#171a1917] bg-[#fafbf8] hover:border-[#171a1959]',
              { 'opacity-40': item.disabled },
            ]"
            @focus="focused.source = item.id"
            @click="handleClick($event, item, 'source')"
            @keydown="handleKeydown($event, item, 'source')"
          >
            <span class="grid size-8 shrink-0 place-items-center rounded-xl border border-[#171a1914] bg-white text-[10px] font-black uppercase" aria-hidden="true">{{ item.label.slice(0, 2) }}</span>
            <span class="min-w-0 flex-1"><span class="block truncate text-xs font-bold">{{ item.label }}</span><span v-if="item.description" class="mt-0.5 block truncate text-[10px] text-[#171a1966]">{{ item.description }}</span></span>
            <span v-if="item.meta" class="shrink-0 text-[9px] font-bold text-[#171a1959]">{{ item.meta }}</span>
          </li>
        </TransitionGroup>
      </section>

      <div class="grid grid-cols-4 gap-1.5 lg:grid-cols-1" aria-label="Transfer controls">
        <button type="button" data-testid="move-selected-to-destination" class="transfer-control" :disabled="disabled || !activeSource.length" aria-label="Move selected to destination" @click="moveSelected('toDestination')"><svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
        <button type="button" data-testid="move-all-to-destination" class="transfer-control" :disabled="disabled || !sourceItems.some(item => !item.disabled)" aria-label="Move all to destination" @click="moveAll('toDestination')"><span class="text-xs font-black" aria-hidden="true">»</span></button>
        <button type="button" data-testid="move-selected-to-source" class="transfer-control" :disabled="disabled || !activeDestination.length" aria-label="Move selected to source" @click="moveSelected('toSource')"><svg class="size-4 rotate-180 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
        <button type="button" data-testid="move-all-to-source" class="transfer-control" :disabled="disabled || !destinationItems.some(item => !item.disabled)" aria-label="Move all to source" @click="moveAll('toSource')"><span class="text-xs font-black" aria-hidden="true">«</span></button>
      </div>

      <section class="min-w-0 overflow-hidden rounded-[22px] border border-[#171a191f] bg-[#171a19] text-white shadow-[0_24px_55px_-38px_rgba(23,26,25,0.9)]">
        <header class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
          <div><h3 :id="`${instanceId}-destination-label`" class="text-xs font-bold">{{ destinationLabel }}</h3><p class="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/40">{{ destinationItems.length }} records</p></div>
          <span class="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold tabular-nums">{{ activeDestination.length }} active</span>
        </header>
        <TransitionGroup
          :ref="element => setListElement(element, 'destination')"
          tag="ul"
          role="listbox"
          aria-multiselectable="true"
          :aria-labelledby="`${instanceId}-destination-label`"
          :aria-disabled="disabled || undefined"
          :tabindex="destinationItems.length ? -1 : 0"
          data-testid="transfer-destination-list"
          name="transfer-item"
          move-class="transfer-item-move"
          class="m-0 grid min-h-[250px] list-none content-start gap-2 p-3 outline-none sm:min-h-[290px]"
        >
          <li
            v-for="item in destinationItems"
            :key="item.id"
            :ref="element => setOptionElement(element, 'destination', item.id)"
            role="option"
            :aria-selected="activeSet.has(item.id)"
            :aria-disabled="disabled || item.disabled || undefined"
            :tabindex="!disabled && focused.destination === item.id ? 0 : -1"
            :data-testid="`transfer-destination-${item.id}`"
            class="group flex min-w-0 cursor-default items-center gap-3 rounded-2xl border p-3 outline-none transition-[border-color,background-color,box-shadow,opacity] focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] motion-reduce:transition-none"
            :class="[
              activeSet.has(item.id) ? 'border-[var(--registry-accent,#d9ff57)] bg-[var(--registry-accent,#d9ff57)] text-[#171a19]' : 'border-white/10 bg-white/[0.06] hover:border-white/30',
              { 'opacity-40': item.disabled },
            ]"
            @focus="focused.destination = item.id"
            @click="handleClick($event, item, 'destination')"
            @keydown="handleKeydown($event, item, 'destination')"
          >
            <span class="grid size-8 shrink-0 place-items-center rounded-xl border border-current/15 bg-current/[0.08] text-[10px] font-black uppercase" aria-hidden="true">{{ item.label.slice(0, 2) }}</span>
            <span class="min-w-0 flex-1"><span class="block truncate text-xs font-bold">{{ item.label }}</span><span v-if="item.description" class="mt-0.5 block truncate text-[10px] opacity-55">{{ item.description }}</span></span>
            <span v-if="item.meta" class="shrink-0 text-[9px] font-bold opacity-45">{{ item.meta }}</span>
          </li>
        </TransitionGroup>
      </section>
    </div>
    <p data-testid="transfer-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.transfer-control {
  display: grid;
  min-height: 2.5rem;
  place-items: center;
  border: 1px solid rgb(23 26 25 / 0.14);
  border-radius: 0.8rem;
  background: rgb(255 255 255 / 0.72);
  color: #171a19;
  outline: none;
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.transfer-control:hover:not(:disabled) { background: var(--registry-accent, #d9ff57); }
.transfer-control:active:not(:disabled) { transform: scale(0.94); }
.transfer-control:focus-visible { box-shadow: 0 0 0 3px var(--registry-accent, #d9ff57); }
.transfer-control:disabled { cursor: not-allowed; opacity: 0.32; }

.transfer-item-enter-active,
.transfer-item-leave-active,
.transfer-item-move {
  transition-duration: var(--transfer-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.transfer-item-enter-from { opacity: 0; transform: translateX(-12px) scale(0.96); }
.transfer-item-leave-to { opacity: 0; transform: translateX(12px) scale(0.96); }

@media (prefers-reduced-motion: reduce) {
  .transfer-control,
  .transfer-item-enter-active,
  .transfer-item-leave-active,
  .transfer-item-move { transition: none; }
}
</style>
