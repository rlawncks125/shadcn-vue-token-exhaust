<script setup lang="ts">
import TypewriterText from '../../../registry/default/typewriter-text/TypewriterText.vue'
withDefaults(defineProps<{ typeDuration?: number; deleteDuration?: number; pauseDuration?: number; loop?: boolean; paused?: boolean; cursor?: string }>(), { typeDuration: 85, deleteDuration: 45, pauseDuration: 1200, loop: true, paused: false, cursor: '|' })
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#fff3d6] p-8 text-[#191711] sm:min-h-[560px]">
    <div class="max-w-3xl"><p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">Writing system · live</p><h3 class="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-7xl">Interfaces should feel<br><TypewriterText :words="['clear.', 'alive.', 'human.']" :type-duration="typeDuration" :delete-duration="deleteDuration" :pause-duration="pauseDuration" :loop="loop" :paused="paused" :cursor="cursor" class="text-[#e35b32]" /></h3><p class="mt-8 max-w-lg text-sm leading-6 text-black/45">Motion can carry tone without getting in the way of meaning.</p></div>
  </div>
</template>
