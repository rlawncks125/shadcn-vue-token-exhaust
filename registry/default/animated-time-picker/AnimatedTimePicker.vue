<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export type AnimatedTimePickerFormat = 12 | 24
export type AnimatedTimePickerChangeSource = 'hour' | 'minute' | 'period' | 'increment' | 'decrement' | 'reset'

export interface AnimatedTimePickerProps {
  modelValue: string
  min?: string
  max?: string
  stepMinutes?: number
  format?: AnimatedTimePickerFormat
  duration?: number
  disabled?: boolean
  label?: string
  name?: string
}

export interface AnimatedTimePickerEvents {
  'update:modelValue': [value: string]
  change: [value: string, previous: string, source: AnimatedTimePickerChangeSource]
  invalid: [value: string, reason: string]
}

export interface AnimatedTimePickerExpose {
  increment: () => boolean
  decrement: () => boolean
  reset: () => boolean
  focus: () => Promise<boolean>
}

const props = withDefaults(defineProps<AnimatedTimePickerProps>(), {
  min: undefined,
  max: undefined,
  stepMinutes: 1,
  format: 24,
  duration: 240,
  disabled: false,
  label: 'Time',
  name: undefined,
})

const emit = defineEmits<AnimatedTimePickerEvents>()

const hourControl = ref<HTMLElement | null>(null)
const currentTotal = ref(0)
const direction = ref<1 | -1>(1)
const announcement = ref('')
const instanceId = `animated-time-picker-${useId()}`

let typedPart: 'hour' | 'minute' | null = null
let typedBuffer = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined

function parseTime(value: unknown) {
  if (typeof value !== 'string') return null
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? hour * 60 + minute : null
}

function formatTime(total: number) {
  const safe = Math.min(1439, Math.max(0, Math.round(total)))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 240)
const safeStep = computed(() => Number.isFinite(props.stepMinutes) ? Math.max(1, Math.min(1440, Math.round(props.stepMinutes))) : 1)
const safeFormat = computed<AnimatedTimePickerFormat>(() => props.format === 12 ? 12 : 24)
const bounds = computed(() => {
  const parsedMin = parseTime(props.min)
  const parsedMax = parseTime(props.max)
  const first = parsedMin ?? 0
  const second = parsedMax ?? 1439
  return first <= second ? { min: first, max: second } : { min: second, max: first }
})
const selectableMax = computed(() => bounds.value.min + Math.floor((bounds.value.max - bounds.value.min) / safeStep.value) * safeStep.value)

function normalizeTotal(value: number) {
  const finite = Number.isFinite(value) ? Math.round(value) : bounds.value.min
  const clamped = Math.min(selectableMax.value, Math.max(bounds.value.min, finite))
  const steps = Math.round((clamped - bounds.value.min) / safeStep.value)
  return Math.min(selectableMax.value, bounds.value.min + steps * safeStep.value)
}

currentTotal.value = normalizeTotal(parseTime(props.modelValue) ?? bounds.value.min)
const initialTotal = currentTotal.value

const hour24 = computed(() => Math.floor(currentTotal.value / 60))
const minute = computed(() => currentTotal.value % 60)
const period = computed<'AM' | 'PM'>(() => hour24.value < 12 ? 'AM' : 'PM')
const displayHour = computed(() => safeFormat.value === 12 ? hour24.value % 12 || 12 : hour24.value)
const hourText = computed(() => String(displayHour.value).padStart(2, '0'))
const minuteText = computed(() => String(minute.value).padStart(2, '0'))
const normalizedValue = computed(() => formatTime(currentTotal.value))
const readableValue = computed(() => safeFormat.value === 12
  ? `${displayHour.value}:${minuteText.value} ${period.value}`
  : `${hourText.value}:${minuteText.value}`)
const canDecrease = computed(() => !props.disabled && currentTotal.value > bounds.value.min)
const canIncrease = computed(() => !props.disabled && currentTotal.value < selectableMax.value)

