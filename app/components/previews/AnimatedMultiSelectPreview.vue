<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedMultiSelect, { type AnimatedMultiSelectOption } from '#registry/default/animated-multi-select/AnimatedMultiSelect.vue'
withDefaults(defineProps<{ maxSelected?: number; searchable?: boolean; clearable?: boolean; duration?: number; disabled?: boolean }>(), { maxSelected: 4, searchable: true, clearable: true, duration: 220, disabled: false })
const options: AnimatedMultiSelectOption[] = [
  { value: 'editorial', label: 'Editorial systems', description: 'Long-form reading and publishing', group: 'Practice' },
  { value: 'identity', label: 'Visual identity', description: 'Brands, marks, and guidelines', group: 'Practice' },
  { value: 'motion', label: 'Motion studies', description: 'Transitions and spatial rhythm', group: 'Practice' },
  { value: 'research', label: 'Field research', description: 'Interviews and observation', group: 'Method' },
  { value: 'prototyping', label: 'Rapid prototyping', description: 'Testable product hypotheses', group: 'Method' },
  { value: 'archival', label: 'Archive review', description: 'Unavailable during migration', group: 'Method', disabled: true },
]
const selected = ref(['editorial', 'research'])
const status = ref('Two disciplines shape this studio profile.')
const summary = computed(() => selected.value.map(value => options.find(option => option.value === value)?.label).filter(Boolean).join(' / '))
</script>

<template>
  <section data-testid="animated-multi-select-preview" class="grid w-full max-w-[920px] overflow-hidden rounded-[30px] border border-[#1d2d25]/10 bg-[#edf0e9] text-[#19221c] shadow-[0_38px_100px_-62px_rgba(25,34,28,.75)] lg:grid-cols-[1.08fr_.92fr]">
    <div class="p-6 sm:p-9 lg:p-11"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#b45c3f]">Studio profile / Step 02</p><h2 class="mt-3 text-3xl font-semibold leading-[.98] tracking-[-.055em] sm:text-4xl">What kind of work moves you?</h2><p class="mt-4 max-w-md text-xs leading-5 text-black/45">Choose the disciplines that should shape your project feed and collaborator matches.</p><div class="mt-8"><AnimatedMultiSelect v-model="selected" :options="options" :max-selected="maxSelected" :searchable="searchable" :clearable="clearable" :duration="duration" :disabled="disabled" label="Creative disciplines" @change="(_values, option, active) => status = `${option.label} ${active ? 'selected' : 'removed'}.`" @limit="option => status = `Selection limit reached before ${option.label}.`" /></div><p data-testid="multi-select-preview-status" class="mt-3 min-h-4 text-[10px] text-black/45" role="status">{{ status }}</p></div>
    <aside class="flex min-h-[310px] flex-col justify-between bg-[#192a22] p-6 text-white sm:p-8 lg:min-h-[470px] lg:p-10"><div><p class="text-[9px] font-bold uppercase tracking-[.18em] text-[#d9ff57]">Profile signal</p><p class="mt-6 text-5xl font-semibold tracking-[-.07em]">{{ String(selected.length).padStart(2, '0') }}</p><p class="mt-2 text-[10px] text-white/40">active disciplines</p></div><div><div class="h-px bg-white/10" /><p data-testid="multi-select-summary" class="mt-5 text-sm leading-6 text-white/70">{{ summary || 'Waiting for your first selection.' }}</p></div></aside>
  </section>
</template>
