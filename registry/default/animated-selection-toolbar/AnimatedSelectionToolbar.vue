<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

export interface AnimatedSelectionToolbarAction {
  id: string
  label: string
  icon?: string
  destructive?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  selectedCount: number
  actions: AnimatedSelectionToolbarAction[]
  label?: string
  duration?: number
  clearable?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  label: 'Selection actions',
  duration: 260,
  clearable: true,
  safeArea: true,
  disabled: false,
})

const emit = defineEmits<{
  action: [action: AnimatedSelectionToolbarAction]
  clear: []
}>()

const actionElements = new Map<string, HTMLButtonElement>()
const clearButton = ref<HTMLButtonElement | null>(null)
const safeCount = computed(() => Number.isFinite(props.selectedCount) ? Math.max(0, Math.round(props.selectedCount)) : 0)
const visible = computed(() => safeCount.value > 0)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)
const rootStyle = computed(() => ({ '--selection-toolbar-duration': `${safeDuration.value}ms` }))
const enabledActions = computed(() => props.actions.filter(action => !action.disabled))

function setActionElement(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) actionElements.set(id, element)
  else actionElements.delete(id)
}

function runAction(action: AnimatedSelectionToolbarAction) {
  if (props.disabled || action.disabled) return false
  emit('action', action)
  return true
}

function clear() {
  if (props.disabled || !props.clearable || !visible.value) return false
  emit('clear')
  return true
}

function focusAction(id?: string) {
  const target = id ? actionElements.get(id) : actionElements.get(enabledActions.value[0]?.id ?? '') ?? clearButton.value
  target?.focus()
  return Boolean(target)
}

function onActionKeydown(event: KeyboardEvent, id: string) {
  if (event.key === 'Escape') {
    event.preventDefault()
    clear()
    return
  }
  const actions = enabledActions.value
  if (!actions.length) return
  const current = Math.max(0, actions.findIndex(action => action.id === id))
  let index: number | undefined
  if (event.key === 'ArrowRight') index = (current + 1) % actions.length
  else if (event.key === 'ArrowLeft') index = (current - 1 + actions.length) % actions.length
  else if (event.key === 'Home') index = 0
  else if (event.key === 'End') index = actions.length - 1
  if (index === undefined) return
  event.preventDefault()
  const target = actions[index]!
  nextTick(() => actionElements.get(target.id)?.focus())
}

defineExpose({ clear, focusAction })
</script>

<template>
  <Teleport to="body">
    <Transition name="selection-toolbar">
      <div v-if="visible" data-testid="animated-selection-toolbar-wrap" class="pointer-events-none fixed inset-x-0 bottom-0 z-[105] flex justify-center px-3" :class="safeArea ? 'pb-[max(.75rem,env(safe-area-inset-bottom))]' : 'pb-3'" :style="rootStyle">
        <div data-testid="animated-selection-toolbar" role="toolbar" :aria-label="label" :aria-disabled="disabled || undefined" class="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-[20px] border border-white/10 bg-[#1d1f1b]/95 p-2 text-white shadow-[0_24px_70px_-24px_rgba(0,0,0,.8)] backdrop-blur-xl">
          <div class="flex min-w-0 shrink-0 items-center gap-2 pl-2 pr-1">
            <span class="grid size-7 place-items-center rounded-full bg-[#d9ff57] text-[10px] font-black tabular-nums text-[#1d1f1b]">{{ safeCount }}</span>
            <span class="hidden text-[10px] font-semibold uppercase tracking-[.12em] text-white/48 sm:inline">Selected</span>
          </div>
          <div class="h-7 w-px shrink-0 bg-white/10" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button v-for="action in actions" :key="action.id" :ref="element => setActionElement(element, action.id)" type="button" :data-testid="`selection-toolbar-action-${action.id}`" class="flex min-h-11 min-w-max items-center gap-2 rounded-[14px] px-3 text-xs font-semibold outline-none transition-colors hover:not-disabled:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-30 motion-reduce:transition-none" :class="action.destructive ? 'text-[#ff9187]' : 'text-white/82'" :disabled="disabled || action.disabled" :tabindex="action.id === enabledActions[0]?.id ? 0 : -1" @click="runAction(action)" @keydown="onActionKeydown($event, action.id)"><span v-if="action.icon" class="text-[10px] font-black" aria-hidden="true">{{ action.icon }}</span>{{ action.label }}</button>
          </div>
          <button v-if="clearable" ref="clearButton" type="button" data-testid="selection-toolbar-clear" class="grid size-11 shrink-0 place-items-center rounded-[14px] text-xl text-white/45 outline-none transition-colors hover:not-disabled:bg-white/10 hover:not-disabled:text-white focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" aria-label="Clear selection" @click="clear" @keydown.esc.prevent="clear">&#215;</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.selection-toolbar-enter-active,
.selection-toolbar-leave-active { transition: opacity var(--selection-toolbar-duration) ease, transform var(--selection-toolbar-duration) cubic-bezier(.2,.8,.2,1); }
.selection-toolbar-enter-from,
.selection-toolbar-leave-to { opacity: 0; transform: translateY(18px) scale(.98); }
@media (prefers-reduced-motion: reduce) {
  .selection-toolbar-enter-active,
  .selection-toolbar-leave-active { transition: none !important; }
}
</style>
