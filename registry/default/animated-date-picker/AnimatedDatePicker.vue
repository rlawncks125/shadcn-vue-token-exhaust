<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

export type AnimatedDatePickerDisabledDates = string[] | ((date: string) => boolean)
export type AnimatedDatePickerChangeSource = 'pointer' | 'keyboard' | 'today'

export interface AnimatedDatePickerProps {
  modelValue: string
  visibleMonth?: string
  min?: string
  max?: string
  disabledDates?: AnimatedDatePickerDisabledDates
  locale?: string
  firstDayOfWeek?: number
  duration?: number
  disabled?: boolean
  label?: string
}

export interface AnimatedDatePickerEvents {
  'update:modelValue': [value: string]
  'update:visibleMonth': [value: string]
  change: [value: string, previous: string, source: AnimatedDatePickerChangeSource]
  monthChange: [value: string, direction: -1 | 1]
}

export interface AnimatedDatePickerExpose {
  previousMonth: () => Promise<boolean>
  nextMonth: () => Promise<boolean>
  today: () => Promise<boolean>
  focusSelected: () => Promise<boolean>
}

interface CalendarDay {
  date: string
  day: number
  currentMonth: boolean
  disabled: boolean
  today: boolean
}

const props = withDefaults(defineProps<AnimatedDatePickerProps>(), {
  visibleMonth: undefined,
  min: undefined,
  max: undefined,
  disabledDates: () => [],
  locale: 'en-US',
  firstDayOfWeek: 0,
  duration: 280,
  disabled: false,
  label: 'Choose a date',
})

const emit = defineEmits<AnimatedDatePickerEvents>()

const root = ref<HTMLElement | null>(null)
const direction = ref<1 | -1>(1)
const announcement = ref('')
const rovingDate = ref('')
const instanceId = `animated-date-picker-${useId()}`

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

function parseMonth(value: unknown): Date | null {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value) ? parseDate(`${value}-01`) : null
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 86_400_000)
}

function addMonths(date: Date, amount: number, preferredDay = 1) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(preferredDay, lastDay))
  return target
}

function localToday() {
  const date = new Date()
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(props.locale || 'en-US', { ...options, timeZone: 'UTC' }).format(date)
  }
  catch {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date)
  }
}

const todayKey = computed(localToday)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 280)
const weekStart = computed(() => Number.isFinite(props.firstDayOfWeek)
  ? ((Math.floor(props.firstDayOfWeek) % 7) + 7) % 7
  : 0)
const bounds = computed(() => {
  const first = parseDate(props.min) ? props.min : undefined
  const second = parseDate(props.max) ? props.max : undefined
  if (first && second && first > second) return { min: second, max: first }
  return { min: first, max: second }
})
const blockedDates = computed(() => new Set(Array.isArray(props.disabledDates)
  ? props.disabledDates.filter(date => parseDate(date))
  : []))

function isUnavailable(date: string) {
  if (!parseDate(date)) return true
  if (bounds.value.min && date < bounds.value.min) return true
  if (bounds.value.max && date > bounds.value.max) return true
  if (blockedDates.value.has(date)) return true
  if (typeof props.disabledDates === 'function') {
    try {
      return Boolean(props.disabledDates(date))
    }
    catch {
      return true
    }
  }
  return false
}

function initialMonth() {
  const explicit = parseMonth(props.visibleMonth)
  if (explicit) return monthKey(explicit)
  const selected = parseDate(props.modelValue)
  if (selected) return monthKey(selected)
  const today = parseDate(todayKey.value)
  if (today && (!bounds.value.min || todayKey.value >= bounds.value.min) && (!bounds.value.max || todayKey.value <= bounds.value.max)) return monthKey(today)
  return (bounds.value.min ?? bounds.value.max ?? todayKey.value).slice(0, 7)
}

const month = ref(initialMonth())
const monthDate = computed(() => parseMonth(month.value) ?? parseMonth(initialMonth())!)
const monthLabel = computed(() => formatDate(monthDate.value, { month: 'long', year: 'numeric' }))
const weekdays = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = addDays(new Date('2024-01-07T00:00:00.000Z'), (weekStart.value + index) % 7)
  return {
    short: formatDate(date, { weekday: 'short' }),
    long: formatDate(date, { weekday: 'long' }),
  }
}))

