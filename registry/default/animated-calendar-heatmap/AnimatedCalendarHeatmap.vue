<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedCalendarHeatmapDay {
  date: string
  value: number
  label?: string
}

export type AnimatedCalendarHeatmapSelectionSource = 'pointer' | 'keyboard'

export interface AnimatedCalendarHeatmapProps {
  days: AnimatedCalendarHeatmapDay[]
  levels?: number
  colors?: string[]
  weeks?: number
  cellSize?: number
  gap?: number
  duration?: number
  disabled?: boolean
  label?: string
  formatValue?: (value: number, day: AnimatedCalendarHeatmapDay) => string
}

export interface AnimatedCalendarHeatmapEvents {
  select: [day: AnimatedCalendarHeatmapDay, source: AnimatedCalendarHeatmapSelectionSource]
  change: [date: string, previousDate: string | null, day: AnimatedCalendarHeatmapDay]
  reveal: [days: AnimatedCalendarHeatmapDay[]]
}

export interface AnimatedCalendarHeatmapExpose {
  focus: (date?: string) => Promise<boolean>
  replay: () => Promise<void>
}

interface CalendarCell {
  key: string
  day?: AnimatedCalendarHeatmapDay
  row: number
  column: number
}

const DAY_MS = 86_400_000
const DEFAULT_COLORS = [
  'color-mix(in srgb, var(--registry-accent, #22a05a) 8%, white)',
  'color-mix(in srgb, var(--registry-accent, #22a05a) 28%, white)',
  'color-mix(in srgb, var(--registry-accent, #22a05a) 52%, white)',
  'color-mix(in srgb, var(--registry-accent, #22a05a) 76%, white)',
  'var(--registry-accent, #22a05a)',
]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const props = withDefaults(defineProps<AnimatedCalendarHeatmapProps>(), {
  levels: 5,
  weeks: 20,
  cellSize: 14,
  gap: 4,
  duration: 700,
  disabled: false,
  label: 'Activity calendar',
  formatValue: (value: number) => `${value} ${value === 1 ? 'contribution' : 'contributions'}`,
})

const model = defineModel<string | null>({ default: null })
const emit = defineEmits<AnimatedCalendarHeatmapEvents>()

const root = ref<HTMLElement | null>(null)
const rovingDate = ref('')
const detailDate = ref('')
const reducedMotion = ref(false)
const buttons = new Map<string, HTMLButtonElement>()
const animations = new Set<Animation>()

let mounted = false
let animationGeneration = 0
let motionQuery: MediaQueryList | undefined
let previousValues = new Map<string, number>()

const safeLevels = computed(() => Math.max(2, Math.min(10, Math.floor(props.levels))))
const safeWeeks = computed(() => Math.max(1, Math.min(53, Math.floor(props.weeks))))
const safeCellSize = computed(() => Math.max(8, Math.min(32, props.cellSize)))
const safeGap = computed(() => Math.max(0, Math.min(12, props.gap)))
const safeDuration = computed(() => Math.max(0, Math.min(3000, props.duration)))
const palette = computed(() => props.colors?.length ? props.colors : DEFAULT_COLORS)

