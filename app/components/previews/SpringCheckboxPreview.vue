<script setup lang="ts">
import { computed, ref } from 'vue'
import SpringCheckbox from '../../../registry/default/spring-checkbox/SpringCheckbox.vue'

const props = withDefaults(defineProps<{
  duration?: number
  disabled?: boolean
  indeterminate?: boolean
}>(), {
  duration: 420,
  disabled: false,
  indeterminate: false,
})

const tasks = ref([true, false, false])
const completed = computed(() => tasks.value.filter(Boolean).length)
const message = ref('One of three launch tasks complete.')

function updateTask(index: number, value: boolean) {
  tasks.value[index] = value
  message.value = `${tasks.value.filter(Boolean).length} of 3 launch tasks complete.`
}
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#f1efe8] p-6 text-[#171814] sm:min-h-[560px] sm:p-10">
    <section class="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-9">
      <div class="flex items-end justify-between border-b border-black/10 pb-6">
        <div><p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Release 2.4</p><h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em]">Launch checklist</h3></div>
        <strong class="text-3xl tracking-[-0.05em]">{{ completed }}/3</strong>
      </div>
      <div class="space-y-5 py-7">
        <SpringCheckbox :model-value="tasks[0]" :duration="duration" :disabled="disabled" :indeterminate="indeterminate" label="Review interaction states" @update:model-value="updateTask(0, $event)">Review interaction states</SpringCheckbox>
        <SpringCheckbox :model-value="tasks[1]" :duration="duration" :disabled="disabled" label="Verify keyboard flow" @update:model-value="updateTask(1, $event)">Verify keyboard flow</SpringCheckbox>
        <SpringCheckbox :model-value="tasks[2]" :duration="duration" :disabled="disabled" label="Publish release notes" @update:model-value="updateTask(2, $event)">Publish release notes</SpringCheckbox>
      </div>
      <p data-testid="checkbox-status" class="border-t border-black/10 pt-5 text-xs text-black/40" aria-live="polite">{{ message }}</p>
    </section>
  </div>
</template>
