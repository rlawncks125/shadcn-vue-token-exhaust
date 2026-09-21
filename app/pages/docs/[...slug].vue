<script setup lang="ts">
const route = useRoute()
const contentKey = computed(() => `docs:${route.path}`)
const { data: page } = await useAsyncData(contentKey, () => queryCollection('docs').path(route.path).first())

if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Documentation page not found' })

const toc = computed(() => page.value?.body?.toc?.links ?? [])

definePageMeta({ layout: 'docs' })
useSeoMeta({
  title: () => `${page.value?.title ?? 'Documentation'} · 71159176 UI`,
  description: () => page.value?.description,
})
</script>

<template>
  <div v-if="page" class="mx-auto grid max-w-[1180px] gap-12 px-5 py-12 sm:px-8 lg:px-12 lg:py-16 xl:grid-cols-[minmax(0,760px)_180px]">
    <article class="min-w-0">
      <header class="mb-12 border-b border-black/10 pb-10">
        <p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-strong">{{ page.eyebrow }}</p>
        <h1 class="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{{ page.title }}</h1>
        <p class="mt-5 max-w-2xl text-base leading-7 text-black/50">{{ page.description }}</p>
      </header>
      <ContentRenderer :value="page" class="docs-prose" />
    </article>

    <aside v-if="toc.length" class="hidden xl:block">
      <div class="sticky top-24 border-l border-black/10 pl-5">
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">On this page</p>
        <div class="space-y-2">
          <template v-for="link in toc" :key="link.id">
            <a :href="`#${link.id}`" class="block text-xs leading-5 text-black/45 hover:text-black">{{ link.text }}</a>
            <a v-for="child in link.children ?? []" :key="child.id" :href="`#${child.id}`" class="block pl-3 text-[11px] leading-5 text-black/35 hover:text-black">{{ child.text }}</a>
          </template>
        </div>
      </div>
    </aside>
  </div>
</template>
