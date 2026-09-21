<script setup lang="ts">
import { ref } from 'vue'
import LiquidToggle from '../../../registry/default/liquid-toggle/LiquidToggle.vue'

withDefaults(defineProps<{
  duration?: number
  color?: string
  disabled?: boolean
}>(), {
  duration: 420,
  color: 'var(--registry-accent, #d9ff57)',
  disabled: false,
})

const enabled = ref(true)
const updates = ref(0)
</script>

<template>
  <div class="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.45)] sm:p-8">
    <div class="mb-8 flex items-start justify-between gap-5">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Motion preferences</p>
        <h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em]">Ambient interface</h3>
      </div>
      <span class="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-medium text-black/45">Live</span>
    </div>
    <div class="rounded-2xl border border-black/10 bg-black/[0.025] p-5">
      <LiquidToggle v-model="enabled" label="Enable ambient motion" :duration="duration" :color="color" :disabled="disabled" @change="updates++" />
      <p class="mt-3 max-w-xs text-xs leading-5 text-black/45">Soft transitions and spatial cues follow your interface activity.</p>
    </div>
    <div class="mt-5 flex items-center justify-between text-xs text-black/40">
      <span data-testid="liquid-state">{{ enabled ? 'Motion enabled' : 'Motion paused' }}</span>
      <span>{{ updates }} changes</span>
    </div>
  </div>
</template>
