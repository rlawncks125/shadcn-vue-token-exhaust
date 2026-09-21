<template>
  <div class="min-h-[calc(100vh-3.5rem)] px-5 py-10 sm:px-8 lg:px-12 lg:py-14" role="status" aria-live="polite" aria-label="Loading page content">
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
    <span class="sr-only">Loading the requested content.</span>
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
