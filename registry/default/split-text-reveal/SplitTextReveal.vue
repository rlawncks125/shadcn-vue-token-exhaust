<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Direction = 'up' | 'down' | 'left' | 'right'
type Trigger = 'load' | 'hover' | 'click'

const props = withDefaults(defineProps<{
  text: string
  as?: string
  direction?: Direction
  trigger?: Trigger
  duration?: number
  stagger?: number
  once?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  as: 'span',
  direction: 'up',
  trigger: 'load',
  duration: 560,
  stagger: 34,
  once: false,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  start: []
  complete: []
}>()

const revealed = ref(true)
const reducedMotion = ref(false)
const hasPlayed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let revealFrame: number | undefined
let settleFrame: number | undefined
let motionQuery: MediaQueryList | undefined

const segments = computed(() => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(props.text), item => item.segment)
  }
  return Array.from(props.text)
})

const safeDuration = computed(() => Math.min(Math.max(props.duration, 0), 3000))
const safeStagger = computed(() => Math.min(Math.max(props.stagger, 0), 300))
const hiddenTransform = computed(() => ({
  up: 'translate3d(0, 115%, 0) rotate(4deg)',
  down: 'translate3d(0, -115%, 0) rotate(-4deg)',
  left: 'translate3d(115%, 0, 0) rotate(4deg)',
  right: 'translate3d(-115%, 0, 0) rotate(-4deg)',
})[props.direction])

function clearAnimation() {
  if (timer) clearTimeout(timer)
  if (revealFrame) cancelAnimationFrame(revealFrame)
  if (settleFrame) cancelAnimationFrame(settleFrame)
  timer = undefined
  revealFrame = undefined
  settleFrame = undefined
}

async function replay(force = false) {
  if (props.disabled || reducedMotion.value || (props.once && hasPlayed.value && !force)) {
    revealed.value = true
    return
  }
  clearAnimation()
  revealed.value = false
  emit('start')
  await nextTick()
  revealFrame = requestAnimationFrame(() => {
    settleFrame = requestAnimationFrame(() => {
      revealed.value = true
      const total = safeDuration.value + Math.max(segments.value.length - 1, 0) * safeStagger.value
      timer = setTimeout(() => {
        hasPlayed.value = true
        emit('complete')
      }, total)
    })
  })
}

function handlePointerEnter() {
  if (props.trigger === 'hover') replay()
}

function handleClick() {
  if (props.trigger === 'click') replay()
}

function handleKeydown(event: KeyboardEvent) {
  if (props.trigger !== 'click' || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  replay()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) {
    clearAnimation()
    revealed.value = true
  }
}

watch(() => props.text, () => {
  hasPlayed.value = false
  if (props.trigger === 'load') replay(true)
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  if (props.trigger === 'load') replay(true)
})

onBeforeUnmount(() => {
  clearAnimation()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay: () => replay(true) })
</script>

<template>
  <component
    :is="as"
    class="split-text-reveal inline-flex flex-wrap"
    :class="trigger === 'click' && !disabled ? 'cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-primary/25' : ''"
    :role="trigger === 'click' ? 'button' : undefined"
    :tabindex="trigger === 'click' && !disabled ? 0 : undefined"
    :aria-label="ariaLabel || text"
    :aria-disabled="trigger === 'click' ? disabled : undefined"
    :data-revealed="revealed ? '' : undefined"
    @pointerenter="handlePointerEnter"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span
      v-for="(segment, index) in segments"
      :key="`${segment}-${index}`"
      class="inline-block overflow-hidden align-bottom"
      aria-hidden="true"
    >
      <span
        class="split-text-reveal__segment inline-block will-change-transform motion-reduce:transform-none! motion-reduce:opacity-100!"
        :class="revealed || disabled ? 'is-visible' : ''"
        :style="{ '--split-hidden': hiddenTransform, '--split-duration': `${safeDuration}ms`, '--split-delay': `${index * safeStagger}ms` }"
      >{{ segment === ' ' ? '\u00a0' : segment }}</span>
    </span>
  </component>
</template>

<style scoped>
.split-text-reveal__segment {
  opacity: 0;
  transform: var(--split-hidden);
  transition-property: transform, opacity;
  transition-duration: var(--split-duration);
  transition-delay: var(--split-delay);
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.split-text-reveal__segment.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) rotate(0);
}
</style>
