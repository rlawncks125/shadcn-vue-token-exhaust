<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  loading?: boolean
  duration?: number
  paused?: boolean
  pauseOnHover?: boolean
  lines?: number
  avatar?: boolean
  radius?: number
  label?: string
}>(), {
  loading: true,
  duration: 1600,
  paused: false,
  pauseOnHover: false,
  lines: 3,
  avatar: true,
  radius: 24,
  label: 'Loading content',
})

const emit = defineEmits<{
  loaded: []
}>()

const shimmer = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const hovered = ref(false)
const reducedMotion = ref(false)

let shimmerAnimation: Animation | undefined
let revealAnimation: Animation | undefined
let motionQuery: MediaQueryList | undefined

function lineWidth(index: number) {
  const widths = [92, 76, 58, 84, 68]
  return `${widths[index % widths.length]}%`
}

function cancelAnimations() {
  shimmerAnimation?.cancel()
  revealAnimation?.cancel()
  shimmerAnimation = undefined
  revealAnimation = undefined
}

function syncPlayback() {
  if (!shimmerAnimation) return
  if (props.paused || (props.pauseOnHover && hovered.value)) shimmerAnimation.pause()
  else shimmerAnimation.play()
}

async function syncState(revealContent = false) {
  await nextTick()
  cancelAnimations()

  if (props.loading) {
    if (!shimmer.value || reducedMotion.value) return
    shimmerAnimation = shimmer.value.animate([
      { transform: 'translateX(-120%)' },
      { transform: 'translateX(120%)' },
    ], {
      duration: Math.max(props.duration, 400),
      easing: 'ease-in-out',
      iterations: Infinity,
    })
    syncPlayback()
    return
  }

  if (revealContent && content.value && !reducedMotion.value) {
    revealAnimation = content.value.animate([
      { opacity: 0, transform: 'translateY(8px)', filter: 'blur(3px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0px)' },
    ], {
      duration: Math.min(Math.max(props.duration * 0.45, 180), 700),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
    revealAnimation.finished.then(() => {
      revealAnimation = undefined
      emit('loaded')
    }).catch(() => undefined)
  } else if (revealContent) emit('loaded')
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  syncState()
}

watch(() => props.loading, loading => syncState(!loading))
watch(() => props.duration, () => syncState())
watch(() => [props.paused, props.pauseOnHover, hovered.value], syncPlayback)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  syncState()
})

onBeforeUnmount(() => {
  cancelAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <div
    class="shimmer-skeleton relative overflow-hidden border border-border bg-card"
    :style="{ borderRadius: `${Math.max(radius, 0)}px` }"
    :aria-busy="loading"
    :aria-label="label"
    :data-loading="loading ? '' : undefined"
    :data-paused="paused || (pauseOnHover && hovered) || reducedMotion ? '' : undefined"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div v-if="loading" class="relative p-6" aria-hidden="true">
      <slot name="skeleton">
        <div class="flex items-center gap-4">
          <div v-if="avatar" class="size-12 shrink-0 rounded-full bg-muted" />
          <div class="w-full space-y-3">
            <div v-for="index in Math.max(lines, 1)" :key="index" class="h-3 rounded-full bg-muted" :style="{ width: lineWidth(index - 1) }" />
          </div>
        </div>
      </slot>
      <div ref="shimmer" class="shimmer-skeleton-beam pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/60 to-transparent mix-blend-soft-light" />
    </div>

    <div v-else ref="content" class="shimmer-skeleton-content">
      <slot />
    </div>

    <span class="sr-only" aria-live="polite">{{ loading ? label : 'Content loaded' }}</span>
  </div>
</template>
