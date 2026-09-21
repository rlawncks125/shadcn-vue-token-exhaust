import { categories, registryComponents } from '../../data/components'

const docs = ['/docs', '/docs/installation', '/docs/registry', '/docs/theming']

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] ?? character)
}

export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')
  const staticRoutes = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/components', changefreq: 'weekly', priority: '0.9' },
    ...docs.map(path => ({ path, changefreq: 'monthly', priority: '0.7' })),
    ...categories.map(category => ({ path: `/categories/${category.id}`, changefreq: 'weekly', priority: '0.7' })),
  ]
  const componentRoutes = registryComponents.map(component => ({
    path: `/components/${component.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: component.updated.replaceAll('.', '-'),
  }))
  const urls = [...staticRoutes, ...componentRoutes].map(route => [
    '<url>',
    `<loc>${escapeXml(`${siteUrl}${route.path}`)}</loc>`,
    'lastmod' in route ? `<lastmod>${route.lastmod}</lastmod>` : '',
    `<changefreq>${route.changefreq}</changefreq>`,
    `<priority>${route.priority}</priority>`,
    '</url>',
  ].filter(Boolean).join('')).join('')

  setResponseHeaders(event, {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    'cloudflare-cdn-cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  })
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})
