<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { getInstallCommand } from '@/data/components'
import { copyText } from '@/utils/clipboard'

const props = defineProps<{ slug: string }>()
const command = getInstallCommand(props.slug, useRequestURL({ xForwardedHost: true }).origin)
const copied = ref(false)

async function copyCommand() {
  try {
    await copyText(command)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1600)
  }
  catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="relative">
    <pre><code>{{ command }}</code></pre>
    <button
      type="button"
      class="absolute right-3 top-3 grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      :aria-label="copied ? 'Install command copied' : 'Copy install command'"
      @click="copyCommand"
    >
      <Check v-if="copied" class="size-3.5 text-brand" />
      <Copy v-else class="size-3.5" />
    </button>
  </div>
</template>
