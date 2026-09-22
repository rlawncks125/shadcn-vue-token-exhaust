<script setup lang="ts">
import { computed, ref } from 'vue'

export interface AnimatedMobileOnboardingStep {
  id: string
  title: string
  description: string
  eyebrow?: string
  icon?: string
  accent?: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  steps: AnimatedMobileOnboardingStep[]
  label?: string
  nextLabel?: string
  completeLabel?: string
  skipLabel?: string
  duration?: number
  swipeThreshold?: number
  swipe?: boolean
  loop?: boolean
  showBack?: boolean
  showSkip?: boolean
  showProgress?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  label: 'Getting started',
  nextLabel: 'Continue',
  completeLabel: 'Get started',
  skipLabel: 'Skip',
  duration: 320,
  swipeThreshold: 72,
  swipe: true,
  loop: false,
  showBack: true,
  showSkip: true,
  showProgress: true,
  safeArea: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [step: AnimatedMobileOnboardingStep, index: number]
  complete: [step: AnimatedMobileOnboardingStep]
  skip: [step: AnimatedMobileOnboardingStep, index: number]
}>()

const root = ref<HTMLElement>()
const direction = ref<1 | -1>(1)
const dragOffset = ref(0)
const dragging = ref(false)
let pointerId: number | null = null
let startX = 0
let startY = 0
let horizontal: boolean | null = null

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 320)
const safeThreshold = computed(() => Number.isFinite(props.swipeThreshold) ? Math.min(240, Math.max(24, props.swipeThreshold)) : 72)
const currentIndex = computed(() => Math.max(0, props.steps.findIndex(step => step.id === props.modelValue)))
const current = computed(() => props.steps[currentIndex.value])
const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === props.steps.length - 1)
const canPrevious = computed(() => props.steps.length > 1 && (props.loop || !isFirst.value))
const canNext = computed(() => props.steps.length > 1 && (props.loop || !isLast.value))

function goTo(target: string | number) {
  if (props.disabled || !props.steps.length) return false
  const index = typeof target === 'number' ? target : props.steps.findIndex(step => step.id === target)
  if (index < 0 || index >= props.steps.length || index === currentIndex.value) return false
  direction.value = index > currentIndex.value ? 1 : -1
  const step = props.steps[index]
  if (!step) return false
  emit('update:modelValue', step.id)
  emit('change', step, index)
  return true
}

function next() {
  if (!canNext.value) return false
  return goTo(isLast.value ? 0 : currentIndex.value + 1)
}

function previous() {
  if (!canPrevious.value) return false
  return goTo(isFirst.value ? props.steps.length - 1 : currentIndex.value - 1)
}

function finish() {
  if (props.disabled || !current.value) return false
  emit('complete', current.value)
  return true
}

function skip() {
  if (props.disabled || !current.value) return false
  emit('skip', current.value, currentIndex.value)
  return true
}

function onPointerDown(event: PointerEvent) {
  if (!props.swipe || props.disabled || props.steps.length < 2 || event.button !== 0 || (event.target as HTMLElement).closest('button,a,input,textarea,select')) return
  pointerId = event.pointerId
  startX = event.clientX
  startY = event.clientY
  horizontal = null
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (pointerId !== event.pointerId || !dragging.value) return
  const x = event.clientX - startX
  const y = event.clientY - startY
  if (horizontal === null && Math.max(Math.abs(x), Math.abs(y)) > 6) horizontal = Math.abs(x) > Math.abs(y)
  if (horizontal === false) {
    resetDrag(event)
    return
  }
  if (!horizontal) return
  event.preventDefault()
  const resisted = (x > 0 && !canPrevious.value) || (x < 0 && !canNext.value)
  dragOffset.value = x * (resisted ? 0.22 : 1)
}

function onPointerUp(event: PointerEvent) {
  if (pointerId !== event.pointerId) return
  const offset = dragOffset.value
  resetDrag(event)
  if (Math.abs(offset) < safeThreshold.value) return
  if (offset < 0) next()
  else previous()
}

