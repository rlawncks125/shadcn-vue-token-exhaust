<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileActionBar from '#registry/default/animated-mobile-action-bar/AnimatedMobileActionBar.vue'
withDefaults(defineProps<{ duration?: number, safeArea?: boolean, showClose?: boolean, loading?: boolean, disabled?: boolean }>(), { duration: 260, safeArea: true, showClose: true, loading: false, disabled: false })
const open = ref(true)
const status = ref('Ready to reserve.')
</script>

<template>
  <section class="min-h-[560px] w-full max-w-[760px] overflow-hidden rounded-[30px] border border-black/10 bg-[#ddd7c9] p-5 sm:p-9">
    <p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/38">Field workshop</p><h3 class="mt-3 text-4xl font-semibold tracking-[-.06em]">Coastal archive walk.</h3><p class="mt-4 max-w-md text-sm leading-6 text-black/48">Saturday, 08:30 · Twelve places available.</p>
    <div class="mt-8 h-56 rounded-[24px] bg-[#68887a] p-5 text-white"><span class="font-mono text-[9px] opacity-50">ROUTE 04</span><p class="mt-28 text-xl font-semibold">North marker → Tide pools</p></div>
    <p data-testid="action-bar-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
    <button v-if="!open" type="button" class="mx-auto mt-3 block text-xs font-semibold" @click="open = true">Restore action bar</button>
    <AnimatedMobileActionBar v-model:open="open" title="$48 · 1 place" description="Free cancellation until Friday" primary-label="Reserve" secondary-label="Details" :duration="duration" :fixed="false" :safe-area="safeArea" :show-close="showClose" :loading="loading" :disabled="disabled" @primary="status = 'Reservation requested.'" @secondary="status = 'Details requested.'" @close="status = 'Action bar closed.'" />
  </section>
</template>
