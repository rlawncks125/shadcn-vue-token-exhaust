<script setup lang="ts">
import InfiniteMarquee from '#registry/default/infinite-marquee/InfiniteMarquee.vue'

withDefaults(defineProps<{ duration?: number; direction?: 'left' | 'right'; gap?: number; pauseOnHover?: boolean; paused?: boolean; fade?: boolean }>(), { duration: 24, direction: 'left', gap: 18, pauseOnHover: true, paused: false, fade: true })
const studios = [
  { mark: 'A', name: 'Aperture' }, { mark: 'N', name: 'Northline' }, { mark: 'M', name: 'Monument' },
  { mark: 'S', name: 'Standard' }, { mark: 'V', name: 'Vertex' }, { mark: 'O', name: 'Orbit' },
]
</script>

<template>
  <div class="w-full">
    <InfiniteMarquee :duration="duration" :direction="direction" :gap="gap" :pause-on-hover="pauseOnHover" :paused="paused" :fade="fade" label="Partner studios">
      <div v-for="studio in studios" :key="studio.name" class="flex h-20 w-44 shrink-0 items-center gap-3 rounded-2xl border border-black/10 bg-white/70 px-5 shadow-sm">
        <span class="grid size-8 place-items-center rounded-full bg-[#171814] text-xs font-semibold text-brand">{{ studio.mark }}</span>
        <span class="text-xs font-semibold tracking-[-0.02em]">{{ studio.name }}</span>
      </div>
    </InfiniteMarquee>
    <p class="mt-5 text-center text-xs text-black/40">Hover the rail to pause</p>
  </div>
</template>
