<script setup lang="ts">
import { z } from 'zod'
import type { PasswordCriterion } from '#registry/default/password-strength/PasswordStrength.vue'
import PasswordStrength from '#registry/default/password-strength/PasswordStrength.vue'

const props = withDefaults(defineProps<{ minLength?: number; requireMixedCase?: boolean; requireNumber?: boolean; requireSymbol?: boolean; showRequirements?: boolean; disabled?: boolean }>(), { minLength: 8, requireMixedCase: true, requireNumber: true, requireSymbol: true, showRequirements: true, disabled: false })
const password = ref('')
const message = ref('Enter a password to check its strength')
const criteria = computed<PasswordCriterion[]>(() => [
  { key: 'length', label: `At least ${props.minLength} characters`, test: value => value.length >= props.minLength },
  ...(props.requireMixedCase ? [{ key: 'case', label: 'Uppercase and lowercase letters', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) }] : []),
  ...(props.requireNumber ? [{ key: 'number', label: 'At least one number', test: (value: string) => /[0-9]/.test(value) }] : []),
  ...(props.requireSymbol ? [{ key: 'symbol', label: 'At least one symbol', test: (value: string) => /[^a-z0-9\s]/i.test(value) }] : []),
])
const schema = computed(() => z.string().superRefine((value, context) => {
  for (const criterion of criteria.value) {
    if (!criterion.test(value)) context.addIssue({ code: 'custom', message: criterion.label, params: { criterion: criterion.key } })
  }
}))
</script>

<template>
  <div class="w-full max-w-md">
    <PasswordStrength v-model="password" name="accountPassword" required :schema="schema" :criteria="criteria" validate-on="input" :show-requirements="showRequirements" :disabled="disabled" @validated="(valid, error, key) => message = valid ? 'Zod: password is valid' : `Zod [${key}]: ${error}`" />
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
