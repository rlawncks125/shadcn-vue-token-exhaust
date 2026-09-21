<script setup lang="ts">
import { computed, ref } from 'vue'
import ConnectionBeam from '../../../registry/default/connection-beam/ConnectionBeam.vue'

withDefaults(defineProps<{
  duration?: number
  beamWidth?: number
  color?: string
  paused?: boolean
  disabled?: boolean
}>(), {
  duration: 4,
  beamWidth: 1.8,
  color: 'var(--registry-accent, #d9ff57)',
  paused: false,
  disabled: false,
})

const nodes = [
  { id: 'input', x: 14, y: 28, label: 'Input' },
  { id: 'router', x: 48, y: 52, label: 'Router' },
  { id: 'store', x: 84, y: 24, label: 'Store' },
  { id: 'edge', x: 82, y: 76, label: 'Edge' },
]
const connections = [
  { from: 'input', to: 'router' },
  { from: 'router', to: 'store' },
  { from: 'router', to: 'edge' },
]
const selected = ref('router')
const selectedLabel = computed(() => nodes.find(node => node.id === selected.value)?.label ?? '')
</script>

<template>
  <div class="w-full max-w-2xl">
    <ConnectionBeam v-model="selected" :nodes="nodes" :connections="connections" :duration="duration" :beam-width="beamWidth" :color="color" :paused="paused" :disabled="disabled">
      <template #node="{ node, selected: active }">
        <span class="grid size-10 place-items-center rounded-xl text-[10px] font-semibold uppercase tracking-tight" :class="active ? 'bg-[var(--connection-color)] text-[#171814]' : 'bg-white/10 text-white'">{{ node.label.slice(0, 2) }}</span>
      </template>
      <template #default>
        <div class="flex items-end justify-between gap-4">
          <div><p class="text-[10px] uppercase tracking-[0.18em] text-white/35">Signal route</p><p data-testid="beam-selection" class="mt-1 text-sm font-medium text-white">{{ selectedLabel }} selected</p></div>
          <span class="font-mono text-[10px] text-white/35">03 live connections</span>
        </div>
      </template>
    </ConnectionBeam>
    <p class="mt-4 px-2 text-xs leading-5 text-black/40">Select a node or use Arrow keys to inspect the active signal path.</p>
  </div>
</template>
