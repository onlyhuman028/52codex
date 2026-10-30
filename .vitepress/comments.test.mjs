import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function endpoint(name) {
  const url = new URL(`../functions/api/${name}.js`, import.meta.url)
  const source = (await readFile(url, 'utf8')).replace(/from '(\.\.?\/[^']+)'/g, (_, relative) => `from '${new URL(relative, url).href}'`)
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}
const publicApi = await endpoint('comments')
const adminApi = await endpoint('comments-admin')

class MemoryKV {
  values = new Map()
  async get(key, type) {
    await new Promise(resolve => setTimeout(resolve, 0))
    const value = this.values.get(key) ?? null
    return type === 'json' && value !== null ? JSON.parse(value) : value
  }
  async put(key, value) { this.values.set(key, value) }
  async list({ prefix, cursor = '', limit = 1000 }) {
    const keys = [...this.values.keys()].filter(key => key.startsWith(prefix)).sort()
    const start = cursor ? keys.findIndex(key => key > cursor) : 0
    const selected = start < 0 ? [] : keys.slice(start, start + Math.min(limit, 2))
    const complete = !selected.length || keys.at(-1) === selected.at(-1)
    return { keys: selected.map(name => ({ name })), list_complete: complete, cursor: complete ? '' : selected.at(-1) }
  }
}
const envFor = kv => ({ COMMENTS_KV: kv, COMMENTS_ADMIN_TOKEN: 'test-admin' })
function request(route, body, token, ip = '127.0.0.1') {
  return new Request(`https://52codex.site/api/${route}`, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip, ...(token ? { 'x-admin-token': token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
}
const legacy = (id, status = 'approved') => ({ id, path: '/tips/test', name: '读者', message: '这是一个测试留言', status, createdAt: '2026-10-29T00:00:00Z' })
async function collect(api, route, env, token) {
  const comments = []
  let cursor = ''
  for (let page = 0; page < 200; page++) {
    const response = await api.onRequestGet({ env, request: request(route + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''), undefined, token) })
    assert.equal(response.status, 200)
    const data = await response.json()
    comments.push(...data.comments)
    cursor = data.nextCursor
    if (!cursor) return comments
  }
  assert.fail('pagination did not terminate')
}

test('simultaneous submissions keep every record without evicting old approved comments', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  await kv.put('comments:/tips/test', JSON.stringify(Array.from({ length: 100 }, (_, i) => legacy(`old-${i}`))))
  const responses = await Promise.all(Array.from({ length: 5 }, (_, i) => publicApi.onRequestPost({ env, request: request('comments', { path: '/tips/test', name: '读者', message: `第 ${i} 条并发留言` }, null, `ip-${i}`) })))
  assert.ok(responses.every(response => response.status === 201))
  const all = await collect(adminApi, 'comments-admin?status=all&limit=2', env, 'test-admin')
  assert.equal(all.length, 105)
  const visible = await collect(publicApi, 'comments?path=/tips/test&limit=2', env)
  assert.equal(visible.length, 100)
  assert.ok(visible.every(comment => comment.status === 'approved'))
})

test('all moderation reads and writes require authorization without touching storage', async () => {
  const env = { COMMENTS_ADMIN_TOKEN: 'test-admin', COMMENTS_KV: { get() { assert.fail('unauthorized read') }, list() { assert.fail('unauthorized list') }, put() { assert.fail('unauthorized write') } } }
  for (const token of [undefined, 'wrong']) {
    assert.equal((await adminApi.onRequestGet({ env, request: request('comments-admin', undefined, token) })).status, 401)
    assert.equal((await adminApi.onRequestPost({ env, request: request('comments-admin', { action: 'approve' }, token) })).status, 401)
  }
})

test('concurrent approval and reply preserve both fields on legacy comments', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  await kv.put('comments:/tips/test', JSON.stringify([legacy('pending-one', 'pending')]))
  await Promise.all(['approve', 'reply'].map(action => adminApi.onRequestPost({ env, request: request('comments-admin', { path: '/tips/test', id: 'pending-one', action, replyMessage: '已收到，我会补充。' }, 'test-admin') })))
  const visible = await collect(publicApi, 'comments?path=/tips/test', env)
  assert.equal(visible.length, 1)
  assert.equal(visible[0].reply.message, '已收到，我会补充。')
  assert.equal(visible[0].status, 'approved')
  assert.equal(JSON.parse(kv.values.get('comments:/tips/test'))[0].status, 'pending')
})

