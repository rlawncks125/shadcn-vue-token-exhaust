<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedMultiSelectOption { value: string; label: string; description?: string; group?: string; disabled?: boolean }

const props = withDefaults(defineProps<{
  options: AnimatedMultiSelectOption[]
  modelValue: string[]
  label?: string
  placeholder?: string
  maxSelected?: number
  searchable?: boolean
  clearable?: boolean
  duration?: number
  disabled?: boolean
}>(), { label: 'Choose options', placeholder: 'Search options...', maxSelected: undefined, searchable: true, clearable: true, duration: 220, disabled: false })

const emit = defineEmits<{
  'update:modelValue': [values: string[]]
  change: [values: string[], option: AnimatedMultiSelectOption, selected: boolean]
  limit: [option: AnimatedMultiSelectOption]
  openChange: [open: boolean]
}>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const openState = ref(false)
const query = ref('')
const activeIndex = ref(0)
const id = `animated-multi-select-${useId()}`
const listId = `${id}-list`
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 220)
const selectedOptions = computed(() => props.modelValue.map(value => props.options.find(option => option.value === value)).filter((option): option is AnimatedMultiSelectOption => Boolean(option)))
const filtered = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  return props.options.filter(option => !term || `${option.label} ${option.description ?? ''} ${option.group ?? ''}`.toLocaleLowerCase().includes(term))
})
const enabled = computed(() => filtered.value.filter(option => !option.disabled))
const limitReached = computed(() => props.maxSelected !== undefined && props.modelValue.length >= Math.max(0, props.maxSelected))

function requestOpen(value: boolean) {
  if (props.disabled && value) return false
  if (openState.value === value) return value
  openState.value = value
  if (value) activeIndex.value = 0
  else query.value = ''
  emit('openChange', value)
  return value
}

function toggleOption(option: AnimatedMultiSelectOption) {
  if (props.disabled || option.disabled) return false
  const selected = props.modelValue.includes(option.value)
  if (!selected && limitReached.value) { emit('limit', option); return false }
  const values = selected ? props.modelValue.filter(value => value !== option.value) : [...props.modelValue, option.value]
  emit('update:modelValue', values)
  emit('change', values, option, !selected)
  return true
}

function remove(value: string) {
  const option = props.options.find(item => item.value === value)
  if (!option || props.disabled) return false
  return toggleOption(option)
}

function clear() {
  if (props.disabled || !props.modelValue.length) return false
  emit('update:modelValue', [])
  return true
}

async function focus() { if (props.disabled) return false; await nextTick(); input.value?.focus(); return document.activeElement === input.value }
async function open() { requestOpen(true); await focus(); return openState.value }
function close() { return requestOpen(false) }

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault(); requestOpen(true)
    const length = enabled.value.length
    if (length) activeIndex.value = (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + length) % length
  }
  else if (event.key === 'Enter' && openState.value) { event.preventDefault(); const option = enabled.value[activeIndex.value]; if (option) toggleOption(option) }
  else if (event.key === 'Escape') { event.preventDefault(); requestOpen(false) }
  else if (event.key === 'Backspace' && !query.value && props.modelValue.length) remove(props.modelValue.at(-1)!)
}

function onDocumentPointerDown(event: PointerEvent) { if (openState.value && event.target instanceof Node && !root.value?.contains(event.target)) requestOpen(false) }
watch(filtered, () => { activeIndex.value = 0 })
watch(() => props.disabled, value => value && requestOpen(false))
onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
defineExpose({ open, close, focus, clear, remove })
</script>

