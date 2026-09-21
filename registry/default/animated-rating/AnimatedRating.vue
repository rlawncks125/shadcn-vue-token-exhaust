<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export type AnimatedRatingSource = 'pointer' | 'keyboard'

const props = withDefaults(defineProps<{
  max?: number
  label?: string
  duration?: number
  disabled?: boolean
  readOnly?: boolean
  showValue?: boolean
  clearable?: boolean
}>(), {
  max: 5,
  label: 'Rating',
  duration: 320,
  disabled: false,
  readOnly: false,
  showValue: true,
  clearable: false,
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  select: [value: number, source: AnimatedRatingSource]
  change: [value: number, previous: number]
  clear: [previous: number]
}>()

const labelId = `animated-rating-${useId()}`
const hoveredValue = ref<number | null>(null)
const activeValue = ref(1)
const reducedMotion = ref(false)
const stars = new Map<number, SVGSVGElement>()
const animations = new Set<Animation>()
let motionQuery: MediaQueryList | undefined

const safeMax = computed(() => Number.isFinite(props.max) ? Math.max(1, Math.floor(props.max)) : 5)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 320)
const starValues = computed(() => Array.from({ length: safeMax.value }, (_, index) => index + 1))

function normalize(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(safeMax.value, Math.max(0, Math.round(value)))
}

const selectedValue = computed(() => normalize(model.value))
const previewValue = computed(() => hoveredValue.value ?? selectedValue.value)

function setStar(element: unknown, value: number) {
  if (element instanceof SVGSVGElement) stars.set(value, element)
  else stars.delete(value)
}

function cancelAnimations() {
  animations.forEach(animation => animation.cancel())
  animations.clear()
}

function animateStar(value: number) {
  if (reducedMotion.value || safeDuration.value === 0) return
  const star = stars.get(value)
  if (!star) return

  const animation = star.animate([
    { transform: 'scale(1) rotate(0deg)' },
    { transform: 'scale(1.18) rotate(-4deg)', offset: 0.42 },
    { transform: 'scale(0.97) rotate(1deg)', offset: 0.72 },
    { transform: 'scale(1) rotate(0deg)' },
  ], {
    duration: safeDuration.value,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  })

  animations.add(animation)
  const removeAnimation = () => animations.delete(animation)
  animation.addEventListener('finish', removeAnimation, { once: true })
  animation.addEventListener('cancel', removeAnimation, { once: true })
}

function select(value: number, source: AnimatedRatingSource) {
  if (props.disabled || props.readOnly) return
  const next = normalize(value)
  const previous = selectedValue.value
  hoveredValue.value = null
  activeValue.value = next || 1
  emit('select', next, source)
  animateStar(next)

  if (next === previous) return
  model.value = next
  emit('change', next, previous)
}

function clear() {
  if (props.disabled || props.readOnly || selectedValue.value === 0) return
  const previous = selectedValue.value
  hoveredValue.value = null
  activeValue.value = 1
  model.value = 0
  emit('change', 0, previous)
  emit('clear', previous)
}

function focus() {
  const value = selectedValue.value || activeValue.value || 1
  activeValue.value = Math.min(safeMax.value, Math.max(1, value))
  stars.get(activeValue.value)?.closest<HTMLButtonElement>('button')?.focus()
}

function focusStar(value: number) {
  activeValue.value = value
  stars.get(value)?.closest<HTMLButtonElement>('button')?.focus()
}

function handleKeydown(event: KeyboardEvent, value: number) {
  let next: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = value === safeMax.value ? 1 : value + 1
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = value === 1 ? safeMax.value : value - 1
  else if (event.key === 'Home') next = 1
  else if (event.key === 'End') next = safeMax.value
  if (next === undefined) return

  event.preventDefault()
  focusStar(next)
  select(next, 'keyboard')
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) cancelAnimations()
}

watch([selectedValue, safeMax], ([value, maximum]) => {
  activeValue.value = value || Math.min(activeValue.value, maximum) || 1
  if (hoveredValue.value !== null && hoveredValue.value > maximum) hoveredValue.value = null
})

watch(() => [props.disabled, props.readOnly], ([disabled, readOnly]) => {
  if (disabled || readOnly) hoveredValue.value = null
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ focus, clear })
</script>

<template>
  <div class="animated-rating inline-flex max-w-full flex-col gap-2.5 text-foreground" :class="{ 'opacity-45': disabled }">
    <div class="flex min-h-5 items-center justify-between gap-4">
      <span :id="labelId" class="text-xs font-semibold text-foreground/70">{{ label }}</span>
      <span v-if="showValue" class="text-[11px] font-semibold tabular-nums text-foreground/45" aria-hidden="true">
        {{ selectedValue }} / {{ safeMax }}
      </span>
    </div>

    <div class="flex max-w-full items-center gap-2">
      <div
        role="radiogroup"
        :aria-labelledby="labelId"
        :aria-disabled="disabled || undefined"
        :aria-readonly="readOnly || undefined"
        class="flex max-w-full items-center gap-0.5 sm:gap-1"
        @pointerleave="hoveredValue = null"
      >
        <button
          v-for="value in starValues"
          :key="value"
          type="button"
          role="radio"
          class="group grid size-9 shrink-0 touch-manipulation place-items-center rounded-lg border-0 bg-transparent p-0 text-foreground/15 outline-none transition-[color,transform] duration-150 focus-visible:bg-primary/15 focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed motion-reduce:transition-none sm:size-10"
          :class="[
            value <= previewValue ? '!text-amber-400' : '',
            !disabled && !readOnly ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default',
          ]"
          :disabled="disabled"
          :tabindex="disabled ? -1 : activeValue === value ? 0 : -1"
          :aria-checked="selectedValue === value"
          :aria-label="`${value} ${value === 1 ? 'star' : 'stars'} out of ${safeMax}`"
          @focus="activeValue = value"
          @pointerenter="!disabled && !readOnly && (hoveredValue = value)"
          @click="select(value, $event.detail === 0 ? 'keyboard' : 'pointer')"
          @keydown="handleKeydown($event, value)"
        >
          <svg
            :ref="element => setStar(element, value)"
            viewBox="0 0 24 24"
            class="size-7 origin-center fill-current stroke-current stroke-[1.7] transition-colors duration-150 motion-reduce:transition-none sm:size-8"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m12 2.75 2.84 5.76 6.36.92-4.6 4.49 1.08 6.33L12 17.26l-5.68 2.99 1.08-6.33-4.6-4.49 6.36-.92L12 2.75Z" />
          </svg>
        </button>
      </div>

      <button
        v-if="clearable"
        type="button"
        class="shrink-0 cursor-pointer rounded-full border border-foreground/10 bg-background px-2.5 py-1.5 text-[10px] font-semibold text-foreground/50 outline-none transition-[border-color,color,background-color] duration-150 hover:not-disabled:border-foreground/25 hover:not-disabled:text-foreground focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        :disabled="disabled || readOnly || selectedValue === 0"
        :aria-label="`Clear ${label.toLowerCase()}`"
        @click="clear"
      >
        Clear
      </button>
    </div>
  </div>
</template>
