<script setup lang="ts">
import { ArrowUpRight, GitBranch } from '@lucide/vue'
</script>

<template>
  <div class="min-h-screen bg-shell text-foreground transition-colors duration-300 motion-reduce:transition-none">
    <header class="sticky top-0 z-50 border-b border-foreground/10 bg-shell/90 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <NuxtLink to="/" class="group flex items-center gap-3">
          <span class="grid size-8 place-items-center rounded-lg bg-foreground text-[11px] font-bold text-brand transition-transform duration-300 group-hover:-rotate-6">71</span>
          <span class="text-sm font-semibold tracking-[-0.02em]">UI Registry</span>
        </NuxtLink>

        <nav class="hidden items-center gap-7 text-sm text-black/55 md:flex">
          <NuxtLink to="/components" class="transition-colors hover:text-black" active-class="!text-black">Components</NuxtLink>
          <NuxtLink to="/categories/buttons" class="transition-colors hover:text-black" active-class="!text-black">Categories</NuxtLink>
          <NuxtLink to="/docs/registry" class="transition-colors hover:text-black" active-class="!text-black">Registry guide</NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <ThemeSwitcher />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 px-3.5 text-xs font-medium transition-colors hover:bg-background"
          >
            <GitBranch class="size-3.5" />
            <span class="hidden sm:inline">Source</span>
            <ArrowUpRight class="size-3" />
          </a>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-black/10">
      <div class="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Built with Nuxt 3, shadcn-vue, and deliberate details.</p>
        <div class="flex gap-5">
          <NuxtLink to="/components" class="hover:text-black">All components</NuxtLink>
          <NuxtLink to="/docs/registry" class="hover:text-black">Publish a component</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
