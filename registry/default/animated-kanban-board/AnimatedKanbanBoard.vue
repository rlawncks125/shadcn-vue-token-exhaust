<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface KanbanColumn {
  id: string
  title: string
  description?: string
  color?: string
}

export interface KanbanCard {
  id: string
  columnId: string
  title: string
  description?: string
  tag?: string
  disabled?: boolean
}

export interface KanbanCardPosition {
  columnId: string
  index: number
}

interface NormalizedColumn extends KanbanColumn {
  source: KanbanColumn
}

interface NormalizedCard extends KanbanCard {
  disabled: boolean
  source: KanbanCard
}

const props = withDefaults(defineProps<{
  columns: KanbanColumn[]
  modelValue: KanbanCard[]
  label?: string
  duration?: number
  disabled?: boolean
}>(), {
  label: 'Kanban board',
  duration: 260,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [cards: KanbanCard[]]
  move: [card: KanbanCard, previous: KanbanCardPosition, next: KanbanCardPosition]
}>()

function normalizeColumns(value: unknown): NormalizedColumn[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const result: NormalizedColumn[] = []
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue
    const column = candidate as Partial<KanbanColumn>
    const id = typeof column.id === 'string' ? column.id.trim() : ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push({
      id,
      title: typeof column.title === 'string' && column.title.trim() ? column.title.trim() : id,
      description: typeof column.description === 'string' && column.description.trim() ? column.description.trim() : undefined,
      color: typeof column.color === 'string' && column.color.trim() ? column.color.trim() : undefined,
      source: candidate as KanbanColumn,
    })
  }
  return result
}

function normalizeCards(value: unknown, availableColumns: Set<string>): NormalizedCard[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const result: NormalizedCard[] = []
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue
    const card = candidate as Partial<KanbanCard>
    const id = typeof card.id === 'string' ? card.id.trim() : ''
    const columnId = typeof card.columnId === 'string' ? card.columnId.trim() : ''
    if (!id || seen.has(id) || !availableColumns.has(columnId)) continue
    seen.add(id)
    result.push({
      id,
      columnId,
      title: typeof card.title === 'string' && card.title.trim() ? card.title.trim() : id,
      description: typeof card.description === 'string' && card.description.trim() ? card.description.trim() : undefined,
      tag: typeof card.tag === 'string' && card.tag.trim() ? card.tag.trim() : undefined,
      disabled: Boolean(card.disabled),
      source: candidate as KanbanCard,
    })
  }
  return result
}

function outputCard(card: NormalizedCard, columnId = card.columnId): KanbanCard {
  return {
    ...card.source,
    id: card.id,
    columnId,
    title: card.title,
    description: card.description,
    tag: card.tag,
    disabled: card.disabled || undefined,
  }
}

const normalizedColumns = computed(() => normalizeColumns(props.columns))
const normalizedCards = computed(() => normalizeCards(props.modelValue, new Set(normalizedColumns.value.map(column => column.id))))
const columnById = computed(() => new Map(normalizedColumns.value.map(column => [column.id, column])))
const cardById = computed(() => new Map(normalizedCards.value.map(card => [card.id, card])))
const cardsByColumn = computed(() => {
  const groups = new Map<string, NormalizedCard[]>(normalizedColumns.value.map(column => [column.id, []]))
  for (const card of normalizedCards.value) groups.get(card.columnId)?.push(card)
  return groups
})
const safeDuration = computed(() => {
  const duration = Number(props.duration)
  return Number.isFinite(duration) ? Math.min(2000, Math.max(0, duration)) : 260
})

const initialCards = normalizeCards(props.modelValue, new Set(normalizeColumns(props.columns).map(column => column.id))).map(card => outputCard(card))
const boardId = `animated-kanban-${useId()}`
const instructionId = `${boardId}-instructions`
const activeId = ref('')
const pickedId = ref('')
const target = ref<KanbanCardPosition | null>(null)
const announcement = ref('')
const draggingId = ref('')
const cardElements = new Map<string, HTMLElement>()
let activePointer: number | null = null
let pointerElement: HTMLElement | null = null

function cardsFor(columnId: string) {
  return cardsByColumn.value.get(columnId) ?? []
}

function positionOf(cardId: string): KanbanCardPosition | null {
  const card = cardById.value.get(cardId)
  if (!card) return null
  const index = cardsFor(card.columnId).findIndex(candidate => candidate.id === cardId)
  return index < 0 ? null : { columnId: card.columnId, index }
}

function setCardElement(element: unknown, id: string) {
  if (element instanceof HTMLElement) cardElements.set(id, element)
  else cardElements.delete(id)
}

