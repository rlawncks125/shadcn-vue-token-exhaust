<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  rotation: number
  color: string
}

const props = withDefaults(defineProps<{
  label?: string
  particleCount?: number
  distance?: number
  duration?: number
  colors?: string[]
  disabled?: boolean
  allowOverlap?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  label: 'Celebrate',
  particleCount: 14,
  distance: 72,
  duration: 680,
  colors: () => ['var(--registry-accent, #d9ff57)', '#8b5cf6', '#38bdf8', '#fb7185'],
  disabled: false,
  allowOverlap: false,
  type: 'button',
})

const emit = defineEmits<{
  burst: []
  complete: []
}>()

const button = ref<HTMLButtonElement | null>(null)
const particleElements = new Map<number, HTMLElement>()
const particles = ref<Particle[]>([])
const bursting = ref(false)
const reducedMotion = ref(false)

let sequence = 0
let animations: Animation[] = []
let motionQuery: MediaQueryList | undefined

function setParticle(id: number, element: unknown) {
  if (element instanceof HTMLElement) particleElements.set(id, element)
  else particleElements.delete(id)
}

function clearAnimations() {
  animations.forEach(animation => animation.cancel())
  animations = []
}

async function burst() {
  if (props.disabled || (bursting.value && !props.allowOverlap)) return
  emit('burst')

  if (reducedMotion.value) {
    emit('complete')
    return
  }

  sequence++
  if (!props.allowOverlap) clearAnimations()
  const count = Math.min(Math.max(Math.round(props.particleCount), 4), 36)
  const baseId = sequence * 100
  const nextParticles = Array.from({ length: count }, (_, index) => {
    const angle = index * 137.508 * Math.PI / 180
    const spread = props.distance * (0.72 + (index % 4) * 0.1)
    return {
      id: baseId + index,
      x: Math.cos(angle) * spread,
      y: Math.sin(angle) * spread,
      size: 5 + index % 4,
      rotation: 90 + index * 47,
      color: props.colors[index % Math.max(props.colors.length, 1)] ?? 'var(--registry-accent, #d9ff57)',
    }
  })
  particles.value = props.allowOverlap ? [...particles.value, ...nextParticles] : nextParticles
  bursting.value = true

  await nextTick()

  const runAnimations: Animation[] = []
  if (button.value) {
    runAnimations.push(button.value.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.94)', offset: 0.25 },
      { transform: 'scale(1.04)', offset: 0.62 },
      { transform: 'scale(1)' },
    ], { duration: Math.min(Math.max(props.duration, 250), 900), easing: 'ease-out' }))
  }

  const particleAnimations = nextParticles.flatMap((particle, index) => {
    const element = particleElements.get(particle.id)
    if (!element) return []
    return [element.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.18 },
      { opacity: 0, transform: `translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px)) scale(0.55) rotate(${particle.rotation}deg)` },
    ], {
      duration: Math.max(props.duration, 300),
      delay: index * 9,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    })]
  })
  runAnimations.push(...particleAnimations)
  animations.push(...runAnimations)

  await Promise.allSettled(particleAnimations.map(animation => animation.finished))
  const ownIds = new Set(nextParticles.map(particle => particle.id))
  particles.value = particles.value.filter(particle => !ownIds.has(particle.id))
  runAnimations.forEach(animation => animation.cancel())
  animations = animations.filter(animation => !runAnimations.includes(animation))
  bursting.value = particles.value.length > 0
  emit('complete')
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  if (event.matches) {
    clearAnimations()
    particles.value = []
    bursting.value = false
  }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  clearAnimations()
  motionQuery?.removeEventListener('change', handleMotionChange)
})

defineExpose({ burst })
</script>

<template>
  <span class="burst-button-wrap relative inline-grid place-items-center">
    <button
      ref="button"
      :type="type"
      class="burst-button relative z-10 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background outline-none transition-colors hover:bg-foreground/85 focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-45"
      :disabled="disabled"
      :aria-label="label"
      :data-bursting="bursting ? '' : undefined"
      @click="burst"
    >
      <slot>{{ label }}</slot>
    </button>

    <span class="pointer-events-none absolute left-1/2 top-1/2 z-20" aria-hidden="true">
      <span
        v-for="particle in particles"
        :key="particle.id"
        :ref="element => setParticle(particle.id, element)"
        class="burst-particle absolute left-0 top-0 block rounded-[35%] shadow-[0_0_8px_currentColor]"
        :style="{ width: `${particle.size}px`, height: `${particle.size}px`, color: particle.color, backgroundColor: particle.color }"
      />
    </span>
  </span>
</template>