const calendarDays = computed<CalendarDay[]>(() => {
  const first = monthDate.value
  const offset = (first.getUTCDay() - weekStart.value + 7) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index)
    const key = dateKey(date)
    return {
      date: key,
      day: date.getUTCDate(),
      currentMonth: monthKey(date) === month.value,
      disabled: isUnavailable(key),
      today: key === todayKey.value,
    }
  })
})

const calendarWeeks = computed(() => Array.from({ length: 6 }, (_, index) => calendarDays.value.slice(index * 7, index * 7 + 7)))

function dateLabel(value: string) {
  const date = parseDate(value)
  return date ? formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : value
}

function monthCanBeShown(offset: number) {
  const target = addMonths(monthDate.value, offset)
  const first = dateKey(target)
  const last = dateKey(new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)))
  return (!bounds.value.min || last >= bounds.value.min) && (!bounds.value.max || first <= bounds.value.max)
}

const canPrevious = computed(() => !props.disabled && monthCanBeShown(-1))
const canNext = computed(() => !props.disabled && monthCanBeShown(1))

function firstFocusable() {
  const selected = parseDate(props.modelValue) && calendarDays.value.find(day => day.date === props.modelValue && !day.disabled)
  return selected?.date
    ?? calendarDays.value.find(day => day.currentMonth && !day.disabled)?.date
    ?? calendarDays.value.find(day => !day.disabled)?.date
    ?? ''
}

async function applyMonth(target: Date, movement: -1 | 1, focusDate?: string) {
  const targetMonth = monthKey(target)
  if (targetMonth === month.value) {
    if (focusDate) return focusDateElement(focusDate)
    return true
  }
  direction.value = movement
  month.value = targetMonth
  announcement.value = formatDate(target, { month: 'long', year: 'numeric' })
  emit('update:visibleMonth', targetMonth)
  emit('monthChange', targetMonth, movement)
  await nextTick()
  if (focusDate) return focusDateElement(focusDate)
  rovingDate.value = firstFocusable()
  return true
}

async function changeMonth(offset: -1 | 1) {
  if (props.disabled || !monthCanBeShown(offset)) return false
  return applyMonth(addMonths(monthDate.value, offset), offset)
}

function previousMonth() {
  return changeMonth(-1)
}

function nextMonth() {
  return changeMonth(1)
}

async function focusDateElement(value: string) {
  if (props.disabled || isUnavailable(value)) return false
  rovingDate.value = value
  await nextTick()
  const button = root.value?.querySelector<HTMLButtonElement>(`[data-date="${value}"][data-current-month="true"]`)
    ?? root.value?.querySelector<HTMLButtonElement>(`[data-date="${value}"]`)
  if (!button) return false
  button.focus()
  return true
}

async function focusDate(value: string) {
  const date = parseDate(value)
  if (!date || isUnavailable(value) || props.disabled) return false
  const targetMonth = monthKey(date)
  if (targetMonth !== month.value) {
    const movement: -1 | 1 = targetMonth < month.value ? -1 : 1
    return applyMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)), movement, value)
  }
  return focusDateElement(value)
}

function findAvailable(start: Date, movement: -1 | 1) {
  let candidate = start
  for (let index = 0; index < 3660; index += 1) {
    const key = dateKey(candidate)
    if (!isUnavailable(key)) return key
    if (movement < 0 && bounds.value.min && key <= bounds.value.min) break
    if (movement > 0 && bounds.value.max && key >= bounds.value.max) break
    candidate = addDays(candidate, movement)
  }
  return null
}

async function moveFocus(value: string, dayOffset: number, monthOffset = 0) {
  const current = parseDate(value)
  if (!current) return false
  const preferredDay = current.getUTCDate()
  const target = monthOffset ? addMonths(current, monthOffset, preferredDay) : addDays(current, dayOffset)
  const movement: -1 | 1 = monthOffset < 0 || dayOffset < 0 ? -1 : 1
  const available = findAvailable(target, movement)
  return available ? focusDate(available) : false
}

