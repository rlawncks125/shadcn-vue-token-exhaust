<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, type CSSProperties } from 'vue'

export interface AnimatedLightboxImage {
  id: string
  src: string
  alt: string
  caption?: string
  credit?: string
  thumbnail?: string
}

type ChangeSource = 'thumbnail' | 'previous' | 'next' | 'keyboard' | 'swipe' | 'api'

const props = withDefaults(defineProps<{
  images: AnimatedLightboxImage[]
  modelValue: number
  open: boolean
  duration?: number
  loop?: boolean
  zoomable?: boolean
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  safeArea?: boolean
  label?: string
  disabled?: boolean
}>(), {
  duration: 320,
  loop: true,
  zoomable: true,
  closeOnBackdrop: true,
  lockScroll: true,
  safeArea: true,
  label: 'Image gallery',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [index: number]
  'update:open': [open: boolean]
  change: [image: AnimatedLightboxImage, index: number, source: ChangeSource]
  openChange: [open: boolean]
}>()

const uid = useId()
const dialogId = `animated-lightbox-${uid}`
const gallery = ref<HTMLElement | null>(null)
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const zoom = ref(1)
const reducedMotion = ref(false)

let mounted = false
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let scrollLocked = false
let motionQuery: MediaQueryList | undefined
let activePointerId: number | null = null
let pointerStartX = 0
let pointerStartY = 0
let pointerTarget: HTMLElement | null = null

const currentIndex = computed(() => {
  if (!props.images.length) return 0
  const index = Number.isFinite(props.modelValue) ? Math.trunc(props.modelValue) : 0
  return Math.min(Math.max(index, 0), props.images.length - 1)
})
const currentImage = computed(() => props.images[currentIndex.value])
const canPrevious = computed(() => props.images.length > 1 && (props.loop || currentIndex.value > 0))
const canNext = computed(() => props.images.length > 1 && (props.loop || currentIndex.value < props.images.length - 1))
const transitionDuration = computed(() => reducedMotion.value || !Number.isFinite(props.duration) ? 0 : Math.max(0, props.duration))
const transitionStyle = computed<CSSProperties>(() => ({
  '--lightbox-duration': `${transitionDuration.value}ms`,
  '--lightbox-safe-top': props.safeArea ? 'env(safe-area-inset-top)' : '0px',
  '--lightbox-safe-bottom': props.safeArea ? 'env(safe-area-inset-bottom)' : '0px',
}))
const imageStyle = computed<CSSProperties>(() => ({ transform: `scale(${zoom.value})` }))
const positionText = computed(() => currentImage.value
  ? `Image ${currentIndex.value + 1} of ${props.images.length}: ${currentImage.value.alt}`
  : 'No images available')

function focusableElements(): HTMLElement[] {
  if (!dialog.value) return []
  return Array.from(dialog.value.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )).filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function lockPageScroll(): void {
  if (scrollLocked || !props.lockScroll) return
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  scrollLocked = true
}

function unlockScroll(): void {
  if (!scrollLocked) return
  document.body.style.overflow = previousOverflow
  scrollLocked = false
}

function focus(): void {
  if (props.open) (closeButton.value ?? dialog.value)?.focus()
  else gallery.value?.focus()
}

async function activateDialog(): Promise<void> {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lockPageScroll()
  resetZoomValue()
  await nextTick()
  focus()
}

function restoreFocus(): void {
  unlockScroll()
  if (previousFocus?.isConnected) previousFocus.focus()
  else gallery.value?.focus()
  previousFocus = null
}

function requestOpen(value: boolean): void {
  if (value === props.open || (value && (props.disabled || !props.images.length))) return
  emit('update:open', value)
  emit('openChange', value)
}

function setIndex(index: number, source: ChangeSource): void {
  if (props.disabled || !props.images.length || !Number.isFinite(index)) return

  const count = props.images.length
  const nextIndex = props.loop
    ? (Math.trunc(index) + count) % count
    : Math.min(Math.max(Math.trunc(index), 0), count - 1)

  if (nextIndex === props.modelValue) return
  resetZoomValue()
  emit('update:modelValue', nextIndex)
  emit('change', props.images[nextIndex]!, nextIndex, source)
}

function openAt(index: number): void {
  if (props.disabled || !props.images.length) return
  setIndex(index, 'api')
  requestOpen(true)
}

function close(): void {
  requestOpen(false)
}

function previous(source: ChangeSource = 'previous'): void {
  if (canPrevious.value) setIndex(currentIndex.value - 1, source)
}

function next(source: ChangeSource = 'next'): void {
  if (canNext.value) setIndex(currentIndex.value + 1, source)
}

function resetZoomValue(): void {
  zoom.value = 1
}

function resetZoom(): void {
  if (props.zoomable) resetZoomValue()
}

function changeZoom(amount: number): void {
  if (!props.zoomable || props.disabled) return
  zoom.value = Math.min(3, Math.max(1, Number((zoom.value + amount).toFixed(2))))
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'Tab') {
    const elements = focusableElements()
    if (!elements.length) {
      event.preventDefault()
      dialog.value?.focus()
      return
    }

    const first = elements[0]!
    const last = elements[elements.length - 1]!
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog.value || !dialog.value?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || active === dialog.value || !dialog.value?.contains(active))) {
      event.preventDefault()
      first.focus()
    }
    return
  }

  if (props.disabled) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previous('keyboard')
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    next('keyboard')
  } else if (props.zoomable && (event.key === '+' || event.key === '=')) {
    event.preventDefault()
    changeZoom(0.25)
  } else if (props.zoomable && (event.key === '-' || event.key === '_')) {
    event.preventDefault()
    changeZoom(-0.25)
  } else if (props.zoomable && event.key === '0') {
    event.preventDefault()
    resetZoom()
  }
}

