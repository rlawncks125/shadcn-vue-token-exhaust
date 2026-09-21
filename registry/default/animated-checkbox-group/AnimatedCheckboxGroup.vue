<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'

export interface AnimatedCheckboxOption {
  value: string
  label: string
  description?: string
  badge?: string
  disabled?: boolean
}

type NormalizedOption = AnimatedCheckboxOption & {
  source: AnimatedCheckboxOption
}

const props = withDefaults(
  defineProps<{
    options: AnimatedCheckboxOption[]
    modelValue: string[]
    label?: string
    name?: string
    columns?: 1 | 2 | 3
    orientation?: 'horizontal' | 'vertical'
    maxSelected?: number
    required?: boolean
    duration?: number
    disabled?: boolean
  }>(),
  {
    label: 'Choose options',
    name: undefined,
    columns: 1,
    orientation: 'vertical',
    maxSelected: undefined,
    required: false,
    duration: 320,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [next: string[], previous: string[]]
  limit: [option: AnimatedCheckboxOption]
}>()

const instanceId = `animated-checkbox-${useId()}`
const inputs = new Map<string, HTMLInputElement>()

const groupName = computed(() => (typeof props.name === 'string' && props.name.trim() ? props.name : instanceId))
const safeDuration = computed(() => {
  const duration = Number(props.duration)
  return Number.isFinite(duration) ? Math.min(2000, Math.max(0, duration)) : 320
})
const safeOrientation = computed(() => (props.orientation === 'horizontal' ? 'horizontal' : 'vertical'))
const safeColumns = computed<1 | 2 | 3>(() => {
  const columns = Number(props.columns)
  return columns === 2 || columns === 3 ? columns : 1
})
const layoutClass = computed(() => {
  if (safeOrientation.value === 'vertical') return 'grid-cols-1'
  if (safeColumns.value === 3) return 'grid-cols-3'
  if (safeColumns.value === 2) return 'grid-cols-2'
  return 'grid-cols-1'
})

const normalizedOptions = computed<NormalizedOption[]>(() => {
  if (!Array.isArray(props.options)) return []

  const seen = new Set<string>()
  const result: NormalizedOption[] = []

  for (const candidate of props.options as unknown[]) {
    if (!candidate || typeof candidate !== 'object') continue
    const option = candidate as Partial<AnimatedCheckboxOption>
    if (typeof option.value !== 'string' || !option.value.trim() || seen.has(option.value)) continue

    seen.add(option.value)
    result.push({
      value: option.value,
      label: typeof option.label === 'string' && option.label.trim() ? option.label : option.value,
      description: typeof option.description === 'string' ? option.description : undefined,
      badge: typeof option.badge === 'string' ? option.badge : undefined,
      disabled: Boolean(option.disabled),
      source: candidate as AnimatedCheckboxOption,
    })
  }

  return result
})

const safeMaxSelected = computed(() => {
  if (props.maxSelected === undefined || props.maxSelected === null) return undefined
  const maximum = Number(props.maxSelected)
  if (!Number.isFinite(maximum)) return undefined
  return Math.min(normalizedOptions.value.length, Math.max(1, Math.floor(maximum)))
})

const selectedValues = computed(() => {
  if (!Array.isArray(props.modelValue)) return []

  const available = new Set(normalizedOptions.value.map((option) => option.value))
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of props.modelValue as unknown[]) {
    if (typeof value !== 'string' || !available.has(value) || seen.has(value)) continue
    if (safeMaxSelected.value !== undefined && result.length >= safeMaxSelected.value) break
    seen.add(value)
    result.push(value)
  }

  return result
})

const selectedSet = computed(() => new Set(selectedValues.value))
const selectedOptions = computed(() => normalizedOptions.value.filter((option) => selectedSet.value.has(option.value)))
const firstEnabledValue = computed(() => normalizedOptions.value.find((option) => !option.disabled)?.value)
const summary = computed(() => {
  const count = selectedValues.value.length
  if (safeMaxSelected.value !== undefined) return `${count} of ${safeMaxSelected.value} selected`
  return `${count} selected`
})

