<script setup lang="ts">
import SwipeActions from '#registry/default/swipe-actions/SwipeActions.vue'

withDefaults(defineProps<{ actionWidth?: number; threshold?: number; disabled?: boolean; closeOnAction?: boolean }>(), { actionWidth: 184, threshold: 0.35, disabled: false, closeOnAction: true })
const open = ref(false)
const message = ref('Swipe left or press Left Arrow')
function act(action: string) { message.value = `${action} action selected` }
</script>

<template>
  <div class="w-full max-w-xl">
    <SwipeActions v-model="open" :action-width="actionWidth" :threshold="threshold" :disabled="disabled" :close-on-action="closeOnAction" label="Message from Maya Chen">
      <article class="flex min-h-28 items-center gap-4 bg-white p-5 sm:p-6">
        <span class="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">MC</span>
        <div class="min-w-0 flex-1 text-left"><div class="flex items-center justify-between gap-3"><strong class="text-sm">Maya Chen</strong><time class="text-[10px] text-black/35">09:42</time></div><p class="mt-1 truncate text-xs text-black/50">The final motion pass is ready for review.</p></div>
        <span class="text-black/25" aria-hidden="true">&larr;</span>
      </article>
      <template #actions>
        <button type="button" class="bg-brand px-3 text-xs font-semibold text-brand-foreground" @click="act('Archive')">Archive</button>
        <button type="button" class="bg-[#ee6257] px-3 text-xs font-semibold text-white" @click="act('Delete')">Delete</button>
      </template>
    </SwipeActions>
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
