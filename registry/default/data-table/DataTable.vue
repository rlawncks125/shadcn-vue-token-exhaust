<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, ColumnFiltersState, SortingState, Updater } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = withDefaults(defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchableKey?: string
  searchPlaceholder?: string
  pageSize?: number
}>(), { searchPlaceholder: 'Filter rows…', pageSize: 5 })

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
function update<T>(updater: Updater<T>, target: { value: T }) { target.value = typeof updater === 'function' ? (updater as (old: T) => T)(target.value) : updater }

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  onSortingChange: updater => update(updater, sorting),
  onColumnFiltersChange: updater => update(updater, columnFilters),
  initialState: { pagination: { pageSize: props.pageSize } },
  state: { get sorting() { return sorting.value }, get columnFilters() { return columnFilters.value } },
})
</script>

<template>
  <div class="data-table w-full min-w-0 max-w-full space-y-4">
    <Input v-if="searchableKey" class="max-w-sm" :placeholder="searchPlaceholder" :model-value="String(table.getColumn(searchableKey)?.getFilterValue() ?? '')" @update:model-value="table.getColumn(searchableKey)?.setFilterValue($event)" />
    <div class="overflow-x-auto rounded-xl border border-border"><table class="w-full min-w-[680px] text-sm"><thead class="bg-muted/60"><tr v-for="group in table.getHeaderGroups()" :key="group.id"><th v-for="header in group.headers" :key="header.id" class="h-11 px-4 text-left font-medium text-muted-foreground"><FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" /></th></tr></thead><tbody><tr v-for="row in table.getRowModel().rows" :key="row.id" class="border-t border-border transition-colors hover:bg-muted/40"><td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-3"><FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" /></td></tr><tr v-if="!table.getRowModel().rows.length"><td :colspan="columns.length" class="h-24 text-center text-muted-foreground">No results.</td></tr></tbody></table></div>
    <div class="flex items-center justify-between text-xs text-muted-foreground"><span>{{ table.getFilteredRowModel().rows.length }} row(s)</span><div class="flex gap-2"><Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">Previous</Button><Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">Next</Button></div></div>
  </div>
</template>
