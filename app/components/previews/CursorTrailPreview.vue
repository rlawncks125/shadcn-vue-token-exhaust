<script setup lang="ts">
import { ref, watch } from 'vue'
import CursorTrail from '../../../registry/default/cursor-trail/CursorTrail.vue'

interface TrailDetail {
  x: number
  y: number
  count: number
}

const props = withDefaults(defineProps<{
  color?: string
  count?: number
  size?: number
  duration?: number
  shape?: 'circle' | 'square'
  paused?: boolean
  disabled?: boolean
}>(), {
  color: 'var(--registry-accent, #d9ff57)',
  count: 24,
  size: 10,
  duration: 700,
  shape: 'circle',
  paused: false,
  disabled: false,
})

const trail = ref<InstanceType<typeof CursorTrail> | null>(null)
const emittedCount = ref(0)
const lastPoint = ref('Waiting for movement')

function handleTrail(detail: TrailDetail) {
  emittedCount.value = detail.count
  lastPoint.value = `${Math.round(detail.x)}, ${Math.round(detail.y)}`
}

function handleClear() {
  emittedCount.value = 0
  lastPoint.value = 'Trail cleared'
}

function clearTrail() {
  trail.value?.clear()
}

watch(() => props.disabled, (disabled) => {
  if (disabled) {
    lastPoint.value = 'Trail disabled'
  }
})
</script>

<template>
  <div class="w-full overflow-hidden rounded-[2rem] border border-black/10 bg-[#e8eadf] p-3 text-[#171911] shadow-[0_26px_80px_rgba(32,38,20,0.12)] sm:p-5">
    <CursorTrail
      ref="trail"
      class="min-h-[450px] overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#0d100c] text-white sm:min-h-[500px]"
      :color="color"
      :count="count"
      :size="size"
      :duration="duration"
      :shape="shape"
      :paused="paused"
      :disabled="disabled"
      aria-label="Interactive cursor trail preview"
      data-testid="cursor-trail-preview-canvas"
      @trail="handleTrail"
      @clear="handleClear"
    >
      <div class="cursor-trail-preview-grid flex min-h-[450px] flex-col p-5 sm:min-h-[500px] sm:p-8">
        <header class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Field notes / 04</p>
            <h3 class="mt-2 text-xl font-medium tracking-[-0.04em] text-white sm:text-2xl">Follow the signal.</h3>
          </div>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/50 backdrop-blur-sm">
            <span class="size-1.5 rounded-full bg-[var(--cursor-trail-color)] shadow-[0_0_10px_var(--cursor-trail-color)]" />
            {{ disabled ? 'Disabled' : paused ? 'Paused' : 'Live' }}
          </span>
        </header>

        <div class="my-auto grid gap-3 py-8 sm:grid-cols-[1.25fr_0.75fr] sm:gap-4">
          <article class="rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm sm:p-6">
            <div class="flex items-center justify-between gap-4">
              <span class="font-mono text-[10px] text-white/30">TRACE.01</span>
              <span class="h-px w-12 bg-[var(--cursor-trail-color)]/60" />
            </div>
            <p class="mt-8 max-w-xs text-lg font-medium leading-snug tracking-[-0.025em] text-white/90">Motion leaves a brief record of where attention has been.</p>
            <p class="mt-3 text-xs leading-5 text-white/40">Move naturally across the canvas. The native pointer stays exactly as it is.</p>
          </article>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <article class="flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/30">Emitted</span>
              <strong data-testid="cursor-trail-emitted-count" class="font-mono text-2xl font-normal text-[var(--cursor-trail-color)] sm:text-3xl" aria-live="polite">{{ String(emittedCount).padStart(2, '0') }}</strong>
            </article>
            <article class="flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <span class="text-[9px] uppercase tracking-[0.2em] text-white/30">Last point</span>
              <strong data-testid="cursor-trail-last-point" class="font-mono text-[11px] font-normal text-white/65">{{ lastPoint }}</strong>
            </article>
          </div>
        </div>

        <div class="flex items-end justify-between gap-5 border-t border-white/10 pt-5">
          <p class="max-w-sm text-[11px] leading-5 text-white/35">Move your pointer through this area to draw a temporary trail. Reduced-motion preferences are respected.</p>
          <span class="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 sm:block">X / Y local coordinates</span>
        </div>
      </div>
    </CursorTrail>

    <div class="flex flex-col gap-3 px-2 pb-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-xs text-black/45">{{ paused ? 'Resume to create new particles.' : disabled ? 'Enable the trail to begin.' : 'The trail fades automatically.' }}</p>
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-2 self-start rounded-full border border-black/10 bg-white/55 px-4 text-xs font-medium text-black/70 outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black/30 motion-reduce:transition-none sm:self-auto"
        data-testid="cursor-trail-clear"
        @click="clearTrail"
      >
        <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 4.5h10M6 2.5h4m-5.75 2 .55 9h6.4l.55-9M6.5 6.5v5m3-5v5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Clear trail
      </button>
    </div>
  </div>
</template>

<style scoped>
.cursor-trail-preview-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 18% 8%, color-mix(in srgb, var(--cursor-trail-color) 13%, transparent), transparent 35%);
  background-size: 32px 32px, 32px 32px, 100% 100%;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-trail-preview-grid {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  }
}
</style>
