<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedBottomNavigationItem {
  value: string
  label: string
  badge?: string | number
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string
  items: AnimatedBottomNavigationItem[]
  label?: string
  duration?: number
  hideLabels?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  label: 'Primary navigation',
  duration: 320,
  hideLabels: false,
  safeArea: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [next: string, previous: string]
}>()

const list = ref<HTMLElement>()
const buttons = new Map<string, HTMLButtonElement>()
const rovingValue = ref('')
const indicator = ref<{ x: number, width: number }>()
let resizeObserver: ResizeObserver | undefined
let animationFrame: number | undefined
let mounted = false

const enabledItems = computed(() => props.items.filter(item => !item.disabled))
const duration = computed(() => {
  const value = Number.isFinite(props.duration) ? props.duration : 0
  return Math.min(2000, Math.max(0, value))
})
const rootStyle = computed(() => ({
  '--bottom-navigation-duration': `${duration.value}ms`,
  '--bottom-navigation-safe-area': props.safeArea
    ? 'max(0.5rem, env(safe-area-inset-bottom))'
    : '0.5rem',
}))
const indicatorStyle = computed(() => ({
  opacity: indicator.value ? '1' : '0',
  transform: `translate3d(${indicator.value?.x ?? 0}px, 0, 0)`,
  width: `${indicator.value?.width ?? 0}px`,
}))

function setButton(element: unknown, value: string) {
  if (element instanceof HTMLButtonElement) buttons.set(value, element)
  else buttons.delete(value)

  if (mounted) nextTick(refreshMeasurements)
}

function measureIndicator() {
  animationFrame = undefined
  const container = list.value
  const button = buttons.get(props.modelValue)
  const item = props.items.find(candidate => candidate.value === props.modelValue)

  if (!container || !button || props.disabled || item?.disabled) {
    indicator.value = undefined
    return
  }

  const containerRect = container.getBoundingClientRect()
  const buttonRect = button.getBoundingClientRect()
  indicator.value = {
    x: buttonRect.left - containerRect.left + container.scrollLeft,
    width: buttonRect.width,
  }
}

function scheduleMeasure() {
  if (!mounted) return
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(measureIndicator)
}

function refreshMeasurements() {
  resizeObserver?.disconnect()
  if (resizeObserver) {
    if (list.value) resizeObserver.observe(list.value)
    buttons.forEach(button => resizeObserver?.observe(button))
  }
  scheduleMeasure()
}

function select(value: string) {
  const item = props.items.find(candidate => candidate.value === value)
  if (props.disabled || !item || item.disabled) return false

  const previous = props.modelValue
  rovingValue.value = value
  if (value === previous) return true

  emit('update:modelValue', value)
  emit('change', value, previous)
  return true
}

function focusValue(value: string) {
  rovingValue.value = value
  nextTick(() => buttons.get(value)?.focus())
}

function moveFocus(value: string, direction: 1 | -1) {
  if (props.disabled || !enabledItems.value.length) return

  const currentIndex = enabledItems.value.findIndex(item => item.value === value)
  const fallback = direction === 1 ? -1 : 0
  const nextIndex = (Math.max(currentIndex, fallback) + direction + enabledItems.value.length) % enabledItems.value.length
  focusValue(enabledItems.value[nextIndex]!.value)
}

function onKeydown(event: KeyboardEvent, value: string) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveFocus(value, 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveFocus(value, -1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    const first = enabledItems.value[0]
    if (first) focusValue(first.value)
  } else if (event.key === 'End') {
    event.preventDefault()
    const last = enabledItems.value.at(-1)
    if (last) focusValue(last.value)
  }
}

function focusSelected() {
  if (props.disabled) return false
  const target = enabledItems.value.find(item => item.value === props.modelValue) ?? enabledItems.value[0]
  if (!target) return false
  focusValue(target.value)
  return true
}

function buttonLabel(item: AnimatedBottomNavigationItem) {
  if (item.badge === undefined) return item.label
  const badge = typeof item.badge === 'number' ? `${item.badge} notifications` : item.badge
  return `${item.label}, ${badge}`
}

