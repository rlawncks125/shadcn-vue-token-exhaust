<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  characters?: string
  trigger?: 'hover' | 'click' | 'load'
  duration?: number
  disabled?: boolean
}>(), {
  text: 'Build remarkable interfaces.',
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  trigger: 'hover',
  duration: 800,
  disabled: false,
})

const emit = defineEmits<{
  start: []
  complete: []
}>()

const displayText = ref(props.text)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let lastPointerType = ''
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(10000, Math.max(0, props.duration)) : 800)

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
  running.value = false
}

function scramble() {
  if (props.disabled) return false
  stop()

  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || safeDuration.value === 0) {
    displayText.value = props.text
    return false
  }

  const text = Array.from(props.text)
  const characters = Array.from(props.characters)
  if (!text.length || !characters.length) return false
  const frameLength = 32
  const totalFrames = Math.max(1, Math.round(safeDuration.value / frameLength))
  let frame = 0
  running.value = true
  emit('start')

  timer = setInterval(() => {
    frame += 1
    const revealed = Math.floor((frame / totalFrames) * text.length)

    displayText.value = text.map((character, index) => {
      if (!/[\p{L}\p{N}]/u.test(character) || index < revealed)
        return character

      return characters[Math.floor(Math.random() * characters.length)] ?? character
    }).join('')

    if (frame >= totalFrames) {
      stop()
      displayText.value = props.text
      emit('complete')
    }
  }, frameLength)
  return true
}

function handleHover() {
  if (props.trigger === 'hover')
    scramble()
}

function handleClick() {
  if (props.trigger === 'click' || (props.trigger === 'hover' && ['touch', 'pen'].includes(lastPointerType)))
    scramble()
}

function handleKeydown(event: KeyboardEvent) {
  if (props.trigger === 'load' || !['Enter', ' '].includes(event.key)) return
  event.preventDefault()
  scramble()
}

watch(() => [props.text, props.characters, props.disabled], () => {
  stop()
  displayText.value = props.text
})

onMounted(() => {
  if (props.trigger === 'load')
    scramble()
})

onBeforeUnmount(stop)

defineExpose({ scramble, stop })
</script>

<template>
  <span
    class="inline-block cursor-default font-mono"
    :class="{ 'cursor-pointer': trigger !== 'load' && !disabled, 'opacity-45': disabled }"
    :tabindex="trigger === 'load' || disabled ? undefined : 0"
    :role="trigger === 'load' ? undefined : 'button'"
    :aria-disabled="disabled || undefined"
    :aria-label="trigger === 'load' ? undefined : `${text}. Activate to replay animation.`"
    :data-running="running || undefined"
    data-testid="text-scramble"
    @mouseenter="handleHover"
    @focus="handleHover"
    @pointerdown="lastPointerType = $event.pointerType"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span aria-hidden="true">{{ displayText }}</span>
    <span class="sr-only">{{ text }}</span>
  </span>
</template>
