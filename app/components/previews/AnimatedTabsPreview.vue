<script setup lang="ts">
import AnimatedTabs from '#registry/default/animated-tabs/AnimatedTabs.vue'
withDefaults(defineProps<{ accent?: string; disabled?: boolean }>(), { accent: 'var(--registry-accent, #d9ff57)', disabled: false })
const selected = ref('overview')
</script>

<template>
  <AnimatedTabs v-model="selected" :accent="accent" label="Project information" :items="[
    { value: 'overview', label: 'Overview', content: 'Small details. Better interfaces. Switch sections with a smooth, responsive indicator.' },
    { value: 'design', label: 'Design', content: 'Make it yours. Adjust the accent color, replace the labels, and compose your own content.' },
    { value: 'code', label: 'Code', content: 'Install the component with one command. Your source, your rules.', disabled },
  ]" />
</template>
