<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  mode?: 'numeric' | 'decimal' | 'pin'
  label?: string
  placeholder?: string
  maxLength?: number
  decimalSeparator?: '.' | ','
  masked?: boolean
  showSubmit?: boolean
  submitLabel?: string
  autoSubmit?: boolean
  clearOnSubmit?: boolean
  haptic?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  modelValue: '',
  mode: 'numeric',
  label: 'Numeric keypad',
  placeholder: '0',
  maxLength: 8,
  decimalSeparator: '.',
  masked: false,
  showSubmit: true,
  submitLabel: 'Done',
  autoSubmit: false,
  clearOnSubmit: false,
  haptic: false,
  duration: 140,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string, key: string]
  delete: [value: string]
  clear: []
  submit: [value: string]
  complete: [value: string]
}>()

const root = ref<HTMLElement>()
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1000, Math.max(0, props.duration)) : 140)
const safeMaxLength = computed(() => Number.isFinite(props.maxLength) ? Math.min(24, Math.max(1, Math.floor(props.maxLength))) : 8)
const isMasked = computed(() => props.masked || props.mode === 'pin')
const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  if (isMasked.value) return '•'.repeat(Array.from(props.modelValue).length)
  return props.modelValue
})
const accessibleValue = computed(() => isMasked.value ? `${props.modelValue.length} of ${safeMaxLength.value} digits entered` : props.modelValue || props.placeholder)
const utilityKey = computed(() => props.mode === 'decimal' ? props.decimalSeparator : 'clear')

function vibrate() {
  if (props.haptic && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8)
}

function submitValue(value = props.modelValue) {
  if (props.disabled || !value) return false
  vibrate()
  emit('submit', value)
  if (props.clearOnSubmit) emit('update:modelValue', '')
  return true
}

function press(key: string) {
  if (props.disabled) return false
  if (key === 'backspace') return backspace()
  if (key === 'clear') return clear()
  if (key === props.decimalSeparator) {
    if (props.mode !== 'decimal' || props.modelValue.includes(props.decimalSeparator) || props.modelValue.length >= safeMaxLength.value) return false
    const value = props.modelValue ? `${props.modelValue}${props.decimalSeparator}` : `0${props.decimalSeparator}`
    vibrate(); emit('update:modelValue', value); emit('input', value, key)
    return true
  }
  if (!/^\d$/.test(key) || props.modelValue.length >= safeMaxLength.value) return false
  const value = `${props.modelValue}${key}`
  vibrate()
  emit('update:modelValue', value)
  emit('input', value, key)
  if (value.length === safeMaxLength.value) {
    emit('complete', value)
    if (props.autoSubmit) submitValue(value)
  }
  return true
}

function backspace() {
  if (props.disabled || !props.modelValue) return false
  const value = props.modelValue.slice(0, -1)
  vibrate(); emit('update:modelValue', value); emit('delete', value)
  return true
}

function clear() {
  if (props.disabled || !props.modelValue) return false
  vibrate(); emit('update:modelValue', ''); emit('clear')
  return true
}

function onKeydown(event: KeyboardEvent) {
  if (event.target !== event.currentTarget || props.disabled) return
  if (/^\d$/.test(event.key)) { event.preventDefault(); press(event.key) }
  else if ((event.key === '.' || event.key === ',') && props.mode === 'decimal') { event.preventDefault(); press(props.decimalSeparator) }
  else if (event.key === 'Backspace') { event.preventDefault(); backspace() }
  else if (event.key === 'Delete' || event.key === 'Escape') { event.preventDefault(); clear() }
  else if (event.key === 'Enter') { event.preventDefault(); submitValue() }
}

defineExpose({ press, backspace, clear, submit: submitValue, focus: () => root.value?.focus() })
</script>

<template>
  <section ref="root" data-testid="animated-mobile-numeric-keypad" :aria-label="label" :aria-disabled="disabled || undefined" tabindex="0" class="w-full max-w-sm rounded-[28px] bg-[#f7f3e8] p-4 text-[#1b1d19] outline-none focus-visible:ring-2 focus-visible:ring-[#1b1d19] focus-visible:ring-offset-2" :style="{ '--keypad-duration': `${safeDuration}ms` }" @keydown="onKeydown">
    <div class="mb-4 min-h-24 rounded-[22px] border border-black/[0.07] bg-white/65 px-5 py-4 text-right">
      <p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">{{ label }}</p>
      <p data-testid="keypad-display" class="mt-3 min-h-9 overflow-hidden text-4xl font-semibold tracking-[-.04em]" :class="!modelValue ? 'text-black/24' : ''" aria-hidden="true">{{ displayValue }}</p>
      <p class="sr-only" role="status" aria-live="polite">{{ accessibleValue }}</p>
    </div>

    <div class="grid grid-cols-3 gap-2" role="group" :aria-label="`${label} keys`">
      <button v-for="digit in ['1','2','3','4','5','6','7','8','9']" :key="digit" type="button" :data-testid="`keypad-key-${digit}`" class="keypad-key min-h-14 rounded-[18px] bg-white/72 text-lg font-semibold outline-none transition-[transform,background-color] hover:not-disabled:bg-white active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || modelValue.length >= safeMaxLength" :aria-label="digit" @click="press(digit)">{{ digit }}</button>
      <button type="button" data-testid="keypad-utility" class="keypad-key min-h-14 rounded-[18px] border border-black/[0.06] text-xs font-semibold outline-none transition-[transform,background-color] hover:not-disabled:bg-white active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || (utilityKey === 'clear' ? !modelValue : modelValue.includes(decimalSeparator) || modelValue.length >= safeMaxLength)" :aria-label="utilityKey === 'clear' ? 'Clear value' : 'Decimal separator'" @click="press(utilityKey)">{{ utilityKey === 'clear' ? 'Clear' : utilityKey }}</button>
      <button type="button" data-testid="keypad-key-0" class="keypad-key min-h-14 rounded-[18px] bg-white/72 text-lg font-semibold outline-none transition-[transform,background-color] hover:not-disabled:bg-white active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || modelValue.length >= safeMaxLength" aria-label="0" @click="press('0')">0</button>
      <button type="button" data-testid="keypad-backspace" class="keypad-key min-h-14 rounded-[18px] border border-black/[0.06] text-lg outline-none transition-[transform,background-color] hover:not-disabled:bg-white active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || !modelValue" aria-label="Delete last digit" @click="backspace">&#9003;</button>
    </div>
    <button v-if="showSubmit" type="button" data-testid="keypad-submit" class="keypad-key mt-2 min-h-13 w-full rounded-[18px] bg-[#1b1d19] px-5 text-xs font-semibold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#1b1d19] focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || !modelValue" @click="submitValue()">{{ submitLabel }}</button>
  </section>
</template>

<style scoped>
.keypad-key { transition-duration: var(--keypad-duration); }
</style>
