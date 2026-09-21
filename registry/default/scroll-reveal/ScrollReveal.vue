<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type ScrollRevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur'

const props = withDefaults(defineProps<{
  as?: string
  variant?: ScrollRevealVariant
  duration?: number
  delay?: number
  distance?: number
  threshold?: number
  once?: boolean
  disabled?: boolean
  easing?: string
}>(), {
  as: 'div',
  variant: 'fade-up',
  duration: 650,
  delay: 0,
  distance: 28,
  threshold: 0.2,
  once: true,
  disabled: false,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
})

const emit = defineEmits<{
  reveal: []
  hidden: []
}>()

const element = ref<HTMLElement | null>(null)
const revealed = ref(false)
const reducedMotion = ref(false)

let observer: IntersectionObserver | undefined
let animation: Animation | undefined
let motionQuery: MediaQueryList | undefined

function initialFrame(): Keyframe {
  const distance = `${Math.max(props.distance, 0)}px`
  const frame: Keyframe = { opacity: 0, transform: 'none', filter: 'blur(0px)' }

  if (props.variant === 'fade-up') frame.transform = `translateY(${distance})`
  else if (props.variant === 'fade-down') frame.transform = `translateY(-${distance})`
  else if (props.variant === 'fade-left') frame.transform = `translateX(${distance})`
  else if (props.variant === 'fade-right') frame.transform = `translateX(-${distance})`
  else if (props.variant === 'scale') frame.transform = 'scale(0.92)'
  else if (props.variant === 'blur') {
    frame.transform = 'scale(0.97)'
    frame.filter = 'blur(12px)'
  }

  return frame
}

function cancelAnimation() {
  animation?.cancel()
  animation = undefined
}

function applyFrame(frame: Keyframe) {
  if (!element.value) return
  element.value.style.opacity = String(frame.opacity ?? '')
  element.value.style.transform = String(frame.transform ?? '')
  element.value.style.filter = String(frame.filter ?? '')
}

function showImmediately() {
  cancelAnimation()
  revealed.value = true
  applyFrame({ opacity: 1, transform: 'none', filter: 'blur(0px)' })
  if (element.value) element.value.style.willChange = ''
}

function hide() {
  cancelAnimation()
  revealed.value = false
  applyFrame(initialFrame())
}

function reveal() {
  if (!element.value || revealed.value) return
  if (props.disabled || reducedMotion.value) {
    showImmediately()
    return
  }

  cancelAnimation()
  element.value.style.willChange = 'transform, opacity, filter'
  animation = element.value.animate([
    initialFrame(),
    { opacity: 1, transform: 'none', filter: 'blur(0px)' },
  ], {
    duration: Math.max(props.duration, 0),
    delay: Math.max(props.delay, 0),
    easing: props.easing,
    fill: 'both',
  })

  const activeAnimation = animation
  activeAnimation.finished.then(() => {
    if (animation !== activeAnimation) return
    applyFrame({ opacity: 1, transform: 'none', filter: 'blur(0px)' })
    element.value && (element.value.style.willChange = '')
    animation = undefined
    activeAnimation.cancel()
    revealed.value = true
    emit('reveal')
  }).catch(() => undefined)
}

function setupObserver() {
  observer?.disconnect()
  observer = undefined
  cancelAnimation()

  if (!element.value) return
  if (props.disabled || reducedMotion.value) {
    showImmediately()
    return
  }

  hide()
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      reveal()
      if (props.once) observer?.unobserve(entry.target)
    } else if (!props.once) {
      const wasRevealed = revealed.value
      hide()
      if (wasRevealed) emit('hidden')
    }
  }, { threshold: Math.min(Math.max(props.threshold, 0), 1) })
  observer.observe(element.value)
}

function replay() {
  if (props.disabled || reducedMotion.value) {
    showImmediately()
    return
  }
  hide()
  reveal()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  setupObserver()
}

watch(
  () => [props.variant, props.duration, props.delay, props.distance, props.threshold, props.once, props.disabled, props.easing],
  setupObserver,
)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimation()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay, reset: setupObserver, revealed })
</script>

<template>
  <component
    :is="as"
    ref="element"
    class="scroll-reveal"
    :data-revealed="revealed ? '' : undefined"
  >
    <slot :revealed="revealed" :replay="replay" />
  </component>
</template>