function toDateKey(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  const key = `${match[1]}-${match[2]}-${match[3]}`
  const date = new Date(`${key}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== key ? null : key
}

function keyFromTime(time: number) {
  return new Date(time).toISOString().slice(0, 10)
}

const validDays = computed(() => props.days
  .map(day => ({ day, key: toDateKey(day.date) }))
  .filter((entry): entry is { day: AnimatedCalendarHeatmapDay; key: string } => Boolean(entry.key))
  .sort((a, b) => a.key.localeCompare(b.key)))

const calendarWeeks = computed<CalendarCell[][]>(() => {
  const last = validDays.value.at(-1)
  if (!last) return []

  const byDate = new Map(validDays.value.map(entry => [entry.key, entry.day]))
  const lastTime = Date.parse(`${last.key}T00:00:00Z`)
  const mondayIndex = (new Date(lastTime).getUTCDay() + 6) % 7
  const endTime = lastTime + (6 - mondayIndex) * DAY_MS
  const startTime = endTime - (safeWeeks.value * 7 - 1) * DAY_MS

  return Array.from({ length: safeWeeks.value }, (_, column) =>
    Array.from({ length: 7 }, (_, row) => {
      const key = keyFromTime(startTime + (column * 7 + row) * DAY_MS)
      return { key, day: byDate.get(key), row, column }
    }),
  )
})

const visibleDays = computed(() => calendarWeeks.value.flatMap(week => week.flatMap(cell => cell.day ? [cell.day] : [])))
const visibleByDate = computed(() => new Map(visibleDays.value.map(day => [day.date, day])))
const maximumValue = computed(() => Math.max(0, ...visibleDays.value.map(day => day.value)))
const activeDay = computed(() => visibleByDate.value.get(detailDate.value)
  ?? visibleByDate.value.get(model.value ?? '')
  ?? visibleByDate.value.get(rovingDate.value)
  ?? visibleDays.value.at(-1))

const monthLabels = computed(() => calendarWeeks.value.map((week, index) => {
  const first = week[0]
  if (!first) return ''
  const month = first.key.slice(0, 7)
  const previousMonth = calendarWeeks.value[index - 1]?.[0]?.key.slice(0, 7)
  if (index > 0 && month === previousMonth) return ''
  return new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(`${first.key}T00:00:00Z`))
}))

const columnStyle = computed<CSSProperties>(() => ({
  gap: `${safeGap.value}px`,
  gridTemplateRows: `repeat(7, ${safeCellSize.value}px)`,
  width: `${safeCellSize.value}px`,
}))
const rowLabelStyle = computed<CSSProperties>(() => ({
  gap: `${safeGap.value}px`,
  gridTemplateRows: `repeat(7, ${safeCellSize.value}px)`,
}))

function dateLabel(day: AnimatedCalendarHeatmapDay) {
  if (day.label) return day.label
  const key = toDateKey(day.date)
  if (!key) return day.date
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${key}T00:00:00Z`))
}

function levelFor(day: AnimatedCalendarHeatmapDay) {
  if (day.value <= 0 || maximumValue.value <= 0) return 0
  return Math.max(1, Math.min(safeLevels.value - 1, Math.ceil(day.value / maximumValue.value * (safeLevels.value - 1))))
}

function colorForLevel(level: number) {
  if (palette.value.length === 1) return palette.value[0]
  const paletteIndex = Math.round(level / (safeLevels.value - 1) * (palette.value.length - 1))
  return palette.value[Math.min(paletteIndex, palette.value.length - 1)]
}

function cellStyle(day: AnimatedCalendarHeatmapDay): CSSProperties {
  return {
    backgroundColor: colorForLevel(levelFor(day)),
    height: `${safeCellSize.value}px`,
    transitionDuration: `${Math.min(safeDuration.value, 500)}ms`,
    width: `${safeCellSize.value}px`,
  }
}

function emptyCellStyle(): CSSProperties {
  return { height: `${safeCellSize.value}px`, width: `${safeCellSize.value}px` }
}

function setButton(element: unknown, date: string) {
  if (element instanceof HTMLButtonElement) buttons.set(date, element)
  else buttons.delete(date)
}

function clearAnimations() {
  animationGeneration += 1
  animations.forEach(animation => animation.cancel())
  animations.clear()
}

function trackAnimation(animation: Animation) {
  animations.add(animation)
  animation.finished.finally(() => animations.delete(animation)).catch(() => undefined)
  return animation
}

