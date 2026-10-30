import { cleanText, getStore, jsonResponse, listCommentsPage, normalizePath, saveComment } from '../../.vitepress/server/comments-store.mjs'

export async function onRequestGet({ request, env }) {
  const store = getStore(env)
  if (!store) return jsonResponse({ error: '留言服务未配置：请绑定 COMMENTS_KV' }, 503)
  const url = new URL(request.url)
  const path = normalizePath(url.searchParams.get('path'))
  if (!path) return jsonResponse({ error: '缺少或无效的页面路径' }, 400)
  try {
    return jsonResponse(await listCommentsPage(store, { path, cursor: url.searchParams.get('cursor') || '', limit: url.searchParams.get('limit') }))
  } catch (error) {
    return jsonResponse({ error: error.message === 'invalid_cursor' ? '分页已失效，请重新加载' : '留言暂时无法加载' }, error.message === 'invalid_cursor' ? 400 : 503)
  }
}

export async function onRequestPost({ request, env }) {
  const store = getStore(env)
  if (!store) return jsonResponse({ error: '留言服务未配置：请绑定 COMMENTS_KV' }, 503)
  let body
  try { body = await request.json() } catch { return jsonResponse({ error: '请求格式不正确' }, 400) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonResponse({ error: '请求格式不正确' }, 400)
  if (cleanText(body.website, 100)) return jsonResponse({ ok: true, message: '留言已收到' })
  const path = normalizePath(body.path), name = cleanText(body.name, 24), message = cleanText(body.message, 500)
  if (!path) return jsonResponse({ error: '缺少或无效的页面路径' }, 400)
  if (name.length < 2) return jsonResponse({ error: '昵称至少 2 个字' }, 400)
  if (message.length < 5) return jsonResponse({ error: '留言至少 5 个字' }, 400)
  try {
    const rateKey = `comments-rate:${request.headers.get('CF-Connecting-IP') || 'unknown'}`
    if (await store.get(rateKey)) return jsonResponse({ error: '提交太频繁，请稍后再试' }, 429)
    const id = `${String(9999999999999 - Date.now()).padStart(13, '0')}-${crypto.randomUUID()}`
    await saveComment(store, { id, path, name, message, title: cleanText(body.title, 120), status: 'pending', createdAt: new Date().toISOString() })
    await store.put(rateKey, '1', { expirationTtl: 60 })
    return jsonResponse({ ok: true, message: '留言已提交，审核通过后会显示' }, 201)
  } catch { return jsonResponse({ error: '留言暂时无法提交，请稍后重试' }, 503) }
}
