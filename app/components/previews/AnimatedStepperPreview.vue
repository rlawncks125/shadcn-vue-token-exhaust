<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedStepper, { type AnimatedStepperStep } from '#registry/default/animated-stepper/AnimatedStepper.vue'

const props = withDefaults(defineProps<{
  orientation?: 'horizontal' | 'vertical'
  duration?: number
  linear?: boolean
  disabled?: boolean
}>(), {
  orientation: 'horizontal',
  duration: 360,
  linear: false,
  disabled: false,
})

const steps: AnimatedStepperStep[] = [
  { id: 'workspace', label: 'Workspace', description: 'Name the release and choose its owner.' },
  { id: 'team', label: 'Team access', description: 'Invite the people shipping with you.' },
  { id: 'checks', label: 'Release checks', description: 'Connect quality gates and approvals.' },
  { id: 'publish', label: 'Publish', description: 'Review the rollout and make it live.' },
]

const current = ref(1)
const currentStep = computed(() => steps[current.value] ?? steps[0]!)
const progress = computed(() => Math.round(((current.value + 1) / steps.length) * 100))

function move(direction: 1 | -1) {
  if (props.disabled) return
  const next = current.value + direction
  if (next >= 0 && next < steps.length) current.value = next
}
</script>

<template>
  <section
    class="w-full max-w-[860px] overflow-hidden rounded-[30px] border border-black/15 bg-[#171814] text-white shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]"
    data-testid="animated-stepper-preview"
  >
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-xl bg-brand text-xs font-black text-[#171814]">RN</span>
        <div>
          <p class="text-sm font-semibold">Release North</p>
          <p class="text-[10px] uppercase tracking-[0.18em] text-white/40">Launch workspace</p>
        </div>
      </div>
      <span class="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Draft 04</span>
    </header>

    <div class="bg-[#f2f1eb] p-5 text-[#171814] sm:p-8">
      <div class="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Onboarding sequence</p>
          <h2 class="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Prepare the September release</h2>
        </div>
        <p class="shrink-0 text-xs font-semibold tabular-nums text-black/45">{{ progress }}% configured</p>
      </div>

      <div
        class="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.5)] sm:p-7"
        :class="orientation === 'vertical' ? 'mx-auto max-w-[620px]' : ''"
      >
        <AnimatedStepper
          v-model="current"
          :steps="steps"
          :orientation="orientation"
          :duration="duration"
          :linear="linear"
          :disabled="disabled"
          aria-label="Release onboarding progress"
        />

        <div class="mt-7 border-t border-black/10 pt-5 sm:mt-9">
          <div
            class="flex flex-col gap-4 rounded-2xl bg-[#ebeadd] p-4 sm:flex-row sm:items-center sm:justify-between"
            data-testid="animated-stepper-preview-state"
            :data-current-index="current"
            :data-current-step="currentStep.id"
            aria-live="polite"
          >
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">Now configuring</p>
              <p class="mt-1 truncate text-sm font-semibold">{{ currentStep.label }}</p>
            </div>
            <span class="w-fit shrink-0 rounded-full bg-[#171814] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              Step {{ current + 1 }} / {{ steps.length }}
            </span>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              class="rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-xs font-semibold text-[#171814] outline-none transition-[background-color,transform] hover:not-disabled:bg-black/5 active:not-disabled:scale-[0.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
              :disabled="disabled || current === 0"
              data-testid="animated-stepper-back"
              @click="move(-1)"
            >
              Back
            </button>
            <button
              type="button"
              class="rounded-xl bg-[#171814] px-5 py-2.5 text-xs font-semibold text-brand outline-none transition-[background-color,transform] hover:not-disabled:bg-[#2d2e28] active:not-disabled:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
              :disabled="disabled || current === steps.length - 1"
              data-testid="animated-stepper-continue"
              @click="move(1)"
            >
              {{ current === steps.length - 1 ? 'Ready to publish' : 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
