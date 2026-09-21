<script setup lang="ts">
import { computed, ref } from 'vue'

type Direction = 'top' | 'right' | 'bottom' | 'left'

const props = withDefaults(defineProps<{
  label?: string
  duration?: number
  accent?: string
  disabled?: boolean
}>(), {
  label: 'Interactive card',
  duration: 420,
  accent: 'var(--registry-accent, #d9ff57)',
  disabled: false,
})

const emit = defineEmits<{
  enter: [direction: Direction]
  leave: [direction: Direction]
  activate: []
}>()

const active = ref(false)
const direction = ref<Direction>('bottom')
const safeDuration = computed(() => Math.min(Math.max(props.duration, 0), 2000))

const hiddenTransforms: Record<Direction, string> = {
  top: 'translate3d(0, -102%, 0)',
  right: 'translate3d(102%, 0, 0)',
  bottom: 'translate3d(0, 102%, 0)',
  left: 'translate3d(-102%, 0, 0)',
}

const overlayStyle = computed(() => ({
  background: props.accent,
  transform: active.value ? 'translate3d(0, 0, 0)' : hiddenTransforms[direction.value],
  transitionDuration: `${safeDuration.value}ms`,
}))

function eventDirection(event: PointerEvent): Direction {
  const element = event.currentTarget as HTMLElement
  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left - rect.width / 2
  const y = event.clientY - rect.top - rect.height / 2
  const angle = Math.atan2(y, x) * 180 / Math.PI
  if (angle >= -45 && angle < 45) return 'right'
  if (angle >= 45 && angle < 135) return 'bottom'
  if (angle >= -135 && angle < -45) return 'top'
  return 'left'
}

function handleEnter(event: PointerEvent) {
  if (props.disabled) return
  direction.value = eventDirection(event)
  active.value = true
  emit('enter', direction.value)
}

function handleLeave(event: PointerEvent) {
  if (props.disabled) return
  direction.value = eventDirection(event)
  active.value = false
  emit('leave', direction.value)
}

function handleFocus() {
  if (props.disabled) return
  direction.value = 'bottom'
  active.value = true
}

function handleBlur() {
  active.value = false
}

function activate() {
  if (!props.disabled) emit('activate')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  activate()
}
</script>

<template>
  <div
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-disabled="disabled"
    :data-direction="direction"
    :data-active="active ? '' : undefined"
    class="direction-aware-card group relative isolate min-h-64 overflow-hidden rounded-3xl border border-foreground/10 bg-card text-card-foreground outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-4 focus-visible:ring-primary/25 motion-reduce:transition-none"
    :class="disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:shadow-xl'"
    @pointerenter="handleEnter"
    @pointerleave="handleLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="activate"
    @keydown="handleKeydown"
  >
    <div class="relative z-10 h-full transition-colors duration-300 group-data-[active]:text-[var(--registry-accent-foreground,#171814)] motion-reduce:transition-none">
      <slot :active="active" :direction="direction" />
    </div>
    <div
      class="pointer-events-none absolute inset-0 z-0 will-change-transform motion-reduce:transform-none! motion-reduce:opacity-15"
      :style="overlayStyle"
      aria-hidden="true"
    />
    <div class="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-data-[active]:opacity-100 motion-reduce:transition-none">
      <slot name="overlay" :direction="direction" />
    </div>
  </div>
</template>
