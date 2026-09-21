<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ modelValue?: string | number; defaultValue?: string | number; class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const value = computed({ get: () => props.modelValue ?? props.defaultValue ?? '', set: value => emit('update:modelValue', value) })
</script>

<template>
  <input v-model="value" data-slot="input" :class="cn('flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50', props.class)">
</template>
