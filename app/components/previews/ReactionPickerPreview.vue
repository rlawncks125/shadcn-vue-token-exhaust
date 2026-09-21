<script setup lang="ts">
import type { ReactionPickerItem } from '#registry/default/reaction-picker/ReactionPicker.vue'
import ReactionPicker from '#registry/default/reaction-picker/ReactionPicker.vue'

withDefaults(defineProps<{
  columns?: number
  closeOnSelect?: boolean
  disabled?: boolean
}>(), {
  columns: 4,
  closeOnSelect: true,
  disabled: false,
})

const selected = ref('')
const open = ref(false)
const message = ref('Add a reaction to the update')
const reactions: ReactionPickerItem[] = [
  { value: 'like', label: 'Like', symbol: '👍' },
  { value: 'love', label: 'Love', symbol: '❤️' },
  { value: 'celebrate', label: 'Celebrate', symbol: '🎉' },
  { value: 'insightful', label: 'Insightful', symbol: '💡' },
  { value: 'curious', label: 'Curious', symbol: '🤔' },
  { value: 'fire', label: 'Fire', symbol: '🔥' },
  { value: 'rocket', label: 'Rocket', symbol: '🚀' },
  { value: 'blocked', label: 'Unavailable reaction', symbol: '🔒', disabled: true },
]
</script>

<template>
  <article class="w-full max-w-md rounded-3xl border border-black/10 bg-white/60 p-5 shadow-[0_22px_60px_-44px_#0008]">
    <div class="flex items-center gap-3"><span class="grid size-10 place-items-center rounded-full bg-[#171814] text-xs font-bold text-brand">AK</span><div><p class="text-xs font-semibold">Alex Kim</p><p class="mt-0.5 text-[10px] text-black/35">Design systems · now</p></div></div>
    <p class="mt-5 text-sm leading-6 text-black/70">The interaction pass is ready. Keyboard flow and mobile collision handling are included.</p>
    <div class="mt-5 flex items-center justify-between gap-3 border-t border-black/8 pt-4">
      <span v-if="selected" class="rounded-full bg-brand px-2.5 py-1 text-sm text-brand-foreground">{{ reactions.find(item => item.value === selected)?.symbol }} <span class="ml-1 text-[10px] font-semibold">1</span></span><span v-else class="text-[10px] text-black/35">No reactions yet</span>
      <ReactionPicker v-model="selected" v-model:open="open" :items="reactions" :columns="columns" :close-on-select="closeOnSelect" :disabled="disabled" @select="item => message = `Selected: ${item.label}`" />
    </div>
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </article>
</template>
