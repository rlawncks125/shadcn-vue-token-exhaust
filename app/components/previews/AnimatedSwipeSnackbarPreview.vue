<script setup lang="ts">
import { ref } from 'vue'
import AnimatedSwipeSnackbar, { type AnimatedSwipeSnackbarDismissSource, type AnimatedSwipeSnackbarTone } from '#registry/default/animated-swipe-snackbar/AnimatedSwipeSnackbar.vue'

const props = withDefaults(defineProps<{
  tone?: AnimatedSwipeSnackbarTone
  timeout?: number
  duration?: number
  swipeThreshold?: number
  closeOnAction?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), { tone: 'success', timeout: 5000, duration: 260, swipeThreshold: 84, closeOnAction: true, safeArea: true, disabled: false })

const open = ref(false)
const status = ref('Changes are saved locally.')
function show() {
  open.value = true
  status.value = 'Snackbar shown. Swipe it sideways to dismiss.'
}
function onDismiss(source: AnimatedSwipeSnackbarDismissSource) {
  status.value = `Snackbar dismissed by ${source}.`
}
</script>

<template>
  <section data-testid="animated-swipe-snackbar-preview" class="relative flex min-h-[520px] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[30px] border border-black/10 bg-[#e7e3d7] p-5 text-[#1d1f1b] sm:min-h-[580px] sm:p-10">
    <div class="absolute inset-0 opacity-25 [background-image:linear-gradient(#1d1f1b18_1px,transparent_1px),linear-gradient(90deg,#1d1f1b18_1px,transparent_1px)] [background-size:26px_26px]" />
    <article class="relative w-full max-w-md rounded-[28px] bg-white/75 p-6 shadow-[0_32px_90px_-55px_rgba(29,31,27,.8)] backdrop-blur sm:p-8">
      <div class="flex items-center justify-between"><span class="grid size-11 place-items-center rounded-2xl bg-[#1d1f1b] text-[10px] font-black text-[#d9ff57]">SYNC</span><span class="text-[9px] font-bold uppercase tracking-[.15em] text-black/35">Offline workspace</span></div>
      <h3 class="mt-12 text-3xl font-semibold leading-none tracking-[-.06em]">Keep moving.<br>We saved your place.</h3>
      <p class="mt-4 text-xs leading-6 text-black/48">The snackbar stays out of the way, pauses when engaged, and leaves with a horizontal swipe.</p>
      <button type="button" data-testid="swipe-snackbar-open" class="mt-7 min-h-12 w-full rounded-2xl bg-[#e4633f] text-sm font-semibold text-white outline-none active:scale-[.985] focus-visible:ring-4 focus-visible:ring-[#e4633f]/25 disabled:opacity-40" :disabled="disabled" @click="show">Save changes</button>
      <p data-testid="swipe-snackbar-status" class="mt-4 min-h-5 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
    </article>
    <AnimatedSwipeSnackbar v-model="open" message="Your field notes are available offline." title="Changes saved" action-label="Undo" :tone="tone" :timeout="timeout" :duration="duration" :swipe-threshold="swipeThreshold" :close-on-action="closeOnAction" :safe-area="safeArea" :disabled="disabled" @action="status = 'Save was undone.'" @dismiss="onDismiss" />
  </section>
</template>
