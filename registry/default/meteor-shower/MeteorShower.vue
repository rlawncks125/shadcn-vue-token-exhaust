<script setup lang="ts">
import { computed, ref } from 'vue'

interface MeteorDescriptor {
  id: number
  style: Record<string, string>
}

const props = withDefaults(defineProps<{
  count?: number
  color?: string
  speed?: number
  angle?: number
  trailLength?: number
  paused?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  count: 24,
  color: '#d9f3ff',
  speed: 4.8,
  angle: 18,
  trailLength: 140,
  paused: false,
  disabled: false,
  ariaLabel: 'Meteor shower',
})

const emit = defineEmits<{
  replay: []
}>()

const generation = ref(0)

function clamp(value: number, min: number, max: number, fallback: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : fallback, min), max)
}

// Integer hashing keeps server and client output identical without stored random state.
function unit(index: number, salt: number) {
  let value = Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 11, 0x27d4eb2d)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value ^= value >>> 16
  return (value >>> 0) / 0xffffffff
}

const safeCount = computed(() => Math.round(clamp(props.count, 0, 100, 24)))
const safeSpeed = computed(() => clamp(props.speed, 0.5, 30, 4.8))
const safeAngle = computed(() => clamp(props.angle, -360, 360, 18))
const safeTrailLength = computed(() => clamp(props.trailLength, 24, 360, 140))
const safeColor = computed(() => props.color.trim() || '#d9f3ff')

const rootStyle = computed(() => ({
  '--meteor-color': safeColor.value,
  '--meteor-angle': `${safeAngle.value}deg`,
  '--meteor-trail': `${safeTrailLength.value}px`,
}))

const meteors = computed<MeteorDescriptor[]>(() => {
  if (props.disabled) return []

  return Array.from({ length: safeCount.value }, (_, index) => {
    const duration = safeSpeed.value * (0.72 + unit(index, 1) * 0.62)
    const trailScale = 0.68 + unit(index, 2) * 0.64

    return {
      id: index,
      style: {
        '--meteor-y': `${-8 + unit(index, 3) * 116}%`,
        '--meteor-x': `${-34 + unit(index, 4) * 22}%`,
        '--meteor-delay': `${-duration * unit(index, 5)}s`,
        '--meteor-duration': `${duration}s`,
        '--meteor-opacity': `${0.38 + unit(index, 6) * 0.58}`,
        '--meteor-size': `${0.8 + unit(index, 7) * 1.7}px`,
        '--meteor-trail-scale': `${trailScale}`,
      },
    }
  })
})

function replay() {
  generation.value += 1
  emit('replay')
}

defineExpose({ replay })
</script>

<template>
  <div
    class="meteor-shower relative isolate overflow-hidden"
    :class="{ 'is-paused': paused }"
    :style="rootStyle"
    role="group"
    :aria-label="ariaLabel"
    :data-paused="paused ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-generation="generation"
  >
    <div class="meteor-layer pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <span class="meteor-star-field absolute inset-0" />

      <span
        v-for="meteor in meteors"
        :key="`${generation}-${meteor.id}`"
        class="meteor-lane absolute"
        :style="meteor.style"
      >
        <span class="meteor-flight absolute inset-y-0 left-0 w-full">
          <span class="meteor absolute right-0 top-1/2 block" />
        </span>
      </span>
    </div>

    <div class="meteor-content relative z-10">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.meteor-star-field {
  opacity: 0.24;
  background-image:
    radial-gradient(circle at 9% 18%, var(--meteor-color) 0 0.8px, transparent 1.1px),
    radial-gradient(circle at 26% 72%, var(--meteor-color) 0 0.7px, transparent 1px),
    radial-gradient(circle at 48% 31%, var(--meteor-color) 0 0.9px, transparent 1.2px),
    radial-gradient(circle at 67% 82%, var(--meteor-color) 0 0.7px, transparent 1px),
    radial-gradient(circle at 84% 13%, var(--meteor-color) 0 0.8px, transparent 1.1px),
    radial-gradient(circle at 94% 57%, var(--meteor-color) 0 0.6px, transparent 0.9px);
  background-size: 173px 149px, 211px 181px, 257px 223px, 191px 167px, 229px 197px, 283px 239px;
}

.meteor-lane {
  left: var(--meteor-x);
  top: var(--meteor-y);
  width: 154%;
  height: 1px;
  transform: rotate(var(--meteor-angle));
  transform-origin: center;
}

.meteor-flight {
  opacity: 0;
  animation: meteor-cross var(--meteor-duration) linear var(--meteor-delay) infinite;
  will-change: transform, opacity;
}

.meteor {
  width: calc(var(--meteor-trail) * var(--meteor-trail-scale));
  height: var(--meteor-size);
  color: var(--meteor-color);
  border-radius: 999px;
  background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, currentColor 18%, transparent) 22%, currentColor 86%, white 100%);
  filter: drop-shadow(0 0 4px currentColor);
  transform: translateY(-50%);
}

.meteor::after {
  position: absolute;
  top: 50%;
  right: 0;
  width: calc(var(--meteor-size) * 2.4);
  height: calc(var(--meteor-size) * 2.4);
  border-radius: 999px;
  background: white;
  box-shadow: 0 0 7px 1px currentColor;
  content: '';
  transform: translate(35%, -50%);
}

.is-paused .meteor-flight {
  animation-play-state: paused;
}

@keyframes meteor-cross {
  0% {
    opacity: 0;
    transform: translate3d(-100%, 0, 0);
  }
  7% {
    opacity: var(--meteor-opacity);
  }
  84% {
    opacity: var(--meteor-opacity);
  }
  100% {
    opacity: 0;
    transform: translate3d(18%, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .meteor-star-field {
    opacity: 0.42;
  }

  .meteor-lane {
    display: none;
  }
}
</style>