async function focus(cardId?: string) {
  if (props.disabled) return
  const requested = cardId && cardById.value.has(cardId) ? cardId : undefined
  const id = requested ?? (cardById.value.has(activeId.value) ? activeId.value : normalizedCards.value[0]?.id)
  if (!id) return
  activeId.value = id
  await nextTick()
  cardElements.get(id)?.focus()
}

function destinationLength(columnId: string, movingId: string) {
  return cardsFor(columnId).filter(card => card.id !== movingId).length
}

function normalizedIndex(value: number | undefined, maximum: number) {
  if (value === undefined || !Number.isFinite(value)) return maximum
  return Math.min(maximum, Math.max(0, Math.floor(value)))
}

function moveCard(cardId: string, columnId: string, index?: number) {
  const card = cardById.value.get(cardId)
  const column = columnById.value.get(columnId)
  const previous = positionOf(cardId)
  if (props.disabled || !card || card.disabled || !column || !previous) return false

  const nextIndex = normalizedIndex(index, destinationLength(columnId, cardId))
  if (previous.columnId === columnId && previous.index === nextIndex) {
    announcement.value = `${card.title} remains in ${column.title}, position ${nextIndex + 1}.`
    return false
  }

  const groups = new Map<string, NormalizedCard[]>(normalizedColumns.value.map(item => [item.id, []]))
  for (const candidate of normalizedCards.value) {
    if (candidate.id !== cardId) groups.get(candidate.columnId)?.push(candidate)
  }
  groups.get(columnId)?.splice(nextIndex, 0, card)
  const nextCards = normalizedColumns.value.flatMap(item => (groups.get(item.id) ?? []).map(candidate => outputCard(candidate, candidate.id === cardId ? columnId : candidate.columnId)))
  const movedCard = nextCards.find(candidate => candidate.id === cardId)
  if (!movedCard) return false

  const next = { columnId, index: nextIndex }
  emit('update:modelValue', nextCards)
  emit('move', movedCard, previous, next)
  activeId.value = cardId
  announcement.value = `${card.title} moved to ${column.title}, position ${nextIndex + 1}.`
  nextTick(() => focus(cardId))
  return true
}

function reset() {
  if (props.disabled) return
  emit('update:modelValue', initialCards.map(card => ({ ...card })))
  pickedId.value = ''
  target.value = null
  announcement.value = 'Board reset to its initial arrangement.'
  nextTick(() => focus(initialCards[0]?.id))
}

function cancelPickup(message = 'Move cancelled.') {
  if (!pickedId.value) return
  pickedId.value = ''
  target.value = null
  announcement.value = message
}

function pickUp(card: NormalizedCard) {
  const position = positionOf(card.id)
  if (props.disabled || card.disabled || !position) {
    announcement.value = `${card.title} cannot be moved.`
    return
  }
  pickedId.value = card.id
  target.value = position
  const column = columnById.value.get(position.columnId)
  announcement.value = `${card.title} picked up from ${column?.title}, position ${position.index + 1}. Use arrow keys to choose a position, then press Space or Enter to drop.`
}

function describeTarget() {
  if (!target.value) return
  const column = columnById.value.get(target.value.columnId)
  announcement.value = `Target ${column?.title}, position ${target.value.index + 1}.`
}

function changeKeyboardTarget(key: string) {
  const current = target.value
  if (!current || !pickedId.value) return
  const columns = normalizedColumns.value
  const columnIndex = columns.findIndex(column => column.id === current.columnId)
  let nextColumn = current.columnId
  let nextIndex = current.index

  if (key === 'ArrowUp') nextIndex--
  else if (key === 'ArrowDown') nextIndex++
  else if (key === 'Home') nextIndex = 0
  else if (key === 'End') nextIndex = destinationLength(nextColumn, pickedId.value)
  else if (key === 'ArrowLeft' && columnIndex > 0) nextColumn = columns[columnIndex - 1]!.id
  else if (key === 'ArrowRight' && columnIndex < columns.length - 1) nextColumn = columns[columnIndex + 1]!.id

  nextIndex = normalizedIndex(nextIndex, destinationLength(nextColumn, pickedId.value))
  target.value = { columnId: nextColumn, index: nextIndex }
  describeTarget()
}

function focusInDirection(card: NormalizedCard, key: string) {
  const current = positionOf(card.id)
  if (!current) return
  const columns = normalizedColumns.value
  const columnIndex = columns.findIndex(column => column.id === current.columnId)
  let next: NormalizedCard | undefined

  if (key === 'ArrowUp') next = cardsFor(current.columnId)[Math.max(0, current.index - 1)]
  else if (key === 'ArrowDown') next = cardsFor(current.columnId)[Math.min(cardsFor(current.columnId).length - 1, current.index + 1)]
  else if (key === 'Home') next = cardsFor(current.columnId)[0]
  else if (key === 'End') next = cardsFor(current.columnId).at(-1)
  else if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const step = key === 'ArrowLeft' ? -1 : 1
    for (let index = columnIndex + step; index >= 0 && index < columns.length; index += step) {
      const candidates = cardsFor(columns[index]!.id)
      if (candidates.length) {
        next = candidates[Math.min(current.index, candidates.length - 1)]
        break
      }
    }
  }
  if (next) focus(next.id)
}

