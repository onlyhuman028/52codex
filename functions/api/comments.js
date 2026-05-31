const MAX_COMMENTS_PER_PAGE = 100
const RATE_LIMIT_SECONDS = 60

export async function onRequestGet({ request, env }) {
  const store = getStore(env)

  if (!store) {
    return jsonResponse({ comments: [], error: '留言服务未配置：请在 Cloudflare Pages 绑定 COMMENTS_KV' }, 503)
  }

  const url = new URL(request.url)
  const path = normalizePath(url.searchParams.get('path'))

  if (!path) {
    return jsonResponse({ error: '缺少页面路径' }, 400)
  }

  const comments = await readComments(store, path)
  return jsonResponse({ comments: comments.filter(isApprovedComment) })
}

export async function onRequestPost({ request, env }) {
  const store = getStore(env)

  if (!store) {
    return jsonResponse({ error: '留言服务未配置：请在 Cloudflare Pages 绑定 COMMENTS_KV' }, 503)
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const rateKey = `comments-rate:${ip}`
  const recentlySubmitted = await store.get(rateKey)

  if (recentlySubmitted) {
    return jsonResponse({ error: '提交太频繁，请稍后再试' }, 429)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: '请求格式不正确' }, 400)
  }

  if (String(body.website || '').trim()) {
    return jsonResponse({ ok: true, comments: [], message: '留言已收到' })
  }

  const path = normalizePath(body.path)
  const name = cleanText(body.name, 24)
  const message = cleanText(body.message, 500)
  const title = cleanText(body.title, 120)

  if (!path) {
    return jsonResponse({ error: '缺少页面路径' }, 400)
  }

  if (name.length < 2) {
    return jsonResponse({ error: '昵称至少 2 个字' }, 400)
  }

  if (message.length < 5) {
    return jsonResponse({ error: '留言至少 5 个字' }, 400)
  }

  const comment = {
    id: crypto.randomUUID(),
    path,
    title,
    name,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  const comments = await readComments(store, path)
  const nextComments = [...comments, comment].slice(-MAX_COMMENTS_PER_PAGE)

  await store.put(commentKey(path), JSON.stringify(nextComments))
  await store.put(rateKey, '1', { expirationTtl: RATE_LIMIT_SECONDS })

  return jsonResponse({
    ok: true,
    comments: nextComments.filter(isApprovedComment),
    message: '留言已提交，审核通过后会显示'
  }, 201)
}

function getStore(env) {
  return env.COMMENTS_KV || env.KV
}

async function readComments(store, path) {
  const comments = await store.get(commentKey(path), 'json')

  return Array.isArray(comments) ? comments : []
}

function commentKey(path) {
  return `comments:${path}`
}

function isApprovedComment(comment) {
  return !comment.status || comment.status === 'approved'
}

function normalizePath(value) {
  const path = String(value || '').trim()

  if (!path.startsWith('/') || path.includes('..') || path.length > 180) {
    return ''
  }

  return path
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  })
}
