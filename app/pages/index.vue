<script setup lang="ts">
import { ArrowRight, Check, Copy, MoveUpRight } from '@lucide/vue'
import { categories, getInstallCommand, registryComponents } from '@/data/components'
import { copyText } from '@/utils/clipboard'

const copied = ref(false)
const command = getInstallCommand('interactive-hover-button', useRequestURL({ xForwardedHost: true }).origin)
const latestComponents = registryComponents.slice(0, 4)

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

useSeoMeta({
  title: '71159176 UI Registry',
  description: '설치 가능한 shadcn-vue 컴포넌트를 탐색하고 디자인하는 Nuxt 레지스트리입니다.',
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden border-b border-black/10">
      <div class="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:48px_48px]" />
      <div class="relative mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-36">
        <div>
          <div class="mb-7 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span class="size-1.5 rounded-full bg-brand-strong" />
            Open component registry
          </div>
          <h1 class="max-w-4xl text-[clamp(3.4rem,8vw,7.8rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
            Small pieces.<br>
            <span class="font-normal italic text-black/35">Sharp ideas.</span>
          </h1>
          <p class="mt-8 max-w-xl text-base leading-7 text-black/55 sm:text-lg">
            Nuxt와 shadcn-vue를 기반으로, 복사 대신 설치하는 인터랙티브 컴포넌트 컬렉션입니다.
          </p>
          <div class="mt-9 flex flex-wrap items-center gap-3">
            <NuxtLink to="/components" class="inline-flex h-11 items-center gap-2 rounded-full bg-[#171814] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Browse components
              <ArrowRight class="size-4" />
            </NuxtLink>
            <NuxtLink to="/docs/registry" class="inline-flex h-11 items-center rounded-full border border-black/15 bg-white/50 px-5 text-sm font-medium transition-colors hover:bg-white">
              How it works
            </NuxtLink>
          </div>
        </div>

        <div class="self-end lg:pb-2">
          <div class="overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#171814] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
            <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full bg-[#ff6b4a]" />
                <span class="size-2 rounded-full bg-[#ffd15c]" />
                <span class="size-2 rounded-full bg-brand" />
              </div>
              <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">one command install</span>
            </div>
            <div class="p-5 sm:p-7">
              <p class="mb-3 text-xs text-white/40">Terminal</p>
              <button class="group flex w-full items-start justify-between gap-5 text-left" @click="copyCommand">
                <code class="break-all font-mono text-xs leading-6 text-brand sm:text-sm">{{ command }}</code>
                <span class="mt-1 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors group-hover:bg-white/10 group-hover:text-white">
                  <Check v-if="copied" class="size-3.5 text-brand" />
                  <Copy v-else class="size-3.5" />
                </span>
              </button>
            </div>
          </div>
          <div class="mt-4 flex justify-between px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-black/35">
            <span>Vue 3</span><span>TypeScript</span><span>Tailwind v4</span><span>Nuxt 3</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div class="mb-10 flex items-end justify-between gap-5">
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Catalog / {{ String(categories.length).padStart(2, '0') }}</p>
          <h2 class="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Browse by category</h2>
        </div>
        <p class="hidden max-w-xs text-right text-sm leading-6 text-black/45 md:block">작업 단위를 명확히 나눠 컴포넌트를 빠르게 찾고 개선할 수 있습니다.</p>
      </div>

      <div class="grid border-l border-t border-black/10 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/categories/${category.id}`"
          class="group min-h-64 border-b border-r border-black/10 bg-white/25 p-6 transition-colors hover:bg-brand sm:p-8"
        >
          <div class="flex items-start justify-between">
            <span class="font-mono text-xs text-black/35">{{ category.number }}</span>
            <MoveUpRight class="size-5 text-black/25 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-black" />
          </div>
          <div class="mt-24">
            <h3 class="text-2xl font-semibold tracking-[-0.035em]">{{ category.name }}</h3>
            <p class="mt-2 max-w-xs text-sm leading-6 text-black/50 group-hover:text-black/65">{{ category.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="border-y border-black/10 bg-white/55">
      <div class="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div class="mb-12 flex items-center justify-between">
          <div>
            <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Ready to install</p>
            <h2 class="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Latest components</h2>
          </div>
          <NuxtLink to="/components" class="hidden items-center gap-2 text-sm font-medium sm:flex">View all <ArrowRight class="size-4" /></NuxtLink>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <article v-for="component in latestComponents" :key="component.slug" class="group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-black/10 bg-shell transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl">
            <div class="flex min-h-72 min-w-0 flex-1 items-center overflow-hidden border-b border-black/10 bg-canvas p-4 sm:p-6">
              <LatestComponentPreview :slug="component.slug" />
            </div>
            <NuxtLink :to="`/components/${component.slug}`" class="block p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">{{ component.category }}</span>
                <ArrowRight class="size-4 text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-black" />
              </div>
              <h3 class="font-semibold tracking-[-0.02em]">{{ component.name }}</h3>
              <p class="mt-2 line-clamp-2 text-sm leading-6 text-black/45">{{ component.description }}</p>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
