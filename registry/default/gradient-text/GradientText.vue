<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  colors?: string[]
  duration?: number
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  reverse?: boolean
  paused?: boolean
  pauseOnHover?: boolean
}>(), {
  text: 'Color in motion',
  colors: () => ['#a78bfa', '#38bdf8', 'var(--registry-accent, #d9ff57)', '#fb7185'],
  duration: 5000,
  direction: 'horizontal',
  reverse: false,
  paused: false,
  pauseOnHover: true,
})

const element = ref<HTMLElement | null>(null)
const hovering = ref(false)
const reducedMotion = ref(false)
const gradient = computed(() => {
  const angle = props.direction === 'vertical' ? '180deg' : props.direction === 'diagonal' ? '135deg' : '90deg'
  const palette = props.colors.length ? props.colors : ['currentColor', 'currentColor']
  return `linear-gradient(${angle}, ${[...palette, palette[0]].join(', ')})`
})

let animation: Animation | undefined
let motionQuery: MediaQueryList | undefined

function positions() {
  if (props.direction === 'vertical') return props.reverse ? ['0% 100%', '0% 0%'] : ['0% 0%', '0% 100%']
  if (props.direction === 'diagonal') return props.reverse ? ['100% 100%', '0% 0%'] : ['0% 0%', '100% 100%']
  return props.reverse ? ['100% 0%', '0% 0%'] : ['0% 0%', '100% 0%']
}

function syncPlayback() {
  if (!animation) return
  if (props.paused || hovering.value || reducedMotion.value) animation.pause()
  else animation.play()
}

function createAnimation() {
  animation?.cancel()
  animation = undefined
  if (!element.value || reducedMotion.value) return
  const [from, to] = positions()
  animation = element.value.animate([{ backgroundPosition: from }, { backgroundPosition: to }], {
    duration: Math.max(props.duration, 400),
    iterations: Infinity,
    easing: 'linear',
  })
  syncPlayback()
}

function replay() {
  createAnimation()
}

function handleHover(value: boolean) {
  if (!props.pauseOnHover) return
  hovering.value = value
  syncPlayback()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  createAnimation()
}

watch(() => [props.duration, props.direction, props.reverse], createAnimation)
watch(() => props.paused, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  createAnimation()
})

onBeforeUnmount(() => {
  animation?.cancel()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay })
</script>

<template>
  <span
    ref="element"
    class="gradient-text inline-block bg-clip-text text-transparent"
    :style="{ backgroundImage: gradient, backgroundSize: direction === 'vertical' ? '100% 300%' : '300% 300%' }"
    @mouseenter="handleHover(true)"
    @mouseleave="handleHover(false)"
  ><slot>{{ text }}</slot></span>
</template>
