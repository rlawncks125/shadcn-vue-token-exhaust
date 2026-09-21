<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface AnimatedNavigationChild {
  id: string
  label: string
  description?: string
  href?: string
  disabled?: boolean
}

export interface AnimatedNavigationItem extends AnimatedNavigationChild {
  children?: AnimatedNavigationChild[]
}

const props = withDefaults(defineProps<{
  items: AnimatedNavigationItem[]
  modelValue: string | null
  activeValue?: string | null
  duration?: number
  label?: string
  disabled?: boolean
}>(), {
  activeValue: null,
  duration: 280,
  label: 'Primary navigation',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:activeValue': [value: string | null]
  openChange: [value: string | null]
  navigate: [item: AnimatedNavigationItem | AnimatedNavigationChild]
}>()

const root = ref<HTMLElement>()
const topElements = new Map<string, HTMLElement>()
const destinationElements = new Map<string, HTMLElement>()
const uid = useId()
let pendingDestinationFocus: string | null = null
let restoreId: string | null = null
let suppressFocusOpen = false
let pointerFocusTimer: ReturnType<typeof setTimeout> | undefined
let pointerOpenTimer: ReturnType<typeof setTimeout> | undefined

const openItem = computed(() => props.items.find(item => item.id === props.modelValue && item.children?.length))
const safeDuration = computed(() => Math.min(2000, Math.max(0, Number.isFinite(props.duration) ? props.duration : 0)))
const rootStyle = computed(() => ({ '--animated-navigation-duration': `${safeDuration.value}ms` }))

function panelId(id: string) {
  return `animated-navigation-panel-${uid}-${id}`
}

function triggerId(id: string) {
  return `animated-navigation-trigger-${uid}-${id}`
}

function setTopElement(element: unknown, id: string) {
  if (element instanceof HTMLElement) topElements.set(id, element)
  else topElements.delete(id)
}

function setDestinationElement(element: unknown, id: string) {
  if (element instanceof HTMLElement) destinationElements.set(id, element)
  else destinationElements.delete(id)
}

function enabledTopItems() {
  return props.items.filter(item => !item.disabled)
}

function setOpen(value: string | null) {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
  emit('openChange', value)
}

function open(id: string) {
  const item = props.items.find(candidate => candidate.id === id)
  if (props.disabled || !item || item.disabled || !item.children?.length) return false
  restoreId = id
  setOpen(id)
  return true
}

function close() {
  pendingDestinationFocus = null
  setOpen(null)
}

function findDestination(id: string) {
  for (const item of props.items) {
    if (item.id === id) return { item, parentId: item.id }
    const child = item.children?.find(candidate => candidate.id === id)
    if (child) return { item: child, parentId: item.id }
  }
}

function select(id: string) {
  const destination = findDestination(id)
  if (props.disabled || !destination || destination.item.disabled) return false

  emit('update:activeValue', id)
  close()
  emit('navigate', destination.item)
  return true
}

async function focusDestination(id: string) {
  await nextTick()
  await nextTick()
  destinationElements.get(id)?.focus()
}

function firstPanelDestination(item: AnimatedNavigationItem) {
  if (item.href && !item.disabled) return item.id
  return item.children?.find(child => !child.disabled)?.id
}

function openAndFocusPanel(item: AnimatedNavigationItem) {
  const destination = firstPanelDestination(item)
  if (!destination || !open(item.id)) return
  pendingDestinationFocus = destination
  if (props.modelValue === item.id) {
    pendingDestinationFocus = null
    focusDestination(destination)
  }
}

function focus(id?: string) {
  if (props.disabled) return false
  const requestedId = id ?? props.activeValue ?? undefined

  if (requestedId && topElements.get(requestedId)) {
    topElements.get(requestedId)?.focus()
    return true
  }

  if (requestedId) {
    const destination = findDestination(requestedId)
    if (destination && !destination.item.disabled && destination.parentId !== requestedId) {
      pendingDestinationFocus = requestedId
      if (props.modelValue !== destination.parentId && !open(destination.parentId)) {
        pendingDestinationFocus = null
        return false
      }
      else {
        pendingDestinationFocus = null
        focusDestination(requestedId)
      }
      return true
    }
  }

  const first = enabledTopItems()[0]
  if (!first) return false
  topElements.get(first.id)?.focus()
  return true
}

function moveTopFocus(currentId: string, direction: 1 | -1 | 'first' | 'last') {
  const items = enabledTopItems()
  if (!items.length) return

  let target: AnimatedNavigationItem | undefined
  if (direction === 'first') target = items[0]
  else if (direction === 'last') target = items.at(-1)
  else {
    const currentIndex = items.findIndex(item => item.id === currentId)
    const fallback = direction === 1 ? -1 : 0
    target = items[(Math.max(currentIndex, fallback) + direction + items.length) % items.length]
  }
  topElements.get(target!.id)?.focus()
}

function onTopKeydown(event: KeyboardEvent, item: AnimatedNavigationItem) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveTopFocus(item.id, 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveTopFocus(item.id, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    moveTopFocus(item.id, 'first')
  } else if (event.key === 'End') {
    event.preventDefault()
    moveTopFocus(item.id, 'last')
  } else if (event.key === 'ArrowDown' && item.children?.length) {
    event.preventDefault()
    openAndFocusPanel(item)
  }
}

function onTriggerFocus(item: AnimatedNavigationItem) {
  if (suppressFocusOpen) return
  if (item.children?.length) open(item.id)
  else close()
}

function onTriggerPointerEnter(event: PointerEvent, item: AnimatedNavigationItem) {
  if (event.pointerType === 'touch') return
  if (pointerOpenTimer) clearTimeout(pointerOpenTimer)
  pointerOpenTimer = setTimeout(() => {
    if (item.children?.length) open(item.id)
    else close()
  }, 90)
}

function onTriggerPointerLeave() {
  if (pointerOpenTimer) clearTimeout(pointerOpenTimer)
  pointerOpenTimer = undefined
}

function onTriggerPointerDown() {
  onTriggerPointerLeave()
  suppressFocusOpen = true
  if (pointerFocusTimer) clearTimeout(pointerFocusTimer)
  pointerFocusTimer = setTimeout(() => { suppressFocusOpen = false }, 0)
}

function toggle(item: AnimatedNavigationItem) {
  if (props.modelValue === item.id) close()
  else open(item.id)
}

async function restoreTriggerFocus() {
  const id = props.modelValue ?? restoreId
  close()
  await nextTick()
  suppressFocusOpen = true
  topElements.get(id ?? '')?.focus()
  queueMicrotask(() => { suppressFocusOpen = false })
}

function onRootKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.modelValue) return
  event.preventDefault()
  event.stopPropagation()
  restoreTriggerFocus()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (props.modelValue && !root.value?.contains(event.target as Node)) close()
}

