<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface CropGeometry {
  x: number
  y: number
  width: number
  height: number
}

export type CropShape = 'rectangle' | 'circle'
type DragAction = 'move' | 'resize'

const props = withDefaults(defineProps<{
  modelValue: CropGeometry
  src: string
  alt?: string
  zoom?: number
  rotation?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  aspectRatio?: number
  minCropSize?: number
  shape?: CropShape
  duration?: number
  disabled?: boolean
  cropLabel?: string
  zoomLabel?: string
  rotationLabel?: string
}>(), {
  alt: '',
  zoom: 1,
  rotation: 0,
  minZoom: 1,
  maxZoom: 3,
  zoomStep: 0.05,
  aspectRatio: 1,
  minCropSize: 15,
  shape: 'rectangle',
  duration: 240,
  disabled: false,
  cropLabel: 'Crop selection',
  zoomLabel: 'Image zoom',
  rotationLabel: 'Image rotation',
})

const emit = defineEmits<{
  'update:modelValue': [crop: CropGeometry]
  'update:zoom': [zoom: number]
  'update:rotation': [rotation: number]
  cropStart: [crop: CropGeometry]
  crop: [crop: CropGeometry]
  cropEnd: [crop: CropGeometry]
}>()

const stage = ref<HTMLElement | null>(null)
const cropRegion = ref<HTMLElement | null>(null)
const stageSize = ref({ width: 0, height: 0 })
const dragging = ref(false)
const activeAction = ref<DragAction | null>(null)
let resizeObserver: ResizeObserver | null = null
let drag: {
  pointerId: number
  target: HTMLElement
  action: DragAction
  startX: number
  startY: number
  crop: CropGeometry
  latest: CropGeometry
} | null = null

const uid = useId()
const zoomId = `cropper-zoom-${uid}`
const rotationId = `cropper-rotation-${uid}`
const zoomBounds = computed(() => {
  const first = Number.isFinite(props.minZoom) ? Math.max(0.1, props.minZoom) : 1
  const second = Number.isFinite(props.maxZoom) ? Math.max(0.1, props.maxZoom) : 3
  return { min: Math.min(first, second), max: Math.max(first, second) }
})
const safeZoomStep = computed(() => Number.isFinite(props.zoomStep) && props.zoomStep > 0 ? props.zoomStep : 0.05)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 240)
const safeAspect = computed(() => Number.isFinite(props.aspectRatio) && props.aspectRatio > 0 ? props.aspectRatio : null)
const minimumSize = computed(() => Number.isFinite(props.minCropSize) ? Math.min(100, Math.max(1, props.minCropSize)) : 15)

function limit(value: number, min: number, max: number, fallback = min) {
  const numeric = Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, numeric))
}

function clean(value: number) {
  return Number(value.toFixed(3))
}

function normalizeCrop(source: CropGeometry): CropGeometry {
  let width = limit(source?.width, minimumSize.value, 100, 60)
  let height = limit(source?.height, minimumSize.value, 100, 60)
  if (safeAspect.value && stageSize.value.width > 0 && stageSize.value.height > 0) {
    height = width * stageSize.value.width / stageSize.value.height / safeAspect.value
    if (height > 100) {
      height = 100
      width = height * stageSize.value.height * safeAspect.value / stageSize.value.width
    }
    if (height < minimumSize.value) {
      height = minimumSize.value
      width = height * stageSize.value.height * safeAspect.value / stageSize.value.width
    }
  }
  width = Math.min(100, Math.max(minimumSize.value, width))
  height = Math.min(100, Math.max(minimumSize.value, height))
  return {
    x: clean(limit(source?.x, 0, 100 - width, (100 - width) / 2)),
    y: clean(limit(source?.y, 0, 100 - height, (100 - height) / 2)),
    width: clean(width),
    height: clean(height),
  }
}

const crop = computed(() => normalizeCrop(props.modelValue))
const safeZoom = computed(() => clean(limit(props.zoom, zoomBounds.value.min, zoomBounds.value.max, 1)))
const safeRotation = computed(() => clean(limit(props.rotation, -180, 180, 0)))
const cropStyle = computed(() => ({
  left: `${crop.value.x}%`,
  top: `${crop.value.y}%`,
  width: `${crop.value.width}%`,
  height: `${crop.value.height}%`,
  '--cropper-duration': `${safeDuration.value}ms`,
}))
const imageStyle = computed(() => ({
  transform: `scale(${safeZoom.value}) rotate(${safeRotation.value}deg)`,
  '--cropper-duration': `${safeDuration.value}ms`,
}))
const initialCrop = { ...props.modelValue }
const initialZoom = safeZoom.value
const initialRotation = safeRotation.value

function sameCrop(first: CropGeometry, second: CropGeometry) {
  return first.x === second.x && first.y === second.y && first.width === second.width && first.height === second.height
}

