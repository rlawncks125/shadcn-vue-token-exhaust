<script setup lang="ts">
import AnimatedList from '#registry/default/animated-list/AnimatedList.vue'
withDefaults(defineProps<{ interval?: number; maxVisible?: number; paused?: boolean }>(), { interval: 1600, maxVisible: 3, paused: false })
const selected = ref('')
const items = [
  { id: '1', title: 'Deployment complete', description: 'Production is up to date', meta: 'now', symbol: 'D' },
  { id: '2', title: 'New component published', description: 'Floating Dock is ready', meta: '2m', symbol: 'N' },
  { id: '3', title: 'Registry health', description: 'All checks passed', meta: '5m', symbol: 'R' },
  { id: '4', title: 'Design review', description: 'Three comments resolved', meta: '8m', symbol: 'C' },
]
</script>

<template>
  <div class="w-full max-w-md">
    <AnimatedList :items="items" :interval="interval" :max-visible="maxVisible" :paused="paused" @select="item => selected = item.title" />
    <p class="mt-5 text-center text-xs text-black/40" role="status">{{ selected ? `Selected: ${selected}` : 'Select an activity' }}</p>
  </div>
</template>
