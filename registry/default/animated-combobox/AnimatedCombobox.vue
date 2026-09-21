<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedComboboxOption {
  value: string
  label: string
  description?: string
  group?: string
  disabled?: boolean
}

export interface AnimatedComboboxProps {
  options: AnimatedComboboxOption[]
  modelValue: string | null
  query?: string
  placeholder?: string
  clearable?: boolean
  allowCustom?: boolean
  duration?: number
  disabled?: boolean
  label?: string
}

export interface AnimatedComboboxEvents {
  'update:modelValue': [value: string | null]
  'update:query': [value: string]
  change: [value: string | null, option: AnimatedComboboxOption | null]
  openChange: [open: boolean]
  custom: [value: string]
}

export interface AnimatedComboboxExpose {
  open: () => Promise<boolean>
  close: () => Promise<boolean>
  clear: () => Promise<boolean>
  focus: () => Promise<boolean>
}

interface OptionEntry {
  key: string
  sourceIndex: number
  option: AnimatedComboboxOption
}

interface OptionGroup {
  key: string
  label?: string
  entries: OptionEntry[]
}

interface Choice {
  key: string
  entry?: OptionEntry
  custom?: string
  disabled: boolean
}

const props = withDefaults(defineProps<AnimatedComboboxProps>(), {
  query: undefined,
  placeholder: 'Search options...',
  clearable: true,
  allowCustom: false,
  duration: 220,
  disabled: false,
  label: 'Choose an option',
})

const emit = defineEmits<AnimatedComboboxEvents>()

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const listbox = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const internalQuery = ref('')
const activeKey = ref<string | null>(null)
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' })
const optionElements = new Map<string, HTMLElement>()
const instanceId = `animated-combobox-${useId()}`
const inputId = `${instanceId}-input`
const listboxId = `${instanceId}-listbox`
const statusId = `${instanceId}-status`

const safeDuration = computed(() => Number.isFinite(props.duration)
  ? Math.max(0, Math.min(2000, props.duration))
  : 220)
const rootStyle = computed<Record<string, string>>(() => ({ '--combobox-duration': `${safeDuration.value}ms` }))
const selectedOption = computed(() => props.options.find(option => option.value === props.modelValue) ?? null)
const selectedText = computed(() => selectedOption.value?.label ?? props.modelValue ?? '')
const currentQuery = computed(() => props.query === undefined ? internalQuery.value : props.query)

function normalized(value: string) {
  return value.trim().toLocaleLowerCase()
}

const filteredEntries = computed<OptionEntry[]>(() => {
  const term = normalized(currentQuery.value)
  return props.options.reduce<OptionEntry[]>((entries, option, sourceIndex) => {
    const haystack = [option.label, option.value, option.description, option.group]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLocaleLowerCase()
    if (!term || haystack.includes(term)) entries.push({ key: `option-${sourceIndex}`, sourceIndex, option })
    return entries
  }, [])
})

const groups = computed<OptionGroup[]>(() => {
  const result: OptionGroup[] = []
  const byLabel = new Map<string, OptionGroup>()
  for (const entry of filteredEntries.value) {
    const label = entry.option.group?.trim() || undefined
    const lookupKey = label ?? ''
    let group = byLabel.get(lookupKey)
    if (!group) {
      group = { key: `group-${result.length}`, label, entries: [] }
      byLabel.set(lookupKey, group)
      result.push(group)
    }
    group.entries.push(entry)
  }
  return result
})

const customValue = computed(() => {
  if (!props.allowCustom) return null
  const value = currentQuery.value.trim()
  if (!value) return null
  const term = normalized(value)
  const exact = props.options.some(option => normalized(option.label) === term || normalized(option.value) === term)
  return exact ? null : value
})

