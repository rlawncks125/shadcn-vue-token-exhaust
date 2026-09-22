<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

export type AnimatedMobileBluetoothState = 'idle' | 'requesting' | 'selected' | 'connecting' | 'connected' | 'disconnected' | 'unsupported' | 'error'
export interface AnimatedMobileBluetoothDeviceInfo { id: string, name: string }
type GattServer = { connected: boolean, connect: () => Promise<GattServer>, disconnect: () => void }
type BluetoothDeviceLike = EventTarget & { id: string, name?: string, gatt?: GattServer }
type BluetoothManager = { requestDevice: (options: Record<string, unknown>) => Promise<BluetoothDeviceLike> }
const props = withDefaults(defineProps<{
  namePrefix?: string
  service?: string
  optionalServices?: string[]
  autoConnect?: boolean
  disconnectOnUnmount?: boolean
  title?: string
  description?: string
  selectLabel?: string
  duration?: number
  disabled?: boolean
}>(), {
  namePrefix: '', service: '', optionalServices: () => [], autoConnect: true, disconnectOnUnmount: true, title: 'Connect a device', description: 'Choose a nearby Bluetooth accessory and establish a secure local connection.', selectLabel: 'Choose device', duration: 280, disabled: false,
})
const emit = defineEmits<{
  select: [device: AnimatedMobileBluetoothDeviceInfo]
  connecting: [device: AnimatedMobileBluetoothDeviceInfo]
  connected: [device: AnimatedMobileBluetoothDeviceInfo, server: GattServer]
  disconnect: [device: AnimatedMobileBluetoothDeviceInfo, reason: 'manual' | 'system' | 'unmount']
  cancel: []
  unsupported: []
  error: [message: string]
}>()
const state = ref<AnimatedMobileBluetoothState>('idle')
const errorMessage = ref('')
const supported = ref<boolean | null>(null)
const device = shallowRef<BluetoothDeviceLike | null>(null)
let manualReason: 'manual' | 'unmount' | null = null
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 280)
const info = computed<AnimatedMobileBluetoothDeviceInfo | null>(() => device.value ? { id: device.value.id, name: device.value.name || 'Unnamed device' } : null)
const status = computed(() => ({ idle: 'Ready to scan nearby devices', requesting: 'Opening Bluetooth device picker…', selected: 'Device selected', connecting: 'Connecting to GATT server…', connected: 'Connected', disconnected: 'Connection ended', unsupported: 'Web Bluetooth is unavailable', error: errorMessage.value || 'Bluetooth connection failed' })[state.value])
const manager = () => (navigator as Navigator & { bluetooth?: BluetoothManager }).bluetooth
function options() {
  const filter: Record<string, unknown> = {}
  if (props.namePrefix) filter.namePrefix = props.namePrefix
  if (props.service) filter.services = [props.service]
  return { ...(Object.keys(filter).length ? { filters: [filter] } : { acceptAllDevices: true }), ...(props.optionalServices.length ? { optionalServices: props.optionalServices } : {}) }
}
function onDisconnected() {
  if (!device.value || !info.value) return
  const reason = manualReason || 'system'; manualReason = null; state.value = 'disconnected'; emit('disconnect', info.value, reason)
}
async function connect() {
  if (props.disabled || !device.value || !device.value.gatt || state.value === 'connecting') return false
  try { state.value = 'connecting'; emit('connecting', info.value!); const server = await device.value.gatt.connect(); state.value = 'connected'; emit('connected', info.value!, server); return true }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'GATT connection failed.'; state.value = 'error'; emit('error', errorMessage.value); return false }
}
async function selectDevice() {
  if (props.disabled || state.value === 'requesting' || typeof navigator === 'undefined') return false
  const bluetooth = manager()
  if (!bluetooth?.requestDevice) { supported.value = false; state.value = 'unsupported'; emit('unsupported'); return false }
  try {
    state.value = 'requesting'; errorMessage.value = ''
    if (device.value) device.value.removeEventListener('gattserverdisconnected', onDisconnected)
    device.value = await bluetooth.requestDevice(options()); device.value.addEventListener('gattserverdisconnected', onDisconnected)
    state.value = 'selected'; emit('select', info.value!); return props.autoConnect ? connect() : true
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') { state.value = info.value ? 'selected' : 'idle'; emit('cancel'); return false }
    errorMessage.value = error instanceof Error ? error.message : 'Bluetooth device selection failed.'; state.value = 'error'; emit('error', errorMessage.value); return false
  }
}
function disconnect(reason: 'manual' | 'unmount' = 'manual') {
  if (!device.value?.gatt?.connected || !info.value) return false
  manualReason = reason; device.value.gatt.disconnect()
  if (state.value !== 'disconnected') { state.value = 'disconnected'; emit('disconnect', info.value, reason); manualReason = null }
  return true
}
function clear() { if (device.value) device.value.removeEventListener('gattserverdisconnected', onDisconnected); device.value = null; state.value = 'idle'; errorMessage.value = '' }
onMounted(() => { supported.value = Boolean(manager()?.requestDevice); if (!supported.value) { state.value = 'unsupported'; emit('unsupported') } })
onBeforeUnmount(() => { if (props.disconnectOnUnmount) disconnect('unmount'); if (device.value) device.value.removeEventListener('gattserverdisconnected', onDisconnected) })
defineExpose({ selectDevice, connect, disconnect, clear, state, device: info })
</script>

