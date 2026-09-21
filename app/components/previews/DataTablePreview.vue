<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Button } from '@/components/ui/button'
import DataTable from '../../../registry/default/data-table/DataTable.vue'

interface Member { name: string; email: string; role: string; status: 'Active' | 'Invited' }
const members: Member[] = [
  { name: 'Ada Lovelace', email: 'ada@analytical.io', role: 'Owner', status: 'Active' },
  { name: 'Grace Hopper', email: 'grace@compiler.dev', role: 'Engineer', status: 'Active' },
  { name: 'Edsger Dijkstra', email: 'edsger@paths.dev', role: 'Reviewer', status: 'Invited' },
  { name: 'Margaret Hamilton', email: 'margaret@apollo.dev', role: 'Engineer', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@machine.dev', role: 'Researcher', status: 'Active' },
  { name: 'Barbara Liskov', email: 'barbara@types.dev', role: 'Reviewer', status: 'Invited' },
]

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'name', header: ({ column }) => h('button', { class: 'font-medium hover:text-foreground', onClick: () => column.toggleSorting(column.getIsSorted() === 'asc') }, `Name ${column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : '↕'}`), cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')) },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.getValue('email')) },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => h('span', { class: row.getValue('status') === 'Active' ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700' : 'rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700' }, row.getValue('status')) },
  { id: 'actions', cell: ({ row }) => h(Button, { variant: 'ghost', size: 'sm', onClick: () => navigator.clipboard?.writeText(row.original.email) }, () => 'Copy') },
]
</script>

<template>
  <div class="flex min-h-[500px] w-full min-w-0 max-w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e8edf2] p-5 sm:min-h-[560px] sm:p-8"><section class="w-full min-w-0 max-w-4xl overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(30,50,70,0.1)]"><div class="mb-6"><p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">TanStack wrapper</p><h3 class="mt-2 text-2xl font-semibold tracking-[-0.04em]">Workspace members</h3></div><DataTable :columns="columns" :data="members" searchable-key="name" search-placeholder="Filter by name…" :page-size="4" /></section></div>
</template>
