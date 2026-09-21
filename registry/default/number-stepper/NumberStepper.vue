<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

export type NumberStepperSource = 'increment' | 'decrement' | 'input' | 'keyboard' | 'hold'

const props = withDefaults(defineProps<{
  label?: string
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  disabled?: boolean
  allowInput?: boolean
  repeatDelay?: number
  repeatInterval?: number
}>(), {
  label: 'Value',
  min: 0,
  max: 100,
  step: 1,
  prefix: '',
  suffix: '',
  disabled: false,
  allowInput: true,
  repeatDelay: 420,
  repeatInterval: 90,
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  change: [value: number, previous: number, source: NumberStepperSource]
  limit: [edge: 'min' | 'max', value: number]
}>()

const inputId = `number-stepper-${useId()}`
const focused = ref(false)
const announcement = ref('')
let holdTimer: ReturnType<typeof setTimeout> | undefined
let repeatTimer: ReturnType<typeof setInterval> | undefined

const bounds = computed(() => {
  const first = Number.isFinite(props.min) ? props.min : 0
  const second = Number.isFinite(props.max) ? props.max : 100
  return { min: Math.min(first, second), max: Math.max(first, second) }
})
const safeStep = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1)

function decimalPlaces(value: number) {
  const text = String(value).toLocaleLowerCase()
  if (text.includes('e-')) return Number(text.split('e-')[1]) || 0
  return text.includes('.') ? text.split('.')[1]!.length : 0
}

function normalize(value: number) {
  const fallback = Number.isFinite(model.value) ? model.value : bounds.value.min
  const numeric = Number.isFinite(value) ? value : fallback
  const snapped = bounds.value.min + Math.round((numeric - bounds.value.min) / safeStep.value) * safeStep.value
  const clamped = Math.min(bounds.value.max, Math.max(bounds.value.min, snapped))
  const precision = Math.min(10, Math.max(decimalPlaces(bounds.value.min), decimalPlaces(safeStep.value)))
  return Number(clamped.toFixed(precision))
}

const current = computed(() => normalize(model.value))
const draft = ref(String(current.value))
const canDecrease = computed(() => !props.disabled && current.value > bounds.value.min)
const canIncrease = computed(() => !props.disabled && current.value < bounds.value.max)

function setValue(value: number, source: NumberStepperSource) {
  const previous = current.value
  const next = normalize(value)
  draft.value = String(next)

  if (next === previous) {
    if (value < bounds.value.min || (source === 'decrement' || source === 'hold') && previous === bounds.value.min) emit('limit', 'min', previous)
    else if (value > bounds.value.max || (source === 'increment' || source === 'hold') && previous === bounds.value.max) emit('limit', 'max', previous)
    if (source === 'hold') clearHold()
    return
  }

  model.value = next
  announcement.value = `${props.label}: ${next}${props.suffix ? ` ${props.suffix}` : ''}`
  emit('change', next, previous, source)
}

function stepBy(direction: 1 | -1, source: NumberStepperSource) {
  setValue(current.value + safeStep.value * direction, source)
}

function clearHold() {
  if (holdTimer) clearTimeout(holdTimer)
  if (repeatTimer) clearInterval(repeatTimer)
  holdTimer = undefined
  repeatTimer = undefined
}

function startHold(event: PointerEvent, direction: 1 | -1) {
  if (props.disabled || event.button !== 0) return
  clearHold()
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  stepBy(direction, direction === 1 ? 'increment' : 'decrement')
  holdTimer = setTimeout(() => {
    repeatTimer = setInterval(() => stepBy(direction, 'hold'), Math.max(40, props.repeatInterval))
  }, Math.max(200, props.repeatDelay))
}

function stopHold(event?: PointerEvent) {
  clearHold()
  if (!event) return
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
}

function onButtonKeydown(event: KeyboardEvent, direction: 1 | -1) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  stepBy(direction, 'keyboard')
}

