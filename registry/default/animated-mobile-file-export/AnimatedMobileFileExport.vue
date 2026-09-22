<script setup lang="ts">
import { computed, ref } from 'vue'

export type AnimatedMobileFileExportState = 'idle' | 'picking' | 'writing' | 'saved' | 'downloaded' | 'cancelled' | 'unsupported' | 'error'
type WritableFileStream = { write: (data: Blob) => Promise<void>, close: () => Promise<void> }
type FileHandle = { name: string, createWritable: () => Promise<WritableFileStream> }
type SavePicker = (options: { suggestedName: string, types: Array<{ description: string, accept: Record<string, string[]> }> }) => Promise<FileHandle>
const props = withDefaults(defineProps<{
  content: string | Blob
  filename?: string
  mimeType?: string
  extension?: string
  title?: string
  description?: string
  saveLabel?: string
  fallbackDownload?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  filename: 'export.txt', mimeType: 'text/plain', extension: '.txt', title: 'Export file', description: 'Save a local copy directly to your device.', saveLabel: 'Save to device', fallbackDownload: true, duration: 260, disabled: false,
})
const emit = defineEmits<{
  saving: [filename: string]
  saved: [filename: string]
  download: [filename: string]
  cancel: []
  unsupported: []
  error: [message: string]
}>()
const state = ref<AnimatedMobileFileExportState>('idle')
const errorMessage = ref('')
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 260)
const blob = computed(() => props.content instanceof Blob ? props.content : new Blob([props.content], { type: props.mimeType }))
const size = computed(() => { const bytes = blob.value.size; return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB` })
const status = computed(() => ({ idle: 'Ready to export', picking: 'Choose where to save…', writing: 'Writing file…', saved: 'Saved to your device', downloaded: 'Download started', cancelled: 'Save cancelled', unsupported: 'File saving is unavailable', error: errorMessage.value || 'File export failed' })[state.value])
function picker() { return (window as Window & { showSaveFilePicker?: SavePicker }).showSaveFilePicker }
function download() {
  if (!props.fallbackDownload || typeof document === 'undefined') { state.value = 'unsupported'; emit('unsupported'); return false }
  const url = URL.createObjectURL(blob.value); const anchor = document.createElement('a'); anchor.href = url; anchor.download = props.filename; anchor.hidden = true; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
  state.value = 'downloaded'; emit('download', props.filename); return true
}
async function save() {
  if (props.disabled || state.value === 'picking' || state.value === 'writing' || typeof window === 'undefined') return false
  const showPicker = picker()
  if (!showPicker) return download()
  try {
    state.value = 'picking'; errorMessage.value = ''; emit('saving', props.filename)
    const handle = await showPicker({ suggestedName: props.filename, types: [{ description: `${props.extension.replace('.', '').toUpperCase()} file`, accept: { [props.mimeType]: [props.extension.startsWith('.') ? props.extension : `.${props.extension}`] } }] })
    state.value = 'writing'; const writable = await handle.createWritable(); await writable.write(blob.value); await writable.close(); state.value = 'saved'; emit('saved', handle.name || props.filename); return true
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') { state.value = 'cancelled'; emit('cancel'); return false }
    errorMessage.value = error instanceof Error ? error.message : 'File export failed.'; state.value = 'error'; emit('error', errorMessage.value); return false
  }
}
function reset() { state.value = 'idle'; errorMessage.value = '' }
defineExpose({ save, download, reset, state })
</script>

<template>
  <section data-testid="animated-mobile-file-export" class="w-full rounded-[28px] border border-black/10 bg-[#f3eee4] p-5 text-[#1b1d19] shadow-[0_22px_60px_-42px_rgba(0,0,0,.55)]" :style="{ '--export-duration': `${safeDuration}ms` }">
    <div class="flex items-start gap-4"><div class="grid size-14 shrink-0 place-items-center rounded-[19px] bg-[#e36745] text-xl font-bold text-white" aria-hidden="true">↓</div><div class="min-w-0 flex-1"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Local file</p><h3 class="mt-2 text-lg font-semibold tracking-[-.03em]">{{ title }}</h3><p class="mt-1 text-xs leading-5 text-black/45">{{ description }}</p></div></div>
    <div class="mt-5 flex items-center gap-3 rounded-[19px] bg-white/65 p-4"><span class="grid size-10 shrink-0 place-items-center rounded-[13px] bg-black/6 font-mono text-[9px] font-bold">{{ extension.replace('.', '').slice(0, 4).toUpperCase() }}</span><span class="min-w-0 flex-1"><strong class="block truncate text-xs">{{ filename }}</strong><span class="mt-1 block text-[9px] text-black/35">{{ size }} · {{ mimeType }}</span></span></div>
    <button type="button" data-testid="file-export-save" class="mt-4 min-h-12 w-full rounded-[17px] bg-[#1b1d19] px-5 text-xs font-bold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || state === 'picking' || state === 'writing'" @click="save">{{ state === 'picking' ? 'Choosing location…' : state === 'writing' ? 'Writing…' : saveLabel }}</button>
    <div class="mt-4 flex items-center justify-center gap-2"><span class="size-1.5 rounded-full" :class="state === 'saved' || state === 'downloaded' ? 'bg-emerald-500' : state === 'error' ? 'bg-red-500' : 'bg-black/20'" /><p data-testid="file-export-status" class="text-[9px] font-medium text-black/40" role="status" aria-live="polite">{{ status }}</p></div>
  </section>
</template>

<style scoped>
[data-testid="file-export-status"] { transition: opacity var(--export-duration) ease; }
@media (prefers-reduced-motion: reduce) { [data-testid="file-export-status"] { transition: none !important; } }
</style>
