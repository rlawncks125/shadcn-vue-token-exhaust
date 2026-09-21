<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

defineOptions({ inheritAttrs: false })

export interface ContextMenuItem {
  id: string
  label: string
  description?: string
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  separator?: boolean
}

const props = withDefaults(defineProps<{
  items: ContextMenuItem[]
  label?: string
  menuLabel?: string
  disabled?: boolean
  closeOnSelect?: boolean
  longPressDelay?: number
}>(), {
  label: 'Context menu area',
  menuLabel: 'Context actions',
  disabled: false,
  closeOnSelect: true,
  longPressDelay: 550,
})

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  select: [item: ContextMenuItem]
  open: []
  close: []
}>()

const trigger = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const itemElements: HTMLButtonElement[] = []
const panelStyle = ref<Record<string, string>>({})
const panelId = `context-menu-${useId()}`
const point = { x: 0, y: 0 }
let restoreFocus = true
let longPressTimer: ReturnType<typeof setTimeout> | undefined
let longPressPointer: number | undefined
let startX = 0
let startY = 0

function setItem(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) itemElements[index] = element
}

function enabledIndices() {
  return props.items.reduce<number[]>((indices, item, index) => {
    if (!item.disabled) indices.push(index)
    return indices
  }, [])
}

async function focusItem(index = enabledIndices()[0]) {
  await nextTick()
  if (index === undefined) panel.value?.focus()
  else itemElements[index]?.focus()
}

function updatePosition() {
  const width = Math.min(290, window.innerWidth - 32)
  const height = panel.value?.offsetHeight ?? 0
  const left = Math.max(16, Math.min(window.innerWidth - width - 16, point.x))
  const preferredTop = height && point.y + height > window.innerHeight - 16 ? point.y - height : point.y
  const top = Math.max(16, Math.min(window.innerHeight - height - 16, preferredTop))
  panelStyle.value = { left: `${left}px`, top: `${top}px`, width: `${width}px` }
}

function openAt(x: number, y: number) {
  if (props.disabled) return
  point.x = x
  point.y = y
  restoreFocus = true
  trigger.value?.focus({ preventScroll: true })
  if (open.value) {
    updatePosition()
    focusItem()
  }
  else open.value = true
}

function closeMenu(restore = true) {
  restoreFocus = restore
  open.value = false
}

function onContextMenu(event: MouseEvent) {
  event.preventDefault()
  openAt(event.clientX, event.clientY)
}

function clearLongPress() {
  if (longPressTimer) clearTimeout(longPressTimer)
  longPressTimer = undefined
  longPressPointer = undefined
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return
  clearLongPress()
  longPressPointer = event.pointerId
  startX = event.clientX
  startY = event.clientY
  longPressTimer = setTimeout(() => {
    openAt(startX, startY)
    longPressTimer = undefined
  }, Math.max(300, props.longPressDelay))
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== longPressPointer || !longPressTimer) return
  if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clearLongPress()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
    event.preventDefault()
    const rect = trigger.value?.getBoundingClientRect()
    if (rect) openAt(rect.left + Math.min(24, rect.width / 2), rect.top + Math.min(24, rect.height / 2))
  }
  else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeMenu()
  }
}

function move(step: 1 | -1) {
  const enabled = enabledIndices()
  if (!enabled.length) return
  const current = itemElements.findIndex(element => element === document.activeElement)
  const position = enabled.indexOf(current)
  const next = position < 0 ? (step === 1 ? 0 : enabled.length - 1) : (position + step + enabled.length) % enabled.length
  itemElements[enabled[next]!]?.focus()
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Home') { event.preventDefault(); focusItem(enabledIndices()[0]) }
  else if (event.key === 'End') { event.preventDefault(); focusItem(enabledIndices().at(-1)) }
  else if (event.key === 'Escape') { event.preventDefault(); closeMenu() }
  else if (event.key === 'Tab') closeMenu(false)
}

function choose(item: ContextMenuItem) {
  if (item.disabled) return
  emit('select', item)
  if (props.closeOnSelect) closeMenu()
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (open.value && !trigger.value?.contains(target) && !panel.value?.contains(target)) closeMenu(false)
}

function onWindowScroll() {
  if (open.value) closeMenu(false)
}

watch(open, async (value, previous) => {
  if (value) {
    emit('open')
    await nextTick()
    updatePosition()
    await focusItem()
    updatePosition()
  }
  else if (previous) {
    emit('close')
    if (restoreFocus) {
      await nextTick()
      trigger.value?.focus()
    }
  }
})
watch(() => props.disabled, disabled => { if (disabled) { clearLongPress(); if (open.value) closeMenu(false) } })
onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', onWindowScroll, true)
})
onBeforeUnmount(() => {
  clearLongPress()
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', onWindowScroll, true)
})

defineExpose({ openAt, close: closeMenu })
</script>

<template>
  <div
    ref="trigger"
    v-bind="$attrs"
    class="context-menu-trigger outline-none focus-visible:ring-3 focus-visible:ring-[var(--registry-accent,#d9ff57)] focus-visible:ring-offset-3"
    :class="{ 'pointer-events-none opacity-50': disabled }"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-controls="panelId"
    :aria-expanded="open"
    @contextmenu="onContextMenu"
    @keydown="onTriggerKeydown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="clearLongPress"
    @pointercancel="clearLongPress"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,transform] duration-180 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      leave-active-class="transition-[opacity,transform] duration-120 ease-in motion-reduce:transition-none"
      enter-from-class="scale-[.97] opacity-0"
      leave-to-class="scale-[.98] opacity-0"
    >
      <div
        v-if="open"
        :id="panelId"
        ref="panel"
        role="menu"
        tabindex="-1"
        :aria-label="menuLabel"
        class="context-menu-panel fixed z-50 grid gap-1 rounded-[18px] border border-[#1718141f] bg-[#f9f8f2f7] p-1.5 text-[#171814] shadow-[0_24px_70px_-30px_#000a] backdrop-blur-xl outline-none origin-top-left"
        :style="panelStyle"
        @keydown="onMenuKeydown"
        @contextmenu.prevent
      >
        <button
          v-for="(item, index) in items"
          :key="item.id"
          :ref="element => setItem(element, index)"
          type="button"
          role="menuitem"
          class="context-menu-item flex w-full cursor-pointer items-center gap-3 rounded-[13px] border-0 bg-transparent px-3 py-2.5 text-left [font:inherit] text-[#171814] outline-none transition-colors hover:not-disabled:bg-[var(--registry-accent,#d9ff57)] focus-visible:bg-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-35"
          :class="{ 'mt-1 border-t border-[#17181412] pt-3': item.separator, 'text-[#c8342b] hover:not-disabled:bg-[#ffe3df] focus-visible:bg-[#ffe3df]': item.destructive }"
          :disabled="item.disabled"
          :aria-disabled="item.disabled || undefined"
          @pointermove="!item.disabled && itemElements[index]?.focus({ preventScroll: true })"
          @click="choose(item)"
        >
          <span class="grid min-w-0 flex-1 gap-0.5"><strong class="truncate text-xs font-semibold">{{ item.label }}</strong><small v-if="item.description" class="truncate text-[10px] font-normal text-[#17181470]">{{ item.description }}</small></span>
          <kbd v-if="item.shortcut" class="shrink-0 rounded-md border border-[#1718141a] bg-white/60 px-1.5 py-1 text-[8px] font-semibold text-[#17181470]">{{ item.shortcut }}</kbd>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
