<script setup lang="ts">
import { ref } from 'vue'
import PullToRefresh from '#registry/default/pull-to-refresh/PullToRefresh.vue'

withDefaults(defineProps<{
  threshold?: number
  maxPull?: number
  resistance?: number
  duration?: number
  disabled?: boolean
}>(), {
  threshold: 64,
  maxPull: 112,
  resistance: 0.55,
  duration: 280,
  disabled: false,
})

interface InboxItem {
  id: number
  initials: string
  sender: string
  subject: string
  preview: string
  time: string
  tone: string
  unread?: boolean
}

const refreshing = ref(false)
const status = ref('Pull down or use the refresh button')
const refreshCount = ref(0)
const rows = ref<InboxItem[]>([
  { id: 1, initials: 'AM', sender: 'Ari Mitchell', subject: 'Studio schedule', preview: 'The final review moved to Friday at ten.', time: '9:42', tone: 'bg-brand', unread: true },
  { id: 2, initials: 'NO', sender: 'Nori Okafor', subject: 'New field notes', preview: 'I added the references from yesterday.', time: '8:18', tone: 'bg-[#ffc7a8]', unread: true },
  { id: 3, initials: 'LS', sender: 'Lena Soto', subject: 'Re: Spring edition', preview: 'These layouts are ready for a type pass.', time: 'Tue', tone: 'bg-[#bdd7ff]' },
  { id: 4, initials: 'WK', sender: 'Workshop', subject: 'Your order shipped', preview: 'Track package 1048 from the dispatch desk.', time: 'Mon', tone: 'bg-[#e4d4ff]' },
  { id: 5, initials: 'RB', sender: 'Rowan Bell', subject: 'Weekend reading', preview: 'Three essays worth keeping for later.', time: 'Sun', tone: 'bg-[#ffd6de]' },
])

const incoming = [
  { initials: 'TH', sender: 'Theo Hart', subject: 'Fresh from the press', preview: 'A new proof just landed in the shared folder.', tone: 'bg-[#bff2df]' },
  { initials: 'JM', sender: 'June Malik', subject: 'One more detail', preview: 'I left a quick note on the opening spread.', tone: 'bg-[#ffe59a]' },
  { initials: 'CS', sender: 'City Studio', subject: 'Today at the studio', preview: 'Doors open early for the material library.', tone: 'bg-[#c7d2fe]' },
]

async function refreshInbox() {
  status.value = 'Checking for new mail...'
  await new Promise(resolve => setTimeout(resolve, 900))
  const next = incoming[refreshCount.value % incoming.length]!
  refreshCount.value++
  rows.value.unshift({ ...next, id: Date.now() + refreshCount.value, time: 'Now', unread: true })
  status.value = `Inbox updated. 1 new message from ${next.sender}.`
}

function onPull(progress: number) {
  status.value = progress >= 1 ? 'Release to refresh' : `Pulling, ${Math.round(progress * 100)} percent`
}

function onRelease(ready: boolean) {
  status.value = ready ? 'Refreshing inbox...' : 'Pull a little farther to refresh'
}

function onCancel() {
  status.value = 'Refresh cancelled'
}
</script>

<template>
  <div class="w-full max-w-[390px] rounded-[34px] border border-black/10 bg-[#171814] p-2 shadow-[0_30px_80px_-35px_#000a]">
    <section class="flex h-[min(620px,78vh)] min-h-[480px] flex-col overflow-hidden rounded-[27px] bg-[#f4f1e9] text-[#171814]">
      <header class="relative z-20 shrink-0 border-b border-black/[.07] bg-[#f4f1e9]/95 px-5 pb-3 pt-4 backdrop-blur">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">
            <span class="size-2 rounded-full bg-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--registry-accent,#d9ff57)_25%,transparent)]" />
            Fieldwork
          </div>
          <button type="button" class="grid size-8 place-items-center rounded-full border border-black/10 bg-white/60 text-black/55" aria-label="Inbox options">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>
          </button>
        </div>
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="mb-0.5 text-[10px] font-medium text-black/40">Saturday, September 19</p>
            <h2 class="text-[30px] font-semibold leading-none tracking-[-.045em]">Inbox</h2>
          </div>
          <span class="rounded-full bg-[#171814] px-2.5 py-1 text-[10px] font-bold text-brand">{{ rows.filter(row => row.unread).length }} new</span>
        </div>
      </header>

      <PullToRefresh
        v-model:refreshing="refreshing"
        class="min-h-0 flex-1"
        :threshold="threshold"
        :max-pull="maxPull"
        :resistance="resistance"
        :duration="duration"
        :disabled="disabled"
        label="Refresh content"
        :on-refresh="refreshInbox"
        @pull="onPull"
        @release="onRelease"
        @cancel="onCancel"
      >
        <div class="px-3 py-3">
          <div class="mb-2 flex items-center justify-between px-2 text-[9px] font-semibold uppercase tracking-[.15em] text-black/35">
            <span>Primary</span>
            <span>{{ rows.length }} messages</span>
          </div>
          <TransitionGroup tag="div" class="grid gap-1.5" enter-from-class="-translate-y-3 opacity-0" enter-active-class="transition duration-500 ease-out motion-reduce:transition-none">
            <article v-for="row in rows" :key="row.id" class="group flex items-center gap-3 rounded-[18px] border border-black/[.06] bg-white/75 p-3 shadow-[0_8px_24px_-22px_#0008]">
              <div class="relative grid size-10 shrink-0 place-items-center rounded-[13px] text-[10px] font-bold" :class="row.tone">
                {{ row.initials }}
                <span v-if="row.unread" class="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-[#f4f1e9] bg-[#e4564a]" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <strong class="truncate text-[12px]" :class="row.unread ? 'font-bold' : 'font-medium'">{{ row.sender }}</strong>
                  <time class="shrink-0 text-[9px] text-black/35">{{ row.time }}</time>
                </div>
                <p class="truncate text-[11px] font-medium leading-4 text-black/70">{{ row.subject }}</p>
                <p class="truncate text-[10px] leading-4 text-black/38">{{ row.preview }}</p>
              </div>
            </article>
          </TransitionGroup>
          <p class="py-5 text-center text-[9px] font-medium uppercase tracking-[.16em] text-black/25">You are all caught up</p>
        </div>
      </PullToRefresh>

      <footer class="relative z-20 flex shrink-0 items-center justify-around border-t border-black/[.07] bg-[#f4f1e9]/95 px-5 py-3 text-black/35 backdrop-blur" aria-hidden="true">
        <span class="grid size-8 place-items-center rounded-full bg-[#171814] text-brand"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg></span>
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v16M4 12h16" /></svg>
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14M8 7V5h8v2m-9 0 1 12h8l1-12" /></svg>
      </footer>
    </section>
    <p data-testid="pull-to-refresh-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </div>
</template>
