<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedRadioGroup, { type AnimatedRadioOption } from '#registry/default/animated-radio-group/AnimatedRadioGroup.vue'

withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
    columns?: 1 | 2 | 3
    duration?: number
    disabled?: boolean
    required?: boolean
  }>(),
  {
    orientation: 'horizontal',
    columns: 3,
    duration: 320,
    disabled: false,
    required: false,
  },
)

const plans: AnimatedRadioOption[] = [
  {
    value: 'solo',
    label: 'Solo',
    description: '$9 monthly. One seat and three active projects.',
  },
  {
    value: 'studio',
    label: 'Studio',
    description: '$24 monthly. Eight seats and unlimited projects.',
    badge: 'Best fit',
  },
  {
    value: 'company',
    label: 'Company',
    description: '$48 monthly. Unlimited seats and priority support.',
  },
]

const planDetails = {
  solo: { price: '$9', seats: '1 seat', projects: '3 projects' },
  studio: { price: '$24', seats: '8 seats', projects: 'Unlimited projects' },
  company: {
    price: '$48',
    seats: 'Unlimited seats',
    projects: 'Unlimited projects',
  },
} as const

const selected = ref<keyof typeof planDetails>('studio')
const status = ref('Studio is selected. Continue when you are ready.')
const current = computed(() => planDetails[selected.value])
const currentLabel = computed(() => plans.find((plan) => plan.value === selected.value)?.label ?? 'No plan')

function handleChange(value: string, previous: string) {
  if (!(value in planDetails)) return
  selected.value = value as keyof typeof planDetails
  status.value = `${currentLabel.value} selected instead of ${plans.find((plan) => plan.value === previous)?.label ?? 'the previous plan'}.`
}

function continueWithPlan() {
  status.value = `${currentLabel.value} workspace ready to continue at ${current.value.price} per month.`
}
</script>

<template>
  <form
    data-testid="animated-radio-group-preview"
    class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/10 bg-[#f3f0e7] text-[#171814] shadow-[0_34px_100px_-58px_rgba(24,30,18,0.55)]"
    @submit.prevent="continueWithPlan"
  >
    <div class="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-xl bg-[#171814] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
          <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20">
            <path d="M4 5.5h12M4 10h12M4 14.5h7" stroke-linecap="round" />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold tracking-[-0.02em]">Northstar Workspace</p>
          <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/35">Plan settings</p>
        </div>
      </div>
      <p class="w-fit rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/50">Billed monthly</p>
    </div>

    <div class="grid lg:grid-cols-[minmax(0,1fr)_280px]">
      <section class="min-w-0 p-5 sm:p-8 lg:p-10">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Workspace plan</p>
        <h3 class="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Make room for the work ahead.</h3>
        <p class="mt-3 max-w-xl text-sm leading-6 text-black/45">
          Choose a plan for your team. You can change it at any time without interrupting active projects.
        </p>

        <AnimatedRadioGroup
          :model-value="selected"
          :options="plans"
          label="Select a plan"
          name="workspace-plan"
          class="mt-8"
          data-testid="animated-radio-group"
          :orientation="orientation"
          :columns="columns"
          :duration="duration"
          :disabled="disabled"
          :required="required"
          @update:model-value="selected = $event as keyof typeof planDetails"
          @change="handleChange"
        />
      </section>

      <aside class="relative flex flex-col justify-between overflow-hidden bg-[#1d211b] p-6 text-white sm:p-8 lg:min-h-[470px]">
        <span class="absolute -right-16 -top-16 size-48 rounded-full border-[34px] border-[var(--registry-accent,#d9ff57)] opacity-[0.08]" aria-hidden="true" />
        <div class="relative">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--registry-accent,#d9ff57)]">Your workspace</p>
          <p data-testid="selected-plan" class="mt-5 text-2xl font-semibold tracking-[-0.045em]">
            {{ currentLabel }}
          </p>
          <div class="mt-4 flex items-end gap-1.5">
            <strong class="text-5xl font-semibold leading-none tracking-[-0.07em]">{{ current.price }}</strong>
            <span class="mb-1 text-xs text-white/40">/ month</span>
          </div>

          <dl class="mt-8 space-y-3 border-t border-white/10 pt-6 text-xs">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-white/45">People</dt>
              <dd class="font-semibold">{{ current.seats }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-white/45">Capacity</dt>
              <dd class="font-semibold">{{ current.projects }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-white/45">Billing</dt>
              <dd class="font-semibold">Monthly</dd>
            </div>
          </dl>
        </div>

        <div class="relative mt-8">
          <button
            type="submit"
            data-testid="continue-button"
            class="flex w-full cursor-pointer items-center justify-between rounded-2xl border-0 bg-[var(--registry-accent,#d9ff57)] px-4 py-3.5 text-sm font-bold text-[#171814] outline-none transition-[transform,box-shadow] duration-150 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_14px_30px_-18px_var(--registry-accent,#d9ff57)] active:not-disabled:translate-y-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d211b] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled"
          >
            Continue with {{ currentLabel }}
            <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <p data-testid="animated-radio-status" class="mt-4 min-h-10 text-[11px] leading-5 text-white/40" role="status" aria-live="polite">
            {{ status }}
          </p>
        </div>
      </aside>
    </div>
  </form>
</template>
