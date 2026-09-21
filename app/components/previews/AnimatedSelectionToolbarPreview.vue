<script setup lang="ts">
import { ref } from 'vue'
import AnimatedSelectionToolbar, { type AnimatedSelectionToolbarAction } from '#registry/default/animated-selection-toolbar/AnimatedSelectionToolbar.vue'

const props = withDefaults(defineProps<{ duration?: number, clearable?: boolean, safeArea?: boolean, disabled?: boolean }>(), { duration: 260, clearable: true, safeArea: true, disabled: false })
const selected = ref<string[]>([])
const status = ref('Select field notes to reveal bulk actions.')
const notes = [
  { id: 'tide', number: '01', title: 'Low tide route', meta: 'Coast · 6 photos' },
  { id: 'orchard', number: '02', title: 'Stone orchard', meta: 'Hills · 3 notes' },
  { id: 'cabin', number: '03', title: 'North cabin', meta: 'Forest · 8 photos' },
  { id: 'pier', number: '04', title: 'Old pier', meta: 'Harbor · 4 notes' },
]
const actions: AnimatedSelectionToolbarAction[] = [
  { id: 'share', label: 'Share', icon: 'SH' },
  { id: 'offline', label: 'Offline', icon: 'DL' },
  { id: 'archive', label: 'Archive', icon: 'AR' },
  { id: 'delete', label: 'Delete', icon: 'DE', destructive: true },
]
function toggle(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(item => item !== id) : [...selected.value, id]
  status.value = `${selected.value.length} field notes selected.`
}
function run(action: AnimatedSelectionToolbarAction) {
  status.value = `${action.label} requested for ${selected.value.length} items.`
}
</script>

<template>
  <section data-testid="animated-selection-toolbar-preview" class="relative min-h-[570px] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#e8e4d8] p-5 text-[#1d1f1b] sm:p-9">
    <header class="flex items-end justify-between"><div><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Field archive</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.055em]">Collected along the way.</h3></div><span class="text-[10px] text-black/38">{{ notes.length }} entries</span></header>
    <div class="mt-7 grid gap-2 sm:grid-cols-2">
      <button v-for="note in notes" :key="note.id" type="button" :data-testid="`selection-card-${note.id}`" class="flex min-h-28 items-start gap-4 rounded-[20px] border p-4 text-left outline-none transition-[background-color,border-color,transform] active:scale-[.99] focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:opacity-40 motion-reduce:transition-none" :class="selected.includes(note.id) ? 'border-[#1d1f1b] bg-[#1d1f1b] text-white' : 'border-black/[0.07] bg-white/65'" :disabled="disabled" :aria-pressed="selected.includes(note.id)" @click="toggle(note.id)"><span class="grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-black" :class="selected.includes(note.id) ? 'bg-[#d9ff57] text-[#1d1f1b]' : 'bg-black/[0.06]'">{{ note.number }}</span><span><strong class="block text-sm font-semibold">{{ note.title }}</strong><small class="mt-2 block text-[10px] opacity-45">{{ note.meta }}</small></span></button>
    </div>
    <p data-testid="selection-toolbar-status" class="mt-5 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
    <AnimatedSelectionToolbar :selected-count="selected.length" :actions="actions" :duration="duration" :clearable="clearable" :safe-area="safeArea" :disabled="disabled" @action="run" @clear="selected = []; status = 'Selection cleared.'" />
  </section>
</template>
