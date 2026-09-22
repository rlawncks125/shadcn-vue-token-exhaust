<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

export type AnimatedMobileScannerState = 'scanning' | 'paused' | 'success' | 'error'
const props = withDefaults(defineProps<{
  state?: AnimatedMobileScannerState
  torch?: boolean
  instruction?: string
  pausedLabel?: string
  successLabel?: string
  errorLabel?: string
  result?: string
  duration?: number
  allowTorch?: boolean
  allowFlip?: boolean
  allowGallery?: boolean
  disabled?: boolean
  managed?: boolean
  autoStart?: boolean
}>(), {
  state: undefined, torch: false, instruction: 'Align the code inside the frame', pausedLabel: 'Scanner paused', successLabel: 'Code captured', errorLabel: 'Could not read the code', result: '', duration: 300, allowTorch: true, allowFlip: true, allowGallery: true, disabled: false, managed: true, autoStart: true,
})
const emit = defineEmits<{ 'update:torch': [value: boolean], 'update:state': [value: AnimatedMobileScannerState], torch: [value: boolean], flip: [facing: 'environment' | 'user'], gallery: [], retry: [], close: [], detected: [value: string, format: string], 'camera-start': [], 'camera-stop': [], 'camera-error': [message: string] }>()
type Detection = { rawValue: string, format?: string }
type Detector = { detect: (source: CanvasImageSource) => Promise<Detection[]> }
type DetectorConstructor = new () => Detector
const slots = useSlots()
const torchButton = ref<HTMLButtonElement>()
const video = ref<HTMLVideoElement>()
const fileInput = ref<HTMLInputElement>()
const internalState = ref<AnimatedMobileScannerState>('scanning')
const detectedResult = ref('')
const facing = ref<'environment' | 'user'>('environment')
let stream: MediaStream | undefined
let detector: Detector | undefined
let scanTimer: ReturnType<typeof setTimeout> | undefined
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1500, Math.max(0, props.duration)) : 300)
const effectiveState = computed(() => props.state ?? internalState.value)
const effectiveResult = computed(() => props.result || detectedResult.value)
const message = computed(() => ({ scanning: props.instruction, paused: props.pausedLabel, success: props.successLabel, error: props.errorLabel })[effectiveState.value])
function setState(value: AnimatedMobileScannerState) { internalState.value = value; emit('update:state', value) }
function reportError(error: unknown) { const message = error instanceof Error ? error.message : 'Camera is unavailable.'; setState('error'); emit('camera-error', message) }
function stopScanning() { if (scanTimer) clearTimeout(scanTimer); scanTimer = undefined }
async function detect(source: CanvasImageSource) { if (!detector) return; const result = (await detector.detect(source))[0]; if (!result) return; detectedResult.value = result.rawValue; setState('success'); emit('detected', result.rawValue, result.format ?? 'unknown'); stopScanning() }
function scan() { if (!video.value || effectiveState.value !== 'scanning') return; detect(video.value).catch(reportError); scanTimer = setTimeout(scan, 240) }
function stopCamera() { stopScanning(); stream?.getTracks().forEach(track => track.stop()); stream = undefined; if (video.value) video.value.srcObject = null; emit('camera-stop') }
async function startCamera() {
  if (props.disabled || !props.managed || slots.camera || typeof navigator === 'undefined') return false
  try {
    stopCamera(); setState('scanning')
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is not supported by this browser.')
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing.value } }, audio: false })
    if (!video.value) throw new Error('Camera view is unavailable.')
    video.value.srcObject = stream; await video.value.play(); emit('camera-start')
    const Constructor = (globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
    if (!Constructor) throw new Error('BarcodeDetector is not supported by this browser.')
    detector = new Constructor(); scan(); return true
  }
  catch (error) { reportError(error); return false }
}
async function toggleTorch() {
  if (props.disabled || !props.allowTorch) return false
  const value = !props.torch
  try { const track = stream?.getVideoTracks()[0]; if (track) await track.applyConstraints({ advanced: [{ torch: value } as MediaTrackConstraintSet] }); emit('update:torch', value); emit('torch', value); return true }
  catch (error) { reportError(error); return false }
}
async function flipCamera() { if (props.disabled) return false; facing.value = facing.value === 'environment' ? 'user' : 'environment'; emit('flip', facing.value); return props.managed ? startCamera() : true }
async function retry() { if (props.disabled) return false; emit('retry'); if (props.managed && !slots.camera) return startCamera(); setState('scanning'); return true }
function close() { if (props.disabled) return false; stopCamera(); emit('close'); return true }
function openGallery() { if (props.disabled) return false; emit('gallery'); fileInput.value?.click(); return true }
async function chooseImage(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; try { const bitmap = await createImageBitmap(file); setState('scanning'); await detect(bitmap); bitmap.close() } catch (error) { reportError(error) } }
onMounted(() => { if (props.autoStart && props.managed && !slots.camera) startCamera() })
watch(() => props.managed, value => { if (value && props.autoStart && !slots.camera) startCamera(); else if (!value) stopCamera() })
onBeforeUnmount(stopCamera)
defineExpose({ startCamera, stopCamera, toggleTorch, flipCamera, retry, close, focus: () => torchButton.value?.focus() })
</script>

