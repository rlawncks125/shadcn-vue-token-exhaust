<script setup lang="ts">
import { computed } from 'vue'

export interface AnimatedMobileMiniPlayerTrack {
  id: string
  title: string
  artist: string
  artwork?: string
  duration?: number
}

const props = withDefaults(defineProps<{
  open?: boolean
  modelValue?: boolean
  progress?: number
  track: AnimatedMobileMiniPlayerTrack
  duration?: number
  safeArea?: boolean
  showClose?: boolean
  disabled?: boolean
}>(), {
  open: true,
  modelValue: false,
  progress: 0,
  duration: 260,
  safeArea: true,
  showClose: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: boolean]
  'update:progress': [value: number]
  playChange: [playing: boolean]
  seek: [progress: number]
  previous: []
  next: []
  close: []
}>()

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)
const safeProgress = computed(() => Number.isFinite(props.progress) ? Math.min(1, Math.max(0, props.progress)) : 0)
const trackDuration = computed(() => Number.isFinite(props.track.duration) ? Math.max(0, props.track.duration ?? 0) : 0)
const elapsed = computed(() => trackDuration.value * safeProgress.value)
const rootStyle = computed(() => ({ '--mini-player-duration': `${safeDuration.value}ms`, '--mini-player-progress': `${safeProgress.value * 100}%` }))

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00'
  const minutes = Math.floor(value / 60)
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, '0')}`
}

function toggle() {
  if (props.disabled) return false
  const playing = !props.modelValue
  emit('update:modelValue', playing)
  emit('playChange', playing)
  return true
}

function seek(event: Event) {
  if (props.disabled) return
  const value = Number((event.target as HTMLInputElement).value) / 1000
  emit('update:progress', value)
  emit('seek', value)
}

function close() {
  if (props.disabled || !props.open) return false
  emit('update:open', false)
  emit('close')
  return true
}

defineExpose({ toggle, close, seekTo: (value: number) => {
  const progress = Math.min(1, Math.max(0, value))
  emit('update:progress', progress)
  emit('seek', progress)
} })
</script>

<template>
  <Teleport to="body">
    <Transition name="mini-player">
      <div v-if="open" data-testid="animated-mobile-mini-player-wrap" class="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-3" :class="safeArea ? 'pb-[max(.75rem,env(safe-area-inset-bottom))]' : 'pb-3'" :style="rootStyle">
        <section data-testid="animated-mobile-mini-player" role="region" :aria-label="`Now playing ${track.title} by ${track.artist}`" class="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[22px] border border-white/10 bg-[#1c1e1a]/95 text-white shadow-[0_24px_70px_-24px_rgba(0,0,0,.8)] backdrop-blur-xl">
          <div class="relative h-1 bg-white/10"><span class="absolute inset-y-0 left-0 bg-[#d9ff57] transition-[width] motion-reduce:transition-none" :style="{ width: 'var(--mini-player-progress)', transitionDuration: 'var(--mini-player-duration)' }" /></div>
          <div class="flex items-center gap-2 p-2.5">
            <div class="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#e4633f] to-[#f0c84b] text-[10px] font-black text-[#1c1e1a]">
              <img v-if="track.artwork" :src="track.artwork" alt="" class="size-full object-cover"><span v-else>PLAY</span>
            </div>
            <div class="min-w-0 flex-1 px-1"><strong class="block truncate text-xs font-semibold">{{ track.title }}</strong><span class="mt-0.5 block truncate text-[10px] text-white/42">{{ track.artist }}</span></div>
            <button type="button" data-testid="mini-player-previous" class="grid size-10 shrink-0 place-items-center rounded-xl text-white/65 outline-none hover:not-disabled:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-30" :disabled="disabled" aria-label="Previous track" @click="emit('previous')">&#9664;</button>
            <button type="button" data-testid="mini-player-toggle" class="grid size-11 shrink-0 place-items-center rounded-full bg-[#d9ff57] text-sm text-[#1c1e1a] outline-none transition-transform active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" :aria-label="modelValue ? 'Pause' : 'Play'" :aria-pressed="modelValue" @click="toggle">{{ modelValue ? 'Ⅱ' : '▶' }}</button>
            <button type="button" data-testid="mini-player-next" class="grid size-10 shrink-0 place-items-center rounded-xl text-white/65 outline-none hover:not-disabled:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-30" :disabled="disabled" aria-label="Next track" @click="emit('next')">&#9654;</button>
            <button v-if="showClose" type="button" data-testid="mini-player-close" class="hidden size-10 shrink-0 place-items-center rounded-xl text-xl text-white/35 outline-none hover:not-disabled:bg-white/10 hover:not-disabled:text-white focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-30 sm:grid" :disabled="disabled" aria-label="Close player" @click="close">&#215;</button>
          </div>
          <div class="flex items-center gap-3 px-4 pb-2.5">
            <span class="w-8 text-right font-mono text-[8px] text-white/35">{{ formatTime(elapsed) }}</span>
            <input data-testid="mini-player-progress" type="range" min="0" max="1000" step="1" :value="Math.round(safeProgress * 1000)" :disabled="disabled" :aria-label="`Playback position, ${Math.round(safeProgress * 100)} percent`" class="h-5 min-w-0 flex-1 accent-[#d9ff57] disabled:opacity-30" @input="seek">
            <span class="w-8 font-mono text-[8px] text-white/35">{{ formatTime(trackDuration) }}</span>
            <button v-if="showClose" type="button" data-testid="mini-player-close-mobile" class="text-[10px] font-semibold text-white/38 sm:hidden" :disabled="disabled" @click="close">Close</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mini-player-enter-active,
.mini-player-leave-active { transition: opacity var(--mini-player-duration) ease, transform var(--mini-player-duration) cubic-bezier(.2,.8,.2,1); }
.mini-player-enter-from,
.mini-player-leave-to { opacity: 0; transform: translateY(18px) scale(.98); }
@media (prefers-reduced-motion: reduce) { .mini-player-enter-active, .mini-player-leave-active { transition: none !important; } }
</style>
