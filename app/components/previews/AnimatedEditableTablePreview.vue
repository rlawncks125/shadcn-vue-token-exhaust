<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedEditableTable, { type AnimatedEditableTableColumn, type AnimatedEditableTableRow } from '#registry/default/animated-editable-table/AnimatedEditableTable.vue'

withDefaults(defineProps<{ duration?: number; disabled?: boolean; removable?: boolean }>(), { duration: 220, disabled: false, removable: true })
const table = ref<InstanceType<typeof AnimatedEditableTable> | null>(null)
const rows = ref<AnimatedEditableTableRow[]>([
  { id: 'paper', item: 'Recycled paper', owner: 'Mina', status: 'approved', budget: 4200 },
  { id: 'ink', item: 'Soy ink batch', owner: 'Theo', status: 'review', budget: 2800 },
  { id: 'binding', item: 'Thread binding', owner: 'Ari', status: 'draft', budget: 3600 },
  { id: 'freight', item: 'Regional freight', owner: 'Noor', status: 'review', budget: 1900 },
])
const columns: AnimatedEditableTableColumn[] = [
  { key: 'item', label: 'Line item', width: '34%' },
  { key: 'owner', label: 'Owner', width: '20%' },
  { key: 'status', label: 'Status', type: 'select', width: '20%', options: [{ value: 'draft', label: 'Draft' }, { value: 'review', label: 'In review' }, { value: 'approved', label: 'Approved' }] },
  { key: 'budget', label: 'Budget', type: 'number', width: '18%' },
]
const status = ref('Select a cell and press Enter to edit.')
const total = computed(() => rows.value.reduce((sum, row) => sum + Number(row.budget || 0), 0))
</script>

<template>
  <section data-testid="animated-editable-table-preview" class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#20251f]/10 bg-[#ebe9df] text-[#20251f] shadow-[0_36px_100px_-62px_rgba(32,37,31,.75)]">
    <header class="flex flex-col gap-4 border-b border-[#20251f]/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-7">
      <div><p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#ad5139]">Edition 08 / Production ledger</p><h2 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Working budget</h2></div>
      <div class="flex items-end gap-5"><div class="text-right"><p class="text-[8px] font-bold uppercase tracking-[.14em] text-black/35">Committed</p><p data-testid="editable-table-total" class="mt-1 font-mono text-xl font-semibold">${{ total.toLocaleString() }}</p></div><button type="button" class="rounded-full border border-black/10 bg-white/55 px-3 py-2 text-[10px] font-bold outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" @click="table?.reset(); status = 'Ledger reset.'">Reset</button></div>
    </header>
    <div class="min-w-0 p-4 sm:p-7"><AnimatedEditableTable ref="table" v-model="rows" :columns="columns" :duration="duration" :disabled="disabled" :removable="removable" label="Publication production budget" @change="(_row, column) => status = `${column.label} updated.`" @remove="(_row, index) => status = `Row ${index + 1} removed.`" /><p data-testid="editable-table-status" class="mt-4 text-[10px] text-black/45" role="status">{{ status }}</p></div>
  </section>
</template>