function selectDate(value: string, source: AnimatedDatePickerChangeSource) {
  if (props.disabled || isUnavailable(value)) return false
  const previous = props.modelValue
  rovingDate.value = value
  if (value !== previous) {
    emit('update:modelValue', value)
    emit('change', value, previous, source)
  }
  const date = parseDate(value)!
  if (monthKey(date) !== month.value) void applyMonth(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)), value < month.value ? -1 : 1, value)
  return true
}

function handleKeydown(event: KeyboardEvent, value: string) {
  const current = parseDate(value)
  if (!current) return
  let action: Promise<boolean> | undefined
  if (event.key === 'ArrowLeft') action = moveFocus(value, -1)
  else if (event.key === 'ArrowRight') action = moveFocus(value, 1)
  else if (event.key === 'ArrowUp') action = moveFocus(value, -7)
  else if (event.key === 'ArrowDown') action = moveFocus(value, 7)
  else if (event.key === 'Home') action = moveFocus(value, -((current.getUTCDay() - weekStart.value + 7) % 7))
  else if (event.key === 'End') action = moveFocus(value, 6 - ((current.getUTCDay() - weekStart.value + 7) % 7))
  else if (event.key === 'PageUp') action = moveFocus(value, 0, -1)
  else if (event.key === 'PageDown') action = moveFocus(value, 0, 1)
  else return
  event.preventDefault()
  void action
}

async function today() {
  if (props.disabled || isUnavailable(todayKey.value)) return false
  selectDate(todayKey.value, 'today')
  return focusDate(todayKey.value)
}

function focusSelected() {
  const selected = parseDate(props.modelValue) && !isUnavailable(props.modelValue) ? props.modelValue : firstFocusable()
  return selected ? focusDate(selected) : Promise.resolve(false)
}

watch(() => props.visibleMonth, (value) => {
  const parsed = parseMonth(value)
  if (parsed && monthKey(parsed) !== month.value) {
    direction.value = monthKey(parsed) < month.value ? -1 : 1
    month.value = monthKey(parsed)
    announcement.value = formatDate(parsed, { month: 'long', year: 'numeric' })
  }
})

watch(() => props.modelValue, (value) => {
  const selected = parseDate(value)
  if (!selected || isUnavailable(value)) return
  rovingDate.value = value
  if (monthKey(selected) !== month.value) {
    const movement: -1 | 1 = monthKey(selected) < month.value ? -1 : 1
    void applyMonth(new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1)), movement)
  }
})

watch(calendarDays, () => {
  if (!calendarDays.value.some(day => day.date === rovingDate.value && !day.disabled)) rovingDate.value = firstFocusable()
}, { immediate: true })

defineExpose<AnimatedDatePickerExpose>({ previousMonth, nextMonth, today, focusSelected })
</script>