<template>
  <section data-testid="animated-mobile-bluetooth-pairing" class="w-full rounded-[30px] border border-black/10 bg-[#17201d] p-5 text-white shadow-[0_26px_70px_-38px_rgba(0,0,0,.85)]" :style="{ '--bluetooth-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4"><div class="relative grid size-16 shrink-0 place-items-center rounded-[22px] bg-[#78a99a] text-2xl font-semibold" aria-hidden="true"><span v-if="state === 'requesting' || state === 'connecting'" class="absolute inset-0 animate-ping rounded-[22px] bg-[#78a99a]/30 motion-reduce:animate-none" />B</div><div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Web Bluetooth</p><h3 class="mt-2 text-xl font-semibold tracking-[-.03em]">{{ title }}</h3><p class="mt-2 text-xs leading-5 text-white/45">{{ description }}</p></div></div>
    <div class="mt-6 rounded-[20px] bg-white/[.07] p-4"><div class="flex items-center justify-between gap-3"><span class="text-[9px] font-bold uppercase tracking-[.14em] text-white/32">Connection</span><span class="size-2 rounded-full" :class="state === 'connected' ? 'bg-[#d9ff57]' : state === 'error' ? 'bg-[#e66744]' : 'bg-white/20'" /></div><p data-testid="bluetooth-status" class="mt-3 text-sm font-semibold" role="status" aria-live="polite">{{ status }}</p><div v-if="info" class="mt-4 flex items-center gap-3 border-t border-white/8 pt-4"><span class="grid size-9 place-items-center rounded-full bg-white/10 text-[10px] font-bold">BT</span><span class="min-w-0"><strong class="block truncate text-xs">{{ info.name }}</strong><span class="mt-1 block truncate font-mono text-[9px] text-white/30">{{ info.id }}</span></span></div><p v-if="state === 'unsupported'" class="mt-3 text-[10px] leading-4 text-white/38">Use HTTPS in a supported Chromium browser with Bluetooth enabled.</p></div>
    <div class="mt-4 grid gap-2" :class="state === 'connected' || state === 'disconnected' ? 'grid-cols-[1.35fr_1fr]' : 'grid-cols-1'">
      <button type="button" data-testid="bluetooth-primary" class="min-h-12 rounded-[17px] bg-[#d9ff57] px-5 text-xs font-bold text-[#17201d] outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || state === 'requesting' || state === 'connecting' || supported === false" @click="state === 'disconnected' ? connect() : state === 'connected' ? selectDevice() : selectDevice()">{{ state === 'requesting' ? 'Opening…' : state === 'connecting' ? 'Connecting…' : state === 'disconnected' ? 'Reconnect' : state === 'connected' ? 'Change device' : selectLabel }}</button>
      <button v-if="state === 'connected'" type="button" data-testid="bluetooth-disconnect" class="min-h-12 rounded-[17px] bg-white/8 px-4 text-xs font-semibold text-white/60 outline-none focus-visible:ring-2 focus-visible:ring-white" @click="disconnect('manual')">Disconnect</button><button v-else-if="state === 'disconnected'" type="button" data-testid="bluetooth-clear" class="min-h-12 rounded-[17px] bg-white/8 px-4 text-xs font-semibold text-white/60 outline-none focus-visible:ring-2 focus-visible:ring-white" @click="clear">Clear</button>
    </div>
  </section>
</template>

<style scoped>
[data-testid="bluetooth-status"] { transition: opacity var(--bluetooth-duration) ease; }
@media (prefers-reduced-motion: reduce) { [data-testid="bluetooth-status"] { transition: none !important; } }
</style>
