<script setup lang="ts">
import { ref } from 'vue'
import AnimatedBottomSheet from '#registry/default/animated-bottom-sheet/AnimatedBottomSheet.vue'

withDefaults(defineProps<{
  snapPoints?: number[]
  duration?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}>(), {
  snapPoints: () => [0.42, 0.72, 0.94],
  duration: 300,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const sheet = ref<InstanceType<typeof AnimatedBottomSheet> | null>(null)
const open = ref(false)
const status = ref('Open the route sheet, then drag the handle or use arrow keys.')

interface RouteOption {
  id: string
  mode: string
  detail: string
  minutes: string
  tone: string
}

const routes: RouteOption[] = [
  { id: 'transit', mode: 'Transit', detail: 'Line 4 · transfer at Central', minutes: '26 min', tone: 'bg-[#171814] text-brand' },
  { id: 'ride', mode: 'Ride hail', detail: 'Pickup in 3 min · 2.4 km', minutes: '11 min', tone: 'bg-[#ef8354] text-white' },
  { id: 'cycle', mode: 'Cycle', detail: '2 docks available nearby', minutes: '18 min', tone: 'bg-[#74a4bc] text-white' },
  { id: 'walk', mode: 'Walk', detail: 'Via riverside path', minutes: '42 min', tone: 'bg-[#839078] text-white' },
]

function openAt(snap: number) {
  status.value = snap === 0 ? 'Sheet opening at peek height.' : snap === 1 ? 'Sheet opening at half height.' : 'Sheet opening fully.'
  void sheet.value?.open(snap)
}

function onSnapChange(index: number, source: string) {
  const labels = ['peek', 'half', 'full']
  status.value = `Sheet snapped to ${labels[index] ?? index} height (${source}).`
}

function onClose() {
  status.value = 'Sheet closed. Focus returns to the trigger.'
}
</script>

<template>
  <div class="w-full max-w-[390px] rounded-[34px] border border-black/10 bg-[#171814] p-2 shadow-[0_30px_80px_-35px_#000a]">
    <section class="relative flex h-[min(620px,78vh)] min-h-[480px] flex-col overflow-hidden rounded-[27px] bg-[#e8e4d4] text-[#171814]">
      <div class="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,#17181422_1px,transparent_1px),linear-gradient(to_bottom,#17181422_1px,transparent_1px)] [background-size:34px_34px]" aria-hidden="true" />
      <div class="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#171814]/15 bg-white/30" aria-hidden="true" />
      <div class="absolute left-[38%] top-[30%] size-3 rounded-full bg-[#e4564a] shadow-[0_0_0_4px_#e4564a33]" aria-hidden="true" />
      <div class="absolute bottom-[38%] right-[30%] size-3 rounded-full bg-[#171814] shadow-[0_0_0_4px_#17181433]" aria-hidden="true" />

      <header class="relative z-10 flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[.18em] text-black/40">Fieldwork / Routes</p>
          <h2 class="mt-1 text-2xl font-semibold tracking-[-0.04em]">Studio to pier</h2>
        </div>
        <span class="rounded-full bg-[#171814] px-2.5 py-1 text-[10px] font-bold text-brand">4 ways</span>
      </header>

      <div class="relative z-10 mt-auto flex flex-wrap items-center gap-2 px-5 pb-5">
        <button
          type="button"
          data-testid="bottom-sheet-preview-open"
          class="rounded-full bg-[#171814] px-4 py-2.5 text-[11px] font-bold text-brand outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-40"
          :disabled="disabled"
          @click="openAt(0)"
        >Open route sheet</button>
        <button
          type="button"
          data-testid="bottom-sheet-preview-open-half"
          class="rounded-full border border-black/15 bg-white/70 px-4 py-2.5 text-[11px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black disabled:opacity-40"
          :disabled="disabled"
          @click="openAt(1)"
        >Half</button>
        <button
          type="button"
          data-testid="bottom-sheet-preview-open-full"
          class="rounded-full border border-black/15 bg-white/70 px-4 py-2.5 text-[11px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black disabled:opacity-40"
          :disabled="disabled"
          @click="openAt(2)"
        >Full</button>
      </div>

      <AnimatedBottomSheet
        ref="sheet"
        v-model="open"
        title="Route options"
        description="Drag the handle to switch heights, or swipe down to dismiss."
        :snap-points="snapPoints"
        :duration="duration"
        :close-on-backdrop="closeOnBackdrop"
        :lock-scroll="lockScroll"
        :disabled="disabled"
        @snap-change="onSnapChange"
        @close="onClose"
      >
        <ul class="grid gap-1.5 pb-2">
          <li v-for="route in routes" :key="route.id">
            <button type="button" class="flex w-full items-center gap-3 rounded-[18px] border border-black/[.06] bg-white/80 p-3 text-left outline-none transition-[background-color,transform] hover:bg-white focus-visible:ring-2 focus-visible:ring-black active:scale-[.99] motion-reduce:transition-none">
              <span class="grid size-10 shrink-0 place-items-center rounded-[13px] text-[10px] font-black" :class="route.tone">{{ route.mode.slice(0, 2) }}</span>
              <span class="min-w-0 flex-1">
                <strong class="block truncate text-[12px] font-semibold">{{ route.mode }}</strong>
                <span class="block truncate text-[10px] text-black/50">{{ route.detail }}</span>
              </span>
              <span class="shrink-0 font-mono text-[10px] font-bold text-black/45">{{ route.minutes }}</span>
            </button>
          </li>
        </ul>
      </AnimatedBottomSheet>
    </section>
    <p data-testid="bottom-sheet-preview-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </div>
</template>