function onKeydown(event: KeyboardEvent, card: NormalizedCard) {
  if (event.target !== event.currentTarget || props.disabled) return
  if (event.key === 'Escape' && pickedId.value) {
    event.preventDefault()
    cancelPickup()
    return
  }
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    if (!pickedId.value) pickUp(card)
    else if (target.value) {
      const movingId = pickedId.value
      const destination = target.value
      pickedId.value = ''
      target.value = null
      moveCard(movingId, destination.columnId, destination.index)
    }
    return
  }
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  if (pickedId.value) changeKeyboardTarget(event.key)
  else focusInDirection(card, event.key)
}

function pointerTarget(event: PointerEvent, cardId: string): KanbanCardPosition | null {
  const element = document.elementFromPoint(event.clientX, event.clientY)
  const columnElement = element?.closest<HTMLElement>('[data-kanban-column-id]')
  const columnId = columnElement?.dataset.kanbanColumnId
  if (!columnId || !columnById.value.has(columnId)) return null
  const cardElement = element?.closest<HTMLElement>('[data-kanban-card-id]')
  if (!cardElement || !columnElement.contains(cardElement)) return { columnId, index: destinationLength(columnId, cardId) }
  const hoveredId = cardElement.dataset.kanbanCardId
  const items = cardsFor(columnId).filter(card => card.id !== cardId)
  const hoveredIndex = items.findIndex(card => card.id === hoveredId)
  if (hoveredIndex < 0) return { columnId, index: destinationLength(columnId, cardId) }
  const rect = cardElement.getBoundingClientRect()
  return { columnId, index: hoveredIndex + (event.clientY > rect.top + rect.height / 2 ? 1 : 0) }
}

function onPointerDown(event: PointerEvent, card: NormalizedCard) {
  if (props.disabled || card.disabled || event.button !== 0) return
  event.preventDefault()
  cancelPickup('Keyboard move cancelled.')
  activePointer = event.pointerId
  draggingId.value = card.id
  target.value = positionOf(card.id)
  pointerElement = event.currentTarget as HTMLElement
  pointerElement.setPointerCapture(event.pointerId)
  announcement.value = `${card.title} drag started.`
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId.value || event.pointerId !== activePointer) return
  const next = pointerTarget(event, draggingId.value)
  if (next) target.value = next
}

