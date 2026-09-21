<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })

type RippleSource = 'pointer' | 'keyboard'

interface RippleDetail {
  x: number
  y: number
  id: number
  source: RippleSource
}

interface Ripple extends RippleDetail {
  size: number
}

const props = withDefaults(defineProps<{
  color?: string
  duration?: number
  scale?: number
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  maxRipples?: number
}>(), {
  color: 'rgba(255, 255, 255, 0.38)',
  duration: 620,
  scale: 1,
  disabled: false,
  loading: false,
  type: 'button',
  ariaLabel: undefined,
  maxRipples: 6,
})

const emit = defineEmits<{
  ripple: [detail: RippleDetail]
  click: [event: MouseEvent]
  clear: []
}>()

const button = ref<HTMLButtonElement | null>(null)
const ripples = ref<Ripple[]>([])
const reducedMotion = ref(false)
const timers = new Map<number, ReturnType<typeof setTimeout>>()

let sequence = 0
let motionQuery: MediaQueryList | undefined

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 620)
const safeScale = computed(() => Number.isFinite(props.scale) ? Math.max(1, props.scale) : 1)
const safeMaxRipples = computed(() => Number.isFinite(props.maxRipples) ? Math.max(1, Math.floor(props.maxRipples)) : 6)
const unavailable = computed(() => props.disabled || props.loading)

function removeRipple(id: number) {
  const timer = timers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  timers.delete(id)
  ripples.value = ripples.value.filter(item => item.id !== id)
}

function clearRipples(notify = true) {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
  ripples.value = []
  if (notify) emit('clear')
}

function createRipple(x?: number, y?: number, source: RippleSource = 'keyboard') {
  if (unavailable.value || !button.value) return

  const rect = button.value.getBoundingClientRect()
  const localX = Math.min(Math.max(typeof x === 'number' && Number.isFinite(x) ? x : rect.width / 2, 0), rect.width)
  const localY = Math.min(Math.max(typeof y === 'number' && Number.isFinite(y) ? y : rect.height / 2, 0), rect.height)
  const farthestX = Math.max(localX, rect.width - localX)
  const farthestY = Math.max(localY, rect.height - localY)
  const detail: RippleDetail = {
    x: localX,
    y: localY,
    id: ++sequence,
    source,
  }

  emit('ripple', detail)
  if (reducedMotion.value) return

  const nextRipple: Ripple = {
    ...detail,
    size: Math.max(1, Math.hypot(farthestX, farthestY) * 2),
  }

  while (ripples.value.length >= safeMaxRipples.value) {
    const oldest = ripples.value[0]
    if (!oldest) break
    removeRipple(oldest.id)
  }

  ripples.value = [...ripples.value, nextRipple]
  timers.set(nextRipple.id, setTimeout(() => removeRipple(nextRipple.id), safeDuration.value + 50))
}

function ripple(x?: number, y?: number) {
  const hasOrigin = typeof x === 'number' || typeof y === 'number'
  createRipple(x, y, hasOrigin ? 'pointer' : 'keyboard')
}

function onPointerdown(event: PointerEvent) {
  if (event.button !== 0 || unavailable.value) return
  const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
  createRipple(event.clientX - rect.left, event.clientY - rect.top, 'pointer')
}

function onKeydown(event: KeyboardEvent) {
  if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return
  createRipple(undefined, undefined, 'keyboard')
}

function onClick(event: MouseEvent) {
  emit('click', event)
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearRipples(false)
}

watch(safeMaxRipples, (limit) => {
  while (ripples.value.length > limit) {
    const oldest = ripples.value[0]
    if (!oldest) break
    removeRipple(oldest.id)
  }
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
})

onBeforeUnmount(() => {
  clearRipples(false)
  motionQuery?.removeEventListener('change', onMotionChange)
})

defineExpose({ ripple, clear: clearRipples })
</script>

<template>
  <button
    ref="button"
    v-bind="$attrs"
    :type="type"
    :disabled="unavailable"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
    :data-loading="loading ? '' : undefined"
    class="ripple-button"
    :style="{
      '--ripple-color': color,
      '--ripple-duration': `${safeDuration}ms`,
      '--ripple-scale': safeScale,
    }"
    @pointerdown="onPointerdown"
    @keydown="onKeydown"
    @click="onClick"
  >
    <span class="ripple-button__content">
      <span v-if="loading" class="ripple-button__spinner" aria-hidden="true" />
      <slot />
    </span>
    <span class="ripple-button__surface" aria-hidden="true">
      <span
        v-for="item in ripples"
        :key="item.id"
        class="ripple-button__ripple"
        :style="{
          left: `${item.x}px`,
          top: `${item.y}px`,
          width: `${item.size}px`,
          height: `${item.size}px`,
        }"
      />
    </span>
  </button>
</template>

<style scoped>
.ripple-button {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  background: #171814;
  color: #fff;
  font: inherit;
  font-weight: 650;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
  -webkit-tap-highlight-color: transparent;
}

.ripple-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px -18px rgb(0 0 0 / 70%);
}

.ripple-button:active:not(:disabled) {
  transform: translateY(0) scale(0.985);
}

.ripple-button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--ripple-color) 68%, white);
  outline-offset: 3px;
}

.ripple-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ripple-button__content {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  pointer-events: none;
}

.ripple-button__surface {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.ripple-button__ripple {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: var(--ripple-color);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-button-expand var(--ripple-duration) cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.ripple-button__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ripple-button-spin 700ms linear infinite;
}

@keyframes ripple-button-expand {
  0% {
    opacity: 0.78;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(var(--ripple-scale));
  }
}

@keyframes ripple-button-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ripple-button {
    transition: none;
  }

  .ripple-button:hover:not(:disabled),
  .ripple-button:active:not(:disabled) {
    transform: none;
  }

  .ripple-button__ripple,
  .ripple-button__spinner {
    animation: none;
  }
}
</style>