function setInput(element: unknown, value: string) {
  if (element instanceof HTMLInputElement) inputs.set(value, element)
  else inputs.delete(value)
}

function commit(next: string[]) {
  const previous = [...selectedValues.value]
  if (next.length === previous.length && next.every((value, index) => value === previous[index])) return
  emit('update:modelValue', next)
  emit('change', next, previous)
}

function select(value: string) {
  if (props.disabled) return
  const option = normalizedOptions.value.find((item) => item.value === value)
  if (!option || option.disabled || selectedSet.value.has(value)) return

  if (safeMaxSelected.value !== undefined && selectedValues.value.length >= safeMaxSelected.value) {
    emit('limit', option.source)
    return
  }

  commit([...selectedValues.value, value])
}

function deselect(value: string) {
  if (props.disabled || !selectedSet.value.has(value)) return
  commit(selectedValues.value.filter((selected) => selected !== value))
}

function toggle(value: string) {
  if (selectedSet.value.has(value)) deselect(value)
  else select(value)
}

function clear() {
  if (!props.disabled) commit([])
}

function focus(value?: string) {
  if (props.disabled) return
  const requested = normalizedOptions.value.find((option) => option.value === value && !option.disabled)
  const selected = normalizedOptions.value.find((option) => selectedSet.value.has(option.value) && !option.disabled)
  const target = requested ?? selected ?? normalizedOptions.value.find((option) => !option.disabled)
  if (target) inputs.get(target.value)?.focus()
}

function handleChange(event: Event, option: NormalizedOption) {
  const input = event.currentTarget as HTMLInputElement
  if (input.checked) select(option.value)
  else deselect(option.value)

  nextTick(() => {
    input.checked = selectedSet.value.has(option.value)
  })
}

defineExpose({ select, deselect, toggle, clear, focus })
</script>