function finishPointer(event?: PointerEvent, commit = false) {
  if (!draggingId.value || (event && event.pointerId !== activePointer)) return
  const cardId = draggingId.value
  const destination = target.value
  const pointerId = activePointer
  const element = pointerElement
  draggingId.value = ''
  target.value = null
  activePointer = null
  pointerElement = null
  if (pointerId !== null && element?.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  if (commit && destination) moveCard(cardId, destination.columnId, destination.index)
  else announcement.value = 'Drag cancelled.'
}

watch(normalizedCards, (cards) => {
  if (!cards.length) activeId.value = ''
  else if (!cards.some(card => card.id === activeId.value)) activeId.value = cards[0]!.id
  if (pickedId.value && !cards.some(card => card.id === pickedId.value)) cancelPickup()
}, { immediate: true })

watch(() => props.disabled, (disabled) => {
  if (!disabled) return
  cancelPickup()
  finishPointer(undefined, false)
})

onBeforeUnmount(() => {
  finishPointer(undefined, false)
  cardElements.clear()
})

defineExpose({ moveCard, reset, focus })
</script>

<template>
  <div
    :id="boardId"
    data-testid="animated-kanban-board"
    class="animated-kanban-board min-w-0 text-[#19201b]"
    :class="{ 'opacity-55': disabled }"
    :style="{ '--kanban-duration': `${safeDuration}ms` }"
    role="region"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
  >
    <p :id="instructionId" class="sr-only">Use arrow keys to navigate cards. Press Space or Enter to pick up a card, use arrow keys to choose its destination, then press Space or Enter to drop. Press Escape to cancel.</p>
    <div class="grid min-w-max grid-flow-col auto-cols-[minmax(244px,1fr)] gap-3 sm:auto-cols-[minmax(260px,1fr)]" :style="{ gridTemplateColumns: `repeat(${normalizedColumns.length || 1}, minmax(244px, 1fr))` }">
      <section
        v-for="column in normalizedColumns"
        :key="column.id"
        :data-kanban-column-id="column.id"
        :data-testid="`kanban-column-${column.id}`"
        class="flex min-h-[390px] min-w-0 flex-col rounded-[22px] border border-[#19201b14] bg-[#f2f1eb] p-2.5 transition-[border-color,background-color,box-shadow] motion-reduce:transition-none"
        :class="{ 'border-[#19201b] bg-[#f7f7f2] shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)]': target?.columnId === column.id && (draggingId || pickedId) }"
        :aria-labelledby="`${boardId}-${column.id}-label`"
      >
        <header class="flex items-start justify-between gap-3 px-2 pb-3 pt-1.5">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full" :style="{ backgroundColor: column.color || '#839078' }" aria-hidden="true" />
              <h2 :id="`${boardId}-${column.id}-label`" class="truncate text-[11px] font-black uppercase tracking-[0.14em]">{{ column.title }}</h2>
            </div>
            <p v-if="column.description" class="mt-1 truncate text-[9px] text-[#19201b73]">{{ column.description }}</p>
          </div>
          <span class="rounded-full border border-[#19201b14] bg-white/60 px-2 py-1 text-[9px] font-bold tabular-nums" :aria-label="`${cardsFor(column.id).length} cards`">{{ cardsFor(column.id).length }}</span>
        </header>

        <TransitionGroup
          tag="ol"
          name="kanban-card"
          move-class="kanban-card-move"
          class="m-0 grid flex-1 list-none content-start gap-2 p-0"
          :aria-label="`${column.title} cards`"
        >
          <li v-for="(card, index) in cardsFor(column.id)" :key="card.id" class="min-w-0">
            <article
              :ref="element => setCardElement(element, card.id)"
              :data-kanban-card-id="card.id"
              :data-testid="`kanban-card-${card.id}`"
              :tabindex="!disabled && activeId === card.id ? 0 : -1"
              :aria-disabled="disabled || card.disabled || undefined"
              :aria-describedby="instructionId"
              :aria-label="`${card.title}. ${column.title}, position ${index + 1} of ${cardsFor(column.id).length}${card.disabled ? '. Cannot be moved' : ''}`"
              class="kanban-card group relative cursor-grab select-none rounded-[17px] border border-[#19201b17] bg-white p-3.5 shadow-[0_13px_28px_-24px_rgba(25,32,27,0.8)] outline-none transition-[border-color,box-shadow,opacity,transform] active:cursor-grabbing focus-visible:border-[#19201b] focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] motion-reduce:transition-none"
              :class="{
                'scale-[.975] opacity-40 shadow-none': draggingId === card.id,
                'border-[#19201b] shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)]': pickedId === card.id,
                'opacity-45 cursor-not-allowed': card.disabled,
                'translate-y-1': target?.columnId === column.id && target.index === index && (draggingId || pickedId) && draggingId !== card.id,
              }"
              @focus="activeId = card.id"
              @keydown="onKeydown($event, card)"
              @pointerdown="onPointerDown($event, card)"
              @pointermove="onPointerMove"
              @pointerup="finishPointer($event, true)"
              @pointercancel="finishPointer($event, false)"
              @lostpointercapture="finishPointer($event, false)"
            >
              <div class="flex items-start justify-between gap-3">
                <span v-if="card.tag" class="rounded-full bg-[#19201b0d] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#19201b99]">{{ card.tag }}</span>
                <span v-else class="text-[8px] font-bold uppercase tracking-[0.12em] text-[#19201b59]">Task</span>
                <svg class="mt-0.5 size-4 shrink-0 fill-current text-[#19201b40]" viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="4" r="1" /><circle cx="11" cy="4" r="1" /><circle cx="5" cy="8" r="1" /><circle cx="11" cy="8" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="11" cy="12" r="1" /></svg>
              </div>
              <h3 class="mt-3 text-[13px] font-bold leading-5 tracking-[-0.015em]">{{ card.title }}</h3>
              <p v-if="card.description" class="mt-1 text-[10px] leading-4 text-[#19201b80]">{{ card.description }}</p>
              <div class="mt-3 flex items-center justify-between border-t border-[#19201b0d] pt-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#19201b59]">
                <span>{{ card.disabled ? 'Locked' : pickedId === card.id ? 'Moving' : 'Ready' }}</span>
                <span class="tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
              </div>
            </article>
          </li>
        </TransitionGroup>

        <div v-if="!cardsFor(column.id).length" class="grid min-h-24 flex-1 place-items-center rounded-[17px] border border-dashed border-[#19201b24] px-4 text-center text-[10px] font-semibold text-[#19201b66]">Drop cards here</div>
      </section>
    </div>
    <p data-testid="kanban-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.kanban-card-enter-active,
.kanban-card-leave-active,
.kanban-card-move {
  transition-duration: var(--kanban-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.kanban-card-enter-from,
.kanban-card-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .kanban-card,
  .kanban-card-enter-active,
  .kanban-card-leave-active,
  .kanban-card-move {
    transition: none !important;
  }
}
</style>
