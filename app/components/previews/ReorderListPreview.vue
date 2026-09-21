<script setup lang="ts">
import type { ReorderListItem } from '#registry/default/reorder-list/ReorderList.vue'
import ReorderList from '#registry/default/reorder-list/ReorderList.vue'

withDefaults(defineProps<{
  disabled?: boolean
  showPositions?: boolean
}>(), {
  disabled: false,
  showPositions: true,
})

function initialItems(): ReorderListItem[] {
  return [
    { id: 'research', label: 'Research', description: 'Collect references and constraints' },
    { id: 'structure', label: 'Structure', description: 'Define the page hierarchy' },
    { id: 'prototype', label: 'Prototype', description: 'Connect the key interaction path' },
    { id: 'review', label: 'Team review', description: 'Locked until the prototype is ready', disabled: true },
  ]
}

const items = ref(initialItems())
const message = ref('Drag a handle or use its arrow keys')

function reset() {
  items.value = initialItems()
  message.value = 'Order reset'
}
</script>

<template>
  <div class="w-full max-w-[520px]">
    <div class="mb-4 flex items-center justify-between">
      <div><p class="text-xs font-semibold">Launch workflow</p><p class="mt-1 text-[10px] text-black/40">Arrange the execution order</p></div>
      <button type="button" class="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click="reset">Reset order</button>
    </div>
    <ReorderList v-model="items" :disabled="disabled" :show-positions="showPositions" @reorder="(_, item, from, to) => message = `${item.label}: ${from + 1} to ${to + 1}`" />
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
