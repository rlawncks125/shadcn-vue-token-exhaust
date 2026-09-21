<script setup lang="ts">
import { computed, ref, useId } from 'vue'

export type FileRejectionReason = 'type' | 'size' | 'limit' | 'duplicate'
export interface FileRejection { file: File; reason: FileRejectionReason }

const props = withDefaults(defineProps<{
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  label?: string
  description?: string
}>(), {
  accept: '*/*',
  multiple: true,
  maxFiles: 5,
  maxSize: 10 * 1024 * 1024,
  disabled: false,
  label: 'Drop files or browse',
})
const model = defineModel<File[]>({ default: () => [] })
const emit = defineEmits<{ accept: [files: File[]]; reject: [rejections: FileRejection[]] }>()
const input = ref<HTMLInputElement>()
const dragDepth = ref(0)
const dragging = computed(() => dragDepth.value > 0)
const helpId = `dropzone-help-${useId()}`
const help = computed(() => props.description ?? `${props.multiple ? `Up to ${props.maxFiles} files` : 'One file'}, ${formatSize(props.maxSize)} each`)

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)} MB`
  return `${Math.round(bytes / 1024)} KB`
}
function accepts(file: File) {
  if (!props.accept || props.accept === '*/*') return true
  return props.accept.split(',').some((entry) => {
    const rule = entry.trim().toLocaleLowerCase()
    if (rule.startsWith('.')) return file.name.toLocaleLowerCase().endsWith(rule)
    if (rule.endsWith('/*')) return file.type.toLocaleLowerCase().startsWith(rule.slice(0, -1))
    return file.type.toLocaleLowerCase() === rule
  })
}
function add(files: File[]) {
  if (props.disabled || !files.length) return
  const next = props.multiple ? [...model.value] : []
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  const limit = props.multiple ? Math.max(1, props.maxFiles) : 1
  for (const file of files) {
    if (!accepts(file)) rejected.push({ file, reason: 'type' })
    else if (file.size > props.maxSize) rejected.push({ file, reason: 'size' })
    else if (next.some(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) rejected.push({ file, reason: 'duplicate' })
    else if (next.length >= limit) rejected.push({ file, reason: 'limit' })
    else { next.push(file); accepted.push(file) }
  }
  model.value = next
  if (accepted.length) emit('accept', accepted)
  if (rejected.length) emit('reject', rejected)
}
function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  add(Array.from(target.files ?? []))
  target.value = ''
}
function onDragEnter() {
  if (!props.disabled) dragDepth.value++
}
function onDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
}
function onDrop(event: DragEvent) {
  dragDepth.value = 0
  add(Array.from(event.dataTransfer?.files ?? []))
}
function remove(index: number) {
  if (!props.disabled) model.value = model.value.filter((_, itemIndex) => itemIndex !== index)
}
</script>

<template>
  <div class="file-dropzone w-full max-w-[560px]" :class="{ 'is-dragging': dragging, 'is-disabled opacity-50': disabled }" @dragenter.prevent="onDragEnter" @dragover.prevent @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
    <input ref="input" class="file-input absolute size-px overflow-hidden whitespace-nowrap [clip:rect(0_0_0_0)]" type="file" :accept="accept" :multiple="multiple" :disabled="disabled" tabindex="-1" @change="onInput">
    <button
      type="button"
      class="dropzone-picker grid min-h-[220px] w-full cursor-pointer place-content-center place-items-center gap-[9px] rounded-3xl border-[1.5px] border-dashed border-[#17181435] bg-[#ffffff70] p-7 text-[#171814] transition-[border-color,background-color,transform] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:border-[#171814] hover:not-disabled:bg-[color-mix(in_srgb,var(--registry-accent,#d9ff57)_27%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#171814] disabled:cursor-not-allowed motion-reduce:transition-none"
      :class="{ '-translate-y-0.5 border-[#171814] bg-[color-mix(in_srgb,var(--registry-accent,#d9ff57)_27%,transparent)]': dragging }"
      :disabled="disabled" :aria-describedby="helpId" @click="input?.click()"
    >
      <span class="upload-mark grid size-12 place-items-center rounded-full bg-[#171814] text-[var(--registry-accent,#d9ff57)] [&_svg]:w-[21px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m-4 4 4-4 4 4M5 14v5h14v-5" /></svg></span>
      <strong class="text-sm">{{ dragging ? 'Release to add files' : label }}</strong>
      <small :id="helpId" class="text-[11px] text-[#17181470]">{{ help }}</small>
    </button>
    <div v-if="model.length" class="file-list mt-3">
      <div class="file-count mb-[7px] text-[10px] text-[#17181470]" role="status">{{ model.length }} {{ model.length === 1 ? 'file' : 'files' }} selected</div>
      <ul class="m-0 grid list-none gap-[7px] p-0">
        <li v-for="(file, index) in model" :key="`${file.name}-${file.size}-${file.lastModified}`" class="flex min-w-0 items-center gap-[11px] rounded-[14px] border border-[#17181412] bg-[#fff9] px-2.5 py-[9px]">
          <span class="file-icon grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#1718140c] text-[8px] font-bold text-[#17181480]" aria-hidden="true">{{ file.name.split('.').pop()?.slice(0, 3).toUpperCase() || 'FILE' }}</span>
          <span class="file-copy grid min-w-0 flex-1 gap-0.5"><strong class="truncate text-[11px]">{{ file.name }}</strong><small class="text-[9px] text-[#17181466]">{{ formatSize(file.size) }}</small></span>
          <button type="button" class="grid size-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-lg text-[#17181470] hover:not-disabled:bg-[#1718140c] hover:not-disabled:text-[#171814] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814] disabled:cursor-not-allowed" :aria-label="`Remove ${file.name}`" :disabled="disabled" @click="remove(index)">×</button>
        </li>
      </ul>
    </div>
  </div>
</template>
