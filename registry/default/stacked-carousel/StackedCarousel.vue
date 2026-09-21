<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface StackedCarouselItem {
  id: string
  title: string
  description?: string
  eyebrow?: string
}

type ChangeSource = 'previous' | 'next' | 'dot' | 'keyboard' | 'autoplay'

const props = withDefaults(defineProps<{
  items: StackedCarouselItem[]
  autoplay?: boolean
  autoplayDelay?: number
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  autoplay: true,
  autoplayDelay: 3600,
  loop: true,
  paused: false,
  pauseOnHover: true,
  disabled: false,
  ariaLabel: 'Featured content',
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  change: [item: StackedCarouselItem, index: number, source: ChangeSource]
}>()

const root = ref<HTMLElement | null>(null)
const progress = ref<HTMLElement | null>(null)
const hovered = ref(false)
const focusWithin = ref(false)
const userPaused = ref(false)
const reducedMotion = ref(false)
const pageVisible = ref(true)

let autoplayTimer: number | undefined
let progressAnimation: Animation | undefined
let motionQuery: MediaQueryList | undefined

const currentIndex = computed(() => {
  if (props.items.length === 0) return 0
  return Math.min(Math.max(model.value, 0), props.items.length - 1)
})
const currentItem = computed(() => props.items[currentIndex.value])
const canPrevious = computed(() => props.items.length > 1 && (props.loop || currentIndex.value > 0))
const canNext = computed(() => props.items.length > 1 && (props.loop || currentIndex.value < props.items.length - 1))
const interactionPaused = computed(() => props.pauseOnHover && (hovered.value || focusWithin.value))
const canAutoplay = computed(() => (
  props.autoplay
  && canNext.value
  && !props.paused
  && !userPaused.value
  && !interactionPaused.value
  && !props.disabled
  && !reducedMotion.value
  && pageVisible.value
))
const playbackPaused = computed(() => props.paused || userPaused.value || interactionPaused.value || reducedMotion.value)

function cardState(index: number) {
  if (index === currentIndex.value) return 'active'

  const count = props.items.length
  if (!props.loop) {
    const distance = index - currentIndex.value
    if (distance === 1) return 'next'
    if (distance === 2) return 'queued'
    if (distance === -1) return 'previous'
    return 'hidden'
  }

  const forward = (index - currentIndex.value + count) % count
  const backward = (currentIndex.value - index + count) % count
  if (forward === 1) return 'next'
  if (forward === 2) return 'queued'
  if (backward === 1) return 'previous'
  return 'hidden'
}

function clearAutoplay() {
  if (autoplayTimer !== undefined) window.clearTimeout(autoplayTimer)
  autoplayTimer = undefined
  progressAnimation?.cancel()
  progressAnimation = undefined
}

async function scheduleAutoplay() {
  clearAutoplay()
  if (!canAutoplay.value) return

  await nextTick()
  if (!canAutoplay.value) return

  const delay = Math.max(props.autoplayDelay, 1000)
  progressAnimation = progress.value?.animate([
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ], { duration: delay, easing: 'linear', fill: 'forwards' })

  autoplayTimer = window.setTimeout(() => next('autoplay'), delay)
}

function setCurrent(index: number, source: ChangeSource) {
  if (props.disabled || props.items.length === 0) return

  const count = props.items.length
  const nextIndex = props.loop
    ? (index + count) % count
    : Math.min(Math.max(index, 0), count - 1)

  if (nextIndex === currentIndex.value) {
    scheduleAutoplay()
    return
  }

  model.value = nextIndex
  emit('change', props.items[nextIndex], nextIndex, source)
}

function previous(source: ChangeSource = 'previous') {
  if (canPrevious.value) setCurrent(currentIndex.value - 1, source)
}

function next(source: ChangeSource = 'next') {
  if (canNext.value) setCurrent(currentIndex.value + 1, source)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previous('keyboard')
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    next('keyboard')
  } else if (event.key === 'Home' && props.items.length) {
    event.preventDefault()
    setCurrent(0, 'keyboard')
  } else if (event.key === 'End' && props.items.length) {
    event.preventDefault()
    setCurrent(props.items.length - 1, 'keyboard')
  }
}

function handleFocusOut() {
  nextTick(() => {
    focusWithin.value = Boolean(root.value?.contains(document.activeElement))
  })
}

function togglePlayback() {
  userPaused.value = !userPaused.value
}

function handleVisibilityChange() {
  pageVisible.value = document.visibilityState === 'visible'
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
}

watch(
  () => [props.items.length, model.value],
  () => {
    if (props.items.length === 0 && model.value !== 0) model.value = 0
    else if (model.value > props.items.length - 1) model.value = Math.max(props.items.length - 1, 0)
    else if (model.value < 0) model.value = 0
  },
)
watch([currentIndex, canAutoplay, () => props.autoplayDelay], scheduleAutoplay)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  scheduleAutoplay()
})

