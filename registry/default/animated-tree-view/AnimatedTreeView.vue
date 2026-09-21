<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface AnimatedTreeNode {
  id: string
  label: string
  description?: string
  disabled?: boolean
  children?: AnimatedTreeNode[]
}

interface NormalizedTreeNode {
  id: string
  label: string
  description?: string
  disabled: boolean
  parentId: string | null
  level: number
  position: number
  setSize: number
  children: NormalizedTreeNode[]
  source: AnimatedTreeNode
}

const props = withDefaults(defineProps<{
  nodes: AnimatedTreeNode[]
  selected: string | null
  expanded: string[]
  label?: string
  disabled?: boolean
  indent?: number
  duration?: number
}>(), {
  label: 'Tree view',
  disabled: false,
  indent: 22,
  duration: 240,
})

const emit = defineEmits<{
  'update:selected': [id: string | null]
  'update:expanded': [ids: string[]]
  select: [node: AnimatedTreeNode]
  toggle: [node: AnimatedTreeNode, expanded: boolean]
}>()

const tree = ref<HTMLElement | null>(null)
const activeId = ref('')
const announcement = ref('')
const elements = new Map<string, HTMLElement>()
const treeId = `animated-tree-${useId()}`
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

const safeIndent = computed(() => {
  const indent = Number(props.indent)
  return Number.isFinite(indent) ? Math.min(48, Math.max(12, indent)) : 22
})
const safeDuration = computed(() => {
  const duration = Number(props.duration)
  return Number.isFinite(duration) ? Math.min(2000, Math.max(0, duration)) : 240
})

const normalizedRoots = computed(() => {
  const seen = new Set<string>()

  function normalize(candidates: unknown, parentId: string | null, level: number, path: Set<object>): NormalizedTreeNode[] {
    if (!Array.isArray(candidates)) return []
    const valid = candidates.filter((candidate) => {
      if (!candidate || typeof candidate !== 'object' || path.has(candidate as object)) return false
      const node = candidate as Partial<AnimatedTreeNode>
      return typeof node.id === 'string' && Boolean(node.id.trim()) && !seen.has(node.id)
    })
    const result: NormalizedTreeNode[] = []

    for (const candidate of valid) {
      const node = candidate as Partial<AnimatedTreeNode>
      if (typeof node.id !== 'string' || seen.has(node.id)) continue
      seen.add(node.id)
      const nextPath = new Set(path)
      nextPath.add(candidate as object)
      const normalized: NormalizedTreeNode = {
        id: node.id,
        label: typeof node.label === 'string' && node.label.trim() ? node.label : node.id,
        description: typeof node.description === 'string' && node.description.trim() ? node.description : undefined,
        disabled: Boolean(node.disabled),
        parentId,
        level,
        position: result.length + 1,
        setSize: valid.length,
        children: [],
        source: candidate as AnimatedTreeNode,
      }
      normalized.children = normalize(node.children, normalized.id, level + 1, nextPath)
      result.push(normalized)
    }

    for (let index = 0; index < result.length; index++) {
      result[index]!.position = index + 1
      result[index]!.setSize = result.length
    }
    return result
  }

  return normalize(props.nodes, null, 1, new Set())
})

const allNodes = computed(() => {
  const result: NormalizedTreeNode[] = []
  function visit(nodes: NormalizedTreeNode[]) {
    for (const node of nodes) {
      result.push(node)
      visit(node.children)
    }
  }
  visit(normalizedRoots.value)
  return result
})
const nodeById = computed(() => new Map(allNodes.value.map((node) => [node.id, node])))
const expandableIds = computed(() => new Set(allNodes.value.filter((node) => node.children.length).map((node) => node.id)))
const expandedValues = computed(() => {
  if (!Array.isArray(props.expanded)) return []
  const seen = new Set<string>()
  return (props.expanded as unknown[]).filter((id): id is string => {
    if (typeof id !== 'string' || seen.has(id) || !expandableIds.value.has(id)) return false
    seen.add(id)
    return true
  })
})
const expandedSet = computed(() => new Set(expandedValues.value))
const selectedValue = computed(() => typeof props.selected === 'string' && nodeById.value.has(props.selected) ? props.selected : null)
const visibleNodes = computed(() => {
  const result: NormalizedTreeNode[] = []
  function visit(nodes: NormalizedTreeNode[]) {
    for (const node of nodes) {
      result.push(node)
      if (expandedSet.value.has(node.id)) visit(node.children)
    }
  }
  visit(normalizedRoots.value)
  return result
})

