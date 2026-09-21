<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch, type CSSProperties } from 'vue'

export type GuidedTourPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface GuidedTourStep {
  id: string
  title: string
  description: string
  target: string
  placement?: GuidedTourPlacement
  disabled?: boolean
}

interface GuidedTourProps {
  steps: GuidedTourStep[]
  label?: string
  duration?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}

type CloseReason = 'api' | 'backdrop' | 'finish' | 'skip' | 'model'

const props = withDefaults(defineProps<GuidedTourProps>(), {
  label: 'Start guided tour',
  duration: 280,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const openModel = defineModel<boolean>({ default: false })
const stepModel = defineModel<number>('step', { default: 0 })
const emit = defineEmits<{
  open: [index: number, step: GuidedTourStep]
  change: [index: number, step: GuidedTourStep]
  skip: [index: number, step: GuidedTourStep | undefined]
  finish: [step: GuidedTourStep | undefined]
  close: [reason: CloseReason]
}>()
const slots = defineSlots<{
  trigger(props: { open: boolean; step: number; start: () => void }): unknown
}>()

const uid = useId()
const panelId = `guided-tour-${uid}`
const titleId = `guided-tour-title-${uid}`
const descriptionId = `guided-tour-description-${uid}`
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const targetElement = shallowRef<HTMLElement | null>(null)
const reducedMotion = ref(false)
const hasTarget = ref(false)
const actualPlacement = ref<GuidedTourPlacement | 'center'>('center')
const spotlight = ref({ left: 0, top: 0, width: 0, height: 0 })
const panelPosition = ref({ left: 12, top: 12 })

let mounted = false
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false
let closeReason: CloseReason = 'model'
let motionQuery: MediaQueryList | undefined
let resizeObserver: ResizeObserver | undefined
let updateFrame = 0
let settleTimer: ReturnType<typeof setTimeout> | undefined
let placementRun = 0
let lastAnnouncedStep = -1

const currentStep = computed(() => props.steps[stepModel.value])
const durationMs = computed(() => reducedMotion.value || !Number.isFinite(props.duration) ? 0 : Math.max(0, props.duration))
const enabledIndices = computed(() => props.steps.reduce<number[]>((indices, step, index) => {
  if (!step.disabled) indices.push(index)
  return indices
}, []))
const stepNumber = computed(() => Math.max(0, enabledIndices.value.indexOf(stepModel.value)) + 1)
const previousIndex = computed(() => [...enabledIndices.value].reverse().find(index => index < stepModel.value) ?? -1)
const nextIndex = computed(() => enabledIndices.value.find(index => index > stepModel.value) ?? -1)
const isLastStep = computed(() => nextIndex.value < 0)
const transitionStyle = computed<CSSProperties>(() => ({ transitionDuration: `${durationMs.value}ms` }))
const spotlightStyle = computed<CSSProperties>(() => ({
  left: `${spotlight.value.left}px`,
  top: `${spotlight.value.top}px`,
  width: `${spotlight.value.width}px`,
  height: `${spotlight.value.height}px`,
  transitionDuration: `${durationMs.value}ms`,
}))
const panelStyle = computed<CSSProperties>(() => ({
  left: `${panelPosition.value.left}px`,
  top: `${panelPosition.value.top}px`,
  transitionDuration: `${durationMs.value}ms`,
}))

function rootElement(): ParentNode {
  return trigger.value?.closest<HTMLElement>('[data-guided-tour-root]') ?? document
}

function resolveTarget(step: GuidedTourStep | undefined): HTMLElement | null {
  if (!step?.target) return null
  try {
    return rootElement().querySelector<HTMLElement>(step.target)
  } catch {
    return null
  }
}

function normalizedIndex(index: number): number {
  if (!enabledIndices.value.length) return -1
  if (props.steps[index] && !props.steps[index]!.disabled) return index
  return enabledIndices.value.find(candidate => candidate >= index) ?? enabledIndices.value[0]!
}

function announceChange(force = false): void {
  const step = currentStep.value
  if (!step || (!force && lastAnnouncedStep === stepModel.value)) return
  lastAnnouncedStep = stepModel.value
  emit('change', stepModel.value, step)
}

function lockPage(): void {
  if (!props.lockScroll || scrollLocked) return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockPage(): void {
  if (!scrollLocked) return
  document.body.style.overflow = previousOverflow
  scrollLocked = false
}

function focusableElements(): HTMLElement[] {
  if (!panel.value) return []
  return [...panel.value.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
  )].filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function isInView(rect: DOMRect): boolean {
  const margin = 24
  return rect.top >= margin && rect.left >= margin
    && rect.bottom <= window.innerHeight - margin
    && rect.right <= window.innerWidth - margin
}

function paddedRect(rect: DOMRect): typeof spotlight.value {
  const padding = 8
  const left = Math.max(8, rect.left - padding)
  const top = Math.max(8, rect.top - padding)
  const right = Math.min(window.innerWidth - 8, rect.right + padding)
  const bottom = Math.min(window.innerHeight - 8, rect.bottom + padding)
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function positionPanel(anchor?: typeof spotlight.value): void {
  if (!panel.value) return
  const margin = 12
  const gap = 16
  const width = panel.value.offsetWidth || Math.min(360, window.innerWidth - margin * 2)
  const height = panel.value.offsetHeight || 240

  if (!anchor) {
    actualPlacement.value = 'center'
    panelPosition.value = {
      left: Math.max(margin, (window.innerWidth - width) / 2),
      top: Math.max(margin, (window.innerHeight - height) / 2),
    }
    return
  }

  const preferred = currentStep.value?.placement ?? 'bottom'
  const opposite: Record<GuidedTourPlacement, GuidedTourPlacement> = {
    top: 'bottom', right: 'left', bottom: 'top', left: 'right',
  }
  const placements = [...new Set<GuidedTourPlacement>([preferred, opposite[preferred], 'bottom', 'top', 'right', 'left'])]
  const candidate = (placement: GuidedTourPlacement) => {
    if (placement === 'top') return { left: anchor.left + anchor.width / 2 - width / 2, top: anchor.top - height - gap }
    if (placement === 'bottom') return { left: anchor.left + anchor.width / 2 - width / 2, top: anchor.top + anchor.height + gap }
    if (placement === 'left') return { left: anchor.left - width - gap, top: anchor.top + anchor.height / 2 - height / 2 }
    return { left: anchor.left + anchor.width + gap, top: anchor.top + anchor.height / 2 - height / 2 }
  }
  const fits = (position: { left: number; top: number }) => position.left >= margin && position.top >= margin
    && position.left + width <= window.innerWidth - margin
    && position.top + height <= window.innerHeight - margin
  const placement = placements.find(value => fits(candidate(value))) ?? preferred
  const position = candidate(placement)

  actualPlacement.value = placement
  panelPosition.value = {
    left: Math.min(Math.max(position.left, margin), Math.max(margin, window.innerWidth - width - margin)),
    top: Math.min(Math.max(position.top, margin), Math.max(margin, window.innerHeight - height - margin)),
  }
}

function updateGeometry(): void {
  if (!openModel.value) return
  const element = targetElement.value
  if (!element?.isConnected) {
    hasTarget.value = false
    positionPanel()
    return
  }
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    hasTarget.value = false
    positionPanel()
    return
  }
  hasTarget.value = true
  const nextSpotlight = paddedRect(rect)
  spotlight.value = nextSpotlight
  positionPanel(nextSpotlight)
}

function requestGeometryUpdate(): void {
  cancelAnimationFrame(updateFrame)
  updateFrame = requestAnimationFrame(updateGeometry)
}

function nextReachableTarget(): { index: number; element: HTMLElement } | undefined {
  for (const index of enabledIndices.value) {
    if (index <= stepModel.value) continue
    const element = resolveTarget(props.steps[index])
    if (element) return { index, element }
  }
}

async function placeCurrentStep(): Promise<void> {
  const run = ++placementRun
  clearTimeout(settleTimer)
  resizeObserver?.disconnect()
  const element = resolveTarget(currentStep.value)

  if (!element) {
    const reachable = nextReachableTarget()
    if (reachable) {
      stepModel.value = reachable.index
      return
    }
    targetElement.value = null
    hasTarget.value = false
    await nextTick()
    if (run === placementRun) positionPanel()
    return
  }

  targetElement.value = element
  const rect = element.getBoundingClientRect()
  if (!isInView(rect)) {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: reducedMotion.value ? 'auto' : 'smooth',
    })
  }
  await nextTick()
  if (run !== placementRun) return
  updateGeometry()
  if (resizeObserver) {
    resizeObserver.observe(element)
    if (panel.value) resizeObserver.observe(panel.value)
  }
  settleTimer = setTimeout(updateGeometry, durationMs.value + 80)
}

async function activate(): Promise<void> {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const index = normalizedIndex(stepModel.value)
  if (index < 0) {
    closeReason = 'api'
    openModel.value = false
    return
  }
  stepModel.value = index
  lastAnnouncedStep = -1
  emit('open', index, props.steps[index]!)
  announceChange(true)
  await nextTick()
  await placeCurrentStep()
  lockPage()
  await nextTick()
  panel.value?.focus({ preventScroll: true })
}

function deactivate(): void {
  placementRun++
  clearTimeout(settleTimer)
  cancelAnimationFrame(updateFrame)
  resizeObserver?.disconnect()
  targetElement.value = null
  hasTarget.value = false
  unlockPage()
  const focusTarget = previousFocus?.isConnected ? previousFocus : trigger.value
  previousFocus = null
  nextTick(() => focusTarget?.focus({ preventScroll: true }))
}

function start(): void {
  if (props.disabled || !enabledIndices.value.length) return
  stepModel.value = enabledIndices.value[0]!
  if (openModel.value) {
    announceChange()
    void placeCurrentStep()
  } else {
    openModel.value = true
  }
}

function close(reason: CloseReason = 'api'): void {
  if (!openModel.value) return
  closeReason = reason
  openModel.value = false
}

function skip(): void {
  if (!openModel.value) return
  emit('skip', stepModel.value, currentStep.value)
  close('skip')
}

function finish(): void {
  if (!openModel.value) return
  emit('finish', currentStep.value)
  close('finish')
}

function next(): void {
  if (!openModel.value) return
  if (nextIndex.value < 0) {
    finish()
    return
  }
  stepModel.value = nextIndex.value
}

function previous(): void {
  if (!openModel.value || previousIndex.value < 0) return
  stepModel.value = previousIndex.value
}

function handleBackdrop(): void {
  if (props.closeOnBackdrop) close('backdrop')
}

function handleKeydown(event: KeyboardEvent): void {
  if (!openModel.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    skip()
    return
  }
  if (event.key !== 'Tab') return

  const elements = focusableElements()
  if (!elements.length) {
    event.preventDefault()
    panel.value?.focus()
    return
  }
  const first = elements[0]!
  const last = elements[elements.length - 1]!
  const active = document.activeElement
  if (event.shiftKey && (active === first || !panel.value?.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || !panel.value?.contains(active))) {
    event.preventDefault()
    first.focus()
  }
}

function handleMotionChange(event: MediaQueryListEvent): void {
  reducedMotion.value = event.matches
  requestGeometryUpdate()
}

watch(openModel, (isOpen) => {
  if (!mounted) return
  if (isOpen) {
    if (props.disabled) {
      closeReason = 'api'
      openModel.value = false
      return
    }
    void activate()
  } else {
    deactivate()
    emit('close', closeReason)
    closeReason = 'model'
  }
})

watch(stepModel, (index) => {
  if (!openModel.value) return
  const normalized = normalizedIndex(index)
  if (normalized < 0) {
    close()
    return
  }
  if (normalized !== index) {
    stepModel.value = normalized
    return
  }
  announceChange()
  void placeCurrentStep()
})

watch(() => props.steps, () => {
  if (!openModel.value) return
  const normalized = normalizedIndex(stepModel.value)
  if (normalized < 0) close()
  else if (normalized !== stepModel.value) stepModel.value = normalized
  else void placeCurrentStep()
})

watch(() => props.lockScroll, (shouldLock) => {
  if (!mounted || !openModel.value) return
  if (shouldLock) lockPage()
  else unlockPage()
})

watch(() => props.disabled, (disabled) => {
  if (disabled && openModel.value) close()
})

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  resizeObserver = new ResizeObserver(requestGeometryUpdate)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', requestGeometryUpdate)
  window.addEventListener('scroll', requestGeometryUpdate, true)
  if (openModel.value && !props.disabled) void activate()
})

