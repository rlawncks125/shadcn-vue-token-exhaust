<script setup lang="ts">
import { Home, Search, Layers, Settings } from '@lucide/vue'
import FloatingDock from '#registry/default/floating-dock/FloatingDock.vue'
withDefaults(defineProps<{ magnification?: number; accent?: string; disabled?: boolean }>(), { magnification: 1.35, accent: 'var(--registry-accent, #d9ff57)', disabled: false })
const selected = ref('home')
const icons = { home: Home, search: Search, library: Layers, settings: Settings }
</script>

<template>
  <div class="w-full text-center">
    <FloatingDock v-model="selected" :magnification="magnification" :accent="accent" :items="[
      { value: 'home', label: 'Home' }, { value: 'search', label: 'Search' },
      { value: 'library', label: 'Library' }, { value: 'settings', label: 'Settings', disabled },
    ]">
      <template #icon="{ item }"><component :is="icons[item.value as keyof typeof icons]" /></template>
    </FloatingDock>
    <p class="mt-7 text-xs capitalize text-black/45" role="status">Selected: {{ selected }}</p>
  </div>
</template>
