<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface ReactionPickerItem {
  value: string
  label: string
  symbol: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: ReactionPickerItem[]
  label?: string
  pickerLabel?: string
  columns?: number
  align?: 'start' | 'end'
  disabled?: boolean
  closeOnSelect?: boolean
}>(), {
  label: 'Add reaction',
  pickerLabel: 'Choose a reaction',
  columns: 4,
  align: 'start',
  disabled: false,
  closeOnSelect: true,
})

const model = defineModel<string>({ default: '' })
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  select: [item: ReactionPickerItem]
  open: []
  close: []
}>()

const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const panel = ref<HTMLElement>()
const options = new Map<string, HTMLButtonElement>()
const panelStyle = ref<Record<string, string>>({})
const panelId = `reaction-picker-${useId()}`
const safeColumns = computed(() => Math.max(2, Math.min(8, Math.floor(props.columns))))
let restoreFocus = true

function setOption(element: unknown, value: string) {
  if (element instanceof HTMLButtonElement) options.set(value, element)
  else options.delete(value)
}

function enabledIndices() {
  return props.items.reduce<number[]>((indices, item, index) => {
    if (!item.disabled) indices.push(index)
    return indices
  }, [])
}

function selectedIndex() {
  const index = props.items.findIndex(item => item.value === model.value && !item.disabled)
  return index >= 0 ? index : enabledIndices()[0] ?? -1
}

async function focusIndex(index = selectedIndex()) {
  await nextTick()
  const item = props.items[index]
  if (item) options.get(item.value)?.focus()
  else panel.value?.focus()
}

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const preferredWidth = safeColumns.value * 52 + 24
  const width = Math.min(preferredWidth, window.innerWidth - 32)
  const preferredLeft = props.align === 'start' ? rect.left : rect.right - width
  const left = Math.max(16, Math.min(window.innerWidth - width - 16, preferredLeft))
  let top = rect.bottom + 8
  const height = panel.value?.offsetHeight ?? 0
  if (height && top + height > window.innerHeight - 16 && rect.top - height - 8 >= 16) top = rect.top - height - 8
  panelStyle.value = { left: `${left}px`, top: `${top}px`, width: `${width}px` }
}

function openPicker() {
  if (props.disabled) return
  restoreFocus = true
  if (open.value) focusIndex()
  else open.value = true
}

function closePicker(restore = true) {
  restoreFocus = restore
  open.value = false
}

function toggle() {
  if (open.value) closePicker()
  else openPicker()
}

function move(step: number) {
  const enabled = enabledIndices()
  if (!enabled.length) return
  const current = props.items.findIndex(item => options.get(item.value) === document.activeElement)
  let index = current
  for (let attempt = 0; attempt < props.items.length; attempt++) {
    index = (index + step + props.items.length) % props.items.length
    if (enabled.includes(index)) {
      focusIndex(index)
      return
    }
  }
}

function choose(item: ReactionPickerItem) {
  if (item.disabled) return
  model.value = item.value
  emit('select', item)
  if (props.closeOnSelect) closePicker()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openPicker()
  }
  else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    closePicker()
  }
}

function onGridKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
  else if (event.key === 'ArrowDown') { event.preventDefault(); move(safeColumns.value) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-safeColumns.value) }
  else if (event.key === 'Home') { event.preventDefault(); focusIndex(enabledIndices()[0]) }
  else if (event.key === 'End') { event.preventDefault(); focusIndex(enabledIndices().at(-1)) }
  else if (event.key === 'Escape') { event.preventDefault(); closePicker() }
  else if (event.key === 'Tab') closePicker(false)
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (open.value && !root.value?.contains(target) && !panel.value?.contains(target)) closePicker(false)
}

watch(open, async (value, previous) => {
  if (value) {
    emit('open')
    await nextTick()
    updatePosition()
    await focusIndex()
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
watch(() => [props.align, props.columns], () => { if (open.value) updatePosition() })
watch(() => props.disabled, disabled => { if (disabled && open.value) closePicker(false) })
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

defineExpose({ open: openPicker, close: closePicker })
</script>

<template>
  <div ref="root" class="reaction-picker relative inline-block text-[#171814]">
    <button
      ref="trigger"
      type="button"
      class="reaction-picker-trigger inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#1718141f] bg-white/70 px-3.5 [font:inherit] text-[11px] font-semibold text-[#171814] shadow-[0_10px_24px_-20px_#0009] transition-[border-color,background-color,transform] duration-200 hover:not-disabled:-translate-y-px hover:not-disabled:border-[#17181466] hover:not-disabled:bg-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span v-if="model && items.find(item => item.value === model)?.symbol" class="text-base leading-none" aria-hidden="true">{{ items.find(item => item.value === model)?.symbol }}</span>
      <svg v-else class="size-4 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M7 8h.01M13 8h.01M7 12c1.5 1.5 4.5 1.5 6 0" /></svg>
      {{ label }}
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
          :id="panelId"
          ref="panel"
          class="reaction-picker-panel fixed z-50 rounded-[20px] border border-[#1718141f] bg-[#f9f8f2f7] p-3 text-[#171814] shadow-[0_24px_70px_-30px_#000a] backdrop-blur-xl outline-none"
          :class="align === 'start' ? 'origin-top-left' : 'origin-top-right'"
          :style="panelStyle"
          tabindex="-1"
        >
          <p class="mb-2 px-1 text-[9px] font-bold tracking-[.12em] text-[#17181466] uppercase">{{ pickerLabel }}</p>
          <div role="listbox" :aria-label="pickerLabel" class="grid gap-1.5" :style="{ gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))` }" @keydown="onGridKeydown">
            <button
              v-for="item in items"
              :key="item.value"
              :ref="element => setOption(element, item.value)"
              type="button"
              role="option"
              class="reaction-picker-option group grid aspect-square min-h-11 cursor-pointer place-items-center rounded-[13px] border border-transparent bg-transparent [font:inherit] text-2xl outline-none transition-[background-color,border-color,transform] duration-150 hover:not-disabled:scale-105 hover:not-disabled:bg-[#17181408] focus-visible:border-[#171814] focus-visible:bg-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:grayscale disabled:opacity-30 motion-reduce:transition-none"
              :class="{ 'border-[#1718141f] bg-white shadow-sm': model === item.value }"
              :disabled="item.disabled"
              :aria-label="item.label"
              :aria-selected="model === item.value"
              @pointermove="!item.disabled && options.get(item.value)?.focus({ preventScroll: true })"
              @click="choose(item)"
            >
              <slot name="reaction" :item="item"><span aria-hidden="true">{{ item.symbol }}</span></slot>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
