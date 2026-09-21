<script setup lang="ts">
import { computed, ref, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

export type FloatingLabelInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'time'
  | 'week'

const props = withDefaults(defineProps<{
  modelValue: string | number
  label: string
  type?: FloatingLabelInputType
  name?: string
  placeholder?: string
  description?: string
  error?: string
  success?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  autocomplete?: string
  id?: string
  duration?: number
}>(), {
  type: 'text',
  name: undefined,
  placeholder: undefined,
  description: undefined,
  error: undefined,
  success: undefined,
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  autocomplete: undefined,
  id: undefined,
  duration: 220,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [event: Event]
  'change': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': [previousValue: string | number]
}>()

const attrs = useAttrs()
const inputElement = ref<HTMLInputElement>()
const focused = ref(false)
const generatedId = `floating-label-input-${useId()}`
const inputId = computed(() => props.id || generatedId)
const statusId = computed(() => `${inputId.value}-status`)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 220)
const inputValue = computed(() => typeof props.modelValue === 'number' && !Number.isFinite(props.modelValue) ? '' : props.modelValue)
const hasValue = computed(() => String(inputValue.value).length > 0)
const isFloating = computed(() => focused.value || hasValue.value || Boolean(props.placeholder))
const status = computed(() => props.error || props.success || props.description || '')
const statusKind = computed(() => props.error ? 'error' : props.success ? 'success' : 'description')
const controlTestId = computed(() => typeof attrs['data-testid'] === 'string' ? attrs['data-testid'] : 'floating-label-input-control')
const ariaInvalid = computed<true | false | 'true' | 'false' | 'grammar' | 'spelling' | undefined>(() => {
  if (props.error) return 'true'
  const provided = attrs['aria-invalid']
  if (provided === true || provided === false || provided === 'true' || provided === 'false' || provided === 'grammar' || provided === 'spelling') return provided
  return undefined
})
const describedBy = computed(() => {
  const provided = attrs['aria-describedby']
  return [provided == null ? '' : String(provided), status.value ? statusId.value : ''].filter(Boolean).join(' ') || undefined
})
const forwardedAttrs = computed(() => {
  const { 'aria-describedby': _describedBy, 'aria-invalid': _invalid, ...rest } = attrs
  return rest
})

function readInputValue(target: HTMLInputElement): string | number {
  if (props.type !== 'number' || target.value === '') return target.value
  return Number.isFinite(target.valueAsNumber) ? target.valueAsNumber : ''
}

function onInput(event: Event) {
  emit('update:modelValue', readInputValue(event.target as HTMLInputElement))
  emit('input', event)
}

function onChange(event: Event) {
  emit('change', event)
}

function onFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function focus(options?: FocusOptions) {
  inputElement.value?.focus(options)
}

function blur() {
  inputElement.value?.blur()
}

function select() {
  inputElement.value?.select()
}

function clear() {
  if (props.disabled || props.readonly || !hasValue.value) return

  const previousValue = props.modelValue
  if (inputElement.value) {
    inputElement.value.value = ''
    inputElement.value.dispatchEvent(new Event('input', { bubbles: true }))
    inputElement.value.focus()
  }
  else {
    emit('update:modelValue', '')
  }
  emit('clear', previousValue)
}

defineExpose({ focus, blur, select, clear })
</script>

<template>
  <div
    class="floating-label-input w-full text-[#181a17]"
    :class="{ 'opacity-55': disabled }"
    :data-state="error ? 'error' : success ? 'success' : focused ? 'focused' : 'idle'"
    data-testid="floating-label-input"
    :style="{ '--floating-label-duration': `${safeDuration}ms` }"
  >
    <div class="relative">
      <input
        v-bind="forwardedAttrs"
        :id="inputId"
        ref="inputElement"
        :value="inputValue"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="ariaInvalid"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? statusId : undefined"
        class="floating-label-input__control peer h-16 w-full appearance-none rounded-[18px] border border-[#181a1726] bg-[#f8f8f4] px-4 pb-2 pt-6 text-[15px] font-medium tracking-[-0.01em] text-[#181a17] caret-[#181a17] shadow-[0_12px_28px_-24px_rgba(20,22,18,0.7)] outline-none placeholder:text-[#181a1754] hover:not-disabled:border-[#181a1752] focus:border-[#181a174d] focus:bg-white focus:shadow-[0_16px_36px_-26px_rgba(20,22,18,0.8)] read-only:cursor-default disabled:cursor-not-allowed motion-reduce:transition-none"
        :class="clearable && hasValue ? 'pr-12' : undefined"
        :data-testid="controlTestId"
        @input="onInput"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
      >

      <label
        :for="inputId"
        class="floating-label-input__label pointer-events-none absolute left-4 origin-left select-none font-medium tracking-[-0.01em]"
        :class="[
          isFloating ? 'top-2.5 translate-y-0 text-[10px] uppercase tracking-[0.09em]' : 'top-1/2 -translate-y-1/2 text-[14px]',
          error ? 'text-[#c93f32]' : success ? 'text-[#17745d]' : focused ? 'text-[#181a17]' : 'text-[#181a1791]',
        ]"
      >
        {{ label }}<span v-if="required" class="ml-0.5" aria-hidden="true">*</span>
      </label>

      <button
        v-if="clearable && hasValue"
        type="button"
        class="floating-label-input__clear absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-[#181a1709] text-[#181a1780] outline-none hover:not-disabled:bg-[#181a1712] hover:not-disabled:text-[#181a17] focus-visible:ring-2 focus-visible:ring-[#181a1740] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
        :disabled="disabled || readonly"
        :aria-label="`Clear ${label}`"
        data-testid="floating-label-input-clear"
        @mousedown.prevent
        @click="clear"
      >
        <svg class="size-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 4 8 8m0-8-8 8" />
        </svg>
      </button>

      <span class="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full" aria-hidden="true">
        <span
          class="floating-label-input__underline block h-full origin-center rounded-full"
          :class="[
            error ? 'bg-[#d94b3d]' : success ? 'bg-[#1c8a6d]' : 'bg-[var(--registry-accent,#d9ff57)]',
            focused || error || success ? 'scale-x-100' : 'scale-x-0',
          ]"
        />
      </span>
    </div>

    <div class="relative mt-2 min-h-5 px-1">
      <Transition name="floating-label-status" mode="out-in">
        <p
          v-if="status"
          :id="statusId"
          :key="`${statusKind}-${status}`"
          class="floating-label-input__status flex items-start gap-1.5 text-[11px] leading-5"
          :class="statusKind === 'error' ? 'text-[#b93429]' : statusKind === 'success' ? 'text-[#167058]' : 'text-[#181a1780]'"
          :role="statusKind === 'error' ? 'alert' : statusKind === 'success' ? 'status' : undefined"
          data-testid="floating-label-input-status"
        >
          <svg v-if="statusKind !== 'description'" class="mt-1 size-3 shrink-0 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 16 16" aria-hidden="true">
            <path v-if="statusKind === 'success'" d="m3 8 3 3 7-7" />
            <path v-else d="M8 3v6m0 3h.01" />
          </svg>
          <span>{{ status }}</span>
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.floating-label-input__control,
.floating-label-input__label,
.floating-label-input__clear,
.floating-label-input__underline {
  transition-duration: var(--floating-label-duration);
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.floating-label-input__control {
  transition-property: border-color, background-color, box-shadow;
}

.floating-label-input__label {
  transition-property: color, font-size, letter-spacing, top, transform;
}

.floating-label-input__clear {
  transition-property: color, background-color, opacity, transform;
}

.floating-label-input__underline {
  transition-property: background-color, transform;
}

.floating-label-status-enter-active,
.floating-label-status-leave-active {
  transition-duration: var(--floating-label-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.floating-label-status-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.floating-label-status-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

@media (prefers-reduced-motion: reduce) {
  .floating-label-input__control,
  .floating-label-input__label,
  .floating-label-input__clear,
  .floating-label-input__underline,
  .floating-label-status-enter-active,
  .floating-label-status-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
