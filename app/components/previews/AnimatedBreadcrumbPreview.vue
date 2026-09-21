<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedBreadcrumb, { type AnimatedBreadcrumbItem } from '../../../registry/default/animated-breadcrumb/AnimatedBreadcrumb.vue'

const props = withDefaults(defineProps<{
  maxItems?: number
  duration?: number
  disabled?: boolean
}>(), {
  maxItems: 4,
  duration: 260,
  disabled: false,
})

const hierarchy: AnimatedBreadcrumbItem[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'projects', label: 'Projects' },
  { id: 'northstar', label: 'Northstar' },
  { id: 'research', label: 'Research' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'insights', label: 'Insights' },
  { id: 'patterns', label: 'Patterns' },
]

const depth = ref(5)
const message = ref('Interviews is the current page.')
const path = computed(() => hierarchy.slice(0, depth.value))
const currentItem = computed(() => path.value.at(-1)!)
const canGoBack = computed(() => depth.value > 1 && !props.disabled)
const canDrillDown = computed(() => depth.value < hierarchy.length && !props.disabled)

function selectItem(item: AnimatedBreadcrumbItem, index: number) {
  depth.value = index + 1
  message.value = `Moved back to ${item.label}.`
}

function goBack() {
  if (!canGoBack.value) return
  depth.value -= 1
  message.value = `Moved back to ${currentItem.value.label}.`
}

function drillDown() {
  if (!canDrillDown.value) return
  depth.value += 1
  message.value = `Opened ${currentItem.value.label}.`
}
</script>

<template>
  <div class="flex min-h-[430px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#e9e7df] p-4 sm:min-h-[500px] sm:p-8">
    <section class="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#fbfaf6] shadow-[0_28px_80px_-42px_rgba(31,35,25,0.55)]">
      <header class="flex items-center justify-between border-b border-black/8 px-5 py-4 sm:px-7">
        <div class="flex items-center gap-3">
          <span class="grid size-9 place-items-center rounded-xl bg-[#20241c] text-[11px] font-bold tracking-wider text-brand">NS</span>
          <div>
            <p class="text-sm font-semibold tracking-[-0.02em] text-[#20241c]">Northstar files</p>
            <p class="text-[10px] uppercase tracking-[0.16em] text-black/40">Shared workspace</p>
          </div>
        </div>
        <span class="hidden rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/45 sm:block">{{ depth }} levels deep</span>
      </header>

      <div class="px-5 py-6 sm:px-7 sm:py-8">
        <div class="overflow-x-auto pb-2">
          <AnimatedBreadcrumb
            :items="path"
            :max-items="maxItems"
            :duration="duration"
            :disabled="disabled"
            separator="/"
            aria-label="Northstar file path"
            @select="selectItem"
          />
        </div>

        <div class="mt-5 rounded-[1.4rem] border border-black/8 bg-white p-5 sm:p-7">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#657154]">Current collection</p>
              <h3 class="truncate text-2xl font-semibold tracking-[-0.045em] text-[#20241c] sm:text-3xl">{{ currentItem.label }}</h3>
              <p class="mt-2 max-w-md text-xs leading-5 text-black/45 sm:text-sm">Navigate backward through the breadcrumb or open the next collection to watch the path reorganize.</p>
            </div>
            <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef8cc] text-[#4d5b29]">
              <svg class="size-5 fill-none stroke-current stroke-[1.6]" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h6l2-2h9v13h-17z" stroke-linejoin="round" /></svg>
            </span>
          </div>

          <div class="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/12 bg-transparent px-4 text-xs font-semibold text-[#20241c] outline-none transition-[background-color,transform] hover:not-disabled:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#657154] focus-visible:ring-offset-2 active:not-disabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
              :disabled="!canGoBack"
              @click="goBack"
            >
              <svg class="size-3.5 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 5-5 5 5 5" /></svg>
              Back one level
            </button>
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#20241c] bg-[#20241c] px-4 text-xs font-semibold text-white outline-none transition-[background-color,transform] hover:not-disabled:bg-[#34392d] focus-visible:ring-2 focus-visible:ring-[#657154] focus-visible:ring-offset-2 active:not-disabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
              :disabled="!canDrillDown"
              @click="drillDown"
            >
              Open {{ hierarchy[depth]?.label ?? 'next level' }}
              <svg class="size-3.5 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 5 5 5-5 5" /></svg>
            </button>
          </div>
        </div>

        <p data-testid="breadcrumb-status" class="mt-4 text-xs text-black/45" role="status" aria-live="polite">{{ message }}</p>
      </div>
    </section>
  </div>
</template>
