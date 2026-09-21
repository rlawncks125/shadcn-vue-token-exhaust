<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  tone?: 'lime' | 'blue' | 'orange'
  compact?: boolean
}>(), {
  label: 'All systems operational',
  tone: 'lime',
  compact: false,
})

const tones = {
  lime: { dot: 'bg-lime-400', ring: 'bg-lime-400/35', text: 'text-lime-950', shell: 'bg-lime-50 border-lime-200' },
  blue: { dot: 'bg-blue-500', ring: 'bg-blue-500/30', text: 'text-blue-950', shell: 'bg-blue-50 border-blue-200' },
  orange: { dot: 'bg-orange-500', ring: 'bg-orange-500/30', text: 'text-orange-950', shell: 'bg-orange-50 border-orange-200' },
}
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border font-medium"
    :class="[tones[props.tone].shell, tones[props.tone].text, compact ? 'gap-2 px-3 py-1.5 text-xs' : 'gap-2.5 px-4 py-2.5 text-sm']"
    role="status"
  >
    <span class="relative flex size-2.5">
      <span class="absolute inline-flex size-full animate-ping rounded-full" :class="tones[props.tone].ring" />
      <span class="relative inline-flex size-2.5 rounded-full" :class="tones[props.tone].dot" />
    </span>
    {{ label }}
  </div>
</template>
