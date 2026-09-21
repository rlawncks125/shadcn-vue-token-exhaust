<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  onLabel?: string
  offLabel?: string
  color?: string
  duration?: number
  disabled?: boolean
  name?: string
}>(), {
  modelValue: false,
  label: 'Animated setting',
  onLabel: 'On',
  offLabel: 'Off',
  color: 'var(--registry-accent, #d9ff57)',
  duration: 420,
  disabled: false,
  name: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'change': [value: boolean]
}>()

const checked = computed(() => Boolean(props.modelValue))
const safeDuration = computed(() => Math.min(Math.max(props.duration, 0), 2000))

function update(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <label
    class="liquid-toggle inline-flex select-none items-center gap-3"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    :data-state="checked ? 'checked' : 'unchecked'"
  >
    <span v-if="label" class="text-sm font-medium"><slot name="label">{{ label }}</slot></span>
    <input
      :checked="checked"
      :disabled="disabled"
      :name="name"
      type="checkbox"
      role="switch"
      class="peer sr-only"
      @change="update"
    >
    <span
      class="relative h-9 w-16 shrink-0 overflow-hidden rounded-full border border-foreground/15 bg-foreground/10 shadow-inner outline-none ring-offset-2 ring-offset-background transition-shadow peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 motion-reduce:transition-none"
      :style="{ '--liquid-color': color, '--liquid-duration': `${safeDuration}ms` }"
      aria-hidden="true"
    >
      <span
        class="liquid-toggle__fill absolute inset-0 bg-[var(--liquid-color)] opacity-0 transition-opacity motion-reduce:transition-none"
        :class="checked ? 'opacity-100' : 'opacity-0'"
      />
      <span
        class="liquid-toggle__blob absolute left-1 top-1/2 size-7 -translate-y-1/2 rounded-full bg-[var(--liquid-color)] opacity-70 blur-[1px] motion-reduce:hidden"
        :class="checked ? 'translate-x-7 scale-150 opacity-0' : 'translate-x-0 scale-100'"
      />
      <span
        class="liquid-toggle__knob absolute left-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white text-[9px] font-bold uppercase tracking-tight text-neutral-900 shadow-[0_3px_12px_rgba(0,0,0,0.24)] motion-reduce:transition-none"
        :class="checked ? 'translate-x-7' : 'translate-x-0'"
      >
        {{ checked ? onLabel : offLabel }}
      </span>
    </span>
  </label>
</template>

<style scoped>
.liquid-toggle__fill,
.liquid-toggle__blob,
.liquid-toggle__knob {
  transition-duration: var(--liquid-duration);
  transition-timing-function: cubic-bezier(0.22, 1.35, 0.36, 1);
}
</style>
