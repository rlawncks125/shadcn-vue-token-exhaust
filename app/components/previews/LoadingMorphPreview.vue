<script setup lang="ts">
import type { LoadingMorphState } from '#registry/default/loading-morph/LoadingMorph.vue'
import LoadingMorph from '#registry/default/loading-morph/LoadingMorph.vue'

const props = withDefaults(defineProps<{ result?: 'success' | 'error'; delay?: number; resetAfter?: number }>(), { result: 'success', delay: 1200, resetAfter: 0 })
const state = ref<LoadingMorphState>('idle')
let taskTimer: ReturnType<typeof setTimeout> | undefined
function run() {
  if (taskTimer) clearTimeout(taskTimer)
  state.value = 'loading'
  taskTimer = setTimeout(() => { state.value = props.result }, props.delay)
}
onBeforeUnmount(() => { if (taskTimer) clearTimeout(taskTimer) })
</script>

<template>
  <div class="text-center">
    <LoadingMorph v-model="state" :reset-after="resetAfter" @press="run" />
    <p class="mt-5 text-xs text-black/40">State · <span class="font-mono">{{ state }}</span></p>
  </div>
</template>
