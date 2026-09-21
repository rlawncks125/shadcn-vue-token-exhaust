<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type ChangeSource = 'next' | 'previous' | 'autoplay' | 'external'
type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' },
) => { segment: (input: string) => Iterable<{ segment: string }> }

const props = withDefaults(defineProps<{
  items: string[]
  interval?: number
  duration?: number
  stagger?: number
  direction?: 'up' | 'down'
  autoplay?: boolean
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  ariaLive?: 'off' | 'polite' | 'assertive'
}>(), {
  interval: 2400,
  duration: 480,
  stagger: 32,
  direction: 'up',
  autoplay: true,
  loop: true,
  paused: false,
  pauseOnHover: true,
  ariaLive: 'polite',
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  change: [value: string, index: number, source: ChangeSource]
}>()

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const currentLayer = ref<HTMLElement | null>(null)
const currentCharacters = new Map<number, HTMLElement>()
const previousCharacters = new Map<number, HTMLElement>()
const animations: Animation[] = []
const displayText = ref(props.items[0] ?? '')
const previousText = ref('')
const hovered = ref(false)
const reducedMotion = ref(false)
const animating = ref(false)

let timer: number | undefined
let transitionId = 0
let pendingSource: ChangeSource = 'external'
let motionQuery: MediaQueryList | undefined

const currentIndex = computed(() => {
  if (props.items.length === 0) return 0
  return Math.min(Math.max(model.value, 0), props.items.length - 1)
})
const canAdvance = computed(() => props.items.length > 1 && (props.loop || currentIndex.value < props.items.length - 1))
const canAutoplay = computed(() => (
  props.autoplay
  && canAdvance.value
  && !props.paused
  && !(props.pauseOnHover && hovered.value)
  && !reducedMotion.value
))

function graphemes(value: string) {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterConstructor }).Segmenter
  if (!Segmenter) return Array.from(value)
  return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(value), part => part.segment)
}

function setCharacter(map: Map<number, HTMLElement>, index: number, element: unknown) {
  if (element instanceof HTMLElement) map.set(index, element)
  else map.delete(index)
}

function cancelAnimations() {
  animations.splice(0).forEach(animation => animation.cancel())
}

function clearTimer() {
  if (timer !== undefined) window.clearTimeout(timer)
  timer = undefined
}

function schedule() {
  clearTimer()
  if (!canAutoplay.value) return
  timer = window.setTimeout(() => next('autoplay'), Math.max(props.interval, 500))
}

async function transitionTo(value: string) {
  const id = ++transitionId
  const oldText = displayText.value
  if (oldText === value) return

  const startWidth = viewport.value?.getBoundingClientRect().width ?? 0
  cancelAnimations()
  previousText.value = oldText
  displayText.value = value
  animating.value = true

  await nextTick()
  if (id !== transitionId || !viewport.value || !currentLayer.value) return

  if (reducedMotion.value || props.duration <= 0) {
    previousText.value = ''
    viewport.value.style.width = 'auto'
    animating.value = false
    return
  }

  const endWidth = currentLayer.value.getBoundingClientRect().width
  viewport.value.style.width = `${startWidth}px`
  const widthAnimation = viewport.value.animate([
    { width: `${startWidth}px` },
    { width: `${endWidth}px` },
  ], {
    duration: Math.max(props.duration, 0),
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'both',
  })
  animations.push(widthAnimation)

  const travel = props.direction === 'up' ? 110 : -110
  const timing = (index: number): KeyframeAnimationOptions => ({
    duration: Math.max(props.duration, 0),
    delay: Math.max(props.stagger, 0) * index,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'both',
  })

  previousCharacters.forEach((element, index) => {
    animations.push(element.animate([
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      { opacity: 0, transform: `translateY(${-travel}%)`, filter: 'blur(4px)' },
    ], timing(index)))
  })

  currentCharacters.forEach((element, index) => {
    animations.push(element.animate([
      { opacity: 0, transform: `translateY(${travel}%)`, filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
    ], timing(index)))
  })

  const activeAnimations = [...animations]
  await Promise.allSettled(activeAnimations.map(animation => animation.finished))
  if (id !== transitionId) return

  viewport.value.style.width = 'auto'
  previousText.value = ''
  animating.value = false
  cancelAnimations()
}

function goTo(index: number, source: ChangeSource = 'external') {
  if (props.items.length === 0) return
  const nextIndex = props.loop
    ? (index + props.items.length) % props.items.length
    : Math.min(Math.max(index, 0), props.items.length - 1)
  if (nextIndex === currentIndex.value) {
    schedule()
    return
  }
  pendingSource = source
  model.value = nextIndex
}

function next(source: ChangeSource = 'next') {
  if (canAdvance.value) goTo(currentIndex.value + 1, source)
}

function previous(source: ChangeSource = 'previous') {
  if (props.items.length > 1 && (props.loop || currentIndex.value > 0)) goTo(currentIndex.value - 1, source)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  transitionId++
  cancelAnimations()
  previousText.value = ''
  displayText.value = props.items[currentIndex.value] ?? ''
  if (viewport.value) viewport.value.style.width = 'auto'
  animating.value = false
  schedule()
}

watch(currentIndex, (index) => {
  const source = pendingSource
  pendingSource = 'external'
  const value = props.items[index] ?? ''
  transitionTo(value)
  emit('change', value, index, source)
  schedule()
})

watch(() => [props.items.join('\u0000'), model.value], () => {
  if (props.items.length === 0) {
    model.value = 0
    displayText.value = ''
  } else if (model.value > props.items.length - 1) model.value = props.items.length - 1
  else if (model.value < 0) model.value = 0
  else if (!animating.value && displayText.value !== props.items[currentIndex.value]) displayText.value = props.items[currentIndex.value]
})
watch([canAutoplay, () => props.interval], schedule)

onMounted(() => {
  displayText.value = props.items[currentIndex.value] ?? ''
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  schedule()
})

onBeforeUnmount(() => {
  clearTimer()
  transitionId++
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ next, previous, goTo })
</script>

<template>
  <span
    ref="root"
    class="text-loop inline-flex max-w-full align-bottom"
    :data-animating="animating ? '' : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <span ref="viewport" class="text-loop-viewport relative inline-block overflow-hidden whitespace-nowrap align-bottom leading-[inherit]">
      <span ref="currentLayer" class="text-loop-current inline-flex" aria-hidden="true">
        <span
          v-for="(character, index) in graphemes(displayText)"
          :key="`${displayText}-${index}`"
          :ref="element => setCharacter(currentCharacters, index, element)"
          class="text-loop-character inline-block whitespace-pre will-change-[transform,opacity,filter]"
        >{{ character }}</span>
      </span>
      <span v-if="previousText" class="text-loop-previous absolute left-0 top-0 inline-flex" aria-hidden="true">
        <span
          v-for="(character, index) in graphemes(previousText)"
          :key="`${previousText}-${index}`"
          :ref="element => setCharacter(previousCharacters, index, element)"
          class="inline-block whitespace-pre will-change-[transform,opacity,filter]"
        >{{ character }}</span>
      </span>
    </span>
    <span class="sr-only" :aria-live="ariaLive" aria-atomic="true">{{ displayText }}</span>
  </span>
</template>
