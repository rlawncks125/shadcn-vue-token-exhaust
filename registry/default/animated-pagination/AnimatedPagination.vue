<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

type PaginationItem =
  | { key: string, type: 'page', page: number }
  | { key: string, type: 'ellipsis' }

const props = withDefaults(defineProps<{
  modelValue: number
  pageCount: number
  siblingCount?: number
  showEdges?: boolean
  disabled?: boolean
  duration?: number
  ariaLabel?: string
}>(), {
  siblingCount: 1,
  showEdges: true,
  disabled: false,
  duration: 280,
  ariaLabel: 'Pagination',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [next: number, previous: number]
}>()

const pageButtons = new Map<number, HTMLButtonElement>()
const rovingPage = ref(1)

const effectivePageCount = computed(() => {
  const count = Number.isFinite(props.pageCount) ? Math.floor(props.pageCount) : 1
  return Math.max(1, count)
})
const effectivePage = computed(() => {
  const page = Number.isFinite(props.modelValue) ? Math.floor(props.modelValue) : 1
  return Math.min(effectivePageCount.value, Math.max(1, page))
})
const effectiveSiblingCount = computed(() => {
  const count = Number.isFinite(props.siblingCount) ? Math.floor(props.siblingCount) : 0
  return Math.min(effectivePageCount.value - 1, Math.max(0, count))
})
const effectiveDuration = computed(() => {
  const duration = Number.isFinite(props.duration) ? props.duration : 0
  return Math.max(0, duration)
})

function pageRange(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
}

const items = computed<PaginationItem[]>(() => {
  const count = effectivePageCount.value
  const start = Math.max(1, effectivePage.value - effectiveSiblingCount.value)
  const end = Math.min(count, effectivePage.value + effectiveSiblingCount.value)

  if (!props.showEdges) {
    const compact: PaginationItem[] = []
    if (start > 1) compact.push({ key: 'ellipsis:start', type: 'ellipsis' })
    compact.push(...pageRange(start, end).map(page => ({ key: `page:${page}`, type: 'page' as const, page })))
    if (end < count) compact.push({ key: 'ellipsis:end', type: 'ellipsis' })
    return compact
  }

  const pages = [...new Set([1, ...pageRange(start, end), count])].sort((a, b) => a - b)
  const compact: PaginationItem[] = []

  pages.forEach((page, index) => {
    const previous = pages[index - 1]
    if (previous !== undefined && page - previous === 2) {
      compact.push({ key: `page:${page - 1}`, type: 'page', page: page - 1 })
    } else if (previous !== undefined && page - previous > 2) {
      compact.push({ key: `ellipsis:${previous}:${page}`, type: 'ellipsis' })
    }
    compact.push({ key: `page:${page}`, type: 'page', page })
  })

  return compact
})

const visiblePages = computed(() => items.value.flatMap(item => item.type === 'page' ? [item.page] : []))
const rootStyle = computed(() => ({
  '--pagination-duration': `${effectiveDuration.value}ms`,
}))
const progressStyle = computed(() => ({
  transform: `scaleX(${effectivePage.value / effectivePageCount.value})`,
}))

function setPageButton(element: unknown, page: number) {
  if (element instanceof HTMLButtonElement) pageButtons.set(page, element)
  else pageButtons.delete(page)
}

function selectPage(page: number) {
  if (props.disabled || !Number.isFinite(page)) return false

  const nextPage = Math.min(effectivePageCount.value, Math.max(1, Math.floor(page)))
  const previousPage = effectivePage.value
  rovingPage.value = nextPage

  if (nextPage === previousPage) return true
  emit('update:modelValue', nextPage)
  emit('change', nextPage, previousPage)
  return true
}

function focusPage(page: number) {
  rovingPage.value = page
  nextTick(() => pageButtons.get(page)?.focus())
}

function movePageFocus(from: number, direction: 1 | -1) {
  const pages = visiblePages.value
  if (!pages.length || props.disabled) return

  const position = pages.indexOf(from)
  const fallback = direction === 1 ? -1 : 0
  const nextPosition = (Math.max(position, fallback) + direction + pages.length) % pages.length
  focusPage(pages[nextPosition]!)
}

function onPageKeydown(event: KeyboardEvent, page: number) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    movePageFocus(page, 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    movePageFocus(page, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    const first = visiblePages.value[0]
    if (first !== undefined) focusPage(first)
  } else if (event.key === 'End') {
    event.preventDefault()
    const last = visiblePages.value.at(-1)
    if (last !== undefined) focusPage(last)
  }
}

function pageAriaLabel(page: number) {
  return page === effectivePage.value ? `Page ${page}, current page` : `Go to page ${page}`
}

function goTo(page: number) {
  return selectPage(page)
}

function next() {
  return selectPage(effectivePage.value + 1)
}

function previous() {
  return selectPage(effectivePage.value - 1)
}

function focusCurrent() {
  focusPage(effectivePage.value)
}

watch([effectivePage, () => visiblePages.value.join(','), () => props.disabled], ([page, , disabled]) => {
  rovingPage.value = disabled ? -1 : page
}, { immediate: true })

defineExpose({ next, previous, goTo, focusCurrent })
</script>

<template>
  <nav
    class="animated-pagination w-full text-foreground"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :style="rootStyle"
    :data-page="effectivePage"
    :data-page-count="effectivePageCount"
    data-testid="animated-pagination"
  >
    <div class="flex items-center justify-between gap-2 sm:gap-3">
      <button
        type="button"
        class="group inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition-[color,background-color,border-color,transform] hover:not-disabled:border-foreground/25 hover:not-disabled:bg-accent active:not-disabled:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none sm:px-4"
        :disabled="disabled || effectivePage <= 1"
        aria-label="Go to previous page"
        data-testid="animated-pagination-previous"
        @click="previous"
      >
        <svg class="size-3.5 fill-none stroke-current stroke-2 transition-transform group-hover:not-disabled:-translate-x-0.5 motion-reduce:transition-none" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m12.5 4.5-5.5 5.5 5.5 5.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="hidden sm:inline">Previous</span>
      </button>

      <ol class="animated-pagination-pages m-0 flex min-w-0 list-none items-center justify-start gap-1 overflow-x-auto p-0 sm:justify-center" aria-label="Choose a page">
        <li v-for="item in items" :key="item.key" class="shrink-0">
          <button
            v-if="item.type === 'page'"
            :ref="element => setPageButton(element, item.page)"
            type="button"
            class="group relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border border-transparent bg-transparent text-xs font-semibold tabular-nums text-muted-foreground outline-none transition-[color,border-color,transform] hover:not-disabled:border-border hover:not-disabled:text-foreground active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none sm:size-10 sm:text-sm"
            :class="item.page === effectivePage ? 'scale-105 text-background' : ''"
            :disabled="disabled"
            :tabindex="!disabled && item.page === rovingPage ? 0 : -1"
            :aria-current="item.page === effectivePage ? 'page' : undefined"
            :aria-label="pageAriaLabel(item.page)"
            :data-page="item.page"
            :data-state="item.page === effectivePage ? 'current' : 'idle'"
            :data-testid="item.page === effectivePage ? 'animated-pagination-current' : `animated-pagination-page-${item.page}`"
            @click="selectPage(item.page)"
            @focus="rovingPage = item.page"
            @keydown="onPageKeydown($event, item.page)"
          >
            <span
              v-if="item.page === effectivePage"
              class="animated-pagination-current absolute inset-0 rounded-full bg-foreground shadow-[0_7px_18px_-8px_hsl(var(--foreground))]"
              aria-hidden="true"
            />
            <span class="relative z-10">{{ item.page }}</span>
          </button>
          <span
            v-else
            class="grid size-6 select-none place-items-center text-xs font-semibold tracking-[0.16em] text-muted-foreground/55 sm:size-8"
            aria-hidden="true"
          >...</span>
        </li>
      </ol>

      <button
        type="button"
        class="group inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition-[color,background-color,border-color,transform] hover:not-disabled:border-foreground/25 hover:not-disabled:bg-accent active:not-disabled:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none sm:px-4"
        :disabled="disabled || effectivePage >= effectivePageCount"
        aria-label="Go to next page"
        data-testid="animated-pagination-next"
        @click="next"
      >
        <span class="hidden sm:inline">Next</span>
        <svg class="size-3.5 fill-none stroke-current stroke-2 transition-transform group-hover:not-disabled:translate-x-0.5 motion-reduce:transition-none" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m7.5 4.5 5.5 5.5-5.5 5.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="mt-3 h-px w-full overflow-hidden rounded-full bg-border" aria-hidden="true" data-testid="animated-pagination-progress">
      <span class="animated-pagination-progress block size-full origin-left bg-foreground" :style="progressStyle" />
    </div>
  </nav>
</template>

<style scoped>
.animated-pagination-pages {
  scrollbar-width: none;
}

.animated-pagination-pages::-webkit-scrollbar {
  display: none;
}

.animated-pagination-current {
  animation: pagination-current-in var(--pagination-duration) cubic-bezier(.16, 1, .3, 1) both;
}

.animated-pagination-progress {
  transition: transform var(--pagination-duration) cubic-bezier(.16, 1, .3, 1);
}

@keyframes pagination-current-in {
  from {
    opacity: 0;
    transform: scale(.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-pagination-current {
    animation: none;
  }

  .animated-pagination-progress {
    transition-duration: 0ms;
  }
}
</style>