const choices = computed<Choice[]>(() => [
  ...filteredEntries.value.map(entry => ({ key: entry.key, entry, disabled: Boolean(entry.option.disabled) })),
  ...(customValue.value ? [{ key: 'custom', custom: customValue.value, disabled: false }] : []),
])
const activeChoice = computed(() => choices.value.find(choice => choice.key === activeKey.value) ?? null)
const activeId = computed(() => activeChoice.value ? `${listboxId}-${activeChoice.value.key}` : undefined)
const enabledChoices = computed(() => choices.value.filter(choice => !choice.disabled))
const resultStatus = computed(() => {
  if (!isOpen.value) return selectedText.value ? `${selectedText.value} selected.` : 'No option selected.'
  const count = filteredEntries.value.length
  const customHint = customValue.value ? ' Custom value available.' : ''
  return `${count} ${count === 1 ? 'option' : 'options'} available.${customHint}`
})

function updateQuery(value: string) {
  const previous = currentQuery.value
  if (props.query === undefined) internalQuery.value = value
  if (value !== previous) emit('update:query', value)
}

function syncQueryToSelection() {
  updateQuery(selectedText.value)
}

function firstEnabledKey(last = false) {
  const choice = last ? enabledChoices.value.at(-1) : enabledChoices.value[0]
  return choice?.key ?? null
}

function setInitialActive(last = false) {
  if (!last && props.modelValue !== null) {
    const selected = filteredEntries.value.find(entry => entry.option.value === props.modelValue && !entry.option.disabled)
    if (selected) {
      activeKey.value = selected.key
      return
    }
  }
  activeKey.value = firstEnabledKey(last)
}

function setOptionElement(element: unknown, key: string) {
  if (element instanceof HTMLElement) optionElements.set(key, element)
  else optionElements.delete(key)
}

async function updateIndicator(scroll = false) {
  await nextTick()
  if (!isOpen.value || !activeKey.value || !listbox.value) {
    indicatorStyle.value = { opacity: '0' }
    return
  }
  const element = optionElements.get(activeKey.value)
  if (!element) {
    indicatorStyle.value = { opacity: '0' }
    return
  }
  if (scroll) element.scrollIntoView({ block: 'nearest' })
  const listRect = listbox.value.getBoundingClientRect()
  const optionRect = element.getBoundingClientRect()
  indicatorStyle.value = {
    height: `${optionRect.height}px`,
    opacity: '1',
    transform: `translateY(${optionRect.top - listRect.top + listbox.value.scrollTop}px)`,
  }
}

function updateIndicatorPosition() {
  void updateIndicator()
}

function requestOpen(value: boolean, resetQuery = true) {
  if (props.disabled && value) return false
  if (value === isOpen.value) return value
  isOpen.value = value
  if (value) setInitialActive()
  else {
    activeKey.value = null
    indicatorStyle.value = { opacity: '0' }
    if (resetQuery) syncQueryToSelection()
  }
  emit('openChange', value)
  return true
}

async function open() {
  if (props.disabled) return false
  requestOpen(true, false)
  await nextTick()
  input.value?.focus()
  await updateIndicator(true)
  return true
}

async function close() {
  if (!isOpen.value) return false
  requestOpen(false)
  await nextTick()
  return true
}

async function focus() {
  if (props.disabled) return false
  await nextTick()
  input.value?.focus()
  requestOpen(true, false)
  await updateIndicator(true)
  return true
}

function commit(value: string | null, option: AnimatedComboboxOption | null) {
  const changed = value !== props.modelValue
  if (changed) emit('update:modelValue', value)
  updateQuery(option?.label ?? value ?? '')
  requestOpen(false, false)
  if (changed) emit('change', value, option)
  return changed
}

function choose(choice = activeChoice.value) {
  if (!choice || choice.disabled || props.disabled) return false
  if (choice.entry) return commit(choice.entry.option.value, choice.entry.option)
  if (choice.custom) {
    const changed = commit(choice.custom, null)
    emit('custom', choice.custom)
    return changed
  }
  return false
}

async function clear() {
  if (props.disabled) return false
  const changed = props.modelValue !== null || Boolean(currentQuery.value)
  commit(null, null)
  await nextTick()
  input.value?.focus()
  requestOpen(true, false)
  setInitialActive()
  await updateIndicator(true)
  return changed
}

