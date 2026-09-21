<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedTransferList, { type AnimatedTransferItem } from '#registry/default/animated-transfer-list/AnimatedTransferList.vue'

withDefaults(defineProps<{
  disabled?: boolean
  duration?: number
}>(), {
  disabled: false,
  duration: 280,
})

const people: AnimatedTransferItem[] = [
  { id: 'ar', label: 'Ari Reed', description: 'Product design', meta: 'PDT' },
  { id: 'mo', label: 'Morgan Liu', description: 'Research lead', meta: 'GMT' },
  { id: 'sa', label: 'Samira Holt', description: 'Engineering', meta: 'EDT' },
  { id: 'jo', label: 'Jon Bell', description: 'Data science', meta: 'CET' },
  { id: 'no', label: 'Noah Kim', description: 'External observer', meta: 'View', disabled: true },
  { id: 'im', label: 'Imani Cole', description: 'Content strategy', meta: 'PDT' },
]

const transferRef = ref<InstanceType<typeof AnimatedTransferList> | null>(null)
const destinationIds = ref(['mo', 'jo'])
const activeIds = ref<string[]>([])
const status = ref('Two reviewers are assigned to the launch room.')
const assignedNames = computed(() => destinationIds.value.map((id) => people.find((person) => person.id === id)?.label).filter(Boolean))

function handleTransfer(items: AnimatedTransferItem[], direction: 'toDestination' | 'toSource') {
  const names = items.map((item) => item.label).join(', ')
  status.value = direction === 'toDestination' ? `${names} assigned to the launch room.` : `${names} returned to the directory.`
}

function clearRoom() {
  transferRef.value?.clear()
  status.value = 'Available reviewers removed from the room.'
}
</script>

<template>
  <section data-testid="animated-transfer-list-preview" class="w-full max-w-6xl overflow-hidden rounded-[30px] border border-black/10 bg-[#eeeae0] text-[#171a19] shadow-[0_38px_110px_-65px_rgba(20,24,22,0.8)]">
    <header class="flex flex-col gap-5 border-b border-black/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-6">
      <div><p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#171a1966]">Launch access</p><h2 class="mt-1.5 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">Build the review room.</h2></div>
      <div class="flex items-center gap-3">
        <div class="-space-x-2 flex" aria-hidden="true"><span v-for="name in assignedNames.slice(0, 3)" :key="name" class="grid size-8 place-items-center rounded-full border-2 border-[#eeeae0] bg-[#171a19] text-[9px] font-black uppercase text-white">{{ name?.slice(0, 2) }}</span></div>
        <button type="button" data-testid="clear-transfer" class="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-[10px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-4 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled" @click="clearRoom">Clear room</button>
      </div>
    </header>

    <div class="p-4 sm:p-7 lg:p-9">
      <AnimatedTransferList
        ref="transferRef"
        v-model="destinationIds"
        v-model:active-ids="activeIds"
        :items="people"
        :disabled="disabled"
        :duration="duration"
        source-label="Team directory"
        destination-label="Launch room"
        @transfer="handleTransfer"
      />
      <footer class="mt-5 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p data-testid="transfer-preview-status" class="min-h-5 text-xs text-[#171a1973]" role="status" aria-live="polite">{{ status }}</p>
        <p data-testid="transfer-count" class="shrink-0 rounded-full bg-[#171a19] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-white">{{ destinationIds.length }} in room</p>
      </footer>
    </div>
  </section>
</template>