onBeforeUnmount(() => {
  mounted = false
  clearTimeout(settleTimer)
  cancelAnimationFrame(updateFrame)
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionChange)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', requestGeometryUpdate)
  window.removeEventListener('scroll', requestGeometryUpdate, true)
  unlockPage()
})

defineExpose({ start, next, previous, close })
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="guided-tour-trigger inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm outline-none transition-[transform,opacity,background-color] hover:-translate-y-0.5 hover:bg-foreground/90 focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
    :aria-label="label"
    aria-haspopup="dialog"
    :aria-controls="panelId"
    :aria-expanded="openModel"
    :disabled="disabled"
    @click="start"
  >
    <slot name="trigger" :open="openModel" :step="stepModel" :start="start">{{ label }}</slot>
  </button>

  <Teleport to="body">
    <Transition
      :duration="durationMs"
      enter-active-class="transition-opacity ease-out motion-reduce:transition-none"
      leave-active-class="transition-opacity ease-in motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="openModel" class="pointer-events-none fixed inset-0 z-[120]" :style="transitionStyle">
        <div
          class="pointer-events-auto absolute inset-0"
          :class="hasTarget ? 'bg-transparent' : 'bg-black/70'"
          aria-hidden="true"
          @click="handleBackdrop"
        />

        <div
          v-if="hasTarget"
          class="absolute rounded-[18px] shadow-[0_0_0_9999px_rgb(0_0_0/0.70)] ring-2 ring-white/80 transition-[left,top,width,height] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :style="spotlightStyle"
          aria-hidden="true"
        />

        <section
          :id="panelId"
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="currentStep ? undefined : label"
          :aria-labelledby="currentStep ? titleId : undefined"
          :aria-describedby="currentStep ? descriptionId : undefined"
          :data-placement="actualPlacement"
          tabindex="-1"
          class="pointer-events-auto fixed w-[calc(100vw-24px)] max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#11130f] text-white shadow-[0_24px_80px_rgb(0_0_0/0.42)] outline-none transition-[left,top] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :style="panelStyle"
          @click.stop
        >
          <div class="h-1 bg-white/10">
            <div
              class="h-full bg-[var(--registry-accent,#b7f36b)] transition-[width] ease-out motion-reduce:transition-none"
              :style="{ width: `${enabledIndices.length ? (stepNumber / enabledIndices.length) * 100 : 0}%`, transitionDuration: `${durationMs}ms` }"
            />
          </div>
          <div class="p-5 sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--registry-accent,#b7f36b)]">
                Step {{ stepNumber }} of {{ enabledIndices.length }}
              </p>
              <button
                type="button"
                class="-mr-2 -mt-2 rounded-lg px-2 py-1 text-xs font-medium text-white/45 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--registry-accent,#b7f36b)]"
                @click="skip"
              >
                Skip
              </button>
            </div>
            <h2 v-if="currentStep" :id="titleId" class="mt-3 text-xl font-semibold tracking-[-0.025em]">
              {{ currentStep.title }}
            </h2>
            <p v-if="currentStep" :id="descriptionId" class="mt-2 text-sm leading-6 text-white/60">
              {{ currentStep.description }}
            </p>
            <div class="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm font-medium text-white/55 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--registry-accent,#b7f36b)] disabled:pointer-events-none disabled:opacity-25"
                :disabled="previousIndex < 0"
                @click="previous"
              >
                Previous
              </button>
              <button
                type="button"
                class="rounded-lg bg-[var(--registry-accent,#b7f36b)] px-4 py-2 text-sm font-bold text-[var(--registry-accent-foreground,#18200f)] outline-none transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-[var(--registry-accent,#b7f36b)] active:translate-y-0 motion-reduce:transition-none"
                @click="next"
              >
                {{ isLastStep ? 'Finish' : 'Next' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
