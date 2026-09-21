<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  maxTilt?: number
  perspective?: number
  glare?: boolean
  glareOpacity?: number
  disabled?: boolean
}>(), {
  maxTilt: 10,
  perspective: 900,
  glare: true,
  glareOpacity: 0.18,
  disabled: false,
})

const rotateX = ref(0)
const rotateY = ref(0)
const glareX = ref(50)
const glareY = ref(50)

function reset() {
  rotateX.value = 0
  rotateY.value = 0
  glareX.value = 50
  glareY.value = 50
}

function move(event: PointerEvent) {
  if (props.disabled || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reset()
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
  const limit = Number.isFinite(props.maxTilt) ? Math.max(0, Math.min(24, props.maxTilt)) : 0

  rotateX.value = (0.5 - y) * limit * 2
  rotateY.value = (x - 0.5) * limit * 2
  glareX.value = x * 100
  glareY.value = y * 100
}

watch(() => [props.disabled, props.maxTilt], reset)
</script>

<template>
  <div
    class="tilt-scene group inline-block [perspective:var(--tilt-perspective)]"
    :style="{ '--tilt-perspective': `${Math.max(200, perspective)}px` }"
    @pointermove="move"
    @pointerleave="reset"
    @pointercancel="reset"
  >
    <div
      v-bind="$attrs"
      class="tilt-card relative overflow-hidden [transform:rotateX(var(--tilt-x))_rotateY(var(--tilt-y))] [transform-style:preserve-3d] [transition:transform_500ms_cubic-bezier(.16,1,.3,1),box-shadow_300ms] will-change-transform group-hover:shadow-[0_28px_60px_-32px_#0009] motion-reduce:transform-none motion-reduce:transition-none"
      :style="{
        '--tilt-x': `${rotateX}deg`,
        '--tilt-y': `${rotateY}deg`,
        '--glare-x': `${glareX}%`,
        '--glare-y': `${glareY}%`,
        '--glare-opacity': Math.max(0, Math.min(0.6, glareOpacity)),
      }"
    >
      <slot />
      <div v-if="glare" class="tilt-glare pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--glare-x)_var(--glare-y),#fff_0,#fff8_12%,transparent_48%)] opacity-[var(--glare-opacity)] mix-blend-screen" aria-hidden="true" />
    </div>
  </div>
</template>
