<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  duration?: number
  direction?: 'left' | 'right'
  gap?: number
  pauseOnHover?: boolean
  paused?: boolean
  fade?: boolean
  label?: string
}>(), {
  duration: 24,
  direction: 'left',
  gap: 24,
  pauseOnHover: true,
  paused: false,
  fade: true,
  label: 'Scrolling content',
})
const marqueeStyle = computed(() => ({
  '--marquee-gap': `${Math.max(0, props.gap)}px`,
}))
const track = ref<HTMLElement>()
const reducedMotion = ref(false)
let hovered = false
let animation: Animation | undefined
let reducedMotionQuery: MediaQueryList | undefined

function syncPlayback() {
  if (!animation) return
  if (props.paused || reducedMotion.value || (props.pauseOnHover && hovered)) animation.pause()
  else animation.play()
}

function createAnimation() {
  animation?.cancel()
  animation = undefined
  if (!track.value || reducedMotion.value) return

  const gap = Math.max(0, props.gap)
  animation = track.value.animate([
    { transform: 'translateX(0)' },
    { transform: `translateX(calc(-50% - ${gap / 2}px))` },
  ], {
    duration: Math.max(3, props.duration) * 1000,
    direction: props.direction === 'right' ? 'reverse' : 'normal',
    easing: 'linear',
    iterations: Infinity,
  })
  syncPlayback()
}

function enter() {
  hovered = true
  syncPlayback()
}

function leave() {
  hovered = false
  syncPlayback()
}

function onReducedMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  createAnimation()
}

watch([() => props.duration, () => props.direction, () => props.gap], createAnimation, { flush: 'post' })
watch([() => props.paused, () => props.pauseOnHover], syncPlayback)
onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', onReducedMotionChange)
  createAnimation()
})
onBeforeUnmount(() => {
  reducedMotionQuery?.removeEventListener('change', onReducedMotionChange)
  animation?.cancel()
})
</script>

<template>
  <div
    class="infinite-marquee w-full overflow-hidden"
    :class="[
      { 'is-reverse': direction === 'right', 'pause-on-hover': pauseOnHover, 'is-paused': paused, 'has-fade': fade },
      fade ? '[mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]' : '',
    ]"
    :style="marqueeStyle" role="region" :aria-label="label"
    @mouseenter="enter" @mouseleave="leave"
  >
    <div ref="track" class="marquee-track flex w-max gap-[var(--marquee-gap)] will-change-transform">
      <div class="marquee-group flex flex-none items-center gap-[var(--marquee-gap)]"><slot /></div>
      <div class="marquee-group flex flex-none items-center gap-[var(--marquee-gap)]" aria-hidden="true" inert><slot /></div>
    </div>
  </div>
</template>