function updateCrop(next: CropGeometry, eventName: 'crop' | 'cropEnd' | 'api') {
  const normalized = normalizeCrop(next)
  if (!sameCrop(normalized, crop.value)) emit('update:modelValue', normalized)
  if (eventName === 'crop') emit('crop', normalized)
  if (eventName === 'cropEnd') emit('cropEnd', normalized)
  return normalized
}

function onPointerDown(event: PointerEvent, action: DragAction) {
  if (props.disabled || event.button !== 0) return
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  drag = {
    pointerId: event.pointerId,
    target,
    action,
    startX: event.clientX,
    startY: event.clientY,
    crop: { ...crop.value },
    latest: { ...crop.value },
  }
  activeAction.value = action
  dragging.value = true
  cropRegion.value?.focus()
  emit('cropStart', { ...crop.value })
}

function resizedCrop(start: CropGeometry, dx: number, dy: number) {
  if (!safeAspect.value || stageSize.value.width <= 0 || stageSize.value.height <= 0) {
    return {
      ...start,
      width: limit(start.width + dx, minimumSize.value, 100 - start.x),
      height: limit(start.height + dy, minimumSize.value, 100 - start.y),
    }
  }
  const ratio = stageSize.value.width / stageSize.value.height / safeAspect.value
  const fromX = start.width + dx
  const fromY = (start.height + dy) / ratio
  const requestedWidth = Math.abs(dx * stageSize.value.width) >= Math.abs(dy * stageSize.value.height) ? fromX : fromY
  const minimumWidth = Math.max(minimumSize.value, minimumSize.value / ratio)
  const maximumWidth = Math.min(100 - start.x, (100 - start.y) / ratio)
  const width = limit(requestedWidth, Math.min(minimumWidth, maximumWidth), maximumWidth)
  return { ...start, width, height: width * ratio }
}

function onPointerMove(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId || stageSize.value.width <= 0 || stageSize.value.height <= 0) return
  const dx = (event.clientX - drag.startX) / stageSize.value.width * 100
  const dy = (event.clientY - drag.startY) / stageSize.value.height * 100
  const next = drag.action === 'move'
    ? { ...drag.crop, x: drag.crop.x + dx, y: drag.crop.y + dy }
    : resizedCrop(drag.crop, dx, dy)
  drag.latest = updateCrop(next, 'crop')
}

function finishPointer(event?: PointerEvent) {
  if (!drag || (event && event.pointerId !== drag.pointerId)) return
  const current = drag
  drag = null
  dragging.value = false
  activeAction.value = null
  if (current.target.hasPointerCapture(current.pointerId)) current.target.releasePointerCapture(current.pointerId)
  emit('cropEnd', { ...current.latest })
}

function onCropKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const amount = event.shiftKey ? 5 : 1
  let x = crop.value.x
  let y = crop.value.y
  if (event.key === 'ArrowLeft') x -= amount
  else if (event.key === 'ArrowRight') x += amount
  else if (event.key === 'ArrowUp') y -= amount
  else if (event.key === 'ArrowDown') y += amount
  else return
  event.preventDefault()
  const next = updateCrop({ ...crop.value, x, y }, 'api')
  emit('cropEnd', next)
}

function onResizeKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const amount = event.shiftKey ? 5 : 1
  let delta = 0
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') delta = -amount
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') delta = amount
  else return
  event.preventDefault()
  event.stopPropagation()
  const next = updateCrop(resizedCrop(crop.value, delta, delta), 'api')
  emit('cropEnd', next)
}

function setZoom(value: number) {
  if (props.disabled) return
  emit('update:zoom', clean(limit(value, zoomBounds.value.min, zoomBounds.value.max, safeZoom.value)))
}

function setRotation(value: number) {
  if (props.disabled) return
  emit('update:rotation', clean(limit(value, -180, 180, safeRotation.value)))
}

function onZoomInput(event: Event) {
  setZoom(Number((event.currentTarget as HTMLInputElement).value))
}

function onRotationInput(event: Event) {
  setRotation(Number((event.currentTarget as HTMLInputElement).value))
}

function reset() {
  if (props.disabled) return
  updateCrop(initialCrop, 'api')
  setZoom(initialZoom)
  setRotation(initialRotation)
}

function focus() {
  cropRegion.value?.focus()
}

watch(() => props.disabled, (disabled) => {
  if (disabled) finishPointer()
})

onMounted(() => {
  if (!stage.value) return
  const measure = () => {
    if (!stage.value) return
    const rect = stage.value.getBoundingClientRect()
    stageSize.value = { width: rect.width, height: rect.height }
  }
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(stage.value)
})

onBeforeUnmount(() => {
  finishPointer()
  resizeObserver?.disconnect()
})

defineExpose({ reset, focus, setZoom, setRotation })
</script>

