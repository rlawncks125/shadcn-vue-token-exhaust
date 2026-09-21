<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

export interface ToastStackItem {
  id: string
  title: string
  description?: string
  tone?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actionLabel?: string
}

const props = withDefaults(defineProps<{
  maxVisible?: number
  defaultDuration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  pauseOnHover?: boolean
  dismissOnAction?: boolean
  inline?: boolean
  label?: string
}>(), {
  maxVisible: 4,
  defaultDuration: 4500,
  position: 'top-right',
  pauseOnHover: true,
  dismissOnAction: true,
  inline: false,
  label: 'Notifications',
})
const model = defineModel<ToastStackItem[]>({ default: () => [] })
const emit = defineEmits<{ dismiss: [item: ToastStackItem]; action: [item: ToastStackItem] }>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()
let mounted = false
const visible = computed(() => model.value.slice(0, Math.max(1, Math.floor(props.maxVisible))))

function clear(id: string) {
  const timer = timers.get(id)
  if (timer) clearTimeout(timer)
  timers.delete(id)
}
function dismiss(item: ToastStackItem) {
  clear(item.id)
  model.value = model.value.filter(candidate => candidate.id !== item.id)
  emit('dismiss', item)
}
function schedule(item: ToastStackItem) {
  clear(item.id)
  const duration = item.duration ?? props.defaultDuration
  if (duration > 0) timers.set(item.id, setTimeout(() => dismiss(item), Math.max(500, duration)))
}
function syncTimers() {
  const ids = new Set(visible.value.map(item => item.id))
  for (const id of timers.keys()) if (!ids.has(id)) clear(id)
  for (const item of visible.value) if (!timers.has(item.id)) schedule(item)
}
function act(item: ToastStackItem) {
  emit('action', item)
  if (props.dismissOnAction) {
    clear(item.id)
    model.value = model.value.filter(candidate => candidate.id !== item.id)
  }
}

watch([
  () => model.value.map(item => `${item.id}:${item.duration ?? 'default'}`).join('|'),
  () => props.defaultDuration,
  () => props.maxVisible,
], () => { if (mounted) syncTimers() })
onMounted(() => { mounted = true; syncTimers() })
onBeforeUnmount(() => { mounted = false; for (const id of timers.keys()) clear(id) })
</script>

<template>
  <div
    class="toast-stack z-[80] grid gap-2.5 pointer-events-none"
    :class="[
      `position-${position}`,
      { 'is-inline': inline },
      inline ? 'relative inset-auto w-full max-w-[390px]' : 'fixed w-[min(390px,calc(100vw-32px))]',
      !inline && position === 'top-left' ? 'top-[18px] left-[18px]' : '',
      !inline && position === 'top-right' ? 'top-[18px] right-[18px]' : '',
      !inline && position === 'bottom-left' ? 'bottom-[18px] left-[18px]' : '',
      !inline && position === 'bottom-right' ? 'right-[18px] bottom-[18px]' : '',
    ]"
    role="region" :aria-label="label"
  >
    <TransitionGroup
      enter-active-class="[transition:opacity_300ms,transform_350ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      leave-active-class="[transition:opacity_300ms,transform_350ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      enter-from-class="translate-x-5 scale-[.96] opacity-0"
      leave-to-class="translate-x-5 scale-[.96] opacity-0"
      move-class="[transition:opacity_300ms,transform_350ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
    >
      <article
        v-for="item in visible" :key="item.id"
        class="toast-item flex min-h-[70px] items-center gap-3 rounded-[17px] border border-[#1718141f] bg-[#fffffff2] p-3 text-[#171814] shadow-[0_18px_50px_-28px_#0009] pointer-events-auto"
        :class="`tone-${item.tone ?? 'info'}`"
        :role="item.tone === 'error' ? 'alert' : 'status'"
        @mouseenter="pauseOnHover && clear(item.id)" @mouseleave="pauseOnHover && schedule(item)"
      >
        <span
          class="toast-mark w-1 self-stretch rounded-full"
          :class="{
            'bg-[#60a5fa]': !item.tone || item.tone === 'info',
            'bg-[#84cc16]': item.tone === 'success',
            'bg-[#f59e0b]': item.tone === 'warning',
            'bg-[#ef4444]': item.tone === 'error',
          }"
          aria-hidden="true"
        />
        <div class="toast-copy grid min-w-0 flex-1 gap-[3px]"><strong class="text-[13px]">{{ item.title }}</strong><p v-if="item.description" class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#1718148c]">{{ item.description }}</p></div>
        <button v-if="item.actionLabel" type="button" class="toast-action cursor-pointer border-0 bg-transparent [font:inherit] text-[11px] font-bold text-[#171814] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814]" @click="act(item)">{{ item.actionLabel }}</button>
        <button type="button" class="toast-close grid size-[26px] cursor-pointer place-items-center rounded-full border-0 bg-transparent [font:inherit] text-lg text-[#17181480] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814]" :aria-label="`Dismiss ${item.title}`" @click="dismiss(item)">×</button>
      </article>
    </TransitionGroup>
  </div>
</template>
