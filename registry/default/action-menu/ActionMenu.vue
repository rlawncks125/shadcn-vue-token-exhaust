<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface ActionMenuItem {
  id: string
  label: string
  description?: string
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
}

const props = withDefaults(defineProps<{
  items: ActionMenuItem[]
  label?: string
  menuLabel?: string
  align?: 'start' | 'end'
  disabled?: boolean
  closeOnSelect?: boolean
}>(), {
  label: 'Actions',
  menuLabel: 'Available actions',
  align: 'end',
  disabled: false,
  closeOnSelect: true,
})

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  select: [item: ActionMenuItem]
  open: []
  close: []
}>()

const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const menu = ref<HTMLElement>()
const itemElements: HTMLButtonElement[] = []
const panelStyle = ref<Record<string, string>>({})
const menuId = `action-menu-${useId()}`
let requestedFocus: 'first' | 'last' = 'first'
let restoreFocus = true

function setItem(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) itemElements[index] = element
}

function enabledIndices() {
  return props.items.reduce<number[]>((indices, item, index) => {
    if (!item.disabled) indices.push(index)
    return indices
  }, [])
}

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const width = Math.min(290, window.innerWidth - 32)
  const preferredLeft = props.align === 'start' ? rect.left : rect.right - width
  const left = Math.max(16, Math.min(window.innerWidth - width - 16, preferredLeft))
  let top = rect.bottom + 8
  const height = menu.value?.offsetHeight ?? 0
  if (height && top + height > window.innerHeight - 16 && rect.top - height - 8 >= 16) top = rect.top - height - 8
  panelStyle.value = { left: `${left}px`, top: `${top}px`, width: `${width}px` }
}

async function focusRequestedItem() {
  await nextTick()
  const indices = enabledIndices()
  const index = requestedFocus === 'last' ? indices.at(-1) : indices[0]
  if (index === undefined) menu.value?.focus()
  else itemElements[index]?.focus()
}

function openMenu(target: 'first' | 'last' = 'first') {
  if (props.disabled) return
  requestedFocus = target
  restoreFocus = true
  if (open.value) focusRequestedItem()
  else open.value = true
}

function closeMenu(restore = true) {
  restoreFocus = restore
  open.value = false
}

function toggle() {
  if (open.value) closeMenu()
  else openMenu()
}

function move(step: 1 | -1) {
  const indices = enabledIndices()
  if (!indices.length) return
  const current = itemElements.findIndex(element => element === document.activeElement)
  const position = indices.indexOf(current)
  const next = position < 0 ? (step === 1 ? 0 : indices.length - 1) : (position + step + indices.length) % indices.length
  itemElements[indices[next]!]?.focus()
}

function choose(item: ActionMenuItem) {
  if (item.disabled) return
  emit('select', item)
  if (props.closeOnSelect) closeMenu()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu('first')
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu('last')
  }
  else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closeMenu()
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Home') { event.preventDefault(); openMenu('first') }
  else if (event.key === 'End') { event.preventDefault(); openMenu('last') }
  else if (event.key === 'Escape') { event.preventDefault(); closeMenu() }
  else if (event.key === 'Tab') closeMenu(false)
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (open.value && !root.value?.contains(target) && !menu.value?.contains(target)) closeMenu(false)
}

watch(open, async (value, previous) => {
  if (value) {
    emit('open')
    await nextTick()
    updatePosition()
    await focusRequestedItem()
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
watch(() => props.disabled, disabled => { if (disabled && open.value) closeMenu(false) })
watch(() => props.align, () => { if (open.value) updatePosition() })
onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

defineExpose({ open: openMenu, close: closeMenu })
</script>

<template>
  <div ref="root" class="action-menu relative inline-block text-left text-[#171814]">
    <button
      ref="trigger"
      type="button"
      class="action-menu-trigger inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#171814] bg-[#171814] px-4 [font:inherit] text-xs font-semibold text-white shadow-[0_12px_26px_-18px_#000b] transition-[transform,box-shadow,background-color] duration-200 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_16px_30px_-18px_#000c] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="menuId"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger">{{ label }}</slot>
      <svg class="size-3.5 fill-none stroke-current stroke-[1.8] transition-transform duration-200 motion-reduce:transition-none" :class="{ 'rotate-180': open }" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-[opacity,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
        leave-active-class="transition-[opacity,transform] duration-150 ease-in motion-reduce:transition-none"
        enter-from-class="-translate-y-1.5 scale-[.97] opacity-0"
        leave-to-class="-translate-y-1 scale-[.98] opacity-0"
      >
        <div
          v-if="open"
          :id="menuId"
          ref="menu"
          role="menu"
          tabindex="-1"
          :aria-label="menuLabel"
          class="action-menu-panel fixed z-50 grid gap-1 rounded-[18px] border border-[#1718141f] bg-[#f9f8f2f7] p-1.5 text-left text-[#171814] shadow-[0_24px_70px_-30px_#000a] backdrop-blur-xl outline-none"
          :class="align === 'start' ? 'origin-top-left' : 'origin-top-right'"
          :style="panelStyle"
          @keydown="onMenuKeydown"
        >
        <button
          v-for="(item, index) in items"
          :key="item.id"
          :ref="element => setItem(element, index)"
          type="button"
          role="menuitem"
          class="action-menu-item flex w-full cursor-pointer items-center gap-3 rounded-[13px] border-0 bg-transparent px-3 py-2.5 text-left [font:inherit] text-[#171814] outline-none transition-colors hover:not-disabled:bg-[var(--registry-accent,#d9ff57)] focus-visible:bg-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-35"
          :class="{ 'text-[#c8342b] hover:not-disabled:bg-[#ffe3df] focus-visible:bg-[#ffe3df]': item.destructive }"
          :disabled="item.disabled"
          :aria-disabled="item.disabled || undefined"
          @pointermove="!item.disabled && itemElements[index]?.focus({ preventScroll: true })"
          @click="choose(item)"
        >
          <span class="grid min-w-0 flex-1 gap-0.5">
            <slot name="item" :item="item">
              <strong class="truncate text-xs font-semibold">{{ item.label }}</strong>
              <small v-if="item.description" class="truncate text-[10px] font-normal text-[#17181470]">{{ item.description }}</small>
            </slot>
          </span>
          <kbd v-if="item.shortcut" class="shrink-0 rounded-md border border-[#1718141a] bg-white/60 px-1.5 py-1 text-[8px] font-semibold text-[#17181470]">{{ item.shortcut }}</kbd>
        </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
