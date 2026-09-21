<script setup lang="ts">
import { ref } from 'vue'
import AnimatedActionSheet, { type AnimatedActionSheetAction, type AnimatedActionSheetCloseSource } from '#registry/default/animated-action-sheet/AnimatedActionSheet.vue'

const props = withDefaults(defineProps<{
  duration?: number
  closeOnBackdrop?: boolean
  closeOnSelect?: boolean
  lockScroll?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  duration: 280,
  closeOnBackdrop: true,
  closeOnSelect: true,
  lockScroll: true,
  safeArea: true,
  disabled: false,
})

const open = ref(false)
const status = ref('Choose a collection to share or manage.')
const actions: AnimatedActionSheetAction[] = [
  { id: 'share', label: 'Share collection', description: 'Send a private link', icon: 'SH' },
  { id: 'offline', label: 'Save for offline', description: 'Keep all 18 field notes on this device', icon: 'DL' },
  { id: 'duplicate', label: 'Duplicate collection', description: 'Create an editable copy', icon: 'CP' },
  { id: 'archive', label: 'Archive collection', description: 'Move it out of your active library', icon: 'AR', destructive: true },
]

function onSelect(action: AnimatedActionSheetAction) {
  status.value = `${action.label} selected.`
}

function onClose(source: AnimatedActionSheetCloseSource) {
  if (source !== 'select') status.value = `Action sheet closed by ${source}.`
}
</script>

<template>
  <section data-testid="animated-action-sheet-preview" class="relative flex min-h-[520px] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[30px] border border-black/10 bg-[#e8e3d6] p-5 text-[#1c1d1a] sm:min-h-[580px] sm:p-10">
    <div class="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_15%,#d9ff57_0,transparent_24%),radial-gradient(circle_at_85%_85%,#e4633f_0,transparent_28%)]" />
    <article class="relative w-full max-w-sm rounded-[28px] border border-black/10 bg-[#f8f7f2]/90 p-5 shadow-[0_30px_90px_-50px_rgba(28,29,26,.7)] backdrop-blur sm:p-7">
      <div class="flex items-center justify-between">
        <span class="grid size-11 place-items-center rounded-2xl bg-[#1c1d1a] text-[10px] font-black text-[#d9ff57]">FLD</span>
        <span class="rounded-full bg-black/[0.05] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em]">18 notes</span>
      </div>
      <p class="mt-10 text-[9px] font-bold uppercase tracking-[.18em] text-black/38">Saved collection</p>
      <h3 class="mt-2 text-3xl font-semibold leading-none tracking-[-.06em]">Weathered<br>coastlines</h3>
      <p class="mt-4 text-xs leading-5 text-black/48">Field observations from the Atlantic edge, collected over seven slow days.</p>
      <button type="button" data-testid="action-sheet-open" class="mt-7 min-h-12 w-full rounded-2xl bg-[#e4633f] px-5 text-sm font-semibold text-white outline-none transition-transform active:scale-[.985] focus-visible:ring-4 focus-visible:ring-[#e4633f]/25 disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="open = true">Collection actions</button>
      <p data-testid="action-sheet-status" class="mt-4 min-h-5 text-center text-[10px] leading-5 text-black/42" role="status" aria-live="polite">{{ status }}</p>
    </article>

    <AnimatedActionSheet
      v-model="open"
      :actions="actions"
      title="Weathered coastlines"
      description="What would you like to do with this collection?"
      :duration="duration"
      :close-on-backdrop="closeOnBackdrop"
      :close-on-select="closeOnSelect"
      :lock-scroll="lockScroll"
      :safe-area="safeArea"
      :disabled="disabled"
      @select="onSelect"
      @close="onClose"
    />
  </section>
</template>
