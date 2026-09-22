<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export type AnimatedMobileConnectivityState = 'online' | 'connecting' | 'offline'
const props = withDefaults(defineProps<{
  open?: boolean
  state?: AnimatedMobileConnectivityState
  onlineLabel?: string
  connectingLabel?: string
  offlineLabel?: string
  retryLabel?: string
  autoHide?: number
  duration?: number
  fixed?: boolean
  safeArea?: boolean
  dismissible?: boolean
  disabled?: boolean
}>(), {
  open: true, state: 'offline', onlineLabel: 'Back online', connectingLabel: 'Reconnecting…', offlineLabel: 'You are offline', retryLabel: 'Try again', autoHide: 2400, duration: 240, fixed: true, safeArea: true, dismissible: true, disabled: false,
})
const emit = defineEmits<{ 'update:open': [value: boolean], retry: [], dismiss: [], hidden: [] }>()
const retryButton = ref<HTMLButtonElement>()
let hideTimer: ReturnType<typeof setTimeout> | undefined
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 240)
const content = computed(() => ({ online: props.onlineLabel, connecting: props.connectingLabel, offline: props.offlineLabel })[props.state])
function clearHide() { if (hideTimer) clearTimeout(hideTimer); hideTimer = undefined }
function scheduleHide() {
  clearHide()
  if (props.open && props.state === 'online' && props.autoHide > 0) hideTimer = setTimeout(() => { emit('update:open', false); emit('hidden') }, props.autoHide)
}
function retry() { if (props.disabled || props.state !== 'offline') return false; emit('retry'); return true }
function dismiss() { if (props.disabled || !props.dismissible) return false; clearHide(); emit('update:open', false); emit('dismiss'); return true }
watch(() => [props.open, props.state, props.autoHide] as const, scheduleHide, { immediate: true })
onBeforeUnmount(clearHide)
defineExpose({ retry, dismiss, focus: () => retryButton.value?.focus() })
</script>

<template>
  <Transition name="connectivity">
    <div v-if="open" data-testid="animated-mobile-connectivity-bar" class="z-[95] flex justify-center" :class="fixed ? 'pointer-events-none fixed inset-x-0 top-0 px-3' : 'relative w-full'" :style="{ '--connectivity-duration': `${safeDuration}ms` }">
      <section role="status" aria-live="polite" class="pointer-events-auto flex min-h-14 w-full max-w-xl items-center gap-3 rounded-[20px] border px-3 shadow-[0_18px_55px_-30px_rgba(0,0,0,.7)] backdrop-blur-xl" :class="[safeArea && fixed ? 'mt-[max(.75rem,env(safe-area-inset-top))]' : '', state === 'online' ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950' : state === 'connecting' ? 'border-amber-200 bg-amber-50/95 text-amber-950' : 'border-black/10 bg-[#1b1d19]/96 text-white']">
        <span class="grid size-9 shrink-0 place-items-center rounded-[13px]" :class="state === 'online' ? 'bg-emerald-500 text-white' : state === 'connecting' ? 'bg-amber-400 text-black' : 'bg-white/10 text-[#d9ff57]'" aria-hidden="true"><span v-if="state === 'connecting'" class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" /> <span v-else>{{ state === 'online' ? '✓' : '!' }}</span></span>
        <div class="min-w-0 flex-1"><strong class="block truncate text-xs">{{ content }}</strong><span class="mt-0.5 block truncate text-[10px] opacity-50">{{ state === 'offline' ? 'Changes will sync when connection returns.' : state === 'connecting' ? 'Keeping your work on this device.' : 'All changes are synced.' }}</span></div>
        <button v-if="state === 'offline'" ref="retryButton" type="button" data-testid="connectivity-retry" class="min-h-11 rounded-[14px] bg-[#d9ff57] px-4 text-xs font-bold text-black outline-none active:not-disabled:scale-[.97] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-35" :disabled="disabled" @click="retry">{{ retryLabel }}</button>
        <button v-if="dismissible" type="button" data-testid="connectivity-dismiss" class="grid size-11 shrink-0 place-items-center rounded-[14px] text-lg opacity-45 outline-none hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-current disabled:opacity-25" :disabled="disabled" aria-label="Dismiss connectivity status" @click="dismiss">×</button>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.connectivity-enter-active,.connectivity-leave-active { transition: opacity var(--connectivity-duration) ease, transform var(--connectivity-duration) cubic-bezier(.2,.8,.2,1); }
.connectivity-enter-from,.connectivity-leave-to { opacity: 0; transform: translateY(-14px) scale(.98); }
@media (prefers-reduced-motion: reduce) { .connectivity-enter-active,.connectivity-leave-active { transition: none !important; } }
</style>