<template>
  <section
    ref="root"
    data-testid="animated-date-picker"
    class="animated-date-picker w-full min-w-[280px] max-w-[390px] rounded-[24px] border border-black/10 bg-[#fffdf8] p-4 text-[#23221f] shadow-[0_24px_70px_-46px_rgba(38,31,22,0.65)] sm:p-5"
    :class="{ 'opacity-50': disabled }"
    :style="{ '--date-picker-duration': `${safeDuration}ms` }"
    :aria-disabled="disabled || undefined"
  >
    <div class="mb-4 flex items-center justify-between gap-3">
      <button
        type="button"
        data-testid="date-picker-previous"
        class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-black/10 bg-white text-[#23221f] outline-none transition hover:not-disabled:-translate-x-0.5 hover:not-disabled:bg-[#f3ede2] focus-visible:ring-2 focus-visible:ring-[#d05d38] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
        :disabled="!canPrevious"
        :aria-label="`Previous month, ${monthLabel}`"
        @click="previousMonth"
      >
        <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5 5.5 5 5.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>

      <div class="min-w-0 text-center">
        <p :id="`${instanceId}-label`" class="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a5139]">{{ label }}</p>
        <h2 data-testid="date-picker-month" class="mt-1 text-lg font-semibold tracking-[-0.035em]">{{ monthLabel }}</h2>
      </div>

      <button
        type="button"
        data-testid="date-picker-next"
        class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-black/10 bg-white text-[#23221f] outline-none transition hover:not-disabled:translate-x-0.5 hover:not-disabled:bg-[#f3ede2] focus-visible:ring-2 focus-visible:ring-[#d05d38] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none"
        :disabled="!canNext"
        :aria-label="`Next month, ${monthLabel}`"
        @click="nextMonth"
      >
        <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5 5.5-5 5.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>

    <div role="grid" :aria-labelledby="`${instanceId}-label`" :aria-describedby="`${instanceId}-help`" :aria-readonly="disabled || undefined">
      <div role="row" class="mb-1 grid grid-cols-7">
        <span v-for="weekday in weekdays" :key="weekday.long" role="columnheader" :aria-label="weekday.long" class="py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-black/38">
          {{ weekday.short.slice(0, 2) }}
        </span>
      </div>

      <div class="relative overflow-hidden">
        <Transition :name="direction > 0 ? 'calendar-next' : 'calendar-previous'">
          <div :key="month" role="presentation" data-testid="date-picker-grid" class="grid gap-1">
            <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" role="row" class="grid grid-cols-7 gap-1">
              <button
                v-for="day in week"
                :key="day.date"
                type="button"
                role="gridcell"
                :data-date="day.date"
                :data-current-month="day.currentMonth"
                :data-testid="`date-picker-day-${day.date}`"
                :aria-label="dateLabel(day.date)"
                :aria-selected="modelValue === day.date"
                :aria-current="day.today ? 'date' : undefined"
                :disabled="disabled || day.disabled"
                :tabindex="!disabled && !day.disabled && rovingDate === day.date ? 0 : -1"
                class="date-picker-day relative grid aspect-square min-h-9 cursor-pointer place-items-center rounded-xl border border-transparent text-xs font-semibold tabular-nums outline-none transition-[color,background-color,border-color,transform,box-shadow,opacity] hover:not-disabled:border-[#d05d38]/25 hover:not-disabled:bg-[#f7e9df] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[#d05d38] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-20 motion-reduce:transition-none sm:min-h-10"
                :class="[
                  day.currentMonth ? 'text-[#23221f]' : 'text-black/25',
                  modelValue === day.date ? 'is-selected bg-[#2d3b32] text-white shadow-[0_7px_18px_-8px_rgba(45,59,50,0.7)] hover:not-disabled:bg-[#2d3b32]' : '',
                  day.today && modelValue !== day.date ? 'border-[#d05d38]/40 text-[#b94f30]' : '',
                ]"
                @focus="rovingDate = day.date"
                @keydown="handleKeydown($event, day.date)"
                @click="selectDate(day.date, $event.detail === 0 ? 'keyboard' : 'pointer')"
              >
                <span>{{ day.day }}</span>
                <span v-if="day.today" class="absolute bottom-1 size-1 rounded-full" :class="modelValue === day.date ? 'bg-[#ffb38e]' : 'bg-[#d05d38]'" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.07] pt-3">
      <p :id="`${instanceId}-help`" class="text-[10px] leading-4 text-black/40">Arrow keys move by day or week. Page keys change month.</p>
      <button type="button" class="shrink-0 cursor-pointer rounded-full bg-[#f0e6d7] px-3 py-1.5 text-[10px] font-bold text-[#74412f] outline-none transition hover:not-disabled:bg-[#ead7c3] focus-visible:ring-2 focus-visible:ring-[#d05d38] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || isUnavailable(todayKey)" @click="today">Today</button>
    </div>

    <p data-testid="date-picker-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </section>
</template>

<style scoped>
.calendar-next-enter-active,
.calendar-next-leave-active,
.calendar-previous-enter-active,
.calendar-previous-leave-active {
  transition-duration: var(--date-picker-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.calendar-next-leave-active,
.calendar-previous-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
}

.calendar-next-enter-from,
.calendar-previous-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.calendar-next-leave-to,
.calendar-previous-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.date-picker-day.is-selected {
  animation: date-picker-select var(--date-picker-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes date-picker-select {
  50% { transform: scale(0.88); }
}

@media (prefers-reduced-motion: reduce) {
  .date-picker-day {
    transition: none !important;
  }

  .calendar-next-enter-active,
  .calendar-next-leave-active,
  .calendar-previous-enter-active,
  .calendar-previous-leave-active {
    transition-duration: 0ms;
  }

  .date-picker-day.is-selected {
    animation: none;
  }
}
</style>
