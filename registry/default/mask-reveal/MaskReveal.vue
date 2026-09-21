<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Direction = 'left' | 'right' | 'up' | 'down' | 'center'
const props = withDefaults(defineProps<{
  direction?: Direction
  duration?: number
  delay?: number
  triggerOnView?: boolean
  once?: boolean
  threshold?: number
  paused?: boolean
}>(), {
  direction: 'left',
  duration: 900,
  delay: 0,
  triggerOnView: true,
  once: true,
  threshold: 0.25,
  paused: false,
})

const emit = defineEmits<{ reveal: []; complete: [] }>()
const root = ref<HTMLElement | null>(null)
const revealed = ref(false)
const reducedMotion = ref(false)
let animation: Animation | undefined
let observer: IntersectionObserver | undefined
let motionQuery: MediaQueryList | undefined

function hiddenClip() {
  if (props.direction === 'right') return 'inset(0 0 0 100%)'
  if (props.direction === 'up') return 'inset(100% 0 0 0)'
  if (props.direction === 'down') return 'inset(0 0 100% 0)'
  if (props.direction === 'center') return 'inset(50% 50% 50% 50% round 24px)'
  return 'inset(0 100% 0 0)'
}

async function reveal() {
  if (!root.value) return
  animation?.cancel()
  revealed.value = true
  emit('reveal')
  if (reducedMotion.value) {
    root.value.style.clipPath = 'inset(0 0 0 0)'
    emit('complete')
    return
  }
  animation = root.value.animate([
    { clipPath: hiddenClip(), opacity: 0.35 },
    { clipPath: 'inset(0 0 0 0 round 0px)', opacity: 1 },
  ], { duration: Math.max(props.duration, 200), delay: Math.max(props.delay, 0), easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' })
  if (props.paused) animation.pause()
  await animation.finished.catch(() => undefined)
  if (animation?.playState === 'finished') emit('complete')
}

function reset() {
  animation?.cancel()
  animation = undefined
  revealed.value = false
  if (root.value) root.value.style.clipPath = hiddenClip()
}

function replay() {
  reset()
  requestAnimationFrame(reveal)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches && revealed.value) reveal()
}

watch(() => props.paused, value => value ? animation?.pause() : animation?.play())
watch(() => props.direction, () => { if (revealed.value) replay(); else reset() })

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  if (props.triggerOnView) {
    observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !revealed.value) reveal()
      else if (!entry?.isIntersecting && !props.once) reset()
    }, { threshold: props.threshold })
    if (root.value) observer.observe(root.value)
  } else reveal()
})
onBeforeUnmount(() => { animation?.cancel(); observer?.disconnect(); motionQuery?.removeEventListener('change', handleMotionChange) })
defineExpose({ reveal, reset, replay })
</script>

<template>
  <div ref="root" class="mask-reveal" :data-revealed="revealed ? '' : undefined"><slot /></div>
</template>