<template>
  <div ref="root" data-testid="animated-multi-select" class="animated-multi-select relative w-full" :class="{ 'opacity-50': disabled }" :style="{ '--multi-select-duration': `${safeDuration}ms` }">
    <label :for="`${id}-input`" class="mb-2 block text-[10px] font-bold uppercase tracking-[.15em] text-[#19221c]/55">{{ label }}</label>
    <div class="flex min-h-14 flex-wrap items-center gap-1.5 rounded-[17px] border border-[#19221c]/15 bg-white/85 p-2 shadow-[0_16px_38px_-28px_rgba(25,34,28,.8)] focus-within:border-[#19221c] focus-within:ring-3 focus-within:ring-[#d9ff57]/55">
      <TransitionGroup name="multi-chip">
        <span v-for="option in selectedOptions" :key="option.value" :data-testid="`multi-select-chip-${option.value}`" class="multi-chip inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#19221c] pl-2.5 pr-1.5 text-[10px] font-semibold text-white">
          {{ option.label }}<button type="button" class="grid size-5 place-items-center rounded-md text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9ff57]" :disabled="disabled" :aria-label="`Remove ${option.label}`" @click="remove(option.value)">x</button>
        </span>
      </TransitionGroup>
      <input :id="`${id}-input`" ref="input" v-model="query" role="combobox" :aria-expanded="openState" :aria-controls="listId" aria-autocomplete="list" :placeholder="selectedOptions.length ? '' : placeholder" :disabled="disabled" :readonly="!searchable" class="h-9 min-w-[120px] flex-1 border-0 bg-transparent px-2 text-xs outline-none placeholder:text-[#19221c]/35" @focus="requestOpen(true)" @click="requestOpen(true)" @keydown="onKeydown">
      <button v-if="clearable && modelValue.length" type="button" class="rounded-lg px-2 py-1 text-[9px] font-bold text-[#19221c]/45 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" :disabled="disabled" :aria-label="`Clear ${label.toLocaleLowerCase()}`" @click="clear">Clear</button>
    </div>
    <Transition name="multi-popup">
      <div v-if="openState" :id="listId" role="listbox" aria-multiselectable="true" :aria-label="`${label} options`" class="multi-popup absolute inset-x-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-y-auto rounded-[17px] border border-[#19221c]/15 bg-[#fbfaf5]/95 p-1.5 shadow-[0_24px_60px_-28px_rgba(25,34,28,.75)] backdrop-blur-xl">
        <button v-for="option in filtered" :key="option.value" type="button" role="option" :data-testid="`multi-select-option-${option.value}`" :aria-selected="modelValue.includes(option.value)" :aria-disabled="option.disabled || undefined" class="multi-option flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:not-disabled:bg-[#19221c]/5 focus-visible:ring-2 focus-visible:ring-[#19221c] disabled:cursor-not-allowed disabled:opacity-35" :class="enabled[activeIndex]?.value === option.value ? 'bg-[#d9ff57]/55' : ''" :disabled="option.disabled" @pointermove="activeIndex = Math.max(0, enabled.findIndex(item => item.value === option.value))" @mousedown.prevent @click="toggleOption(option)">
          <span class="grid size-5 shrink-0 place-items-center rounded-md border border-[#19221c]/20 text-[10px] font-black" :class="modelValue.includes(option.value) ? 'border-[#19221c] bg-[#19221c] text-[#d9ff57]' : ''">{{ modelValue.includes(option.value) ? 'OK' : '' }}</span>
          <span class="min-w-0 flex-1"><strong class="block truncate text-xs">{{ option.label }}</strong><small v-if="option.description" class="mt-0.5 block truncate text-[9px] text-[#19221c]/45">{{ option.description }}</small></span>
          <span v-if="option.group" class="text-[8px] font-bold uppercase tracking-[.1em] text-[#19221c]/35">{{ option.group }}</span>
        </button>
        <p v-if="!filtered.length" class="px-4 py-8 text-center text-xs text-[#19221c]/45">No matching options.</p>
      </div>
    </Transition>
    <p class="mt-2 min-h-4 text-[9px] text-[#19221c]/45" aria-live="polite">{{ modelValue.length }} selected<span v-if="maxSelected !== undefined"> of {{ maxSelected }}</span>.</p>
  </div>
</template>

<style scoped>
.multi-popup-enter-active,.multi-popup-leave-active,.multi-chip-enter-active,.multi-chip-leave-active,.multi-chip-move{transition:opacity var(--multi-select-duration),transform var(--multi-select-duration)}
.multi-popup-enter-from,.multi-popup-leave-to{opacity:0;transform:translateY(-6px) scale(.98)}
.multi-chip-enter-from,.multi-chip-leave-to{opacity:0;transform:scale(.85)}
@media(prefers-reduced-motion:reduce){.multi-popup-enter-active,.multi-popup-leave-active,.multi-chip-enter-active,.multi-chip-leave-active,.multi-chip-move,.multi-option{transition:none!important}}
</style>
