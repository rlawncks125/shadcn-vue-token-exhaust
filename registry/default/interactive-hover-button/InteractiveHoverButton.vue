<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  accent?: string
  duration?: number
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>(), {
  label: 'Explore components',
  accent: 'var(--registry-accent, #d9ff57)',
  duration: 300,
  type: 'button',
  disabled: false,
  loading: false,
})
const pressed = ref(false)
const keyboardFocused = ref(false)
let releaseTimer: ReturnType<typeof setTimeout> | undefined
const active = computed(() => pressed.value || keyboardFocused.value)
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 300)

function onPointerDown() {
  if (!props.disabled && !props.loading) pressed.value = true
}
function release(event?: PointerEvent) {
  if (releaseTimer) clearTimeout(releaseTimer)
  if (event?.pointerType === 'touch') releaseTimer = setTimeout(() => { pressed.value = false }, 160)
  else pressed.value = false
}
function onFocus(event: FocusEvent) {
  const element = event.currentTarget as HTMLElement
  requestAnimationFrame(() => { keyboardFocused.value = element.matches(':focus-visible') })
}
onBeforeUnmount(() => releaseTimer && clearTimeout(releaseTimer))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    data-testid="interactive-hover-button"
    :data-active="active || undefined"
    class="group relative inline-flex h-12 items-center overflow-hidden rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.75)] transition-transform hover:not-disabled:-translate-y-0.5 active:not-disabled:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
    :style="{ '--hover-accent': accent, '--hover-duration': `${safeDuration}ms` }"
    @pointerdown="onPointerDown"
    @pointerup="release"
    @pointercancel="release"
    @pointerleave="release"
    @focus="onFocus"
    @blur="keyboardFocused = false"
  >
    <span class="hover-fill absolute inset-0 translate-y-[102%] bg-[var(--hover-accent)] transition-transform ease-out group-hover:translate-y-0 motion-reduce:transition-none" :class="active ? 'translate-y-0' : ''" />
    <span class="hover-content relative flex items-center gap-3 transition-colors group-hover:text-neutral-950 motion-reduce:transition-none" :class="active ? 'text-neutral-950' : ''">
      <span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" aria-hidden="true" />
      {{ loading ? 'Loading' : label }}
      <span class="hover-arrow grid size-6 place-items-center rounded-full bg-white/12 transition-all group-hover:translate-x-1 group-hover:bg-neutral-950 group-hover:text-white motion-reduce:transition-none" :class="active ? 'translate-x-1 bg-neutral-950 text-white' : ''">
        <svg viewBox="0 0 20 20" fill="none" class="size-3.5" aria-hidden="true">
          <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </span>
  </button>
</template>

<style scoped>
.hover-fill, .hover-content, .hover-arrow { transition-duration: var(--hover-duration); }
</style>
