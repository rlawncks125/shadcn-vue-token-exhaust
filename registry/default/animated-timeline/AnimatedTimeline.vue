<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedTimelineItem {
  id: string
  title: string
  description?: string
  meta?: string
  disabled?: boolean
}

type ChangeSource = 'click' | 'keyboard' | 'autoplay'

const props = withDefaults(defineProps<{
  items: AnimatedTimelineItem[]
  duration?: number
  autoplay?: boolean
  interval?: number
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  duration: 520,
  autoplay: true,
  interval: 2400,
  loop: true,
  paused: false,
  pauseOnHover: true,
  disabled: false,
  ariaLabel: 'Progress timeline',
})

const model = defineModel<string | null>({ default: null })
const emit = defineEmits<{
  change: [item: AnimatedTimelineItem, index: number, source: ChangeSource]
}>()

const root = ref<HTMLElement | null>(null)
const progressLine = ref<HTMLElement | null>(null)
const buttons = new Map<number, HTMLButtonElement>()
const dots = new Map<number, HTMLElement>()
const hovered = ref(false)
const focusWithin = ref(false)
const reducedMotion = ref(false)

let timer: number | undefined
let lineAnimation: Animation | undefined
let dotAnimation: Animation | undefined
let motionQuery: MediaQueryList | undefined

const enabledIndices = computed(() => props.items.map((item, index) => !item.disabled ? index : -1).filter(index => index >= 0))
const activeIndex = computed(() => {
  const found = props.items.findIndex(item => item.id === model.value)
  return found >= 0 ? found : (enabledIndices.value[0] ?? 0)
})
const progress = computed(() => props.items.length <= 1 ? 1 : activeIndex.value / (props.items.length - 1))
const shouldPause = computed(() => props.paused || (props.pauseOnHover && (hovered.value || focusWithin.value)))
const canAutoplay = computed(() => props.autoplay && !props.disabled && !shouldPause.value && !reducedMotion.value && enabledIndices.value.length > 1)

function setButton(index: number, element: unknown) {
  if (element instanceof HTMLButtonElement) buttons.set(index, element)
  else buttons.delete(index)
}

function setDot(index: number, element: unknown) {
  if (element instanceof HTMLElement) dots.set(index, element)
  else dots.delete(index)
}

function clearTimer() {
  if (timer !== undefined) window.clearTimeout(timer)
  timer = undefined
}

function syncPlayback() {
  for (const animation of [lineAnimation, dotAnimation]) {
    if (!animation) continue
    if (shouldPause.value) animation.pause()
    else animation.play()
  }
}

function schedule() {
  clearTimer()
  if (!canAutoplay.value) return
  timer = window.setTimeout(() => advance('autoplay'), Math.max(props.interval, 700))
}

