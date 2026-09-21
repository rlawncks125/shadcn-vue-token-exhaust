<script setup lang="ts">
import { computed, ref } from 'vue'
import TextLoop from '../../../registry/default/text-loop/TextLoop.vue'

const props = withDefaults(defineProps<{
  interval?: number
  duration?: number
  stagger?: number
  direction?: 'up' | 'down'
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
}>(), {
  interval: 2400,
  duration: 480,
  stagger: 32,
  direction: 'up',
  loop: true,
  paused: false,
  pauseOnHover: true,
})

const items = ['clear.', 'human.', 'focused.', 'alive.']
const selected = ref(0)
const locallyPaused = ref(false)
const loopRef = ref<{ next: () => void, previous: () => void } | null>(null)
const message = ref('Automatic word rotation is active.')
const effectivePaused = computed(() => props.paused || locallyPaused.value)

function handleChange(value: string, index: number, source: string) {
  message.value = `${value} selected via ${source}. Word ${index + 1}.`
}
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-brand p-6 sm:min-h-[560px] sm:p-10">
    <div class="w-full max-w-3xl">
      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">Interface principle</p>
      <p class="mt-5 text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-black">
        Make it feel<br>
        <TextLoop
          ref="loopRef"
          v-model="selected"
          :items="items"
          :interval="interval"
          :duration="duration"
          :stagger="stagger"
          :direction="direction"
          :loop="loop"
          :paused="effectivePaused"
          :pause-on-hover="pauseOnHover"
          class="text-black/45"
          @change="handleChange"
        />
      </p>

      <div class="mt-10 flex flex-wrap items-center gap-2 border-t border-black/15 pt-5">
        <button type="button" class="rounded-full border border-black/15 bg-black/5 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15" @click="loopRef?.previous()">Previous</button>
        <button type="button" class="rounded-full border border-black/15 bg-black/5 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15" @click="loopRef?.next()">Next</button>
        <button type="button" class="rounded-full border border-black/15 bg-black/5 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15" :aria-pressed="locallyPaused" @click="locallyPaused = !locallyPaused">{{ locallyPaused ? 'Resume' : 'Pause' }}</button>
        <p data-testid="text-loop-status" class="min-w-0 flex-1 text-right text-xs text-black/45" aria-live="polite">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
