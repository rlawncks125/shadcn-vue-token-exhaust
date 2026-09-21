<script setup lang="ts">
import { ref } from 'vue'
import AnimatedSparkline from '../../../registry/default/animated-sparkline/AnimatedSparkline.vue'
const props = withDefaults(defineProps<{ duration?: number; showArea?: boolean; showPoints?: boolean; paused?: boolean; color?: string }>(), { duration: 900, showArea: true, showPoints: true, paused: false, color: '#7c3aed' })
const sets = [[42, 48, 45, 61, 58, 72, 81], [81, 67, 74, 62, 69, 78, 92], [35, 54, 49, 68, 77, 71, 88]]
const current = ref(0)
const values = ref(sets[0]!)
function refresh() { current.value = (current.value + 1) % sets.length; values.value = [...sets[current.value]!] }
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#dff7ed] p-7 text-[#171814] sm:min-h-[560px] sm:p-10">
    <section class="w-full max-w-lg rounded-[30px] border border-black/10 bg-white p-7 shadow-[0_24px_70px_rgba(20,80,55,0.12)] sm:p-9"><div class="mb-8 flex items-start justify-between"><div><p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Weekly signal</p><h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em]">Active sessions</h3></div><button type="button" class="rounded-full border border-black/10 px-4 py-2 text-xs hover:bg-black/5" @click="refresh">Refresh data</button></div><AnimatedSparkline :values="values" :labels="['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :color="props.color" :duration="duration" :show-area="showArea" :show-points="showPoints" :paused="paused" label="Sessions" :format-value="value => `${value}k`" /></section>
  </div>
</template>
