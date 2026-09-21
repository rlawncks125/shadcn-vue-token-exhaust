<script setup lang="ts">
import { Check, Palette } from '@lucide/vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { RegistryTheme } from '@/composables/useRegistryTheme'

const { theme, themes, setTheme } = useRegistryTheme()
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)

async function choose(value: RegistryTheme) {
  setTheme(value)
  open.value = false
  await nextTick()
  trigger.value?.focus()
}

function handlePointerDown(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  open.value = false
  nextTick(() => trigger.value?.focus())
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      ref="trigger"
      type="button"
      class="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 bg-background/45 px-3 text-xs font-medium text-foreground/65 outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-strong/40"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-label="Choose color theme"
      @click="open = !open"
    >
      <Palette class="size-3.5" />
      <span class="hidden sm:inline">Theme</span>
      <span class="size-2.5 rounded-full border border-foreground/15 bg-brand" aria-hidden="true" />
    </button>

    <Transition
      enter-active-class="transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
      leave-active-class="transition-[opacity,transform] duration-150 ease-in motion-reduce:transition-none"
      enter-from-class="-translate-y-1 scale-95 opacity-0"
      leave-to-class="-translate-y-1 scale-95 opacity-0"
    >
      <div v-if="open" role="menu" aria-label="Color themes" class="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-48 rounded-2xl border border-foreground/10 bg-popover p-1.5 text-popover-foreground shadow-[0_24px_70px_-30px_rgba(0,0,0,0.45)]">
        <button
          v-for="option in themes"
          :key="option.id"
          type="button"
          role="menuitemradio"
          :aria-checked="theme === option.id"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
          @click="choose(option.id)"
        >
          <span class="size-4 rounded-full border border-foreground/15" :style="{ backgroundColor: option.color }" />
          <span class="flex-1">{{ option.label }}</span>
          <Check v-if="theme === option.id" class="size-3.5 text-brand-strong" />
        </button>
      </div>
    </Transition>
  </div>
</template>