function move(step: 1 | -1) {
  if (!enabledChoices.value.length) return
  const index = enabledChoices.value.findIndex(choice => choice.key === activeKey.value)
  const next = index < 0
    ? (step === 1 ? 0 : enabledChoices.value.length - 1)
    : (index + step + enabledChoices.value.length) % enabledChoices.value.length
  activeKey.value = enabledChoices.value[next]?.key ?? null
  void updateIndicator(true)
}

function onInput(event: Event) {
  updateQuery((event.target as HTMLInputElement).value)
  if (!isOpen.value) requestOpen(true, false)
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!isOpen.value) {
      requestOpen(true, false)
      setInitialActive(event.key === 'ArrowUp')
      void updateIndicator(true)
    }
    else move(event.key === 'ArrowDown' ? 1 : -1)
  }
  else if (event.key === 'Home' && isOpen.value) {
    event.preventDefault()
    activeKey.value = firstEnabledKey()
    void updateIndicator(true)
  }
  else if (event.key === 'End' && isOpen.value) {
    event.preventDefault()
    activeKey.value = firstEnabledKey(true)
    void updateIndicator(true)
  }
  else if (event.key === 'Enter' && isOpen.value && activeChoice.value) {
    event.preventDefault()
    choose()
  }
  else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    event.stopPropagation()
    requestOpen(false)
  }
  else if (event.key === 'Tab' && isOpen.value) requestOpen(false)
}

function onFocusOut() {
  nextTick(() => {
    if (isOpen.value && root.value && !root.value.contains(document.activeElement)) requestOpen(false)
  })
}

function onDocumentPointerDown(event: PointerEvent) {
  if (isOpen.value && event.target instanceof Node && !root.value?.contains(event.target)) requestOpen(false)
}

function toggle() {
  if (props.disabled) return
  if (isOpen.value) requestOpen(false)
  else void open()
}

watch(currentQuery, () => {
  if (!isOpen.value) return
  setInitialActive()
  void updateIndicator(true)
})

watch(() => props.options, () => {
  if (isOpen.value) {
    setInitialActive()
    void updateIndicator(true)
  }
  else if (props.query === undefined) internalQuery.value = selectedText.value
}, { deep: true })

watch(() => props.modelValue, () => {
  if (!isOpen.value && props.query === undefined) internalQuery.value = selectedText.value
})

watch(() => props.disabled, (disabled) => {
  if (disabled && isOpen.value) requestOpen(false)
})

watch(activeKey, () => { void updateIndicator() })

onMounted(() => {
  if (props.query === undefined) internalQuery.value = selectedText.value
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', updateIndicatorPosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', updateIndicatorPosition)
  optionElements.clear()
})

defineExpose<AnimatedComboboxExpose>({ open, close, clear, focus })
</script>