function setTime(value: number, source: AnimatedTimePickerChangeSource) {
  if (props.disabled) return false
  const previousTotal = currentTotal.value
  const next = normalizeTotal(value)
  if (next === previousTotal) return false

  direction.value = next > previousTotal ? 1 : -1
  currentTotal.value = next
  const formatted = formatTime(next)
  const previous = formatTime(previousTotal)
  announcement.value = `${props.label}: ${readableValue.value}`
  emit('update:modelValue', formatted)
  emit('change', formatted, previous, source)
  return true
}

function increment() {
  return setTime(currentTotal.value + safeStep.value, 'increment')
}

function decrement() {
  return setTime(currentTotal.value - safeStep.value, 'decrement')
}

function reset() {
  return setTime(initialTotal, 'reset')
}

async function focus() {
  if (props.disabled) return false
  await nextTick()
  hourControl.value?.focus()
  return document.activeElement === hourControl.value
}

function changePart(part: 'hour' | 'minute', amount: number) {
  const unit = part === 'hour' ? 60 : safeStep.value
  return setTime(currentTotal.value + amount * unit, part)
}

function setPeriod(nextPeriod: 'AM' | 'PM') {
  if (nextPeriod === period.value) return false
  return setTime(currentTotal.value + (nextPeriod === 'PM' ? 720 : -720), 'period')
}

function setTypedPart(part: 'hour' | 'minute', value: number, raw: string) {
  if (part === 'minute') {
    if (value > 59) {
      emit('invalid', raw, 'Minutes must be between 00 and 59.')
      return false
    }
    return setTime(hour24.value * 60 + value, 'minute')
  }

  const maximum = safeFormat.value === 12 ? 12 : 23
  const minimum = safeFormat.value === 12 ? 1 : 0
  if (value < minimum || value > maximum) {
    emit('invalid', raw, safeFormat.value === 12 ? 'Hours must be between 1 and 12.' : 'Hours must be between 00 and 23.')
    return false
  }
  const nextHour = safeFormat.value === 12
    ? (value % 12) + (period.value === 'PM' ? 12 : 0)
    : value
  return setTime(nextHour * 60 + minute.value, 'hour')
}

function typeDigit(part: 'hour' | 'minute', digit: string) {
  if (typedPart !== part) typedBuffer = ''
  typedPart = part
  typedBuffer = `${typedBuffer}${digit}`.slice(-2)
  if (typedTimer) clearTimeout(typedTimer)
  typedTimer = setTimeout(() => {
    typedBuffer = ''
    typedPart = null
  }, 800)

  const value = Number(typedBuffer)
  const waitingForSecondDigit = part === 'hour' && safeFormat.value === 12 && typedBuffer === '0'
  if (!waitingForSecondDigit) setTypedPart(part, value, typedBuffer)
}

function onPartKeydown(event: KeyboardEvent, part: 'hour' | 'minute') {
  if (props.disabled) return
  let handled = true
  if (event.key === 'ArrowUp') changePart(part, 1)
  else if (event.key === 'ArrowDown') changePart(part, -1)
  else if (event.key === 'PageUp') changePart(part, part === 'hour' ? 4 : 5)
  else if (event.key === 'PageDown') changePart(part, part === 'hour' ? -4 : -5)
  else if (event.key === 'Home') setTime(bounds.value.min, part)
  else if (event.key === 'End') setTime(selectableMax.value, part)
  else if (/^\d$/.test(event.key)) typeDigit(part, event.key)
  else handled = false
  if (handled) event.preventDefault()
}

function normalizeExternal() {
  const parsed = parseTime(props.modelValue)
  if (parsed === null) {
    emit('invalid', String(props.modelValue), 'Use a valid 24-hour time in HH:mm format.')
    return
  }

  const next = normalizeTotal(parsed)
  direction.value = next >= currentTotal.value ? 1 : -1
  currentTotal.value = next
  const canonical = formatTime(next)
  if (canonical !== props.modelValue) emit('update:modelValue', canonical)
}

