<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  label?: string
  strength?: number
  accent?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  label: 'Get in touch',
  strength: 24,
  accent: 'var(--registry-accent, #d9ff57)',
  disabled: false,
  type: 'button',
})

const x = ref(0)
const y = ref(0)

function reset() {
  x.value = 0
  y.value = 0
}

function move(event: PointerEvent) {
  if (props.disabled || event.pointerType !== 'mouse'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reset()
    return
  }
  // Measure the stationary wrapper, not the translated button.
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const distance = Number.isFinite(props.strength) ? Math.max(0, Math.min(48, props.strength)) : 0
  x.value = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2))) * distance
  y.value = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2))) * distance
}

watch(() => [props.disabled, props.strength], reset)
</script>

<template>
  <span class="magnetic-zone inline-flex p-8" @pointermove="move" @pointerleave="reset" @pointercancel="reset">
    <button
      v-bind="$attrs"
      class="magnetic-button inline-flex min-h-14 cursor-pointer items-center justify-center gap-6 rounded-full border border-[#34362f] bg-[#171814] py-2.5 pr-3 pl-6 [font:inherit] text-sm font-semibold text-white shadow-[0_12px_28px_-16px_#17181480] [transform:translate(var(--magnetic-x),var(--magnetic-y))] [transition:transform_450ms_cubic-bezier(.16,1,.3,1),box-shadow_200ms] focus-visible:outline-2 focus-visible:outline-offset-5 focus-visible:outline-[#171814] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none"
      :type="type"
      :disabled="disabled"
      :style="{ '--magnetic-x': `${x}px`, '--magnetic-y': `${y}px`, '--magnetic-accent': accent }"
      @blur="reset"
    >
      <span><slot>{{ label }}</slot></span>
      <span class="magnetic-arrow grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--magnetic-accent)] text-xl text-[#171814]" aria-hidden="true">↗</span>
    </button>
  </span>
</template>
