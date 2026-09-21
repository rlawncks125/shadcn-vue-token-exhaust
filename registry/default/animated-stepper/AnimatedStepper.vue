<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface AnimatedStepperStep {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  steps: AnimatedStepperStep[]
  orientation?: 'horizontal' | 'vertical'
  duration?: number
  linear?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  orientation: 'horizontal',
  duration: 360,
  linear: false,
  disabled: false,
  ariaLabel: 'Progress steps',
})

const model = defineModel<number>({ default: 0 })
const emit = defineEmits<{
  change: [next: number, previous: number]
}>()

const buttons = new Map<number, HTMLButtonElement>()
const rovingIndex = ref(0)

const currentIndex = computed(() => {
  if (!props.steps.length) return -1
  const value = Number.isFinite(model.value) ? Math.floor(model.value) : 0
  return Math.min(props.steps.length - 1, Math.max(0, value))
})

const nextEnabledIndex = computed(() => props.steps.findIndex((step, index) => index > currentIndex.value && !step.disabled))
const interactiveIndices = computed(() => {
  if (props.disabled) return []

  return props.steps.reduce<number[]>((indices, step, index) => {
    const allowedByLinear = !props.linear || index <= currentIndex.value || index === nextEnabledIndex.value
    if (!step.disabled && allowedByLinear) indices.push(index)
    return indices
  }, [])
})

const rootStyle = computed(() => ({
  '--stepper-duration': `${Math.max(0, Number.isFinite(props.duration) ? props.duration : 0)}ms`,
}))

function stateFor(index: number) {
  if (index < currentIndex.value) return 'completed'
  if (index === currentIndex.value) return 'current'
  return 'upcoming'
}

function isUnavailable(index: number) {
  return !interactiveIndices.value.includes(index)
}

function setButton(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) buttons.set(index, element)
  else buttons.delete(index)
}

function select(index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= props.steps.length || isUnavailable(index)) return false

  const previous = currentIndex.value
  rovingIndex.value = index
  if (index === previous) return true

  model.value = index
  emit('change', index, previous)
  return true
}

function moveFocus(index: number) {
  rovingIndex.value = index
  nextTick(() => buttons.get(index)?.focus())
}

function moveRovingFocus(from: number, direction: 1 | -1) {
  const indices = interactiveIndices.value
  if (!indices.length) return

  const position = indices.indexOf(from)
  const fallback = direction === 1 ? -1 : 0
  const nextPosition = (Math.max(position, fallback) + direction + indices.length) % indices.length
  moveFocus(indices[nextPosition]!)
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    moveRovingFocus(index, 1)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    moveRovingFocus(index, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    const first = interactiveIndices.value[0]
    if (first !== undefined) moveFocus(first)
  } else if (event.key === 'End') {
    event.preventDefault()
    const last = interactiveIndices.value.at(-1)
    if (last !== undefined) moveFocus(last)
  }
}

function goTo(index: number) {
  select(Math.floor(index))
}

function next() {
  const index = props.steps.findIndex((step, stepIndex) => stepIndex > currentIndex.value && !step.disabled)
  if (index >= 0) select(index)
}

function previous() {
  for (let index = currentIndex.value - 1; index >= 0; index -= 1) {
    if (!props.steps[index]?.disabled) {
      select(index)
      return
    }
  }
}

function focusCurrent() {
  const target = interactiveIndices.value.includes(currentIndex.value) ? currentIndex.value : rovingIndex.value
  if (interactiveIndices.value.includes(target)) moveFocus(target)
}

function stepAriaLabel(step: AnimatedStepperStep, index: number) {
  const state = stateFor(index)
  return `Step ${index + 1} of ${props.steps.length}: ${step.label}, ${state}`
}

watch([currentIndex, interactiveIndices], ([index, indices]) => {
  if (!indices.length) {
    rovingIndex.value = -1
    return
  }
  if (indices.includes(index)) {
    rovingIndex.value = index
    return
  }
  rovingIndex.value = indices.find(candidate => candidate >= index) ?? indices.at(-1)!
}, { immediate: true })

defineExpose({ next, previous, goTo, focusCurrent })
</script>

