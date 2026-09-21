<script setup lang="ts">
import { computed, ref } from 'vue'
import OrbitingActions, { type OrbitingAction } from '../../../registry/default/orbiting-actions/OrbitingActions.vue'

const props = withDefaults(defineProps<{
  radius?: number
  duration?: number
  direction?: 'clockwise' | 'counter-clockwise'
  paused?: boolean
  pauseOnHover?: boolean
}>(), {
  radius: 116,
  duration: 18,
  direction: 'clockwise',
  paused: false,
  pauseOnHover: true,
})

const items: OrbitingAction[] = [
  { id: 'design', label: 'Design', symbol: 'D' },
  { id: 'code', label: 'Code', symbol: 'C' },
  { id: 'analytics', label: 'Analytics', symbol: 'A' },
  { id: 'publish', label: 'Publish', symbol: 'P' },
  { id: 'settings', label: 'Settings', symbol: 'S' },
  { id: 'archive', label: 'Archive', symbol: 'R', disabled: true },
]

const selected = ref<string | null>('design')
const message = ref('Choose an action while the orbit is moving.')
const selectedItem = computed(() => items.find(item => item.id === selected.value))

function handleSelect(item: OrbitingAction) {
  message.value = `${item.label} action selected.`
}
</script>

<template>
  <div class="flex min-h-[430px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_58%)] p-4 sm:min-h-[480px] sm:p-8">
    <OrbitingActions
      v-model="selected"
      :items="items"
      :radius="radius"
      :duration="duration"
      :direction="direction"
      :paused="paused"
      :pause-on-hover="pauseOnHover"
      aria-label="Project workflow actions"
      @select="handleSelect"
    >
      <template #default>
        <div>
          <span class="mx-auto block size-2 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
          <p class="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
          <p class="mt-1 text-sm font-semibold text-foreground">{{ selectedItem?.label }}</p>
        </div>
      </template>
    </OrbitingActions>

    <p data-testid="orbit-status" class="min-h-5 text-center text-xs text-muted-foreground" aria-live="polite">
      {{ message }}
    </p>
  </div>
</template>
