<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type AnimatedMobileWakeLockState = 'idle' | 'requesting' | 'active' | 'released' | 'unsupported' | 'error'
const props = withDefaults(defineProps<{
  modelValue?: boolean
  title?: string
  description?: string
  activeLabel?: string
  enableLabel?: string
  disableLabel?: string
  autoReacquire?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  modelValue: false,
  title: 'Keep screen awake',
  description: 'Prevent this screen from sleeping during an active session.',
  activeLabel: 'Screen will stay awake',
  enableLabel: 'Keep awake',
  disableLabel: 'Allow sleep',
  autoReacquire: true,
  duration: 280,
  disabled: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
  request: []
  acquired: []
  release: [reason: 'manual' | 'system' | 'hidden' | 'unmount']
  error: [message: string]
  unsupported: []
}>()
type Sentinel = EventTarget & { released: boolean, release: () => Promise<void> }
type WakeLockManager = { request: (type: 'screen') => Promise<Sentinel> }
const state = ref<AnimatedMobileWakeLockState>('idle')
const errorMessage = ref('')
const supported = ref<boolean | null>(null)
let sentinel: Sentinel | null = null
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 280)
const active = computed(() => state.value === 'active' && Boolean(sentinel && !sentinel.released))
const statusLabel = computed(() => ({ idle: 'Ready when you are', requesting: 'Requesting wake lock…', active: props.activeLabel, released: 'Wake lock released', unsupported: 'Wake Lock is not supported', error: errorMessage.value || 'Could not keep the screen awake' })[state.value])

function manager() { return (navigator as Navigator & { wakeLock?: WakeLockManager }).wakeLock }
function onSentinelRelease() {
  sentinel = null
  const reason = document.visibilityState === 'hidden' ? 'hidden' : 'system'
  state.value = 'released'; emit('release', reason)
  if (reason !== 'hidden' || !props.autoReacquire) { emit('update:modelValue', false); emit('change', false) }
}
async function acquire() {
  if (props.disabled || state.value === 'requesting' || active.value || typeof navigator === 'undefined') return false
  const wakeLock = manager()
  if (!wakeLock) { supported.value = false; state.value = 'unsupported'; emit('unsupported'); return false }
  try {
    state.value = 'requesting'; errorMessage.value = ''; emit('request')
    sentinel = await wakeLock.request('screen'); sentinel.addEventListener('release', onSentinelRelease, { once: true })
    supported.value = true; state.value = 'active'; emit('update:modelValue', true); emit('change', true); emit('acquired'); return true
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Wake lock request failed.'
    state.value = 'error'; emit('update:modelValue', false); emit('change', false); emit('error', errorMessage.value); return false
  }
}
async function release(reason: 'manual' | 'unmount' = 'manual') {
  if (!sentinel) { state.value = 'idle'; if (reason === 'manual') { emit('update:modelValue', false); emit('change', false) }; return false }
  const current = sentinel; sentinel = null; current.removeEventListener('release', onSentinelRelease)
  try { await current.release() } finally { state.value = reason === 'manual' ? 'idle' : 'released'; emit('release', reason); if (reason === 'manual') { emit('update:modelValue', false); emit('change', false) } }
  return true
}
function toggle() { return active.value ? release('manual') : acquire() }
function handleVisibility() { if (document.visibilityState === 'visible' && props.modelValue && props.autoReacquire && !active.value) acquire() }

watch(() => props.modelValue, value => { if (value && !active.value) acquire(); else if (!value && active.value) release('manual') })
onMounted(() => { supported.value = Boolean(manager()); if (!supported.value) state.value = 'unsupported'; document.addEventListener('visibilitychange', handleVisibility); if (props.modelValue) acquire() })
onBeforeUnmount(() => { document.removeEventListener('visibilitychange', handleVisibility); if (sentinel) release('unmount') })
defineExpose({ acquire, release, toggle, active, state })
</script>

<template>
  <section data-testid="animated-mobile-wake-lock" class="w-full rounded-[28px] border border-black/10 bg-[#f6f1e7] p-5 text-[#1b1d19] shadow-[0_22px_60px_-40px_rgba(0,0,0,.5)]" :style="{ '--wake-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4">
      <div class="wake-orb relative grid size-14 shrink-0 place-items-center rounded-[20px]" :class="active ? 'bg-[#d9ff57]' : state === 'error' || state === 'unsupported' ? 'bg-[#e56845] text-white' : 'bg-black text-white'" aria-hidden="true">
        <span v-if="active" class="absolute inset-0 animate-ping rounded-[20px] bg-[#d9ff57]/30 motion-reduce:animate-none" /><span class="relative text-xl">{{ active ? '☀' : state === 'error' || state === 'unsupported' ? '!' : '◐' }}</span>
      </div>
      <div class="min-w-0 flex-1"><h3 class="text-base font-semibold tracking-[-.02em]">{{ title }}</h3><p class="mt-1 text-xs leading-5 text-black/45">{{ description }}</p></div>
    </div>

    <div class="mt-6 rounded-[20px] bg-white/65 p-4">
      <div class="flex items-center justify-between gap-3"><span class="text-[9px] font-bold uppercase tracking-[.16em] text-black/35">Screen state</span><span class="size-2 rounded-full" :class="active ? 'bg-emerald-500' : state === 'requesting' ? 'animate-pulse bg-amber-400 motion-reduce:animate-none' : 'bg-black/20'" /></div>
      <p data-testid="wake-lock-status" class="mt-3 text-sm font-semibold" role="status" aria-live="polite">{{ statusLabel }}</p>
      <p v-if="state === 'unsupported'" class="mt-2 text-[10px] leading-4 text-black/42">Use HTTPS on a supported mobile browser. The page remains usable without a wake lock.</p>
    </div>

    <button type="button" data-testid="wake-lock-toggle" class="mt-4 min-h-12 w-full rounded-[17px] px-5 text-xs font-bold outline-none transition-[transform,background-color,color] active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :class="active ? 'bg-black/7 text-black' : 'bg-[#1b1d19] text-white'" :disabled="disabled || state === 'requesting' || supported === false" :aria-pressed="Boolean(active)" @click="toggle">{{ state === 'requesting' ? 'Requesting…' : active ? disableLabel : enableLabel }}</button>
  </section>
</template>

<style scoped>
.wake-orb { transition: transform var(--wake-duration) cubic-bezier(.2,.8,.2,1), background-color var(--wake-duration) ease; }
[aria-pressed="true"] + .wake-orb { transform: scale(1.02); }
@media (prefers-reduced-motion: reduce) { .wake-orb { transition: none !important; } }
</style>
