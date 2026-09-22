<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

export interface AnimatedMobileLocation { latitude: number, longitude: number, accuracy: number, altitude: number | null, timestamp: number }
export type AnimatedMobileLocationState = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable' | 'timeout' | 'error'
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  locateLabel?: string
  confirmLabel?: string
  highAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoRequest?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  title: 'Check in here', description: 'Use your current location for this field note.', locateLabel: 'Use current location', confirmLabel: 'Confirm check-in', highAccuracy: true, timeout: 10000, maximumAge: 0, autoRequest: false, duration: 280, disabled: false,
})
const emit = defineEmits<{ locating: [], located: [location: AnimatedMobileLocation], confirm: [location: AnimatedMobileLocation], clear: [], denied: [message: string], error: [message: string] }>()
const state = ref<AnimatedMobileLocationState>('idle')
const location = ref<AnimatedMobileLocation | null>(null)
const errorMessage = ref('')
const supported = ref<boolean | null>(null)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 280)
const status = computed(() => ({ idle: 'Location has not been requested', locating: 'Finding your location…', ready: 'Location ready', denied: errorMessage.value || 'Location permission denied', unavailable: errorMessage.value || 'Location unavailable', timeout: errorMessage.value || 'Location request timed out', error: errorMessage.value || 'Location request failed' })[state.value])
function locate() {
  if (props.disabled || state.value === 'locating' || typeof navigator === 'undefined') return false
  if (!navigator.geolocation) { supported.value = false; state.value = 'unavailable'; errorMessage.value = 'Geolocation is not supported by this browser.'; emit('error', errorMessage.value); return false }
  state.value = 'locating'; errorMessage.value = ''; emit('locating')
  navigator.geolocation.getCurrentPosition(position => {
    location.value = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, altitude: position.coords.altitude, timestamp: position.timestamp }
    state.value = 'ready'; emit('located', location.value)
  }, error => {
    errorMessage.value = error.message || 'Location request failed.'
    if (error.code === error.PERMISSION_DENIED) { state.value = 'denied'; emit('denied', errorMessage.value) }
    else { state.value = error.code === error.TIMEOUT ? 'timeout' : 'unavailable'; emit('error', errorMessage.value) }
  }, { enableHighAccuracy: props.highAccuracy, timeout: Math.max(0, props.timeout), maximumAge: Math.max(0, props.maximumAge) })
  return true
}
function confirm() { if (props.disabled || !location.value) return false; emit('confirm', location.value); return true }
function clear() { if (!location.value) return false; location.value = null; state.value = 'idle'; errorMessage.value = ''; emit('clear'); return true }
onMounted(() => { supported.value = Boolean(navigator.geolocation); if (!supported.value) state.value = 'unavailable'; else if (props.autoRequest) locate() })
defineExpose({ locate, confirm, clear, state, location })
</script>

<template>
  <section data-testid="animated-mobile-location-check-in" class="w-full rounded-[30px] border border-black/10 bg-[#f2ede3] p-5 text-[#1b1d19] shadow-[0_22px_60px_-42px_rgba(0,0,0,.55)]" :style="{ '--location-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4"><div class="relative grid size-14 shrink-0 place-items-center rounded-[19px] bg-[#e36845] text-xl text-white" aria-hidden="true"><span v-if="state === 'locating'" class="absolute inset-0 animate-ping rounded-[19px] bg-[#e36845]/30 motion-reduce:animate-none" />◎</div><div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Geolocation</p><h3 class="mt-2 text-lg font-semibold tracking-[-.03em]">{{ title }}</h3><p class="mt-1 text-xs leading-5 text-black/45">{{ description }}</p></div></div>
    <div class="mt-5 rounded-[20px] bg-white/65 p-4"><div class="flex items-center justify-between"><span class="text-[9px] font-bold uppercase tracking-[.14em] text-black/30">Current position</span><span class="size-2 rounded-full" :class="state === 'ready' ? 'bg-emerald-500' : state === 'denied' || state === 'error' ? 'bg-red-500' : 'bg-black/20'" /></div><p data-testid="location-status" class="mt-3 text-sm font-semibold" role="status" aria-live="polite">{{ status }}</p><div v-if="location" class="mt-4 grid grid-cols-2 gap-2 border-t border-black/7 pt-4"><div><span class="block text-[9px] text-black/32">Latitude</span><strong class="mt-1 block font-mono text-xs">{{ location.latitude.toFixed(6) }}</strong></div><div><span class="block text-[9px] text-black/32">Longitude</span><strong class="mt-1 block font-mono text-xs">{{ location.longitude.toFixed(6) }}</strong></div><div class="col-span-2 mt-1"><span class="text-[9px] text-black/32">Accuracy</span><strong class="ml-2 text-[10px]">±{{ Math.round(location.accuracy) }} m</strong></div></div></div>
    <div class="mt-4 grid gap-2" :class="location ? 'grid-cols-[1fr_1.2fr]' : 'grid-cols-1'"><button type="button" data-testid="location-locate" class="min-h-12 rounded-[17px] px-4 text-xs font-bold outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35 motion-reduce:transition-none" :class="location ? 'border border-black/10' : 'bg-[#1b1d19] text-white'" :disabled="disabled || state === 'locating' || supported === false" @click="locate">{{ state === 'locating' ? 'Locating…' : location ? 'Refresh' : locateLabel }}</button><button v-if="location" type="button" data-testid="location-confirm" class="min-h-12 rounded-[17px] bg-[#d9ff57] px-4 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" @click="confirm">{{ confirmLabel }}</button></div>
  </section>
</template>

<style scoped>
[data-testid="location-status"] { transition: opacity var(--location-duration) ease; }
@media (prefers-reduced-motion: reduce) { [data-testid="location-status"] { transition: none !important; } }
</style>
