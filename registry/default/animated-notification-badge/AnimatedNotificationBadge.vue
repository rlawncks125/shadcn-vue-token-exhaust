<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedNotificationBadgeAnimationDetail {
  count: number
  previousCount: number
  direction: 'increase' | 'decrease' | 'replay'
}

const props = withDefaults(defineProps<{
  count?: number
  max?: number
  showZero?: boolean
  pulse?: boolean
  duration?: number
  color?: string
  disabled?: boolean
  ariaLabel?: string
  type?: 'button' | 'submit' | 'reset'
}>(), {
  count: 0,
  max: 99,
  showZero: false,
  pulse: true,
  duration: 420,
  color: '#ef4444',
  disabled: false,
  ariaLabel: 'Notifications',
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  animate: [detail: AnimatedNotificationBadgeAnimationDetail]
}>()

const button = ref<HTMLButtonElement | null>(null)
const attending = ref(false)
const animationKey = ref(0)
const reducedMotion = ref(false)
const statusId = `notification-status-${useId()}`

let mounted = false
let firstFrame: number | undefined
let secondFrame: number | undefined
let animationTimer: ReturnType<typeof setTimeout> | undefined
let motionQuery: MediaQueryList | undefined

const safeCount = computed(() => {
  if (!Number.isFinite(props.count)) return 0
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(props.count)))
})
const safeMax = computed(() => {
  if (!Number.isFinite(props.max)) return 99
  return Math.min(9999, Math.max(1, Math.round(props.max)))
})
const safeDuration = computed(() => {
  if (!Number.isFinite(props.duration)) return 420
  return Math.min(5000, Math.max(0, Math.round(props.duration)))
})
const safeColor = computed(() => props.color.trim() || '#ef4444')
const safeAriaLabel = computed(() => props.ariaLabel.trim() || 'Notifications')
const badgeVisible = computed(() => props.showZero || safeCount.value > 0)
const displayCount = computed(() => safeCount.value > safeMax.value ? `${safeMax.value}+` : String(safeCount.value))
const statusMessage = computed(() => {
  if (safeCount.value === 0) return 'No unread notifications.'
  return `${safeCount.value} unread notification${safeCount.value === 1 ? '' : 's'}.`
})
const rootStyle = computed(() => ({
  '--notification-color': safeColor.value,
  '--notification-duration': `${safeDuration.value}ms`,
}))

function clearAnimationCycle() {
  if (firstFrame !== undefined) cancelAnimationFrame(firstFrame)
  if (secondFrame !== undefined) cancelAnimationFrame(secondFrame)
  if (animationTimer !== undefined) clearTimeout(animationTimer)
  firstFrame = undefined
  secondFrame = undefined
  animationTimer = undefined
  attending.value = false
}

function runAnimation(previousCount: number, direction: AnimatedNotificationBadgeAnimationDetail['direction']) {
  clearAnimationCycle()
  animationKey.value++
  emit('animate', { count: safeCount.value, previousCount, direction })

  if (!props.pulse || reducedMotion.value || safeDuration.value === 0) return

  // Two frames reliably restart the attention animation after rapid count changes.
  firstFrame = requestAnimationFrame(() => {
    firstFrame = undefined
    secondFrame = requestAnimationFrame(() => {
      secondFrame = undefined
      attending.value = true
      animationTimer = setTimeout(() => {
        attending.value = false
        animationTimer = undefined
      }, safeDuration.value)
    })
  })
}

function replay() {
  runAnimation(safeCount.value, 'replay')
}

function focus(options?: FocusOptions) {
  button.value?.focus(options)
}

function handleClick(event: MouseEvent) {
  emit('click', event)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearAnimationCycle()
}

watch(safeCount, (count, previousCount) => {
  if (!mounted || count === previousCount) return
  runAnimation(previousCount, count > previousCount ? 'increase' : 'decrease')
})

onMounted(() => {
  mounted = true
  if (!window.matchMedia) return
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  mounted = false
  clearAnimationCycle()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ replay, focus })
</script>

<template>
  <span
    class="animated-notification-badge relative inline-flex align-middle"
    :class="{ 'is-attending': attending }"
    :style="rootStyle"
  >
    <button
      ref="button"
      :type="type"
      data-testid="animated-notification-badge"
      class="animated-notification-badge__trigger relative inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full border border-foreground/10 bg-background p-2.5 text-foreground shadow-sm outline-none transition-[color,background-color,border-color,box-shadow,transform] hover:not-disabled:border-foreground/20 hover:not-disabled:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
      :disabled="disabled"
      :aria-label="safeAriaLabel"
      :aria-describedby="statusId"
      @click="handleClick"
    >
      <span class="animated-notification-badge__content inline-flex items-center justify-center" aria-hidden="true">
        <slot>
          <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </slot>
      </span>

      <Transition name="notification-count" mode="out-in">
        <span
          v-if="badgeVisible"
          :key="`${displayCount}-${animationKey}`"
          class="animated-notification-badge__count absolute -right-1.5 -top-1.5 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background px-1 text-[10px] font-bold leading-none tabular-nums text-white shadow-sm"
          aria-hidden="true"
        >
          {{ displayCount }}
        </span>
      </Transition>
    </button>

    <span :id="statusId" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusMessage }}</span>
  </span>
</template>

<style scoped>
.animated-notification-badge__count {
  background-color: var(--notification-color);
}

.animated-notification-badge.is-attending .animated-notification-badge__trigger {
  animation: notification-trigger-attention var(--notification-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.animated-notification-badge.is-attending .animated-notification-badge__content {
  animation: notification-content-attention var(--notification-duration) ease-in-out;
  transform-origin: 50% 10%;
}

.animated-notification-badge.is-attending .animated-notification-badge__count::after {
  animation: notification-badge-pulse var(--notification-duration) ease-out;
  border: 2px solid var(--notification-color);
  border-radius: inherit;
  content: '';
  inset: -2px;
  pointer-events: none;
  position: absolute;
}

.notification-count-enter-active,
.notification-count-leave-active {
  transition: opacity calc(var(--notification-duration) / 2) ease, transform calc(var(--notification-duration) / 2) cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-count-enter-from {
  opacity: 0;
  transform: translateY(5px) scale(0.72);
}

.notification-count-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.72);
}

@keyframes notification-trigger-attention {
  0%, 100% { transform: scale(1); }
  32% { transform: scale(0.94); }
  68% { transform: scale(1.06); }
}

@keyframes notification-content-attention {
  0%, 100% { transform: rotate(0deg); }
  24% { transform: rotate(13deg); }
  48% { transform: rotate(-11deg); }
  70% { transform: rotate(6deg); }
}

@keyframes notification-badge-pulse {
  from { opacity: 0.65; transform: scale(0.85); }
  to { opacity: 0; transform: scale(1.8); }
}

@media (prefers-reduced-motion: reduce) {
  .animated-notification-badge.is-attending .animated-notification-badge__trigger,
  .animated-notification-badge.is-attending .animated-notification-badge__content,
  .animated-notification-badge.is-attending .animated-notification-badge__count::after {
    animation: none;
  }

  .notification-count-enter-active,
  .notification-count-leave-active {
    transition: none;
  }
}
</style>
