<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'

export interface ReorderListItem {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  label?: string
  disabled?: boolean
  showPositions?: boolean
}>(), {
  label: 'Reorder items',
  disabled: false,
  showPositions: true,
})

const model = defineModel<ReorderListItem[]>({ default: () => [] })
const emit = defineEmits<{
  reorder: [items: ReorderListItem[], item: ReorderListItem, from: number, to: number]
  dragStart: [item: ReorderListItem, index: number]
  dragEnd: [item: ReorderListItem, index: number]
}>()

const list = ref<HTMLElement>()
const draggingId = ref('')
const overIndex = ref(-1)
const announcement = ref('')
const handles = new Map<string, HTMLButtonElement>()
const instructionId = `reorder-instructions-${useId()}`
let pointerId: number | undefined

function setHandle(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) handles.set(id, element)
  else handles.delete(id)
}

async function focusHandle(id: string) {
  await nextTick()
  handles.get(id)?.focus()
}

function reorder(from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= model.value.length || to >= model.value.length) return
  const next = [...model.value]
  const item = next.splice(from, 1)[0]
  if (!item) return
  next.splice(to, 0, item)
  model.value = next
  announcement.value = `${item.label} moved to position ${to + 1} of ${next.length}.`
  emit('reorder', next, item, from, to)
  focusHandle(item.id)
}

function moveWithKeyboard(event: KeyboardEvent, item: ReorderListItem) {
  if (props.disabled || item.disabled) return
  const from = model.value.findIndex(candidate => candidate.id === item.id)
  let to = from
  if (event.key === 'ArrowUp') to = Math.max(0, from - 1)
  else if (event.key === 'ArrowDown') to = Math.min(model.value.length - 1, from + 1)
  else if (event.key === 'Home') to = 0
  else if (event.key === 'End') to = model.value.length - 1
  else return
  event.preventDefault()
  reorder(from, to)
}

function onPointerDown(event: PointerEvent, item: ReorderListItem, index: number) {
  if (props.disabled || item.disabled || event.button !== 0) return
  event.preventDefault()
  pointerId = event.pointerId
  draggingId.value = item.id
  overIndex.value = index
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  emit('dragStart', item, index)
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId.value || event.pointerId !== pointerId) return
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-reorder-index]')
  if (!target || !list.value?.contains(target)) return
  const index = Number(target.dataset.reorderIndex)
  if (Number.isInteger(index)) overIndex.value = index
}

function finishPointer(event: PointerEvent, commit: boolean) {
  if (!draggingId.value || event.pointerId !== pointerId) return
  const id = draggingId.value
  const from = model.value.findIndex(item => item.id === id)
  const to = overIndex.value
  const item = model.value[from]
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
  draggingId.value = ''
  overIndex.value = -1
  pointerId = undefined
  if (commit) reorder(from, to)
  if (item) emit('dragEnd', item, commit && to >= 0 ? to : from)
}

watch(() => props.disabled, (disabled) => {
  if (!disabled) return
  draggingId.value = ''
  overIndex.value = -1
  pointerId = undefined
})
</script>

<template>
  <div ref="list" class="reorder-list w-full max-w-[520px] text-[#171814]" role="region" :aria-label="label">
    <p :id="instructionId" class="sr-only">Use the drag handle with a pointer, or focus it and press Arrow Up, Arrow Down, Home, or End.</p>
    <TransitionGroup
      tag="ol"
      class="m-0 grid list-none gap-2.5 p-0"
      move-class="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
    >
      <li
        v-for="(item, index) in model"
        :key="item.id"
        :data-reorder-index="index"
        :data-reorder-id="item.id"
        class="reorder-item flex min-w-0 items-center gap-3 rounded-2xl border border-[#1718141a] bg-[#ffffffd9] p-2.5 shadow-[0_12px_30px_-26px_#0009] transition-[border-color,box-shadow,opacity,transform] duration-200 motion-reduce:transition-none"
        :class="{
          'scale-[.985] opacity-45 shadow-none': draggingId === item.id,
          'border-[#171814] shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)]': draggingId && overIndex === index && draggingId !== item.id,
          'opacity-50': item.disabled,
        }"
      >
        <button
          :ref="element => setHandle(element, item.id)"
          type="button"
          class="reorder-handle grid size-10 shrink-0 touch-none cursor-grab place-items-center rounded-xl border border-[#17181414] bg-[#17181408] text-[#17181470] outline-none transition-colors hover:not-disabled:bg-[#171814] hover:not-disabled:text-[var(--registry-accent,#d9ff57)] focus-visible:bg-[#171814] focus-visible:text-[var(--registry-accent,#d9ff57)] focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] active:not-disabled:cursor-grabbing disabled:cursor-not-allowed"
          :class="{ 'cursor-grabbing bg-[#171814] text-[var(--registry-accent,#d9ff57)]': draggingId === item.id }"
          :disabled="disabled || item.disabled"
          :aria-label="`Move ${item.label}. Position ${index + 1} of ${model.length}`"
          :aria-describedby="instructionId"
          @keydown="moveWithKeyboard($event, item)"
          @pointerdown="onPointerDown($event, item, index)"
          @pointermove="onPointerMove"
          @pointerup="finishPointer($event, true)"
          @pointercancel="finishPointer($event, false)"
        >
          <svg class="size-4 fill-current" viewBox="0 0 20 20" aria-hidden="true"><circle cx="6" cy="5" r="1.2" /><circle cx="14" cy="5" r="1.2" /><circle cx="6" cy="10" r="1.2" /><circle cx="14" cy="10" r="1.2" /><circle cx="6" cy="15" r="1.2" /><circle cx="14" cy="15" r="1.2" /></svg>
        </button>
        <div class="min-w-0 flex-1">
          <slot name="item" :item="item" :index="index">
            <strong class="block truncate text-[13px] font-semibold">{{ item.label }}</strong>
            <p v-if="item.description" class="mt-0.5 truncate text-[10px] text-[#17181470]">{{ item.description }}</p>
          </slot>
        </div>
        <span v-if="showPositions" class="grid size-7 shrink-0 place-items-center rounded-full bg-[#17181408] text-[9px] font-bold tabular-nums text-[#17181470]" aria-hidden="true">{{ index + 1 }}</span>
      </li>
    </TransitionGroup>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>
