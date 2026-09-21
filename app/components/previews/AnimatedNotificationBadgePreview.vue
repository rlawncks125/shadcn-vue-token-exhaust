<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedNotificationBadge from '#registry/default/animated-notification-badge/AnimatedNotificationBadge.vue'

interface InboxItem {
  id: number
  sender: string
  subject: string
  preview: string
  time: string
  unread: boolean
  initials: string
  tone: string
}

const props = withDefaults(defineProps<{
  max?: number
  showZero?: boolean
  pulse?: boolean
  duration?: number
  color?: string
  disabled?: boolean
}>(), {
  max: 99,
  showZero: false,
  pulse: true,
  duration: 420,
  color: '#e84b3c',
  disabled: false,
})

const messages = ref<InboxItem[]>([
  { id: 1, sender: 'Mara Bell', subject: 'The autumn issue is ready', preview: 'Final proofs are on your desk for a last look.', time: '09:42', unread: true, initials: 'MB', tone: '#d8ff65' },
  { id: 2, sender: 'Studio North', subject: 'Three notes on the cover', preview: 'We tightened the crop and softened the masthead.', time: '08:16', unread: true, initials: 'SN', tone: '#ffd6c9' },
  { id: 3, sender: 'Eli Ward', subject: 'Field notes from Kyoto', preview: 'The photo essay came in just before sunrise.', time: 'Yesterday', unread: false, initials: 'EW', tone: '#c9dcff' },
])
const additions = [
  { sender: 'Archive Desk', subject: 'A new story was submitted', preview: 'A quiet study of public libraries after dark.', initials: 'AD', tone: '#ead7ff' },
  { sender: 'Nora Chen', subject: 'Layout review complete', preview: 'All twelve spreads are ready for your approval.', initials: 'NC', tone: '#c9f2df' },
  { sender: 'Print House', subject: 'Press slot confirmed', preview: 'Your production window is reserved for Friday.', initials: 'PH', tone: '#ffe4a8' },
]

let nextId = 4
const status = ref('Two unread messages in your editorial inbox.')
const unreadCount = computed(() => messages.value.filter(message => message.unread).length)

function addNotification() {
  const template = additions[(nextId - 4) % additions.length]!
  const item: InboxItem = {
    id: nextId++,
    ...template,
    time: 'Now',
    unread: true,
  }
  messages.value = [item, ...messages.value]
  status.value = `New message from ${item.sender}. ${unreadCount.value} unread.`
}

function markRead(item: InboxItem) {
  if (!item.unread) {
    status.value = `${item.subject} is already read.`
    return
  }
  item.unread = false
  status.value = `Marked ${item.subject} as read. ${unreadCount.value} unread.`
}

function markAllRead() {
  if (unreadCount.value === 0) return
  messages.value.forEach(message => { message.unread = false })
  status.value = 'All messages marked as read.'
}

function handleTriggerClick() {
  status.value = unreadCount.value === 0
    ? 'Inbox opened. You are all caught up.'
    : `Inbox opened with ${unreadCount.value} unread message${unreadCount.value === 1 ? '' : 's'}.`
}
</script>

