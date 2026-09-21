<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface ExpandableSearchProps {
  modelValue: string
  open: boolean
  placeholder?: string
  label?: string
  expandedWidth?: number
  duration?: number
  clearable?: boolean
  shortcut?: boolean
  disabled?: boolean
}

export interface ExpandableSearchEvents {
  'update:modelValue': [value: string]
  'update:open': [open: boolean]
  search: [query: string]
  clear: []
  'open-change': [open: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export interface ExpandableSearchExpose {
  openSearch: () => Promise<void>
  closeSearch: () => Promise<void>
  focus: () => Promise<void>
  clear: () => Promise<void>
}

const props = withDefaults(defineProps<ExpandableSearchProps>(), {
  placeholder: 'Search...',
  label: 'Search',
  expandedWidth: 320,
  duration: 240,
  clearable: true,
  shortcut: true,
  disabled: false,
})

const emit = defineEmits<ExpandableSearchEvents>()

const root = ref<HTMLFormElement>()
const trigger = ref<HTMLButtonElement>()
const input = ref<HTMLInputElement>()
const inputId = `expandable-search-${useId()}`
let restoreTriggerOnClose = false

const safeExpandedWidth = computed(() => clamp(props.expandedWidth, 180, 640, 320))
const safeDuration = computed(() => clamp(props.duration, 0, 1000, 240))
const rootStyle = computed<Record<string, string>>(() => ({
  '--expandable-search-width': `${safeExpandedWidth.value}px`,
  '--expandable-search-duration': `${safeDuration.value}ms`,
}))

function clamp(value: number, min: number, max: number, fallback: number) {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, safeValue))
}

function requestOpen(value: boolean, restoreFocus = false) {
  if (value === props.open) {
    if (value) void focusInput()
    return
  }
  restoreTriggerOnClose = !value && restoreFocus
  emit('update:open', value)
  emit('open-change', value)
}

async function focusInput() {
  if (props.disabled) return
  await nextTick()
  input.value?.focus()
}

async function openSearch() {
  if (props.disabled) return
  requestOpen(true)
  await focusInput()
}

async function closeSearch() {
  requestOpen(false, true)
  if (!props.open) {
    await nextTick()
    trigger.value?.focus()
  }
}

async function focus() {
  if (props.disabled) return
  if (!props.open) requestOpen(true)
  await focusInput()
}

async function clear() {
  if (props.disabled) return
  emit('update:modelValue', '')
  emit('clear')
  if (props.open) await focusInput()
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onSubmit() {
  if (!props.disabled) emit('search', props.modelValue)
}

function onEscape() {
  requestOpen(false, true)
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!props.open || props.modelValue.length > 0) return
  if (event.target instanceof Node && !root.value?.contains(event.target)) requestOpen(false)
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'))
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!props.shortcut || props.disabled || event.defaultPrevented || event.repeat) return
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target)) return
  event.preventDefault()
  void focus()
}

watch(() => props.open, async (open, wasOpen) => {
  if (open) {
    if (props.disabled) {
      requestOpen(false)
      return
    }
    await focusInput()
    return
  }
  if (wasOpen && restoreTriggerOnClose) {
    restoreTriggerOnClose = false
    await nextTick()
    trigger.value?.focus()
  }
})

watch(() => props.disabled, (disabled) => {
  if (disabled && props.open) requestOpen(false)
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
  if (props.open) void focusInput()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
})

defineExpose<ExpandableSearchExpose>({ openSearch, closeSearch, focus, clear })
</script>

<template>
  <form
    ref="root"
    role="search"
    class="expandable-search relative h-11 max-w-full overflow-hidden rounded-full border border-[#17181424] bg-white text-[#171814] shadow-[0_10px_28px_-20px_#17181499]"
    :class="{ 'expandable-search--open': open, 'opacity-50': disabled }"
    :style="rootStyle"
    @submit.prevent="onSubmit"
  >
    <button
      v-show="!open"
      ref="trigger"
      type="button"
      class="absolute inset-0 grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#171814] outline-none transition-colors hover:not-disabled:bg-[#1718140a] focus-visible:ring-2 focus-visible:ring-[#171814] focus-visible:ring-inset disabled:cursor-not-allowed motion-reduce:transition-none"
      :disabled="disabled"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="inputId"
      :aria-keyshortcuts="shortcut ? '/' : undefined"
      @click="openSearch"
    >
      <svg class="size-[18px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    </button>

    <div v-show="open" class="flex h-full min-w-0 items-center">
      <label :for="inputId" class="sr-only">{{ label }}</label>
      <span class="pointer-events-none ml-3.5 grid shrink-0 place-items-center text-[#17181480]" aria-hidden="true">
        <svg class="size-[17px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      </span>
      <input
        :id="inputId"
        ref="input"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-2.5 [font:inherit] text-[13px] text-[#171814] outline-none placeholder:text-[#17181470] disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden"
        @input="onInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @keydown.esc.stop.prevent="onEscape"
      >
      <button
        v-if="clearable && modelValue"
        type="button"
        class="mr-1.5 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#17181470] outline-none transition-colors hover:not-disabled:bg-[#1718140a] hover:not-disabled:text-[#171814] focus-visible:ring-2 focus-visible:ring-[#171814] disabled:cursor-not-allowed motion-reduce:transition-none"
        :disabled="disabled"
        :aria-label="`Clear ${label.toLocaleLowerCase()}`"
        @pointerdown.prevent
        @click="clear"
      >
        <svg class="size-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5.5 5.5 9 9m0-9-9 9" />
        </svg>
      </button>
      <kbd v-else-if="shortcut" class="mr-2 hidden shrink-0 rounded-md border border-[#1718141a] bg-[#17181408] px-1.5 py-0.5 text-[9px] font-semibold text-[#17181470] sm:block" aria-hidden="true">/</kbd>
    </div>
  </form>
</template>

<style scoped>
.expandable-search {
  width: 44px;
  transition: width var(--expandable-search-duration) cubic-bezier(.16, 1, .3, 1), border-color 160ms ease, box-shadow 160ms ease;
}

.expandable-search--open {
  width: min(var(--expandable-search-width), 100%);
  border-color: #171814;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--registry-accent, #d9ff57) 72%, transparent), 0 14px 32px -24px #171814;
}

@media (prefers-reduced-motion: reduce) {
  .expandable-search {
    transition: none;
  }
}
</style>
