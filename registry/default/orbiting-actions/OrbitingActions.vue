<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface OrbitingAction {
  id: string
  label: string
  symbol?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: OrbitingAction[]
  radius?: number
  duration?: number
  direction?: 'clockwise' | 'counter-clockwise'
  paused?: boolean
  pauseOnHover?: boolean
  ariaLabel?: string
}>(), {
  radius: 116,
  duration: 18,
  direction: 'clockwise',
  paused: false,
  pauseOnHover: true,
  ariaLabel: 'Orbiting actions',
})

const model = defineModel<string | null>({ default: null })
const emit = defineEmits<{
  select: [item: OrbitingAction]
}>()

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const itemElements = new Map<string, HTMLElement>()
const animations: Animation[] = []
const hovered = ref(false)
const focusWithin = ref(false)
const reducedMotion = ref(false)

let motionQuery: MediaQueryList | undefined

const safeRadius = computed(() => Math.min(Math.max(props.radius, 72), 180))
const size = computed(() => safeRadius.value * 2 + 80)
const selectedItem = computed(() => props.items.find(item => item.id === model.value))
const shouldPause = computed(() => props.paused || (props.pauseOnHover && (hovered.value || focusWithin.value)))

function angleFor(index: number) {
  return (360 / Math.max(props.items.length, 1)) * index - 90
}

function setItemElement(id: string, element: unknown) {
  if (element instanceof HTMLElement) itemElements.set(id, element)
  else itemElements.delete(id)
}

function cancelAnimations() {
  animations.splice(0).forEach(animation => animation.cancel())
}

function syncPlayback() {
  for (const animation of animations) {
    if (shouldPause.value) animation.pause()
    else animation.play()
  }
}

async function createAnimations() {
  await nextTick()
  cancelAnimations()

  if (!track.value || reducedMotion.value || props.items.length === 0) return

  const turn = props.direction === 'clockwise' ? 360 : -360
  const timing: KeyframeAnimationOptions = {
    duration: Math.max(props.duration, 1) * 1000,
    easing: 'linear',
    iterations: Infinity,
  }

  animations.push(track.value.animate([
    { transform: 'rotate(0deg)' },
    { transform: `rotate(${turn}deg)` },
  ], timing))

  props.items.forEach((item, index) => {
    const element = itemElements.get(item.id)
    if (!element) return

    const angle = angleFor(index)
    animations.push(element.animate([
      { transform: `translate(-50%, -50%) rotate(${-angle}deg)` },
      { transform: `translate(-50%, -50%) rotate(${-angle - turn}deg)` },
    ], timing))
  })

  syncPlayback()
}

function selectItem(item: OrbitingAction) {
  if (item.disabled) return
  model.value = item.id
  emit('select', item)
}

function handleFocusOut() {
  nextTick(() => {
    focusWithin.value = Boolean(root.value?.contains(document.activeElement))
  })
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  createAnimations()
}

watch(
  () => [props.duration, props.direction, props.items.map(item => item.id).join('|')],
  createAnimations,
)
watch(shouldPause, syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  createAnimations()
})

onBeforeUnmount(() => {
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <div
    ref="root"
    class="orbiting-actions relative grid max-w-full shrink-0 place-items-center overflow-visible"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="group"
    :aria-label="ariaLabel"
    :data-paused="shouldPause || reducedMotion ? '' : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focusWithin = true"
    @focusout="handleFocusOut"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute rounded-full border border-dashed border-border/80"
      :style="{ width: `${safeRadius * 2}px`, height: `${safeRadius * 2}px` }"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute rounded-full border border-border/40"
      :style="{ width: `${safeRadius * 1.24}px`, height: `${safeRadius * 1.24}px` }"
    />

    <div ref="track" class="orbiting-actions-track pointer-events-none absolute inset-0 will-change-transform">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="pointer-events-auto absolute left-1/2 top-1/2 size-0"
        :style="{ transform: `rotate(${angleFor(index)}deg) translateX(${safeRadius}px)` }"
      >
        <button
          :ref="element => setItemElement(item.id, element)"
          type="button"
          class="orbiting-action group absolute grid size-12 place-items-center rounded-2xl border border-border bg-card text-sm font-semibold text-foreground shadow-lg shadow-black/10 outline-none transition-[background-color,border-color,box-shadow,opacity] hover:border-primary/50 hover:bg-accent focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-35 data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:shadow-primary/20"
          :style="{ transform: `translate(-50%, -50%) rotate(${-angleFor(index)}deg)` }"
          :disabled="item.disabled"
          :aria-label="item.label"
          :aria-pressed="model === item.id"
          :data-selected="model === item.id"
          @click="selectItem(item)"
        >
          <slot name="item" :item="item" :selected="model === item.id">
            <span aria-hidden="true">{{ item.symbol ?? item.label.slice(0, 1) }}</span>
          </slot>
          <span class="pointer-events-none absolute left-1/2 top-[calc(100%+0.45rem)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>

    <div class="relative z-10 grid size-28 place-items-center rounded-full border border-border bg-card/95 p-4 text-center shadow-xl shadow-black/10 backdrop-blur">
      <slot :selected="selectedItem">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected</p>
          <p class="mt-1 text-sm font-semibold text-foreground">{{ selectedItem?.label ?? 'Choose one' }}</p>
        </div>
      </slot>
    </div>

    <p class="sr-only" aria-live="polite">
      {{ selectedItem ? `${selectedItem.label} selected` : '' }}
    </p>
  </div>
</template>
