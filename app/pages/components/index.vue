<script setup lang="ts">
import { ArrowRight, Search } from '@lucide/vue'
import { categories, registryComponents } from '@/data/components'

const search = ref('')
const activeCategory = ref('all')

const filteredComponents = computed(() => {
  const query = search.value.trim().toLowerCase()
  return registryComponents.filter((component) => {
    const matchesCategory = activeCategory.value === 'all' || component.category === activeCategory.value
    const matchesQuery = !query || `${component.name} ${component.description} ${component.tags.join(' ')}`.toLowerCase().includes(query)
    return matchesCategory && matchesQuery
  })
})

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: 'Components · 71159176 UI',
  description: '설치 가능한 Vue 컴포넌트의 인터랙티브 문서와 API 레퍼런스입니다.',
})
</script>

<template>
  <div class="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
    <header class="border-b border-black/10 pb-10">
      <p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-strong">Library / {{ registryComponents.length }} components</p>
      <div class="grid gap-6 lg:grid-cols-[1fr_0.65fr] lg:items-end">
        <div>
          <h1 class="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Components</h1>
          <p class="mt-5 max-w-2xl text-base leading-7 text-black/50">작은 UI 단위부터 조합 가능한 wrapper까지, 실제 동작과 설치 명령을 한 문서에서 확인하세요.</p>
        </div>
        <label class="flex h-11 items-center gap-3 rounded-xl border border-black/10 bg-white/70 px-4 focus-within:border-black/25 lg:justify-self-end">
          <Search class="size-4 text-black/35" />
          <input v-model="search" type="search" placeholder="Search the library" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/30 lg:w-56">
        </label>
      </div>
    </header>

    <div class="flex gap-2 overflow-x-auto border-b border-black/10 py-5">
      <button class="h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors" :class="activeCategory === 'all' ? 'bg-[#171814] text-white' : 'border border-black/10 bg-white/50 text-black/55 hover:bg-white'" @click="activeCategory = 'all'">All {{ registryComponents.length }}</button>
      <button v-for="category in categories" :key="category.id" class="h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors" :class="activeCategory === category.id ? 'bg-[#171814] text-white' : 'border border-black/10 bg-white/50 text-black/55 hover:bg-white'" @click="activeCategory = category.id">{{ category.name }}</button>
    </div>

    <div v-if="filteredComponents.length" class="grid gap-3 py-8 md:grid-cols-2">
      <NuxtLink v-for="component in filteredComponents" :key="component.slug" :to="`/components/${component.slug}`" class="group flex min-h-44 flex-col justify-between rounded-2xl border border-black/10 bg-white/45 p-5 transition-all hover:border-black/20 hover:bg-white">
        <div>
          <div class="flex items-start justify-between gap-5">
            <span class="rounded-md bg-black/[0.045] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-black/45">{{ component.category }}</span>
            <ArrowRight class="size-4 text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-black" />
          </div>
          <h2 class="mt-6 text-xl font-semibold tracking-[-0.03em]">{{ component.name }}</h2>
          <p class="mt-2 text-sm leading-6 text-black/45">{{ component.description }}</p>
        </div>
        <div class="mt-5 flex flex-wrap gap-1.5">
          <span v-for="tag in component.tags" :key="tag" class="text-[10px] text-black/35">#{{ tag }}</span>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="grid min-h-72 place-items-center text-center">
      <div><p class="font-medium">No components found.</p><button class="mt-2 text-sm text-black/45 underline underline-offset-4" @click="search = ''; activeCategory = 'all'">Reset filters</button></div>
    </div>
  </div>
</template>
