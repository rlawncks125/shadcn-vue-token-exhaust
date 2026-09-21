import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3015,
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://shadcn.71159176.xyz',
    },
  },
  routeRules: {
    '/': {
      prerender: true,
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate',
        'cloudflare-cdn-cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
    '/components/**': {
      ssr: true,
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate',
        'cloudflare-cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  },
  modules: ['shadcn-nuxt', '@nuxt/content'],
  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        highlight: { theme: 'github-dark-default' },
        toc: { depth: 3, searchDepth: 3 },
      },
    },
  },
  css: ['~/assets/css/tailwind.css'],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
  },
  nitro: {
    compressPublicAssets: true,
    serverAssets: [
      {
        baseName: 'registry',
        dir: fileURLToPath(new URL('./.registry', import.meta.url)),
      },
    ],
  },
  alias: {
    '#registry': fileURLToPath(new URL('./registry', import.meta.url)),
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      title: '71159176 UI Registry',
      meta: [
        {
          name: 'description',
          content: 'Nuxt와 shadcn-vue로 만든 재사용 가능한 Vue 컴포넌트 레지스트리',
        },
      ],
    },
  },
})
