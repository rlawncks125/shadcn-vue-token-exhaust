<script setup lang="ts">
import { ref } from 'vue'
import CopyButton from '#registry/default/copy-button/CopyButton.vue'

withDefaults(defineProps<{
  duration?: number
  resetAfter?: number
  disabled?: boolean
  iconOnly?: boolean
}>(), {
  duration: 180,
  resetAfter: 1800,
  disabled: false,
  iconOnly: false,
})

const token = 'dpl_demo_7H4K-PREVIEW-92NX'
const attempts = ref(0)
const status = ref('Ready to copy')
const statusTone = ref<'idle' | 'active' | 'success' | 'error'>('idle')

function selectToken(event: FocusEvent) {
  if (event.currentTarget instanceof HTMLInputElement) event.currentTarget.select()
}

function handleCopy() {
  attempts.value++
  status.value = 'Copying deployment token...'
  statusTone.value = 'active'
}

function handleCopied() {
  status.value = 'Deployment token copied'
  statusTone.value = 'success'
}

function handleError(error: Error) {
  status.value = `Copy failed: ${error.message}`
  statusTone.value = 'error'
}

function handleReset() {
  status.value = 'Ready to copy'
  statusTone.value = 'idle'
}
</script>

<template>
  <section
    data-testid="copy-button-preview"
    class="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#0d100c] px-4 py-12 text-white sm:min-h-[560px] sm:px-8"
  >
    <div class="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
      <div class="absolute -left-16 top-10 size-64 rounded-full bg-[#d9ff57]/[0.08] blur-3xl" />
      <div class="absolute -right-20 bottom-0 size-72 rounded-full bg-emerald-400/[0.06] blur-3xl" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
    </div>

    <div class="relative w-full max-w-2xl">
      <div class="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9ff57]/70">Project Northstar</p>
          <h3 class="mt-2 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">Deployment access</h3>
        </div>
        <span class="hidden items-center gap-2 text-xs text-white/40 sm:flex">
          <span class="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Production
        </span>
      </div>

      <div data-testid="deployment-token-card" class="overflow-hidden rounded-2xl border border-white/10 bg-[#151914]/95 shadow-[0_28px_80px_-36px_#000] backdrop-blur">
        <div class="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-[#ff6b62]/70" />
            <span class="size-2.5 rounded-full bg-[#f5bf4f]/70" />
            <span class="size-2.5 rounded-full bg-[#65c466]/70" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">deploy.env</span>
        </div>

        <div class="p-4 sm:p-6">
          <div class="mb-3 flex items-center justify-between gap-3">
            <label for="preview-deployment-token" class="text-xs font-medium text-white/60">Deployment token</label>
            <span class="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">Demo value</span>
          </div>

          <div class="flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-2.5 transition-colors focus-within:border-[#d9ff57]/40 sm:flex-row sm:items-center sm:gap-2">
            <span class="hidden pl-2 font-mono text-sm text-[#d9ff57]/55 sm:inline" aria-hidden="true">$</span>
            <input
              id="preview-deployment-token"
              data-testid="deployment-token"
              :value="token"
              readonly
              spellcheck="false"
              class="min-w-0 flex-1 cursor-text select-all bg-transparent px-1 font-mono text-xs tracking-[0.02em] text-white/80 outline-none sm:text-sm"
              aria-describedby="token-help"
              @focus="selectToken"
            >
            <CopyButton
              :text="token"
              label="Copy token"
              copied-label="Token copied"
              error-label="Retry copy"
              aria-label="Copy deployment token"
              :duration="duration"
              :reset-after="resetAfter"
              :disabled="disabled"
              :icon-only="iconOnly"
              class="shrink-0"
              @copy="handleCopy"
              @copied="handleCopied"
              @error="handleError"
              @reset="handleReset"
            />
          </div>
          <p id="token-help" class="mt-3 text-[11px] leading-relaxed text-white/35">Select the demo token or copy it directly. Rotate production tokens after sharing.</p>
        </div>

        <div class="flex flex-col gap-2 border-t border-white/[0.07] bg-white/[0.018] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            data-testid="copy-status"
            class="flex min-w-0 items-center gap-2 text-white/50"
            role="status"
            aria-live="polite"
          >
            <span
              class="size-1.5 shrink-0 rounded-full bg-white/25 transition-colors"
              :class="{
                '!bg-[#d9ff57]': statusTone === 'active',
                '!bg-emerald-400': statusTone === 'success',
                '!bg-red-400': statusTone === 'error',
              }"
              aria-hidden="true"
            />
            <span class="truncate">{{ status }}</span>
          </p>
          <p data-testid="copy-attempts" class="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            {{ attempts }} attempt{{ attempts === 1 ? '' : 's' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
