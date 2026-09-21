<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export interface AnimatedAvatarItem {
  id: string
  name: string
  src?: string
  initials?: string
  status?: string
}

export interface AnimatedAvatarGroupExpose {
  expand: () => void
  collapse: () => void
  toggle: () => void
  resetSelection: () => void
  focusSelected: () => Promise<void>
}

const props = withDefaults(defineProps<{
  items: AnimatedAvatarItem[]
  modelValue: string | null
  maxVisible?: number
  size?: number
  overlap?: number
  duration?: number
  expandable?: boolean
  disabled?: boolean
}>(), {
  maxVisible: 4,
  size: 48,
  overlap: 12,
  duration: 320,
  expandable: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  select: [item: AnimatedAvatarItem]
  expand: [expanded: boolean]
}>()

const expanded = ref(false)
const failedImages = ref(new Set<string>())
const avatarButtons = new Map<string, HTMLButtonElement>()

const safeMaxVisible = computed(() => {
  const value = Number(props.maxVisible)
  return Number.isFinite(value) ? Math.min(100, Math.max(1, Math.floor(value))) : 4
})
const safeSize = computed(() => {
  const value = Number(props.size)
  return Number.isFinite(value) ? Math.min(96, Math.max(28, value)) : 48
})
const safeOverlap = computed(() => {
  const value = Number(props.overlap)
  return Number.isFinite(value) ? Math.min(safeSize.value - 8, Math.max(0, value)) : 12
})
const safeDuration = computed(() => {
  const value = Number(props.duration)
  return Number.isFinite(value) ? Math.min(5000, Math.max(0, value)) : 320
})
const overflowCount = computed(() => Math.max(0, props.items.length - safeMaxVisible.value))
const visibleItems = computed(() => expanded.value ? props.items : props.items.slice(0, safeMaxVisible.value))
const rootStyle = computed(() => ({
  '--avatar-size': `${safeSize.value}px`,
  '--avatar-overlap': `${safeOverlap.value}px`,
  '--avatar-duration': `${safeDuration.value}ms`,
}))

function imageKey(item: AnimatedAvatarItem) {
  return `${item.id}:${item.src ?? ''}`
}

function showImage(item: AnimatedAvatarItem) {
  return Boolean(item.src) && !failedImages.value.has(imageKey(item))
}

function handleImageError(item: AnimatedAvatarItem) {
  const next = new Set(failedImages.value)
  next.add(imageKey(item))
  failedImages.value = next
}

function avatarInitials(item: AnimatedAvatarItem) {
  if (item.initials?.trim()) return item.initials.trim().slice(0, 3).toUpperCase()
  return item.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '?'
}

function avatarLabel(item: AnimatedAvatarItem) {
  const action = item.id === props.modelValue ? 'Selected' : 'Select'
  return `${action} ${item.name}${item.status ? `, ${item.status}` : ''}`
}

function avatarTone(id: string) {
  const tones = [
    'linear-gradient(145deg, #d9ff57, #a8cf38)',
    'linear-gradient(145deg, #b9d9ff, #759fda)',
    'linear-gradient(145deg, #ffd0b5, #e88f68)',
    'linear-gradient(145deg, #e1ceff, #a789dc)',
    'linear-gradient(145deg, #bdebd7, #61b895)',
    'linear-gradient(145deg, #ffe69c, #d8aa49)',
  ]
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0
  return { backgroundImage: tones[Math.abs(hash) % tones.length] }
}

function statusClass(status?: string) {
  if (status === 'online' || status === 'active') return 'bg-[#35b46f]'
  if (status === 'away') return 'bg-[#e3a72f]'
  if (status === 'busy') return 'bg-[#e1665a]'
  return 'bg-[#a5aaa1]'
}

function setAvatarButton(element: unknown, id: string) {
  if (element instanceof HTMLButtonElement) avatarButtons.set(id, element)
  else avatarButtons.delete(id)
}

function selectAvatar(item: AnimatedAvatarItem) {
  if (props.disabled || item.id === props.modelValue) return
  emit('update:modelValue', item.id)
  emit('select', item)
}

function setExpanded(value: boolean) {
  if (props.disabled || !props.expandable || !overflowCount.value || expanded.value === value) return
  expanded.value = value
  emit('expand', value)
}

function expand() {
  setExpanded(true)
}

function collapse() {
  setExpanded(false)
}

function toggle() {
  setExpanded(!expanded.value)
}

function resetSelection() {
  if (props.modelValue !== null) emit('update:modelValue', null)
}

async function focusSelected() {
  if (props.disabled || props.modelValue === null) return
  const selected = props.items.find(item => item.id === props.modelValue)
  if (!selected) return
  if (!visibleItems.value.some(item => item.id === selected.id) && props.expandable) expand()
  await nextTick()
  avatarButtons.get(selected.id)?.focus()
}

watch([() => props.expandable, overflowCount], ([expandable, count]) => {
  if ((!expandable || count === 0) && expanded.value) {
    expanded.value = false
    emit('expand', false)
  }
})

defineExpose<AnimatedAvatarGroupExpose>({ expand, collapse, toggle, resetSelection, focusSelected })
</script>

<template>
  <div
    class="animated-avatar-group inline-flex max-w-full items-center"
    :class="{ 'opacity-55': disabled }"
    :style="rootStyle"
    role="group"
    aria-label="Team members"
    :aria-disabled="disabled || undefined"
    :data-expanded="expanded"
    data-testid="animated-avatar-group"
  >
    <TransitionGroup name="avatar-list" tag="div" class="relative flex max-w-full items-center">
      <button
        v-for="(item, index) in visibleItems"
        :key="item.id"
        :ref="element => setAvatarButton(element, item.id)"
        type="button"
        class="animated-avatar relative grid shrink-0 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#e5e8df] p-0 text-[#172018] shadow-[0_7px_18px_-10px_rgba(23,32,24,0.72)] outline-none transition-[box-shadow,filter] hover:not-disabled:z-30 hover:not-disabled:brightness-[1.04] focus-visible:z-40 focus-visible:ring-[3px] focus-visible:ring-[#171814] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        :class="item.id === modelValue ? 'is-selected z-20 shadow-[0_0_0_2px_#d9ff57,0_12px_24px_-12px_rgba(23,32,24,0.75)]' : 'z-10'"
        :style="{
          ...avatarTone(item.id),
          width: 'var(--avatar-size)',
          height: 'var(--avatar-size)',
          marginInlineStart: index === 0 ? '0px' : 'calc(var(--avatar-overlap) * -1)',
        }"
        :disabled="disabled"
        :aria-label="avatarLabel(item)"
        :aria-pressed="item.id === modelValue"
        :title="item.name"
        :data-avatar-id="item.id"
        @click="selectAvatar(item)"
      >
        <img
          v-if="showImage(item)"
          :src="item.src"
          alt=""
          class="size-full rounded-full object-cover"
          draggable="false"
          @error="handleImageError(item)"
        />
        <span v-else class="select-none text-[length:calc(var(--avatar-size)*0.27)] font-bold tracking-[-0.04em]" aria-hidden="true">
          {{ avatarInitials(item) }}
        </span>
        <span
          v-if="item.status"
          class="absolute bottom-[3%] right-[3%] size-[24%] min-h-2 min-w-2 rounded-full border-2 border-white"
          :class="statusClass(item.status)"
          aria-hidden="true"
        />
      </button>

      <button
        v-if="overflowCount && expandable"
        key="avatar-overflow"
        type="button"
        class="avatar-overflow relative z-10 grid shrink-0 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#20251f] p-0 text-[length:calc(var(--avatar-size)*0.23)] font-bold tabular-nums text-white shadow-[0_7px_18px_-10px_rgba(23,32,24,0.72)] outline-none transition-[background-color,box-shadow] hover:not-disabled:z-30 hover:not-disabled:bg-[#313a30] focus-visible:z-40 focus-visible:ring-[3px] focus-visible:ring-[#171814] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        :style="{
          width: 'var(--avatar-size)',
          height: 'var(--avatar-size)',
          marginInlineStart: visibleItems.length ? 'calc(var(--avatar-overlap) * -1)' : '0px',
        }"
        :disabled="disabled"
        :aria-expanded="expanded"
        :aria-label="expanded ? `Collapse ${overflowCount} additional team members` : `Show ${overflowCount} additional team members`"
        data-testid="animated-avatar-group-overflow"
        @click="toggle"
      >
        {{ expanded ? `-${overflowCount}` : `+${overflowCount}` }}
      </button>

      <span
        v-else-if="overflowCount"
        key="avatar-overflow-static"
        class="avatar-overflow relative z-10 grid shrink-0 select-none place-items-center rounded-full border-2 border-white bg-[#20251f] text-[length:calc(var(--avatar-size)*0.23)] font-bold tabular-nums text-white shadow-[0_7px_18px_-10px_rgba(23,32,24,0.72)]"
        :style="{
          width: 'var(--avatar-size)',
          height: 'var(--avatar-size)',
          marginInlineStart: visibleItems.length ? 'calc(var(--avatar-overlap) * -1)' : '0px',
        }"
        :aria-label="`${overflowCount} additional team members`"
      >
        +{{ overflowCount }}
      </span>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.animated-avatar,
