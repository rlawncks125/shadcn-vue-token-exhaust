<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedKanbanBoard, {
  type KanbanCard,
  type KanbanCardPosition,
  type KanbanColumn,
} from '#registry/default/animated-kanban-board/AnimatedKanbanBoard.vue'

withDefaults(defineProps<{
  duration?: number
  disabled?: boolean
}>(), {
  duration: 260,
  disabled: false,
})

const columns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', description: 'Ideas worth shaping', color: '#ef8354' },
  { id: 'progress', title: 'In progress', description: 'Work on the floor', color: '#d9ff57' },
  { id: 'review', title: 'Review', description: 'Ready for a second look', color: '#74a4bc' },
]

function initialCards(): KanbanCard[] {
  return [
    { id: 'brief', columnId: 'backlog', title: 'Shape the campaign brief', description: 'Align the launch story with the field research.', tag: 'Strategy' },
    { id: 'motion', columnId: 'backlog', title: 'Motion study', description: 'Explore transitions for the product reveal.', tag: 'Design' },
    { id: 'archive', columnId: 'backlog', title: 'Archive audit', description: 'Read-only until legal signs off.', tag: 'Ops', disabled: true },
    { id: 'prototype', columnId: 'progress', title: 'Prototype the new flow', description: 'Connect the core path and edge states.', tag: 'Product' },
    { id: 'copy', columnId: 'progress', title: 'Write launch notes', description: 'Draft a concise narrative for early access.', tag: 'Content' },
    { id: 'contrast', columnId: 'review', title: 'Contrast pass', description: 'Check the final palette across breakpoints.', tag: 'QA' },
  ]
}

const board = ref<InstanceType<typeof AnimatedKanbanBoard> | null>(null)
const cards = ref(initialCards())
const status = ref('Six tasks are staged. Drag a card or use Space to pick it up.')
const completedReview = computed(() => cards.value.filter(card => card.columnId === 'review').length)

function columnName(id: string) {
  return columns.find(column => column.id === id)?.title ?? id
}

function handleMove(card: KanbanCard, previous: KanbanCardPosition, next: KanbanCardPosition) {
  status.value = previous.columnId === next.columnId
    ? `${card.title} moved to position ${next.index + 1} in ${columnName(next.columnId)}.`
    : `${card.title} moved from ${columnName(previous.columnId)} to ${columnName(next.columnId)}.`
}

function resetBoard() {
  board.value?.reset()
  status.value = 'Launch board reset to its original arrangement.'
}
</script>

<template>
  <section data-testid="animated-kanban-board-preview" class="w-full min-w-0 max-w-6xl overflow-hidden rounded-[30px] border border-[#20241e]/10 bg-[#dedbd0] text-[#19201b] shadow-[0_38px_110px_-68px_rgba(25,32,27,0.8)]">
    <header class="flex flex-col gap-5 border-b border-[#20241e]/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
      <div>
        <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#19201b73]"><span class="size-2 rounded-full bg-[#d9ff57] ring-2 ring-[#19201b]" aria-hidden="true" />Studio queue / Week 38</div>
        <h2 class="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Launch control</h2>
      </div>
      <div class="flex items-center gap-2">
        <span data-testid="kanban-review-count" class="rounded-full bg-[#19201b] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white">{{ completedReview }} in review</span>
        <button type="button" data-testid="reset-kanban" class="rounded-full border border-[#19201b1f] bg-white/65 px-3 py-2 text-[10px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-4 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="resetBoard">Reset board</button>
      </div>
    </header>

    <div class="min-w-0 p-3 sm:p-6">
      <div class="max-w-full overflow-x-auto overscroll-x-contain pb-2 [scrollbar-color:#19201b33_transparent]" data-testid="kanban-scroll-region">
        <div class="min-w-[780px]">
          <AnimatedKanbanBoard
            ref="board"
            v-model="cards"
            :columns="columns"
            :duration="duration"
            :disabled="disabled"
            label="Launch control task board"
            @move="handleMove"
          />
        </div>
      </div>

      <footer class="mt-3 flex flex-col gap-3 border-t border-[#19201b14] px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p data-testid="kanban-preview-status" class="min-h-5 max-w-2xl text-[11px] leading-5 text-[#19201b80]" role="status" aria-live="polite">{{ status }}</p>
        <p class="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-[#19201b66]"><kbd class="mr-1 rounded-md border border-[#19201b1f] bg-white/50 px-1.5 py-1">Space</kbd> pick up <span class="mx-1">/</span> <kbd class="mr-1 rounded-md border border-[#19201b1f] bg-white/50 px-1.5 py-1">Arrows</kbd> move</p>
      </footer>
    </div>
  </section>
</template>
