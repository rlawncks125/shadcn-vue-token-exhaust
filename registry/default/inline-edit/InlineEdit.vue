<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'

export type InlineEditValidationResult = boolean | string | void
export type InlineEditValidator = (value: string) => InlineEditValidationResult | Promise<InlineEditValidationResult>

const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  maxLength?: number
  trim?: boolean
  saveOnBlur?: boolean
  validate?: InlineEditValidator
}>(), {
  label: 'Editable value',
  placeholder: 'Enter a value',
  emptyLabel: 'Add a value',
  disabled: false,
  maxLength: 120,
  trim: true,
  saveOnBlur: true,
})

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  edit: [value: string]
  save: [value: string]
  cancel: [value: string]
}>()

const editing = ref(false)
const pending = ref(false)
const draft = ref(model.value)
const error = ref('')
const input = ref<HTMLInputElement>()
const trigger = ref<HTMLButtonElement>()
const form = ref<HTMLFormElement>()
const inputId = `inline-edit-${useId()}`
const errorId = `${inputId}-error`
let validationToken = 0

async function focusTrigger() {
  await nextTick()
  trigger.value?.focus()
}

async function edit() {
  if (props.disabled || editing.value) return
  draft.value = model.value
  error.value = ''
  editing.value = true
  emit('edit', model.value)
  await nextTick()
  input.value?.focus()
  input.value?.select()
}

async function save() {
  if (!editing.value || pending.value) return
  const value = props.trim ? draft.value.trim() : draft.value
  const token = ++validationToken
  pending.value = true
  error.value = ''

  try {
    const result = await props.validate?.(value)
    if (token !== validationToken) return
    if (result === false || typeof result === 'string') {
      error.value = typeof result === 'string' ? result : 'This value is not valid.'
      await nextTick()
      input.value?.focus()
      return
    }

    draft.value = value
    model.value = value
    editing.value = false
    emit('save', value)
    await focusTrigger()
  }
  catch (reason) {
    if (token === validationToken) {
      error.value = reason instanceof Error ? reason.message : 'Unable to save this value.'
      await nextTick()
      input.value?.focus()
    }
  }
  finally {
    if (token === validationToken) pending.value = false
  }
}

function cancel() {
  if (!editing.value || pending.value) return
  validationToken++
  draft.value = model.value
  error.value = ''
  editing.value = false
  emit('cancel', model.value)
  focusTrigger()
}

function onFocusout(event: FocusEvent) {
  if (!props.saveOnBlur || pending.value) return
  const next = event.relatedTarget as Node | null
  if (next && form.value?.contains(next)) return
  save()
}

watch(model, (value) => {
  if (!editing.value) draft.value = value
})
watch(() => props.disabled, (disabled) => {
  if (!disabled || !editing.value) return
  validationToken++
  pending.value = false
  draft.value = model.value
  error.value = ''
  editing.value = false
})

defineExpose({ edit, save, cancel })
</script>

<template>
  <div class="inline-edit w-full max-w-[480px] text-[#171814]" :class="{ 'opacity-50': disabled }">
    <span class="mb-2 block text-[11px] font-[650] text-[#17181480]" :id="`${inputId}-label`">{{ label }}</span>

    <button
      v-if="!editing"
      ref="trigger"
      type="button"
      class="inline-edit-trigger group flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-[14px] border border-[#1718141f] bg-[#ffffffb8] px-3.5 text-left [font:inherit] shadow-[0_10px_24px_-22px_#0008] transition-[border-color,background-color,transform] duration-200 hover:not-disabled:-translate-y-px hover:not-disabled:border-[#17181466] hover:not-disabled:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed motion-reduce:transition-none"
      :disabled="disabled"
      :aria-label="`Edit ${label}`"
      @click="edit"
    >
      <span class="min-w-0 truncate text-[13px]" :class="model ? 'text-[#171814]' : 'text-[#17181466]'">{{ model || emptyLabel }}</span>
      <span class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold tracking-[.08em] text-[#17181470] uppercase transition-colors group-hover:text-[#171814]">
        Edit
        <svg class="size-3.5 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="m13.8 3.2 3 3L7 16H4v-3L13.8 3.2Z" /><path d="m12 5 3 3" /></svg>
      </span>
    </button>

    <form v-else ref="form" class="inline-edit-form" @submit.prevent="save" @focusout="onFocusout">
      <div class="flex items-center gap-2 rounded-[14px] border border-[#171814] bg-white p-1.5 shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)]">
        <input
          :id="inputId"
          ref="input"
          v-model="draft"
          class="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 [font:inherit] text-[13px] text-[#171814] outline-none placeholder:text-[#1718145c] disabled:cursor-wait"
          :placeholder="placeholder"
          :maxlength="Math.max(1, maxLength)"
          :disabled="pending"
          :aria-labelledby="`${inputId}-label`"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
          @keydown.esc.stop.prevent="cancel"
        >
        <button type="submit" class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border-0 bg-[#171814] text-white transition-transform hover:not-disabled:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814] disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none" :disabled="pending" aria-label="Save value">
          <svg v-if="!pending" class="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" /></svg>
          <svg v-else class="size-4 animate-spin fill-none stroke-current stroke-2 motion-reduce:animate-none" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" class="opacity-30" /><path d="M10 3a7 7 0 0 1 7 7" /></svg>
        </button>
        <button type="button" class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[#1718141f] bg-transparent text-[#17181499] transition-colors hover:not-disabled:bg-[#1718140a] hover:not-disabled:text-[#171814] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814] disabled:cursor-wait disabled:opacity-50" :disabled="pending" aria-label="Cancel editing" @click="cancel">
          <svg class="size-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10m0-10L5 15" /></svg>
        </button>
      </div>
      <div class="mt-2 flex min-h-4 items-start justify-between gap-4 px-1">
        <p v-if="error" :id="errorId" class="text-[10px] text-[#c8342b]" role="alert">{{ error }}</p>
        <p v-else class="text-[10px] text-[#17181466]">Enter to save, Escape to cancel</p>
        <span class="shrink-0 text-[9px] tabular-nums text-[#17181455]">{{ draft.length }}/{{ Math.max(1, maxLength) }}</span>
      </div>
    </form>
  </div>
</template>
