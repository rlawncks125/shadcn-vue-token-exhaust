const REGISTRY_ORIGIN = 'https://registry.invalid'

function applyRequestOrigin(value: unknown, origin: string): unknown {
  if (typeof value === 'string') return value.replaceAll(REGISTRY_ORIGIN, origin)
  if (Array.isArray(value)) return value.map(item => applyRequestOrigin(item, origin))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, applyRequestOrigin(item, origin)]),
    )
  }
  return value
}

export default defineEventHandler(async (event) => {
  const name = /^\/r\/([a-z0-9-]+)\.json$/.exec(getRequestURL(event).pathname)?.[1]
  if (!name) {
    throw createError({ statusCode: 404, statusMessage: 'Registry item not found' })
  }

  const source = await useStorage().getItem<string>(`assets:registry:${name}.json`)
  if (!source) {
    throw createError({ statusCode: 404, statusMessage: 'Registry item not found' })
  }

  const registryItem = typeof source === 'string' ? JSON.parse(source) : source
  const origin = getRequestURL(event, { xForwardedHost: true }).origin
  setResponseHeaders(event, {
    'cache-control': 'public, max-age=0, must-revalidate',
    'cloudflare-cdn-cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    vary: 'Host, X-Forwarded-Host, X-Forwarded-Proto',
  })
  return applyRequestOrigin(registryItem, origin)
})