watch([() => props.modelValue, enabledItems, () => props.disabled], ([value, available, disabled]) => {
  if (disabled || !available.length) {
    rovingValue.value = ''
    return
  }

  if (available.some(item => item.value === value)) rovingValue.value = value
  else if (!available.some(item => item.value === rovingValue.value)) rovingValue.value = available[0]!.value
}, { immediate: true })

watch([
  () => props.modelValue,
  () => props.disabled,
  () => props.hideLabels,
  () => props.items.map(item => `${item.value}:${item.label}:${item.badge ?? ''}:${Boolean(item.disabled)}`).join('|'),
], () => nextTick(refreshMeasurements), { flush: 'post' })

onMounted(() => {
  mounted = true
  if (typeof ResizeObserver !== 'undefined') resizeObserver = new ResizeObserver(scheduleMeasure)
  nextTick(refreshMeasurements)
})

onBeforeUnmount(() => {
  mounted = false
  resizeObserver?.disconnect()
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
})

defineExpose({ select, focusSelected })
</script>

<template>
  <nav
    class="animated-bottom-navigation w-full rounded-[1.4rem] border border-border/80 bg-background/95 p-2 pb-[var(--bottom-navigation-safe-area)] text-foreground shadow-[0_18px_50px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :style="rootStyle"
    :data-value="modelValue"
    data-testid="animated-bottom-navigation"
  >
    <div ref="list" class="animated-bottom-navigation-list relative flex items-stretch">
      <span
        class="animated-bottom-navigation-indicator pointer-events-none absolute inset-y-0 left-0 z-0 rounded-[1rem] bg-foreground shadow-[0_10px_24px_-14px_rgba(0,0,0,0.8)]"
        :style="indicatorStyle"
        aria-hidden="true"
        data-testid="animated-bottom-navigation-indicator"
      />

      <button
        v-for="item in items"
        :key="item.value"
        :ref="element => setButton(element, item.value)"
        type="button"
        class="animated-bottom-navigation-item group relative z-10 flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[1rem] border-0 bg-transparent px-1.5 py-2 [font:inherit] text-muted-foreground outline-none transition-[color,transform,opacity] hover:not-disabled:text-foreground active:not-disabled:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
        :class="modelValue === item.value && !item.disabled && !disabled ? 'text-background hover:text-background' : ''"
        :disabled="disabled || item.disabled"
        :tabindex="!disabled && !item.disabled && rovingValue === item.value ? 0 : -1"
        :aria-current="modelValue === item.value ? 'page' : undefined"
        :aria-label="buttonLabel(item)"
        :data-state="modelValue === item.value ? 'active' : 'inactive'"
        :data-value="item.value"
        :data-testid="modelValue === item.value ? 'animated-bottom-navigation-current' : `animated-bottom-navigation-${item.value}`"
        @click="select(item.value)"
        @focus="rovingValue = item.value"
        @keydown="onKeydown($event, item.value)"
      >
        <span class="relative grid size-5 shrink-0 place-items-center [&_svg]:size-5" aria-hidden="true">
          <slot :name="`item-${item.value}`" :item="item">
            <slot name="icon" :item="item">
              <span class="text-sm font-bold uppercase">{{ item.label.slice(0, 1) }}</span>
            </slot>
          </slot>
          <span
            v-if="item.badge !== undefined"
            class="absolute -right-2.5 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-background bg-destructive px-0.5 text-[9px] font-bold leading-none text-destructive-foreground transition-colors group-data-[state=active]:border-foreground motion-reduce:transition-none"
            aria-hidden="true"
          >{{ item.badge }}</span>
        </span>
        <span
          class="max-w-full truncate text-[10px] font-semibold leading-none tracking-[-0.01em] sm:text-[11px]"
          :class="hideLabels ? 'sr-only' : ''"
        >{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.animated-bottom-navigation-list {
  isolation: isolate;
}

.animated-bottom-navigation-indicator {
  transition:
    transform var(--bottom-navigation-duration) cubic-bezier(.16, 1, .3, 1),
    width var(--bottom-navigation-duration) cubic-bezier(.16, 1, .3, 1),
    opacity 120ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .animated-bottom-navigation-indicator {
    transition-duration: 0ms;
  }
}
</style>
