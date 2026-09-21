<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface AnimatedListItem {
  id: string
  title: string
  description?: string
  meta?: string
  symbol?: string
}

const props = withDefaults(defineProps<{
  items: AnimatedListItem[]
  interval?: number
  maxVisible?: number
  paused?: boolean
  loop?: boolean
  live?: 'polite' | 'off'
}>(), { interval: 1600, maxVisible: 4, paused: false, loop: true, live: 'polite' })
const emit = defineEmits<{ select: [item: AnimatedListItem]; complete: [] }>()
const visibleCount = ref(1)
let timer: ReturnType<typeof setInterval> | undefined

const limit = computed(() => Math.max(1, Math.floor(props.maxVisible)))
const visibleItems = computed(() => {
  const end = Math.min(visibleCount.value, props.items.length)
  return props.items.slice(Math.max(0, end - limit.value), end)
})

function stop() { if (timer) clearInterval(timer); timer = undefined }
function start(reset = true) {
  stop()
  if (reset) visibleCount.value = Math.min(1, props.items.length)
  if (props.paused || props.items.length < 2) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    visibleCount.value = props.items.length
    return
  }
  timer = setInterval(() => {
    if (visibleCount.value < props.items.length) visibleCount.value += 1
    else if (props.loop) visibleCount.value = Math.min(1, props.items.length)
    else { stop(); emit('complete') }
  }, Math.max(300, Math.min(10000, props.interval)))
}

watch(() => props.items, () => start(), { deep: true })
watch(() => [props.interval, props.loop], () => start(false))
watch(() => props.paused, paused => paused ? stop() : start(false))
onMounted(() => start())
onBeforeUnmount(stop)
defineExpose({ restart: () => start() })
</script>

<template>
  <TransitionGroup
    tag="div"
    class="animated-list grid w-full max-w-[430px] gap-2.5"
    role="list"
    :aria-live="live"
    enter-active-class="transition-[opacity,transform] duration-360 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
    leave-active-class="transition-[opacity,transform] duration-360 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
    move-class="transition-transform duration-360 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
    enter-from-class="translate-y-3.5 scale-[.97] opacity-0"
    leave-to-class="-translate-y-2.5 scale-[.97] opacity-0"
  >
    <div v-for="item in visibleItems" :key="item.id" role="listitem">
      <button type="button" class="animated-list-item flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#1718141a] bg-[#ffffffc9] px-3.5 py-2.5 text-left [font:inherit] text-[#171814] shadow-[0_12px_30px_-24px_#17181480] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#171814]" @click="emit('select', item)">
        <slot name="item" :item="item">
          <span class="animated-list-symbol grid size-[38px] shrink-0 place-items-center rounded-xl bg-[#171814] text-[13px] font-bold text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">{{ item.symbol ?? item.title.slice(0, 1) }}</span>
          <span class="animated-list-copy grid min-w-0 flex-1 gap-[3px]"><strong class="truncate text-[13px]">{{ item.title }}</strong><small v-if="item.description" class="text-[11px] text-[#17181480]">{{ item.description }}</small></span>
          <span v-if="item.meta" class="animated-list-meta shrink-0 text-[11px] text-[#17181480]">{{ item.meta }}</span>
        </slot>
      </button>
    </div>
  </TransitionGroup>
</template>
