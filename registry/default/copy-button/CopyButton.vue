<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type CopyState = 'idle' | 'copying' | 'copied' | 'error'

const props = withDefaults(defineProps<{
  text: string
  label?: string
  copiedLabel?: string
  errorLabel?: string
  duration?: number
  resetAfter?: number
  disabled?: boolean
  iconOnly?: boolean
  ariaLabel?: string
}>(), {
  label: 'Copy',
  copiedLabel: 'Copied',
  errorLabel: 'Try again',
  duration: 180,
  resetAfter: 1800,
  disabled: false,
  iconOnly: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  copy: [text: string]
  copied: [text: string]
  error: [error: Error]
  reset: []
}>()

const state = ref<CopyState>('idle')
const labelElement = ref<HTMLElement | null>(null)
const labelWidth = ref<number>()
let resetTimer: ReturnType<typeof setTimeout> | undefined

const currentLabel = computed(() => {
  if (state.value === 'copying') return 'Copying'
  if (state.value === 'copied') return props.copiedLabel
  if (state.value === 'error') return props.errorLabel
  return props.label
})
const statusMessage = computed(() => {
  if (state.value === 'copying') return 'Copying to clipboard'
  if (state.value === 'copied') return props.copiedLabel
  if (state.value === 'error') return props.errorLabel
  return ''
})
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 180)
const safeResetAfter = computed(() => Number.isFinite(props.resetAfter) ? Math.min(60000, Math.max(0, props.resetAfter)) : 1800)
const buttonStyle = computed(() => ({
  '--copy-duration': `${safeDuration.value}ms`,
}))
const labelStyle = computed(() => labelWidth.value === undefined ? undefined : { width: `${labelWidth.value}px` })

function clearResetTimer() {
  if (resetTimer !== undefined) clearTimeout(resetTimer)
  resetTimer = undefined
}

function reset() {
  clearResetTimer()
  if (state.value === 'idle') return
  state.value = 'idle'
  emit('reset')
}

function scheduleReset() {
  clearResetTimer()
  if (safeResetAfter.value > 0) resetTimer = setTimeout(reset, safeResetAfter.value)
}

function legacyCopy(text: string) {
  const textarea = document.createElement('textarea')
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const selection = document.getSelection()
  const selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  let copied = false
  try {
    copied = document.execCommand('copy')
  }
  finally {
    textarea.remove()
    activeElement?.focus({ preventScroll: true })
    if (selection && selectedRange) {
      selection.removeAllRanges()
      selection.addRange(selectedRange)
    }
  }

  if (!copied) throw new Error('Unable to copy text to the clipboard.')
}

async function writeToClipboard(text: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Clipboard access is only available in a browser.')
  }

  if (window.navigator.clipboard?.writeText) {
    await window.navigator.clipboard.writeText(text)
    return
  }

  legacyCopy(text)
}

async function copy() {
  if (props.disabled || state.value === 'copying') return

  clearResetTimer()
  state.value = 'copying'
  emit('copy', props.text)

  try {
    await writeToClipboard(props.text)
    state.value = 'copied'
    emit('copied', props.text)
  }
  catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause))
    state.value = 'error'
    emit('error', error)
  }

  scheduleReset()
}

async function updateLabelWidth() {
  await nextTick()
  if (labelElement.value) labelWidth.value = Math.ceil(labelElement.value.getBoundingClientRect().width)
}

watch(currentLabel, updateLabelWidth)
onMounted(updateLabelWidth)
onBeforeUnmount(clearResetTimer)

defineExpose({ copy, reset })
</script>

<template>
  <span class="copy-button-root relative inline-flex">
    <button
      type="button"
      data-testid="copy-button"
      :data-state="state"
      :disabled="disabled"
      :aria-label="iconOnly ? (ariaLabel || label) : undefined"
      :aria-busy="state === 'copying'"
      :title="iconOnly ? (ariaLabel || currentLabel) : undefined"
      class="copy-button group inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-border/80 bg-foreground text-sm font-semibold text-background shadow-sm outline-none transition-[transform,background-color,border-color,box-shadow] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-md active:not-disabled:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="[
        iconOnly ? 'size-10 p-0' : 'h-10 px-4',
        state === 'copied' ? '!border-emerald-500/30 !bg-emerald-600 !text-white' : '',
        state === 'error' ? '!border-red-500/30 !bg-red-600 !text-white' : '',
      ]"
      :style="buttonStyle"
      @click="copy"
    >
      <svg class="size-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <g class="copy-icon-part" :class="{ 'is-visible': state === 'idle' }">
          <rect x="6.5" y="5.5" width="9" height="10" rx="2" stroke="currentColor" stroke-width="1.5" />
          <path d="M13 5.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </g>
        <circle class="copy-icon-part copy-icon-spinner" :class="{ 'is-visible': state === 'copying' }" cx="10" cy="10" r="6" stroke="currentColor" stroke-width="1.6" />
        <path class="copy-icon-part" :class="{ 'is-visible': state === 'copied' }" d="m5.5 10.2 2.8 2.8 6.2-6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <g class="copy-icon-part" :class="{ 'is-visible': state === 'error' }">
          <circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M10 6.5v4.2m0 2.7v.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
        </g>
      </svg>

      <span v-if="!iconOnly" class="copy-label-clip block overflow-hidden" :style="labelStyle">
        <span :key="state" ref="labelElement" class="copy-label-text block whitespace-nowrap">{{ currentLabel }}</span>
      </span>
    </button>

    <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusMessage }}</span>
  </span>
</template>

<style scoped>
.copy-button,
.copy-label-clip,
.copy-icon-part {
  transition-duration: var(--copy-duration);
}

.copy-label-clip {
  transition-property: width;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.copy-label-text {
  animation: copy-label-in var(--copy-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.copy-icon-part {
  opacity: 0;
  transform: scale(0.55) rotate(-18deg);
  transform-origin: center;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.copy-icon-part.is-visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.copy-icon-spinner {
  stroke-dasharray: 24 14;
}

.copy-icon-spinner.is-visible {
  animation: copy-spin 0.75s linear infinite;
}

@keyframes copy-label-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes copy-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .copy-button,
  .copy-label-clip,
  .copy-icon-part {
    transition-duration: 0.01ms;
  }

  .copy-label-text,
  .copy-icon-spinner.is-visible {
    animation: none;
  }
}
</style>
