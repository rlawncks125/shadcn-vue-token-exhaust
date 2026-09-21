<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  duration?: number
  defaultOpen?: boolean
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  initialFocus?: string
}>(), {
  label: 'Dialog',
  duration: 480,
  defaultOpen: false,
  closeOnBackdrop: true,
  lockScroll: true,
  initialFocus: '',
})

const emit = defineEmits<{
  open: []
  opened: []
  close: []
  closed: []
}>()

const dialogId = `morphing-dialog-${useId()}`
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const visible = ref(false)
const transitioning = ref(false)
const reducedMotion = ref(false)

let panelAnimation: Animation | undefined
let backdropAnimation: Animation | undefined
let motionQuery: MediaQueryList | undefined
let previousOverflow = ''

function focusableElements() {
  if (!panel.value) return []
  return [...panel.value.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
}

function lockPage() {
  if (!props.lockScroll) return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockPage() {
  if (props.lockScroll) document.body.style.overflow = previousOverflow
}

function frames() {
  if (!trigger.value || !panel.value) return undefined
  const from = trigger.value.getBoundingClientRect()
  const to = panel.value.getBoundingClientRect()
  return {
    transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${Math.max(from.width / to.width, 0.12)}, ${Math.max(from.height / to.height, 0.08)})`,
    radius: getComputedStyle(trigger.value).borderRadius,
  }
}

function focusPanel() {
  const requested = props.initialFocus ? panel.value?.querySelector<HTMLElement>(props.initialFocus) : undefined
  ;(requested ?? focusableElements()[0] ?? panel.value)?.focus()
}

async function open() {
  if (visible.value || transitioning.value) return
  visible.value = true
  transitioning.value = true
  lockPage()
  emit('open')
  await nextTick()

  const origin = frames()
  const backdrop = panel.value?.parentElement
  if (!reducedMotion.value && origin && panel.value) {
    panelAnimation = panel.value.animate([
      { opacity: 0.25, transform: origin.transform, borderRadius: origin.radius },
      { opacity: 1, transform: 'translate(0, 0) scale(1)', borderRadius: '24px' },
    ], { duration: Math.max(props.duration, 180), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
    if (backdrop) backdropAnimation = backdrop.animate([{ backgroundColor: 'rgb(0 0 0 / 0)' }, { backgroundColor: 'rgb(0 0 0 / 0.62)' }], { duration: Math.max(props.duration, 180), easing: 'ease-out' })
    await panelAnimation.finished.catch(() => undefined)
  }
  transitioning.value = false
  focusPanel()
  emit('opened')
}

async function close() {
  if (!visible.value || transitioning.value) return
  transitioning.value = true
  emit('close')
  const origin = frames()
  const backdrop = panel.value?.parentElement
  if (!reducedMotion.value && origin && panel.value) {
    panelAnimation = panel.value.animate([
      { opacity: 1, transform: 'translate(0, 0) scale(1)', borderRadius: '24px' },
      { opacity: 0.2, transform: origin.transform, borderRadius: origin.radius },
    ], { duration: Math.max(props.duration * 0.78, 160), easing: 'cubic-bezier(0.7, 0, 0.84, 0)' })
    if (backdrop) backdropAnimation = backdrop.animate([{ backgroundColor: 'rgb(0 0 0 / 0.62)' }, { backgroundColor: 'rgb(0 0 0 / 0)' }], { duration: Math.max(props.duration * 0.78, 160), easing: 'ease-in' })
    await panelAnimation.finished.catch(() => undefined)
  }
  visible.value = false
  transitioning.value = false
  unlockPage()
  trigger.value?.focus()
  emit('closed')
}

function handleBackdrop(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === event.currentTarget) close()
}

function handleKeydown(event: KeyboardEvent) {
  if (!visible.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const elements = focusableElements()
  if (!elements.length) {
    event.preventDefault()
    panel.value?.focus()
    return
  }
  const first = elements[0]
  const last = elements.at(-1)!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) {
    panelAnimation?.finish()
    backdropAnimation?.finish()
  }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  document.addEventListener('keydown', handleKeydown)
  if (props.defaultOpen) open()
})

onBeforeUnmount(() => {
  panelAnimation?.cancel()
  backdropAnimation?.cancel()
  unlockPage()
  motionQuery?.removeEventListener('change', handleMotionChange)
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({ open, close })
</script>

<template>
  <button ref="trigger" type="button" class="morphing-dialog-trigger inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background outline-none transition-colors hover:bg-foreground/85 focus-visible:ring-4 focus-visible:ring-primary/20" :aria-haspopup="'dialog'" :aria-expanded="visible" :aria-controls="dialogId" @click="open">
    <slot name="trigger">{{ label }}</slot>
  </button>

  <Teleport to="body">
    <div v-if="visible" class="morphing-dialog-backdrop fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/60 p-4 sm:p-8" @mousedown="handleBackdrop">
      <section :id="dialogId" ref="panel" role="dialog" aria-modal="true" :aria-label="label" tabindex="-1" class="morphing-dialog-panel relative my-auto w-full max-w-lg origin-center overflow-hidden rounded-3xl border border-white/10 bg-[#171814] text-white shadow-2xl outline-none" data-state="open">
        <slot :close="close" />
      </section>
    </div>
  </Teleport>
</template>
