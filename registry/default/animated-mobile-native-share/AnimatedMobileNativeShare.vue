<script setup lang="ts">
import { computed, ref } from 'vue'

export type AnimatedMobileShareState = 'idle' | 'sharing' | 'shared' | 'copied' | 'cancelled' | 'unsupported' | 'error'
const props = withDefaults(defineProps<{
  title?: string
  text?: string
  url?: string
  files?: File[]
  label?: string
  description?: string
  shareLabel?: string
  fallback?: 'clipboard' | 'none'
  duration?: number
  disabled?: boolean
}>(), {
  title: '', text: '', url: '', files: () => [], label: 'Share', description: 'Send this item using apps on your device.', shareLabel: 'Share now', fallback: 'clipboard', duration: 240, disabled: false,
})
const emit = defineEmits<{
  share: [data: ShareData]
  shared: [data: ShareData]
  cancel: []
  copied: [value: string]
  unsupported: []
  error: [message: string]
}>()
const state = ref<AnimatedMobileShareState>('idle')
const errorMessage = ref('')
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 240)
const data = computed<ShareData>(() => ({ ...(props.title ? { title: props.title } : {}), ...(props.text ? { text: props.text } : {}), ...(props.url ? { url: props.url } : {}), ...(props.files.length ? { files: props.files } : {}) }))
const fallbackValue = computed(() => [props.text, props.url].filter(Boolean).join('\n') || props.title)
const status = computed(() => ({ idle: 'Ready to share', sharing: 'Opening share sheet…', shared: 'Shared successfully', copied: 'Copied to clipboard', cancelled: 'Share cancelled', unsupported: 'Native sharing is unavailable', error: errorMessage.value || 'Sharing failed' })[state.value])
async function copyFallback() {
  if (props.fallback !== 'clipboard' || !fallbackValue.value || !navigator.clipboard?.writeText) { state.value = 'unsupported'; emit('unsupported'); return false }
  try { await navigator.clipboard.writeText(fallbackValue.value); state.value = 'copied'; emit('copied', fallbackValue.value); return true }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Clipboard access failed.'; state.value = 'error'; emit('error', errorMessage.value); return false }
}
async function openShare() {
  if (props.disabled || state.value === 'sharing' || typeof navigator === 'undefined') return false
  const payload = data.value
  if (!navigator.share) return copyFallback()
  if (props.files.length && navigator.canShare && !navigator.canShare(payload)) { errorMessage.value = 'These files cannot be shared by this browser.'; state.value = 'error'; emit('error', errorMessage.value); return false }
  try { state.value = 'sharing'; errorMessage.value = ''; emit('share', payload); await navigator.share(payload); state.value = 'shared'; emit('shared', payload); return true }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') { state.value = 'cancelled'; emit('cancel'); return false }
    errorMessage.value = error instanceof Error ? error.message : 'Native sharing failed.'; state.value = 'error'; emit('error', errorMessage.value); return false
  }
}
function reset() { state.value = 'idle'; errorMessage.value = '' }
defineExpose({ openShare, copyFallback, reset, state })
</script>

<template>
  <section data-testid="animated-mobile-native-share" class="w-full rounded-[28px] border border-black/10 bg-[#f4efe5] p-5 text-[#1b1d19] shadow-[0_22px_60px_-42px_rgba(0,0,0,.55)]" :style="{ '--share-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4"><div class="grid size-14 shrink-0 place-items-center rounded-[19px] bg-[#7c9f91] text-xl text-white" aria-hidden="true">↗</div><div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Native share</p><h3 class="mt-2 truncate text-lg font-semibold tracking-[-.03em]">{{ label }}</h3><p class="mt-1 text-xs leading-5 text-black/45">{{ description }}</p></div></div>
    <div class="mt-5 rounded-[19px] bg-white/65 p-4"><strong v-if="title" class="block truncate text-xs">{{ title }}</strong><p v-if="text" class="mt-2 line-clamp-2 text-[10px] leading-4 text-black/45">{{ text }}</p><span v-if="url" class="mt-2 block truncate font-mono text-[9px] text-black/30">{{ url }}</span><span v-if="files.length" class="mt-3 inline-flex rounded-full bg-black/6 px-2.5 py-1 text-[9px] font-semibold">{{ files.length }} file{{ files.length === 1 ? '' : 's' }}</span></div>
    <button type="button" data-testid="native-share-open" class="mt-4 min-h-12 w-full rounded-[17px] bg-[#1b1d19] px-5 text-xs font-bold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || state === 'sharing'" @click="openShare">{{ state === 'sharing' ? 'Opening…' : shareLabel }}</button>
    <div class="mt-4 flex items-center justify-center gap-2"><span class="size-1.5 rounded-full" :class="state === 'shared' || state === 'copied' ? 'bg-emerald-500' : state === 'error' ? 'bg-red-500' : 'bg-black/20'" /><p data-testid="native-share-status" class="text-[9px] font-medium text-black/40" role="status" aria-live="polite">{{ status }}</p></div>
  </section>
</template>

<style scoped>
[data-testid="native-share-status"] { transition: opacity var(--share-duration) ease; }
@media (prefers-reduced-motion: reduce) { [data-testid="native-share-status"] { transition: none !important; } }
</style>
