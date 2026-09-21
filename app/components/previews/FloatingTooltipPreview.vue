<script setup lang="ts">
import { ref } from 'vue'
import FloatingTooltip from '../../../registry/default/floating-tooltip/FloatingTooltip.vue'

withDefaults(defineProps<{
  placement?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  duration?: number
  disabled?: boolean
}>(), {
  placement: 'top',
  delay: 180,
  duration: 220,
  disabled: false,
})

const message = ref('Hover or focus an annotation.')
</script>

<template>
  <div class="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border bg-[#201d35] p-8 text-white sm:min-h-[560px]">
    <section class="w-full max-w-md">
      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4b5fd]">Signal report · 07</p>
      <h3 class="mt-4 text-4xl font-semibold tracking-[-0.05em]">Clarity compounds.</h3>
      <p class="mt-5 text-sm leading-7 text-white/55">Small pieces of context can make a dense interface feel immediate. Keep them close to the decision, but out of the way.</p>
      <div class="mt-10 flex flex-wrap gap-3">
        <FloatingTooltip text="Updated 12 minutes ago" :placement="placement" :delay="delay" :duration="duration" :disabled="disabled" @open="message = 'Freshness tooltip opened.'" @close="message = 'Tooltip closed.'">
          <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs group-hover:bg-white/10 group-focus-visible:ring-2 group-focus-visible:ring-[#c4b5fd]">Freshness</span>
        </FloatingTooltip>
        <FloatingTooltip :placement="placement" :delay="delay" :duration="duration" :disabled="disabled" @open="message = 'Confidence tooltip opened.'" @close="message = 'Tooltip closed.'">
          <span class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs group-hover:bg-white/10 group-focus-visible:ring-2 group-focus-visible:ring-[#c4b5fd]">Confidence · 94%</span>
          <template #content>Based on 1,240 verified events</template>
        </FloatingTooltip>
      </div>
      <p data-testid="tooltip-status" class="mt-8 text-xs text-white/35" aria-live="polite">{{ message }}</p>
    </section>
  </div>
</template>
