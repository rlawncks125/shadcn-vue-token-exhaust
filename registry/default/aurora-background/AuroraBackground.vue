<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  colors?: [string, string, string]
  duration?: number
  intensity?: number
  paused?: boolean
}>(), {
  colors: () => ['#34d399', '#818cf8', '#e879f9'],
  duration: 16,
  intensity: 0.6,
  paused: false,
})
const variables = computed(() => ({
  '--aurora-a': props.colors[0],
  '--aurora-b': props.colors[1],
  '--aurora-c': props.colors[2],
  '--aurora-intensity': Number.isFinite(props.intensity) ? Math.max(0, Math.min(1, props.intensity)) : 0.6,
}))

const lights = ref<HTMLElement[]>([])
let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function setLight(element: unknown, index: number) {
  if (element instanceof HTMLElement) lights.value[index] = element
}

function stopAnimations() {
  for (const animation of animations) animation.cancel()
  animations = []
}

function syncAnimations() {
  stopAnimations()
  if (motionQuery?.matches) return

  const duration = (Number.isFinite(props.duration) ? Math.max(4, Math.min(60, props.duration)) : 16) * 1000
  animations = lights.value.map((light, index) => {
    const animation = light.animate([
      { transform: 'translate3d(-8%, -5%, 0) rotate(-12deg) scale(.95)' },
      { transform: 'translate3d(15%, 25%, 0) rotate(18deg) scale(1.15)' },
    ], {
      duration,
      delay: -[0, 5000, 9000][index]!,
      direction: 'alternate',
      easing: 'ease-in-out',
      iterations: Infinity,
    })
    if (props.paused) animation.pause()
    return animation
  })
}

watch(() => [props.duration, props.paused], syncAnimations)
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', syncAnimations)
  syncAnimations()
})
onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', syncAnimations)
  stopAnimations()
})
</script>

<template>
  <div class="aurora-background relative isolate overflow-hidden bg-[#090d18] text-white" :style="variables">
    <div class="aurora-lights pointer-events-none absolute inset-0 -z-10 opacity-[var(--aurora-intensity)]" aria-hidden="true">
      <span :ref="element => setLight(element, 0)" class="absolute top-[-60%] left-[-25%] h-[140%] w-[85%] rounded-[45%] bg-[radial-gradient(ellipse,var(--aurora-a),transparent_68%)] blur-[42px]" />
      <span :ref="element => setLight(element, 1)" class="absolute top-[-35%] left-[10%] h-[140%] w-[85%] rounded-[45%] bg-[radial-gradient(ellipse,var(--aurora-b),transparent_68%)] blur-[42px]" />
      <span :ref="element => setLight(element, 2)" class="absolute top-[-45%] right-[-35%] h-[140%] w-[85%] rounded-[45%] bg-[radial-gradient(ellipse,var(--aurora-c),transparent_68%)] blur-[42px]" />
    </div>
    <div class="aurora-content relative"><slot /></div>
  </div>
</template>
