<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AutoResizeTextarea from '#registry/default/auto-resize-textarea/AutoResizeTextarea.vue'

const props = withDefaults(defineProps<{
  minRows?: number
  maxRows?: number
  maxLength?: number
  duration?: number
  showCount?: boolean
  disabled?: boolean
  readonly?: boolean
}>(), {
  minRows: 3,
  maxRows: 8,
  maxLength: 420,
  duration: 180,
  showCount: true,
  disabled: false,
  readonly: false,
})

const initialComment = 'The opening is strong. Could we bring the reader into the street-level scene one paragraph earlier?'
const comment = ref(initialComment)
const status = ref('Draft saved locally.')
const lastHeight = ref(0)
const submitted = ref(false)
const safeMaximum = computed(() => Number.isFinite(props.maxLength) ? Math.max(0, Math.floor(props.maxLength)) : 420)
const remaining = computed(() => Math.max(0, safeMaximum.value - comment.value.length))
const activityLabel = computed(() => {
  if (props.disabled) return 'Composer unavailable'
  if (props.readonly) return 'Reviewing published note'
  if (submitted.value) return 'Comment shared'
  return 'Editing private draft'
})

function publishComment() {
  if (!comment.value.trim()) {
    status.value = 'Add a note before sharing it with the editor.'
    return
  }

  submitted.value = true
  status.value = 'Comment shared with the editorial team.'
}

function resetDraft() {
  comment.value = ''
  submitted.value = false
  status.value = 'Draft cleared. Start a new editorial note.'
}

watch(() => [props.minRows, props.maxRows, props.maxLength, props.duration, props.showCount, props.disabled, props.readonly], () => {
  status.value = 'Composer settings updated.'
})
</script>

<template>
  <section
    class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/10 bg-[#ece9df] text-[#181a17] shadow-[0_38px_100px_-60px_rgba(20,24,18,0.68)]"
    data-testid="auto-resize-textarea-preview"
  >
    <header class="flex flex-col gap-4 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-full bg-[#181a17] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
          <svg class="size-[17px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
            <path d="M5 5h14v11H9l-4 3V5Z" />
            <path d="M9 9h6m-6 3h4" />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold tracking-[-0.025em]">Margin / 24</p>
          <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">Editorial review room</p>
        </div>
      </div>
      <div class="flex items-center gap-2 text-[10px] font-semibold text-black/45">
        <span class="size-1.5 rounded-full bg-[#759036]" aria-hidden="true" />
        <span data-testid="composer-state">{{ activityLabel }}</span>
      </div>
    </header>

    <div class="grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
      <article class="relative overflow-hidden border-b border-black/10 p-6 sm:p-9 lg:min-h-[560px] lg:border-b-0 lg:border-r">
        <span class="absolute -left-16 -top-20 size-56 rounded-full border-[38px] border-white/40" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">Issue no. 08 · Culture</p>
            <span class="rounded-full border border-black/10 bg-white/45 px-2.5 py-1 text-[9px] font-semibold text-black/45">6 min read</span>
          </div>

          <h3 class="mt-12 max-w-md text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            The city after the last train.
          </h3>
          <p class="mt-6 max-w-md text-sm leading-6 text-black/48">
            Night workers, half-lit platforms, and the informal rituals that keep a place moving while most of us sleep.
          </p>

          <div class="mt-12 border-l-2 border-[#181a17] pl-5">
            <p class="font-serif text-lg italic leading-7 text-black/70">“At 2:13 a.m., the station belongs to everyone whose day runs in reverse.”</p>
            <p class="mt-3 text-[9px] font-bold uppercase tracking-[0.17em] text-black/35">Paragraph 04 · Selected passage</p>
          </div>
        </div>

        <footer class="relative mt-14 flex items-center gap-3 lg:absolute lg:inset-x-9 lg:bottom-9 lg:mt-0">
          <span class="grid size-9 place-items-center rounded-full bg-[#c9c2b2] text-[10px] font-bold">ML</span>
          <div>
            <p class="text-[11px] font-semibold">Mara Liu</p>
            <p class="text-[9px] text-black/35">Features editor</p>
          </div>
        </footer>
      </article>

      <form class="flex min-w-0 flex-col bg-[#f8f7f2] p-6 sm:p-9 lg:p-11" novalidate @submit.prevent="publishComment">
        <div class="flex items-start justify-between gap-5">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#73892e]">Editor’s note</p>
            <h4 class="mt-2 text-2xl font-semibold tracking-[-0.045em] sm:text-[30px]">Leave the useful detail.</h4>
          </div>
          <span class="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-black/10 text-[10px] font-bold">04</span>
        </div>

        <p class="mt-3 max-w-xl text-sm leading-6 text-black/45">
          Comments stay attached to the selected passage. The field grows with your thinking, then scrolls after the row limit.
        </p>

        <div class="mt-8">
          <AutoResizeTextarea
            v-model="comment"
            label="Editorial comment"
            name="editorial-comment"
            placeholder="What should the writer reconsider?"
            description="Visible to the writer and assigned editors."
            :min-rows="minRows"
            :max-rows="maxRows"
            :max-length="maxLength"
            :duration="duration"
            :show-count="showCount"
            :disabled="disabled"
            :readonly="readonly"
            clearable
            required
            data-testid="editorial-comment"
            @input="submitted = false; status = 'Changes saved to this draft.'"
            @focus="status = 'Comment composer focused.'"
            @blur="status = comment.trim() ? 'Draft saved locally.' : 'The comment is empty.'"
            @resize="height => lastHeight = Math.round(height)"
            @limit="status = `Character limit reached at ${safeMaximum}.`"
          />
        </div>

        <div class="mt-5 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p class="min-h-5 text-[10px] leading-5 text-black/42" data-testid="auto-resize-preview-status" role="status" aria-live="polite">
            {{ status }}<span v-if="lastHeight" class="sr-only"> Field height {{ lastHeight }} pixels.</span>
          </p>
          <span data-testid="remaining-count" class="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
            {{ remaining }} remaining
          </span>
        </div>

        <div class="mt-auto flex flex-col-reverse gap-3 pt-7 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="h-11 cursor-pointer rounded-[13px] border border-black/10 bg-transparent px-5 text-[11px] font-bold text-black/55 outline-none transition-colors duration-150 hover:not-disabled:bg-black/[0.04] focus-visible:ring-3 focus-visible:ring-black/10 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled || readonly || !comment"
            data-testid="clear-draft"
            @click="resetDraft"
          >
            Clear draft
          </button>
          <button
            type="submit"
            class="flex h-11 cursor-pointer items-center justify-center gap-3 rounded-[13px] border-0 bg-[#181a17] px-5 text-[11px] font-bold text-white shadow-[0_14px_28px_-18px_rgba(20,24,18,0.8)] outline-none transition-[transform,box-shadow] duration-150 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_18px_30px_-17px_rgba(20,24,18,0.9)] focus-visible:ring-3 focus-visible:ring-[#9db638]/35 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
            :disabled="disabled || readonly"
            data-testid="share-comment"
          >
            Share comment
            <svg class="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M3.5 9h11m-4-4 4 4-4 4" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
