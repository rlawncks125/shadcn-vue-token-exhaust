<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedProgressBar, {
  type AnimatedProgressBarSize,
  type AnimatedProgressBarStatus,
} from '#registry/default/animated-progress-bar/AnimatedProgressBar.vue'

const props = withDefaults(defineProps<{
  duration?: number
  color?: string
  indeterminate?: boolean
  striped?: boolean
  paused?: boolean
  showValue?: boolean
  size?: AnimatedProgressBarSize
  status?: AnimatedProgressBarStatus
}>(), {
  duration: 700,
  color: '#b9e63b',
  indeterminate: false,
  striped: true,
  paused: false,
  showValue: true,
  size: 'medium',
  status: 'default',
})

const progress = ref(42)
const progressBar = ref<{ replay: () => void; reset: () => void } | null>(null)
const checkpoints = [42, 68, 86, 100]

const activeStep = computed(() => {
  if (progress.value <= 0) return -1
  if (progress.value >= 100) return 3
  if (progress.value >= 86) return 2
  if (progress.value >= 68) return 1
  return 0
})
const statusText = computed(() => {
  if (props.status === 'error') return 'Deployment blocked. Review the release checks.'
  if (props.status === 'success' || progress.value >= 100) return 'Deployment complete. Production is up to date.'
  if (props.indeterminate) return 'Uploading release artifacts. Calculating remaining work.'
  if (props.paused) return `Deployment paused at ${progress.value}%.`
  return `Deployment in progress. ${progress.value}% complete.`
})

function advance() {
  const next = checkpoints.find(value => value > progress.value)
  progress.value = next ?? 100
}

function reset() {
  progress.value = 0
  progressBar.value?.reset()
}
</script>

<template>
  <section class="w-full max-w-[820px] overflow-hidden rounded-[30px] border border-black/10 bg-[#f3f1e9] text-[#171814] shadow-[0_28px_80px_-45px_rgba(20,22,15,0.55)]" data-testid="animated-progress-bar-preview">
    <header class="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#171814] text-[10px] font-black tracking-[0.08em] text-[#b9e63b]">DX</span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-[-0.02em]">dashboard-web / production</p>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Release 2.18.0</p>
        </div>
      </div>
      <span class="w-fit rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black/55">Deploy #1842</span>
    </header>

    <div class="grid gap-5 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div class="min-w-0 rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_20px_42px_-34px_rgba(0,0,0,0.45)] sm:p-7">
        <div class="mb-7 flex items-start justify-between gap-5">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Live pipeline</p>
            <h2 class="mt-2 text-xl font-semibold tracking-[-0.045em] sm:text-2xl">Shipping to production</h2>
          </div>
          <span
            class="mt-0.5 size-2.5 shrink-0 rounded-full"
            :class="status === 'error' ? 'bg-[#ef675d]' : status === 'success' || progress >= 100 ? 'bg-[#86c232]' : paused ? 'bg-[#d8a731]' : 'animate-pulse bg-[#86c232] motion-reduce:animate-none'"
            aria-hidden="true"
          />
        </div>

        <AnimatedProgressBar
          ref="progressBar"
          :value="progress"
          label="Release progress"
          :duration="duration"
          :color="color"
          :indeterminate="indeterminate"
          :striped="striped"
          :paused="paused"
          :show-value="showValue"
          :size="size"
          :status="status"
        />

        <div class="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div
            v-for="(step, index) in ['Build', 'Upload', 'Verify', 'Deploy']"
            :key="step"
            class="rounded-xl border px-3 py-3 transition-colors motion-reduce:transition-none"
            :class="index <= activeStep ? 'border-black/10 bg-[#f0f4df]' : 'border-black/8 bg-[#f6f5f0] text-black/35'"
          >
            <span class="mb-2 block size-1.5 rounded-full" :class="index <= activeStep ? 'bg-[#86c232]' : 'bg-black/20'" aria-hidden="true" />
            <p class="text-[10px] font-bold uppercase tracking-[0.12em]">{{ step }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-2 border-t border-black/10 pt-5">
          <button type="button" class="rounded-xl bg-[#171814] px-4 py-2.5 text-xs font-semibold text-white outline-none transition-[transform,background-color] hover:bg-[#303129] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#171814] focus-visible:ring-offset-2 motion-reduce:transition-none" data-testid="animated-progress-bar-advance" @click="advance">
            Advance stage
          </button>
          <button type="button" class="rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-xs font-semibold outline-none transition-[transform,background-color] hover:bg-black/5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 motion-reduce:transition-none" data-testid="animated-progress-bar-reset" @click="reset">
            Reset
          </button>
          <button type="button" class="rounded-xl px-3 py-2.5 text-xs font-semibold text-black/45 outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-black" @click="progressBar?.replay()">
            Replay
          </button>
        </div>
      </div>

      <aside class="flex flex-col justify-between rounded-[24px] bg-[#171814] p-5 text-white sm:p-6">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Current output</p>
          <p data-testid="animated-progress-bar-value" class="mt-4 text-4xl font-semibold tracking-[-0.06em] tabular-nums text-white">
            {{ indeterminate ? '--' : `${progress}%` }}
          </p>
          <p class="mt-2 text-xs leading-5 text-white/40">iad1 · primary region<br>Commit a8f2c91</p>
        </div>
        <p
          data-testid="animated-progress-bar-status"
          class="mt-8 border-t border-white/10 pt-5 text-[11px] leading-5 text-white/55"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ statusText }}
        </p>
      </aside>
    </div>
  </section>
</template>