onBeforeUnmount(() => {
  clearAutoplay()
  motionQuery?.removeEventListener('change', handleMotionChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <section
    ref="root"
    class="stacked-carousel w-full max-w-xl outline-none"
    role="region"
    :aria-label="ariaLabel"
    :aria-roledescription="'carousel'"
    :aria-disabled="disabled || undefined"
    :data-paused="playbackPaused ? '' : undefined"
    tabindex="0"
    @keydown="handleKeydown"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focusWithin = true"
    @focusout="handleFocusOut"
  >
    <div class="relative mb-9 mr-7 h-72 sm:h-80">
      <article
        v-for="(item, index) in items"
        :id="`${item.id}-slide`"
        :key="item.id"
        class="stacked-carousel-card absolute inset-0 origin-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none data-[state=active]:z-30 data-[state=active]:translate-x-0 data-[state=active]:translate-y-0 data-[state=active]:rotate-0 data-[state=active]:scale-100 data-[state=active]:opacity-100 data-[state=next]:z-20 data-[state=next]:translate-x-3 data-[state=next]:translate-y-3 data-[state=next]:scale-[0.97] data-[state=next]:opacity-70 data-[state=queued]:z-10 data-[state=queued]:translate-x-6 data-[state=queued]:translate-y-6 data-[state=queued]:scale-[0.94] data-[state=queued]:opacity-35 data-[state=previous]:z-20 data-[state=previous]:-translate-x-[108%] data-[state=previous]:-rotate-3 data-[state=previous]:scale-[0.97] data-[state=previous]:opacity-0 data-[state=hidden]:z-0 data-[state=hidden]:translate-x-[108%] data-[state=hidden]:scale-90 data-[state=hidden]:opacity-0"
        :data-state="cardState(index)"
        :aria-label="`${index + 1} of ${items.length}`"
        :aria-hidden="index !== currentIndex"
        :inert="index !== currentIndex"
        role="group"
        aria-roledescription="slide"
      >
        <slot name="item" :item="item" :index="index" :active="index === currentIndex">
          <div
            class="flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-black/10 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)] sm:p-9"
            :class="index % 3 === 0 ? 'bg-[#171814] text-white' : index % 3 === 1 ? 'bg-[var(--registry-accent,#d9ff57)] text-[var(--registry-accent-foreground,#171814)]' : 'bg-[#e6d7ff] text-black'"
          >
            <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] opacity-55">
              <span>{{ item.eyebrow ?? 'Featured' }}</span>
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div>
              <h3 class="max-w-md text-3xl font-semibold leading-none tracking-[-0.045em] sm:text-4xl">{{ item.title }}</h3>
              <p v-if="item.description" class="mt-4 max-w-md text-sm leading-6 opacity-60">{{ item.description }}</p>
            </div>
          </div>
        </slot>
      </article>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex gap-2">
        <button
          type="button"
          class="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-35"
          :disabled="disabled || !canPrevious"
          aria-label="Previous slide"
          @click="previous()"
        >
          <span aria-hidden="true">&larr;</span>
        </button>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-35"
          :disabled="disabled || !canNext"
          aria-label="Next slide"
          @click="next()"
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5" aria-label="Choose slide">
        <button
          v-for="(item, index) in items"
          :key="item.id"
          type="button"
          class="h-2 rounded-full bg-muted-foreground/25 outline-none transition-[width,background-color] duration-300 hover:bg-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed data-[active=true]:w-6 data-[active=true]:bg-primary data-[active=false]:w-2"
          :data-active="index === currentIndex"
          :aria-label="`Go to slide ${index + 1}: ${item.title}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          :disabled="disabled"
          @click="setCurrent(index, 'dot')"
        />
      </div>

      <button
        v-if="autoplay"
        type="button"
        class="grid size-10 place-items-center rounded-full border border-border bg-card text-xs font-semibold text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-35"
        :disabled="disabled"
        :aria-label="userPaused ? 'Resume automatic playback' : 'Pause automatic playback'"
        :aria-pressed="userPaused"
        @click="togglePlayback"
      >
        <span aria-hidden="true">{{ userPaused ? '>' : 'II' }}</span>
      </button>
    </div>

    <div v-if="autoplay" class="mt-4 h-0.5 overflow-hidden rounded-full bg-muted">
      <div ref="progress" class="stacked-carousel-progress h-full origin-left scale-x-0 bg-primary" />
    </div>

    <p class="sr-only" aria-live="polite" aria-atomic="true">
      {{ currentItem ? `Slide ${currentIndex + 1} of ${items.length}: ${currentItem.title}` : 'No slides' }}
    </p>
  </section>
</template>
