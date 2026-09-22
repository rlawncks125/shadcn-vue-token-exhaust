<script setup lang="ts">
import { computed, ref } from 'vue'

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
}>(), {
  state: 'scanning', torch: false, instruction: 'Align the code inside the frame', pausedLabel: 'Scanner paused', successLabel: 'Code captured', errorLabel: 'Could not read the code', result: '', duration: 300, allowTorch: true, allowFlip: true, allowGallery: true, disabled: false,
})
const emit = defineEmits<{ 'update:torch': [value: boolean], torch: [value: boolean], flip: [], gallery: [], retry: [], close: [] }>()
const torchButton = ref<HTMLButtonElement>()
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1500, Math.max(0, props.duration)) : 300)
const message = computed(() => ({ scanning: props.instruction, paused: props.pausedLabel, success: props.successLabel, error: props.errorLabel })[props.state])
function toggleTorch() { if (props.disabled || !props.allowTorch) return false; const value = !props.torch; emit('update:torch', value); emit('torch', value); return true }
function action(type: 'flip' | 'gallery' | 'retry' | 'close') {
  if (props.disabled) return false
  if (type === 'flip') emit('flip')
  else if (type === 'gallery') emit('gallery')
  else if (type === 'retry') emit('retry')
  else emit('close')
  return true
}
defineExpose({ toggleTorch, retry: () => action('retry'), close: () => action('close'), focus: () => torchButton.value?.focus() })
</script>

<template>
  <section data-testid="animated-mobile-scanner" class="relative isolate min-h-[540px] w-full overflow-hidden rounded-[30px] bg-[#101411] text-white" :style="{ '--scanner-duration': `${safeDuration}ms` }" :aria-label="message">
    <div class="absolute inset-0"><slot name="camera"><div class="size-full bg-[radial-gradient(circle_at_65%_25%,#536b5b_0,transparent_32%),linear-gradient(145deg,#273329,#111512_72%)]" /></slot></div>
    <div class="absolute inset-0 bg-black/20" />
    <header class="relative z-10 flex items-center justify-between p-4">
      <button type="button" data-testid="scanner-close" class="grid size-11 place-items-center rounded-full bg-black/30 text-xl outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" aria-label="Close scanner" @click="action('close')">×</button>
      <span class="rounded-full bg-black/30 px-3 py-2 text-[9px] font-bold uppercase tracking-[.18em] backdrop-blur-md">Code scanner</span>
      <button v-if="allowTorch" ref="torchButton" type="button" data-testid="scanner-torch" class="grid size-11 place-items-center rounded-full bg-black/30 text-sm outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :class="torch ? 'bg-[#d9ff57] text-black' : ''" :disabled="disabled" :aria-pressed="torch" aria-label="Toggle torch" @click="toggleTorch">✦</button><span v-else class="size-11" />
    </header>

    <div class="relative z-10 mx-auto mt-16 aspect-square w-[72%] max-w-[300px]">
      <span v-for="corner in ['tl','tr','br','bl']" :key="corner" class="absolute size-12 border-[#d9ff57]" :class="{ 'left-0 top-0 rounded-tl-[24px] border-l-4 border-t-4': corner === 'tl', 'right-0 top-0 rounded-tr-[24px] border-r-4 border-t-4': corner === 'tr', 'bottom-0 right-0 rounded-br-[24px] border-b-4 border-r-4': corner === 'br', 'bottom-0 left-0 rounded-bl-[24px] border-b-4 border-l-4': corner === 'bl' }" />
      <span v-if="state === 'scanning'" class="scan-line absolute inset-x-4 top-5 h-px bg-[#d9ff57] shadow-[0_0_16px_2px_rgba(217,255,87,.8)] motion-reduce:top-1/2" aria-hidden="true" />
      <Transition name="result" mode="out-in">
        <div v-if="state === 'success'" key="success" class="absolute inset-7 grid place-items-center rounded-[22px] bg-[#d9ff57]/95 p-5 text-center text-black"><div><span class="mx-auto grid size-12 place-items-center rounded-full bg-black text-2xl text-[#d9ff57]">✓</span><strong class="mt-4 block text-sm">{{ successLabel }}</strong><span v-if="result" class="mt-2 block max-w-[190px] truncate font-mono text-[10px] opacity-55">{{ result }}</span></div></div>
        <div v-else-if="state === 'error'" key="error" class="absolute inset-7 grid place-items-center rounded-[22px] bg-[#301d18]/95 p-5 text-center"><div><span class="text-3xl">!</span><strong class="mt-3 block text-sm">{{ errorLabel }}</strong><button type="button" data-testid="scanner-retry" class="mt-5 min-h-11 rounded-[14px] bg-white px-5 text-xs font-bold text-black outline-none focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :disabled="disabled" @click="action('retry')">Try again</button></div></div>
        <div v-else-if="state === 'paused'" key="paused" class="absolute inset-7 grid place-items-center rounded-[22px] bg-black/55 text-center backdrop-blur-sm"><strong class="text-sm">{{ pausedLabel }}</strong></div>
      </Transition>
    </div>

    <div class="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 text-center">
      <p data-testid="scanner-message" class="text-xs font-semibold" aria-live="polite">{{ message }}</p>
      <div class="mt-5 flex justify-center gap-4">
        <button v-if="allowGallery" type="button" data-testid="scanner-gallery" class="min-h-11 rounded-[15px] bg-white/12 px-4 text-[10px] font-semibold outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="action('gallery')">Choose image</button>
        <button v-if="allowFlip" type="button" data-testid="scanner-flip" class="min-h-11 rounded-[15px] bg-white/12 px-4 text-[10px] font-semibold outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="action('flip')">Flip camera</button>
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