watch(() => props.modelValue, (value) => {
  if (value) restoreId = value
  if (!value || !pendingDestinationFocus) return
  const destination = findDestination(pendingDestinationFocus)
  if (destination?.parentId !== value) return
  const id = pendingDestinationFocus
  pendingDestinationFocus = null
  focusDestination(id)
})

watch(() => props.disabled, (disabled) => {
  if (disabled && props.modelValue) close()
})

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  if (pointerFocusTimer) clearTimeout(pointerFocusTimer)
  if (pointerOpenTimer) clearTimeout(pointerOpenTimer)
})

defineExpose({ open, close, select, focus })
</script>

<template>
  <nav
    ref="root"
    class="animated-navigation-menu relative z-20 w-full rounded-[1.35rem] border border-[#18201b]/10 bg-[#fbfaf5]/95 p-1.5 text-[#18201b] shadow-[0_18px_60px_-34px_rgba(24,32,27,.6)] backdrop-blur-xl"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :data-open="modelValue ?? 'closed'"
    :data-active="activeValue ?? undefined"
    :style="rootStyle"
    data-testid="animated-navigation-menu"
    @keydown="onRootKeydown"
  >
    <div class="animated-navigation-scroll overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul class="animated-navigation-list flex min-w-max list-none items-center gap-1 p-0" data-testid="animated-navigation-list">
        <li v-for="item in items" :key="item.id" class="m-0 p-0">
          <button
            v-if="item.children?.length"
            :id="triggerId(item.id)"
            :ref="element => setTopElement(element, item.id)"
            type="button"
            class="animated-navigation-trigger group inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border-0 bg-transparent px-4 [font:inherit] text-xs font-semibold tracking-[-0.01em] text-[#18201b]/68 outline-none transition-[color,background-color,transform] hover:not-disabled:bg-[#18201b]/[.055] hover:not-disabled:text-[#18201b] active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#e4633f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
            :class="{ 'bg-[#18201b] text-white hover:not-disabled:bg-[#18201b] hover:not-disabled:text-white': modelValue === item.id, 'text-[#18201b]': item.children.some(child => child.id === activeValue) }"
            :disabled="disabled || item.disabled"
            :aria-expanded="modelValue === item.id"
            :aria-controls="panelId(item.id)"
            :data-state="modelValue === item.id ? 'open' : 'closed'"
            :data-testid="`animated-navigation-trigger-${item.id}`"
            @click="toggle(item)"
            @focus="onTriggerFocus(item)"
            @pointerdown="onTriggerPointerDown"
            @pointerenter="onTriggerPointerEnter($event, item)"
            @pointerleave="onTriggerPointerLeave"
            @keydown="onTopKeydown($event, item)"
          >
            {{ item.label }}
            <svg class="size-3.5 fill-none stroke-current stroke-[1.8] transition-transform motion-reduce:transition-none" :class="{ 'rotate-180': modelValue === item.id }" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </button>

          <a
            v-else-if="item.href && !item.disabled"
            :ref="element => setTopElement(element, item.id)"
            :href="item.href"
            class="animated-navigation-link inline-flex h-11 items-center rounded-2xl px-4 text-xs font-semibold tracking-[-0.01em] text-[#18201b]/68 no-underline outline-none transition-[color,background-color,transform] hover:bg-[#18201b]/[.055] hover:text-[#18201b] active:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#e4633f] focus-visible:ring-offset-2 motion-reduce:transition-none"
            :class="{ 'bg-[#f0c84b]/25 text-[#18201b]': activeValue === item.id }"
            :aria-current="activeValue === item.id ? 'page' : undefined"
            :data-testid="`animated-navigation-link-${item.id}`"
            @click="select(item.id)"
            @focus="onTriggerFocus(item)"
            @pointerdown="onTriggerPointerDown"
            @pointerenter="onTriggerPointerEnter($event, item)"
            @pointerleave="onTriggerPointerLeave"
            @keydown="onTopKeydown($event, item)"
          >{{ item.label }}</a>

          <button
            v-else
            :ref="element => setTopElement(element, item.id)"
            type="button"
            class="animated-navigation-link inline-flex h-11 cursor-pointer items-center rounded-2xl border-0 bg-transparent px-4 [font:inherit] text-xs font-semibold tracking-[-0.01em] text-[#18201b]/68 outline-none transition-[color,background-color,transform] hover:not-disabled:bg-[#18201b]/[.055] hover:not-disabled:text-[#18201b] active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-[#e4633f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
            :class="{ 'bg-[#f0c84b]/25 text-[#18201b]': activeValue === item.id }"
            :disabled="disabled || item.disabled"
            :aria-current="activeValue === item.id ? 'page' : undefined"
            :data-testid="`animated-navigation-link-${item.id}`"
            @click="select(item.id)"
            @focus="onTriggerFocus(item)"
            @pointerdown="onTriggerPointerDown"
            @pointerenter="onTriggerPointerEnter($event, item)"
            @pointerleave="onTriggerPointerLeave"
            @keydown="onTopKeydown($event, item)"
          >{{ item.label }}</button>
        </li>
      </ul>
    </div>

    <Transition name="animated-navigation-panel">
      <section
        v-if="openItem"
        :id="panelId(openItem.id)"
        :key="openItem.id"
        class="animated-navigation-panel absolute left-0 right-0 top-[calc(100%+.55rem)] overflow-hidden rounded-[1.5rem] border border-[#18201b]/10 bg-[#fbfaf5] p-3 shadow-[0_30px_80px_-38px_rgba(24,32,27,.72)] sm:p-4"
        :aria-labelledby="triggerId(openItem.id)"
        :data-value="openItem.id"
        data-testid="animated-navigation-panel"
      >
        <div class="grid gap-2 sm:grid-cols-[minmax(10rem,.72fr)_minmax(0,1.8fr)] sm:gap-3">
          <div class="flex min-h-28 flex-col justify-between rounded-[1.1rem] bg-[#18201b] p-4 text-white sm:min-h-36 sm:p-5">
            <span class="text-[9px] font-bold uppercase tracking-[.2em] text-[#f0c84b]">Explore</span>
            <div>
              <h2 class="text-lg font-semibold tracking-[-.035em]">{{ openItem.label }}</h2>
              <p v-if="openItem.description" class="mt-1 max-w-xs text-[11px] leading-5 text-white/55">{{ openItem.description }}</p>
            </div>
          </div>

          <ul class="grid list-none gap-1.5 p-0 sm:grid-cols-2">
            <li v-if="openItem.href" class="m-0 p-0">
              <a
                :ref="element => setDestinationElement(element, openItem?.id ?? '')"
                :href="openItem.href"
                class="group flex min-h-20 items-center justify-between gap-4 rounded-[1rem] border border-[#18201b]/8 bg-white/65 px-4 py-3 text-[#18201b] no-underline outline-none transition-[background-color,transform] hover:bg-[#f0c84b]/30 active:scale-[.99] focus-visible:ring-2 focus-visible:ring-[#e4633f] motion-reduce:transition-none"
                :aria-current="activeValue === openItem.id ? 'page' : undefined"
                :data-testid="`animated-navigation-item-${openItem.id}`"
                @click="select(openItem.id)"
              >
                <span>
                  <strong class="block text-xs font-semibold">All {{ openItem.label }}</strong>
                  <small class="mt-1 block text-[10px] leading-4 text-[#18201b]/48">Browse the complete collection</small>
                </span>
                <span class="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">&#8599;</span>
              </a>
            </li>

            <li v-for="child in openItem.children" :key="child.id" class="m-0 p-0">
              <a
                v-if="child.href && !child.disabled"
                :ref="element => setDestinationElement(element, child.id)"
                :href="child.href"
                class="group flex min-h-20 items-center justify-between gap-4 rounded-[1rem] border border-transparent px-4 py-3 text-[#18201b] no-underline outline-none transition-[background-color,border-color,transform] hover:border-[#18201b]/8 hover:bg-white active:scale-[.99] focus-visible:ring-2 focus-visible:ring-[#e4633f] motion-reduce:transition-none"
                :class="{ 'bg-[#f0c84b]/20': activeValue === child.id }"
                :aria-current="activeValue === child.id ? 'page' : undefined"
                :data-testid="`animated-navigation-item-${child.id}`"
                @click="select(child.id)"
              >
                <span>
                  <strong class="block text-xs font-semibold">{{ child.label }}</strong>
                  <small v-if="child.description" class="mt-1 block text-[10px] leading-4 text-[#18201b]/48">{{ child.description }}</small>
                </span>
                <span class="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">&#8599;</span>
              </a>
              <button
                v-else
                :ref="element => setDestinationElement(element, child.id)"
                type="button"
                class="group flex min-h-20 w-full cursor-pointer items-center justify-between gap-4 rounded-[1rem] border border-transparent bg-transparent px-4 py-3 text-left [font:inherit] text-[#18201b] outline-none transition-[background-color,border-color,transform] hover:not-disabled:border-[#18201b]/8 hover:not-disabled:bg-white active:not-disabled:scale-[.99] focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
                :class="{ 'bg-[#f0c84b]/20': activeValue === child.id }"
                :disabled="disabled || child.disabled"
                :aria-current="activeValue === child.id ? 'page' : undefined"
                :data-testid="`animated-navigation-item-${child.id}`"
                @click="select(child.id)"
              >
                <span>
                  <strong class="block text-xs font-semibold">{{ child.label }}</strong>
                  <small v-if="child.description" class="mt-1 block text-[10px] leading-4 text-[#18201b]/48">{{ child.description }}</small>
                </span>
                <span v-if="child.disabled" class="rounded-full bg-[#18201b]/5 px-2 py-1 text-[8px] font-bold uppercase tracking-wider">Soon</span>
                <span v-else class="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">&#8599;</span>
              </button>
            </li>
          </ul>
        </div>
      </section>
    </Transition>
  </nav>
</template>

<style scoped>
.animated-navigation-panel-enter-active,
.animated-navigation-panel-leave-active {
  transition:
    opacity var(--animated-navigation-duration) cubic-bezier(.16, 1, .3, 1),
    transform var(--animated-navigation-duration) cubic-bezier(.16, 1, .3, 1);
  transform-origin: top center;
}

.animated-navigation-panel-enter-from,
.animated-navigation-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(.985);
}

@media (prefers-reduced-motion: reduce) {
  .animated-navigation-panel-enter-active,
  .animated-navigation-panel-leave-active {
    transition: none !important;
  }
}
</style>
