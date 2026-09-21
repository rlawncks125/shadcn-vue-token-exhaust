<script setup lang="ts">
import type { ContextMenuItem } from '#registry/default/context-menu/ContextMenu.vue'
import ContextMenu from '#registry/default/context-menu/ContextMenu.vue'

withDefaults(defineProps<{
  longPressDelay?: number
  closeOnSelect?: boolean
  disabled?: boolean
}>(), {
  longPressDelay: 550,
  closeOnSelect: true,
  disabled: false,
})

const open = ref(false)
const message = ref('Right-click, long press, or press Shift+F10')
const items: ContextMenuItem[] = [
  { id: 'open', label: 'Open project', description: 'View the latest workspace', shortcut: 'Enter' },
  { id: 'duplicate', label: 'Duplicate', description: 'Create an independent copy', shortcut: 'D' },
  { id: 'pin', label: 'Pin to top', description: 'Unavailable in this workspace', disabled: true },
  { id: 'delete', label: 'Move to trash', description: 'Remove from active projects', destructive: true, separator: true },
]
</script>

<template>
  <div class="w-full max-w-md">
    <ContextMenu v-model="open" :items="items" :long-press-delay="longPressDelay" :close-on-select="closeOnSelect" :disabled="disabled" @select="item => message = `Selected: ${item.label}`">
      <article class="select-none rounded-3xl border border-black/10 bg-white/65 p-6 shadow-[0_22px_60px_-44px_#0008]">
        <div class="flex items-start justify-between gap-4"><span class="grid size-12 place-items-center rounded-2xl bg-[#171814] text-sm font-bold text-brand">NS</span><span class="rounded-full bg-brand px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-brand-foreground">Active</span></div>
        <h3 class="mt-16 text-xl font-semibold tracking-[-.04em]">Northstar workspace</h3>
        <p class="mt-2 text-xs leading-5 text-black/45">A contextual surface for project-level actions.</p>
        <div class="mt-5 flex items-center justify-between border-t border-black/8 pt-4 text-[10px] text-black/35"><span>Right-click or long press</span><span>Shift + F10</span></div>
      </article>
    </ContextMenu>
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
