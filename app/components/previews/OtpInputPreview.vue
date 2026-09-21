<script setup lang="ts">
import OtpInput from '#registry/default/otp-input/OtpInput.vue'

const props = withDefaults(defineProps<{ length?: number; mode?: 'numeric' | 'alphanumeric'; disabled?: boolean; showError?: boolean }>(), { length: 6, mode: 'numeric', disabled: false, showError: false })
const code = ref('')
const message = ref('Enter the verification code')
watch(() => [props.length, props.mode], () => { code.value = ''; message.value = 'Enter the verification code' })
</script>

<template>
  <div class="w-full max-w-md text-center">
    <OtpInput v-model="code" :length="length" :mode="mode" :disabled="disabled" :error="showError ? 'The code has expired. Request a new one.' : ''" @complete="value => message = `Complete code: ${value}`" />
    <p class="mt-5 text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
