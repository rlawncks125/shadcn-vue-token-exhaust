<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const props = withDefaults(defineProps<{
  open?: boolean
  title: string
  description?: string
  primaryLabel?: string
  secondaryLabel?: string
  duration?: number
  fixed?: boolean
  safeArea?: boolean
  showClose?: boolean
  loading?: boolean
  disabled?: boolean
}>(), {
  open: true,
  description: '',
  primaryLabel: 'Continue',
  secondaryLabel: '',
  duration: 260,
  fixed: true,
  safeArea: true,
  showClose: false,
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  primary: []
  secondary: []
  close: []
}>()
const primary = ref<HTMLButtonElement>()
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 260)

function close() {
  if (props.disabled || props.loading) return false
  emit('update:open', false); emit('close'); return true
}
function activatePrimary() {
  if (props.disabled || props.loading) return false
  emit('primary'); return true
}
function activateSecondary() {
  if (props.disabled || props.loading || !props.secondaryLabel) return false
  emit('secondary'); return true
}
defineExpose({ close, focus: () => nextTick(() => primary.value?.focus()), activatePrimary, activateSecondary })
</script>

<template>
  <Transition name="mobile-action-bar">
    <div v-if="open" data-testid="animated-mobile-action-bar" class="z-[90] flex justify-center" :class="fixed ? 'pointer-events-none fixed inset-x-0 bottom-0 px-3' : 'relative w-full'" :style="{ '--action-bar-duration': `${safeDuration}ms` }">
      <section role="region" aria-label="Page actions" class="pointer-events-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-[#1b1d19]/96 p-3 text-white shadow-[0_24px_70px_-24px_rgba(0,0,0,.8)] backdrop-blur-xl" :class="safeArea && fixed ? 'mb-[max(.75rem,env(safe-area-inset-bottom))]' : ''">
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1 pl-1"><strong class="block truncate text-sm font-semibold">{{ title }}</strong><span v-if="description" class="mt-1 block truncate text-[10px] text-white/42">{{ description }}</span></div>
          <button v-if="secondaryLabel" type="button" data-testid="action-bar-secondary" class="min-h-11 rounded-[16px] px-3 text-xs font-semibold text-white/58 outline-none hover:not-disabled:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :disabled="disabled || loading" @click="activateSecondary">{{ secondaryLabel }}</button>
          <button ref="primary" type="button" data-testid="action-bar-primary" class="min-h-11 rounded-[16px] bg-[#d9ff57] px-5 text-xs font-bold text-[#1b1d19] outline-none transition-transform active:not-disabled:scale-[.97] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || loading" :aria-busy="loading || undefined" @click="activatePrimary"><span v-if="loading" class="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-black/25 border-t-black align-[-2px] motion-reduce:animate-none" aria-hidden="true" />{{ loading ? 'Working…' : primaryLabel }}</button>
          <button v-if="showClose" type="button" data-testid="action-bar-close" class="grid size-11 shrink-0 place-items-center rounded-[16px] text-xl text-white/40 outline-none hover:not-disabled:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:opacity-35" :disabled="disabled || loading" aria-label="Close action bar" @click="close">×</button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-action-bar-enter-active,.mobile-action-bar-leave-active { transition: opacity var(--action-bar-duration) ease, transform var(--action-bar-duration) cubic-bezier(.2,.8,.2,1); }
.mobile-action-bar-enter-from,.mobile-action-bar-leave-to { opacity: 0; transform: translateY(18px) scale(.98); }
@media (prefers-reduced-motion: reduce) { .mobile-action-bar-enter-active,.mobile-action-bar-leave-active { transition: none !important; } }
</style>
