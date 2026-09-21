<script setup lang="ts">
import type { CommandMenuItem } from '#registry/default/command-menu/CommandMenu.vue'
import CommandMenu from '#registry/default/command-menu/CommandMenu.vue'

withDefaults(defineProps<{ placeholder?: string; openOnShortcut?: boolean }>(), { placeholder: 'Search pages and actions...', openOnShortcut: true })
const open = ref(false)
const selected = ref('No command selected')
const items: CommandMenuItem[] = [
  { id: 'dashboard', label: 'Open dashboard', description: 'Return to your workspace overview.', group: 'Navigate', shortcut: 'G D', keywords: ['home'] },
  { id: 'projects', label: 'Browse projects', description: 'See active and archived work.', group: 'Navigate', shortcut: 'G P' },
  { id: 'theme', label: 'Change theme', description: 'Switch the interface appearance.', group: 'Appearance', keywords: ['dark', 'light'] },
  { id: 'invite', label: 'Invite teammate', description: 'Requires workspace admin access.', group: 'Workspace', disabled: true },
  { id: 'new', label: 'Create new project', description: 'Start with a blank project.', group: 'Action', shortcut: 'N' },
]
function select(item: CommandMenuItem) { selected.value = `Selected: ${item.label}` }
</script>

<template>
  <div class="text-center">
    <Button @click="open = true">Browse commands <span class="ml-2 rounded border border-white/20 px-1.5 py-0.5 text-[9px]">Ctrl K</span></Button>
    <p class="mt-5 text-xs text-black/40" role="status">{{ selected }}</p>
    <CommandMenu v-model="open" :items="items" :placeholder="placeholder" :open-on-shortcut="openOnShortcut" @select="select" />
  </div>
</template>
