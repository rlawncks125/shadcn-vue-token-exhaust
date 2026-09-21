<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedCheckboxGroup, { type AnimatedCheckboxOption } from '#registry/default/animated-checkbox-group/AnimatedCheckboxGroup.vue'

const props = withDefaults(
  defineProps<{
    columns?: 1 | 2 | 3
    orientation?: 'horizontal' | 'vertical'
    maxSelected?: number
    duration?: number
    required?: boolean
    disabled?: boolean
  }>(),
  {
    columns: 2,
    orientation: 'horizontal',
    maxSelected: 3,
    duration: 320,
    required: true,
    disabled: false,
  },
)

const interests: AnimatedCheckboxOption[] = [
  {
    value: 'product',
    label: 'Product craft',
    description: 'Systems, strategy, and building the right thing.',
    badge: 'Popular',
  },
  {
    value: 'engineering',
    label: 'Engineering',
    description: 'Architecture, tooling, and technical deep dives.',
  },
  {
    value: 'research',
    label: 'Field research',
    description: 'Customer stories, signals, and practical methods.',
  },
  {
    value: 'leadership',
    label: 'Team leadership',
    description: 'Clear decisions and healthier ways of working.',
  },
]

const selected = ref(['product', 'engineering'])
const status = ref('Your Friday digest updates as you choose.')
const safePreviewMax = computed(() => {
  const maximum = Number(props.maxSelected)
  return Number.isFinite(maximum) ? Math.min(interests.length, Math.max(1, Math.floor(maximum))) : interests.length
})
const visibleSelected = computed(() => {
  const available = new Set(interests.map((interest) => interest.value))
  return [...new Set(selected.value.filter((value) => available.has(value)))].slice(0, safePreviewMax.value)
})
const selectedLabels = computed(() => interests.filter((interest) => visibleSelected.value.includes(interest.value)).map((interest) => interest.label))
const digestLabel = computed(() => {
  const count = visibleSelected.value.length
  if (!count) return 'No topics selected'
  return `${count} topic${count === 1 ? '' : 's'} selected`
})

function handleChange(next: string[], previous: string[]) {
  selected.value = next
  const difference = next.length - previous.length
  if (difference > 0) status.value = `${interests.find((interest) => interest.value === next[next.length - 1])?.label ?? 'Interest'} added to your digest.`
  else status.value = `${digestLabel.value}. Your preferences have been updated.`
}

function handleLimit(option: AnimatedCheckboxOption) {
  status.value = `You can choose up to ${safePreviewMax.value}. Remove one before adding ${option.label}.`
}

function savePreferences() {
  if (props.required && !visibleSelected.value.length) {
    status.value = 'Choose at least one interest before continuing.'
    return
  }
  status.value = `Preferences saved for ${selectedLabels.value.join(', ') || 'your future digest'}.`
}
</script>

<template>
  <form
    data-testid="animated-checkbox-group-preview"
    class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/10 bg-[#f3f0e7] text-[#171814] shadow-[0_34px_100px_-58px_rgba(24,30,18,0.55)]"
    @submit.prevent="savePreferences"
  >
    <header class="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-xl bg-[#171814] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
          <svg class="size-[18px] fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20">
            <path d="M4 5h12M4 10h8M4 15h10" stroke-linecap="round" />
            <path d="m14.5 9 1.5 1.5 3-3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold tracking-[-0.02em]">Fieldnotes</p>
          <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-black/35">Reader onboarding</p>
        </div>
      </div>
      <p class="w-fit rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/50">Step 2 of 3</p>
    </header>

    <div class="grid lg:grid-cols-[minmax(0,1fr)_278px]">
      <section class="min-w-0 p-5 sm:p-8 lg:p-10">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Tune your reading list</p>
        <h3 class="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">What should we send your way?</h3>
        <p class="mt-3 max-w-xl text-sm leading-6 text-black/45">
          Pick the subjects that make you curious. We will shape a concise Friday digest around your choices.
        </p>

        <AnimatedCheckboxGroup
          :model-value="selected"
          :options="interests"
          label="Choose your interests"
          name="reader-interests"
          class="mt-8"
          data-testid="animated-checkbox-group"
          :columns="columns"
          :orientation="orientation"
          :max-selected="maxSelected"
          :duration="duration"
          :required="required"
          :disabled="disabled"
          @update:model-value="selected = $event"
          @change="handleChange"
          @limit="handleLimit"
        />
      </section>

      <aside class="relative flex flex-col justify-between overflow-hidden bg-[#1d211b] p-6 text-white sm:p-8 lg:min-h-[540px]">
        <span class="absolute -right-16 -top-16 size-48 rounded-full border-[34px] border-[var(--registry-accent,#d9ff57)] opacity-[0.08]" aria-hidden="true" />
        <div class="relative">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--registry-accent,#d9ff57)]">Your weekly edit</p>
          <p data-testid="animated-checkbox-group-selected" class="mt-5 text-2xl font-semibold tracking-[-0.045em]">
            {{ digestLabel }}
          </p>
          <p class="mt-2 text-xs leading-5 text-white/40">A focused read, delivered Friday morning.</p>

          <div class="mt-8 border-t border-white/10 pt-6">
            <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">In your digest</p>
            <TransitionGroup name="preview-topic" tag="ul" class="mt-4 space-y-3">
              <li v-for="label in selectedLabels" :key="label" class="flex items-center gap-2.5 text-xs font-semibold">
                <span class="grid size-4 place-items-center rounded-full bg-[var(--registry-accent,#d9ff57)] text-[#171814]" aria-hidden="true">
                  <svg class="size-2.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 12 12"><path d="m2.5 6 2.2 2.2L9.5 3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </span>
                {{ label }}
              </li>
            </TransitionGroup>
            <p v-if="!selectedLabels.length" class="mt-4 text-xs text-white/35">Choose a topic to begin.</p>
          </div>
        </div>

        <div class="relative mt-8">
          <button
            type="submit"
            data-testid="save-preferences"
            class="flex w-full cursor-pointer items-center justify-between rounded-2xl border-0 bg-[var(--registry-accent,#d9ff57)] px-4 py-3.5 text-sm font-bold text-[#171814] outline-none transition-[transform,box-shadow] duration-150 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_14px_30px_-18px_var(--registry-accent,#d9ff57)] active:not-disabled:translate-y-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d211b] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled"
          >
            Save preferences
            <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <p data-testid="animated-checkbox-group-status" class="mt-4 min-h-10 text-[11px] leading-5 text-white/40" role="status" aria-live="polite" aria-atomic="true">
            {{ status }}
          </p>
        </div>
      </aside>
    </div>
  </form>
</template>

<style scoped>
.preview-topic-enter-active,
.preview-topic-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.preview-topic-enter-from,
.preview-topic-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

@media (prefers-reduced-motion: reduce) {
  .preview-topic-enter-active,
  .preview-topic-leave-active {
    transition: none;
  }
}
</style>