<template>
  <section
    data-testid="animated-notification-badge-preview"
    class="w-full max-w-4xl overflow-hidden rounded-[28px] border border-black/10 bg-[#ece9df] text-[#20221d] shadow-[0_34px_90px_-50px_rgba(34,39,28,0.5)]"
  >
    <header class="border-b border-black/10 bg-[#20231d] px-5 py-5 text-white sm:px-7 sm:py-6">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2.5">
            <span class="size-2 rounded-full bg-[var(--registry-accent,#d8ff65)]" aria-hidden="true" />
            <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">The Sunday Edit</p>
          </div>
          <h3 class="mt-2 text-2xl font-semibold tracking-[-0.045em] sm:text-[28px]">Editorial inbox</h3>
        </div>

        <AnimatedNotificationBadge
          data-testid="notification-trigger"
          :count="unreadCount"
          :max="max"
          :show-zero="showZero"
          :pulse="pulse"
          :duration="duration"
          :color="color"
          :disabled="disabled"
          aria-label="Open editorial notifications"
          class="shrink-0"
          @click="handleTriggerClick"
        >
          <svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </AnimatedNotificationBadge>
      </div>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[11px] uppercase tracking-[0.16em] text-white/35">Sunday, 20 September</p>
          <p class="mt-1 text-sm text-white/65">Stories, notes, and production updates.</p>
        </div>
        <button
          type="button"
          data-testid="add-notification"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--registry-accent,#d8ff65)] px-4 text-xs font-bold text-[#20231d] outline-none transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#20231d] active:translate-y-0 motion-reduce:transition-none"
          @click="addNotification"
        >
          <svg viewBox="0 0 20 20" class="size-4" fill="none" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
          Add notification
        </button>
      </div>
    </header>

    <div class="grid min-w-0 md:grid-cols-[190px_minmax(0,1fr)]">
      <aside class="border-b border-black/10 px-5 py-5 md:border-b-0 md:border-r md:px-6 md:py-7">
        <div class="flex items-center justify-between gap-4 md:block">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Unread</p>
            <p data-testid="notification-count" class="mt-1 text-4xl font-semibold leading-none tracking-[-0.07em] tabular-nums">{{ unreadCount }}</p>
          </div>
          <button
            type="button"
            data-testid="mark-all-read"
            class="rounded-full border border-black/15 bg-white/45 px-3 py-2 text-[11px] font-semibold outline-none transition-colors hover:not-disabled:border-black/30 hover:not-disabled:bg-white focus-visible:ring-2 focus-visible:ring-black/50 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none md:mt-7 md:w-full"
            :disabled="unreadCount === 0"
            @click="markAllRead"
          >
            Mark all read
          </button>
        </div>
        <div class="mt-5 hidden border-t border-black/10 pt-5 md:block">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-black/30">Folders</p>
          <p class="mt-3 text-xs font-semibold">Editorial</p>
          <p class="mt-2 text-xs text-black/40">Production</p>
          <p class="mt-2 text-xs text-black/40">Archive</p>
        </div>
      </aside>

      <div class="min-w-0 bg-[#f8f6ef] p-3 sm:p-4 md:p-5">
        <div data-testid="notification-list" class="overflow-hidden rounded-2xl border border-black/8 bg-white/70">
          <button
            v-for="item in messages"
            :key="item.id"
            type="button"
            :data-testid="`notification-item-${item.id}`"
            class="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-black/8 px-3.5 py-4 text-left outline-none transition-colors last:border-b-0 hover:bg-white focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/50 motion-reduce:transition-none sm:gap-4 sm:px-5"
            :class="item.unread ? 'bg-white' : 'bg-transparent opacity-65'"
            :aria-label="`${item.unread ? 'Mark as read' : 'Read'}: ${item.subject}`"
            @click="markRead(item)"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold text-black/65 sm:size-10" :style="{ backgroundColor: item.tone }" aria-hidden="true">{{ item.initials }}</span>
            <span class="min-w-0">
              <span class="flex items-center gap-2">
                <span class="truncate text-xs font-bold sm:text-sm">{{ item.sender }}</span>
                <span v-if="item.unread" class="size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: color }" aria-hidden="true" />
              </span>
              <span class="mt-0.5 block truncate text-xs font-semibold text-black/70">{{ item.subject }}</span>
              <span class="mt-1 block truncate text-[11px] text-black/40 sm:text-xs">{{ item.preview }}</span>
            </span>
            <span class="pt-0.5 text-[10px] font-medium tabular-nums text-black/35">{{ item.time }}</span>
          </button>
        </div>

        <p data-testid="notification-preview-status" class="min-h-8 px-2 pt-3 text-[11px] leading-5 text-black/40" role="status" aria-live="polite">{{ status }}</p>
      </div>
    </div>
  </section>
</template>
