<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Trigger = 'load' | 'hover' | 'click' | 'view'

const props = withDefaults(defineProps<{
  text: string
  as?: string
  color?: string
  duration?: number
  delay?: number
  trigger?: Trigger
  once?: boolean
  thickness?: number
  disabled?: boolean
  ariaLabel?: string
}>(), {
  as: 'span',
  color: '#f2d35e',
  duration: 700,
  delay: 0,
  trigger: 'load',
  once: true,
  thickness: 0.62,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  start: []
  complete: []
}>()

const root = ref<HTMLElement | null>(null)
const highlighted = ref(false)
const reducedMotion = ref(false)
const hasPlayed = ref(false)
const running = ref(false)

let completionTimer: ReturnType<typeof setTimeout> | undefined
let resetFrame: number | undefined
let playFrame: number | undefined
let observer: IntersectionObserver | undefined
let motionQuery: MediaQueryList | undefined
let runId = 0
let mounted = false

function toNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

const safeDuration = computed(() => toNonNegative(props.duration))
const safeDelay = computed(() => toNonNegative(props.delay))
const safeThickness = computed(() => Number.isFinite(props.thickness)
  ? Math.min(1, Math.max(0, props.thickness))
  : 0.62)

const markerStyle = computed(() => ({
  '--highlight-color': props.color,
  '--highlight-duration': `${safeDuration.value}ms`,
  '--highlight-delay': `${safeDelay.value}ms`,
  '--highlight-thickness': `${safeThickness.value}em`,
}))

function cancelScheduled() {
  runId += 1
  if (completionTimer) clearTimeout(completionTimer)
  if (resetFrame !== undefined) cancelAnimationFrame(resetFrame)
  if (playFrame !== undefined) cancelAnimationFrame(playFrame)
  completionTimer = undefined
  resetFrame = undefined
  playFrame = undefined
  running.value = false
}

function finish(id: number) {
  if (id !== runId) return
  completionTimer = undefined
  running.value = false
  emit('complete')
}

async function play(force = false) {
  if (props.disabled || (props.once && hasPlayed.value && !force)) return

  cancelScheduled()
  const id = runId
  hasPlayed.value = true
  running.value = true
  highlighted.value = false
  emit('start')

  if (reducedMotion.value) {
    highlighted.value = true
    running.value = false
    emit('complete')
    return
  }

  await nextTick()
  if (id !== runId) return

  resetFrame = requestAnimationFrame(() => {
    if (id !== runId) return
    resetFrame = undefined
    playFrame = requestAnimationFrame(() => {
      if (id !== runId) return
      playFrame = undefined
      highlighted.value = true

      const total = safeDelay.value + safeDuration.value
      if (total === 0) {
        finish(id)
        return
      }
      completionTimer = setTimeout(() => finish(id), total)
    })
  })
}

function reset() {
  cancelScheduled()
  hasPlayed.value = false
  highlighted.value = props.disabled
}

function handlePointerEnter() {
  if (props.trigger === 'hover') play()
}

function handleFocus() {
  if (props.trigger === 'hover') play()
}

function handleClick() {
  if (props.trigger === 'click') play()
}

function handleKeydown(event: KeyboardEvent) {
  if (props.as === 'button' || props.trigger !== 'click' || props.disabled || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  play()
}

function disconnectObserver() {
  observer?.disconnect()
  observer = undefined
}

function observeView() {
  disconnectObserver()
  if (!mounted || props.trigger !== 'view' || props.disabled || !root.value) return

  if (!('IntersectionObserver' in window)) {
    play()
    return
  }

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) play()
      else if (!props.once) reset()
    }
  }, { threshold: 0.35 })
  observer.observe(root.value)
}

async function restartForCurrentTrigger() {
  reset()
  const id = runId
  disconnectObserver()
  if (!mounted || props.disabled) return
  await nextTick()
  if (id !== runId) return
  if (props.trigger === 'load') play()
  else if (props.trigger === 'view') observeView()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (!event.matches) return

  if (running.value) {
    cancelScheduled()
    highlighted.value = true
    hasPlayed.value = true
    emit('complete')
  }
}

watch(() => [props.text, props.trigger, props.disabled] as const, restartForCurrentTrigger)

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)

  if (props.disabled) highlighted.value = true
  else if (props.trigger === 'load') play()
  else if (props.trigger === 'view') observeView()
})

onBeforeUnmount(() => {
  mounted = false
  cancelScheduled()
  disconnectObserver()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({
  replay: () => play(true),
  reset,
})
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="animated-text-highlight"
    :class="{
      'is-highlighted': highlighted || disabled,
      'is-clickable': trigger === 'click' && !disabled,
    }"
    :style="markerStyle"
    :role="trigger === 'click' ? 'button' : undefined"
    :type="as === 'button' ? 'button' : undefined"
    :disabled="as === 'button' && trigger === 'click' ? disabled : undefined"
    :tabindex="trigger === 'click' && !disabled ? 0 : undefined"
    :aria-label="ariaLabel"
    :aria-disabled="trigger === 'click' ? disabled : undefined"
    :data-state="highlighted || disabled ? 'highlighted' : 'idle'"
    @pointerenter="handlePointerEnter"
    @focus="handleFocus"
    @click="handleClick"
    @keydown="handleKeydown"
  >{{ text }}</component>
</template>

<style scoped>
.animated-text-highlight {
  display: inline;
  background-image: linear-gradient(var(--highlight-color), var(--highlight-color));
  background-position: 0 84%;
  background-repeat: no-repeat;
  background-size: 0% var(--highlight-thickness);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: background-size var(--highlight-duration) cubic-bezier(0.22, 1, 0.36, 1) var(--highlight-delay);
}

.animated-text-highlight.is-highlighted {
  background-size: 100% var(--highlight-thickness);
}

.animated-text-highlight.is-clickable {
  cursor: pointer;
  outline: none;
}

.animated-text-highlight.is-clickable:focus-visible {
  border-radius: 0.125em;
  box-shadow: 0 0 0 0.1em color-mix(in srgb, var(--highlight-color) 55%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .animated-text-highlight {
    transition: none;
  }
}
</style>
