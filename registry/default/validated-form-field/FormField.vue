<script setup lang="ts">
import { useId } from 'vue'
import { Field } from 'vee-validate'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  name: string
  label?: string
  description?: string
  required?: boolean
}>()
const id = `field-${useId()}`
</script>

<template>
  <Field v-slot="slotProps" :name="name">
    <div data-slot="form-item" class="grid gap-2">
      <Label v-if="label" :for="id" :class="slotProps.errorMessage ? 'text-destructive' : undefined">{{ label }}<span v-if="required" aria-hidden="true"> *</span></Label>
      <slot v-bind="slotProps" :id="id" :invalid="Boolean(slotProps.errorMessage)" />
      <p v-if="description && !slotProps.errorMessage" :id="`${id}-description`" class="text-xs text-muted-foreground">{{ description }}</p>
      <p v-if="slotProps.errorMessage" :id="`${id}-message`" role="alert" class="text-xs font-medium text-destructive">{{ slotProps.errorMessage }}</p>
    </div>
  </Field>
</template>
