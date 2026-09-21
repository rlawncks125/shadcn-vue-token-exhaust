<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface AnimatedActionSheetAction {
  id: string
  label: string
  description?: string
  icon?: string
  destructive?: boolean
  disabled?: boolean
}

export type AnimatedActionSheetCloseSource = 'backdrop' | 'cancel' | 'escape' | 'select' | 'programmatic'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  actions: AnimatedActionSheetAction[]
  title?: string
  description?: string
  duration?: number
  closeOnBackdrop?: boolean
  closeOnSelect?: boolean
  lockScroll?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  modelValue: false,
  title: 'Choose an action',
  description: '',
  duration: 280,
  closeOnBackdrop: true,
  closeOnSelect: true,
  lockScroll: true,
  safeArea: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: [source: AnimatedActionSheetCloseSource]
  select: [action: AnimatedActionSheetAction]
}>()

const panel = ref<HTMLElement | null>(null)
const uid = useId()
const titleId = `action-sheet-title-${uid}`
const descriptionId = `action-sheet-description-${uid}`
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 280)
const rootStyle = computed(() => ({ '--action-sheet-duration': `${safeDuration.value}ms` }))
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false

function focusableElements() {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [])
}

function lockPage() {
  if (!props.lockScroll || scrollLocked || typeof document === 'undefined') return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockPage() {
  if (!scrollLocked || typeof document === 'undefined') return
  document.body.style.overflow = previousOverflow
  scrollLocked = false
}

function show() {
  if (props.disabled || props.modelValue) return false
  emit('update:modelValue', true)
  return true
}

function close(source: AnimatedActionSheetCloseSource = 'programmatic') {
  if (!props.modelValue) return false
  emit('update:modelValue', false)
  emit('close', source)
  return true
}

function select(action: AnimatedActionSheetAction) {
  if (props.disabled || action.disabled) return
  emit('select', action)
  if (props.closeOnSelect) close('select')
}

function onBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget && props.closeOnBackdrop && !props.disabled) close('backdrop')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.disabled) {
    event.preventDefault()
    close('escape')
    return
  }
  if (event.key !== 'Tab') return
  const elements = focusableElements()
  if (!elements.length) return
  const first = elements[0]!
  const last = elements.at(-1)!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.modelValue, async (visible) => {
  if (typeof document === 'undefined') return
  if (visible) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    lockPage()
    emit('open')
    await nextTick()
    focusableElements()[0]?.focus({ preventScroll: true })
  } else {
    unlockPage()
    await nextTick()
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    previousFocus = null
  }
}, { immediate: true })

watch(() => props.disabled, disabled => {
  if (disabled && props.modelValue) close('programmatic')
})

onBeforeUnmount(unlockPage)
defineExpose({ show, close, focus: () => focusableElements()[0]?.focus() })
</script>

<template>
  <Teleport to="body">
    <Transition name="action-sheet">
      <div
        v-if="modelValue"
        data-testid="animated-action-sheet-overlay"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 px-2 pt-8 backdrop-blur-[2px] sm:px-4"
        :style="rootStyle"
        @click="onBackdrop"
        @keydown="onKeydown"
      >
        <section
          ref="panel"
          data-testid="animated-action-sheet"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          class="mb-2 w-full max-w-lg outline-none sm:mb-4"
          :class="safeArea ? 'pb-[env(safe-area-inset-bottom)]' : ''"
        >
          <div class="overflow-hidden rounded-[22px] bg-[#f7f6f2]/95 shadow-2xl backdrop-blur-xl">
            <header class="border-b border-black/[0.07] px-5 py-4 text-center">
              <h2 :id="titleId" class="text-sm font-semibold tracking-[-0.02em] text-[#1c1d1a]">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" class="mt-1 text-xs leading-5 text-black/45">{{ description }}</p>
            </header>
            <div class="divide-y divide-black/[0.07]">
              <button
                v-for="action in actions"
                :key="action.id"
                type="button"
                :data-testid="`action-sheet-action-${action.id}`"
                class="flex min-h-16 w-full items-center gap-3 bg-transparent px-5 py-3 text-left outline-none transition-colors hover:not-disabled:bg-black/[0.04] active:not-disabled:bg-black/[0.08] focus-visible:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e4633f] disabled:opacity-35 motion-reduce:transition-none"
                :class="action.destructive ? 'text-[#c73f35]' : 'text-[#1c1d1a]'"
                :disabled="disabled || action.disabled"
                @click="select(action)"
              >
                <span v-if="action.icon" class="grid size-9 shrink-0 place-items-center rounded-xl bg-current/[0.08] text-sm font-bold" aria-hidden="true">{{ action.icon }}</span>
                <span class="min-w-0 flex-1">
                  <strong class="block text-sm font-semibold">{{ action.label }}</strong>
                  <small v-if="action.description" class="mt-0.5 block text-[11px] leading-4 opacity-55">{{ action.description }}</small>
                </span>
              </button>
            </div>
          </div>
          <button type="button" data-testid="action-sheet-cancel" class="mt-2 min-h-14 w-full rounded-[18px] bg-white text-sm font-semibold text-[#1c1d1a] shadow-xl outline-none transition-transform active:scale-[.985] focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="close('cancel')">Cancel</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.action-sheet-enter-active,
.action-sheet-leave-active { transition: opacity var(--action-sheet-duration) ease; }
.action-sheet-enter-active > section,
.action-sheet-leave-active > section { transition: transform var(--action-sheet-duration) cubic-bezier(.16, 1, .3, 1); }
.action-sheet-enter-from,
.action-sheet-leave-to { opacity: 0; }
.action-sheet-enter-from > section,
.action-sheet-leave-to > section { transform: translateY(24px) scale(.985); }
@media (prefers-reduced-motion: reduce) {
  .action-sheet-enter-active,
  .action-sheet-leave-active,
  .action-sheet-enter-active > section,
  .action-sheet-leave-active > section { transition: none !important; }
}
</style>
