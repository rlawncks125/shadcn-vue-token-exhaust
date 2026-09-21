<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  indeterminate?: boolean
  disabled?: boolean
  label?: string
  name?: string
  value?: string
  duration?: number
}>(), {
  defaultValue: false,
  indeterminate: false,
  disabled: false,
  label: 'Toggle option',
  name: undefined,
  value: 'on',
  duration: 420,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const input = ref<HTMLInputElement | null>(null)
const box = ref<HTMLElement | null>(null)
const checkPath = ref<SVGPathElement | null>(null)
const mixedPath = ref<SVGPathElement | null>(null)
const internalValue = ref(props.defaultValue)
const mounted = ref(false)
const reducedMotion = ref(false)
const checked = computed(() => props.modelValue ?? internalValue.value)

let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function clearAnimations() {
  animations.forEach(animation => animation.cancel())
  animations = []
}

function syncNativeState() {
  if (input.value) input.value.indeterminate = props.indeterminate
}

function animateState() {
  clearAnimations()
  if (!mounted.value || reducedMotion.value || !box.value) return

  const duration = Math.max(props.duration, 180)
  animations.push(box.value.animate([
    { transform: 'scale(1) rotate(0deg)' },
    { transform: 'scale(0.78) rotate(-5deg)', offset: 0.32 },
    { transform: 'scale(1.08) rotate(2deg)', offset: 0.7 },
    { transform: 'scale(1) rotate(0deg)' },
  ], { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))

  const path = props.indeterminate ? mixedPath.value : checkPath.value
  const length = props.indeterminate ? 14 : 24
  if (path && (props.indeterminate || checked.value)) {
    animations.push(path.animate([
      { strokeDashoffset: length, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1 },
    ], { duration: duration * 0.72, delay: duration * 0.16, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }))
  } else if (checkPath.value) {
    animations.push(checkPath.value.animate([
      { strokeDashoffset: 0, opacity: 1 },
      { strokeDashoffset: 24, opacity: 0 },
    ], { duration: duration * 0.45, easing: 'ease-in', fill: 'both' }))
  }
}

async function update(value: boolean) {
  if (props.disabled) return
  internalValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
  await nextTick()
  syncNativeState()
}

function handleChange(event: Event) {
  update((event.target as HTMLInputElement).checked)
}

function focus() {
  input.value?.focus()
}

function toggle() {
  if (!props.disabled) update(!checked.value)
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) clearAnimations()
}

watch(() => [checked.value, props.indeterminate], async () => {
  await nextTick()
  syncNativeState()
  animateState()
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  syncNativeState()
  mounted.value = true
})

onBeforeUnmount(() => {
  clearAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ focus, toggle })
</script>

<template>
  <label class="spring-checkbox group inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45">
    <span class="relative grid size-6 shrink-0 place-items-center">
      <input
        ref="input"
        type="checkbox"
        class="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        :checked="checked"
        :disabled="disabled"
        :name="name"
        :value="value"
        :aria-label="label"
        @change="handleChange"
      >
      <span
        ref="box"
        class="spring-checkbox-box grid size-6 place-items-center rounded-[7px] border-2 border-foreground/25 bg-background text-background transition-colors duration-200 motion-reduce:transition-none peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20"
        :class="{ '!border-foreground !bg-foreground': indeterminate }"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="size-4 overflow-visible fill-none" aria-hidden="true">
          <path
            v-show="!indeterminate"
            ref="checkPath"
            d="M5 12.5 9.2 17 19 7"
            pathLength="24"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            :style="{ strokeDasharray: 24, strokeDashoffset: checked ? 0 : 24, opacity: checked ? 1 : 0 }"
          />
          <path
            v-show="indeterminate"
            ref="mixedPath"
            d="M5 12h14"
            pathLength="14"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round"
            :style="{ strokeDasharray: 14, strokeDashoffset: indeterminate ? 0 : 14 }"
          />
        </svg>
      </span>
    </span>
    <span><slot>{{ label }}</slot></span>
  </label>
</template>