function setElement(element: unknown, id: string) {
  if (element instanceof HTMLElement) elements.set(id, element)
  else elements.delete(id)
}

async function focusNode(id?: string) {
  if (props.disabled) return
  const requested = id && visibleNodes.value.some((node) => node.id === id) ? id : undefined
  const target = requested ?? (selectedValue.value && visibleNodes.value.some((node) => node.id === selectedValue.value) ? selectedValue.value : undefined) ?? visibleNodes.value[0]?.id
  if (!target) {
    tree.value?.focus()
    return
  }
  activeId.value = target
  await nextTick()
  elements.get(target)?.focus()
}

function commitExpanded(ids: string[]) {
  const available = expandableIds.value
  const seen = new Set<string>()
  emit('update:expanded', ids.filter((id) => available.has(id) && !seen.has(id) && seen.add(id)))
}

function setExpanded(node: NormalizedTreeNode, expanded: boolean) {
  if (props.disabled || node.disabled || !node.children.length || expandedSet.value.has(node.id) === expanded) return
  const next = expanded
    ? [...expandedValues.value, node.id]
    : expandedValues.value.filter((id) => id !== node.id)
  commitExpanded(next)
  announcement.value = `${node.label} ${expanded ? 'expanded' : 'collapsed'}.`
  emit('toggle', node.source, expanded)
}

function toggle(node: NormalizedTreeNode) {
  setExpanded(node, !expandedSet.value.has(node.id))
}

function selectNode(node: NormalizedTreeNode) {
  if (props.disabled || node.disabled) {
    announcement.value = `${node.label} is unavailable.`
    return
  }
  emit('update:selected', node.id)
  emit('select', node.source)
  announcement.value = `${node.label} selected.`
}

function focusAt(index: number) {
  const node = visibleNodes.value[index]
  if (node) focusNode(node.id)
}

function handleKeydown(event: KeyboardEvent, node: NormalizedTreeNode) {
  if (props.disabled) return
  const index = visibleNodes.value.findIndex((candidate) => candidate.id === node.id)
  if (event.key === 'ArrowDown') focusAt(Math.min(visibleNodes.value.length - 1, index + 1))
  else if (event.key === 'ArrowUp') focusAt(Math.max(0, index - 1))
  else if (event.key === 'Home') focusAt(0)
  else if (event.key === 'End') focusAt(visibleNodes.value.length - 1)
  else if (event.key === 'ArrowRight') {
    if (node.children.length && !expandedSet.value.has(node.id)) setExpanded(node, true)
    else if (node.children.length) focusNode(node.children[0]?.id)
  }
  else if (event.key === 'ArrowLeft') {
    if (node.children.length && expandedSet.value.has(node.id)) setExpanded(node, false)
    else if (node.parentId) focusNode(node.parentId)
  }
  else if (event.key === 'Enter' || event.key === ' ') selectNode(node)
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    typeahead += event.key.toLocaleLowerCase()
    if (typeaheadTimer) clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => { typeahead = '' }, 650)
    const ordered = [...visibleNodes.value.slice(index + 1), ...visibleNodes.value.slice(0, index + 1)]
    const match = ordered.find((candidate) => candidate.label.toLocaleLowerCase().startsWith(typeahead))
    if (match) focusNode(match.id)
  }
  else return
  event.preventDefault()
}

function expandAll() {
  if (props.disabled) return
  commitExpanded(allNodes.value.filter((node) => node.children.length && !node.disabled).map((node) => node.id))
  announcement.value = 'All available branches expanded.'
}

function collapseAll() {
  if (props.disabled) return
  let target = nodeById.value.get(activeId.value)
  while (target?.parentId) target = nodeById.value.get(target.parentId)
  commitExpanded([])
  announcement.value = 'All branches collapsed.'
  if (target) focusNode(target.id)
}

watch(visibleNodes, (nodes) => {
  if (!nodes.length) activeId.value = ''
  else if (!nodes.some((node) => node.id === activeId.value)) activeId.value = selectedValue.value && nodes.some((node) => node.id === selectedValue.value) ? selectedValue.value : nodes[0]!.id
}, { immediate: true })

onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  elements.clear()
})

defineExpose({ expandAll, collapseAll, focus: focusNode })
</script>

