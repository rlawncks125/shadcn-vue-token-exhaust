<script setup lang="ts">
import { BookOpen, Boxes, Search } from '@lucide/vue'

interface GuidePage { title?: string; path?: string; description?: string; order: number }
interface ComponentItem { slug: string; name: string }
interface ComponentGroup { id: string; name: string; number: string; items: ComponentItem[] }

defineProps<{ guidePages: GuidePage[]; componentGroups: ComponentGroup[] }>()
const search = defineModel<string>('search', { required: true })
</script>

<template>
  <nav aria-label="Documentation">
    <label class="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white/65 px-3 focus-within:border-black/25">
      <Search class="size-3.5 text-black/35" />
      <input v-model="search" type="search" placeholder="Search components" class="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-black/30">
    </label>

    <div class="mt-7">
      <p class="mb-2 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35"><BookOpen class="size-3" /> Guides</p>
      <NuxtLink v-for="page in guidePages" :key="page.path" :to="page.path" class="block rounded-lg px-2 py-2 text-[13px] text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black" active-class="!bg-black/[0.06] !font-medium !text-black">{{ page.title }}</NuxtLink>
    </div>

    <div class="mt-7">
      <div class="mb-3 flex items-center justify-between px-2">
        <p class="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35"><Boxes class="size-3" /> Components</p>
        <NuxtLink to="/components" class="text-[10px] text-black/35 hover:text-black">View all</NuxtLink>
      </div>
      <div v-if="componentGroups.length" class="space-y-5">
        <section v-for="group in componentGroups" :key="group.id">
          <NuxtLink :to="`/categories/${group.id}`" class="mb-1 flex items-center justify-between rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35 hover:text-black">
            {{ group.name }} <span class="font-mono">{{ group.number }}</span>
          </NuxtLink>
          <NuxtLink v-for="component in group.items" :key="component.slug" :to="`/components/${component.slug}`" class="block rounded-lg px-2 py-1.5 text-[13px] text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black" active-class="!bg-brand-soft !font-medium !text-black">{{ component.name }}</NuxtLink>
        </section>
      </div>
      <p v-else class="px-2 text-xs leading-5 text-black/40">No components match “{{ search }}”.</p>
    </div>
  </nav>
</template>