<template>
  <ol
    class="animated-stepper m-0 flex w-full list-none p-0 text-foreground"
    :class="orientation === 'vertical' ? 'flex-col' : 'flex-row'"
    :style="rootStyle"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :data-orientation="orientation"
    :data-current-index="currentIndex"
    data-testid="animated-stepper"
  >
    <li
      v-for="(step, index) in steps"
      :key="step.id"
      class="relative min-w-0"
      :class="orientation === 'vertical' ? 'pb-5 last:pb-0' : 'flex-1'"
      :data-state="stateFor(index)"
    >
      <span
        v-if="index < steps.length - 1"
        aria-hidden="true"
        class="absolute overflow-hidden bg-border"
        :class="orientation === 'vertical'
          ? 'bottom-[-1.25rem] left-5 top-10 w-0.5'
          : 'left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-[1.1875rem] h-0.5'"
      >
        <span
          class="animated-stepper-connector block size-full origin-top-left bg-[var(--registry-accent,#d9ff57)] transition-transform ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
          :class="[
            orientation === 'vertical' ? 'origin-top' : 'origin-left',
            index < currentIndex
              ? (orientation === 'vertical' ? 'scale-y-100' : 'scale-x-100')
              : (orientation === 'vertical' ? 'scale-y-0' : 'scale-x-0'),
          ]"
        />
      </span>

      <button
        :ref="element => setButton(element, index)"
        type="button"
        class="group relative z-10 flex w-full cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-inherit outline-none disabled:cursor-not-allowed disabled:opacity-40"
        :class="orientation === 'vertical' ? 'items-start gap-4' : 'flex-col items-center gap-2.5 px-1 text-center'"
        :disabled="isUnavailable(index)"
        :tabindex="index === rovingIndex && !isUnavailable(index) ? 0 : -1"
        :aria-current="index === currentIndex ? 'step' : undefined"
        :aria-label="stepAriaLabel(step, index)"
        :data-state="stateFor(index)"
        :data-step-id="step.id"
        :data-testid="index === currentIndex ? 'animated-stepper-current' : undefined"
        @click="select(index)"
        @focus="rovingIndex = index"
        @keydown="onKeydown($event, index)"
      >
        <span
          class="animated-stepper-indicator grid size-10 shrink-0 place-items-center rounded-full border-2 text-xs font-bold tabular-nums transition-[color,background-color,border-color,box-shadow,transform] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-[var(--registry-accent,#d9ff57)]/25 motion-reduce:transition-none"
          :class="stateFor(index) === 'completed'
            ? 'border-[var(--registry-accent,#d9ff57)] bg-[var(--registry-accent,#d9ff57)] text-[#171814]'
            : stateFor(index) === 'current'
              ? 'scale-105 border-foreground bg-foreground text-background shadow-[0_0_0_5px_var(--registry-accent,#d9ff57)]'
              : 'border-border bg-background text-muted-foreground'"
        >
          <svg v-if="stateFor(index) === 'completed'" class="size-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 20 20" aria-hidden="true">
            <path d="m4.5 10 3.25 3.25L15.5 5.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-else-if="stateFor(index) === 'current'" class="size-2 rounded-full bg-[var(--registry-accent,#d9ff57)]" aria-hidden="true" />
          <span v-else aria-hidden="true">{{ index + 1 }}</span>
        </span>

        <span class="min-w-0" :class="orientation === 'vertical' ? 'pt-0.5' : ''">
          <span
            class="animated-stepper-label block text-sm font-semibold leading-5 transition-colors motion-reduce:transition-none"
            :class="index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'"
          >
            {{ step.label }}
          </span>
          <span v-if="step.description" class="mt-1 block text-xs leading-5 text-muted-foreground">
            {{ step.description }}
          </span>
        </span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.animated-stepper-connector,
.animated-stepper-indicator,
.animated-stepper-label {
  transition-duration: var(--stepper-duration);
}

@media (prefers-reduced-motion: reduce) {
  .animated-stepper-connector,
  .animated-stepper-indicator,
  .animated-stepper-label {
    transition-duration: 0ms;
  }
}
</style>