watch([() => props.modelValue, bounds, safeStep], normalizeExternal, { immediate: true })

onBeforeUnmount(() => {
  if (typedTimer) clearTimeout(typedTimer)
})

defineExpose<AnimatedTimePickerExpose>({ increment, decrement, reset, focus })
</script>

<template>
  <fieldset
    data-testid="animated-time-picker"
    class="animated-time-picker m-0 min-w-0 w-full max-w-[430px] rounded-[28px] border border-[#24322a]/10 bg-[#f7f3e8] p-4 text-[#18211c] shadow-[0_30px_80px_-48px_rgba(27,42,33,0.65)] sm:p-5"
    :class="{ 'opacity-50': disabled }"
    :disabled="disabled"
    :style="{ '--time-picker-duration': `${safeDuration}ms` }"
  >
    <legend class="sr-only">{{ label }}</legend>
    <input v-if="name" type="hidden" :name="name" :value="normalizedValue" :disabled="disabled">

    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <p :id="`${instanceId}-label`" class="text-[9px] font-bold uppercase tracking-[0.22em] text-[#b64c32]">{{ label }}</p>
        <p class="mt-1.5 text-sm font-semibold tracking-[-0.025em]">Set a precise arrival</p>
      </div>
      <output data-testid="time-picker-value" class="rounded-full border border-[#24322a]/10 bg-white/65 px-3 py-1.5 text-[10px] font-bold tabular-nums text-[#456253]">
        {{ normalizedValue }}
      </output>
    </div>

    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[23px] border border-[#24322a]/10 bg-[#20372b] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:gap-3 sm:p-4" :class="format === 12 ? 'sm:grid-cols-[1fr_auto_1fr_auto]' : ''">
      <div class="grid min-w-0 gap-2">
        <button type="button" data-testid="time-picker-hour-up" class="step-button" :disabled="!canIncrease" :aria-label="`Increase ${label} hour`" @click="changePart('hour', 1)">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 12.5 5-5 5 5" /></svg>
        </button>
        <div
          :id="`${instanceId}-hour`"
          ref="hourControl"
          data-testid="time-picker-hour"
          role="spinbutton"
          class="time-spinbutton"
          :tabindex="disabled ? -1 : 0"
          :aria-disabled="disabled || undefined"
          :aria-label="`${label} hour`"
          :aria-valuemin="format === 12 ? 1 : 0"
          :aria-valuemax="format === 12 ? 12 : 23"
          :aria-valuenow="displayHour"
          :aria-valuetext="readableValue"
          :aria-describedby="`${instanceId}-help`"
          @keydown="onPartKeydown($event, 'hour')"
        >
          <span class="reel-window" aria-hidden="true">
            <Transition :name="direction > 0 ? 'reel-up' : 'reel-down'">
              <span :key="hourText" class="reel-value">{{ hourText }}</span>
            </Transition>
          </span>
          <span class="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">Hour</span>
        </div>
        <button type="button" data-testid="time-picker-hour-down" class="step-button" :disabled="!canDecrease" :aria-label="`Decrease ${label} hour`" @click="changePart('hour', -1)">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
        </button>
      </div>

      <span class="pb-0.5 text-3xl font-semibold text-[#d9ff83]" aria-hidden="true">:</span>

      <div class="grid min-w-0 gap-2">
        <button type="button" data-testid="time-picker-minute-up" class="step-button" :disabled="!canIncrease" :aria-label="`Increase ${label} minutes`" @click="changePart('minute', 1)">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 12.5 5-5 5 5" /></svg>
        </button>
        <div
          :id="`${instanceId}-minute`"
          data-testid="time-picker-minute"
          role="spinbutton"
          class="time-spinbutton"
          :tabindex="disabled ? -1 : 0"
          :aria-disabled="disabled || undefined"
          :aria-label="`${label} minutes`"
          aria-valuemin="0"
          aria-valuemax="59"
          :aria-valuenow="minute"
          :aria-valuetext="readableValue"
          :aria-describedby="`${instanceId}-help`"
          @keydown="onPartKeydown($event, 'minute')"
        >
          <span class="reel-window" aria-hidden="true">
            <Transition :name="direction > 0 ? 'reel-up' : 'reel-down'">
              <span :key="minuteText" class="reel-value">{{ minuteText }}</span>
            </Transition>
          </span>
          <span class="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">Minute</span>
        </div>
        <button type="button" data-testid="time-picker-minute-down" class="step-button" :disabled="!canDecrease" :aria-label="`Decrease ${label} minutes`" @click="changePart('minute', -1)">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
        </button>
      </div>

      <div v-if="format === 12" class="col-span-3 grid grid-cols-2 gap-1 rounded-xl bg-black/20 p-1 sm:col-span-1 sm:grid-cols-1" role="group" :aria-label="`${label} period`">
        <button v-for="option in (['AM', 'PM'] as const)" :key="option" type="button" :data-testid="`time-picker-${option.toLowerCase()}`" class="rounded-lg px-3 py-2 text-[9px] font-bold tracking-[0.12em] text-white/45 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d9ff83] disabled:cursor-not-allowed motion-reduce:transition-none" :class="period === option ? 'bg-[#d9ff83] text-[#20372b] shadow-sm' : 'hover:bg-white/10 hover:text-white'" :disabled="disabled" :aria-pressed="period === option" @click="setPeriod(option)">{{ option }}</button>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <p :id="`${instanceId}-help`" class="max-w-[255px] text-[9px] leading-4 text-[#24322a]/45">Use arrows to step, page keys to jump, Home or End for limits, or type digits.</p>
      <button type="button" data-testid="time-picker-reset" class="shrink-0 rounded-full bg-[#eadfca] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6f4938] outline-none transition hover:not-disabled:bg-[#dfcfb3] focus-visible:ring-2 focus-visible:ring-[#b64c32] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled" @click="reset">Reset</button>
    </div>

    <p data-testid="time-picker-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </fieldset>
</template>

<style scoped>
.step-button {
  display: grid;
  width: 100%;
  height: 28px;
  cursor: pointer;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.06);
  color: rgb(255 255 255 / 0.55);
  outline: none;
  transition: color var(--time-picker-duration), background-color var(--time-picker-duration), transform var(--time-picker-duration);
}