<template>
  <div
    ref="root"
    class="animated-combobox relative w-full text-[#171814]"
    :class="{ 'opacity-50': disabled }"
    :style="rootStyle"
    @focusout="onFocusOut"
  >
    <label :for="inputId" class="mb-2 block px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17181480]">
      {{ label }}
    </label>

    <div
      class="combobox-control flex h-[52px] items-center rounded-[16px] border border-[#17181424] bg-white/90 shadow-[0_13px_30px_-24px_rgba(23,24,20,.8)] transition-[border-color,box-shadow,background-color] focus-within:border-[#171814] focus-within:bg-white focus-within:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57),0_16px_34px_-25px_rgba(23,24,20,.8)] motion-reduce:transition-none"
      :class="{ 'is-open': isOpen }"
    >
      <span class="ml-4 grid size-5 shrink-0 place-items-center text-[#17181466]" aria-hidden="true">
        <svg class="size-[17px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.25" /><path d="m12.4 12.4 4.1 4.1" /></svg>
      </span>
      <input
        :id="inputId"
        ref="input"
        role="combobox"
        type="text"
        autocomplete="off"
        :spellcheck="false"
        :value="currentQuery"
        :placeholder="placeholder"
        :disabled="disabled"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="isOpen ? activeId : undefined"
        :aria-describedby="statusId"
        class="h-full min-w-0 flex-1 border-0 bg-transparent px-3 [font:inherit] text-[13px] font-medium text-[#171814] outline-none placeholder:font-normal placeholder:text-[#17181466] disabled:cursor-not-allowed"
        @focus="requestOpen(true, false)"
        @input="onInput"
        @keydown="onInputKeydown"
      >
      <button
        v-if="clearable && (modelValue !== null || currentQuery)"
        type="button"
        class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-[10px] border-0 bg-transparent text-[#17181466] outline-none transition-colors hover:not-disabled:bg-[#1718140a] hover:not-disabled:text-[#171814] focus-visible:ring-2 focus-visible:ring-[#171814] disabled:cursor-not-allowed motion-reduce:transition-none"
        :disabled="disabled"
        :aria-label="`Clear ${label.toLocaleLowerCase()}`"
        @pointerdown.prevent
        @click="clear"
      >
        <svg class="size-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 18 18" aria-hidden="true"><path d="m5 5 8 8m0-8-8 8" /></svg>
      </button>
      <button
        type="button"
        class="mr-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-[11px] border-0 bg-transparent text-[#17181480] outline-none transition-colors hover:not-disabled:bg-[#1718140a] focus-visible:ring-2 focus-visible:ring-[#171814] disabled:cursor-not-allowed motion-reduce:transition-none"
        :disabled="disabled"
        :aria-label="isOpen ? `Close ${label.toLocaleLowerCase()}` : `Open ${label.toLocaleLowerCase()}`"
        :tabindex="-1"
        @pointerdown.prevent
        @click="toggle"
      >
        <svg class="size-4 fill-none stroke-current stroke-[1.8] transition-transform motion-reduce:transition-none" :class="{ 'rotate-180': isOpen }" viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 7.5 4.5 4.5 4.5-4.5" /></svg>
      </button>
    </div>

    <Transition name="combobox-popup">
      <div
        v-if="isOpen"
        class="combobox-popup absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-[18px] border border-[#1718141f] bg-[#fbfaf5f7] p-1.5 shadow-[0_24px_60px_-28px_rgba(23,24,20,.72)] backdrop-blur-xl"
      >
        <div
          :id="listboxId"
          ref="listbox"
          role="listbox"
          :aria-label="`${label} options`"
          class="combobox-list relative max-h-[min(310px,42vh)] overflow-y-auto overscroll-contain rounded-[13px]"
          @scroll="updateIndicatorPosition"
        >
          <span class="combobox-indicator pointer-events-none absolute inset-x-0 top-0 z-0 rounded-[12px] bg-[var(--registry-accent,#d9ff57)]" :style="indicatorStyle" aria-hidden="true" />

          <TransitionGroup name="combobox-groups" tag="div" class="relative z-10">
            <div
              v-for="group in groups"
              :key="group.key"
              :role="group.label ? 'group' : 'presentation'"
              :aria-labelledby="group.label ? `${listboxId}-${group.key}` : undefined"
              class="combobox-group"
            >
              <p v-if="group.label" :id="`${listboxId}-${group.key}`" class="px-3 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#17181466]">
                {{ group.label }}
              </p>
              <TransitionGroup name="combobox-options" tag="div">
                <div
                  v-for="entry in group.entries"
                  :id="`${listboxId}-${entry.key}`"
                  :key="entry.key"
                  :ref="element => setOptionElement(element, entry.key)"
                  role="option"
                  :aria-selected="entry.option.value === modelValue"
                  :aria-disabled="entry.option.disabled || undefined"
                  class="combobox-option relative flex min-h-[52px] items-center gap-3 rounded-[12px] px-3 py-2 text-left outline-none"
                  :class="entry.option.disabled ? 'cursor-not-allowed opacity-35' : 'cursor-pointer'"
                  @pointermove="!entry.option.disabled && (activeKey = entry.key)"
                  @mousedown.prevent
                  @click="choose(choices.find(choice => choice.key === entry.key))"
                >
                  <span class="grid min-w-0 flex-1 gap-0.5">
                    <strong class="truncate text-[12px] font-semibold">{{ entry.option.label }}</strong>
                    <small v-if="entry.option.description" class="truncate text-[10px] font-normal text-[#17181470]">{{ entry.option.description }}</small>
                  </span>
                  <span v-if="entry.option.value === modelValue" class="grid size-6 shrink-0 place-items-center rounded-full bg-[#171814] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
                    <svg class="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 18 18"><path d="m4.5 9 3 3 6-6" /></svg>
                  </span>
                </div>
              </TransitionGroup>
            </div>
          </TransitionGroup>

          <div
            v-if="customValue"
            :id="`${listboxId}-custom`"
            :ref="element => setOptionElement(element, 'custom')"
            role="option"
            :aria-selected="false"
            class="combobox-option relative z-10 flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 text-left outline-none"
            @pointermove="activeKey = 'custom'"
            @mousedown.prevent
            @click="choose(choices.find(choice => choice.key === 'custom'))"
          >
            <span class="grid size-7 shrink-0 place-items-center rounded-[9px] border border-[#1718141f] bg-white/60 text-sm font-medium" aria-hidden="true">+</span>
            <span class="min-w-0 flex-1 truncate text-[12px] font-semibold">Use “{{ customValue }}”</span>
            <span class="text-[9px] font-bold uppercase tracking-[.1em] text-[#17181470]">Custom</span>
          </div>

          <div v-if="!filteredEntries.length && !customValue" class="px-5 py-10 text-center" role="status">
            <span class="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-[#1718140a] text-[#17181466]" aria-hidden="true">
              <svg class="size-4 fill-none stroke-current stroke-[1.7] [stroke-linecap:round]" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5" /><path d="m12.2 12.2 4 4" /></svg>
            </span>
            <p class="text-[11px] font-semibold">No matching options</p>
            <p class="mt-1 text-[9px] text-[#17181470]">Try a different search.</p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-[#17181412] px-3 pb-1 pt-2 text-[9px] text-[#17181466]">
          <span><kbd class="font-bold text-[#171814]">↑↓</kbd> Navigate</span>
          <span><kbd class="font-bold text-[#171814]">Enter</kbd> Select</span>
          <span><kbd class="font-bold text-[#171814]">Esc</kbd> Close</span>
        </div>
      </div>
    </Transition>

    <p :id="statusId" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ resultStatus }}</p>
  </div>
