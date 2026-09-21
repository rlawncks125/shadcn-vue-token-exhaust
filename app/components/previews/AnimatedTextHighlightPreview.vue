<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedTextHighlight from '../../../registry/default/animated-text-highlight/AnimatedTextHighlight.vue'

type Trigger = 'load' | 'hover' | 'click' | 'view'

const props = withDefaults(defineProps<{
  color?: string
  duration?: number
  delay?: number
  trigger?: Trigger
  thickness?: number
  disabled?: boolean
}>(), {
  color: '#dfff4f',
  duration: 850,
  delay: 120,
  trigger: 'load',
  thickness: 0.58,
  disabled: false,
})

const highlight = ref<InstanceType<typeof AnimatedTextHighlight> | null>(null)
const starts = ref(0)
const completions = ref(0)

const instruction = computed(() => ({
  load: 'The marker enters with the page.',
  hover: 'Hover or focus the quotation to replay.',
  click: 'Click the quotation, or use Enter or Space.',
  view: 'The marker enters when the quotation comes into view.',
})[props.trigger])
</script>

<template>
  <section
    data-testid="animated-text-highlight-preview"
    class="relative flex min-h-[440px] w-full overflow-hidden rounded-[1.75rem] border border-[#1d262a]/10 bg-[#f4f0e8] text-[#172126] sm:min-h-[540px]"
  >
    <div class="absolute inset-y-0 left-0 w-2 bg-[#172126] sm:w-3" />
    <div class="flex w-full flex-col justify-between px-7 py-7 sm:px-12 sm:py-10 lg:px-16">
      <header class="flex items-start justify-between gap-5 border-b border-[#172126]/15 pb-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#172126]/45">The Sunday marginalia</p>
          <p class="mt-1 text-xs text-[#172126]/55">Issue 04 / Notes on attention</p>
        </div>
        <button
          type="button"
          data-testid="animated-text-highlight-replay"
          class="shrink-0 rounded-full border border-[#172126]/20 bg-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-[#172126] hover:text-[#f4f0e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#172126]/30 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="props.disabled"
          @click="highlight?.replay()"
        >
          Replay mark
        </button>
      </header>

      <div class="py-10 sm:py-14">
        <p class="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#172126]/40">A field note, underlined</p>
        <AnimatedTextHighlight
          ref="highlight"
          text="Attention is how we decide what deserves to become unforgettable."
          as="blockquote"
          :color="props.color"
          :duration="props.duration"
          :delay="props.delay"
          :trigger="props.trigger"
          :thickness="props.thickness"
          :disabled="props.disabled"
          aria-label="Attention is how we decide what deserves to become unforgettable."
          class="max-w-4xl font-serif text-[clamp(2rem,6.8vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.045em]"
          @start="starts++"
          @complete="completions++"
        />
        <div class="mt-7 flex items-center gap-3 text-xs text-[#172126]/55">
          <span class="h-px w-8 bg-[#172126]/30" />
          <span>{{ instruction }}</span>
        </div>
      </div>

      <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-[#172126]/15 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#172126]/45">
        <span>Words / form / memory</span>
        <span data-testid="animated-text-highlight-status" aria-live="polite">
          Starts {{ starts }} / Complete {{ completions }}
        </span>
      </footer>
    </div>
  </section>
</template>
