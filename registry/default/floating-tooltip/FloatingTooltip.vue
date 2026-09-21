<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'

type Placement = 'top' | 'right' | 'bottom' | 'left'

const props = withDefaults(defineProps<{
  text?: string
  placement?: Placement
  delay?: number
  closeDelay?: number
  duration?: number
  disabled?: boolean
}>(), {
  text: 'Helpful context',
  placement: 'top',
  delay: 180,
  closeDelay: 70,
  duration: 220,
  disabled: false,
})

const emit = defineEmits<{
  open: []
  close: []
}>()

const tooltipId = `floating-tooltip-${useId()}`
const trigger = ref<HTMLElement | null>(null)
const tooltip = ref<HTMLElement | null>(null)
const visible = ref(false)
const reducedMotion = ref(false)
const position = ref({ left: 0, top: 0 })

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let animation: Animation | undefined
let motionQuery: MediaQueryList | undefined
let hasFocus = false
let hasPointer = false

function clearTimers() {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
}

function positionTooltip() {
  if (!trigger.value || !tooltip.value) return
  const anchor = trigger.value.getBoundingClientRect()
  const bubble = tooltip.value.getBoundingClientRect()
  const gap = 10
  let left = anchor.left + anchor.width / 2 - bubble.width / 2
  let top = anchor.top - bubble.height - gap

  if (props.placement === 'bottom') top = anchor.bottom + gap
  if (props.placement === 'left') {
    left = anchor.left - bubble.width - gap
    top = anchor.top + anchor.height / 2 - bubble.height / 2
  }
  if (props.placement === 'right') {
    left = anchor.right + gap
    top = anchor.top + anchor.height / 2 - bubble.height / 2
  }

  position.value = {
    left: Math.min(Math.max(left, 8), window.innerWidth - bubble.width - 8),
    top: Math.min(Math.max(top, 8), window.innerHeight - bubble.height - 8),
  }
}

function offsetTransform() {
  if (props.placement === 'bottom') return 'translateY(-8px) scale(0.96)'
  if (props.placement === 'left') return 'translateX(8px) scale(0.96)'
  if (props.placement === 'right') return 'translateX(-8px) scale(0.96)'
  return 'translateY(8px) scale(0.96)'
}

async function show() {
  if (props.disabled || visible.value) return
  clearTimers()
  visible.value = true
  await nextTick()
  positionTooltip()
  if (!reducedMotion.value && tooltip.value) {
    animation = tooltip.value.animate([
      { opacity: 0, transform: offsetTransform() },
      { opacity: 1, transform: 'translate(0) scale(1)' },
    ], { duration: Math.max(props.duration, 100), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
  }
  emit('open')
}

async function hide() {
  if (!visible.value) return
  clearTimers()
  if (!reducedMotion.value && tooltip.value) {
    animation?.cancel()
    animation = tooltip.value.animate([
      { opacity: 1, transform: 'translate(0) scale(1)' },
      { opacity: 0, transform: offsetTransform() },
    ], { duration: Math.max(props.duration * 0.65, 80), easing: 'ease-in' })
    await animation.finished.catch(() => undefined)
  }
  visible.value = false
  emit('close')
}

function scheduleShow() {
  clearTimers()
  openTimer = setTimeout(show, Math.max(props.delay, 0))
}

function scheduleHide() {
  clearTimers()
  closeTimer = setTimeout(hide, Math.max(props.closeDelay, 0))
}

function handlePointer(active: boolean) {
  hasPointer = active
  if (active) scheduleShow()
  else if (!hasFocus) scheduleHide()
}

function handleFocus(active: boolean) {
  hasFocus = active
  if (active) scheduleShow()
  else if (!hasPointer) scheduleHide()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && visible.value) {
    event.preventDefault()
    hide()
  }
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) animation?.finish()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  window.addEventListener('resize', positionTooltip)
  window.addEventListener('scroll', positionTooltip, true)
})

onBeforeUnmount(() => {
  clearTimers()
  animation?.cancel()
  motionQuery?.removeEventListener('change', handleMotionChange)
  window.removeEventListener('resize', positionTooltip)
  window.removeEventListener('scroll', positionTooltip, true)
})

defineExpose({ show, hide })
</script>

<template>
  <span
    ref="trigger"
    class="floating-tooltip-trigger group inline-flex outline-none"
    tabindex="0"
    :aria-describedby="visible ? tooltipId : undefined"
    @pointerenter="handlePointer(true)"
    @pointerleave="handlePointer(false)"
    @focusin="handleFocus(true)"
    @focusout="handleFocus(false)"
    @keydown="handleKeydown"
  >
    <slot />
  </span>

  <Teleport to="body">
    <span
      v-if="visible"
      :id="tooltipId"
      ref="tooltip"
      role="tooltip"
      class="floating-tooltip pointer-events-none fixed z-[110] max-w-64 rounded-xl bg-[#171814] px-3.5 py-2 text-xs font-medium leading-5 text-white shadow-xl"
      :data-placement="placement"
      :style="{ left: `${position.left}px`, top: `${position.top}px` }"
    >
      <slot name="content">{{ text }}</slot>
    </span>
  </Teleport>
</template>