function handlePointerDown(event: PointerEvent): void {
  if (props.disabled || zoom.value > 1 || event.button !== 0 || !event.isPrimary || props.images.length < 2) return
  activePointerId = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  pointerTarget = event.currentTarget as HTMLElement
  pointerTarget.setPointerCapture(event.pointerId)
}

function cleanupPointer(pointerId?: number): void {
  if (pointerTarget && pointerId !== undefined && pointerTarget.hasPointerCapture(pointerId)) {
    pointerTarget.releasePointerCapture(pointerId)
  }
  activePointerId = null
  pointerTarget = null
}

function handlePointerUp(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return
  const deltaX = event.clientX - pointerStartX
  const deltaY = event.clientY - pointerStartY
  cleanupPointer(event.pointerId)
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return
  if (deltaX < 0) next('swipe')
  else previous('swipe')
}

function handlePointerCancel(event: PointerEvent): void {
  if (activePointerId === event.pointerId) cleanupPointer(event.pointerId)
}

function handleAfterLeave(): void {
  if (!props.open) restoreFocus()
}

function handleMotionChange(event: MediaQueryListEvent): void {
  reducedMotion.value = event.matches
}

watch(() => props.open, (isOpen) => {
  if (!mounted) return
  if (isOpen) activateDialog()
  else if (activePointerId !== null) cleanupPointer(activePointerId)
})

watch(() => props.modelValue, () => {
  resetZoomValue()
})

watch(() => props.images.length, (length) => {
  if (!length && props.open) close()
})

watch(() => props.lockScroll, (lock) => {
  if (!props.open) return
  if (lock) lockPageScroll()
  else unlockScroll()
})

onMounted(() => {
  mounted = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  document.addEventListener('keydown', handleKeydown)
  if (props.open) activateDialog()
})

onBeforeUnmount(() => {
  mounted = false
  if (activePointerId !== null) cleanupPointer(activePointerId)
  motionQuery?.removeEventListener('change', handleMotionChange)
  document.removeEventListener('keydown', handleKeydown)
  unlockScroll()
})

defineExpose({ openAt, close, next, previous, resetZoom, focus })
</script>

