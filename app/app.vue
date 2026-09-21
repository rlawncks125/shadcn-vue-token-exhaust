<script setup lang="ts">
const pagePending = useState('page-pending', () => false)
</script>

<template>
  <NuxtLoadingIndicator color="#171814" :height="2" :throttle="100" />
  <NuxtRouteAnnouncer />
  <div v-show="!pagePending" :aria-hidden="pagePending || undefined">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <PageLoadingSkeleton v-if="pagePending" />
</template>
