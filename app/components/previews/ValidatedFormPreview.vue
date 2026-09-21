<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormField from '../../../registry/default/validated-form-field/FormField.vue'

const submitted = ref('')
const schema = toTypedSchema(z.object({
  name: z.string().min(2, 'Enter at least 2 characters.'),
  email: z.email('Enter a valid email address.'),
}))
const { handleSubmit, isSubmitting, resetForm } = useForm({ validationSchema: schema, initialValues: { name: '', email: '' } })
const submit = handleSubmit(async values => {
  await new Promise(resolve => setTimeout(resolve, 250))
  submitted.value = `Saved ${values.name} · ${values.email}`
})
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#eee9df] p-6 sm:min-h-[560px] sm:p-10">
    <form class="w-full max-w-md rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9" novalidate @submit="submit">
      <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Vee Validate wrapper</p><h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em]">Create your profile</h3>
      <div class="mt-7 space-y-5">
        <FormField v-slot="{ componentField, id, invalid }" name="name" label="Display name" description="Used across your public workspace." required><Input v-bind="componentField" :id="id" placeholder="Ada Lovelace" :aria-invalid="invalid" /></FormField>
        <FormField v-slot="{ componentField, id, invalid }" name="email" label="Email" required><Input v-bind="componentField" :id="id" type="email" placeholder="ada@example.com" :aria-invalid="invalid" /></FormField>
      </div>
      <div class="mt-7 flex gap-3"><Button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Saving…' : 'Save profile' }}</Button><Button type="button" variant="outline" @click="resetForm(); submitted = ''">Reset</Button></div>
      <p data-testid="validated-form-status" class="mt-5 text-xs text-black/45" aria-live="polite">{{ submitted || 'Complete the fields to continue.' }}</p>
    </form>
  </div>
</template>
