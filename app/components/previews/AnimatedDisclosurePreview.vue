<script setup lang="ts">
import { ref } from 'vue'
import AnimatedDisclosure from '../../../registry/default/animated-disclosure/AnimatedDisclosure.vue'

const props = withDefaults(defineProps<{
  duration?: number
  easing?: string
  lazy?: boolean
  unmountOnClose?: boolean
  disabled?: boolean
}>(), {
  duration: 320,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  lazy: false,
  unmountOnClose: false,
  disabled: false,
})

const items = [
  { title: 'How does measured motion work?', copy: 'The panel reads its rendered content height, animates between exact pixel values, then returns to auto height after opening.' },
  { title: 'What happens when content changes?', copy: 'An open panel uses natural document flow, so asynchronous text, validation messages or responsive wrapping can grow without clipping.' },
  { title: 'Is reduced motion respected?', copy: 'Yes. Motion preferences skip interpolation while preserving the same disclosure state, focus behavior and accessible relationships.' },
]

const openStates = ref([true, false, false])
const message = ref('The first disclosure is open.')

function setAll(value: boolean) {
  openStates.value = openStates.value.map(() => value)
  message.value = value ? 'Opening all disclosures.' : 'Closing all disclosures.'
}
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col justify-center overflow-hidden rounded-2xl border border-border bg-card/35 p-5 sm:min-h-[560px] sm:p-10">
    <div class="mx-auto w-full max-w-2xl">
      <div class="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Disclosure set</p>
          <h3 class="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">Details, on demand.</h3>
        </div>
        <div class="flex gap-2">
          <button type="button" class="shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-[11px] font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15" @click="setAll(true)">Open all</button>
          <button type="button" class="shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3 py-2 text-[11px] font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15" @click="setAll(false)">Close all</button>
        </div>
      </div>

      <div class="space-y-2.5">
        <AnimatedDisclosure
          v-for="(item, index) in items"
          :key="item.title"
          v-model="openStates[index]"
          :title="item.title"
          :duration="duration"
          :easing="easing"
          :lazy="lazy"
          :unmount-on-close="unmountOnClose"
          :disabled="disabled"
          @after-enter="message = `${item.title} opened.`"
          @after-leave="message = `${item.title} closed.`"
        >
          <p>{{ item.copy }}</p>
        </AnimatedDisclosure>
      </div>

      <p data-testid="disclosure-status" class="mt-4 min-h-5 text-xs text-muted-foreground" aria-live="polite">{{ message }}</p>
    </div>
  </div>
</template>
