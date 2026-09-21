import vue from '@shikijs/langs/vue'
import githubDarkDefault from '@shikijs/themes/github-dark-default'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { getComponentExample } from '../../../data/component-examples'

const highlighterPromise = createHighlighterCore({
  themes: [githubDarkDefault],
  langs: [vue],
  engine: createJavaScriptRegexEngine(),
})

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const code = getComponentExample(slug)

  if (!code) throw createError({ statusCode: 404, statusMessage: 'Component example not found' })

  const highlighter = await highlighterPromise
  setResponseHeaders(event, {
    'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    'cloudflare-cdn-cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  })

  return {
    html: highlighter.codeToHtml(code, {
      lang: 'vue',
      theme: 'github-dark-default',
    }),
  }
})
