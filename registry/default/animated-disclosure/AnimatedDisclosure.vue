<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  duration?: number
  easing?: string
  lazy?: boolean
  unmountOnClose?: boolean
  disabled?: boolean
}>(), {
  title: 'More information',
  duration: 320,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  lazy: false,
  unmountOnClose: false,
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  open: []
  close: []
  afterEnter: []
  afterLeave: []
}>()

const uid = useId()
const triggerId = `disclosure-trigger-${uid}`
const panelId = `disclosure-panel-${uid}`
const panel = ref<HTMLElement | null>(null)
const animating = ref(false)
const renderContent = ref(!props.lazy || model.value)
const reducedMotion = ref(false)

let mounted = false
let transitionId = 0
let animation: Animation | undefined
let motionQuery: MediaQueryList | undefined

function cancelAnimation() {
  animation?.cancel()
  animation = undefined
}

function applyFinalState(open: boolean) {
  if (!panel.value) return
  panel.value.style.height = open ? 'auto' : '0px'
  panel.value.style.opacity = open ? '1' : '0'
  panel.value.style.transform = open ? 'none' : 'translateY(-6px)'
  panel.value.style.overflow = open ? 'visible' : 'hidden'
}

function finishTransition(opening: boolean, id: number, activeAnimation?: Animation) {
  if (id !== transitionId) return
  applyFinalState(opening)
  if (animation === activeAnimation) animation = undefined
  activeAnimation?.cancel()
  animating.value = false
  if (!opening && props.unmountOnClose) renderContent.value = false
  if (opening) emit('afterEnter')
  else emit('afterLeave')
}

async function transition(opening: boolean) {
  const id = ++transitionId
  const startHeight = panel.value?.getBoundingClientRect().height ?? 0
  const startOpacity = panel.value ? Number.parseFloat(getComputedStyle(panel.value).opacity) || 0 : 0
  cancelAnimation()
  animating.value = true
  if (opening) renderContent.value = true

  await nextTick()
  if (id !== transitionId || !panel.value) return

  if (props.disabled || reducedMotion.value || props.duration <= 0) {
    finishTransition(opening, id)
    return
  }

  const endHeight = opening ? panel.value.scrollHeight : 0
  panel.value.hidden = false
  panel.value.style.overflow = 'hidden'

  animation = panel.value.animate([
    {
      height: `${startHeight}px`,
      opacity: startOpacity,
      transform: opening && startHeight === 0 ? 'translateY(-6px)' : 'none',
    },
    {
      height: `${endHeight}px`,
      opacity: opening ? 1 : 0,
      transform: opening ? 'none' : 'translateY(-6px)',
    },
  ], {
    duration: Math.max(props.duration, 0),
    easing: props.easing,
    fill: 'both',
  })

  const activeAnimation = animation
  activeAnimation.finished
    .then(() => finishTransition(opening, id, activeAnimation))
    .catch(() => undefined)
}

function toggle() {
  if (!props.disabled) model.value = !model.value
}

function open() {
  if (!props.disabled) model.value = true
}

function close() {
  if (!props.disabled) model.value = false
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (animation) {
    const id = ++transitionId
    cancelAnimation()
    animating.value = false
    if (model.value) renderContent.value = true
    else if (props.unmountOnClose) renderContent.value = false
    applyFinalState(model.value)
    transitionId = id
  }
}

watch(model, (opening) => {
  if (!mounted) return
  if (opening) emit('open')
  else emit('close')
  transition(opening)
})

watch(() => [props.lazy, props.unmountOnClose], () => {
  if (!model.value) renderContent.value = !props.lazy && !props.unmountOnClose
})

watch(() => props.disabled, (disabled) => {
  if (disabled && animation) {
    transitionId++
    cancelAnimation()
    animating.value = false
    applyFinalState(model.value)
  }
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  applyFinalState(model.value)
  mounted = true
})

onBeforeUnmount(() => {
  transitionId++
  cancelAnimation()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ open, close, toggle })
</script>

<template>
  <div class="animated-disclosure overflow-hidden rounded-2xl border border-border bg-card">
    <button
      :id="triggerId"
      type="button"
      class="animated-disclosure-trigger flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-45 sm:px-6 sm:py-5"
      :aria-expanded="model"
      :aria-controls="panelId"
      :disabled="disabled"
      @click="toggle"
    >
      <slot name="trigger" :open="model">
        <span>{{ title }}</span>
      </slot>
      <span class="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background text-lg font-light leading-none transition-transform duration-300 motion-reduce:transition-none" :class="model ? 'rotate-45' : 'rotate-0'" aria-hidden="true">+</span>
    </button>

    <div
      :id="panelId"
      ref="panel"
      class="animated-disclosure-panel"
      role="region"
      :aria-labelledby="triggerId"
      :aria-hidden="!model"
      :hidden="!model && !animating"
    >
      <div v-if="renderContent" class="px-5 pb-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:pb-6">
        <slot />
      </div>
    </div>
  </div>
</template>
