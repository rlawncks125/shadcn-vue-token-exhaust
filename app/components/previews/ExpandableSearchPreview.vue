<script setup lang="ts">
import ExpandableSearch from '#registry/default/expandable-search/ExpandableSearch.vue'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  expandedWidth?: number
  duration?: number
  clearable?: boolean
  shortcut?: boolean
  disabled?: boolean
}>(), {
  expandedWidth: 320,
  duration: 240,
  clearable: true,
  shortcut: true,
  disabled: false,
})

const projects = [
  { id: 'atlas', name: 'Atlas redesign', team: 'Product design', owner: 'Maya Chen', status: 'In review', tone: 'bg-[#ffdd8a]' },
  { id: 'northstar', name: 'Northstar launch', team: 'Growth', owner: 'Owen Bell', status: 'On track', tone: 'bg-[#b8e6cf]' },
  { id: 'relay', name: 'Relay mobile app', team: 'Engineering', owner: 'Priya Shah', status: 'At risk', tone: 'bg-[#f4aaa0]' },
  { id: 'fieldnotes', name: 'Fieldnotes research', team: 'Insights', owner: 'Jonas Reed', status: 'On track', tone: 'bg-[#b9d4f8]' },
  { id: 'signal', name: 'Signal brand system', team: 'Brand', owner: 'Lena Park', status: 'Planning', tone: 'bg-[#d7c1ee]' },
]

const query = ref('')
const open = ref(false)
const status = ref('All projects are visible')

const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  if (!term) return projects
  return projects.filter(project => [project.name, project.team, project.owner, project.status]
    .some(value => value.toLocaleLowerCase().includes(term)))
})

function onSearch(value: string) {
  status.value = value.trim()
    ? `Search submitted for "${value.trim()}"`
    : 'Showing all projects'
}

function onClear() {
  status.value = 'Search cleared; all projects are visible'
}

function onOpenChange(value: boolean) {
  status.value = value ? 'Search field opened' : 'Search field closed'
}
</script>

<template>
  <section class="w-full max-w-[920px] overflow-hidden rounded-[28px] border border-black/10 bg-[#f2f1eb] text-[#171814] shadow-[0_30px_90px_-62px_#171814]">
    <header class="border-b border-black/10 bg-[#faf9f5] px-4 py-3 sm:px-6">
      <div class="flex min-h-11 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#171814] text-[10px] font-black tracking-[-.04em] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">OS</span>
          <div class="leading-none">
            <p class="text-[12px] font-bold tracking-[-.01em]">Orbit Space</p>
            <p class="mt-1.5 text-[9px] font-medium text-black/40">Studio workspace</p>
          </div>
        </div>

        <div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <p v-if="shortcut" class="hidden text-[9px] font-medium text-black/40 md:block">Press <kbd class="mx-0.5 rounded border border-black/10 bg-white px-1.5 py-0.5 font-semibold text-black/60">/</kbd> to search</p>
          <div class="flex min-w-0 flex-1 justify-end sm:flex-none">
            <ExpandableSearch
              v-model="query"
              v-model:open="open"
              placeholder="Search projects or people"
              label="Search workspace"
              :expanded-width="expandedWidth"
              :duration="duration"
              :clearable="clearable"
              :shortcut="shortcut"
              :disabled="disabled"
              @search="onSearch"
              @clear="onClear"
              @open-change="onOpenChange"
            />
          </div>
          <button type="button" class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-black/60 outline-none transition-colors hover:bg-black hover:text-white focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" aria-label="Notifications">
            <svg class="size-4 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 8a4.5 4.5 0 0 1 9 0c0 5 2 5 2 5h-13s2 0 2-5Z" /><path d="M8.5 15.5a1.7 1.7 0 0 0 3 0" /></svg>
          </button>
        </div>
      </div>
    </header>

    <div class="px-4 pb-5 pt-6 sm:px-6 sm:pb-7">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-[9px] font-bold tracking-[.2em] text-black/40 uppercase">Workspace / Projects</p>
          <h2 class="text-[26px] leading-none font-semibold tracking-[-.045em] sm:text-[32px]">Good morning, Alex.</h2>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-semibold text-black/45">
          <span class="size-1.5 rounded-full bg-[#57a676]" aria-hidden="true" />
          Synced just now
        </div>
      </div>

      <div class="mb-3 flex items-center justify-between border-b border-black/10 pb-3">
        <h3 class="text-[11px] font-bold">Active projects</h3>
        <p data-testid="expandable-search-result-count" class="rounded-full bg-black/[.055] px-2.5 py-1 text-[9px] font-semibold text-black/50" aria-live="polite">
          {{ results.length }} {{ results.length === 1 ? 'result' : 'results' }}
        </p>
      </div>

      <ul v-if="results.length" class="m-0 grid list-none gap-2 p-0" aria-label="Project search results">
        <li v-for="project in results" :key="project.id">
          <article class="group flex items-center gap-3 rounded-[16px] border border-black/[.07] bg-white/70 p-3 transition-[background-color,transform] hover:-translate-y-px hover:bg-white motion-reduce:transition-none sm:gap-4 sm:px-4">
            <span class="grid size-9 shrink-0 place-items-center rounded-[11px] text-[10px] font-bold text-black/60" :class="project.tone" aria-hidden="true">{{ project.name.charAt(0) }}</span>
            <div class="min-w-0 flex-1">
              <h4 class="truncate text-[12px] font-semibold tracking-[-.01em]">{{ project.name }}</h4>
              <p class="mt-1 truncate text-[9px] text-black/40">{{ project.team }} / {{ project.owner }}</p>
            </div>
            <span class="hidden rounded-full border border-black/10 bg-white px-2.5 py-1 text-[8px] font-semibold text-black/50 xs:inline-flex sm:inline-flex">{{ project.status }}</span>
            <svg class="size-4 shrink-0 fill-none stroke-black/25 stroke-[1.8] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4.5 5.5 5.5L7 15.5" /></svg>
          </article>
        </li>
      </ul>

      <div v-else class="rounded-[18px] border border-dashed border-black/15 bg-white/35 px-5 py-10 text-center" role="status">
        <span class="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-black/[.055] text-black/40" aria-hidden="true">
          <svg class="size-4 fill-none stroke-current stroke-[1.7] [stroke-linecap:round]" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5" /><path d="m12.2 12.2 4 4" /></svg>
        </span>
        <p class="text-[11px] font-semibold">No matching projects</p>
        <p class="mt-1 text-[9px] text-black/40">Try a project, team, status, or owner.</p>
      </div>
    </div>

    <footer class="flex flex-col gap-1 border-t border-black/10 bg-[#e9e7de] px-4 py-3 text-[9px] text-black/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p data-testid="expandable-search-status" aria-live="polite" aria-atomic="true">{{ status }}</p>
      <p>Escape closes / Enter searches</p>
    </footer>
  </section>
</template>
