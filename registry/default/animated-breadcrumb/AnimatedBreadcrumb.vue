<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedBreadcrumbItem {
  id: string
  label: string
  href?: string
  disabled?: boolean
}

type BreadcrumbSegment =
  | { key: string, type: 'item', item: AnimatedBreadcrumbItem, index: number }
  | { key: string, type: 'collapse' }

const props = withDefaults(defineProps<{
  items: AnimatedBreadcrumbItem[]
  maxItems?: number
  duration?: number
  disabled?: boolean
  separator?: string
  ariaLabel?: string
}>(), {
  maxItems: 4,
  duration: 260,
  disabled: false,
  separator: '/',
  ariaLabel: 'Breadcrumb',
})

const emit = defineEmits<{
  select: [item: AnimatedBreadcrumbItem, index: number]
}>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const current = ref<HTMLElement | null>(null)
const menuItems = new Map<number, HTMLElement>()
const menuOpen = ref(false)
const menuId = `animated-breadcrumb-menu-${useId()}`
let restoreFocusOnClose = true

const itemLimit = computed(() => Math.max(3, Math.floor(props.maxItems)))
const collapsedItems = computed(() => {
  if (props.items.length <= itemLimit.value) return []
  const trailingCount = itemLimit.value - 2
  return props.items.slice(1, props.items.length - trailingCount).map((item, offset) => ({
    item,
    index: offset + 1,
  }))
})
const segments = computed<BreadcrumbSegment[]>(() => {
  if (!collapsedItems.value.length) {
    return props.items.map((item, index) => ({ key: `item:${item.id}`, type: 'item', item, index }))
  }

  const trailingCount = itemLimit.value - 2
  const trailingStart = props.items.length - trailingCount
  return [
    { key: `item:${props.items[0]!.id}`, type: 'item', item: props.items[0]!, index: 0 },
    { key: 'collapse:middle', type: 'collapse' },
    ...props.items.slice(trailingStart).map((item, offset) => ({
      key: `item:${item.id}`,
      type: 'item' as const,
      item,
      index: trailingStart + offset,
    })),
  ]
})
const transitionStyle = computed(() => ({
  '--breadcrumb-duration': `${Math.max(0, props.duration)}ms`,
}))

function setMenuItem(element: unknown, index: number) {
  if (element instanceof HTMLElement) menuItems.set(index, element)
  else menuItems.delete(index)
}

function setTrigger(element: unknown) {
  trigger.value = element instanceof HTMLButtonElement ? element : null
}

function setCurrent(element: unknown) {
  current.value = element instanceof HTMLElement ? element : null
}

function enabledMenuIndices() {
  if (props.disabled) return []
  return collapsedItems.value.filter(({ item }) => !item.disabled).map(({ index }) => index)
}

async function focusMenuItem(position: 'first' | 'last') {
  await nextTick()
  const indices = enabledMenuIndices()
  const index = position === 'first' ? indices[0] : indices.at(-1)
  if (index === undefined) menu.value?.focus()
  else menuItems.get(index)?.focus()
}

function openMenu(position: 'first' | 'last' = 'first') {
  if (props.disabled || !collapsedItems.value.length) return
  restoreFocusOnClose = true
  menuOpen.value = true
  focusMenuItem(position)
}

function closeMenu(restoreFocus = true) {
  if (!menuOpen.value) return
  restoreFocusOnClose = restoreFocus
  menuOpen.value = false
}

function toggleMenu() {
  if (menuOpen.value) closeMenu()
  else openMenu()
}

function selectItem(item: AnimatedBreadcrumbItem, index: number, fromMenu = false) {
  if (props.disabled || item.disabled) return
  if (fromMenu) {
    closeMenu()
    trigger.value?.focus()
  }
  emit('select', item, index)
}

