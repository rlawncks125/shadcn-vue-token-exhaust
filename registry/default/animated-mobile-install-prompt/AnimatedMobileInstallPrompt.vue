<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type AnimatedMobileInstallState = 'waiting' | 'ready' | 'prompting' | 'accepted' | 'dismissed' | 'installed' | 'ios'
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}
const props = withDefaults(defineProps<{
  modelValue?: boolean
  appName?: string
  description?: string
  installLabel?: string
  dismissLabel?: string
  autoShow?: boolean
  closeOnChoice?: boolean
  dismissible?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  modelValue: true,
  appName: 'Field Notes',
  description: 'Install this app for quicker access and a focused full-screen experience.',
  installLabel: 'Install app',
  dismissLabel: 'Not now',
  autoShow: true,
  closeOnChoice: true,
  dismissible: true,
  duration: 280,
  disabled: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  available: []
  prompt: []
  choice: [outcome: 'accepted' | 'dismissed', platform: string]
  installed: []
  dismiss: []
  error: [message: string]
}>()
const state = ref<AnimatedMobileInstallState>('waiting')
const errorMessage = ref('')
let deferredPrompt: InstallPromptEvent | null = null
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 280)
const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
const status = computed(() => ({ waiting: 'Checking install availability…', ready: 'Ready to install', prompting: 'Opening install prompt…', accepted: 'Installation accepted', dismissed: 'Installation dismissed', installed: 'App installed', ios: 'Add to your Home Screen from the Share menu' })[state.value])

function capturePrompt(event: Event) {
  event.preventDefault(); deferredPrompt = event as InstallPromptEvent; state.value = 'ready'; emit('available'); if (props.autoShow) emit('update:modelValue', true)
}
function handleInstalled() { deferredPrompt = null; state.value = 'installed'; emit('installed'); emit('update:modelValue', false) }
async function install() {
  if (props.disabled || state.value === 'prompting') return false
  if (!deferredPrompt) { if (isIos()) state.value = 'ios'; return false }
  try {
    state.value = 'prompting'; emit('prompt'); await deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice; deferredPrompt = null; state.value = result.outcome; emit('choice', result.outcome, result.platform)
    if (props.closeOnChoice) emit('update:modelValue', false)
    return result.outcome === 'accepted'
  }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Install prompt failed.'; state.value = 'waiting'; emit('error', errorMessage.value); return false }
}
function dismiss() { if (props.disabled || !props.dismissible) return false; emit('update:modelValue', false); emit('dismiss'); return true }
function show() { emit('update:modelValue', true) }
onMounted(() => {
  if (isStandalone()) state.value = 'installed'
  else if (isIos()) state.value = 'ios'
  window.addEventListener('beforeinstallprompt', capturePrompt)
  window.addEventListener('appinstalled', handleInstalled)
})
onBeforeUnmount(() => { window.removeEventListener('beforeinstallprompt', capturePrompt); window.removeEventListener('appinstalled', handleInstalled) })
defineExpose({ install, dismiss, show, state })
</script>

<template>
  <Transition name="install-prompt">
    <section v-if="modelValue" data-testid="animated-mobile-install-prompt" class="w-full rounded-[30px] border border-black/10 bg-[#1b1d19] p-5 text-white shadow-[0_26px_70px_-36px_rgba(0,0,0,.8)]" :style="{ '--install-duration': `${safeDuration}ms` }" aria-labelledby="install-title">
      <div class="flex items-start gap-4">
        <div class="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-[20px] bg-[#d9ff57] text-2xl font-black text-[#1b1d19] shadow-[0_10px_30px_-12px_rgba(217,255,87,.5)]" aria-hidden="true"><span class="absolute -right-3 -top-3 size-8 rounded-full bg-[#e66744]" />FN</div>
        <div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Install experience</p><h3 id="install-title" class="mt-2 truncate text-xl font-semibold tracking-[-.03em]">{{ appName }}</h3><p class="mt-2 text-xs leading-5 text-white/48">{{ description }}</p></div>
      </div>

      <div class="mt-6 flex items-center gap-3 rounded-[18px] bg-white/[.06] p-3"><span class="relative flex size-2.5"><span v-if="state === 'ready'" class="absolute size-full animate-ping rounded-full bg-[#d9ff57]/35 motion-reduce:animate-none" /><span class="relative size-2.5 rounded-full" :class="state === 'ready' || state === 'accepted' || state === 'installed' ? 'bg-[#d9ff57]' : state === 'dismissed' ? 'bg-[#e66744]' : 'bg-white/25'" /></span><p data-testid="install-prompt-status" class="text-[10px] font-semibold text-white/60" role="status" aria-live="polite">{{ errorMessage || status }}</p></div>

      <div v-if="state === 'ios'" class="mt-4 rounded-[18px] border border-white/8 p-4 text-[10px] leading-5 text-white/55"><strong class="text-white">On iPhone or iPad:</strong> tap Share in Safari, then choose Add to Home Screen.</div>
      <div class="mt-4 grid gap-2" :class="dismissible && state !== 'ios' ? 'grid-cols-[1.4fr_1fr]' : 'grid-cols-1'">
        <button v-if="state !== 'ios'" type="button" data-testid="install-prompt-install" class="min-h-12 rounded-[17px] bg-[#d9ff57] px-5 text-xs font-bold text-[#1b1d19] outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || state === 'waiting' || state === 'prompting' || state === 'installed' || state === 'dismissed' || state === 'accepted'" @click="install">{{ state === 'prompting' ? 'Opening…' : installLabel }}</button>
        <button v-if="dismissible" type="button" data-testid="install-prompt-dismiss" class="min-h-12 rounded-[17px] bg-white/8 px-4 text-xs font-semibold text-white/60 outline-none hover:not-disabled:bg-white/12 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="dismiss">{{ dismissLabel }}</button>
      </div>
      <p class="mt-4 text-center text-[9px] text-white/28">No download store required · Uses the browser install prompt</p>
    </section>
  </Transition>
</template>

<style scoped>
.install-prompt-enter-active,.install-prompt-leave-active { transition: opacity var(--install-duration) ease, transform var(--install-duration) cubic-bezier(.2,.8,.2,1); }
.install-prompt-enter-from,.install-prompt-leave-to { opacity: 0; transform: translateY(12px) scale(.98); }
@media (prefers-reduced-motion: reduce) { .install-prompt-enter-active,.install-prompt-leave-active { transition: none !important; } }
</style>
