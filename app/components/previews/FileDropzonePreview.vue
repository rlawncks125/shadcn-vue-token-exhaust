<script setup lang="ts">
import type { FileRejection } from '#registry/default/file-dropzone/FileDropzone.vue'
import FileDropzone from '#registry/default/file-dropzone/FileDropzone.vue'

const props = withDefaults(defineProps<{ accept?: string; maxFiles?: number; maxSizeMb?: number; disabled?: boolean }>(), { accept: '*/*', maxFiles: 3, maxSizeMb: 5, disabled: false })
const files = ref<File[]>([])
const message = ref('Choose files to test validation')
function reject(items: FileRejection[]) { message.value = `Rejected ${items.length} file: ${items.map(item => item.reason).join(', ')}` }
function accepted() { message.value = `${files.value.length} file accepted` }
</script>

<template>
  <div class="w-full max-w-xl">
    <FileDropzone v-model="files" :accept="accept" :max-files="maxFiles" :max-size="maxSizeMb * 1024 * 1024" :disabled="disabled" @accept="accepted" @reject="reject" />
    <p class="mt-4 text-center text-xs text-black/40" role="status">{{ message }}</p>
  </div>
</template>
