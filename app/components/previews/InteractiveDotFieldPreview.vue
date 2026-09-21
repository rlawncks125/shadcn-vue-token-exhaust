<script setup lang="ts">
import { ref, watch } from 'vue'
import InteractiveDotField from '../../../registry/default/interactive-dot-field/InteractiveDotField.vue'

interface PulseDetail {
  x: number
  y: number
  count: number
}

const props = withDefaults(defineProps<{
  rows?: number
  columns?: number
  intensity?: number
  duration?: number
  paused?: boolean
  color?: string
}>(), {
  rows: 13,
  columns: 21,
  intensity: 0.8,
  duration: 1100,
  paused: false,
  color: 'var(--registry-accent, #a3e635)',
})

const field = ref<InstanceType<typeof InteractiveDotField> | null>(null)
const status = ref(props.paused ? 'The field is paused.' : 'Move across the field, then click to send a signal.')

function handlePulse(detail: PulseDetail) {
  status.value = `Signal ${detail.count} launched from ${Math.round(detail.x)}, ${Math.round(detail.y)}.`
}

function handleReset() {
  status.value = 'The signal field was reset.'
}

function replay() {
  if (props.paused) return
  field.value?.reset()
  field.value?.pulse()
}

watch(() => props.paused, (paused) => {
  status.value = paused ? 'The field is paused.' : 'The field is active again.'
})
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#dce6dc] p-4 text-[#f7faef] sm:min-h-[560px] sm:p-8">
    <section class="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-black/10 bg-[#070a12] shadow-[0_30px_90px_rgba(17,35,25,0.24)]">
      <InteractiveDotField
        ref="field"
        class="min-h-[390px] rounded-none sm:min-h-[430px]"
        :rows="rows"
        :columns="columns"
        :intensity="intensity"
        :duration="duration"
        :paused="paused"
        :color="color"
        aria-label="Send a signal through the atmospheric dot field"
        @pulse="handlePulse"
        @reset="handleReset"
      >
        <template #default="{ pulseCount, paused: fieldPaused }">
          <div class="flex min-h-[390px] flex-col justify-between p-6 sm:min-h-[430px] sm:p-9">
            <div class="flex items-center justify-between gap-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Atmospheric relay</p>
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                <span class="size-1.5 rounded-full bg-[var(--dot-color)] shadow-[0_0_10px_var(--dot-color)]" />
                {{ fieldPaused ? 'Paused' : 'Listening' }}
              </span>
            </div>

            <div class="mx-auto max-w-xl text-center">
              <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--dot-color)]/80">Signal no. {{ String(pulseCount).padStart(2, '0') }}</p>
              <h3 class="mt-4 text-3xl font-semibold leading-none tracking-[-0.055em] text-white sm:text-5xl">Touch the quiet.</h3>
              <p class="mx-auto mt-4 max-w-md text-xs leading-6 text-white/45 sm:text-sm">Every point responds to your presence. Click or press Enter to let the motion travel outward.</p>
            </div>

            <p class="text-center text-[10px] uppercase tracking-[0.18em] text-white/30">Pointer, Enter, or Space</p>
          </div>
        </template>
      </InteractiveDotField>

      <div class="flex flex-col gap-4 border-t border-white/10 bg-white/[0.025] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <p data-testid="interactive-dot-field-status" class="min-h-5 text-xs leading-5 text-white/45" aria-live="polite">
          {{ status }}
        </p>
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dot-color)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none sm:self-auto"
          :disabled="paused"
          :style="{ '--dot-color': color }"
          @click="replay"
        >
          <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13 4.75V1.9m0 2.85h-2.85M13 4.75A5.75 5.75 0 1 0 13.34 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Replay pulse
        </button>
      </div>
    </section>
  </div>
</template>
