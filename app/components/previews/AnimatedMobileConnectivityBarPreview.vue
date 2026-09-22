<script setup lang="ts">
import { ref, watch } from 'vue'
import AnimatedMobileConnectivityBar, { type AnimatedMobileConnectivityState } from '#registry/default/animated-mobile-connectivity-bar/AnimatedMobileConnectivityBar.vue'
const props = withDefaults(defineProps<{ state?: AnimatedMobileConnectivityState, autoHide?: number, duration?: number, safeArea?: boolean, dismissible?: boolean, disabled?: boolean }>(), { state: 'offline', autoHide: 2400, duration: 240, safeArea: true, dismissible: true, disabled: false })
const open = ref(true)
const status = ref('Offline mode active.')
watch(() => props.state, () => { open.value = true })
function retry() { status.value = 'Retry requested.' }
</script>
<template>
  <section class="min-h-[560px] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#dad4c7] p-5 sm:p-9">
    <AnimatedMobileConnectivityBar v-model:open="open" :state="state" :auto-hide="autoHide" :duration="duration" :fixed="false" :safe-area="safeArea" :dismissible="dismissible" :disabled="disabled" @retry="retry" @dismiss="status = 'Status dismissed.'" @hidden="status = 'Online status hidden.'" />
    <button v-if="!open" type="button" class="mx-auto block min-h-11 text-xs font-semibold" @click="open = true">Show connectivity status</button>
    <div class="mt-8 rounded-[28px] bg-[#f7f2e8] p-6"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Offline field notes</p><h3 class="mt-3 text-4xl font-semibold tracking-[-.06em]">North trail index.</h3><div class="mt-10 space-y-3"><div v-for="i in 3" :key="i" class="rounded-[18px] border border-black/8 bg-white/55 p-4"><span class="text-xs font-semibold">Observation {{ String(i).padStart(2, '0') }}</span><div class="mt-3 h-1.5 w-2/3 rounded-full bg-black/8" /></div></div></div>
    <p data-testid="connectivity-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
  </section>
</template>
