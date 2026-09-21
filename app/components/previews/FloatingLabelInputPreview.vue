<script setup lang="ts">
import { computed, ref } from 'vue'
import FloatingLabelInput from '#registry/default/floating-label-input/FloatingLabelInput.vue'

const props = withDefaults(defineProps<{
  duration?: number
  disabled?: boolean
  clearable?: boolean
  state?: 'default' | 'success' | 'error'
}>(), {
  duration: 220,
  disabled: false,
  clearable: true,
  state: 'default',
})

const email = ref('hello@northstar.studio')
const message = ref('Your first field guide arrives on Friday.')
const errorMessage = computed(() => props.state === 'error' ? 'This address is already on the guest list.' : undefined)
const successMessage = computed(() => props.state === 'success' ? 'Email confirmed. Your invitation is ready.' : undefined)
const liveStatus = computed(() => errorMessage.value || successMessage.value || message.value)

function submit() {
  message.value = email.value.trim()
    ? `Invite reserved for ${email.value.trim()}.`
    : 'Enter an email to reserve your invitation.'
}
</script>

<template>
  <section class="w-full max-w-[820px] overflow-hidden rounded-[30px] border border-black/10 bg-[#f1f0e9] shadow-[0_34px_90px_-52px_rgba(15,19,14,0.7)]" data-testid="floating-label-input-preview">
    <div class="grid min-h-[480px] md:grid-cols-[0.88fr_1.12fr]">
      <div class="relative isolate overflow-hidden bg-[#171a15] p-7 text-white sm:p-9 md:p-10">
        <div class="absolute -right-14 -top-12 -z-10 size-52 rounded-full border-[36px] border-[#d9ff57]/90" aria-hidden="true" />
        <div class="absolute -bottom-20 -left-20 -z-10 size-64 rounded-full border border-white/10" aria-hidden="true" />
        <div class="absolute bottom-8 right-8 -z-10 grid grid-cols-4 gap-2 opacity-30" aria-hidden="true">
          <span v-for="dot in 12" :key="dot" class="size-1 rounded-full bg-[#d9ff57]" />
        </div>

        <div class="flex items-center gap-2.5">
          <span class="grid size-8 place-items-center rounded-full bg-[#d9ff57] text-[#171a15]">
            <svg class="size-4 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 14 9 4l2 7 5-3-4 8H6Z" /></svg>
          </span>
          <span class="text-[11px] font-semibold uppercase tracking-[0.2em]">Northstar Notes</span>
        </div>

        <div class="mt-20 max-w-[270px] md:mt-32">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9ff57]">Field guide 01</p>
          <h3 class="mt-4 text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[0.94] tracking-[-0.065em]">Better work starts quietly.</h3>
          <p class="mt-5 text-sm leading-6 text-white/55">A considered weekly letter for people building thoughtful digital products.</p>
        </div>
      </div>

      <form class="flex flex-col justify-between p-7 sm:p-10 md:p-12" novalidate @submit.prevent="submit">
        <div>
          <div class="flex items-center justify-between gap-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Private preview</p>
            <span class="rounded-full border border-black/10 bg-white/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-black/45">No spam</span>
          </div>
          <h4 class="mt-7 text-3xl font-semibold tracking-[-0.05em] text-[#171a15]">Join the next dispatch.</h4>
          <p class="mt-3 max-w-sm text-sm leading-6 text-black/45">One useful idea, one practical tool, and no algorithm in the middle.</p>

          <div class="mt-9">
            <FloatingLabelInput
              v-model="email"
              label="Work email"
              type="email"
              name="email"
              placeholder="you@studio.com"
              autocomplete="email"
              description="Used only for the weekly dispatch."
              :error="errorMessage"
              :success="successMessage"
              :disabled="disabled"
              :clearable="clearable"
              :duration="duration"
              required
              data-testid="signup-email"
              @input="message = 'Email updated. Submit when you are ready.'"
              @focus="message = 'Enter the address where you read your best work.'"
              @blur="message = email ? 'Your first field guide arrives on Friday.' : 'An email is required to join.'"
              @clear="message = 'Email cleared. Add a new address to continue.'"
            />
          </div>

          <button
            type="submit"
            class="mt-5 flex h-12 w-full cursor-pointer items-center justify-between rounded-[15px] border-0 bg-[#171a15] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(20,24,18,0.8)] outline-none transition-[background-color,transform,box-shadow] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-[#282d24] hover:not-disabled:shadow-[0_18px_32px_-18px_rgba(20,24,18,0.9)] focus-visible:ring-4 focus-visible:ring-[#9dbb32]/25 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
            :disabled="disabled"
          >
            Reserve my place
            <span class="grid size-7 place-items-center rounded-full bg-[#d9ff57] text-[#171a15]" aria-hidden="true">
              <svg class="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 16 16"><path d="M3 8h9m-3-3 3 3-3 3" /></svg>
            </span>
          </button>
        </div>

        <div class="mt-9 flex items-start gap-2.5 border-t border-black/10 pt-5 text-[11px] leading-5 text-black/45" role="status" aria-live="polite" data-testid="floating-label-preview-status">
          <span class="mt-1.5 size-1.5 shrink-0 rounded-full" :class="state === 'error' ? 'bg-[#d94b3d]' : state === 'success' ? 'bg-[#1c8a6d]' : 'bg-[#8ca72c]'" aria-hidden="true" />
          <span>{{ liveStatus }}</span>
        </div>
      </form>
    </div>
  </section>
</template>
