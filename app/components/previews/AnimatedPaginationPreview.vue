<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AnimatedPagination from '#registry/default/animated-pagination/AnimatedPagination.vue'

const props = withDefaults(defineProps<{
  pageCount?: number
  siblingCount?: number
  showEdges?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  pageCount: 12,
  siblingCount: 1,
  showEdges: true,
  duration: 280,
  disabled: false,
})

const titles = [
  ['The Shape of Quiet Rooms', 'Mara Bell', 'Architecture'],
  ['A Field Guide to Margins', 'Ivo Tan', 'Design criticism'],
  ['Notes on Borrowed Light', 'Sana Wren', 'Photography'],
  ['The Useful and the Beautiful', 'Emil North', 'Material culture'],
  ['Index of Small Gestures', 'Ada Mori', 'Visual essays'],
  ['Reading the Civic Landscape', 'Noah Vale', 'Urban studies'],
]

const effectivePageCount = computed(() => {
  const count = Number.isFinite(props.pageCount) ? Math.floor(props.pageCount) : 1
  return Math.max(1, count)
})
const currentPage = ref(Math.min(4, effectivePageCount.value))
const effectiveCurrentPage = computed(() => Math.min(effectivePageCount.value, Math.max(1, currentPage.value)))
const pageSize = 3
const totalResults = computed(() => effectivePageCount.value * pageSize)
const firstResult = computed(() => (effectiveCurrentPage.value - 1) * pageSize + 1)
const lastResult = computed(() => Math.min(totalResults.value, firstResult.value + pageSize - 1))
const currentItems = computed(() => pageRange(firstResult.value, lastResult.value).map((number, index) => {
  const source = titles[(number - 1) % titles.length]!
  return {
    number,
    title: source[0],
    author: source[1],
    category: source[2],
    code: `REF ${String(number).padStart(3, '0')}`,
    accent: ['bg-[#d9ff57]', 'bg-[#f2b8a2]', 'bg-[#b9d8ec]'][index]!,
  }
}))
const resultStatus = computed(() => `Showing works ${firstResult.value}-${lastResult.value} of ${totalResults.value}`)

function pageRange(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
}

watch(effectivePageCount, count => {
  currentPage.value = Math.min(count, Math.max(1, currentPage.value))
})
</script>

<template>
  <section
    class="w-full max-w-[920px] overflow-hidden rounded-[30px] border border-black/10 bg-[#e8e5dc] text-[#1c201b] shadow-[0_32px_90px_-58px_rgba(28,32,27,0.8)]"
    data-testid="animated-pagination-preview"
  >
    <header class="flex flex-col gap-5 border-b border-black/10 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-7">
      <div>
        <div class="mb-4 flex items-center gap-2.5">
          <span class="grid size-8 place-items-center rounded-full bg-[#1c201b] text-[9px] font-black tracking-[0.08em] text-[#d9ff57]">PL</span>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Public Library / Reading room</p>
        </div>
        <h2 class="max-w-lg text-3xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[42px]">The reference shelf.</h2>
      </div>
      <div class="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">
        <span class="size-2 rounded-full bg-[#718238]" aria-hidden="true" />
        {{ totalResults }} works available
      </div>
    </header>

    <div class="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_180px] lg:p-8">
      <div
        class="overflow-hidden rounded-[24px] border border-black/10 bg-[#faf9f4]"
        data-testid="animated-pagination-results"
        :data-page="effectiveCurrentPage"
      >
        <div class="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Recently catalogued</p>
          <span class="font-mono text-[10px] text-black/35">PAGE {{ String(effectiveCurrentPage).padStart(2, '0') }}</span>
        </div>

        <TransitionGroup
          :key="effectiveCurrentPage"
          tag="ul"
          class="m-0 list-none divide-y divide-black/10 p-0"
          enter-active-class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
          enter-from-class="translate-y-2 opacity-0"
        >
          <li
            v-for="item in currentItems"
            :key="item.number"
            class="group grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6"
          >
            <span :class="item.accent" class="grid size-10 place-items-center rounded-xl font-mono text-[9px] font-bold text-black/60">{{ item.number }}</span>
            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold tracking-[-0.02em] sm:text-base">{{ item.title }}</h3>
              <p class="mt-1 truncate text-[11px] text-black/45">{{ item.author }} / {{ item.category }}</p>
            </div>
            <span class="col-start-2 w-fit rounded-full border border-black/10 px-2.5 py-1 font-mono text-[9px] text-black/35 sm:col-start-auto">{{ item.code }}</span>
          </li>
        </TransitionGroup>
      </div>

      <aside class="flex flex-row justify-between gap-5 rounded-[24px] bg-[#1c201b] p-5 text-white lg:flex-col lg:p-6">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Collection note</p>
          <p class="mt-3 max-w-[15rem] text-sm font-medium leading-6 text-white/80">Independent titles on spaces, objects, and everyday visual culture.</p>
        </div>
        <div class="shrink-0 self-end lg:self-auto">
          <p class="text-4xl font-light tracking-[-0.06em] text-[#d9ff57]">{{ String(effectiveCurrentPage).padStart(2, '0') }}</p>
          <p class="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">of {{ String(effectivePageCount).padStart(2, '0') }}</p>
        </div>
      </aside>
    </div>

    <footer class="border-t border-black/10 bg-[#f4f1e9] px-4 py-5 sm:px-8 sm:py-6">
      <AnimatedPagination
        v-model="currentPage"
        :page-count="pageCount"
        :sibling-count="siblingCount"
        :show-edges="showEdges"
        :duration="duration"
        :disabled="disabled"
        aria-label="Reference shelf pages"
      />
      <div class="mt-4 flex flex-col gap-1 text-[10px] text-black/45 sm:flex-row sm:items-center sm:justify-between">
        <p data-testid="animated-pagination-status" role="status" aria-live="polite" aria-atomic="true">{{ resultStatus }}</p>
        <p class="hidden sm:block">Use arrow keys to move between page numbers</p>
      </div>
    </footer>
  </section>
</template>
