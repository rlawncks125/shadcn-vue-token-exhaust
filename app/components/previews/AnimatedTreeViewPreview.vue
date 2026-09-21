<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedTreeView, { type AnimatedTreeNode } from '#registry/default/animated-tree-view/AnimatedTreeView.vue'

withDefaults(defineProps<{
  disabled?: boolean
  duration?: number
  indent?: number
}>(), {
  disabled: false,
  duration: 240,
  indent: 22,
})

const nodes: AnimatedTreeNode[] = [
  {
    id: 'product',
    label: 'Product',
    description: '12 documents',
    children: [
      { id: 'roadmap', label: 'Roadmap', description: 'Updated today' },
      {
        id: 'research',
        label: 'Research',
        description: '4 studies',
        children: [
          { id: 'interviews', label: 'Customer interviews', description: '18 recordings' },
          { id: 'market', label: 'Market scan', description: 'Read only', disabled: true },
        ],
      },
      { id: 'metrics', label: 'North-star metrics', description: '7 dashboards' },
    ],
  },
  {
    id: 'brand',
    label: 'Brand system',
    description: '8 documents',
    children: [
      { id: 'voice', label: 'Voice & tone', description: 'Guidelines' },
      { id: 'identity', label: 'Visual identity', description: '24 assets' },
    ],
  },
  { id: 'archive', label: 'Archive', description: '32 documents' },
]

const treeRef = ref<InstanceType<typeof AnimatedTreeView> | null>(null)
const selected = ref<string | null>('roadmap')
const expanded = ref(['product'])
const previewStatus = ref('Roadmap is ready to review.')
const flatNodes = computed(() => {
  const result: AnimatedTreeNode[] = []
  const visit = (items: AnimatedTreeNode[]) => items.forEach((item) => {
    result.push(item)
    if (Array.isArray(item.children)) visit(item.children)
  })
  visit(nodes)
  return result
})
const selectedNode = computed(() => flatNodes.value.find((node) => node.id === selected.value) ?? flatNodes.value[0]!)

function handleSelect(node: AnimatedTreeNode) {
  previewStatus.value = `${node.label} opened in the inspector.`
}

function expandEverything() {
  treeRef.value?.expandAll()
  previewStatus.value = 'All project folders expanded.'
}

function collapseEverything() {
  treeRef.value?.collapseAll()
  previewStatus.value = 'Project folders collapsed.'
}
</script>

<template>
  <section data-testid="animated-tree-view-preview" class="w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#1b271c]/10 bg-[#eef1e8] text-[#172019] shadow-[0_36px_100px_-62px_rgba(20,39,22,0.75)]">
    <header class="flex flex-col gap-4 border-b border-[#1b271c]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-[14px] bg-[#172019] text-[var(--registry-accent,#d9ff57)]" aria-hidden="true">
          <svg class="size-5 fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20"><path d="M3 4.5h5l1.5 2H17v9H3z" stroke-linejoin="round" /></svg>
        </span>
        <div><p class="text-sm font-bold tracking-[-0.02em]">Atlas workspace</p><p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#17201966]">Knowledge map</p></div>
      </div>
      <div class="flex gap-2">
        <button type="button" data-testid="expand-tree" class="rounded-full border border-[#1720191f] bg-white/65 px-3 py-2 text-[10px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-4 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled" @click="expandEverything">Expand all</button>
        <button type="button" data-testid="collapse-tree" class="rounded-full border border-[#1720191f] bg-white/65 px-3 py-2 text-[10px] font-bold outline-none transition-colors hover:bg-white focus-visible:ring-4 focus-visible:ring-[var(--registry-accent,#d9ff57)] disabled:cursor-not-allowed disabled:opacity-40" :disabled="disabled" @click="collapseEverything">Collapse</button>
      </div>
    </header>

    <div class="grid min-h-[510px] md:grid-cols-[minmax(290px,0.82fr)_minmax(0,1.18fr)]">
      <nav class="min-w-0 border-b border-[#1b271c]/10 p-4 sm:p-6 md:border-b-0 md:border-r">
        <div class="mb-3 flex items-center justify-between px-2"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#17201966]">Project files</p><kbd class="rounded-md border border-[#1720191f] bg-white/55 px-1.5 py-0.5 text-[9px] text-[#17201966]">↑ ↓</kbd></div>
        <AnimatedTreeView
          ref="treeRef"
          v-model:selected="selected"
          v-model:expanded="expanded"
          :nodes="nodes"
          :disabled="disabled"
          :duration="duration"
          :indent="indent"
          label="Atlas project files"
          @select="handleSelect"
        />
      </nav>

      <article class="relative flex min-w-0 flex-col justify-between overflow-hidden bg-[#fafbf7] p-6 sm:p-9">
        <span class="absolute -right-14 -top-14 size-44 rounded-full border-[30px] border-[var(--registry-accent,#d9ff57)] opacity-20" aria-hidden="true" />
        <div class="relative">
          <div class="flex items-start justify-between gap-4">
            <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#17201966]">Current document</p><h3 data-testid="tree-selected-label" class="mt-2 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">{{ selectedNode.label }}</h3></div>
            <span class="rounded-full bg-[#172019] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Live</span>
          </div>
          <p class="mt-4 max-w-md text-sm leading-6 text-[#17201980]">A focused project space where research, decisions, and working documents stay connected to the same living map.</p>
          <div class="mt-8 grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-[#17201914] bg-white p-4"><p class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#17201959]">Last edit</p><p class="mt-2 text-sm font-semibold">Today, 10:42</p></div>
            <div class="rounded-2xl border border-[#17201914] bg-white p-4"><p class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#17201959]">Contributors</p><p class="mt-2 text-sm font-semibold">Maya + 3</p></div>
          </div>
        </div>
        <div class="relative mt-10 border-t border-[#17201914] pt-5">
          <div class="flex items-center gap-2"><span class="size-2 rounded-full bg-[var(--registry-accent,#d9ff57)] ring-4 ring-[#172019]" aria-hidden="true" /><p class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#17201966]">Workspace activity</p></div>
          <p data-testid="tree-preview-status" class="mt-3 min-h-5 text-xs text-[#17201980]" role="status" aria-live="polite">{{ previewStatus }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