function commitInput() {
  if (!props.allowInput) {
    draft.value = String(current.value)
    return
  }
  const value = Number(draft.value)
  if (!draft.value.trim() || !Number.isFinite(value)) draft.value = String(current.value)
  else setValue(value, 'input')
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') { event.preventDefault(); stepBy(1, 'keyboard') }
  else if (event.key === 'ArrowDown') { event.preventDefault(); stepBy(-1, 'keyboard') }
  else if (event.key === 'Home') { event.preventDefault(); setValue(bounds.value.min, 'keyboard') }
  else if (event.key === 'End') { event.preventDefault(); setValue(bounds.value.max, 'keyboard') }
  else if (event.key === 'Enter') { event.preventDefault(); commitInput(); (event.currentTarget as HTMLInputElement).select() }
  else if (event.key === 'Escape') { event.preventDefault(); draft.value = String(current.value); (event.currentTarget as HTMLInputElement).select() }
}

watch([model, bounds, safeStep], () => {
  if (!focused.value) draft.value = String(current.value)
})
watch(() => props.disabled, disabled => { if (disabled) clearHold() })
onBeforeUnmount(clearHold)

defineExpose({
  increment: () => stepBy(1, 'increment'),
  decrement: () => stepBy(-1, 'decrement'),
  setValue: (value: number) => setValue(value, 'input'),
})
</script>

<template>
  <div class="number-stepper w-full max-w-[360px] text-[#171814]" :class="{ 'opacity-50': disabled }">
    <label :id="`${inputId}-label`" :for="inputId" class="mb-2 block text-[11px] font-[650] text-[#17181480]">{{ label }}</label>
    <div class="flex items-center rounded-[18px] border border-[#1718141f] bg-[#ffffffd9] p-1.5 shadow-[0_14px_34px_-28px_#0009] focus-within:border-[#171814] focus-within:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)]">
      <button
        type="button"
        class="grid size-11 shrink-0 touch-none cursor-pointer place-items-center rounded-[13px] border-0 bg-[#17181408] text-[#171814] outline-none transition-[background-color,color,transform] duration-150 hover:not-disabled:bg-[#171814] hover:not-disabled:text-white active:not-disabled:scale-95 focus-visible:bg-[#171814] focus-visible:text-white disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
        :disabled="!canDecrease"
        :aria-label="`Decrease ${label}`"
        @pointerdown="startHold($event, -1)"
        @pointerup="stopHold"
        @pointercancel="stopHold"
        @pointerleave="stopHold"
        @keydown="onButtonKeydown($event, -1)"
      >
        <svg class="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" /></svg>
      </button>

      <div class="flex min-w-0 flex-1 items-baseline justify-center gap-1 px-2">
        <span v-if="prefix" class="text-[11px] font-semibold text-[#17181470]">{{ prefix }}</span>
        <input
          :id="inputId"
          :value="draft"
          type="text"
          inputmode="decimal"
          role="spinbutton"
          class="h-11 min-w-0 w-[88px] border-0 bg-transparent p-0 text-center [font:inherit] text-xl font-semibold tracking-[-.04em] text-[#171814] outline-none read-only:cursor-default disabled:cursor-not-allowed"
          :disabled="disabled"
          :readonly="!allowInput"
          :aria-labelledby="`${inputId}-label`"
          :aria-valuemin="bounds.min"
          :aria-valuemax="bounds.max"
          :aria-valuenow="current"
          @input="draft = ($event.target as HTMLInputElement).value"
          @focus="focused = true; ($event.currentTarget as HTMLInputElement).select()"
          @blur="focused = false; commitInput()"
          @keydown="onInputKeydown"
        >
        <span v-if="suffix" class="text-[10px] font-semibold text-[#17181470]">{{ suffix }}</span>
      </div>

      <button
        type="button"
        class="grid size-11 shrink-0 touch-none cursor-pointer place-items-center rounded-[13px] border-0 bg-[#171814] text-[var(--registry-accent,#d9ff57)] outline-none transition-[background-color,color,transform] duration-150 hover:not-disabled:bg-[#2b2c26] active:not-disabled:scale-95 focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
        :disabled="!canIncrease"
        :aria-label="`Increase ${label}`"
        @pointerdown="startHold($event, 1)"
        @pointerup="stopHold"
        @pointercancel="stopHold"
        @pointerleave="stopHold"
        @keydown="onButtonKeydown($event, 1)"
      >
        <svg class="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12" /></svg>
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>