<template>
  <section data-testid="animated-mobile-scanner" class="relative isolate min-h-[540px] w-full overflow-hidden rounded-[30px] bg-[#101411] text-white" :style="{ '--scanner-duration': `${safeDuration}ms` }" :aria-label="message">
    <div class="absolute inset-0"><slot name="camera"><video ref="video" class="size-full object-cover" autoplay muted playsinline /><div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_65%_25%,#536b5b_0,transparent_32%),linear-gradient(145deg,#273329,#111512_72%)]" /></slot></div>
    <div class="absolute inset-0 bg-black/20" />
    <header class="relative z-10 flex items-center justify-between p-4">
      <button type="button" data-testid="scanner-close" class="grid size-11 place-items-center rounded-full bg-black/30 text-xl outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" aria-label="Close scanner" @click="close">×</button>
      <span class="rounded-full bg-black/30 px-3 py-2 text-[9px] font-bold uppercase tracking-[.18em] backdrop-blur-md">Code scanner</span>
      <button v-if="allowTorch" ref="torchButton" type="button" data-testid="scanner-torch" class="grid size-11 place-items-center rounded-full bg-black/30 text-sm outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :class="torch ? 'bg-[#d9ff57] text-black' : ''" :disabled="disabled" :aria-pressed="torch" aria-label="Toggle torch" @click="toggleTorch">✦</button><span v-else class="size-11" />
    </header>

    <div class="relative z-10 mx-auto mt-16 aspect-square w-[72%] max-w-[300px]">
      <span v-for="corner in ['tl','tr','br','bl']" :key="corner" class="absolute size-12 border-[#d9ff57]" :class="{ 'left-0 top-0 rounded-tl-[24px] border-l-4 border-t-4': corner === 'tl', 'right-0 top-0 rounded-tr-[24px] border-r-4 border-t-4': corner === 'tr', 'bottom-0 right-0 rounded-br-[24px] border-b-4 border-r-4': corner === 'br', 'bottom-0 left-0 rounded-bl-[24px] border-b-4 border-l-4': corner === 'bl' }" />
      <span v-if="effectiveState === 'scanning'" class="scan-line absolute inset-x-4 top-5 h-px bg-[#d9ff57] shadow-[0_0_16px_2px_rgba(217,255,87,.8)] motion-reduce:top-1/2" aria-hidden="true" />
      <Transition name="result" mode="out-in">
        <div v-if="effectiveState === 'success'" key="success" class="absolute inset-7 grid place-items-center rounded-[22px] bg-[#d9ff57]/95 p-5 text-center text-black"><div><span class="mx-auto grid size-12 place-items-center rounded-full bg-black text-2xl text-[#d9ff57]">✓</span><strong class="mt-4 block text-sm">{{ successLabel }}</strong><span v-if="effectiveResult" class="mt-2 block max-w-[190px] truncate font-mono text-[10px] opacity-55">{{ effectiveResult }}</span></div></div>
        <div v-else-if="effectiveState === 'error'" key="error" class="absolute inset-7 grid place-items-center rounded-[22px] bg-[#301d18]/95 p-5 text-center"><div><span class="text-3xl">!</span><strong class="mt-3 block text-sm">{{ errorLabel }}</strong><button type="button" data-testid="scanner-retry" class="mt-5 min-h-11 rounded-[14px] bg-white px-5 text-xs font-bold text-black outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :disabled="disabled" @click="retry">Try again</button></div></div>
        <div v-else-if="effectiveState === 'paused'" key="paused" class="absolute inset-7 grid place-items-center rounded-[22px] bg-black/55 text-center backdrop-blur-sm"><strong class="text-sm">{{ pausedLabel }}</strong></div>
      </Transition>
    </div>

    <div class="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 text-center">
      <p data-testid="scanner-message" class="text-xs font-semibold" aria-live="polite">{{ message }}</p>
      <div class="mt-5 flex justify-center gap-4">
        <button v-if="allowGallery" type="button" data-testid="scanner-gallery" class="min-h-11 rounded-[15px] bg-white/12 px-4 text-[10px] font-semibold outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="openGallery">Choose image</button>
        <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" @change="chooseImage">
        <button v-if="allowFlip" type="button" data-testid="scanner-flip" class="min-h-11 rounded-[15px] bg-white/12 px-4 text-[10px] font-semibold outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="flipCamera">Flip camera</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scan-line { animation: scanner-sweep 2s ease-in-out infinite alternate; }
.result-enter-active,.result-leave-active { transition: opacity var(--scanner-duration) ease, transform var(--scanner-duration) cubic-bezier(.2,.8,.2,1); }
.result-enter-from,.result-leave-to { opacity: 0; transform: scale(.94); }
@keyframes scanner-sweep { to { transform: translateY(230px); } }
@media (prefers-reduced-motion: reduce) { .scan-line { animation: none !important; } .result-enter-active,.result-leave-active { transition: none !important; } }
</style>
