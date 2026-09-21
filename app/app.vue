<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl.replace(/\/$/, '')
const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '/' : route.path}`)
const socialImage = `${siteUrl}/og-image.png`

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '71159176 UI Registry',
      url: `${siteUrl}/`,
      description: 'Nuxt와 shadcn-vue로 만든 설치 가능한 Vue 컴포넌트 레지스트리',
      inLanguage: ['ko', 'en'],
    }),
  }],
}))

useSeoMeta({
  ogType: 'website',
  ogSiteName: '71159176 UI Registry',
  ogLocale: 'ko_KR',
  ogUrl: () => canonicalUrl.value,
  ogImage: socialImage,
  ogImageAlt: '71159176 UI Registry - Small pieces. Sharp ideas.',
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: socialImage,
  twitterImageAlt: '71159176 UI Registry - Small pieces. Sharp ideas.',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
})
</script>

<template>
  <NuxtLoadingIndicator color="#171814" :height="2" :throttle="100" />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