test('pagination traverses every KV page, isolates paths and rejects mismatched cursors', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  for (let i = 0; i < 5; i++) await kv.put(`comments:/page-${i}`, JSON.stringify([{ ...legacy(`page-${i}`), path: `/page-${i}` }]))
  assert.equal((await collect(adminApi, 'comments-admin?status=approved&limit=1', env, 'test-admin')).length, 5)
  assert.equal((await collect(publicApi, 'comments?path=/page-0', env)).length, 1)
  const first = await (await adminApi.onRequestGet({ env, request: request('comments-admin?status=all&limit=1', undefined, 'test-admin') })).json()
  assert.ok(first.nextCursor)
  const result = await adminApi.onRequestGet({ env, request: request(`comments-admin?status=pending&cursor=${encodeURIComponent(first.nextCursor)}`, undefined, 'test-admin') })
  assert.equal(result.status, 400)
})

test('invalid bodies and external paths fail clearly, deleted legacy comments stay hidden', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  assert.equal((await publicApi.onRequestPost({ env, request: request('comments', null) })).status, 400)
  assert.equal((await publicApi.onRequestPost({ env, request: request('comments', { path: '//evil.example', name: '读者', message: '这是测试留言' }) })).status, 400)
  await kv.put('comments:/tips/test', JSON.stringify([legacy('old-one')]))
  assert.equal((await adminApi.onRequestPost({ env, request: request('comments-admin', { path: '/tips/test', id: 'old-one', action: 'delete' }, 'test-admin') })).status, 200)
  assert.equal((await collect(publicApi, 'comments?path=/tips/test', env)).length, 0)
  assert.equal(JSON.parse(kv.values.get('comments:/tips/test')).length, 1)
})

test('legacy records without embedded paths and exact html paths remain manageable', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  const old = legacy('old-html', 'pending')
  delete old.path
  await kv.put('comments:/tips/test.html', JSON.stringify([old]))
  const result = await adminApi.onRequestPost({ env, request: request('comments-admin', { path: '/tips/test.html', id: 'old-html', action: 'approve' }, 'test-admin') })
  assert.equal(result.status, 200)
  const visible = await collect(publicApi, 'comments?path=/tips/test.html', env)
  assert.equal(visible[0].id, 'old-html')
})

test('an empty KV page with a continuation does not hide later approved records', async () => {
  class EmptyPageKV extends MemoryKV {
    async list(options) {
      if (options.prefix.startsWith('comment-v2:') && !options.cursor) return { keys: [], list_complete: false, cursor: 'empty-page' }
      return super.list({ ...options, cursor: options.cursor === 'empty-page' ? '' : options.cursor })
    }
  }
  const kv = new EmptyPageKV(), env = envFor(kv)
  await kv.put('comments:/tips/test', JSON.stringify([legacy('later-record')]))
  const visible = await collect(publicApi, 'comments?path=/tips/test', env)
  assert.deepEqual(visible.map(record => record.id), ['later-record'])
})

test('invalid reply links cannot become executable links in public comments', async () => {
  const kv = new MemoryKV(), env = envFor(kv)
  await kv.put('comments:/tips/test', JSON.stringify([legacy('reply-one')]))
  const response = await adminApi.onRequestPost({ env, request: request('comments-admin', { path: '/tips/test', id: 'reply-one', action: 'reply', replyMessage: '看这个链接', replyHref: 'javascript:alert(1)' }, 'test-admin') })
  assert.equal(response.status, 400)
  assert.equal((await collect(publicApi, 'comments?path=/tips/test', env))[0].reply, undefined)
})
