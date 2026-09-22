<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  heading?: number
  targetBearing?: number
  targetLabel?: string
  distance?: string
  accuracy?: number
  arrivalThreshold?: number
  duration?: number
  active?: boolean
  disabled?: boolean
  sensor?: boolean
  autoStart?: boolean
}>(), {
  heading: 0,
  targetBearing: 0,
  targetLabel: 'Destination',
  distance: '',
  accuracy: 0,
  arrivalThreshold: 8,
  duration: 420,
  active: true,
  disabled: false,
  sensor: true,
  autoStart: true,
})
const emit = defineEmits<{ calibrate: [], select: [], 'update:heading': [heading: number], heading: [heading: number, accuracy?: number], 'sensor-start': [], 'sensor-stop': [], 'sensor-error': [message: string] }>()
const calibrateButton = ref<HTMLButtonElement>()
const sensorHeading = ref<number | null>(null)
const sensorActive = ref(false)
const currentHeading = computed(() => sensorHeading.value ?? props.heading)
const normalizedHeading = computed(() => ((currentHeading.value % 360) + 360) % 360)
const normalizedTarget = computed(() => ((props.targetBearing % 360) + 360) % 360)
const delta = computed(() => ((normalizedTarget.value - normalizedHeading.value + 540) % 360) - 180)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 420)
const arrived = computed(() => Math.abs(delta.value) <= Math.max(0, props.arrivalThreshold))
const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const headingLabel = computed(() => cardinals[Math.round(normalizedHeading.value / 45) % 8])
const directionLabel = computed(() => arrived.value ? 'Straight ahead' : `${Math.abs(Math.round(delta.value))}° ${delta.value < 0 ? 'left' : 'right'}`)
type OrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number, webkitCompassAccuracy?: number }
type OrientationConstructor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }
function onOrientation(event: DeviceOrientationEvent) {
  const value = (event as OrientationEvent).webkitCompassHeading ?? (event.alpha == null ? null : 360 - event.alpha)
  if (value == null || !Number.isFinite(value)) return
  sensorHeading.value = ((value % 360) + 360) % 360
  emit('update:heading', sensorHeading.value)
  emit('heading', sensorHeading.value, (event as OrientationEvent).webkitCompassAccuracy)
}
async function startSensor() {
  if (props.disabled || !props.sensor) return false
  if (typeof window === 'undefined' || !window.DeviceOrientationEvent) { emit('sensor-error', 'DeviceOrientation is not supported by this browser.'); return false }
  try {
    const constructor = window.DeviceOrientationEvent as OrientationConstructor
    if (constructor.requestPermission && await constructor.requestPermission() !== 'granted') throw new Error('Orientation permission was denied.')
    window.removeEventListener('deviceorientation', onOrientation)
    window.addEventListener('deviceorientation', onOrientation)
    sensorActive.value = true; emit('sensor-start'); return true
  }
  catch (error) { const message = error instanceof Error ? error.message : 'Orientation sensor is unavailable.'; emit('sensor-error', message); return false }
}
function stopSensor() { if (typeof window !== 'undefined') window.removeEventListener('deviceorientation', onOrientation); if (sensorActive.value) emit('sensor-stop'); sensorActive.value = false; sensorHeading.value = null }
async function calibrate() { if (props.disabled) return false; emit('calibrate'); return props.sensor ? startSensor() : true }
function select() { if (props.disabled) return false; emit('select'); return true }
onMounted(() => { const constructor = typeof window !== 'undefined' ? window.DeviceOrientationEvent as OrientationConstructor | undefined : undefined; if (props.sensor && props.autoStart && constructor && !constructor.requestPermission) startSensor() })
onBeforeUnmount(stopSensor)
defineExpose({ calibrate, startSensor, stopSensor, select, focus: () => calibrateButton.value?.focus(), delta, sensorActive })
</script>

<template>
  <section data-testid="animated-mobile-compass" class="w-full rounded-[30px] bg-[#171a17] p-5 text-white" :style="{ '--compass-duration': `${safeDuration}ms` }" :aria-label="`Direction to ${targetLabel}: ${directionLabel}`">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Navigate to</p><h3 class="mt-2 truncate text-xl font-semibold">{{ targetLabel }}</h3></div>
      <button ref="calibrateButton" type="button" data-testid="compass-calibrate" class="min-h-11 rounded-[14px] bg-white/8 px-3 text-[10px] font-semibold text-white/65 outline-none hover:not-disabled:bg-white/12 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :disabled="disabled" @click="calibrate">{{ sensorActive ? 'Sensor active' : 'Enable compass' }}</button>
    </div>

    <button type="button" data-testid="compass-dial" class="relative mx-auto mt-7 block aspect-square w-full max-w-[270px] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:cursor-default" :disabled="disabled" :aria-label="`${targetLabel}, ${directionLabel}`" @click="select">
      <span class="absolute inset-0 rounded-full border border-white/12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.08),transparent_62%)]" />
      <span class="compass-ring absolute inset-3 rounded-full border border-dashed border-white/18" :style="{ transform: `rotate(${-normalizedHeading}deg)` }" aria-hidden="true">
        <span v-for="(point, index) in cardinals" :key="point" class="absolute left-1/2 top-1/2 text-[9px] font-bold" :class="point === 'N' ? 'text-[#e96b47]' : 'text-white/38'" :style="{ transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-108px) rotate(${-index * 45 + normalizedHeading}deg)` }">{{ point }}</span>
      </span>
      <span class="target-arrow absolute left-1/2 top-1/2 h-[43%] w-12 -translate-x-1/2 -translate-y-full origin-bottom" :style="{ transform: `translate(-50%, -100%) rotate(${delta}deg)` }" aria-hidden="true">
        <span class="mx-auto block h-full w-1 rounded-full bg-gradient-to-t from-[#d9ff57]/10 to-[#d9ff57]" /><span class="absolute left-1/2 top-0 size-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[5px_12px_5px_12px] bg-[#d9ff57] shadow-[0_0_30px_rgba(217,255,87,.45)]" :class="active && !arrived ? 'animate-pulse motion-reduce:animate-none' : ''" />
      </span>
      <span class="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-[#242824] shadow-xl"><span><strong class="block text-lg">{{ Math.round(normalizedHeading) }}°</strong><small class="text-[9px] font-bold text-white/35">{{ headingLabel }}</small></span></span>
    </button>

    <div class="mt-5 grid grid-cols-3 gap-2 text-center">
      <div class="rounded-[16px] bg-white/[.06] p-3"><span class="block text-[9px] uppercase tracking-wider text-white/35">Turn</span><strong data-testid="compass-direction" class="mt-1 block text-xs">{{ directionLabel }}</strong></div>
      <div class="rounded-[16px] bg-white/[.06] p-3"><span class="block text-[9px] uppercase tracking-wider text-white/35">Distance</span><strong class="mt-1 block text-xs">{{ distance || '—' }}</strong></div>
      <div class="rounded-[16px] bg-white/[.06] p-3"><span class="block text-[9px] uppercase tracking-wider text-white/35">Accuracy</span><strong class="mt-1 block text-xs">{{ accuracy > 0 ? `±${Math.round(accuracy)}m` : '—' }}</strong></div>
    </div>
    <p class="sr-only" aria-live="polite">{{ directionLabel }} to {{ targetLabel }}</p>
  </section>
</template>

<style scoped>
.compass-ring,.target-arrow { transition: transform var(--compass-duration) cubic-bezier(.2,.8,.2,1); }
@media (prefers-reduced-motion: reduce) { .compass-ring,.target-arrow { transition: none !important; } }
</style>
