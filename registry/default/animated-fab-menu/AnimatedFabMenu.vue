<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedFabMenuAction {
  id: string
  label: string
  icon?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  actions: AnimatedFabMenuAction[]
  label?: string
  direction?: 'up' | 'left'
  duration?: number
  closeOnSelect?: boolean
  disabled?: boolean
}>(), {
  label: 'Create',
  direction: 'up',
  duration: 220,
  closeOnSelect: true,
  disabled: false,
})

const expanded = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  openChange: [open: boolean]
  select: [action: AnimatedFabMenuAction]
}>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const activeIndex = ref(0)
const status = ref('')

const safeDuration = computed(() => (Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 220))
const enabledActions = computed(() => props.actions.filter(action => action.id.trim() && !action.disabled))
const visibleActions = computed(() => expanded.value ? props.actions : [])
const actionsPositionClass = computed(() =>
  props.direction === 'up'
    ? 'bottom-[calc(100%+0.75rem)] right-0 flex-col-reverse items-end gap-3'
    : 'bottom-1/2 right-[calc(100%+0.75rem)] translate-y-1/2 flex-row-reverse items-center gap-3',
)
const iconRotation = computed(() => (expanded.value ? 'rotate-45' : 'rotate-0'))

function announce(message: string) {
  status.value = ''
  void nextTick(() => {
    status.value = message
  })
}

function setExpanded(value: boolean) {
  if (props.disabled && value) return
  if (expanded.value === value) return
  expanded.value = value
  emit('openChange', value)
  if (value) activeIndex.value = 0
}

function focusActionByIndex(index: number) {
  const length = enabledActions.value.length
  if (!length) return
  activeIndex.value = (index + length) % length
  const targetId = enabledActions.value[activeIndex.value]?.id
  if (!targetId) return
  const target = [...(root.value?.querySelectorAll<HTMLElement>('[data-action-id]') ?? [])]
    .find(element => element.dataset.actionId === targetId)
  target?.focus()
}

async function openMenu() {
  setExpanded(true)
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 0))
  focusActionByIndex(0)
  return expanded.value
}

function closeMenu(refocus = true) {
  setExpanded(false)
  if (refocus) trigger.value?.focus()
}

function toggle() {
  if (expanded.value) closeMenu()
  else void openMenu()
}

function selectAction(action: AnimatedFabMenuAction) {
  if (props.disabled || action.disabled) return
  emit('select', action)
  announce(`${action.label} selected.`)
  if (props.closeOnSelect) closeMenu()
}

function onActionKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || (props.direction === 'left' && event.key === 'ArrowLeft')) {
    event.preventDefault()
    focusActionByIndex(activeIndex.value + 1)
  }
  else if (event.key === 'ArrowDown' || (props.direction === 'left' && event.key === 'ArrowRight')) {
    event.preventDefault()
    focusActionByIndex(activeIndex.value - 1)
  }
  else if (event.key === 'Home') {
    event.preventDefault()
    focusActionByIndex(0)
  }
  else if (event.key === 'End') {
    event.preventDefault()
    focusActionByIndex(enabledActions.value.length - 1)
  }
}

function onRootKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && expanded.value) {
    event.preventDefault()
    closeMenu()
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || (props.direction === 'left' && event.key === 'ArrowLeft')) {
    if (!expanded.value) return
    event.preventDefault()
    focusActionByIndex(0)
  }
  else if (event.key === 'ArrowDown' || (props.direction === 'left' && event.key === 'ArrowRight')) {
    if (!expanded.value) return
    event.preventDefault()
    focusActionByIndex(enabledActions.value.length - 1)
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (expanded.value && event.target instanceof Node && !root.value?.contains(event.target)) setExpanded(false)
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && expanded.value) setExpanded(false)
  },
)

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

defineExpose({ open: openMenu, close: closeMenu, toggle, focus: () => trigger.value?.focus() })
</script>

<template>
  <div
    ref="root"
    class="animated-fab-menu absolute z-40 size-14 motion-reduce:transition-none"
    :class="{ 'is-left': direction === 'left', 'opacity-50': disabled }"
    :style="{ '--fab-duration': `${safeDuration}ms` }"
    @keydown="onRootKeydown"
  >
    <TransitionGroup tag="div" role="menu" :aria-label="`${label} actions`" class="fab-actions absolute flex" :class="actionsPositionClass" name="fab-action">
      <div v-for="(action, index) in visibleActions" :key="action.id" class="fab-action flex items-center gap-2.5" :style="{ '--fab-index': index }">
        <span
          v-if="direction === 'up'"
          class="rounded-full border border-black/10 bg-[#171814] px-3 py-1.5 text-[10px] font-semibold text-white/85 shadow-[0_10px_26px_-16px_rgba(13,18,12,0.8)]"
          aria-hidden="true"
        >{{ action.label }}</span>
        <button
          type="button"
          role="menuitem"
          :data-testid="`fab-menu-action-${action.id}`"
          :data-action-id="action.id"
          :tabindex="enabledActions[activeIndex]?.id === action.id ? 0 : -1"
          :disabled="disabled || action.disabled"
          :aria-label="action.label"
          class="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-[13px] shadow-[0_14px_34px_-18px_rgba(13,18,12,0.9)] outline-none transition-[background-color,transform,border-color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:border-black/25 focus-visible:ring-2 focus-visible:ring-[#171814] focus-visible:ring-offset-2 active:not-disabled:scale-95 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
          @click="selectAction(action)"
          @keydown="onActionKeydown"
        >
          {{ action.icon ?? action.label.slice(0, 1) }}
        </button>
      </div>
    </TransitionGroup>
    <button
      ref="trigger"
      type="button"
      data-testid="fab-menu-trigger"
      :aria-expanded="expanded"
      aria-haspopup="menu"
      :aria-label="expanded ? `Close ${label} actions` : `Open ${label} actions`"
      :disabled="disabled"
      class="grid size-14 place-items-center rounded-full bg-[#171814] text-brand shadow-[0_18px_40px_-16px_rgba(13,18,12,0.85)] outline-none transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:not-disabled:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#171814] focus-visible:ring-offset-2 active:not-disabled:scale-95 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <svg class="size-6 transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none" :class="iconRotation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
    <p data-testid="fab-menu-announcement" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<style scoped>
.fab-action-enter-active{transition:opacity var(--fab-duration) cubic-bezier(.16,1,.3,1),transform var(--fab-duration) cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--fab-index)*40ms)}
.fab-action-leave-active{transition:opacity calc(var(--fab-duration)*.7) ease,transform calc(var(--fab-duration)*.7) ease}
.fab-action-enter-from,.fab-action-leave-to{opacity:0;transform:translateY(10px) scale(.85)}
.is-left .fab-action-enter-from,.is-left .fab-action-leave-to{transform:translateX(10px) scale(.85)}
.fab-action-move{transition:transform var(--fab-duration) ease}
@media (prefers-reduced-motion:reduce){.fab-action-enter-active,.fab-action-leave-active,.fab-action-move{transition:none!important}}
</style>
