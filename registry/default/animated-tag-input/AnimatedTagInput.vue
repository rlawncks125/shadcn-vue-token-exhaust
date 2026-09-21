<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

export type AnimatedTagInputValidationResult = boolean | string | void
export type AnimatedTagInputValidator = (value: string) => AnimatedTagInputValidationResult

const props = withDefaults(defineProps<{
  modelValue: string[]
  label?: string
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  separators?: string[]
  validate?: AnimatedTagInputValidator
  disabled?: boolean
  readonly?: boolean
  duration?: number
}>(), {
  label: 'Tags',
  placeholder: 'Add a tag',
  maxTags: 8,
  allowDuplicates: false,
  separators: () => [','],
  disabled: false,
  readonly: false,
  duration: 180,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  add: [tag: string]
  remove: [tag: string, index: number]
  invalid: [value: string, reason: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const input = ref<HTMLInputElement>()
const tagButtons = ref<HTMLButtonElement[]>([])
const draft = ref('')
const rovingIndex = ref(-1)
const announcement = ref('')
const hasError = ref(false)
const inputId = `animated-tag-input-${useId()}`
const descriptionId = `${inputId}-description`
const statusId = `${inputId}-status`

const safeMax = computed(() => Number.isFinite(props.maxTags) ? Math.max(0, Math.floor(props.maxTags)) : 8)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 180)
const usableSeparators = computed(() => Array.from(new Set(
  (Array.isArray(props.separators) ? props.separators : []).filter(separator => typeof separator === 'string' && separator.length > 0),
)))

function duplicateKey(value: string) {
  return value.toLocaleLowerCase()
}

function normalize(values: unknown): string[] {
  if (!Array.isArray(values) || safeMax.value === 0) return []
  const tags: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    if (typeof value !== 'string') continue
    const tag = value.trim()
    if (!tag) continue
    const key = duplicateKey(tag)
    if (!props.allowDuplicates && seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
    if (tags.length >= safeMax.value) break
  }

  return tags
}

const tags = computed(() => normalize(props.modelValue))
const tagItems = computed(() => {
  const occurrences = new Map<string, number>()
  return tags.value.map((tag) => {
    const occurrence = occurrences.get(tag) ?? 0
    occurrences.set(tag, occurrence + 1)
    return { tag, key: `${tag}\u0000${occurrence}` }
  })
})
const atLimit = computed(() => tags.value.length >= safeMax.value)
const statusText = computed(() => announcement.value || `${tags.value.length} of ${safeMax.value} tags added.`)
const description = computed(() => {
  const addHint = !usableSeparators.value.length
    ? 'Press Enter to add.'
    : `Press Enter or ${usableSeparators.value.includes(',') ? 'comma' : 'a configured separator'} to add.`
  return `${addHint} Use arrow keys to move between remove buttons.`
})

function sameValues(source: unknown, normalized: string[]) {
  return Array.isArray(source)
    && source.length === normalized.length
    && source.every((value, index) => value === normalized[index])
}

function commit(next: string[]) {
  emit('update:modelValue', normalize(next))
}

function reject(value: string, reason: string) {
  hasError.value = true
  announcement.value = reason
  emit('invalid', value, reason)
}

function tryAdd(value: string, current: string[]) {
  const tag = value.trim()
  if (!tag) {
    reject(value, 'Enter a tag before adding it.')
    return false
  }
  if (!props.allowDuplicates && current.some(item => duplicateKey(item) === duplicateKey(tag))) {
    reject(value, `"${tag}" is already in the list.`)
    return false
  }
  if (current.length >= safeMax.value) {
    reject(value, `You can add up to ${safeMax.value} tags.`)
    return false
  }

  try {
    const result = props.validate?.(tag)
    if (result === false || typeof result === 'string') {
      reject(value, typeof result === 'string' ? result : `"${tag}" is not a valid tag.`)
      return false
    }
  }
  catch (error) {
    reject(value, error instanceof Error ? error.message : `"${tag}" is not a valid tag.`)
    return false
  }

  current.push(tag)
  emit('add', tag)
  hasError.value = false
  announcement.value = `${tag} added. ${current.length} of ${safeMax.value} tags used.`
  return true
}

function addValues(values: string[]) {
  if (props.disabled || props.readonly) return false
  const next = [...tags.value]
  let added = false
  for (const value of values) added = tryAdd(value, next) || added
  if (added) {
    commit(next)
    draft.value = ''
  }
  return added
}

function add(value = draft.value) {
  return addValues([value])
}

async function focusTag(index: number) {
  if (props.disabled || props.readonly || !tags.value.length) return
  rovingIndex.value = Math.max(0, Math.min(index, tags.value.length - 1))
  await nextTick()
  tagButtons.value[rovingIndex.value]?.focus()
}

async function focus() {
  await nextTick()
  input.value?.focus()
}

async function remove(index: number) {
  if (props.disabled || props.readonly || index < 0 || index >= tags.value.length) return false
  const next = [...tags.value]
  const [removed] = next.splice(index, 1)
  commit(next)
  emit('remove', removed, index)
  hasError.value = false
  announcement.value = `${removed} removed. ${next.length} of ${safeMax.value} tags used.`

  await nextTick()
  if (next.length) await focusTag(Math.min(index, next.length - 1))
  else await focus()
  return true
}

function clear() {
  if (props.disabled || props.readonly || !tags.value.length) return false
  const removed = [...tags.value]
  commit([])
  removed.forEach((tag, index) => emit('remove', tag, index))
  hasError.value = false
  announcement.value = 'All tags removed.'
  focus()
  return true
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function onPaste(event: ClipboardEvent) {
  if (props.disabled || props.readonly || !usableSeparators.value.length) return
  const value = event.clipboardData?.getData('text') ?? ''
  const pattern = new RegExp([...usableSeparators.value].sort((a, b) => b.length - a.length).map(escapeRegex).join('|'))
  if (!pattern.test(value)) return
  event.preventDefault()
  const values = value.split(pattern).map(item => item.trim()).filter(Boolean)
  if (values.length) addValues(values)
  else reject(value, 'The pasted value does not contain a tag.')
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Enter' || usableSeparators.value.includes(event.key)) {
    event.preventDefault()
    add()
    return
  }
  if (event.key === 'Backspace' && !draft.value) {
    event.preventDefault()
    focusTag(tags.value.length - 1)
    return
  }
  if (event.key === 'ArrowLeft' && input.value?.selectionStart === 0) {
    event.preventDefault()
    focusTag(tags.value.length - 1)
  }
}

function onTagKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusTag(index > 0 ? index - 1 : tags.value.length - 1)
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    if (index < tags.value.length - 1) focusTag(index + 1)
    else focus()
  }
  else if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    remove(index)
  }
  else if (event.key === 'Escape') {
    event.preventDefault()
    focus()
  }
}

