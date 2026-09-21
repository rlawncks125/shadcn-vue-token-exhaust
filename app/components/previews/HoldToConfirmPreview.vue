<script setup lang="ts">
import HoldToConfirm from '#registry/default/hold-to-confirm/HoldToConfirm.vue'

withDefaults(defineProps<{ duration?: number; resetAfter?: number; tone?: 'default' | 'danger'; disabled?: boolean }>(), { duration: 1200, resetAfter: 1400, tone: 'default', disabled: false })
const message = ref('Hold until the action completes')
const completions = ref(0)
</script>

<template>
  <div class="text-center">
    <HoldToConfirm :duration="duration" :reset-after="resetAfter" :tone="tone" :disabled="disabled" :label="tone === 'danger' ? 'Hold to delete' : 'Hold to confirm'" @start="message = 'Action started'" @cancel="message = 'Released too soon'" @complete="completions++; message = `Completed ${completions} time${completions === 1 ? '' : 's'}`" />
    <p class="mt-5 text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
