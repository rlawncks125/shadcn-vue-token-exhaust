<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

interface SchemaResult { success: boolean; error?: unknown }
interface SafeParseSchema {
  safeParse: (value: unknown) => SchemaResult
  safeParseAsync?: (value: unknown) => Promise<SchemaResult>
}
interface ValidateSchema {
  validate: (value: unknown) => Promise<unknown>
  validateSync?: (value: unknown) => unknown
}
export type PasswordValidationSchema = SafeParseSchema | ValidateSchema
export interface PasswordCriterion {
  key: string
  label: string
  test: (value: string) => boolean
}

const props = withDefaults(defineProps<{
  id?: string
  name?: string
  label?: string
  placeholder?: string
  minLength?: number
  requireMixedCase?: boolean
  requireNumber?: boolean
  requireSymbol?: boolean
  showRequirements?: boolean
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  error?: string
  schema?: PasswordValidationSchema
  criteria?: PasswordCriterion[]
  validateOn?: 'input' | 'blur'
}>(), {
  name: 'password',
  label: 'Password',
  placeholder: 'Create a secure password',
  minLength: 8,
  requireMixedCase: true,
  requireNumber: true,
  requireSymbol: true,
  showRequirements: true,
  disabled: false,
  required: false,
  autocomplete: 'new-password',
  error: '',
  validateOn: 'blur',
})
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ validity: [valid: boolean]; validated: [valid: boolean, error?: string, criterionKey?: string]; blur: [event: FocusEvent] }>()
const visible = ref(false)
const generatedId = `password-${useId()}`
const inputId = computed(() => props.id || generatedId)
const meterId = computed(() => `${inputId.value}-meter`)
const requirementsId = computed(() => `${inputId.value}-requirements`)
const errorId = computed(() => `${inputId.value}-error`)
const schemaError = ref('')
const schemaErrorKey = ref('')
let validationRun = 0

const defaultCriteria = computed<PasswordCriterion[]>(() => [
  { key: 'length', label: `At least ${Math.max(1, props.minLength)} characters`, test: value => value.length >= Math.max(1, props.minLength) },
  ...(props.requireMixedCase ? [{ key: 'case', label: 'Uppercase and lowercase letters', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) }] : []),
  ...(props.requireNumber ? [{ key: 'number', label: 'At least one number', test: (value: string) => /[0-9]/.test(value) }] : []),
  ...(props.requireSymbol ? [{ key: 'symbol', label: 'At least one symbol', test: (value: string) => /[^a-z0-9\s]/i.test(value) }] : []),
])
const criteria = computed(() => (props.criteria?.length ? props.criteria : defaultCriteria.value).map(item => {
  let met = false
  try { met = item.test(model.value) } catch { met = false }
  return { ...item, met }
}))
const metCount = computed(() => criteria.value.filter(item => item.met).length)
const valid = computed(() => criteria.value.every(item => item.met))
const level = computed(() => model.value ? Math.max(1, Math.ceil((metCount.value / Math.max(1, criteria.value.length)) * 4)) : 0)
const strength = computed(() => ['None', 'Weak', 'Fair', 'Good', 'Strong'][level.value])
const resolvedError = computed(() => props.error || schemaError.value)
const describedBy = computed(() => [meterId.value, props.showRequirements ? requirementsId.value : '', resolvedError.value ? errorId.value : ''].filter(Boolean).join(' '))

function errorDetails(error: unknown) {
  const candidate = error as {
    issues?: Array<{ message?: string; params?: { criterion?: string }; path?: Array<string | number> }>
    errors?: Array<{ message?: string; type?: string; path?: string }>
    inner?: Array<{ message?: string; type?: string; path?: string; params?: { criterion?: string } }>
    message?: string
    type?: string
    path?: string
    params?: { criterion?: string }
  }
  const issue = candidate?.issues?.[0]
  const yupIssue = (candidate?.inner?.[0] || candidate?.errors?.[0] || candidate) as { message?: string; type?: string; path?: string; params?: { criterion?: string } }
  return {
    message: issue?.message || yupIssue?.message || 'Invalid password',
    key: issue?.params?.criterion || yupIssue?.params?.criterion || yupIssue?.type || yupIssue?.path || issue?.path?.join('.') || '',
  }
}
async function validate() {
  if (!props.schema) {
    schemaError.value = ''
    schemaErrorKey.value = ''
    emit('validity', valid.value)
    emit('validated', valid.value, valid.value ? undefined : 'Password requirements are not met')
    return valid.value
  }
  const run = ++validationRun
  let message = ''
  let criterionKey = ''
  try {
    if ('safeParseAsync' in props.schema && props.schema.safeParseAsync) {
      const result = await props.schema.safeParseAsync(model.value)
      if (!result.success) ({ message, key: criterionKey } = errorDetails(result.error))
    } else if ('safeParse' in props.schema) {
      const result = props.schema.safeParse(model.value)
      if (!result.success) ({ message, key: criterionKey } = errorDetails(result.error))
    } else if (props.schema.validate) await props.schema.validate(model.value)
    else if (props.schema.validateSync) props.schema.validateSync(model.value)
  } catch (error) {
    ({ message, key: criterionKey } = errorDetails(error))
  }
  if (run !== validationRun) return false
  schemaError.value = message
  schemaErrorKey.value = criterionKey
  emit('validity', !message)
  emit('validated', !message, message || undefined, criterionKey || undefined)
  return !message
}
function onBlur(event: FocusEvent) {
  emit('blur', event)
  if (props.validateOn === 'blur') validate()
}

