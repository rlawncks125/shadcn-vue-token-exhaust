<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  as?: string
  duration?: number
  beamSize?: number
  beamCount?: number
  borderWidth?: number
  radius?: number
  colors?: string[]
  reverse?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  ariaLabel?: string
}>(), {
  as: 'div',
  duration: 8,
  beamSize: 18,
  beamCount: 2,
  borderWidth: 1.5,
  radius: 24,
  colors: () => ['var(--registry-accent, #d9ff57)', '#8b5cf6', '#38bdf8'],
  reverse: false,
  paused: false,
  pauseOnHover: true,
  ariaLabel: 'Animated border',
})

const root = ref<HTMLElement | null>(null)
const beamElements = new Map<number, SVGRectElement>()
const animations: Animation[] = []
const hovered = ref(false)
const focusWithin = ref(false)
const reducedMotion = ref(false)

let motionQuery: MediaQueryList | undefined

const safeBeamCount = computed(() => Math.min(Math.max(Math.round(props.beamCount), 1), 4))
const safeBeamSize = computed(() => Math.min(Math.max(props.beamSize, 3), 45))
const safeBorderWidth = computed(() => Math.min(Math.max(props.borderWidth, 0.5), 4))
const safeRadius = computed(() => Math.max(props.radius, 0))
const svgRadius = computed(() => Math.min(safeRadius.value / 2, 24))
const shouldPause = computed(() => props.paused || (props.pauseOnHover && (hovered.value || focusWithin.value)))

function colorFor(index: number) {
  return props.colors[index % Math.max(props.colors.length, 1)] ?? 'var(--registry-accent, #d9ff57)'
}

function setBeamElement(index: number, element: unknown) {
  if (element instanceof SVGRectElement) beamElements.set(index, element)
  else beamElements.delete(index)
}

function cancelAnimations() {
  animations.splice(0).forEach(animation => animation.cancel())
}

function syncPlayback() {
  for (const animation of animations) {
    if (shouldPause.value) animation.pause()
    else animation.play()
  }
}

async function createAnimations() {
  await nextTick()
  cancelAnimations()
  if (reducedMotion.value) return

  const duration = Math.max(props.duration, 1) * 1000
  const offset = props.reverse ? -100 : 100

  for (let index = 0; index < safeBeamCount.value; index++) {
    const element = beamElements.get(index)
    if (!element) continue

    const animation = element.animate([
      { strokeDashoffset: '0' },
      { strokeDashoffset: String(offset) },
    ], {
      duration,
      easing: 'linear',
      iterations: Infinity,
    })
    animation.currentTime = duration * index / safeBeamCount.value
    animations.push(animation)
  }

  syncPlayback()
}

function handleFocusOut() {
  nextTick(() => {
    focusWithin.value = Boolean(root.value?.contains(document.activeElement))
  })
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  createAnimations()
}

watch(
  () => [props.duration, props.reverse, safeBeamCount.value],
  createAnimations,
)
watch(shouldPause, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  createAnimations()
})

onBeforeUnmount(() => {
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="border-beam relative isolate overflow-hidden border border-border bg-card"
    :style="{ borderRadius: `${safeRadius}px` }"
    :aria-label="ariaLabel"
    :data-paused="shouldPause || reducedMotion ? '' : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focusWithin = true"
    @focusout="handleFocusOut"
  >
    <svg
      class="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        v-for="index in safeBeamCount"
        :key="index"
        :ref="element => setBeamElement(index - 1, element)"
        class="border-beam-path fill-none [vector-effect:non-scaling-stroke] drop-shadow-[0_0_5px_currentColor]"
        x="0.65"
        y="0.65"
        width="98.7"
        height="98.7"
        :rx="svgRadius"
        pathLength="100"
        stroke="currentColor"
        stroke-linecap="round"
        :stroke-width="safeBorderWidth"
        :stroke-dasharray="`${safeBeamSize} ${100 - safeBeamSize}`"
        :style="{ color: colorFor(index - 1) }"
      />
    </svg>

    <div class="relative z-10">
      <slot :paused="shouldPause || reducedMotion" />
    </div>
  </component>
</template>
