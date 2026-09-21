<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  words: string[]
  typeDuration?: number
  deleteDuration?: number
  pauseDuration?: number
  startDelay?: number
  loop?: boolean
  paused?: boolean
  cursor?: string
}>(), {
  typeDuration: 85,
  deleteDuration: 45,
  pauseDuration: 1200,
  startDelay: 250,
  loop: true,
  paused: false,
  cursor: '|',
})

const emit = defineEmits<{ wordChange: [index: number, word: string]; complete: [] }>()
const wordIndex = ref(0)
const characterIndex = ref(0)
const deleting = ref(false)
const reducedMotion = ref(false)
const cursorElement = ref<HTMLElement | null>(null)
const graphemes = computed(() => split(props.words[wordIndex.value] ?? ''))
const visibleText = computed(() => reducedMotion.value ? (props.words[wordIndex.value] ?? '') : graphemes.value.slice(0, characterIndex.value).join(''))

let timer: ReturnType<typeof setTimeout> | undefined
let cursorAnimation: Animation | undefined
let motionQuery: MediaQueryList | undefined

function split(value: string) {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].map(item => item.segment)
  return Array.from(value)
}

function schedule(delay: number) {
  clearTimeout(timer)
  if (!props.paused && !reducedMotion.value) timer = setTimeout(step, delay)
}

function step() {
  if (!props.words.length) return
  if (!deleting.value && characterIndex.value < graphemes.value.length) {
    characterIndex.value++
    schedule(props.typeDuration)
    return
  }
  if (!deleting.value) {
    if (!props.loop && wordIndex.value === props.words.length - 1) {
      emit('complete')
      return
    }
    deleting.value = true
    schedule(props.pauseDuration)
    return
  }
  if (characterIndex.value > 0) {
    characterIndex.value--
    schedule(props.deleteDuration)
    return
  }
  deleting.value = false
  wordIndex.value = (wordIndex.value + 1) % props.words.length
  emit('wordChange', wordIndex.value, props.words[wordIndex.value] ?? '')
  schedule(props.typeDuration)
}

function restart() {
  clearTimeout(timer)
  wordIndex.value = 0
  characterIndex.value = reducedMotion.value ? split(props.words[0] ?? '').length : 0
  deleting.value = false
  schedule(props.startDelay)
}

function createCursorAnimation() {
  cursorAnimation?.cancel()
  cursorAnimation = undefined
  if (!cursorElement.value || reducedMotion.value) return
  cursorAnimation = cursorElement.value.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 900, iterations: Infinity, easing: 'steps(1)' })
  if (props.paused) cursorAnimation.pause()
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  clearTimeout(timer)
  if (!event.matches) restart()
  createCursorAnimation()
}

watch(() => props.paused, value => {
  if (value) { clearTimeout(timer); cursorAnimation?.pause() }
  else { schedule(props.typeDuration); cursorAnimation?.play() }
})
watch(() => props.words, restart, { deep: true })

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
  createCursorAnimation()
  restart()
})
onBeforeUnmount(() => { clearTimeout(timer); cursorAnimation?.cancel(); motionQuery?.removeEventListener('change', handleMotionChange) })
defineExpose({ restart })
</script>

<template>
  <span class="typewriter-text inline-flex items-baseline" :aria-label="words[wordIndex] ?? ''">
    <span aria-hidden="true">{{ visibleText }}</span><span ref="cursorElement" class="typewriter-text-cursor ml-[0.06em] inline-block text-current" aria-hidden="true">{{ cursor }}</span>
  </span>
</template>