</template>

<style scoped>
.combobox-popup-enter-active,
.combobox-popup-leave-active {
  transition:
    opacity var(--combobox-duration) ease,
    transform var(--combobox-duration) cubic-bezier(.16, 1, .3, 1);
  transform-origin: top center;
}

.combobox-popup-enter-from,
.combobox-popup-leave-to {
  opacity: 0;
  transform: translateY(-7px) scale(.975);
}

.combobox-indicator {
  transition:
    height var(--combobox-duration) cubic-bezier(.16, 1, .3, 1),
    opacity calc(var(--combobox-duration) * .7) ease,
    transform var(--combobox-duration) cubic-bezier(.16, 1, .3, 1);
}

.combobox-options-enter-active,
.combobox-options-leave-active,
.combobox-options-move,
.combobox-groups-enter-active,
.combobox-groups-leave-active,
.combobox-groups-move {
  transition:
    opacity var(--combobox-duration) ease,
    transform var(--combobox-duration) cubic-bezier(.16, 1, .3, 1);
}

.combobox-options-enter-from,
.combobox-options-leave-to,
.combobox-groups-enter-from,
.combobox-groups-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.combobox-options-leave-active,
.combobox-groups-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .combobox-popup-enter-active,
  .combobox-popup-leave-active,
  .combobox-indicator,
  .combobox-options-enter-active,
  .combobox-options-leave-active,
  .combobox-options-move,
  .combobox-groups-enter-active,
  .combobox-groups-leave-active,
  .combobox-groups-move {
    transition: none !important;
  }
}
</style>
