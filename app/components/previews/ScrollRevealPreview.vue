<script setup lang="ts">
import { ref } from 'vue'
import ScrollReveal, { type ScrollRevealVariant } from '../../../registry/default/scroll-reveal/ScrollReveal.vue'

const props = withDefaults(defineProps<{
  variant?: ScrollRevealVariant
  duration?: number
  distance?: number
  once?: boolean
  disabled?: boolean
}>(), {
  variant: 'fade-up',
  duration: 650,
  distance: 28,
  once: true,
  disabled: false,
})

const cards = [
  { number: '01', title: 'Observe', copy: 'Wait until the content enters its intended context.' },
  { number: '02', title: 'Reveal', copy: 'Use distance and timing to communicate visual hierarchy.' },
  { number: '03', title: 'Settle', copy: 'Finish in the natural document position without layout shift.' },
]

const instances = ref<Array<{ replay: () => void } | null>>([])
const completed = ref(0)

function setInstance(index: number, instance: unknown) {
  instances.value[index] = instance as { replay: () => void } | null
}

function replayAll() {
  completed.value = 0
  instances.value.forEach(instance => instance?.replay())
}
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col justify-center overflow-hidden rounded-2xl border border-border bg-card/35 p-6 sm:min-h-[560px] sm:p-10">
    <div class="mx-auto w-full max-w-3xl">
      <div class="mb-7 flex items-end justify-between gap-5">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Motion sequence</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">Reveal with intent.</h3>
        </div>
        <button type="button" class="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15" @click="replayAll">
          Replay
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <ScrollReveal
          v-for="(card, index) in cards"
          :key="card.number"
          :ref="instance => setInstance(index, instance)"
          :variant="variant"
          :duration="duration"
          :delay="index * 110"
          :distance="distance"
          :once="once"
          :disabled="disabled"
          class="rounded-2xl border border-border bg-card p-5 shadow-sm"
          @reveal="completed++"
        >
          <span class="font-mono text-[10px] text-muted-foreground">{{ card.number }}</span>
          <h4 class="mt-10 text-lg font-semibold tracking-[-0.025em] text-foreground">{{ card.title }}</h4>
          <p class="mt-2 text-xs leading-5 text-muted-foreground">{{ card.copy }}</p>
        </ScrollReveal>
      </div>

      <p data-testid="reveal-status" class="mt-5 min-h-5 text-xs text-muted-foreground" aria-live="polite">
        {{ completed >= cards.length ? 'All reveals completed.' : `${Math.min(completed, cards.length)} of ${cards.length} reveals completed.` }}
      </p>
    </div>
  </div>
</template>
