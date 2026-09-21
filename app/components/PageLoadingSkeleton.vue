<template>
  <div class="min-h-screen bg-docs-shell text-foreground" role="status" aria-live="polite" aria-label="Loading page">
    <div class="flex h-14 items-center gap-4 border-b border-foreground/10 px-4 sm:px-6">
      <div class="skeleton size-7 rounded-md" />
      <div class="skeleton h-3 w-24 rounded-full" />
      <div class="ml-auto flex gap-2">
        <div class="skeleton hidden h-8 w-24 rounded-lg sm:block" />
        <div class="skeleton size-8 rounded-lg" />
      </div>
    </div>

    <div class="mx-auto grid max-w-[1680px] lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside class="hidden h-[calc(100vh-3.5rem)] space-y-7 border-r border-black/10 px-5 py-7 lg:block">
        <div class="skeleton h-9 rounded-lg" />
        <div v-for="group in 4" :key="group" class="space-y-3">
          <div class="skeleton h-2.5 w-20 rounded-full" />
          <div class="skeleton h-7 rounded-md" />
          <div class="skeleton h-7 w-4/5 rounded-md" />
        </div>
      </aside>

      <main class="min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div class="mx-auto max-w-5xl">
          <div class="skeleton mb-5 h-3 w-28 rounded-full" />
          <div class="skeleton h-12 w-3/4 max-w-xl rounded-xl sm:h-16" />
          <div class="mt-5 space-y-2.5">
            <div class="skeleton h-3.5 w-full max-w-2xl rounded-full" />
            <div class="skeleton h-3.5 w-3/5 max-w-lg rounded-full" />
          </div>
          <div class="skeleton mt-10 min-h-[360px] rounded-[28px] sm:min-h-[500px]" />
          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div v-for="item in 3" :key="item" class="skeleton h-20 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
    <span class="sr-only">Loading the requested page.</span>
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(105deg, rgb(0 0 0 / 0.055) 35%, rgb(255 255 255 / 0.72) 48%, rgb(0 0 0 / 0.055) 61%);
  background-size: 240% 100%;
  animation: page-skeleton 1.35s ease-in-out infinite;
}

@keyframes page-skeleton {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
