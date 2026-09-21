<script setup lang="ts">
import type { ActionMenuItem } from '#registry/default/action-menu/ActionMenu.vue'
import ActionMenu from '#registry/default/action-menu/ActionMenu.vue'

withDefaults(defineProps<{
  align?: 'start' | 'end'
  closeOnSelect?: boolean
  disabled?: boolean
}>(), {
  align: 'end',
  closeOnSelect: true,
  disabled: false,
})

const open = ref(false)
const message = ref('Choose an action')
const items: ActionMenuItem[] = [
  { id: 'edit', label: 'Edit details', description: 'Update title and metadata', shortcut: 'E' },
  { id: 'duplicate', label: 'Duplicate project', description: 'Create a new independent copy', shortcut: 'D' },
  { id: 'archive', label: 'Archive project', description: 'Unavailable during review', disabled: true },
  { id: 'delete', label: 'Delete project', description: 'Move this project to trash', destructive: true },
]
</script>

<template>
  <div class="flex min-h-64 w-full max-w-md flex-col items-center justify-center rounded-3xl border border-black/8 bg-white/35 p-8 text-center">
    <div class="mb-7 grid size-14 place-items-center rounded-2xl bg-[#171814] text-lg font-bold text-brand">N</div>
    <p class="text-lg font-semibold tracking-[-0.03em]">Northstar launch</p>
    <p class="mt-1.5 text-xs text-black/40">Updated moments ago</p>
    <ActionMenu v-model="open" class="mt-6" :items="items" :align="align" :close-on-select="closeOnSelect" :disabled="disabled" @select="item => message = `Selected: ${item.label}`" />
    <p class="mt-5 text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
