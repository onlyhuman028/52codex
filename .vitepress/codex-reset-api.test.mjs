import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const originalFetch = globalThis.fetch
const originalCaches = globalThis.caches
afterEach(() => { globalThis.fetch = originalFetch; globalThis.caches = originalCaches })

async function handler() {
  const file = new URL('../functions/api/codex-resets.js', import.meta.url)
  const source = (await readFile(file, 'utf8')).replace(/from '(\.\.?\/[^']+)'/g,
    (_, relative) => `from '${new URL(relative, file).href}'`)
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).onRequestGet
}
const data = { schemaVersion: 1, today: '2026-10-08', checkedAt: '2026-10-08T15:00:00+08:00', events: [], monitor: { status: 'healthy' } }

test('same-origin endpoint selects only documented recent or full upstream URLs and forwards ETag', async () => {
  globalThis.caches = undefined
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://aihot.news/api/v1/codex-resets/recent')
    assert.equal(init.headers['If-None-Match'], 'old-tag')
    return new Response(JSON.stringify(data), { headers: { ETag: 'new-tag' } })
  }
  const response = await (await handler())({ request: new Request('https://52codex.site/api/codex-resets?view=recent', { headers: { 'If-None-Match': 'old-tag' } }) })
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('ETag'), 'new-tag')
  assert.equal((await response.json()).schemaVersion, 1)
})

test('edge cache answers conditional requests without downloading the source again', async () => {
  globalThis.caches = { default: { match: async () => new Response(JSON.stringify(data), { headers: { ETag: 'cached-tag' } }) } }
  globalThis.fetch = async () => { assert.fail('cache hit must not call upstream') }
  const response = await (await handler())({ request: new Request('https://52codex.site/api/codex-resets', { headers: { 'If-None-Match': 'cached-tag' } }) })
  assert.equal(response.status, 304)
  assert.equal(await response.text(), '')
})

test('blocked or malformed upstream responses report unavailable rather than an empty healthy feed', async () => {
  globalThis.caches = undefined
  const get = await handler()
  for (const response of [new Response('blocked', { status: 403 }), new Response('{}')]) {
    globalThis.fetch = async () => response
    const result = await get({ request: new Request('https://52codex.site/api/codex-resets') })
    assert.equal(result.status, 503)
    assert.equal(result.headers.get('Cache-Control'), 'no-store')
    assert.equal((await result.json()).error, 'source_unavailable')
  }
})

test('unrecognized view cannot turn the endpoint into an arbitrary proxy', async () => {
  globalThis.fetch = async () => { assert.fail('invalid views must not call upstream') }
  const response = await (await handler())({ request: new Request('https://52codex.site/api/codex-resets?view=https://example.com') })
  assert.equal(response.status, 400)
})
