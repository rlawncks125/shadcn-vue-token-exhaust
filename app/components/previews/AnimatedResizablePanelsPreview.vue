<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedResizablePanels, { type ResizablePanelsOrientation } from '#registry/default/animated-resizable-panels/AnimatedResizablePanels.vue'

const props = withDefaults(defineProps<{
  orientation?: ResizablePanelsOrientation
  min?: number
  max?: number
  snapPoints?: number[]
  collapsible?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  orientation: 'horizontal',
  min: 28,
  max: 76,
  snapPoints: () => [36, 58, 72],
  collapsible: true,
  duration: 280,
  disabled: false,
})

const split = ref(58)
const panels = ref<InstanceType<typeof AnimatedResizablePanels> | null>(null)
const status = computed(() => split.value === 0 ? 'Navigation collapsed' : `Navigation at ${Math.round(split.value)} percent`)
</script>

<template>
  <div data-testid="animated-resizable-panels-preview" class="flex min-h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-[#cbc7bb] p-3 text-[#171814] sm:min-h-[620px] sm:p-8">
    <section class="w-full max-w-[820px] overflow-hidden rounded-[28px] border border-black/10 bg-[#f5f1e8] shadow-[0_35px_90px_-48px_rgba(24,27,21,.75)]">
      <header class="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-[#171814] text-[10px] font-bold text-[#d9ff57]">FL</span>
          <div class="min-w-0">
            <h3 class="truncate text-xs font-semibold">Field notes</h3>
            <p class="truncate text-[9px] uppercase tracking-[.14em] text-black/40">Autumn study / 04</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[9px] font-semibold transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled || !collapsible" @click="panels?.collapse()">Hide</button>
          <button type="button" class="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[9px] font-semibold transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled" @click="panels?.reset()">Reset</button>
        </div>
      </header>

      <div class="h-[420px] sm:h-[470px]">
        <AnimatedResizablePanels
          ref="panels"
          v-model="split"
          :orientation="orientation"
          :min="min"
          :max="max"
          :snap-points="snapPoints"
          :collapsible="collapsible"
          :duration="duration"
          :disabled="disabled"
          label="Resize field notes navigation"
        >
          <template #primary="{ collapsed }">
            <aside v-if="!collapsed" class="flex size-full min-w-[150px] flex-col bg-[#22251f] p-4 text-white sm:p-6">
              <p class="text-[9px] font-semibold uppercase tracking-[.18em] text-[#d9ff57]">Index</p>
              <nav class="mt-6 grid gap-1.5" aria-label="Field note chapters">
                <a class="rounded-xl bg-white/10 px-3 py-3 text-[11px] font-medium" href="#">01 / Terrain</a>
                <a class="rounded-xl px-3 py-3 text-[11px] text-white/55 transition-colors hover:bg-white/5 hover:text-white" href="#">02 / Materials</a>
                <a class="rounded-xl px-3 py-3 text-[11px] text-white/55 transition-colors hover:bg-white/5 hover:text-white" href="#">03 / Weather</a>
              </nav>
              <div class="mt-auto hidden rounded-2xl border border-white/10 p-3 sm:block">
                <div class="flex items-center justify-between text-[9px] text-white/45"><span>Collected</span><span>68%</span></div>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><span class="block h-full w-[68%] rounded-full bg-[#d9ff57]" /></div>
              </div>
            </aside>
          </template>

          <template #secondary>
            <article class="relative flex size-full min-w-[190px] flex-col overflow-hidden bg-[#f5f1e8] p-5 sm:p-8">
              <span class="absolute right-5 top-5 rounded-full border border-black/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-black/45">Live document</span>
              <p class="text-[9px] font-bold uppercase tracking-[.18em] text-[#747a65]">Terrain / Ridge line</p>
              <h2 class="mt-5 max-w-md text-3xl font-semibold leading-[.96] tracking-[-.055em] sm:text-5xl">Edges shaped<br>by weather.</h2>
              <div class="mt-auto grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <p class="max-w-sm text-[11px] leading-5 text-black/50">Drag the divider, use arrow keys, or press Home and End. Nearby field marks snap into place.</p>
                <div class="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.12em]"><span class="size-2 rounded-full bg-[#d9ff57] ring-2 ring-black" />{{ status }}</div>
              </div>
            </article>
          </template>
        </AnimatedResizablePanels>
      </div>
      <p data-testid="resizable-panels-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
    </section>
  </div>
</template>
