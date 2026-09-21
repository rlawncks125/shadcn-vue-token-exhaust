<script setup lang="ts">
import { computed, ref } from 'vue'

export type FlipCardAxis = 'x' | 'y'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: boolean
  axis?: FlipCardAxis
  duration?: number
  perspective?: number
  disabled?: boolean
  ariaLabel?: string
}>(), {
  modelValue: false,
  axis: 'y',
  duration: 600,
  perspective: 1000,
  disabled: false,
  ariaLabel: 'Flip card',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [next: boolean, previous: boolean]
}>()

const button = ref<HTMLButtonElement | null>(null)

function clamp(value: number, min: number, max: number, fallback: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : fallback, min), max)
}

const safeAxis = computed<FlipCardAxis>(() => props.axis === 'x' ? 'x' : 'y')
const safeDuration = computed(() => clamp(props.duration, 0, 10000, 600))
const safePerspective = computed(() => clamp(props.perspective, 200, 4000, 1000))
const cardStyle = computed(() => ({
  '--flip-card-duration': `${safeDuration.value}ms`,
  '--flip-card-perspective': `${safePerspective.value}px`,
}))

function setFlipped(next: boolean) {
  if (props.disabled || next === props.modelValue) return
  const previous = props.modelValue
  emit('update:modelValue', next)
  emit('change', next, previous)
}

function flip() {
  setFlipped(!props.modelValue)
}

function reset() {
  setFlipped(false)
}

function focus(options?: FocusOptions) {
  button.value?.focus(options)
}

defineExpose({ flip, reset, focus })
</script>

<template>
  <button
    ref="button"
    v-bind="$attrs"
    type="button"
    class="flip-card group relative block w-full appearance-none border-0 bg-transparent p-0 text-left outline-none [perspective:var(--flip-card-perspective)] focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-4 disabled:cursor-not-allowed"
    :style="cardStyle"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :aria-pressed="modelValue"
    :data-axis="safeAxis"
    :data-flipped="modelValue"
    :data-disabled="disabled ? '' : undefined"
    @click="flip"
  >
    <span class="flip-card__inner relative grid w-full [transform-style:preserve-3d] will-change-transform">
      <span
        class="flip-card__face flip-card__front col-start-1 row-start-1 block min-w-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
        :class="{ 'pointer-events-none': modelValue }"
        :aria-hidden="modelValue"
        :inert="modelValue || undefined"
      >
        <slot name="front" />
      </span>
      <span
        class="flip-card__face flip-card__back col-start-1 row-start-1 block min-w-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
        :class="{ 'pointer-events-none': !modelValue }"
        :aria-hidden="!modelValue"
        :inert="!modelValue || undefined"
      >
        <slot name="back" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.flip-card__inner {
  transition: transform var(--flip-card-duration) cubic-bezier(0.2, 0.72, 0.2, 1);
}

.flip-card[data-axis='y'][data-flipped='true'] .flip-card__inner {
  transform: rotateY(180deg);
}

.flip-card[data-axis='x'][data-flipped='true'] .flip-card__inner {
  transform: rotateX(180deg);
}

.flip-card[data-axis='y'] .flip-card__back {
  transform: rotateY(180deg);
}

.flip-card[data-axis='x'] .flip-card__back {
  transform: rotateX(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .flip-card__inner,
  .flip-card__back {
    transform: none !important;
    transition: none;
  }

  .flip-card__face[aria-hidden='true'] {
    visibility: hidden;
  }
}
</style>
