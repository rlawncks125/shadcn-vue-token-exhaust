<script setup lang="ts">
import { ref, watch } from 'vue'
import AnimatedMobileNumericKeypad from '#registry/default/animated-mobile-numeric-keypad/AnimatedMobileNumericKeypad.vue'

const props = withDefaults(defineProps<{ mode?: 'numeric' | 'decimal' | 'pin', maxLength?: number, masked?: boolean, showSubmit?: boolean, autoSubmit?: boolean, haptic?: boolean, duration?: number, disabled?: boolean }>(), { mode: 'decimal', maxLength: 8, masked: false, showSubmit: true, autoSubmit: false, haptic: false, duration: 140, disabled: false })
const value = ref('')
const status = ref('Enter an amount.')
watch(() => props.mode, () => { value.value = ''; status.value = props.mode === 'pin' ? 'Enter your secure code.' : 'Enter a value.' })
</script>

<template>
  <section data-testid="animated-mobile-numeric-keypad-preview" class="grid min-h-[650px] w-full max-w-[760px] place-items-center overflow-hidden rounded-[30px] border border-black/10 bg-[#d7d1c2] p-3 sm:p-8">
    <div class="w-full max-w-sm">
      <p class="mb-3 text-center text-[9px] font-bold uppercase tracking-[.2em] text-black/38">{{ mode === 'pin' ? 'Secure access' : mode === 'decimal' ? 'Quick transfer' : 'Quantity' }}</p>
      <AnimatedMobileNumericKeypad v-model="value" :mode="mode" :label="mode === 'pin' ? 'Access code' : mode === 'decimal' ? 'Transfer amount' : 'Quantity'" :placeholder="mode === 'decimal' ? '0.00' : '0'" :max-length="maxLength" :masked="masked" :show-submit="showSubmit" :auto-submit="autoSubmit" :haptic="haptic" :duration="duration" :disabled="disabled" :submit-label="mode === 'pin' ? 'Unlock' : 'Continue'" @input="(_, key) => status = `${key} entered.`" @delete="status = 'Last digit deleted.'" @clear="status = 'Value cleared.'" @complete="status = 'Maximum length reached.'" @submit="submitted => status = `${mode === 'pin' ? 'Code' : 'Value'} ${mode === 'pin' ? 'submitted' : `${submitted} submitted`}.`" />
      <p data-testid="keypad-status" class="mt-3 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
    </div>
  </section>
</template>
