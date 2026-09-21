<script setup lang="ts">
import { ref } from 'vue'
import StackedCarousel, { type StackedCarouselItem } from '../../../registry/default/stacked-carousel/StackedCarousel.vue'

const props = withDefaults(defineProps<{
  autoplayDelay?: number
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  disabled?: boolean
}>(), {
  autoplayDelay: 3600,
  loop: true,
  paused: false,
  pauseOnHover: true,
  disabled: false,
})

const items: StackedCarouselItem[] = [
  { id: 'prototype', eyebrow: 'Discover', title: 'Prototype the impossible.', description: 'Test the shape of an idea before the details slow it down.' },
  { id: 'compose', eyebrow: 'Compose', title: 'Build with strong primitives.', description: 'Combine focused pieces into interfaces that remain easy to change.' },
  { id: 'refine', eyebrow: 'Refine', title: 'Make every motion deliberate.', description: 'Use timing and depth to clarify state instead of adding noise.' },
  { id: 'ship', eyebrow: 'Deliver', title: 'Ship the complete experience.', description: 'Keep behavior, accessibility and visual polish in the same system.' },
]

const selected = ref(0)
const message = ref('Automatic playback is ready.')

function handleChange(item: StackedCarouselItem, index: number, source: string) {
  message.value = `${item.title} selected via ${source}. Slide ${index + 1}.`
}
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,hsl(var(--muted)/0.35),transparent)] p-6 sm:min-h-[560px] sm:p-10">
    <StackedCarousel
      v-model="selected"
      :items="items"
      :autoplay-delay="autoplayDelay"
      :loop="loop"
      :paused="paused"
      :pause-on-hover="pauseOnHover"
      :disabled="disabled"
      aria-label="Product principles"
      @change="handleChange"
    />
    <p data-testid="carousel-status" class="mt-5 min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">
      {{ message }}
    </p>
  </div>
</template>
