<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface CommandMenuItem {
  id: string
  label: string
  description?: string
  group?: string
  keywords?: string[]
  shortcut?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  items: CommandMenuItem[]
  label?: string
  placeholder?: string
  emptyLabel?: string
  openOnShortcut?: boolean
}>(), {
  label: 'Command menu',
  placeholder: 'Search commands...',
  emptyLabel: 'No matching commands',
  openOnShortcut: true,
})
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ select: [item: CommandMenuItem] }>()
const query = ref('')
const activeIndex = ref(-1)
const input = ref<HTMLInputElement>()
const closeButton = ref<HTMLButtonElement>()
const listId = `command-list-${useId()}`
let previousFocus: HTMLElement | null = null
let previousOverflow = ''

const filtered = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  if (!term) return props.items
  return props.items.filter((item) => [item.label, item.description, item.group, ...(item.keywords ?? [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(term))
})
const activeItem = computed(() => filtered.value[activeIndex.value])

function firstEnabled() {
  return filtered.value.findIndex(item => !item.disabled)
}
function move(step: 1 | -1) {
  if (!filtered.value.length) return
  let index = activeIndex.value
  for (let attempts = 0; attempts < filtered.value.length; attempts++) {
    index = (index + step + filtered.value.length) % filtered.value.length
    if (!filtered.value[index]?.disabled) {
      activeIndex.value = index
      nextTick(() => document.getElementById(`${listId}-${filtered.value[index]?.id}`)?.scrollIntoView({ block: 'nearest' }))
      return
    }
  }
}
function choose(item = activeItem.value) {
  if (!item || item.disabled) return
  emit('select', item)
  open.value = false
}
function close() {
  open.value = false
}
function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Enter') { event.preventDefault(); choose() }
  else if (event.key === 'Escape') { event.preventDefault(); close() }
  else if (event.key === 'Tab') {
    event.preventDefault()
    closeButton.value?.focus()
  }
}
function onDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); close() }
  else if (event.key === 'Tab' && event.target === closeButton.value) {
    event.preventDefault()
    input.value?.focus()
  }
}
function onGlobalKeydown(event: KeyboardEvent) {
  if (props.openOnShortcut && event.key.toLocaleLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    open.value = !open.value
  }
}
async function activate() {
  previousFocus = document.activeElement as HTMLElement | null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  query.value = ''
  activeIndex.value = firstEnabled()
  await nextTick()
  input.value?.focus()
}
function deactivate() {
  document.body.style.overflow = previousOverflow
  previousFocus?.focus()
}

watch(() => filtered.value.map(item => item.id).join('|'), () => { activeIndex.value = firstEnabled() })
watch(open, value => value ? activate() : deactivate())
onMounted(() => { window.addEventListener('keydown', onGlobalKeydown); if (open.value) activate() })
onBeforeUnmount(() => { window.removeEventListener('keydown', onGlobalKeydown); document.body.style.overflow = previousOverflow })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-[180ms] [&_.command-menu]:[transition:transform_280ms_cubic-bezier(.16,1,.3,1),opacity_180ms] motion-reduce:transition-none motion-reduce:[&_.command-menu]:transition-none"
      leave-active-class="transition-opacity duration-[180ms] [&_.command-menu]:[transition:transform_280ms_cubic-bezier(.16,1,.3,1),opacity_180ms] motion-reduce:transition-none motion-reduce:[&_.command-menu]:transition-none"
      enter-from-class="opacity-0 [&_.command-menu]:-translate-y-[14px] [&_.command-menu]:scale-[.97] [&_.command-menu]:opacity-0"
      leave-to-class="opacity-0 [&_.command-menu]:-translate-y-[14px] [&_.command-menu]:scale-[.97] [&_.command-menu]:opacity-0"
    >
      <div v-if="open" class="command-backdrop fixed inset-0 z-[100] grid items-start justify-items-center bg-[#10110db8] px-4 pt-[min(14vh,120px)] pb-6 backdrop-blur-[8px] max-[520px]:pt-3" @mousedown.self="close">
        <section class="command-menu w-[min(600px,100%)] overflow-hidden rounded-3xl border border-[#ffffff24] bg-[#f5f4ed] text-[#171814] shadow-[0_35px_100px_#0008] max-[520px]:rounded-[20px]" role="dialog" aria-modal="true" :aria-label="label" @keydown="onDialogKeydown">
          <header class="command-header flex h-[66px] items-center gap-3 border-b border-[#17181418] px-[17px]">
            <svg class="w-5 fill-none stroke-current stroke-[1.6] [stroke-linecap:round]" aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
            <input
              ref="input" v-model="query" role="combobox" :placeholder="placeholder" autocomplete="off"
              class="min-w-0 flex-1 border-0 bg-transparent [font:inherit] text-[15px] text-inherit outline-none placeholder:text-[#17181466]"
              aria-autocomplete="list" aria-expanded="true" :aria-controls="listId"
              :aria-activedescendant="activeItem ? `${listId}-${activeItem.id}` : undefined" @keydown="onInputKeydown"
            >
            <button ref="closeButton" type="button" class="command-close cursor-pointer rounded-[7px] border border-[#17181418] bg-[#fff8] px-[7px] py-1 [font:inherit] text-[10px] text-[#17181480] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171814]" aria-label="Close command menu" @click="close">Esc</button>
          </header>
          <div :id="listId" class="command-results max-h-[min(430px,56vh)] overflow-y-auto p-2" role="listbox" :aria-label="`${label} results`">
            <button
              v-for="(item, index) in filtered" :id="`${listId}-${item.id}`" :key="item.id" type="button"
              class="command-item flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] border-0 bg-transparent p-3 text-left text-inherit"
              :class="{ 'is-active bg-[var(--registry-accent,#d9ff57)]': index === activeIndex, 'is-disabled cursor-not-allowed opacity-[.35]': item.disabled }"
              role="option" :aria-selected="index === activeIndex" :aria-disabled="item.disabled || undefined"
              @mousemove="!item.disabled && (activeIndex = index)" @mousedown.prevent @click="choose(item)"
            >
              <span class="command-copy grid min-w-0 flex-1 gap-[3px]"><strong class="text-[13px]">{{ item.label }}</strong><small v-if="item.description" class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#17181488]">{{ item.description }}</small></span>
              <span v-if="item.group" class="command-group text-[9px] tracking-[.1em] text-[#17181466] uppercase max-[520px]:hidden">{{ item.group }}</span><kbd v-if="item.shortcut" class="min-w-[27px] rounded-md border border-[#1718141f] bg-[#fff8] px-[5px] py-[3px] text-center text-[9px] text-[#17181480]">{{ item.shortcut }}</kbd>
            </button>
            <p v-if="!filtered.length" class="command-empty px-5 py-14 text-center text-[13px] text-[#17181466]">{{ emptyLabel }}</p>
          </div>
          <footer class="flex gap-4 border-t border-[#17181418] px-[18px] py-2.5 text-[9px] text-[#17181466] max-[520px]:justify-center"><span class="flex items-center gap-[5px] max-[520px]:hidden"><kbd class="font-bold text-[#171814]">up/down</kbd> Navigate</span><span class="flex items-center gap-[5px]"><kbd class="font-bold text-[#171814]">Enter</kbd> Select</span><span class="flex items-center gap-[5px]"><kbd class="font-bold text-[#171814]">Esc</kbd> Close</span></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
