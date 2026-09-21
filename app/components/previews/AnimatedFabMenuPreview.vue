<script setup lang="ts">
import { ref } from 'vue'
import AnimatedFabMenu, { type AnimatedFabMenuAction } from '#registry/default/animated-fab-menu/AnimatedFabMenu.vue'

withDefaults(defineProps<{
  direction?: 'up' | 'left'
  duration?: number
  closeOnSelect?: boolean
  disabled?: boolean
}>(), {
  direction: 'up',
  duration: 220,
  closeOnSelect: true,
  disabled: false,
})

const expanded = ref(false)
const status = ref('Expand the dial, then choose a capture action.')

const actions: AnimatedFabMenuAction[] = [
  { id: 'note', label: 'New note', icon: 'N' },
  { id: 'photo', label: 'Add photo', icon: 'P' },
  { id: 'audio', label: 'Record audio', icon: 'A' },
  { id: 'scan', label: 'Scan document', icon: 'S' },
]

const tiles = [
  { id: 1, title: 'Site visits', count: '18 notes' },
  { id: 2, title: 'Material samples', count: '6 photos' },
  { id: 3, title: 'Interview clips', count: '9 recordings' },
  { id: 4, title: 'Sketch archive', count: '24 pages' },
]

function onSelect(action: AnimatedFabMenuAction) {
  status.value = `${action.label} triggered from the speed dial.`
}

function onOpenChange(open: boolean) {
  if (open) status.value = 'Speed dial expanded. Use arrow keys to move through actions.'
}
</script>

<template>
  <div class="w-full max-w-[920px] overflow-hidden rounded-[30px] border border-[#20241e]/10 bg-[#e3ecdd] text-[#171814] shadow-[0_38px_110px_-68px_rgba(23,24,20,0.8)]">
    <div class="relative grid min-h-[430px] place-items-center overflow-hidden p-6 sm:p-10">
      <div class="w-full max-w-md">
        <p class="text-[9px] font-black uppercase tracking-[.2em] text-[#171814]/45">Field capture / Quick actions</p>
        <h2 class="mt-2 text-3xl font-semibold leading-[1] tracking-[-0.05em] sm:text-4xl">Collect without leaving the floor</h2>
        <p class="mt-4 max-w-sm text-xs leading-5 text-black/45">The floating dial keeps destructive and creative actions one thumb away while the grid stays calm.</p>
        <div class="mt-7 grid grid-cols-2 gap-3">
          <button
            v-for="tile in tiles"
            :key="tile.id"
            type="button"
            class="rounded-[20px] border border-black/[.07] bg-white/70 p-4 text-left outline-none transition-[background-color,transform] hover:bg-white focus-visible:ring-2 focus-visible:ring-black active:scale-[.99] motion-reduce:transition-none"
          >
            <strong class="block text-[13px] font-semibold">{{ tile.title }}</strong>
            <span class="mt-1 block text-[10px] text-black/40">{{ tile.count }}</span>
          </button>
        </div>
      </div>

      <AnimatedFabMenu
        v-model="expanded"
        class="bottom-6 right-6 sm:bottom-8 sm:right-8"
        :actions="actions"
        :direction="direction"
        :duration="duration"
        :close-on-select="closeOnSelect"
        :disabled="disabled"
        label="Capture"
        @select="onSelect"
        @open-change="onOpenChange"
      />
    </div>
    <p data-testid="fab-menu-preview-status" class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </div>
</template>
