<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AnimatedMobileFilterBar, { type AnimatedMobileFilterItem } from '#registry/default/animated-mobile-filter-bar/AnimatedMobileFilterBar.vue'

const props = withDefaults(defineProps<{ duration?: number, multiple?: boolean, showAll?: boolean, allowEmpty?: boolean, disabled?: boolean }>(), { duration: 220, multiple: true, showAll: true, allowEmpty: true, disabled: false })
const selected = ref<string[]>(['coast'])
const status = ref('Coast filter selected.')
const filters: AnimatedMobileFilterItem[] = [
  { id: 'coast', label: 'Coast', count: 8, icon: 'C' },
  { id: 'forest', label: 'Forest', count: 12, icon: 'F' },
  { id: 'city', label: 'City', count: 5, icon: 'U' },
  { id: 'night', label: 'Night', count: 3, icon: 'N' },
  { id: 'archive', label: 'Archive', count: 18, icon: 'A' },
  { id: 'private', label: 'Private', count: 2, disabled: true },
]
const notes = [
  { id: 1, filter: 'coast', title: 'Tide index', color: '#de7450' },
  { id: 2, filter: 'forest', title: 'Rain canopy', color: '#648675' },
  { id: 3, filter: 'city', title: 'Last tram', color: '#e4bd54' },
  { id: 4, filter: 'night', title: 'Quiet orbit', color: '#64758a' },
]
const visibleNotes = computed(() => selected.value.length ? notes.filter(note => selected.value.includes(note.filter)) : notes)

watch(() => props.multiple, (multiple) => {
  if (!multiple && selected.value.length > 1) selected.value = selected.value.slice(0, 1)
})

function onChange(value: string[]) {
  status.value = value.length ? `${value.length} filter${value.length === 1 ? '' : 's'} selected.` : 'Showing all field notes.'
}
</script>

<template>
  <section data-testid="animated-mobile-filter-bar-preview" class="min-h-[560px] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#e7e2d5] p-5 text-[#1c1e1a] sm:p-9">
    <header class="flex items-end justify-between gap-4"><div><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Field index · 46 notes</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.055em]">Sort the landscape.</h3></div><span class="font-mono text-[9px] text-black/32">09 / 26</span></header>
    <div class="mt-8 -mx-1" style="--filter-edge: #e7e2d5"><AnimatedMobileFilterBar v-model="selected" :items="filters" :duration="duration" :multiple="multiple" :show-all="showAll" :allow-empty="allowEmpty" :disabled="disabled" label="Filter field notes" @change="onChange" /></div>
    <TransitionGroup tag="div" name="note-grid" class="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <article v-for="note in visibleNotes" :key="note.id" class="min-h-36 rounded-[20px] p-3 text-white" :style="{ backgroundColor: note.color }"><span class="font-mono text-[8px] opacity-55">0{{ note.id }}</span><p class="mt-16 text-sm font-semibold">{{ note.title }}</p><small class="mt-1 block text-[9px] opacity-55">{{ note.filter }}</small></article>
    </TransitionGroup>
    <p data-testid="mobile-filter-status" class="mt-5 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
  </section>
</template>

<style scoped>
.note-grid-enter-active, .note-grid-leave-active { transition: opacity 220ms ease, transform 220ms ease; }
.note-grid-enter-from, .note-grid-leave-to { opacity: 0; transform: scale(.96); }
.note-grid-leave-active { position: absolute; }
@media (prefers-reduced-motion: reduce) { .note-grid-enter-active, .note-grid-leave-active { transition: none; } }
</style>