<template>
  <section
    ref="gallery"
    class="animated-lightbox-gallery w-full outline-none"
    role="region"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    tabindex="-1"
    data-testid="animated-lightbox-gallery"
  >
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        type="button"
        class="animated-lightbox-thumbnail group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted text-left outline-none ring-offset-2 ring-offset-background transition-[transform,opacity] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
        :class="index === currentIndex ? 'ring-2 ring-foreground/60' : ''"
        :disabled="disabled"
        :aria-label="`Open image ${index + 1} of ${images.length}: ${image.alt}`"
        :aria-current="index === currentIndex ? 'true' : undefined"
        :data-testid="`animated-lightbox-thumbnail-${index}`"
        @click="openAt(index)"
      >
        <img :src="image.thumbnail ?? image.src" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy">
        <span class="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          <span>{{ image.caption || `Image ${index + 1}` }}</span>
          <span aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
        </span>
      </button>
    </div>

    <p v-if="!images.length" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground" data-testid="animated-lightbox-empty">
      No images available.
    </p>
  </section>

  <Teleport to="body">
    <Transition name="animated-lightbox" :duration="transitionDuration" @after-leave="handleAfterLeave">
      <div
        v-if="open"
        class="animated-lightbox-backdrop fixed inset-0 z-[100] flex bg-[#090a08]/95 text-white backdrop-blur-md"
        :style="transitionStyle"
        data-testid="animated-lightbox-backdrop"
        @click.self="closeOnBackdrop && close()"
      >
        <section
          :id="dialogId"
          ref="dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
          class="animated-lightbox-dialog relative m-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 outline-none sm:m-3 sm:rounded-2xl"
          data-testid="animated-lightbox-dialog"
        >
          <header class="relative z-20 flex h-[calc(4rem+var(--lightbox-safe-top))] shrink-0 items-center justify-between border-b border-white/10 px-3 pt-[var(--lightbox-safe-top)] sm:h-[calc(5rem+var(--lightbox-safe-top))] sm:px-6">
            <div class="min-w-0">
              <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">{{ label }}</p>
              <p class="mt-1 text-xs tabular-nums text-white/75" data-testid="animated-lightbox-position">
                {{ images.length ? `${currentIndex + 1} / ${images.length}` : '0 / 0' }}
              </p>
            </div>

            <div class="flex items-center gap-1.5">
              <div v-if="zoomable" class="mr-1 flex items-center rounded-full border border-white/15 bg-white/5 p-1">
                <button type="button" class="animated-lightbox-control" :disabled="disabled || zoom <= 1" aria-label="Zoom out" data-testid="animated-lightbox-zoom-out" @click="changeZoom(-0.25)">
                  <span aria-hidden="true">&minus;</span>
                </button>
                <button type="button" class="min-w-12 rounded-full px-2 py-2 text-[10px] font-semibold tabular-nums text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white" :disabled="disabled || zoom === 1" aria-label="Reset zoom" data-testid="animated-lightbox-zoom-reset" @click="resetZoom">
                  {{ Math.round(zoom * 100) }}%
                </button>
                <button type="button" class="animated-lightbox-control" :disabled="disabled || zoom >= 3" aria-label="Zoom in" data-testid="animated-lightbox-zoom-in" @click="changeZoom(0.25)">
                  <span aria-hidden="true">+</span>
                </button>
              </div>
              <button ref="closeButton" type="button" class="animated-lightbox-control border border-white/15 bg-white/5" aria-label="Close lightbox" data-testid="animated-lightbox-close" @click="close">
                <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
          </header>

          <div class="relative min-h-0 flex-1">
            <button
              type="button"
              class="animated-lightbox-nav left-3 sm:left-6"
              :disabled="disabled || !canPrevious"
              aria-label="Previous image"
              data-testid="animated-lightbox-previous"
              @click="previous()"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            <div
              ref="stage"
              class="animated-lightbox-stage flex h-full touch-pan-y select-none items-center justify-center overflow-hidden px-4 pb-[calc(1.25rem+var(--lightbox-safe-bottom))] pt-5 sm:px-24 sm:pb-[calc(2rem+var(--lightbox-safe-bottom))] sm:pt-8"
              data-testid="animated-lightbox-stage"
              @pointerdown="handlePointerDown"
              @pointerup="handlePointerUp"
              @pointercancel="handlePointerCancel"
              @lostpointercapture="handlePointerCancel"
            >
              <Transition name="animated-lightbox-image" mode="out-in" :duration="transitionDuration">
                <figure v-if="currentImage" :key="currentImage.id" class="flex h-full w-full flex-col items-center justify-center">
                  <div class="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                    <img
                      :src="currentImage.src"
                      :alt="currentImage.alt"
                      draggable="false"
                      class="animated-lightbox-image max-h-full max-w-full object-contain shadow-[0_30px_100px_rgba(0,0,0,.45)]"
                      :style="imageStyle"
                      data-testid="animated-lightbox-image"
                    >
                  </div>
                  <figcaption v-if="currentImage.caption || currentImage.credit" class="mt-4 w-full max-w-4xl shrink-0 text-center sm:mt-5">
                    <p v-if="currentImage.caption" class="text-sm font-medium tracking-tight text-white/90 sm:text-base">{{ currentImage.caption }}</p>
                    <p v-if="currentImage.credit" class="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">{{ currentImage.credit }}</p>
                  </figcaption>
                </figure>
                <p v-else key="empty" class="text-sm text-white/55">No images available.</p>
              </Transition>
            </div>

            <button
              type="button"
              class="animated-lightbox-nav right-3 sm:right-6"
              :disabled="disabled || !canNext"
              aria-label="Next image"
              data-testid="animated-lightbox-next"
              @click="next()"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <p class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="animated-lightbox-announcement">
            {{ positionText }}
          </p>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.animated-lightbox-control {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 9999px;
  color: rgb(255 255 255 / 0.8);
  outline: none;
  transition: color 160ms ease, background-color 160ms ease, opacity 160ms ease;
}

