<script setup lang="ts">
import type { AnimatedFilterGridColumns, AnimatedFilterGridItem, AnimatedFilterGridSort } from '#registry/default/animated-filter-grid/AnimatedFilterGrid.vue'
import AnimatedFilterGrid from '#registry/default/animated-filter-grid/AnimatedFilterGrid.vue'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  stagger?: number
  columns?: AnimatedFilterGridColumns
  disabled?: boolean
}>(), {
  duration: 360,
  stagger: 45,
  columns: 3,
  disabled: false,
})

const catalog: AnimatedFilterGridItem[] = [
  { id: 'atlas', title: 'Atlas task chair', category: 'Seating', description: 'Breathable mesh with an adjustable lumbar cradle.', meta: '$480 / In stock' },
  { id: 'rowan', title: 'Rowan side table', category: 'Tables', description: 'Solid ash surface sized for focused work corners.', meta: '$260 / 4 finishes' },
  { id: 'halo', title: 'Halo pendant', category: 'Lighting', description: 'Warm diffused light with a hand-spun aluminum shade.', meta: '$195 / Ships Friday' },
  { id: 'relay', title: 'Relay standing desk', category: 'Tables', description: 'Quiet dual-motor lift with cable management built in.', meta: '$920 / In stock' },
  { id: 'arc', title: 'Arc floor lamp', category: 'Lighting', description: 'A dimmable reading light with a compact stone base.', meta: '$340 / Low stock' },
  { id: 'morrow', title: 'Morrow lounge chair', category: 'Seating', description: 'Deep recycled-wool upholstery for slower afternoons.', meta: '$760 / Made to order', disabled: true },
]

const items = ref<AnimatedFilterGridItem[]>([...catalog])
const filter = ref('all')
const sort = ref<AnimatedFilterGridSort>('default')
const selectedId = ref<string | null>('atlas')
const status = ref('6 products ready to browse')
const compact = ref(false)

const categories = ['all', 'Seating', 'Tables', 'Lighting']
const selectedItem = computed(() => items.value.find(item => item.id === selectedId.value))

function toggleCollection() {
  compact.value = !compact.value
  items.value = compact.value
    ? items.value.filter(item => !['rowan', 'arc'].includes(item.id))
    : catalog.map(item => ({ ...item }))
  status.value = compact.value ? 'Showing the four-piece essentials edit' : 'Full six-piece collection restored'
}

function shuffleCollection() {
  const [first, ...rest] = items.value
  items.value = first ? [...rest, first] : [...catalog]
  sort.value = 'default'
  status.value = 'Collection order refreshed'
}

function onSelect(item: AnimatedFilterGridItem) {
  status.value = `${item.title} selected`
}

function onSettled(visible: AnimatedFilterGridItem[]) {
  status.value = `${visible.length} product${visible.length === 1 ? '' : 's'} in view${selectedItem.value ? ` / ${selectedItem.value.title} selected` : ''}`
}
</script>

<template>
  <section class="w-full max-w-[980px] overflow-hidden rounded-[28px] border border-black/10 bg-[#f3f0e8] text-[#171814] shadow-[0_28px_80px_-60px_#171814]">
    <header class="border-b border-black/10 px-4 py-5 sm:px-6 sm:py-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-md">
          <p class="mb-2 text-[9px] font-bold tracking-[.22em] text-black/45 uppercase">Workspace collection / 2026</p>
          <h2 class="text-2xl leading-none font-semibold tracking-[-.04em] sm:text-[30px]">Objects for better work.</h2>
          <p class="mt-3 text-xs leading-relaxed text-black/50">A considered edit of tactile furniture and warm task lighting.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-black/10 bg-white/55 px-3.5 py-2 text-[10px] font-semibold transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="props.disabled" @click="shuffleCollection">Rotate order</button>
          <button type="button" class="rounded-full bg-[#171814] px-3.5 py-2 text-[10px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="props.disabled" @click="toggleCollection">{{ compact ? 'Restore collection' : 'Show essentials' }}</button>
        </div>
      </div>
    </header>

    <div class="flex flex-col gap-3 border-b border-black/10 bg-white/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div class="flex max-w-full gap-1 overflow-x-auto" aria-label="Filter products">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          :class="filter === category ? 'bg-brand text-brand-foreground' : 'text-black/50 hover:bg-white/70 hover:text-black'"
          :aria-pressed="filter === category"
          :disabled="props.disabled"
          @click="filter = category"
        >
          {{ category === 'all' ? 'All pieces' : category }}
        </button>
      </div>
      <label class="flex shrink-0 items-center gap-2 text-[9px] font-bold tracking-[.12em] text-black/40 uppercase">
        Sort
        <select v-model="sort" class="rounded-lg border border-black/10 bg-white/70 px-2.5 py-1.5 text-[10px] font-semibold tracking-normal text-black normal-case outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-40" :disabled="props.disabled">
          <option value="default">Curated</option>
          <option value="title-asc">Name A-Z</option>
          <option value="title-desc">Name Z-A</option>
          <option value="category-asc">Category</option>
        </select>
      </label>
    </div>

    <div class="p-4 sm:p-6">
      <AnimatedFilterGrid
        v-model="selectedId"
        :items="items"
        :filter="filter"
        :sort="sort"
        label="Workspace products"
        :columns="props.columns"
        :duration="props.duration"
        :stagger="props.stagger"
        :disabled="props.disabled"
        @select="onSelect"
        @settled="onSettled"
      />
    </div>

    <footer class="flex flex-col gap-1 border-t border-black/10 px-4 py-3 text-[10px] text-black/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p data-testid="animated-filter-grid-status" aria-live="polite" aria-atomic="true">{{ status }}</p>
      <p class="hidden sm:block">Arrow keys move focus / Enter selects</p>
    </footer>
  </section>
</template>
