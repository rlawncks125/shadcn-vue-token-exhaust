<script setup lang="ts">
import { ref, watch } from 'vue'
import RadialProgress from '../../../registry/default/radial-progress/RadialProgress.vue'

const props = withDefaults(defineProps<{
  value?: number
  size?: number
  strokeWidth?: number
  duration?: number
  indeterminate?: boolean
  paused?: boolean
  color?: string
}>(), {
  value: 62,
  size: 210,
  strokeWidth: 9,
  duration: 900,
  indeterminate: false,
  paused: false,
  color: 'var(--registry-accent, #d9ff57)',
})

const progress = ref(props.value)
const progressRef = ref<{ replay: () => void } | null>(null)
const message = ref('Project completion is 62%.')

watch(() => props.value, value => (progress.value = value))
watch(progress, value => (message.value = `Project completion is ${Math.round(value)}%.`))
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#12140f] p-6 text-white sm:min-h-[560px] sm:p-10">
    <div class="flex w-full max-w-2xl flex-col items-center gap-9 sm:flex-row sm:justify-center sm:gap-14">
      <RadialProgress
        ref="progressRef"
        v-model="progress"
        class="!text-white"
        :size="size"
        :stroke-width="strokeWidth"
        :duration="duration"
        :indeterminate="indeterminate"
        :paused="paused"
        :color="color"
        track-color="white"
        label="Project"
        @complete="message = 'Project complete.'"
      />

      <div class="w-full max-w-xs">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Release readiness</p>
        <h3 class="mt-3 text-3xl font-semibold leading-none tracking-[-0.045em]">Track progress without losing momentum.</h3>
        <div class="mt-6 flex flex-wrap gap-2">
          <button v-for="preset in [25, 62, 88, 100]" :key="preset" type="button" class="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/15" @click="progress = preset">{{ preset }}%</button>
          <button type="button" class="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/15" @click="progressRef?.replay()">Replay</button>
        </div>
        <p data-testid="radial-status" class="mt-5 text-xs text-white/40" aria-live="polite">{{ indeterminate ? 'Waiting for a measurable result.' : message }}</p>
      </div>
    </div>
  </div>
</template>
