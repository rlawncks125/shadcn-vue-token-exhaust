<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'

export interface AnimatedRadioOption {
  value: string
  label: string
  description?: string
  badge?: string
  disabled?: boolean
}

type NormalizedOption = AnimatedRadioOption & {
  source: AnimatedRadioOption
}

const props = withDefaults(
  defineProps<{
    options: AnimatedRadioOption[]
    modelValue: string
    label?: string
    name?: string
    orientation?: 'horizontal' | 'vertical'
    columns?: 1 | 2 | 3
    duration?: number
    disabled?: boolean
    required?: boolean
  }>(),
  {
    label: 'Choose an option',
    name: undefined,
    orientation: 'vertical',
    columns: 1,
    duration: 320,
    disabled: false,
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string, previous: string, option: AnimatedRadioOption]
}>()

const instanceId = `animated-radio-${useId()}`
const inputs = new Map<string, HTMLInputElement>()

const groupName = computed(() => (typeof props.name === 'string' && props.name.trim() ? props.name : instanceId))
const safeDuration = computed(() => (Number.isFinite(props.duration) ? Math.max(0, props.duration) : 320))
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
    const option = candidate as Partial<AnimatedRadioOption>
    if (typeof option.value !== 'string' || !option.value.trim() || seen.has(option.value)) continue

    seen.add(option.value)
    result.push({
      value: option.value,
      label: typeof option.label === 'string' && option.label.trim() ? option.label : option.value,
      description: typeof option.description === 'string' ? option.description : undefined,
      badge: typeof option.badge === 'string' ? option.badge : undefined,
      disabled: Boolean(option.disabled),
      source: candidate as AnimatedRadioOption,
    })
  }

  return result
})

function setInput(element: unknown, value: string) {
  if (element instanceof HTMLInputElement) inputs.set(value, element)
  else inputs.delete(value)
}

function commit(option: NormalizedOption) {
  if (props.disabled || option.disabled || option.value === props.modelValue) return
  const previous = props.modelValue
  emit('update:modelValue', option.value)
  emit('change', option.value, previous, option.source)
}

function handleChange(event: Event, option: NormalizedOption) {
  if ((event.currentTarget as HTMLInputElement).checked) commit(option)
}

function handleKeydown(event: KeyboardEvent, option: NormalizedOption) {
  const enabled = normalizedOptions.value.filter((item) => !item.disabled)
  if (!enabled.length) return

  const currentIndex = Math.max(
    0,
    enabled.findIndex((item) => item.value === option.value),
  )
  let next: NormalizedOption | undefined

  if (event.key === 'Home') next = enabled[0]
  else if (event.key === 'End') next = enabled[enabled.length - 1]
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = enabled[(currentIndex + 1) % enabled.length]
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = enabled[(currentIndex - 1 + enabled.length) % enabled.length]
  else return

  event.preventDefault()
  if (!next) return
  commit(next)
  nextTick(() => inputs.get(next.value)?.focus())
}

function focus() {
  if (props.disabled) return
  const target =
    normalizedOptions.value.find((option) => option.value === props.modelValue && !option.disabled) ??
    normalizedOptions.value.find((option) => !option.disabled)
  if (target) inputs.get(target.value)?.focus()
}

function select(value: string) {
  const option = normalizedOptions.value.find((item) => item.value === value)
  if (option) commit(option)
}

defineExpose({ focus, select })
</script>

<template>
  <fieldset
    class="animated-radio-group min-w-0 border-0 p-0 text-[#171814] disabled:opacity-50"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
    :data-orientation="safeOrientation"
    :style="{ '--radio-duration': `${safeDuration}ms` }"
  >
    <legend :id="`${instanceId}-legend`" class="mb-3 px-0 text-sm font-semibold tracking-[-0.01em]">
      {{ label }}<span v-if="required" class="ml-0.5 text-[#9b3b32]" aria-hidden="true">*</span>
    </legend>

    <div class="animated-radio-grid grid gap-3" :class="layoutClass">
      <label
        v-for="(option, index) in normalizedOptions"
        :key="option.value"
        class="animated-radio-card group relative isolate flex min-h-[112px] cursor-pointer overflow-hidden rounded-[18px] border bg-white p-4 shadow-[0_10px_30px_-28px_rgba(23,24,20,0.7)] outline-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--registry-accent,#d9ff57)] has-[:focus-visible]:ring-offset-2"
        :class="modelValue === option.value ? 'is-selected border-[#171814]' : 'border-[#1718141f] hover:border-[#17181466]'"
      >
        <input
          :id="`${instanceId}-${index}`"
          :ref="(element) => setInput(element, option.value)"
          type="radio"
          class="sr-only"
          :name="groupName"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="disabled || option.disabled"
          :required="required"
          @change="handleChange($event, option)"
          @keydown="handleKeydown($event, option)"
        />

        <span class="animated-radio-fill absolute inset-0 -z-10 origin-bottom-right bg-[var(--registry-accent,#d9ff57)]" aria-hidden="true" />

        <span class="relative flex min-w-0 flex-1 items-start gap-3.5">
          <span
            class="animated-radio-indicator mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2"
            :class="
              modelValue === option.value
                ? 'border-[#171814] bg-[#171814] text-[var(--registry-accent,#d9ff57)]'
                : 'border-[#17181440] bg-white text-transparent'
            "
            aria-hidden="true"
          >
            <svg class="animated-radio-check size-3.5 fill-none stroke-current stroke-[2.6]" viewBox="0 0 16 16">
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
  </fieldset>
</template>

<style scoped>
.animated-radio-card,
.animated-radio-fill,
.animated-radio-indicator,
.animated-radio-check {
  transition-duration: var(--radio-duration);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-radio-card {
  transition-property: border-color, box-shadow, transform;
}

.animated-radio-card:active:not(:has(input:disabled)) {
  transform: scale(0.985);
}

.animated-radio-fill {
  opacity: 0;
  transform: scale(0.88);
  transition-property: opacity, transform;
}

.animated-radio-card.is-selected {
  box-shadow:
    0 0 0 1px #171814,
    0 18px 35px -28px rgb(23 24 20 / 0.75);
}

.animated-radio-card.is-selected .animated-radio-fill {
  opacity: 1;
  transform: scale(1);
}

.animated-radio-indicator {
  transition-property: color, background-color, border-color, transform;
}

.animated-radio-card.is-selected .animated-radio-indicator {
  transform: scale(1.06);
}

.animated-radio-check {
  opacity: 0;
  transform: scale(0.35) rotate(-18deg);
  transition-property: opacity, transform;
}

.animated-radio-card.is-selected .animated-radio-check {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

@media (max-width: 640px) {
  .animated-radio-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-radio-card,
  .animated-radio-fill,
  .animated-radio-indicator,
  .animated-radio-check {
    transition: none;
  }
}
</style>
