<script setup lang="ts">
import NumberStepper from '#registry/default/number-stepper/NumberStepper.vue'

withDefaults(defineProps<{
  max?: number
  allowInput?: boolean
  disabled?: boolean
}>(), {
  max: 12,
  allowInput: true,
  disabled: false,
})

const value = ref(3)
const message = ref('Adjust the reservation size')
</script>

<template>
  <div class="w-full max-w-[360px]">
    <div class="mb-5 rounded-2xl bg-[#171814] p-5 text-white">
      <p class="text-[10px] font-semibold tracking-[.14em] text-brand uppercase">Studio session</p>
      <p class="mt-3 text-xl font-semibold tracking-[-.04em]">Friday, 10:30 AM</p>
      <p class="mt-1.5 text-xs text-white/45">Main workspace</p>
    </div>
    <NumberStepper v-model="value" label="Seats reserved" :min="1" :max="max" suffix="seats" :allow-input="allowInput" :disabled="disabled" @change="(next, previous, source) => message = `${previous} to ${next} via ${source}`" @limit="edge => message = `${edge === 'min' ? 'Minimum' : 'Maximum'} reached`" />
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