watch(valid, value => { if (!props.schema) emit('validity', value) })
watch([model, () => props.schema, () => props.criteria?.map(item => `${item.key}:${item.label}`).join('|')], () => {
  if (props.schema && props.validateOn === 'input') validate()
  else if (!props.schema) { schemaError.value = ''; schemaErrorKey.value = '' }
}, { flush: 'post' })
defineExpose({ validate })
</script>

<template>
  <div class="password-strength w-full max-w-[430px] text-[#171814]" :class="[`level-${level}`, { 'is-disabled opacity-50': disabled }]">
    <label class="mb-[7px] block text-[11px] font-[650]" :for="inputId">{{ label }}</label>
    <div class="password-field relative">
      <input
        :id="inputId" v-model="model" :name="name" :type="visible ? 'text' : 'password'" :placeholder="placeholder"
        class="h-12 w-full rounded-[14px] border border-[#17181422] bg-[#ffffffb8] pr-12 pl-3.5 [font:inherit] text-[13px] text-inherit outline-none transition-[border-color,box-shadow] duration-[160ms] placeholder:text-[#1718145c] focus:border-[#171814] focus:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] aria-invalid:border-[#e24e43] disabled:cursor-not-allowed motion-reduce:transition-none"
        :disabled="disabled" :required="required" :autocomplete="autocomplete"
        :aria-invalid="resolvedError || (!schema && model && !valid) ? 'true' : undefined" :aria-describedby="describedBy" @blur="onBlur"
      >
      <button type="button" class="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-[9px] border-0 bg-transparent text-[#17181480] hover:not-disabled:bg-[#1718140a] hover:not-disabled:text-[#171814] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#171814] disabled:cursor-not-allowed" :disabled="disabled" :aria-label="visible ? 'Hide password' : 'Show password'" :aria-pressed="visible" @click="visible = !visible">
        <svg v-if="!visible" class="w-[18px] fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
        <svg v-else class="w-[18px] fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]" aria-hidden="true" viewBox="0 0 24 24"><path d="m4 4 16 16M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M8.2 7.1C4.6 8.8 2.5 12 2.5 12s3.5 6 9.5 6a9.5 9.5 0 0 0 3.2-.5" /></svg>
      </button>
    </div>
    <div :id="meterId" class="strength-meter mt-2.5 grid grid-cols-[repeat(4,1fr)_auto] items-center gap-[5px]" role="meter" aria-label="Password strength" aria-valuemin="0" aria-valuemax="4" :aria-valuenow="level" :aria-valuetext="strength">
      <span
        v-for="segment in 4" :key="segment" class="h-1 rounded-[99px]"
        :class="[
          { filled: segment <= level },
          segment > level || level === 0 ? 'bg-[#17181416]' : '',
          segment <= level && level === 1 ? 'bg-[#ef665b]' : '',
          segment <= level && level === 2 ? 'bg-[#f0a62f]' : '',
          segment <= level && level === 3 ? 'bg-[#9abf35]' : '',
          segment <= level && level === 4 ? 'bg-[#6e9e21]' : '',
        ]"
      />
      <strong class="ml-1 min-w-[42px] text-right text-[9px] tracking-[.08em] text-[#17181470] uppercase" aria-hidden="true">{{ strength }}</strong>
    </div>
    <ul v-if="showRequirements" :id="requirementsId" class="requirements mt-[13px] grid list-none gap-[7px] p-0">
      <li v-for="item in criteria" :key="item.key" class="flex items-center gap-[7px] text-[10px]" :class="{ 'met text-[#4f7215]': item.met, 'text-[#17181470]': !item.met }"><span class="grid size-[19px] place-items-center rounded-full text-[7px] font-extrabold" :class="item.met ? 'bg-[var(--registry-accent,#d9ff57)] text-[var(--registry-accent-foreground,#263800)]' : 'bg-[#1718140a]'" aria-hidden="true">{{ item.met ? 'OK' : '-' }}</span>{{ item.label }}</li>
    </ul>
    <p v-if="resolvedError" :id="errorId" class="validation-error mt-2.5 text-[11px] text-[#c8342b]" role="alert" :data-criterion="schemaErrorKey || undefined">{{ resolvedError }}</p>
  </div>
</template>
