<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type AnimatedMobileHeaderState = 'expanded' | 'compact' | 'hidden'
export type AnimatedMobileHeaderSource = 'scroll' | 'api'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  mode?: 'hide' | 'compact'
  height?: number | string
  collapseAt?: number
  directionThreshold?: number
  duration?: number
  safeArea?: boolean
  showProgress?: boolean
  disabled?: boolean
  label?: string
}>(), {
  title: 'Library',
  subtitle: '',
  mode: 'hide',
  height: 560,
  collapseAt: 32,
  directionThreshold: 12,
  duration: 260,
  safeArea: true,
  showProgress: true,
  disabled: false,
  label: 'Page header',
})

const state = defineModel<AnimatedMobileHeaderState>({ default: 'expanded' })
const emit = defineEmits<{
  stateChange: [state: AnimatedMobileHeaderState, previous: AnimatedMobileHeaderState, source: AnimatedMobileHeaderSource]
  progress: [value: number]
  leading: []
  trailing: []
}>()

const viewport = ref<HTMLElement | null>(null)
const progress = ref(0)
const reducedMotion = ref(false)

let frame: number | undefined
let motionQuery: MediaQueryList | undefined
let lastScrollTop = 0
let accumulatedDelta = 0
let direction = 0
let lastProgress = -1

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 260)
const safeCollapseAt = computed(() => Number.isFinite(props.collapseAt) ? Math.max(0, props.collapseAt) : 32)
const safeDirectionThreshold = computed(() => Number.isFinite(props.directionThreshold) ? Math.max(1, props.directionThreshold) : 12)
const rootStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${Math.max(0, props.height)}px` : props.height,
  '--mobile-header-duration': `${reducedMotion.value ? 0 : safeDuration.value}ms`,
  '--mobile-header-safe-top': props.safeArea ? 'env(safe-area-inset-top)' : '0px',
}))
const headerClass = computed(() => ({
  'is-compact': state.value === 'compact',
  'is-hidden': state.value === 'hidden',
}))
const progressStyle = computed(() => ({ transform: `scaleX(${progress.value})` }))

function setState(next: AnimatedMobileHeaderState, source: AnimatedMobileHeaderSource = 'api') {
  if (props.disabled || state.value === next) return false
  const previous = state.value
  state.value = next
  emit('stateChange', next, previous, source)
  return true
}

function calculate() {
  frame = undefined
  const element = viewport.value
  if (!element) return

  const top = Math.max(0, element.scrollTop)
  const maximum = Math.max(0, element.scrollHeight - element.clientHeight)
  const nextProgress = maximum > 0 ? Math.min(1, top / maximum) : 0
  progress.value = nextProgress
  if (nextProgress !== lastProgress) {
    lastProgress = nextProgress
    emit('progress', nextProgress)
  }

  const delta = top - lastScrollTop
  lastScrollTop = top
  if (props.disabled) return

  if (top <= safeCollapseAt.value) {
    accumulatedDelta = 0
    direction = 0
    setState('expanded', 'scroll')
    return
  }

  const nextDirection = Math.sign(delta)
  if (!nextDirection) return
  if (nextDirection !== direction) {
    direction = nextDirection
    accumulatedDelta = delta
  }
  else {
    accumulatedDelta += delta
  }

  if (Math.abs(accumulatedDelta) < safeDirectionThreshold.value) return
  setState(direction > 0 ? (props.mode === 'compact' ? 'compact' : 'hidden') : 'expanded', 'scroll')
  accumulatedDelta = 0
}

function scheduleCalculate() {
  if (frame !== undefined) return
  frame = window.requestAnimationFrame(calculate)
}

function show() {
  return setState('expanded')
}

function compact() {
  return setState('compact')
}

function hide() {
  return setState('hidden')
}

function scrollToTop() {
  const element = viewport.value
  if (!element) return false
  element.scrollTo({ top: 0, behavior: reducedMotion.value ? 'auto' : 'smooth' })
  return true
}

function reset() {
  const element = viewport.value
  if (element) element.scrollTop = 0
  lastScrollTop = 0
  accumulatedDelta = 0
  direction = 0
  progress.value = 0
  return setState('expanded')
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
}

onMounted(async () => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  await nextTick()
  lastScrollTop = viewport.value?.scrollTop ?? 0
  calculate()
})

onBeforeUnmount(() => {
  if (frame !== undefined) window.cancelAnimationFrame(frame)
  motionQuery?.removeEventListener('change', onMotionChange)
})

defineExpose({ show, compact, hide, scrollToTop, reset, recalculate: calculate })
</script>

<template>
  <section
    class="animated-mobile-header relative w-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#f1efe7] text-[#171814] shadow-[0_24px_70px_-42px_rgba(13,18,12,0.65)]"
    :style="rootStyle"
    :data-state="state"
    :aria-disabled="disabled || undefined"
    data-testid="animated-mobile-header"
  >
    <header
      class="mobile-header-panel absolute inset-x-0 top-0 z-20 overflow-hidden border-b border-black/[.07] bg-[#f7f5ee]/95 pt-[var(--mobile-header-safe-top)] shadow-[0_12px_32px_-28px_rgba(13,18,12,0.7)] backdrop-blur-xl"
      :class="headerClass"
      :aria-label="label"
      :aria-hidden="state === 'hidden' ? 'true' : undefined"
      data-testid="animated-mobile-header-panel"
    >
      <div class="mobile-header-content flex h-[88px] items-center gap-3 px-4">
        <slot name="leading" :state="state">
          <button
            type="button"
            class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/75 text-sm font-bold outline-none transition-transform hover:-translate-x-0.5 focus-visible:ring-2 focus-visible:ring-black active:scale-95 disabled:opacity-35 motion-reduce:transition-none"
            :disabled="disabled"
            :tabindex="state === 'hidden' ? -1 : 0"
            aria-label="Go back"
            data-testid="animated-mobile-header-leading"
            @click="emit('leading')"
          >&larr;</button>
        </slot>

        <button
          type="button"
          class="min-w-0 flex-1 text-left outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-black"
          :tabindex="state === 'hidden' ? -1 : 0"
          aria-label="Scroll to top"
          data-testid="animated-mobile-header-title"
          @click="scrollToTop"
        >
          <span v-if="subtitle" class="mobile-header-subtitle block truncate text-[9px] font-black uppercase tracking-[.18em] text-black/40">{{ subtitle }}</span>
          <strong class="mobile-header-title mt-0.5 block truncate text-[22px] font-semibold tracking-[-0.045em]">{{ title }}</strong>
        </button>

        <slot name="trailing" :state="state">
          <button
            type="button"
            class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-[#171814] text-sm font-black text-white outline-none transition-transform hover:rotate-6 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:scale-95 disabled:opacity-35 motion-reduce:transition-none"
            :disabled="disabled"
            :tabindex="state === 'hidden' ? -1 : 0"
            aria-label="More options"
            data-testid="animated-mobile-header-trailing"
            @click="emit('trailing')"
          >...</button>
        </slot>
      </div>

      <span
        v-if="showProgress"
        class="mobile-header-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#ef8354]"
        :style="progressStyle"
        aria-hidden="true"
        data-testid="animated-mobile-header-progress"
      />
    </header>

    <div
      ref="viewport"
      class="mobile-header-viewport h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      data-testid="animated-mobile-header-viewport"
      @scroll.passive="scheduleCalculate"
    >
      <div class="min-h-full pt-[calc(88px+var(--mobile-header-safe-top))]">
        <slot :state="state" :progress="progress" />
      </div>
    </div>

    <p class="sr-only" role="status" aria-live="polite">Header {{ state }}</p>
  </section>
</template>

<style scoped>
.mobile-header-panel{height:calc(88px + var(--mobile-header-safe-top));transform:translate3d(0,0,0);transition:height var(--mobile-header-duration) cubic-bezier(.16,1,.3,1),transform var(--mobile-header-duration) cubic-bezier(.16,1,.3,1),box-shadow var(--mobile-header-duration) ease}
.mobile-header-content{transition:height var(--mobile-header-duration) cubic-bezier(.16,1,.3,1),padding var(--mobile-header-duration) cubic-bezier(.16,1,.3,1)}
.mobile-header-title,.mobile-header-subtitle{transition:font-size var(--mobile-header-duration) cubic-bezier(.16,1,.3,1),opacity var(--mobile-header-duration) ease,transform var(--mobile-header-duration) cubic-bezier(.16,1,.3,1)}
.mobile-header-progress{transition:transform 100ms linear}
.mobile-header-panel.is-compact{height:calc(58px + var(--mobile-header-safe-top));box-shadow:0 10px 28px -24px rgba(13,18,12,.75)}
.mobile-header-panel.is-compact .mobile-header-content{height:58px;padding-left:.75rem;padding-right:.75rem}
.mobile-header-panel.is-compact .mobile-header-title{font-size:1rem;transform:translateY(0)}
.mobile-header-panel.is-compact .mobile-header-subtitle{font-size:0;opacity:0;transform:translateY(-4px)}
.mobile-header-panel.is-hidden{pointer-events:none;transform:translate3d(0,-105%,0);box-shadow:none}
@media (prefers-reduced-motion:reduce){.mobile-header-panel,.mobile-header-content,.mobile-header-title,.mobile-header-subtitle,.mobile-header-progress{transition:none!important}}
</style>
