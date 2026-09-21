<script setup lang="ts">
import { ref } from 'vue'
import AnimatedTimeline, { type AnimatedTimelineItem } from '../../../registry/default/animated-timeline/AnimatedTimeline.vue'

const props = withDefaults(defineProps<{
  duration?: number
  autoplay?: boolean
  interval?: number
  loop?: boolean
  paused?: boolean
  pauseOnHover?: boolean
}>(), { duration: 520, autoplay: true, interval: 2400, loop: true, paused: false, pauseOnHover: true })

const items: AnimatedTimelineItem[] = [
  { id: 'brief', title: 'Define the brief', description: 'Align the team around one measurable outcome.', meta: 'Done' },
  { id: 'system', title: 'Shape the system', description: 'Turn constraints into reusable decisions.', meta: 'Active' },
  { id: 'review', title: 'Team review', description: 'Unavailable until the system is approved.', meta: 'Blocked', disabled: true },
  { id: 'ship', title: 'Ship and learn', description: 'Release, observe and carry insight forward.', meta: 'Next' },
]

const selected = ref('system')
const message = ref('Shape the system is active.')
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#ebeae4] p-6 sm:min-h-[560px] sm:p-10">
    <div class="w-full max-w-xl rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.45)] sm:p-7">
      <p class="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Launch sequence</p>
      <AnimatedTimeline v-model="selected" :items="items" :duration="duration" :autoplay="autoplay" :interval="interval" :loop="loop" :paused="paused" :pause-on-hover="pauseOnHover" @change="(item, _index, source) => message = `${item.title} selected via ${source}.`" />
      <p data-testid="timeline-status" class="mt-5 border-t border-border pt-4 text-xs text-muted-foreground" aria-live="polite">{{ message }}</p>
    </div>
  </div>
</template>