async function animateProgress(fromIndex: number, toIndex: number) {
  await nextTick()
  lineAnimation?.cancel()
  dotAnimation?.cancel()
  if (!progressLine.value) return

  const denominator = Math.max(props.items.length - 1, 1)
  const from = fromIndex / denominator
  const to = toIndex / denominator
  if (reducedMotion.value || props.duration <= 0) {
    progressLine.value.style.transform = `scaleY(${to})`
    return
  }

  lineAnimation = progressLine.value.animate([
    { transform: `scaleY(${from})` },
    { transform: `scaleY(${to})` },
  ], { duration: props.duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' })

  const dot = root.value?.querySelectorAll<HTMLElement>('.animated-timeline-dot')[toIndex]
  if (dot) {
    dotAnimation = dot.animate([
      { transform: 'scale(0.75)', opacity: 0.55 },
      { transform: 'scale(1.3)', opacity: 1, offset: 0.55 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: props.duration, easing: 'ease-out' })
  }
  syncPlayback()

  const activeLine = lineAnimation
  activeLine.finished.then(() => {
    if (lineAnimation !== activeLine) return
    progressLine.value && (progressLine.value.style.transform = `scaleY(${to})`)
    lineAnimation = undefined
    activeLine.cancel()
  }).catch(() => undefined)
}

function select(index: number, source: ChangeSource, focus = false) {
  const item = props.items[index]
  if (!item || item.disabled || props.disabled) return
  model.value = item.id
  emit('change', item, index, source)
  if (focus) nextTick(() => buttons.get(index)?.focus())
}

function advance(source: ChangeSource = 'autoplay') {
  const position = enabledIndices.value.indexOf(activeIndex.value)
  const nextPosition = position + 1
  if (nextPosition < enabledIndices.value.length) select(enabledIndices.value[nextPosition], source)
  else if (props.loop) select(enabledIndices.value[0], source)
}

function moveFrom(index: number, direction: 1 | -1) {
  const position = enabledIndices.value.indexOf(index)
  if (position < 0) return
  const nextPosition = (position + direction + enabledIndices.value.length) % enabledIndices.value.length
  select(enabledIndices.value[nextPosition], 'keyboard', true)
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    moveFrom(index, 1)
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    moveFrom(index, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    select(enabledIndices.value[0], 'keyboard', true)
  } else if (event.key === 'End') {
    event.preventDefault()
    select(enabledIndices.value.at(-1) ?? 0, 'keyboard', true)
  }
}

function handleFocusOut() {
  nextTick(() => (focusWithin.value = Boolean(root.value?.contains(document.activeElement))))
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  lineAnimation?.cancel()
  dotAnimation?.cancel()
  if (progressLine.value) progressLine.value.style.transform = `scaleY(${progress.value})`
  schedule()
}

watch(activeIndex, (index, previous) => {
  animateProgress(previous ?? index, index)
  schedule()
})
watch([canAutoplay, () => props.interval], schedule)
watch(shouldPause, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  if (!model.value && props.items[activeIndex.value]) model.value = props.items[activeIndex.value].id
  if (progressLine.value) progressLine.value.style.transform = `scaleY(${progress.value})`
  schedule()
})

onBeforeUnmount(() => {
  clearTimer()
  lineAnimation?.cancel()
  dotAnimation?.cancel()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <ol
    ref="root"
    class="animated-timeline relative space-y-2"
    :aria-label="ariaLabel"
    :data-paused="shouldPause || reducedMotion ? '' : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focusWithin = true"
    @focusout="handleFocusOut"
  >
    <li aria-hidden="true" role="presentation" class="pointer-events-none absolute bottom-8 left-[1.1875rem] top-8 w-px bg-border">
      <div ref="progressLine" class="animated-timeline-progress size-full origin-top bg-primary will-change-transform" />
    </li>

    <li v-for="(item, index) in items" :key="item.id" class="relative">
      <button
        :ref="element => setButton(index, element)"
        type="button"
        class="animated-timeline-step group flex w-full items-start gap-4 rounded-2xl p-3 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled || item.disabled"
        :aria-current="index === activeIndex ? 'step' : undefined"
        :tabindex="index === activeIndex ? 0 : -1"
        @click="select(index, 'click')"
        @keydown="handleKeydown($event, index)"
      >
        <span
          :ref="element => setDot(index, element)"
          class="animated-timeline-dot relative z-10 mt-1 grid size-4 shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color] duration-300 motion-reduce:transition-none"
          :class="index <= activeIndex ? 'border-primary bg-primary' : 'border-border bg-card'"
        >
          <span v-if="index < activeIndex" class="size-1 rounded-full bg-primary-foreground" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="flex items-center justify-between gap-4">
            <span class="font-semibold text-foreground">{{ item.title }}</span>
            <span v-if="item.meta" class="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{{ item.meta }}</span>
          </span>
          <span v-if="item.description" class="mt-1 block text-xs leading-5 text-muted-foreground">{{ item.description }}</span>
          <slot name="item" :item="item" :index="index" :active="index === activeIndex" :complete="index < activeIndex" />
        </span>
      </button>
    </li>
  </ol>
</template>
