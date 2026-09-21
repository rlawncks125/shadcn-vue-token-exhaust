<script setup lang="ts">
import { ArrowUpRight, GitBranch, Menu, X } from '@lucide/vue'
import { categories, registryComponents } from '@/data/components'

const route = useRoute()
const mobileOpen = ref(false)
const search = ref('')

const { data: guidePages } = await useAsyncData('docs-navigation', () => queryCollection('docs')
  .select('title', 'path', 'description', 'order')
  .order('order', 'ASC')
  .all())

const componentGroups = computed(() => {
  const query = search.value.trim().toLowerCase()
  return categories.map(category => ({
    ...category,
    items: registryComponents.filter(component => component.category === category.id && (!query || `${component.name} ${component.tags.join(' ')}`.toLowerCase().includes(query))),
  })).filter(category => category.items.length)
})

watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
  <div class="min-h-screen bg-docs-shell text-foreground transition-colors duration-300 motion-reduce:transition-none">
    <header class="sticky top-0 z-50 border-b border-foreground/10 bg-docs-shell/92 backdrop-blur-xl">
      <div class="flex h-14 items-center gap-4 px-4 sm:px-6">
        <NuxtLink to="/" class="group flex shrink-0 items-center gap-2.5">
          <span class="grid size-7 place-items-center rounded-md bg-foreground text-[10px] font-bold text-brand transition-transform group-hover:-rotate-6">71</span>
          <span class="text-sm font-semibold tracking-[-0.02em]">UI Registry</span>
        </NuxtLink>
        <span class="hidden h-5 w-px bg-black/10 sm:block" />
        <NuxtLink to="/docs" class="hidden text-xs font-medium text-black/45 transition-colors hover:text-black sm:block">Documentation</NuxtLink>
        <div class="ml-auto flex items-center gap-2">
          <NuxtLink to="/components" class="hidden rounded-lg px-3 py-2 text-xs font-medium text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black sm:block">Components</NuxtLink>
          <a href="https://github.com" target="_blank" rel="noreferrer" class="hidden h-8 items-center gap-2 rounded-lg border border-black/10 px-3 text-xs font-medium hover:bg-white sm:inline-flex">
            <GitBranch class="size-3.5" /> Source <ArrowUpRight class="size-3" />
          </a>
          <ThemeSwitcher />
          <button type="button" class="grid size-9 place-items-center rounded-lg border border-black/10 lg:hidden" :aria-expanded="mobileOpen" aria-label="Toggle documentation navigation" @click="mobileOpen = !mobileOpen">
            <X v-if="mobileOpen" class="size-4" /><Menu v-else class="size-4" />
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-[1680px] lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside class="hidden h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-black/10 px-5 py-7 lg:sticky lg:top-14 lg:block">
        <DocsNavigation v-model:search="search" :guide-pages="guidePages ?? []" :component-groups="componentGroups" />
      </aside>

      <div v-if="mobileOpen" class="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-docs-shell px-5 py-7 lg:hidden">
        <DocsNavigation v-model:search="search" :guide-pages="guidePages ?? []" :component-groups="componentGroups" />
      </div>

      <main class="min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
