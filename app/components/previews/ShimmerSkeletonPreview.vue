<script setup lang="ts">
import { ref, watch } from 'vue'
import ShimmerSkeleton from '../../../registry/default/shimmer-skeleton/ShimmerSkeleton.vue'

const props = withDefaults(defineProps<{
  loading?: boolean
  duration?: number
  paused?: boolean
  pauseOnHover?: boolean
  lines?: number
  avatar?: boolean
}>(), {
  loading: true,
  duration: 1600,
  paused: false,
  pauseOnHover: false,
  lines: 3,
  avatar: true,
})

const localLoading = ref(props.loading)
const message = ref('Profile data is loading.')

watch(() => props.loading, value => (localLoading.value = value))
watch(localLoading, value => (message.value = value ? 'Profile data is loading.' : 'Profile data is ready.'))
</script>

<template>
  <div class="flex min-h-[500px] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-border bg-[#ebeae4] p-6 sm:min-h-[560px] sm:p-10">
    <ShimmerSkeleton
      :loading="localLoading"
      :duration="duration"
      :paused="paused"
      :pause-on-hover="pauseOnHover"
      :lines="lines"
      :avatar="avatar"
      class="w-full max-w-md shadow-[0_24px_70px_-40px_rgba(0,0,0,0.45)]"
      label="Loading member profile"
      @loaded="message = 'Profile reveal completed.'"
    >
      <div class="p-6">
        <div class="flex items-center gap-4">
          <div class="grid size-12 shrink-0 place-items-center rounded-full bg-[#171814] text-sm font-semibold text-white">AK</div>
          <div>
            <h3 class="font-semibold tracking-[-0.02em] text-foreground">Alex Kim</h3>
            <p class="mt-1 text-xs text-muted-foreground">Product designer · Seoul</p>
          </div>
          <span class="ml-auto size-2 rounded-full bg-[#9cbd19] shadow-[0_0_10px_#9cbd19]" />
        </div>
        <p class="mt-6 text-sm leading-6 text-muted-foreground">Building calm tools for teams that care about the details.</p>
      </div>
    </ShimmerSkeleton>

    <div class="flex items-center gap-3">
      <button type="button" class="rounded-full bg-[#171814] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15" @click="localLoading = !localLoading">{{ localLoading ? 'Show content' : 'Reload' }}</button>
      <p data-testid="shimmer-status" class="text-xs text-black/45" aria-live="polite">{{ message }}</p>
    </div>
  </div>
</template>
