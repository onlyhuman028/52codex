import { normalizeSnapshot } from '../../.vitepress/theme/codex-reset-data.mjs'

const SOURCE = 'https://aihot.news/api/v1/codex-resets'
const CACHE_CONTROL = 'public, max-age=60, s-maxage=600'

export async function onRequestGet({ request, waitUntil }) {
  const view = new URL(request.url).searchParams.get('view') || 'full'
  if (!['full', 'recent'].includes(view)) return json({ error: 'invalid_view' }, 400)
  const cache = globalThis.caches?.default
  const cacheUrl = new URL(request.url)
  cacheUrl.search = `?view=${view}&version=1`
  const cacheKey = new Request(cacheUrl)
  const etag = request.headers.get('If-None-Match') || ''
  try {
    const cached = await cache?.match(cacheKey)
    if (cached) return conditional(cached, etag)
  } catch { /* A cache failure must not disable the monitor. */ }

  const controller = new AbortController()
  let timer
  try {
    const response = await Promise.race([
      (async () => {
        const upstream = await fetch(view === 'recent' ? `${SOURCE}/recent` : SOURCE, {
          signal: controller.signal,
          headers: { Accept: 'application/json', ...(etag ? { 'If-None-Match': etag } : {}) }
        })
        const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': CACHE_CONTROL })
        if (upstream.headers.get('ETag')) headers.set('ETag', upstream.headers.get('ETag'))
        if (upstream.status === 304) return new Response(null, { status: 304, headers })
        if (!upstream.ok) throw new Error('Source unavailable')
        const body = await upstream.json()
        normalizeSnapshot(body)
        return new Response(JSON.stringify(body), { headers })
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('Source timeout')) }, 7000)
      })
    ])
    if (response.status === 200 && cache) {
      const copy = response.clone()
      const save = Promise.resolve().then(() => cache.put(cacheKey, copy)).catch(() => {})
      if (waitUntil) waitUntil(save)
      else await save
    }
    return conditional(response, etag)
  } catch {
    return json({ error: 'source_unavailable' }, 503)
  } finally {
    clearTimeout(timer)
  }
}

function conditional(response, etag) {
  return etag && response.headers.get('ETag') === etag
    ? new Response(null, { status: 304, headers: response.headers }) : response
}

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'
  } })
}
