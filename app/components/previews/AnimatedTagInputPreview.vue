<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AnimatedTagInput from '#registry/default/animated-tag-input/AnimatedTagInput.vue'

const props = withDefaults(defineProps<{
  maxTags?: number
  allowDuplicates?: boolean
  duration?: number
  disabled?: boolean
  readonly?: boolean
}>(), {
  maxTags: 8,
  allowDuplicates: false,
  duration: 180,
  disabled: false,
  readonly: false,
})

const initialTags = ['Vue 3', 'TypeScript', 'Design systems', 'Accessibility']
const tags = ref([...initialTags])
const status = ref('Project profile is ready to edit.')
const safeMax = computed(() => Number.isFinite(props.maxTags) ? Math.max(0, Math.floor(props.maxTags)) : 8)
const remaining = computed(() => Math.max(0, safeMax.value - tags.value.length))

function validateTag(value: string) {
  if (value.length > 24) return 'Keep skills to 24 characters or fewer.'
  if (!/^[a-z0-9+#. /-]+$/i.test(value)) return 'Use letters, numbers, spaces, +, #, periods, or hyphens.'
  return true
}

function onAdd(tag: string) {
  status.value = `${tag} added to the project profile.`
}

function onRemove(tag: string) {
  status.value = `${tag} removed from the project profile.`
}

function onInvalid(value: string, reason: string) {
  status.value = value.trim() ? `Could not add ${value.trim()}: ${reason}` : reason
}

function saveProfile() {
  status.value = `Project profile saved with ${tags.value.length} ${tags.value.length === 1 ? 'skill' : 'skills'}.`
}

watch(() => [props.maxTags, props.allowDuplicates], () => {
  status.value = 'Editor settings updated.'
})
</script>

<template>
  <form
    data-testid="animated-tag-input-preview"
    class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/10 bg-[#f2efe5] text-[#171814] shadow-[0_35px_100px_-58px_rgba(25,29,19,0.58)]"
    @submit.prevent="saveProfile"
  >
    <header class="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-[13px] bg-[#171814] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
          <svg class="size-[18px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
            <path d="M7 7h.01M4 4h6l10 10-6 6L4 10V4Z" />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold tracking-[-0.02em]">Fieldwork Studio</p>
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Project profile</p>
        </div>
      </div>
      <span class="w-fit rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/50">Visible to collaborators</span>
    </header>

    <div class="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
      <section class="min-w-0 p-5 sm:p-8 lg:p-10">
        <div class="max-w-2xl">
          <p class="text-[10px] font-bold uppercase tracking-[0.19em] text-black/35">Expertise</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:text-[32px]">Shape how this project is discovered.</h3>
          <p class="mt-3 max-w-xl text-sm leading-6 text-black/45">
            Add the skills and tools that define the work. Clear tags help the right collaborators find your project.
          </p>
        </div>

        <AnimatedTagInput
          v-model="tags"
          data-testid="animated-tag-input"
          class="mt-8"
          label="Project skills"
          placeholder="Try research or prototyping"
          :max-tags="maxTags"
          :allow-duplicates="allowDuplicates"
          :duration="duration"
          :disabled="disabled"
          :readonly="readonly"
          :validate="validateTag"
          @add="onAdd"
          @remove="onRemove"
          @invalid="onInvalid"
          @focus="status = 'Skills editor focused.'"
          @blur="status = 'Skills editor focus left.'"
        />

        <div class="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p data-testid="tag-status" class="min-h-5 text-[11px] leading-5 text-black/45" role="status" aria-live="polite">
            {{ status }}
          </p>
          <button
            type="submit"
            data-testid="save-profile"
            class="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#171814] px-4 text-[11px] font-bold text-white outline-none transition-[transform,box-shadow] duration-150 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_12px_24px_-16px_#000] active:not-disabled:translate-y-0 focus-visible:ring-3 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled || readonly"
          >
            Save profile
            <svg class="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M3.5 9h11m-4-4 4 4-4 4" />
            </svg>
          </button>
        </div>
      </section>

      <aside class="relative overflow-hidden bg-[#1d211b] p-6 text-white sm:p-8 lg:min-h-[500px]">
        <span class="absolute -right-20 -top-20 size-56 rounded-full border-[38px] border-[var(--registry-accent,#d9ff57)] opacity-[0.07]" aria-hidden="true" />
        <div class="relative flex h-full flex-col">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--registry-accent,#d9ff57)]">Live profile</p>
            <span data-testid="tag-count" class="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-white/65">
              {{ tags.length }}/{{ safeMax }}
            </span>
          </div>

          <div class="mt-10">
            <div class="flex items-center gap-3">
              <span class="grid size-12 place-items-center rounded-2xl bg-[#f2efe5] text-sm font-bold text-[#171814]">FS</span>
              <div>
                <p class="text-base font-semibold tracking-[-0.025em]">Civic Atlas</p>
                <p class="mt-0.5 text-[10px] text-white/40">Research and product design</p>
              </div>
            </div>

            <p class="mt-7 text-xs leading-5 text-white/48">A shared mapping toolkit for teams turning field research into public services.</p>

            <div data-testid="skills-preview" class="mt-6 flex flex-wrap gap-2" aria-label="Profile skills">
              <span
                v-for="(tag, index) in tags"
                :key="`${tag}-${index}`"
                class="rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-[10px] font-semibold text-white/75"
              >
                {{ tag }}
              </span>
              <span v-if="!tags.length" class="text-[11px] italic text-white/30">No skills added yet</span>
            </div>
          </div>

          <div class="mt-auto pt-10">
            <div class="h-px bg-white/10" />
            <div class="mt-5 flex items-center justify-between gap-4 text-[10px]">
              <span class="text-white/35">Profile capacity</span>
              <strong class="font-semibold text-white/65">{{ remaining }} {{ remaining === 1 ? 'slot' : 'slots' }} open</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </form>
</template>
