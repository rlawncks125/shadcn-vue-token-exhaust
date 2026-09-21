<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  duration?: number
  showValue?: boolean
  formatValue?: (value: number) => string
}>(), {
  defaultValue: 50,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  label: 'Value',
  duration: 360,
  showValue: true,
  formatValue: (value: number) => String(value),
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const input = ref<HTMLInputElement | null>(null)
const thumb = ref<HTMLElement | null>(null)
const bubble = ref<HTMLElement | null>(null)
const internalValue = ref(props.defaultValue)
const dragging = ref(false)
const reducedMotion = ref(false)
const value = computed(() => props.modelValue ?? internalValue.value)
const percentage = computed(() => Math.min(Math.max((value.value - props.min) / Math.max(props.max - props.min, 1) * 100, 0), 100))

let lastValue = value.value
let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function clearAnimations() {
  animations.forEach(animation => animation.cancel())
  animations = []
}

function animateValue(next: number) {
  clearAnimations()
  if (reducedMotion.value || !thumb.value) return
  const direction = next >= lastValue ? 1 : -1
  thumb.value.style.transformOrigin = direction > 0 ? 'left center' : 'right center'
  animations.push(thumb.value.animate([
    { transform: 'translateX(-50%) scale(1)' },
    { transform: `translateX(-50%) scale(${1.24 + Math.min(Math.abs(next - lastValue) / 100, 0.16)}, 0.78)`, offset: 0.35 },
    { transform: 'translateX(-50%) scale(0.94, 1.08)', offset: 0.7 },
    { transform: 'translateX(-50%) scale(1)' },
  ], { duration: Math.max(props.duration, 180), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))
  if (bubble.value) {
    animations.push(bubble.value.animate([
      { transform: 'translate(-50%, 5px) scale(0.9)', opacity: 0.35 },
      { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
    ], { duration: Math.max(props.duration * 0.7, 140), easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))
  }
}

function update(next: number) {
  if (props.disabled) return
  animateValue(next)
  lastValue = next
  internalValue.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function handleInput(event: Event) {
  update(Number((event.target as HTMLInputElement).value))
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearAnimations()
}

function focus() {
  input.value?.focus()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  clearAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ focus })
</script>

<template>
  <label class="elastic-slider block w-full" :class="{ 'opacity-45': disabled }">
    <span class="mb-8 flex items-center justify-between gap-4 text-sm font-medium text-foreground">
      <span><slot name="label">{{ label }}</slot></span>
      <span class="tabular-nums text-foreground/50">{{ formatValue(value) }}</span>
    </span>
    <span class="relative block h-8">
      <span class="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
        <span class="elastic-slider-fill block h-full rounded-full bg-foreground" :style="{ width: `${percentage}%` }" />
      </span>
      <span
        ref="thumb"
        class="elastic-slider-thumb pointer-events-none absolute top-1/2 z-[2] size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-foreground shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
        :style="{ left: `${percentage}%` }"
        aria-hidden="true"
      >
        <span v-if="showValue" ref="bubble" class="elastic-slider-bubble absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-semibold tabular-nums text-background" :class="dragging ? 'opacity-100' : 'opacity-0'">{{ formatValue(value) }}</span>
      </span>
      <input
        ref="input"
        type="range"
        class="peer absolute inset-0 z-[3] m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        :min="min"
        :max="max"
        :step="step"
        :value="value"
        :disabled="disabled"
        :aria-label="label"
        @input="handleInput"
        @pointerdown="dragging = true"
        @pointerup="dragging = false"
        @pointercancel="dragging = false"
        @focus="dragging = true"
        @blur="dragging = false"
      >
      <span class="pointer-events-none absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-full peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20" aria-hidden="true" />
    </span>
  </label>
</template>