.avatar-overflow {
  transition-duration: var(--avatar-duration);
  transition-timing-function: cubic-bezier(.16, 1, .3, 1);
}

.animated-avatar {
  transition-property: transform, opacity, margin, box-shadow, filter;
}

.animated-avatar:hover:not(:disabled),
.animated-avatar:focus-visible,
.animated-avatar.is-selected {
  transform: translateY(calc(var(--avatar-size) * -0.08)) scale(1.045);
}

.avatar-overflow {
  transition-property: transform, opacity, margin, background-color, box-shadow;
}

.avatar-overflow:hover:not(:disabled),
.avatar-overflow:focus-visible {
  transform: translateY(calc(var(--avatar-size) * -0.06));
}

.avatar-list-enter-active,
.avatar-list-leave-active,
.avatar-list-move {
  transition-duration: var(--avatar-duration);
  transition-property: transform, opacity, margin;
  transition-timing-function: cubic-bezier(.16, 1, .3, 1);
}

.avatar-list-enter-from,
.avatar-list-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--avatar-size) * -0.35)) scale(.72);
}

.avatar-list-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .animated-avatar,
  .avatar-overflow,
  .avatar-list-enter-active,
  .avatar-list-leave-active,
  .avatar-list-move {
    transition-duration: 0ms;
  }
}
</style>
