<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  from?: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  autoplay?: boolean
}>(), {
  from: 0,
  duration: 1200,
  decimals: 0,
  prefix: '',
  suffix: '',
  autoplay: true,
})

const root = ref<HTMLElement>()
const displayed = ref(props.from)
let frame: number | undefined
let observer: IntersectionObserver | undefined

const precision = computed(() => Math.max(0, Math.min(6, Math.floor(props.decimals))))
function format(value: number) {
  const [integer, fraction] = value.toFixed(precision.value).split('.')
  const grouped = integer?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0'
  return `${props.prefix}${fraction ? `${grouped}.${fraction}` : grouped}${props.suffix}`
}

const finalText = computed(() => format(Number.isFinite(props.value) ? props.value : 0))
const displayText = computed(() => format(Number.isFinite(displayed.value) ? displayed.value : 0))

function stop() {
  if (frame !== undefined) cancelAnimationFrame(frame)
  frame = undefined
}

function play() {
  stop()
  const startValue = Number.isFinite(props.from) ? props.from : 0
  const endValue = Number.isFinite(props.value) ? props.value : 0
  displayed.value = startValue

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || props.duration <= 0) {
    displayed.value = endValue
    return
  }

  const startedAt = performance.now()
  const duration = Math.max(100, Math.min(10000, props.duration))
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = 1 - (1 - progress) ** 3
    displayed.value = startValue + (endValue - startValue) * eased
    if (progress < 1) frame = requestAnimationFrame(tick)
    else frame = undefined
  }
  frame = requestAnimationFrame(tick)
}

watch(() => props.value, () => {
  if (props.autoplay) play()
  else displayed.value = props.value
})

onMounted(() => {
  if (!props.autoplay) {
    displayed.value = props.value
    return
  }
  if (!('IntersectionObserver' in window)) return play()
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      play()
      observer?.disconnect()
    }
  }, { threshold: 0.35 })
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
})

defineExpose({ play })
</script>

<template>
  <span ref="root" class="tabular-nums" :aria-label="finalText">
    <span aria-hidden="true">{{ displayText }}</span>
  </span>
</template>
