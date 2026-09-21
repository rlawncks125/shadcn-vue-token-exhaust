<script setup lang="ts">
import { ArrowRight, ArrowLeft } from '@lucide/vue'
import { getCategory, registryComponents } from '@/data/components'

const route = useRoute()
const category = computed(() => getCategory(String(route.params.category)))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

const items = computed(() => registryComponents.filter(component => component.category === category.value?.id))

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: () => `${category.value?.name ?? 'Category'} · 71159176 UI`,
  description: () => category.value?.description,
  ogTitle: () => `${category.value?.name ?? 'Category'} · 71159176 UI`,
  ogDescription: () => category.value?.description,
  twitterTitle: () => `${category.value?.name ?? 'Category'} · 71159176 UI`,
  twitterDescription: () => category.value?.description,
})
</script>

<template>
  <div v-if="category" class="mx-auto min-h-[75vh] max-w-[1180px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
    <NuxtLink to="/components" class="mb-12 inline-flex items-center gap-2 text-xs font-medium text-black/45 hover:text-black"><ArrowLeft class="size-3.5" /> Component archive</NuxtLink>
    <div class="grid gap-8 border-b border-black/10 pb-12 lg:grid-cols-[0.2fr_1fr_0.5fr] lg:items-end">
      <span class="font-mono text-sm text-black/30">{{ category.number }}</span>
      <h1 class="text-6xl font-semibold tracking-[-0.065em] sm:text-8xl">{{ category.name }}</h1>
      <p class="max-w-sm text-sm leading-6 text-black/45 lg:justify-self-end">{{ category.description }}</p>
    </div>

    <div class="divide-y divide-black/10">
      <NuxtLink v-for="(item, index) in items" :key="item.slug" :to="`/components/${item.slug}`" class="group grid gap-5 py-8 sm:grid-cols-[60px_1fr_auto] sm:items-center">
        <span class="font-mono text-xs text-black/25">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h2 class="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{{ item.name }}</h2>
          <p class="mt-2 max-w-xl text-sm leading-6 text-black/45">{{ item.description }}</p>
        </div>
        <span class="grid size-11 place-items-center rounded-full border border-black/10 transition-all group-hover:border-brand group-hover:bg-brand"><ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" /></span>
      </NuxtLink>
    </div>
  </div>
</template>