function resetDrag(event?: PointerEvent) {
  if (event && (event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  pointerId = null
  horizontal = null
  dragging.value = false
  dragOffset.value = 0
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'ArrowRight') { event.preventDefault(); next() }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
  else if (event.key === 'Home') { event.preventDefault(); goTo(0) }
  else if (event.key === 'End') { event.preventDefault(); goTo(props.steps.length - 1) }
}

defineExpose({ next, previous, goTo, complete: finish, skip, focus: () => root.value?.focus() })
</script>

<template>
  <section
    ref="root"
    data-testid="animated-mobile-onboarding-pager"
    role="region"
    aria-roledescription="carousel"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    tabindex="0"
    class="relative flex min-h-[540px] w-full flex-col overflow-hidden rounded-[28px] bg-[#f7f3e8] text-[#1b1d19] outline-none focus-visible:ring-2 focus-visible:ring-[#1b1d19] focus-visible:ring-offset-2"
    :class="safeArea ? 'pb-[max(1.25rem,env(safe-area-inset-bottom))]' : 'pb-5'"
    :style="{ '--pager-duration': `${safeDuration}ms`, '--pager-drag': `${dragOffset}px` }"
    @keydown="onKeydown"
  >
    <div class="flex min-h-14 items-center justify-between px-5 pt-2">
      <span class="font-mono text-[9px] uppercase tracking-[.18em] text-black/35">{{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
      <button v-if="showSkip && !isLast" type="button" data-testid="onboarding-skip" class="min-h-11 rounded-full px-3 text-xs font-semibold text-black/45 outline-none hover:not-disabled:text-black focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" @click="skip">{{ skipLabel }}</button>
    </div>

    <div
      class="relative flex min-h-0 flex-1 touch-pan-y items-stretch"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="resetDrag"
    >
      <Transition :name="direction > 0 ? 'pager-next' : 'pager-previous'" mode="out-in">
        <article
          v-if="current"
          :key="current.id"
          data-testid="onboarding-step"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${currentIndex + 1} of ${steps.length}: ${current.title}`"
          class="pager-slide flex w-full flex-col px-5 pb-4"
          :class="dragging ? 'is-dragging' : ''"
        >
          <div class="grid min-h-[265px] flex-1 place-items-center py-5">
            <slot :step="current" :index="currentIndex">
              <div class="grid size-44 place-items-center rounded-[48px] text-5xl font-black shadow-[0_30px_70px_-36px_rgba(0,0,0,.45)]" :style="{ backgroundColor: current.accent ?? '#d9ff57' }">{{ current.icon ?? currentIndex + 1 }}</div>
            </slot>
          </div>
          <div class="mx-auto w-full max-w-sm text-center">
            <p v-if="current.eyebrow" class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">{{ current.eyebrow }}</p>
            <h2 class="mt-3 text-3xl font-semibold leading-[.98] tracking-[-.055em]">{{ current.title }}</h2>
            <p class="mx-auto mt-4 max-w-xs text-sm leading-6 text-black/48">{{ current.description }}</p>
          </div>
        </article>
      </Transition>
    </div>

    <div class="mt-auto px-5 pt-4">
      <div v-if="showProgress" class="mb-5 flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding progress">
        <button v-for="(step, index) in steps" :key="step.id" type="button" role="tab" :aria-selected="index === currentIndex" :aria-label="`Go to step ${index + 1}: ${step.title}`" :disabled="disabled" class="h-2 rounded-full outline-none transition-[width,background-color] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :class="index === currentIndex ? 'w-7 bg-[#1b1d19]' : 'w-2 bg-black/16'" @click="goTo(index)" />
      </div>
      <div class="grid grid-cols-[auto_1fr] gap-2">
        <button v-if="showBack" type="button" data-testid="onboarding-back" class="min-h-12 rounded-2xl border border-black/10 px-4 text-xs font-semibold outline-none hover:not-disabled:bg-white focus-visible:ring-2 focus-visible:ring-black disabled:opacity-30" :disabled="disabled || !canPrevious" aria-label="Previous step" @click="previous">&#8592;</button>
        <button type="button" data-testid="onboarding-primary" class="min-h-12 rounded-2xl bg-[#1b1d19] px-5 text-xs font-semibold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#1b1d19] focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled" @click="isLast ? finish() : next()">{{ isLast ? completeLabel : nextLabel }} <span aria-hidden="true">{{ isLast ? '✓' : '→' }}</span></button>
      </div>
    </div>
    <p class="sr-only" aria-live="polite">Step {{ currentIndex + 1 }} of {{ steps.length }}: {{ current?.title }}</p>
  </section>
</template>

<style scoped>
.pager-slide { transform: translateX(var(--pager-drag)); transition: transform var(--pager-duration) cubic-bezier(.2,.8,.2,1), opacity var(--pager-duration) ease; }
.pager-slide.is-dragging { transition: none; }
.pager-next-enter-from { opacity: 0; transform: translateX(28px); }
.pager-next-leave-to { opacity: 0; transform: translateX(-28px); }
.pager-previous-enter-from { opacity: 0; transform: translateX(-28px); }
.pager-previous-leave-to { opacity: 0; transform: translateX(28px); }
@media (prefers-reduced-motion: reduce) { .pager-slide { transition: none !important; } }
</style>