.animated-lightbox-control:hover:not(:disabled),
.animated-lightbox-control:focus-visible {
  color: white;
  background-color: rgb(255 255 255 / 0.14);
}

.animated-lightbox-control:focus-visible,
.animated-lightbox-nav:focus-visible {
  box-shadow: 0 0 0 2px white;
}

.animated-lightbox-control:disabled,
.animated-lightbox-nav:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.animated-lightbox-nav {
  position: absolute;
  top: 50%;
  z-index: 20;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  translate: 0 -50%;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.15);
  border-radius: 9999px;
  color: white;
  background: rgb(0 0 0 / 0.3);
  outline: none;
  backdrop-filter: blur(8px);
  transition: background-color 160ms ease, transform 160ms ease, opacity 160ms ease;
}

.animated-lightbox-nav:hover:not(:disabled) {
  background: rgb(255 255 255 / 0.16);
  transform: scale(1.05);
}

.animated-lightbox-image {
  transform-origin: center;
  transition: transform var(--lightbox-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.animated-lightbox-enter-active,
.animated-lightbox-leave-active {
  transition: opacity var(--lightbox-duration) ease;
}

.animated-lightbox-enter-active .animated-lightbox-dialog,
.animated-lightbox-leave-active .animated-lightbox-dialog {
  transition: transform var(--lightbox-duration) cubic-bezier(0.22, 1, 0.36, 1), opacity var(--lightbox-duration) ease;
}

.animated-lightbox-enter-from,
.animated-lightbox-leave-to,
.animated-lightbox-enter-from .animated-lightbox-dialog,
.animated-lightbox-leave-to .animated-lightbox-dialog {
  opacity: 0;
}

.animated-lightbox-enter-from .animated-lightbox-dialog {
  transform: scale(0.985);
}

.animated-lightbox-leave-to .animated-lightbox-dialog {
  transform: scale(1.01);
}

.animated-lightbox-image-enter-active,
.animated-lightbox-image-leave-active {
  transition: opacity var(--lightbox-duration) ease, transform var(--lightbox-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.animated-lightbox-image-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.animated-lightbox-image-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

@media (prefers-reduced-motion: reduce) {
  .animated-lightbox-gallery *,
  .animated-lightbox-backdrop,
  .animated-lightbox-backdrop * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>
