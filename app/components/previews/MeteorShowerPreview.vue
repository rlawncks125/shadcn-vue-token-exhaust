<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MeteorShower from '../../../registry/default/meteor-shower/MeteorShower.vue'

const props = withDefaults(defineProps<{
  count?: number
  color?: string
  speed?: number
  angle?: number
  trailLength?: number
  paused?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  count: 24,
  color: '#d9f3ff',
  speed: 4.8,
  angle: 18,
  trailLength: 140,
  paused: false,
  disabled: false,
  ariaLabel: 'Night observatory meteor shower',
})

const shower = ref<InstanceType<typeof MeteorShower> | null>(null)
const replayCount = ref(0)
const status = ref(initialStatus())

const liveCount = computed(() => {
  const value = Number.isFinite(props.count) ? props.count : 24
  return props.disabled ? 0 : Math.round(Math.min(Math.max(value, 0), 100))
})
const safeAngle = computed(() => Math.min(Math.max(Number.isFinite(props.angle) ? props.angle : 18, -360), 360))

const stateLabel = computed(() => {
  if (props.disabled) return 'Offline'
  if (props.paused) return 'Holding'
  return 'Tracking'
})

function initialStatus() {
  if (props.disabled) return 'Meteor tracking is offline.'
  if (props.paused) return 'The sky is holding its current frame.'
  return 'The north-east array is actively tracking the sky.'
}

function triggerReplay() {
  shower.value?.replay()
}

function handleReplay() {
  replayCount.value += 1
  status.value = props.paused
    ? `Sequence ${replayCount.value} is queued on a paused frame.`
    : `Observation sequence ${replayCount.value} restarted.`
}

watch(() => [props.paused, props.disabled], () => {
  status.value = initialStatus()
})
</script>

<template>
  <div class="w-full overflow-hidden rounded-[1.75rem] border border-[#20324c] bg-[#030711] p-2 text-[#eef7ff] shadow-[0_28px_80px_rgba(2,8,23,0.3)] sm:p-3">
    <MeteorShower
      ref="shower"
      class="min-h-[500px] rounded-[1.35rem] border border-white/[0.08] bg-[radial-gradient(circle_at_74%_18%,#173654_0%,#081527_31%,#030711_72%)] sm:min-h-[560px]"
      :count="count"
      :color="color"
      :speed="speed"
      :angle="angle"
      :trail-length="trailLength"
      :paused="paused"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @replay="handleReplay"
    >
      <div class="flex min-h-[500px] flex-col p-5 sm:min-h-[560px] sm:p-8">
        <header class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="relative grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04]">
              <span class="size-2 rounded-full bg-[var(--meteor-color)] shadow-[0_0_14px_var(--meteor-color)]" />
              <span class="absolute inset-1 rounded-full border border-dashed border-white/15" />
            </span>
            <div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#8ba5c3]">Asteria station</p>
              <p class="mt-1 font-mono text-[10px] text-white/35">43.0784 N / SKY ARRAY 04</p>
            </div>
          </div>

          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#06101e]/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm">
            <span
              class="size-1.5 rounded-full"
              :class="disabled ? 'bg-white/25' : paused ? 'bg-amber-300' : 'bg-emerald-300 shadow-[0_0_8px_#6ee7b7]'"
            />
            {{ stateLabel }}
          </span>
        </header>

        <div class="my-auto max-w-xl py-14 sm:pl-[8%]">
          <p class="font-mono text-[10px] uppercase tracking-[0.32em] text-[#88b8da]">Perseid observation / 02:14 UTC</p>
          <h3 class="mt-5 max-w-lg text-4xl font-medium leading-[0.93] tracking-[-0.065em] text-white sm:text-6xl">
            Signals from<br><span class="font-serif italic text-[#b9d9eb]">the quiet dark.</span>
          </h3>
          <p class="mt-6 max-w-sm text-xs leading-6 text-[#91a6bd] sm:text-sm">
            The ridge is silent. Every bright line is measured before it disappears beyond the horizon.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div class="grid grid-cols-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#06101e]/65 backdrop-blur-sm sm:max-w-sm">
            <div class="border-r border-white/[0.08] px-4 py-3">
              <p class="text-[8px] uppercase tracking-[0.24em] text-white/30">Visible tracks</p>
              <p data-testid="meteor-shower-count" class="mt-1 font-mono text-lg text-white">{{ String(liveCount).padStart(2, '0') }}</p>
            </div>
            <div class="px-4 py-3">
              <p class="text-[8px] uppercase tracking-[0.24em] text-white/30">Bearing</p>
              <p class="mt-1 font-mono text-lg text-white">{{ safeAngle }} deg</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="meteor-shower-replay"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#8ec5e5]/25 bg-[#8ec5e5]/10 px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8effc] transition hover:border-[#8ec5e5]/45 hover:bg-[#8ec5e5]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ec5e5] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
            :disabled="disabled"
            @click="triggerReplay"
          >
            <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.2 5.1V2.2m0 2.9h-2.9M13.1 5A5.7 5.7 0 1 0 13.4 11" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Replay sky
          </button>
        </div>

        <p data-testid="meteor-shower-status" class="mt-3 min-h-4 text-right font-mono text-[9px] uppercase tracking-[0.12em] text-white/30" aria-live="polite">{{ status }}</p>
      </div>
    </MeteorShower>
  </div>
</template>
