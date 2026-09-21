<script setup lang="ts">
import { ref } from 'vue'
import BorderBeam from '../../../registry/default/border-beam/BorderBeam.vue'

const props = withDefaults(defineProps<{
  duration?: number
  beamSize?: number
  beamCount?: number
  reverse?: boolean
  paused?: boolean
  pauseOnHover?: boolean
  colors?: string[]
}>(), {
  duration: 8,
  beamSize: 18,
  beamCount: 2,
  reverse: false,
  paused: false,
  pauseOnHover: true,
  colors: () => ['var(--registry-accent, #d9ff57)', '#8b5cf6', '#38bdf8'],
})

const message = ref('The collaboration room is active.')
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#090a08] p-6 sm:min-h-[560px] sm:p-10">
    <BorderBeam
      class="w-full max-w-lg border-white/10 !bg-[#12140f] text-white shadow-[0_30px_90px_-45px_rgba(0,0,0,0.9)]"
      :duration="duration"
      :beam-size="beamSize"
      :beam-count="beamCount"
      :reverse="reverse"
      :paused="paused"
      :pause-on-hover="pauseOnHover"
      :colors="colors"
      aria-label="Live collaboration card"
    >
      <div class="p-7 sm:p-9">
        <div class="flex items-center justify-between gap-4">
          <div class="flex -space-x-2">
            <span v-for="initial in ['MK', 'AL', 'JS']" :key="initial" class="grid size-9 place-items-center rounded-full border-2 border-[#12140f] bg-white/10 text-[10px] font-semibold text-white">{{ initial }}</span>
          </div>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
            <span class="size-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--registry-accent,#d9ff57)]" /> Live
          </span>
        </div>

        <p class="mt-14 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Shared workspace</p>
        <h3 class="mt-3 max-w-md text-3xl font-semibold leading-none tracking-[-0.05em] sm:text-4xl">Ideas move better together.</h3>
        <p class="mt-4 max-w-md text-sm leading-6 text-white/50">Keep context, decisions and active collaborators inside one focused surface.</p>

        <div class="mt-8 flex flex-col items-start gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="beam-status" class="text-xs text-white/40" aria-live="polite">{{ message }}</p>
          <button type="button" class="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-brand/25" @click="message = 'Workspace opened.'">Open room</button>
        </div>
      </div>
    </BorderBeam>
  </div>
</template>