async function replay(): Promise<void> {
  clearAnimations()
  await nextTick()
  const generation = animationGeneration
  const days = [...visibleDays.value]

  if (reducedMotion.value || safeDuration.value === 0) {
    emit('reveal', days)
    return
  }

  const cellDuration = Math.max(120, Math.min(360, safeDuration.value * 0.55))
  const delayRange = Math.max(0, safeDuration.value - cellDuration)
  const running = days.flatMap((day, index) => {
    const button = buttons.get(day.date)
    if (!button) return []
    return [trackAnimation(button.animate([
      { opacity: 0, transform: 'translateY(5px) scale(0.55)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], {
      duration: cellDuration,
      delay: days.length > 1 ? index / (days.length - 1) * delayRange : 0,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    }))]
  })

  await Promise.all(running.map(animation => animation.finished.catch(() => undefined)))
  if (generation === animationGeneration) emit('reveal', days)
}

async function animateValueUpdates(dates: string[]) {
  await nextTick()
  if (reducedMotion.value || safeDuration.value === 0) return
  dates.forEach((date, index) => {
    const button = buttons.get(date)
    if (!button) return
    trackAnimation(button.animate([
      { transform: 'scale(0.72)', opacity: 0.65 },
      { transform: 'scale(1.18)', opacity: 1, offset: 0.58 },
      { transform: 'scale(1)', opacity: 1 },
    ], {
      duration: Math.max(180, Math.min(520, safeDuration.value * 0.7)),
      delay: Math.min(index * 10, 180),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    }))
  })
}

async function focusDay(date?: string): Promise<boolean> {
  if (props.disabled) return false
  const target = (date && visibleByDate.value.has(date) ? date : undefined)
    ?? (model.value && visibleByDate.value.has(model.value) ? model.value : undefined)
    ?? visibleDays.value.at(-1)?.date
  if (!target) return false
  rovingDate.value = target
  detailDate.value = target
  await nextTick()
  const button = buttons.get(target)
  if (!button) return false
  button.focus()
  return true
}

function selectDay(day: AnimatedCalendarHeatmapDay, source: AnimatedCalendarHeatmapSelectionSource) {
  if (props.disabled) return
  const previous = model.value
  model.value = day.date
  rovingDate.value = day.date
  detailDate.value = day.date
  emit('select', day, source)
  if (previous !== day.date) emit('change', day.date, previous, day)
}

function handleKeydown(event: KeyboardEvent, day: AnimatedCalendarHeatmapDay) {
  const index = visibleDays.value.findIndex(candidate => candidate.date === day.date)
  if (index < 0) return

  let nextIndex = index
  if (event.key === 'ArrowUp') nextIndex = index - 1
  else if (event.key === 'ArrowDown') nextIndex = index + 1
  else if (event.key === 'ArrowLeft') nextIndex = index - 7
  else if (event.key === 'ArrowRight') nextIndex = index + 7
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = visibleDays.value.length - 1
  else return

  event.preventDefault()
  const nextDay = visibleDays.value[Math.max(0, Math.min(visibleDays.value.length - 1, nextIndex))]
  if (nextDay) void focusDay(nextDay.date)
}

function restoreDetail() {
  detailDate.value = model.value && visibleByDate.value.has(model.value)
    ? model.value
    : rovingDate.value
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  clearAnimations()
  if (!event.matches) void replay()
}

watch(() => visibleDays.value.map(day => day.date), (dates) => {
  if (dates.includes(rovingDate.value)) return
  rovingDate.value = dates.includes(model.value ?? '') ? model.value ?? '' : dates.at(-1) ?? ''
  restoreDetail()
}, { immediate: true })

watch(model, (date) => {
  if (date && visibleByDate.value.has(date)) {
    rovingDate.value = date
    detailDate.value = date
  }
})

watch(() => props.days.map(day => `${day.date}:${day.value}`).join('|'), () => {
  const current = new Map(validDays.value.map(entry => [entry.day.date, entry.day.value]))
  if (mounted) {
    const changed = [...current].filter(([date, value]) => previousValues.has(date) && previousValues.get(date) !== value).map(([date]) => date)
    void animateValueUpdates(changed)
  }
  previousValues = current
})

onMounted(() => {
  mounted = true
  previousValues = new Map(validDays.value.map(entry => [entry.day.date, entry.day.value]))
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  void replay()
})

onBeforeUnmount(() => {
  mounted = false
  clearAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose<AnimatedCalendarHeatmapExpose>({ focus: focusDay, replay })
</script>

<template>
  <figure ref="root" class="animated-calendar-heatmap m-0 min-w-0 text-foreground" :aria-label="label" :aria-disabled="disabled || undefined">
    <figcaption class="sr-only">{{ label }}</figcaption>

    <div class="mb-4 flex min-h-11 items-end justify-between gap-5 border-b border-border/70 pb-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">{{ activeDay ? dateLabel(activeDay) : 'No activity available' }}</p>
        <p class="mt-0.5 text-xs tabular-nums text-muted-foreground">{{ activeDay ? formatValue(activeDay.value, activeDay) : 'Add dated activity to begin' }}</p>
      </div>
      <span v-if="activeDay" class="shrink-0 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
        Level {{ levelFor(activeDay) }}
      </span>
    </div>

    <div v-if="calendarWeeks.length" class="w-full overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div class="min-w-max">
        <div class="mb-1 flex items-end pl-9" aria-hidden="true" :style="{ gap: `${safeGap}px` }">
          <span v-for="(month, index) in monthLabels" :key="index" class="block h-4 shrink-0 text-[9px] font-medium text-muted-foreground" :style="{ width: `${safeCellSize}px` }">{{ month }}</span>
        </div>

        <div class="flex items-start gap-3">
          <div class="grid w-6 shrink-0 place-items-end" :style="rowLabelStyle" aria-hidden="true">
            <span v-for="weekday in WEEKDAYS" :key="weekday" class="flex h-full items-center text-[9px] font-medium text-muted-foreground">{{ weekday }}</span>
          </div>

          <div
            role="grid"
            :aria-label="label"
            :aria-rowcount="7"
            :aria-colcount="calendarWeeks.length"
            class="flex outline-none"
            :style="{ gap: `${safeGap}px` }"
            @mouseleave="restoreDetail"
          >
            <div v-for="(week, weekIndex) in calendarWeeks" :key="week[0]?.key" role="presentation" class="grid shrink-0" :style="columnStyle">
              <template v-for="cell in week" :key="cell.key">
                <button
                  v-if="cell.day"
                  :ref="element => setButton(element, cell.day!.date)"
                  type="button"
                  role="gridcell"
                  :data-date="cell.day.date"
                  :data-level="levelFor(cell.day)"
                  :aria-rowindex="cell.row + 1"
                  :aria-colindex="weekIndex + 1"
                  :aria-label="`${dateLabel(cell.day)}: ${formatValue(cell.day.value, cell.day)}`"
                  :aria-selected="model === cell.day.date"
                  :disabled="disabled"
                  :tabindex="!disabled && rovingDate === cell.day.date ? 0 : -1"
                  class="animated-calendar-heatmap-cell block shrink-0 cursor-pointer rounded-[3px] border border-black/[0.035] p-0 outline-none transition-[background-color,box-shadow,transform,opacity] ease-out hover:not-disabled:z-10 hover:not-disabled:scale-125 hover:not-disabled:shadow-[0_3px_10px_rgba(0,0,0,0.22)] focus-visible:z-10 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
                  :class="model === cell.day.date ? 'z-10 ring-2 ring-foreground ring-offset-1 ring-offset-background' : ''"
                  :style="cellStyle(cell.day)"
                  @mouseenter="detailDate = cell.day!.date"
                  @focus="rovingDate = cell.day!.date; detailDate = cell.day!.date"
                  @keydown="handleKeydown($event, cell.day!)"
                  @click="selectDay(cell.day!, $event.detail === 0 ? 'keyboard' : 'pointer')"
                />
                <span v-else role="gridcell" aria-hidden="true" class="block rounded-[3px] border border-dashed border-border/50 bg-muted/20" :style="emptyCellStyle()" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-8 text-center text-xs text-muted-foreground" role="status">No activity to display.</p>

    <div v-if="calendarWeeks.length" class="mt-3 flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground" aria-hidden="true">
      <span>Less</span>
      <span v-for="level in safeLevels" :key="level" class="block rounded-[3px] border border-black/[0.035]" :style="{ backgroundColor: colorForLevel(level - 1), height: `${Math.max(8, safeCellSize - 3)}px`, width: `${Math.max(8, safeCellSize - 3)}px` }" />
      <span>More</span>
    </div>
  </figure>
</template>
