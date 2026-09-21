<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

export type LoadingMorphState = 'idle' | 'loading' | 'success' | 'error'

const props = withDefaults(defineProps<{
  idleLabel?: string
  loadingLabel?: string
  successLabel?: string
  errorLabel?: string
  resetAfter?: number
  disabled?: boolean
}>(), {
  idleLabel: 'Continue',
  loadingLabel: 'Working',
  successLabel: 'Complete',
  errorLabel: 'Try again',
  resetAfter: 0,
  disabled: false,
})
const state = defineModel<LoadingMorphState>({ default: 'idle' })
const emit = defineEmits<{ press: [state: LoadingMorphState] }>()
let resetTimer: ReturnType<typeof setTimeout> | undefined

const labels: Record<LoadingMorphState, () => string> = {
  idle: () => props.idleLabel,
  loading: () => props.loadingLabel,
  success: () => props.successLabel,
  error: () => props.errorLabel,
}

function clearReset() {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = undefined
}
function press() {
  if (!props.disabled && state.value !== 'loading') emit('press', state.value)
}

watch([state, () => props.resetAfter], ([value]) => {
  clearReset()
  if ((value === 'success' || value === 'error') && props.resetAfter > 0) {
    resetTimer = setTimeout(() => { state.value = 'idle' }, Math.max(500, props.resetAfter))
  }
})
onBeforeUnmount(clearReset)
</script>

<template>
  <button
    type="button"
    class="loading-morph relative inline-grid h-12 min-w-[150px] cursor-pointer place-items-center overflow-hidden rounded-full border-0 bg-[#171814] px-5 text-[13px] font-[650] tracking-[-.01em] text-white shadow-[0_12px_28px_-18px_#000b] transition-[background-color,color,transform,box-shadow] duration-300 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_18px_34px_-18px_#000c] active:not-disabled:translate-y-0 active:not-disabled:scale-[.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--registry-accent,#d9ff57)] disabled:cursor-wait motion-reduce:transition-none"
    :class="{
      'state-loading bg-[#292a25]': state === 'loading',
      'state-success bg-[#b8e332] text-[#172000]': state === 'success',
      'state-error bg-[#f05b4f] text-[#2b0805]': state === 'error',
    }"
    :disabled="disabled || state === 'loading'" :aria-busy="state === 'loading'" :aria-label="labels[state]()" @click="press"
  >
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      leave-active-class="transition-[opacity,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      enter-from-class="translate-y-[7px] scale-[.96] opacity-0"
      leave-to-class="-translate-y-[7px] scale-[.96] opacity-0"
    >
      <span :key="state" class="morph-content flex items-center justify-center gap-[9px]">
        <span class="morph-icon grid size-[18px] place-items-center [&_svg]:size-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]" aria-hidden="true">
          <svg v-if="state === 'idle'" viewBox="0 0 20 20"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
          <svg v-else-if="state === 'loading'" class="spinner animate-spin motion-reduce:animate-none [&_circle]:[stroke-dasharray:28_16]" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /></svg>
          <svg v-else-if="state === 'success'" viewBox="0 0 20 20"><path d="m4 10 4 4 8-9" /></svg>
          <svg v-else viewBox="0 0 20 20"><path d="m6 6 8 8m0-8-8 8" /></svg>
        </span>
        <span role="status" aria-live="polite">{{ labels[state]() }}</span>
      </span>
    </Transition>
    <span v-if="state === 'loading'" class="morph-progress absolute right-0 bottom-0 left-0 h-0.5 origin-left animate-pulse bg-[var(--registry-accent,#d9ff57)] motion-reduce:animate-none" aria-hidden="true" />
  </button>
</template>
