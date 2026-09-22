<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type AnimatedMobileReadAloudState = 'idle' | 'speaking' | 'paused' | 'ended' | 'stopped' | 'unsupported' | 'error'
const props = withDefaults(defineProps<{
  text: string
  title?: string
  language?: string
  voiceName?: string
  rate?: number
  pitch?: number
  volume?: number
  showVoicePicker?: boolean
  stopOnUnmount?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  title: 'Read aloud', language: 'en-US', voiceName: '', rate: 1, pitch: 1, volume: 1, showVoicePicker: true, stopOnUnmount: true, duration: 220, disabled: false,
})
const emit = defineEmits<{ start: [], pause: [], resume: [], stop: [], end: [], boundary: [characterIndex: number, progress: number], error: [message: string], 'voice-change': [name: string] }>()
const state = ref<AnimatedMobileReadAloudState>('idle')
const progress = ref(0)
const voices = ref<SpeechSynthesisVoice[]>([])
const selectedVoice = ref(props.voiceName)
const errorMessage = ref('')
let utterance: SpeechSynthesisUtterance | null = null
const supported = ref<boolean | null>(null)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 220)
const matchingVoices = computed(() => voices.value.filter(voice => !props.language || voice.lang.toLowerCase().startsWith(props.language.split('-')[0]!.toLowerCase())))
const status = computed(() => ({ idle: 'Ready to read', speaking: 'Reading aloud…', paused: 'Reading paused', ended: 'Finished reading', stopped: 'Reading stopped', unsupported: 'Speech synthesis is unavailable', error: errorMessage.value || 'Speech playback failed' })[state.value])
function engine() { return typeof window !== 'undefined' ? window.speechSynthesis : undefined }
function loadVoices() {
  const synthesis = engine(); if (!synthesis) return
  voices.value = synthesis.getVoices()
  if (!selectedVoice.value) selectedVoice.value = matchingVoices.value.find(voice => voice.default)?.name || matchingVoices.value[0]?.name || voices.value[0]?.name || ''
}
function speak() {
  const synthesis = engine()
  if (props.disabled || !props.text.trim() || !synthesis || typeof SpeechSynthesisUtterance === 'undefined') return false
  synthesis.cancel(); progress.value = 0; errorMessage.value = ''
  utterance = new SpeechSynthesisUtterance(props.text); utterance.lang = props.language; utterance.rate = Math.min(10, Math.max(0.1, props.rate)); utterance.pitch = Math.min(2, Math.max(0, props.pitch)); utterance.volume = Math.min(1, Math.max(0, props.volume))
  utterance.voice = voices.value.find(voice => voice.name === selectedVoice.value) || null
  utterance.onstart = () => { state.value = 'speaking'; emit('start') }
  utterance.onpause = () => { state.value = 'paused'; emit('pause') }
  utterance.onresume = () => { state.value = 'speaking'; emit('resume') }
  utterance.onboundary = event => { progress.value = props.text.length ? Math.min(1, event.charIndex / props.text.length) : 0; emit('boundary', event.charIndex, progress.value) }
  utterance.onend = () => { if (state.value !== 'stopped') { progress.value = 1; state.value = 'ended'; emit('end') }; utterance = null }
  utterance.onerror = event => { errorMessage.value = event.error || 'Speech playback failed.'; state.value = 'error'; emit('error', errorMessage.value); utterance = null }
  synthesis.speak(utterance); return true
}
function pause() { const synthesis = engine(); if (!synthesis || state.value !== 'speaking') return false; synthesis.pause(); state.value = 'paused'; emit('pause'); return true }
function resume() { const synthesis = engine(); if (!synthesis || state.value !== 'paused') return false; synthesis.resume(); state.value = 'speaking'; emit('resume'); return true }
function stop() { const synthesis = engine(); if (!synthesis || !['speaking', 'paused'].includes(state.value)) return false; state.value = 'stopped'; synthesis.cancel(); utterance = null; emit('stop'); return true }
function toggle() { return state.value === 'speaking' ? pause() : state.value === 'paused' ? resume() : speak() }
function changeVoice(event: Event) { selectedVoice.value = (event.target as HTMLSelectElement).value; emit('voice-change', selectedVoice.value) }
onMounted(() => { supported.value = Boolean(engine() && typeof SpeechSynthesisUtterance !== 'undefined'); if (!supported.value) state.value = 'unsupported'; else { loadVoices(); engine()!.addEventListener('voiceschanged', loadVoices) } })
onBeforeUnmount(() => { engine()?.removeEventListener('voiceschanged', loadVoices); if (props.stopOnUnmount) engine()?.cancel() })
defineExpose({ speak, pause, resume, stop, toggle, state, progress, voices })
</script>

<template>
  <section data-testid="animated-mobile-read-aloud" class="w-full rounded-[30px] border border-black/10 bg-[#f3eee4] p-5 text-[#1b1d19] shadow-[0_22px_60px_-42px_rgba(0,0,0,.55)]" :style="{ '--speech-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4"><div class="relative grid size-14 shrink-0 place-items-center rounded-[19px] bg-[#735f9a] text-xl text-white" aria-hidden="true"><span v-if="state === 'speaking'" class="absolute inset-0 animate-ping rounded-[19px] bg-[#735f9a]/25 motion-reduce:animate-none" />▶</div><div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Speech synthesis</p><h3 class="mt-2 text-lg font-semibold tracking-[-.03em]">{{ title }}</h3><p class="mt-1 line-clamp-2 text-xs leading-5 text-black/45">{{ text }}</p></div></div>
    <div class="mt-5 rounded-[19px] bg-white/65 p-4"><div class="flex items-center justify-between"><p data-testid="read-aloud-status" class="text-xs font-semibold" role="status" aria-live="polite">{{ status }}</p><span class="font-mono text-[9px] text-black/32">{{ Math.round(progress * 100) }}%</span></div><div class="mt-3 h-1.5 overflow-hidden rounded-full bg-black/8"><div class="h-full rounded-full bg-[#735f9a] transition-[width] motion-reduce:transition-none" :style="{ width: `${progress * 100}%`, transitionDuration: `${safeDuration}ms` }" /></div><label v-if="showVoicePicker && matchingVoices.length" class="mt-4 block"><span class="mb-2 block text-[9px] font-bold uppercase tracking-[.12em] text-black/30">Voice</span><select :value="selectedVoice" data-testid="read-aloud-voice" class="h-10 w-full rounded-[13px] border border-black/8 bg-white px-3 text-[10px] outline-none focus:ring-2 focus:ring-black" :disabled="disabled || state === 'speaking'" @change="changeVoice"><option v-for="voice in matchingVoices" :key="voice.voiceURI" :value="voice.name">{{ voice.name }} · {{ voice.lang }}</option></select></label></div>
    <div class="mt-4 grid grid-cols-[1.5fr_1fr] gap-2"><button type="button" data-testid="read-aloud-toggle" class="min-h-12 rounded-[17px] bg-[#1b1d19] px-5 text-xs font-bold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || supported === false" @click="toggle">{{ state === 'speaking' ? 'Pause' : state === 'paused' ? 'Resume' : 'Read aloud' }}</button><button type="button" data-testid="read-aloud-stop" class="min-h-12 rounded-[17px] border border-black/10 px-4 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-30" :disabled="disabled || !['speaking', 'paused'].includes(state)" @click="stop">Stop</button></div>
  </section>
</template>
