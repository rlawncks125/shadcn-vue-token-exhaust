<script setup lang="ts">
import InlineEdit from '#registry/default/inline-edit/InlineEdit.vue'

const props = withDefaults(defineProps<{
  label?: string
  required?: boolean
  saveOnBlur?: boolean
  disabled?: boolean
}>(), {
  label: 'Project name',
  required: true,
  saveOnBlur: true,
  disabled: false,
})

const value = ref('Northstar launch')
const message = ref('Select the field to edit')

function validate(next: string) {
  if (props.required && !next) return 'Project name is required.'
  if (next && next.length < 3) return 'Use at least 3 characters.'
  return true
}
</script>

<template>
  <div class="w-full max-w-[480px]">
    <InlineEdit
      v-model="value"
      :label="label"
      placeholder="Name this project"
      :save-on-blur="saveOnBlur"
      :disabled="disabled"
      :validate="validate"
      @edit="message = 'Editing project name'"
      @save="next => message = `Saved: ${next || 'Empty value'}`"
      @cancel="message = 'Changes cancelled'"
    />
    <p class="mt-5 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