function setTagButton(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) tagButtons.value[index] = element
}

watch(tags, (value) => {
  if (!sameValues(props.modelValue, value)) emit('update:modelValue', value)
  if (rovingIndex.value >= value.length) rovingIndex.value = value.length - 1
}, { immediate: true })

defineExpose({ focus, add, remove, clear })
</script>

<template>
  <div
    class="animated-tag-input w-full text-[#171814]"
    :class="{ 'opacity-50': disabled, 'is-readonly': readonly }"
    :style="{ '--tag-duration': `${safeDuration}ms` }"
  >
    <div class="mb-2 flex items-end justify-between gap-4 px-1">
      <label :for="inputId" class="text-[11px] font-bold uppercase tracking-[0.13em] text-[#17181499]">
        {{ label }}
      </label>
      <span class="text-[10px] tabular-nums text-[#17181470]" aria-hidden="true">{{ tags.length }}/{{ safeMax }}</span>
    </div>

    <div
      class="flex min-h-[54px] flex-wrap items-center gap-2 rounded-[17px] border bg-white/80 p-2 shadow-[0_12px_28px_-24px_rgba(23,24,20,0.8)] transition-[border-color,box-shadow,background-color] focus-within:border-[#171814] focus-within:bg-white focus-within:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57),0_14px_30px_-24px_rgba(23,24,20,0.75)] motion-reduce:transition-none"
      :class="hasError ? 'border-[#c8342b]' : 'border-[#17181424]'"
      :aria-disabled="disabled || undefined"
    >
      <TransitionGroup name="tag-list" tag="div" class="contents" role="list" aria-label="Added tags">
        <span
          v-for="(item, index) in tagItems"
          :key="item.key"
          role="listitem"
          class="tag-chip inline-flex h-8 max-w-full items-center gap-1 rounded-[10px] border border-[#17181414] bg-[#171814] pl-3 pr-1 text-[11px] font-semibold text-white shadow-[0_7px_15px_-12px_#000]"
        >
          <span class="max-w-[180px] truncate">{{ item.tag }}</span>
          <button
            :ref="element => setTagButton(element, index)"
            type="button"
            class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-white/55 outline-none transition-[background-color,color,transform] hover:not-disabled:bg-white/15 hover:not-disabled:text-white active:not-disabled:scale-90 focus-visible:bg-[var(--registry-accent,#d9ff57)] focus-visible:text-[#171814] disabled:cursor-default disabled:opacity-45 motion-reduce:transition-none"
            :disabled="disabled || readonly"
            :tabindex="!disabled && !readonly && rovingIndex === index ? 0 : -1"
            :aria-label="`Remove ${item.tag}`"
            @focus="rovingIndex = index"
            @click="remove(index)"
            @keydown="onTagKeydown($event, index)"
          >
            <svg class="size-3 fill-none stroke-current stroke-2 [stroke-linecap:round]" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4.5 4.5 7 7m0-7-7 7" />
            </svg>
          </button>
        </span>
      </TransitionGroup>

      <input
        :id="inputId"
        ref="input"
        v-model="draft"
        type="text"
        autocomplete="off"
        class="h-8 min-w-[110px] flex-1 border-0 bg-transparent px-1.5 [font:inherit] text-[12px] text-[#171814] outline-none placeholder:text-[#17181466] disabled:cursor-not-allowed read-only:cursor-default"
        :placeholder="atLimit ? 'Tag limit reached' : placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-describedby="`${descriptionId} ${statusId}`"
        :aria-invalid="hasError || undefined"
        @input="hasError = false; announcement = ''"
        @keydown="onInputKeydown"
        @paste="onPaste"
        @focus="rovingIndex = -1; emit('focus', $event)"
        @blur="emit('blur', $event)"
      >
    </div>

    <div class="mt-2 flex min-h-8 items-start justify-between gap-4 px-1 text-[10px] leading-4">
      <p :id="descriptionId" class="max-w-[70%] text-[#17181466]">{{ description }}</p>
      <p
        :id="statusId"
        class="text-right"
        :class="hasError ? 'text-[#c8342b]' : 'text-[#17181470]'"
        role="status"
        aria-live="polite"
      >
        {{ statusText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.tag-list-enter-active,
.tag-list-leave-active,
.tag-list-move {
  transition:
    opacity var(--tag-duration) ease,
    transform var(--tag-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
}

.tag-list-enter-from {
  opacity: 0;
  transform: translateY(5px) scale(0.88);
}

.tag-list-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.88);
}

@media (prefers-reduced-motion: reduce) {
  .tag-list-enter-active,
  .tag-list-leave-active,
  .tag-list-move {
    transition-duration: 0.01ms;
  }
}
</style>