function moveMenuFocus(step: 1 | -1) {
  const indices = enabledMenuIndices()
  if (!indices.length) return
  const activeIndex = indices.findIndex(index => menuItems.get(index) === document.activeElement)
  const nextPosition = activeIndex < 0
    ? (step === 1 ? 0 : indices.length - 1)
    : (activeIndex + step + indices.length) % indices.length
  menuItems.get(indices[nextPosition]!)?.focus()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu('first')
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu('last')
  } else if (event.key === 'Escape' && menuOpen.value) {
    event.preventDefault()
    closeMenu()
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveMenuFocus(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveMenuFocus(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusMenuItem('first')
  } else if (event.key === 'End') {
    event.preventDefault()
    focusMenuItem('last')
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
  } else if (event.key === 'Tab') {
    closeMenu(false)
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (menuOpen.value && !root.value?.contains(event.target as Node)) closeMenu(false)
}

async function focusCurrent() {
  await nextTick()
  current.value?.focus()
}

watch(menuOpen, async (open, wasOpen) => {
  if (!open && wasOpen && restoreFocusOnClose) {
    await nextTick()
    const focusTarget = trigger.value ?? current.value
    focusTarget?.focus()
  }
})
watch(() => props.disabled, disabled => {
  if (disabled) closeMenu(false)
})
watch(() => collapsedItems.value.map(({ item }) => item.id).join('\u0000'), ids => {
  if (!ids) closeMenu(false)
})

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

defineExpose({ closeMenu, focusCurrent })
</script>

<template>
  <nav
    ref="root"
    class="animated-breadcrumb relative min-w-0 text-foreground"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :style="transitionStyle"
  >
    <TransitionGroup
      tag="ol"
      class="flex min-w-0 list-none items-center gap-1.5 p-0"
      enter-active-class="transition-[opacity,transform] duration-[var(--breadcrumb-duration)] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      leave-active-class="transition-[opacity,transform] duration-[var(--breadcrumb-duration)] ease-in motion-reduce:transition-none"
      move-class="transition-transform duration-[var(--breadcrumb-duration)] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      enter-from-class="translate-x-2 scale-95 opacity-0"
      leave-to-class="-translate-x-2 scale-95 opacity-0"
    >
      <li
        v-for="segment in segments"
        :key="segment.key"
        class="flex min-w-0 shrink items-center gap-1.5"
      >
        <span v-if="segment.type === 'collapse' || segment.index > 0" class="shrink-0 select-none text-muted-foreground/55" aria-hidden="true">{{ separator }}</span>

        <div v-if="segment.type === 'collapse'" class="relative shrink-0">
          <button
            :ref="setTrigger"
            type="button"
            class="grid size-8 cursor-pointer place-items-center rounded-lg border border-transparent bg-transparent text-sm font-semibold tracking-[0.14em] text-muted-foreground outline-none transition-[color,background-color,border-color,transform] hover:not-disabled:border-border hover:not-disabled:bg-accent hover:not-disabled:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:not-disabled:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled"
            aria-label="Show hidden breadcrumb items"
            aria-haspopup="menu"
            :aria-expanded="menuOpen"
            :aria-controls="menuId"
            @click="toggleMenu"
            @keydown="onTriggerKeydown"
          >
            <span aria-hidden="true">...</span>
          </button>

          <Transition
            enter-active-class="transition-[opacity,transform] duration-[var(--breadcrumb-duration)] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
            leave-active-class="transition-[opacity,transform] duration-[var(--breadcrumb-duration)] ease-in motion-reduce:transition-none"
            enter-from-class="-translate-y-1.5 scale-95 opacity-0"
            leave-to-class="-translate-y-1 scale-95 opacity-0"
          >
            <div
              v-if="menuOpen"
              :id="menuId"
              ref="menu"
              role="menu"
              tabindex="-1"
              aria-label="Hidden breadcrumb items"
              class="absolute left-0 top-[calc(100%+0.5rem)] z-50 grid w-56 max-w-[calc(100vw-2rem)] gap-1 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)] outline-none"
              @keydown="onMenuKeydown"
            >
              <template v-for="hidden in collapsedItems" :key="hidden.item.id">
                <a
                  v-if="hidden.item.href && !hidden.item.disabled && !disabled"
                  :ref="element => setMenuItem(element, hidden.index)"
                  :href="hidden.item.href"
                  role="menuitem"
                  class="truncate rounded-lg px-3 py-2 text-left text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground motion-reduce:transition-none"
                  @click="selectItem(hidden.item, hidden.index, true)"
                >
                  {{ hidden.item.label }}
                </a>
                <button
                  v-else
                  :ref="element => setMenuItem(element, hidden.index)"
                  type="button"
                  role="menuitem"
                  class="truncate rounded-lg border-0 bg-transparent px-3 py-2 text-left text-sm font-medium text-inherit outline-none transition-colors hover:not-disabled:bg-accent hover:not-disabled:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                  :disabled="disabled || hidden.item.disabled"
                  :aria-disabled="disabled || hidden.item.disabled || undefined"
                  @click="selectItem(hidden.item, hidden.index, true)"
                >
                  {{ hidden.item.label }}
                </button>
              </template>
            </div>
          </Transition>
        </div>

        <template v-else>
          <span
            v-if="segment.index === items.length - 1"
            :ref="setCurrent"
            tabindex="-1"
            aria-current="page"
            class="min-w-0 truncate rounded-md px-1.5 py-1 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="{ 'opacity-45': disabled || segment.item.disabled }"
            :aria-disabled="disabled || segment.item.disabled || undefined"
          >
            {{ segment.item.label }}
          </span>
          <span
            v-else-if="disabled || segment.item.disabled"
            class="min-w-0 truncate px-1.5 py-1 text-sm font-medium text-muted-foreground opacity-45"
            aria-disabled="true"
          >
            {{ segment.item.label }}
          </span>
          <a
            v-else-if="segment.item.href"
            :href="segment.item.href"
            class="min-w-0 truncate rounded-md px-1.5 py-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            @click="selectItem(segment.item, segment.index)"
          >
            {{ segment.item.label }}
          </a>
          <button
            v-else
            type="button"
            class="min-w-0 cursor-pointer truncate rounded-md border-0 bg-transparent px-1.5 py-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            @click="selectItem(segment.item, segment.index)"
          >
            {{ segment.item.label }}
          </button>
        </template>
      </li>
    </TransitionGroup>
  </nav>
</template>
