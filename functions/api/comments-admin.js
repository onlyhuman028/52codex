export async function onRequestGet({ request, env }) {
  const auth = authorize(request, env)
  if (auth) return auth

  const store = getStore(env)
  if (!store) {
    return jsonResponse({ error: '留言服务未配置：请在 Cloudflare Pages 绑定 COMMENTS_KV' }, 503)
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || 'pending'
  const comments = await listComments(store)
  const filtered = status === 'all' ? comments : comments.filter((comment) => getStatus(comment) === status)

  return jsonResponse({ comments: filtered })
}

export async function onRequestPost({ request, env }) {
  const auth = authorize(request, env)
  if (auth) return auth

  const store = getStore(env)
  if (!store) {
    return jsonResponse({ error: '留言服务未配置：请在 Cloudflare Pages 绑定 COMMENTS_KV' }, 503)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: '请求格式不正确' }, 400)
  }

  const path = normalizePath(body.path)
  const id = String(body.id || '').trim()
  const action = String(body.action || '').trim()

  if (!path || !id) {
    return jsonResponse({ error: '缺少留言信息' }, 400)
  }

  const key = commentKey(path)
  const comments = await readComments(store, path)
  const index = comments.findIndex((comment) => comment.id === id)

  if (index < 0) {
    return jsonResponse({ error: '留言不存在' }, 404)
  }

  if (action === 'approve') {
    comments[index] = {
      ...comments[index],
      status: 'approved',
      approvedAt: new Date().toISOString()
    }
  } else if (action === 'delete') {
    comments.splice(index, 1)
  } else {
    return jsonResponse({ error: '不支持的操作' }, 400)
  }

  await store.put(key, JSON.stringify(comments))
  return jsonResponse({ ok: true })
}

function authorize(request, env) {
  const token = String(env.COMMENTS_ADMIN_TOKEN || '').trim()

  if (!token) {
    return jsonResponse({ error: '管理口令未配置：请设置 COMMENTS_ADMIN_TOKEN' }, 503)
  }

  if (request.headers.get('x-admin-token') !== token) {
    return jsonResponse({ error: '管理口令不正确' }, 401)
  }

  return null
}

function getStore(env) {
  return env.COMMENTS_KV || env.KV
}

async function listComments(store) {
  const result = await store.list({ prefix: 'comments:' })
  const groups = await Promise.all(
    result.keys.map(async (key) => {
      const comments = await store.get(key.name, 'json')
      return Array.isArray(comments) ? comments : []
    })
  )

  return groups
    .flat()
    .map((comment) => ({
      ...comment,
      status: getStatus(comment)
    }))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

async function readComments(store, path) {
  const comments = await store.get(commentKey(path), 'json')

  return Array.isArray(comments) ? comments : []
}

function commentKey(path) {
  return `comments:${path}`
}

function getStatus(comment) {
  return comment.status || 'approved'
}

function normalizePath(value) {
  const path = String(value || '').trim()

  if (!path.startsWith('/') || path.includes('..') || path.length > 180) {
    return ''
  }

  return path
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