<template>
  <fieldset
    class="animated-checkbox-group min-w-0 border-0 p-0 text-[#171814] disabled:opacity-50"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
    :data-orientation="safeOrientation"
    :style="{ '--checkbox-duration': `${safeDuration}ms` }"
  >
    <legend :id="`${instanceId}-legend`" class="mb-3 w-full px-0">
      <span class="flex items-end justify-between gap-4">
        <span class="text-sm font-semibold tracking-[-0.01em]">
          {{ label }}<span v-if="required" class="ml-0.5 text-[#9b3b32]" aria-hidden="true">*</span>
        </span>
        <span class="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#17181466]" aria-hidden="true">
          {{ summary }}
        </span>
      </span>
    </legend>

    <div class="animated-checkbox-grid grid gap-3" :class="layoutClass">
      <label
        v-for="(option, index) in normalizedOptions"
        :key="option.value"
        class="animated-checkbox-card group relative isolate flex min-h-[118px] cursor-pointer overflow-hidden rounded-[18px] border bg-white p-4 shadow-[0_10px_30px_-28px_rgba(23,24,20,0.7)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--registry-accent,#d9ff57)] has-[:focus-visible]:ring-offset-2"
        :class="selectedSet.has(option.value) ? 'is-selected border-[#171814]' : 'border-[#1718141f] hover:border-[#17181466]'"
      >
        <input
          :id="`${instanceId}-${index}`"
          :ref="(element) => setInput(element, option.value)"
          type="checkbox"
          class="sr-only"
          :name="groupName"
          :value="option.value"
          :checked="selectedSet.has(option.value)"
          :disabled="disabled || option.disabled"
          :required="required && !selectedValues.length && option.value === firstEnabledValue"
          :aria-required="required || undefined"
          @change="handleChange($event, option)"
        />

        <span class="animated-checkbox-fill absolute inset-0 -z-10 origin-bottom-left bg-[var(--registry-accent,#d9ff57)]" aria-hidden="true" />

        <span class="relative flex min-w-0 flex-1 items-start gap-3.5">
          <span
            class="animated-checkbox-indicator mt-0.5 grid size-6 shrink-0 place-items-center rounded-[7px] border-2"
            :class="selectedSet.has(option.value) ? 'border-[#171814] bg-[#171814] text-[var(--registry-accent,#d9ff57)]' : 'border-[#17181440] bg-white text-transparent'"
            aria-hidden="true"
          >
            <svg class="animated-checkbox-check size-3.5 fill-none stroke-current stroke-[2.6]" viewBox="0 0 16 16">
              <path d="m3.25 8.25 3 3 6.5-6.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold tracking-[-0.015em]">{{ option.label }}</span>
              <span v-if="option.badge" class="rounded-full border border-[#17181424] bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.09em]">
                {{ option.badge }}
              </span>
            </span>
            <span v-if="option.description" class="mt-1.5 block text-xs leading-5 text-[#1718148c]">
              {{ option.description }}
            </span>
          </span>
        </span>
      </label>

      <p v-if="!normalizedOptions.length" class="rounded-[18px] border border-dashed border-[#1718142e] px-4 py-5 text-sm text-[#17181480]">
        No options available.
      </p>
    </div>

    <div class="mt-3 flex min-h-7 items-center gap-2 overflow-hidden" role="status" aria-live="polite" aria-atomic="true">
      <span class="sr-only">{{ summary }}.</span>
      <TransitionGroup name="animated-checkbox-summary" tag="span" class="flex flex-wrap gap-1.5" aria-hidden="true">
        <span
          v-for="option in selectedOptions"
          :key="option.value"
          class="rounded-full bg-[#171814] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white"
        >
          {{ option.label }}
        </span>
      </TransitionGroup>
      <span v-if="!selectedOptions.length" class="text-[11px] text-[#17181466]" aria-hidden="true">Nothing selected yet</span>
    </div>
  </fieldset>
</template>

<style scoped>
.animated-checkbox-card,
.animated-checkbox-fill,
.animated-checkbox-indicator,
.animated-checkbox-check {
  transition-duration: var(--checkbox-duration);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-checkbox-card {
  transition-property: border-color, box-shadow, transform;
}

.animated-checkbox-card:active:not(:has(input:disabled)) {
  transform: scale(0.985);
}

.animated-checkbox-fill {
  opacity: 0;
  transform: scale(0.88);
  transition-property: opacity, transform;
}

.animated-checkbox-card.is-selected {
  box-shadow:
    0 0 0 1px #171814,
    0 18px 35px -28px rgb(23 24 20 / 0.75);
}

.animated-checkbox-card.is-selected .animated-checkbox-fill {
  opacity: 1;
  transform: scale(1);
}

.animated-checkbox-indicator {
  transition-property: color, background-color, border-color, transform;
}

.animated-checkbox-card.is-selected .animated-checkbox-indicator {
  transform: scale(1.06) rotate(2deg);
}

.animated-checkbox-check {
  opacity: 0;
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  transform: scale(0.45) rotate(-12deg);
  transition-property: opacity, stroke-dashoffset, transform;
}

.animated-checkbox-card.is-selected .animated-checkbox-check {
  opacity: 1;
  stroke-dashoffset: 0;
  transform: scale(1) rotate(0deg);
}

.animated-checkbox-summary-enter-active,
.animated-checkbox-summary-leave-active {
  transition-duration: var(--checkbox-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-checkbox-summary-enter-from,
.animated-checkbox-summary-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.92);
}

@media (max-width: 640px) {
  .animated-checkbox-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-checkbox-card,
  .animated-checkbox-fill,
  .animated-checkbox-indicator,
  .animated-checkbox-check,
  .animated-checkbox-summary-enter-active,
  .animated-checkbox-summary-leave-active {
    transition: none;
  }
}
</style>
