<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileMiniPlayer, { type AnimatedMobileMiniPlayerTrack } from '#registry/default/animated-mobile-mini-player/AnimatedMobileMiniPlayer.vue'

const props = withDefaults(defineProps<{ duration?: number, safeArea?: boolean, showClose?: boolean, disabled?: boolean }>(), { duration: 260, safeArea: true, showClose: true, disabled: false })
const open = ref(false)
const playing = ref(false)
const progress = ref(0.28)
const status = ref('Choose a field recording.')
const track: AnimatedMobileMiniPlayerTrack = { id: 'atlantic', title: 'Atlantic weather, 06:14', artist: 'Northward Field Recordings', duration: 248 }
function show() { open.value = true; status.value = 'Mini player opened.' }
</script>

<template>
  <section data-testid="animated-mobile-mini-player-preview" class="relative min-h-[560px] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#e7e2d5] p-5 text-[#1c1e1a] sm:p-9">
    <header><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Field recordings</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.055em]">Listen to the landscape.</h3></header>
    <div class="mt-8 grid gap-2 sm:grid-cols-2">
      <button type="button" data-testid="mini-player-open" class="flex min-h-32 items-center gap-4 rounded-[22px] bg-[#1c1e1a] p-4 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:opacity-40" :disabled="disabled" @click="show"><span class="grid size-16 place-items-center rounded-[18px] bg-gradient-to-br from-[#e4633f] to-[#f0c84b] text-xs font-black text-[#1c1e1a]">01</span><span><strong class="block text-sm">Atlantic weather</strong><small class="mt-2 block text-[10px] text-white/40">04:08 · Coast archive</small></span></button>
      <article class="flex min-h-32 items-center gap-4 rounded-[22px] border border-black/[0.07] bg-white/60 p-4"><span class="grid size-16 place-items-center rounded-[18px] bg-[#bad5cc] text-xs font-black">02</span><span><strong class="block text-sm">Pines after rain</strong><small class="mt-2 block text-[10px] text-black/38">03:26 · Forest archive</small></span></article>
    </div>
    <p data-testid="mini-player-status" class="mt-5 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
    <AnimatedMobileMiniPlayer v-model="playing" v-model:open="open" v-model:progress="progress" :track="track" :duration="duration" :safe-area="safeArea" :show-close="showClose" :disabled="disabled" @previous="status = 'Previous recording requested.'" @next="status = 'Next recording requested.'" @seek="value => status = `Seeked to ${Math.round(value * 100)}%.`" @close="status = 'Mini player closed.'" />
  </section>
</template>