<template>
  <div
    :id="treeId"
    ref="tree"
    role="tree"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :tabindex="visibleNodes.length ? -1 : 0"
    data-testid="animated-tree-view"
    class="animated-tree-view min-w-0 rounded-[22px] border border-[#1720191f] bg-[#fbfcf7] p-2 text-[#172019] shadow-[0_24px_60px_-50px_rgba(23,32,25,0.8)] outline-none"
    :style="{ '--tree-duration': `${safeDuration}ms` }"
  >
    <TransitionGroup
      tag="ul"
      role="group"
      class="m-0 grid list-none gap-0.5 p-0"
      name="animated-tree-row"
      move-class="animated-tree-row-move"
    >
      <li v-for="node in visibleNodes" :key="node.id" role="none" class="min-w-0">
        <div
          :ref="element => setElement(element, node.id)"
          role="treeitem"
          :tabindex="!disabled && activeId === node.id ? 0 : -1"
          :aria-level="node.level"
          :aria-posinset="node.position"
          :aria-setsize="node.setSize"
          :aria-selected="selectedValue === node.id"
          :aria-expanded="node.children.length ? expandedSet.has(node.id) : undefined"
          :aria-disabled="disabled || node.disabled || undefined"
          :data-testid="`tree-item-${node.id}`"
          class="group flex min-h-11 min-w-0 cursor-default items-center gap-1.5 rounded-2xl py-1.5 pr-3 outline-none transition-[background-color,color,box-shadow,opacity] hover:bg-[#edf1e8] focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57)] motion-reduce:transition-none"
          :class="{
            'bg-[#172019] text-white hover:bg-[#172019]': selectedValue === node.id,
            'opacity-45': disabled || node.disabled,
          }"
          :style="{ paddingLeft: `${8 + (node.level - 1) * safeIndent}px` }"
          @focus="activeId = node.id"
          @click="selectNode(node)"
          @dblclick="toggle(node)"
          @keydown="handleKeydown($event, node)"
        >
          <button
            v-if="node.children.length"
            type="button"
            tabindex="-1"
            :disabled="disabled || node.disabled"
            :aria-label="`${expandedSet.has(node.id) ? 'Collapse' : 'Expand'} ${node.label}`"
            :data-testid="`tree-toggle-${node.id}`"
            class="grid size-7 shrink-0 place-items-center rounded-lg text-current/55 outline-none transition-colors hover:bg-black/10 disabled:cursor-not-allowed motion-reduce:transition-none"
            @click.stop="toggle(node)"
          >
            <svg class="size-3.5 fill-none stroke-current stroke-2 transition-transform duration-[var(--tree-duration)] motion-reduce:transition-none" :class="expandedSet.has(node.id) ? 'rotate-90' : ''" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 3.5 4.5 4.5L6 12.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <span v-else class="size-7 shrink-0" aria-hidden="true" />

          <span class="grid size-7 shrink-0 place-items-center rounded-xl border border-current/10 bg-current/[0.06]" aria-hidden="true">
            <svg v-if="node.children.length" class="size-3.5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 18 18"><path d="M2.5 5.5h5l1.4 1.7h6.6v7.3h-13z" stroke-linejoin="round" /></svg>
            <svg v-else class="size-3.5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 18 18"><path d="M5 2.5h5l3 3v10H5z" stroke-linejoin="round" /><path d="M10 2.5v3h3" /></svg>
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate text-[13px] font-semibold tracking-[-0.01em]">{{ node.label }}</span>
            <span v-if="node.description" class="block truncate text-[10px] text-current/45">{{ node.description }}</span>
          </span>
          <span v-if="node.children.length" class="shrink-0 rounded-full border border-current/10 px-2 py-0.5 text-[9px] font-bold tabular-nums text-current/45" aria-hidden="true">{{ node.children.length }}</span>
        </div>
      </li>
    </TransitionGroup>

    <p v-if="!visibleNodes.length" class="m-2 rounded-2xl border border-dashed border-[#1720192b] px-4 py-8 text-center text-xs text-[#17201966]">No nodes available.</p>
    <p data-testid="tree-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.animated-tree-row-enter-active,
.animated-tree-row-leave-active,
.animated-tree-row-move {
  transition-duration: var(--tree-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-tree-row-enter-from,
.animated-tree-row-leave-to {
  opacity: 0;
  transform: translateY(-7px) scale(0.98);
}

.animated-tree-row-leave-active {
  position: absolute;
  width: calc(100% - 1rem);
}

@media (prefers-reduced-motion: reduce) {
  .animated-tree-row-enter-active,
  .animated-tree-row-leave-active,
  .animated-tree-row-move {
    transition: none;
  }
}
</style>
