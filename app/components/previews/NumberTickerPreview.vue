<script setup lang="ts">
import NumberTicker from '#registry/default/number-ticker/NumberTicker.vue'
const props = withDefaults(defineProps<{ value?: number; duration?: number; decimals?: number }>(), { value: 12840, duration: 1200, decimals: 0 })
const replay = ref(0)
</script>

<template>
  <button class="text-center" title="Replay animation" @click="replay++">
    <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">Monthly interactions</p>
    <NumberTicker :key="replay" :value="props.value" :duration="props.duration" :decimals="props.decimals" prefix="+" class="mt-3 block text-5xl font-semibold tracking-[-0.06em]" />
    <p class="mt-3 text-xs text-black/40">Click to replay</p>
  </button>
</template>
