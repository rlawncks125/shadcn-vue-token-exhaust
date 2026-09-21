<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

export interface ConnectionBeamNode {
  id: string
  x: number
  y: number
  label: string
  disabled?: boolean
}

export interface ConnectionBeamEdge {
  from: string
  to: string
}

const props = withDefaults(defineProps<{
  nodes: ConnectionBeamNode[]
  connections: ConnectionBeamEdge[]
  modelValue?: string
  duration?: number
  beamWidth?: number
  color?: string
  paused?: boolean
  disabled?: boolean
  ariaLabel?: string
}>(), {
  modelValue: '',
  duration: 4,
  beamWidth: 1.8,
  color: 'var(--registry-accent, #d9ff57)',
  paused: false,
  disabled: false,
  ariaLabel: 'Connection map',
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
  'select': [node: ConnectionBeamNode]
}>()

const nodeElements = ref<Array<HTMLButtonElement | null>>([])
const selected = computed(() => props.modelValue || props.nodes.find(node => !node.disabled)?.id || '')
const safeDuration = computed(() => Math.min(Math.max(props.duration, 0.5), 30))
const safeBeamWidth = computed(() => Math.min(Math.max(props.beamWidth, 0.5), 8))

function clamp(value: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : 50, 4), 96)
}

function findNode(id: string) {
  return props.nodes.find(node => node.id === id)
}

function pathFor(connection: ConnectionBeamEdge) {
  const from = findNode(connection.from)
  const to = findNode(connection.to)
  if (!from || !to) return ''
  const startX = clamp(from.x)
  const startY = clamp(from.y)
  const endX = clamp(to.x)
  const endY = clamp(to.y)
  const deltaX = Math.abs(endX - startX)
  const deltaY = Math.abs(endY - startY)

  if (deltaX >= deltaY) {
    const middle = (startX + endX) / 2
    return `M ${startX} ${startY} C ${middle} ${startY}, ${middle} ${endY}, ${endX} ${endY}`
  }
  const middle = (startY + endY) / 2
  return `M ${startX} ${startY} C ${startX} ${middle}, ${endX} ${middle}, ${endX} ${endY}`
}

function isActive(connection: ConnectionBeamEdge) {
  return connection.from === selected.value || connection.to === selected.value
}

function setNodeElement(index: number, element: unknown) {
  nodeElements.value[index] = element instanceof HTMLButtonElement ? element : null
}

function selectNode(node: ConnectionBeamNode) {
  if (props.disabled || node.disabled) return
  emit('update:modelValue', node.id)
  emit('select', node)
}

async function focusAt(index: number) {
  const enabled = props.nodes.map((node, nodeIndex) => ({ node, nodeIndex })).filter(item => !item.node.disabled)
  if (!enabled.length) return
  const normalized = (index + enabled.length) % enabled.length
  await nextTick()
  nodeElements.value[enabled[normalized]?.nodeIndex ?? 0]?.focus()
}

function handleKeydown(event: KeyboardEvent, nodeIndex: number) {
  const enabled = props.nodes.map((node, index) => ({ node, index })).filter(item => !item.node.disabled)
  const current = enabled.findIndex(item => item.index === nodeIndex)
  if (current < 0) return

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    focusAt(current + 1)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    focusAt(current - 1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    focusAt(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    focusAt(enabled.length - 1)
  }
}
</script>

<template>
  <div
    class="connection-beam relative isolate min-h-72 w-full overflow-hidden rounded-3xl bg-[#080b12] text-white"
    :class="disabled ? 'opacity-55' : ''"
    :data-paused="paused ? '' : undefined"
    role="group"
    :aria-label="ariaLabel"
    :style="{ '--connection-color': color }"
  >
    <svg class="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g v-for="(connection, index) in connections" :key="`${connection.from}-${connection.to}-${index}`">
        <path :d="pathFor(connection)" fill="none" stroke="currentColor" stroke-width="0.45" vector-effect="non-scaling-stroke" class="text-white/12" />
        <path
          :d="pathFor(connection)"
          pathLength="100"
          fill="none"
          stroke="var(--connection-color)"
          :stroke-width="safeBeamWidth"
          stroke-linecap="round"
          stroke-dasharray="12 88"
          vector-effect="non-scaling-stroke"
          class="connection-beam__path transition-opacity duration-300 motion-reduce:transition-none"
          :class="isActive(connection) ? 'opacity-100' : 'opacity-35'"
          :style="{ animationDuration: `${safeDuration}s`, animationDelay: `${-index * safeDuration / Math.max(connections.length, 1)}s`, animationPlayState: paused ? 'paused' : 'running' }"
        />
      </g>
    </svg>

    <button
      v-for="(node, index) in nodes"
      :key="node.id"
      :ref="element => setNodeElement(index, element)"
      type="button"
      class="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 p-1.5 text-left shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-md outline-none transition-all duration-300 hover:-translate-y-[calc(50%+3px)] hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-[var(--connection-color)] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
      :class="selected === node.id ? 'border-[var(--connection-color)] bg-white/18 shadow-[0_0_0_4px_color-mix(in_srgb,var(--connection-color)_16%,transparent)]' : ''"
      :style="{ left: `${clamp(node.x)}%`, top: `${clamp(node.y)}%` }"
      :disabled="disabled || node.disabled"
      :aria-pressed="selected === node.id"
      @click="selectNode(node)"
      @keydown="handleKeydown($event, index)"
    >
      <slot name="node" :node="node" :selected="selected === node.id">
        <span class="grid size-9 place-items-center rounded-xl bg-white/10 text-xs font-semibold">{{ node.label.slice(0, 2).toUpperCase() }}</span>
      </slot>
    </button>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/55 to-transparent px-5 pb-4 pt-10">
      <slot :selected="selected" />
    </div>
  </div>
</template>

<style scoped>
.connection-beam__path {
  animation-name: connection-beam-flow;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  filter: drop-shadow(0 0 4px var(--connection-color));
}

@keyframes connection-beam-flow {
  to { stroke-dashoffset: -100; }
}

@media (prefers-reduced-motion: reduce) {
  .connection-beam__path {
    animation: none !important;
    stroke-dasharray: none;
    opacity: 0.5;
  }
}
</style>
