<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  description?: string
  glow?: string
  radius?: number
  intensity?: number
  duration?: number
  interactive?: boolean
  disabled?: boolean
}>(), {
  eyebrow: 'New release',
  title: 'Built for deliberate interfaces.',
  description: 'A soft spotlight follows the pointer and gives quiet depth to any piece of content.',
  glow: 'var(--registry-accent, #d9ff57)',
  radius: 300,
  intensity: 0.28,
  duration: 420,
  interactive: true,
  disabled: false,
})

const x = ref(50)
const y = ref(50)
const active = ref(false)
let touchResetTimer: ReturnType<typeof setTimeout> | undefined
const safeRadius = computed(() => Number.isFinite(props.radius) ? Math.min(800, Math.max(80, props.radius)) : 300)
const safeIntensity = computed(() => Number.isFinite(props.intensity) ? Math.min(0.8, Math.max(0, props.intensity)) : 0.28)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 420)

function updateSpotlight(event: PointerEvent) {
  if (!props.interactive || props.disabled) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  x.value = ((event.clientX - rect.left) / rect.width) * 100
  y.value = ((event.clientY - rect.top) / rect.height) * 100
}

function activate(event?: PointerEvent) {
  if (!props.interactive || props.disabled) return
  if (event) updateSpotlight(event)
  active.value = true
}

function reset() {
  active.value = false
  x.value = 50
  y.value = 50
}

function release(event: PointerEvent) {
  if (event.pointerType !== 'touch') return
  if (touchResetTimer) clearTimeout(touchResetTimer)
  touchResetTimer = setTimeout(reset, 260)
}

onBeforeUnmount(() => touchResetTimer && clearTimeout(touchResetTimer))
defineExpose({ reset })
</script>

<template>
  <article
    class="group relative isolate w-full max-w-md overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-950 p-7 text-white shadow-2xl"
    :class="{ 'opacity-55': disabled }"
    :tabindex="interactive && !disabled ? 0 : undefined"
    :aria-label="title"
    :aria-disabled="disabled || undefined"
    data-testid="spotlight-card"
    :data-active="active || undefined"
    :style="{
      '--spot-x': `${x}%`,
      '--spot-y': `${y}%`,
      '--spot-color': glow,
      '--spot-radius': `${safeRadius}px`,
      '--spot-opacity': safeIntensity,
      '--spot-duration': `${safeDuration}ms`,
    }"
    @pointerenter="activate"
    @pointermove="updateSpotlight"
    @pointerdown="activate"
    @pointerup="release"
    @pointerleave="reset"
    @pointercancel="reset"
    @focus="active = interactive && !disabled"
    @blur="reset"
  >
    <div class="spotlight pointer-events-none absolute inset-0 -z-10" :class="active ? 'is-active' : ''" style="background: radial-gradient(var(--spot-radius) circle at var(--spot-x) var(--spot-y), var(--spot-color), transparent 65%)" />
    <div class="mb-12 flex items-center justify-between">
      <span class="rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">{{ eyebrow }}</span>
      <span class="size-2 rounded-full bg-[var(--spot-color)] shadow-[0_0_18px_var(--spot-color)]" />
    </div>
    <h3 class="max-w-sm text-2xl font-semibold leading-tight tracking-[-0.03em]">{{ title }}</h3>
    <p class="mt-3 max-w-sm text-sm leading-6 text-white/55">{{ description }}</p>
  </article>
</template>

<style scoped>
.spotlight { opacity: 0; transition: opacity var(--spot-duration) ease; }
.spotlight.is-active { opacity: var(--spot-opacity); }
@media (prefers-reduced-motion: reduce) { .spotlight { transition: none; } }
</style>