<template>
  <div data-slot="animated-image-cropper" data-testid="image-cropper" class="w-full" :class="{ 'opacity-55': disabled }">
    <div
      ref="stage"
      data-slot="crop-stage"
      data-testid="cropper-stage"
      class="relative isolate aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#171814]"
    >
      <img
        :src="src"
        :alt="alt"
        draggable="false"
        class="cropper-image pointer-events-none absolute inset-0 size-full select-none object-cover"
        :class="{ 'cropper-image--dragging': dragging }"
        :style="imageStyle"
      >
      <div class="pointer-events-none absolute inset-0 bg-black/10" aria-hidden="true" />

      <div
        ref="cropRegion"
        data-slot="crop-region"
        data-testid="cropper-region"
        role="group"
        :tabindex="disabled ? -1 : 0"
        :aria-label="cropLabel"
        :aria-disabled="disabled"
        :aria-description="`Position ${Math.round(crop.x)} by ${Math.round(crop.y)} percent. Size ${Math.round(crop.width)} by ${Math.round(crop.height)} percent.`"
        class="cropper-region absolute z-10 touch-none cursor-move border-2 border-white outline-none shadow-[0_0_0_9999px_rgba(9,10,8,.58),0_0_0_1px_rgba(0,0,0,.2)_inset] focus-visible:ring-3 focus-visible:ring-[var(--registry-accent,#d9ff57)]"
        :class="[
          shape === 'circle' ? 'rounded-full' : 'rounded-sm',
          { 'cropper-region--dragging': dragging, 'cursor-not-allowed': disabled },
        ]"
        :style="cropStyle"
        @keydown="onCropKeydown"
        @pointerdown="onPointerDown($event, 'move')"
        @pointermove="onPointerMove"
        @pointerup="finishPointer"
        @pointercancel="finishPointer"
        @lostpointercapture="finishPointer"
      >
        <span aria-hidden="true" class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 overflow-hidden" :class="shape === 'circle' ? 'rounded-full' : ''">
          <i v-for="line in 4" :key="line" class="border-r border-b border-white/30 last:border-r-0" />
        </span>
        <span aria-hidden="true" class="absolute -left-1 -top-1 size-3 border-l-2 border-t-2 border-white" />
        <span aria-hidden="true" class="absolute -right-1 -top-1 size-3 border-r-2 border-t-2 border-white" />
        <span aria-hidden="true" class="absolute -bottom-1 -left-1 size-3 border-b-2 border-l-2 border-white" />
        <button
          type="button"
          data-testid="cropper-resize-handle"
          class="absolute -bottom-3 -right-3 z-20 grid size-7 touch-none cursor-nwse-resize place-items-center rounded-full border-2 border-white bg-[#171814] text-white shadow-lg outline-none focus-visible:ring-3 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed"
          :disabled="disabled"
          aria-label="Resize crop selection"
          @keydown="onResizeKeydown"
          @pointerdown.stop="onPointerDown($event, 'resize')"
          @pointermove="onPointerMove"
          @pointerup="finishPointer"
          @pointercancel="finishPointer"
          @lostpointercapture="finishPointer"
        ><span class="size-2 border-b border-r border-current" /></button>
      </div>
    </div>

    <div class="mt-4 grid gap-4 rounded-2xl border border-black/10 bg-white/75 p-4 sm:grid-cols-2">
      <label :for="zoomId" class="grid gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-black/55">
        <span class="flex items-center justify-between"><span>{{ zoomLabel }}</span><output class="tabular-nums text-black">{{ safeZoom.toFixed(2) }}x</output></span>
        <input :id="zoomId" data-testid="cropper-zoom" class="accent-[#171814] disabled:cursor-not-allowed" type="range" :min="zoomBounds.min" :max="zoomBounds.max" :step="safeZoomStep" :value="safeZoom" :disabled="disabled" @input="onZoomInput">
      </label>
      <label :for="rotationId" class="grid gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-black/55">
        <span class="flex items-center justify-between"><span>{{ rotationLabel }}</span><output class="tabular-nums text-black">{{ Math.round(safeRotation) }}&deg;</output></span>
        <input :id="rotationId" data-testid="cropper-rotation" class="accent-[#171814] disabled:cursor-not-allowed" type="range" min="-180" max="180" step="1" :value="safeRotation" :disabled="disabled" @input="onRotationInput">
      </label>
    </div>
  </div>
</template>

<style scoped>
.cropper-image,
.cropper-region {
  transition-duration: var(--cropper-duration);
  transition-property: transform, left, top, width, height;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.cropper-image--dragging,
.cropper-region--dragging {
  transition-duration: 0ms;
}

@media (prefers-reduced-motion: reduce) {
  .cropper-image,
  .cropper-region {
    transition-duration: 0ms;
  }
}
</style>
