import { cleanText, findComment, getStore, jsonResponse, listCommentsPage, normalizePath, setCommentField, validId } from '../../.vitepress/server/comments-store.mjs'

function authorize(request, env) {
  const token = String(env.COMMENTS_ADMIN_TOKEN || '').trim()
  if (!token) return jsonResponse({ error: '管理口令未配置：请设置 COMMENTS_ADMIN_TOKEN' }, 503)
  if (request.headers.get('x-admin-token') !== token) return jsonResponse({ error: '管理口令不正确' }, 401)
}
export async function onRequestGet({ request, env }) {
  const auth = authorize(request, env)
  if (auth) return auth
  const store = getStore(env)
  if (!store) return jsonResponse({ error: '留言服务未配置：请绑定 COMMENTS_KV' }, 503)
  const url = new URL(request.url), status = url.searchParams.get('status') || 'pending'
  if (!['all', 'approved', 'pending'].includes(status)) return jsonResponse({ error: '筛选状态不正确' }, 400)
  try {
    return jsonResponse(await listCommentsPage(store, { status, cursor: url.searchParams.get('cursor') || '', limit: url.searchParams.get('limit') }))
  } catch (error) {
    return jsonResponse({ error: error.message === 'invalid_cursor' ? '分页已失效，请重新加载' : '留言暂时无法加载' }, error.message === 'invalid_cursor' ? 400 : 503)
  }
}
export async function onRequestPost({ request, env }) {
  const auth = authorize(request, env)
  if (auth) return auth
  const store = getStore(env)
  if (!store) return jsonResponse({ error: '留言服务未配置：请绑定 COMMENTS_KV' }, 503)
  let body
  try { body = await request.json() } catch { return jsonResponse({ error: '请求格式不正确' }, 400) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonResponse({ error: '请求格式不正确' }, 400)
  const path = normalizePath(body.path), id = body.id
  if (!path || !validId(id)) return jsonResponse({ error: '缺少或无效的留言信息' }, 400)
  const { action } = body
  if (!['approve', 'reply', 'clearReply', 'delete'].includes(action)) return jsonResponse({ error: '不支持的操作' }, 400)
  let reply
  if (action === 'reply') {
    const message = cleanText(body.replyMessage, 500), href = cleanText(body.replyHref, 300)
    if (!message) return jsonResponse({ error: '回复文字不能为空' }, 400)
    if (href) {
      try { if (!['http:', 'https:'].includes(new URL(href).protocol)) throw new Error() }
      catch { return jsonResponse({ error: '回复链接必须以 http:// 或 https:// 开头' }, 400) }
    }
    reply = { message, href, createdAt: new Date().toISOString() }
  }
  try {
    if (!await findComment(store, path, id)) return jsonResponse({ error: '留言不存在' }, 404)
    if (action === 'approve') await setCommentField(store, path, id, 'status', 'approved')
    else if (action === 'reply' || action === 'clearReply') await setCommentField(store, path, id, 'reply', reply || null)
    else await setCommentField(store, path, id, 'deleted', true)
    return jsonResponse({ ok: true })
  } catch { return jsonResponse({ error: '操作暂时失败，请稍后重试' }, 503) }
}
