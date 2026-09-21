<script setup lang="ts">
import type { ToastStackItem } from '#registry/default/toast-stack/ToastStack.vue'
import ToastStack from '#registry/default/toast-stack/ToastStack.vue'
const props = withDefaults(defineProps<{ defaultDuration?: number; maxVisible?: number; autoDismiss?: boolean; pauseOnHover?: boolean }>(), { defaultDuration: 4500, maxVisible: 3, autoDismiss: false, pauseOnHover: true })
const eventMessage = ref('Add or dismiss a notification')
let nextId = 3
const toasts = ref<ToastStackItem[]>([
  { id: '1', title: 'Component published', description: 'The registry JSON is ready.', tone: 'success', duration: 0 },
  { id: '2', title: 'Design changes saved', description: 'Everything is up to date.', tone: 'info', duration: 0, actionLabel: 'Undo' },
])
function add() {
  const tones = ['success', 'info', 'warning', 'error'] as const
  const id = String(nextId++)
  toasts.value = [{ id, title: `Notification ${id}`, description: 'A new event just arrived.', tone: tones[Number(id) % tones.length], duration: props.autoDismiss ? undefined : 0 }, ...toasts.value]
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="mb-4 flex items-center justify-between"><Button size="sm" @click="add">Add notification</Button><span class="text-xs text-black/40">{{ toasts.length }} total</span></div>
    <ToastStack v-model="toasts" inline :default-duration="defaultDuration" :max-visible="maxVisible" :pause-on-hover="pauseOnHover" @dismiss="item => eventMessage = `Dismissed: ${item.title}`" @action="item => eventMessage = `Action: ${item.title}`" />
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ eventMessage }}</p>
  </div>
</template>
