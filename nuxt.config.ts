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