.step-button svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.step-button:hover:not(:disabled),
.step-button:focus-visible {
  background: rgb(255 255 255 / 0.12);
  color: #d9ff83;
}

.step-button:active:not(:disabled) { transform: scale(0.96); }
.step-button:focus-visible { box-shadow: 0 0 0 2px #d9ff83; }
.step-button:disabled { cursor: not-allowed; opacity: 0.22; }

.time-spinbutton {
  display: flex;
  min-width: 0;
  cursor: ns-resize;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 16px;
  background: rgb(255 255 255 / 0.07);
  padding: 14px 5px 11px;
  outline: none;
  transition: border-color var(--time-picker-duration), background-color var(--time-picker-duration), box-shadow var(--time-picker-duration);
}

.time-spinbutton:hover { background: rgb(255 255 255 / 0.1); }
.time-spinbutton:focus-visible {
  border-color: #d9ff83;
  box-shadow: 0 0 0 3px rgb(217 255 131 / 0.2);
}

.reel-window {
  position: relative;
  display: block;
  width: 100%;
  height: 38px;
  overflow: hidden;
}

.reel-value {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fffdf6;
  font-size: 32px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.07em;
  line-height: 1;
  transition-duration: var(--time-picker-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.reel-up-enter-from,
.reel-down-leave-to { opacity: 0; transform: translateY(70%); }
.reel-up-leave-to,
.reel-down-enter-from { opacity: 0; transform: translateY(-70%); }

@media (prefers-reduced-motion: reduce) {
  .step-button,
  .time-spinbutton,
  .reel-value { transition: none !important; }
}
</style>
