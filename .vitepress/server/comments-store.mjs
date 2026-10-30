// New records and moderation fields are independent KV keys. Legacy arrays stay intact.
export function normalizePath(value) {
  const path = typeof value === 'string' ? value.trim() : ''
  let decoded
  try { decoded = decodeURIComponent(path) } catch { return '' }
  if (!path.startsWith('/') || path.length > 180 || decoded.includes('//') || /[\\?#\u0000-\u0020]/.test(decoded) || decoded.split('/').includes('..')) return ''
  return path
}

export const cleanText = (value, max) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
export const getStore = env => env.COMMENTS_KV || env.KV
export const validId = id => typeof id === 'string' && /^[A-Za-z0-9-]{1,100}$/.test(id)
export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })
}

async function digest(path) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(path))
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
}
const itemPrefix = async path => `comment-v2:${path ? await digest(path) + ':' : ''}`
const fieldKey = async (path, id, field) => `comment-state:${await digest(path)}:${id}:${field}`
export async function saveComment(store, comment) {
  await store.put(`${await itemPrefix(comment.path)}${comment.id}`, JSON.stringify(comment))
}
export async function setCommentField(store, path, id, field, value) {
  if (!['status', 'reply', 'deleted'].includes(field)) throw new Error('Invalid field')
  await store.put(await fieldKey(path, id, field), JSON.stringify(value))
}

async function materialize(store, record) {
  if (!record || !validId(record.id) || !normalizePath(record.path)) return null
  const [status, reply, deleted] = await Promise.all(['status', 'reply', 'deleted'].map(async field => {
    const value = await store.get(await fieldKey(record.path, record.id, field))
    return value === null ? undefined : JSON.parse(value)
  }))
  if (deleted) return null
  const result = { ...record, status: status ?? record.status ?? 'approved' }
  if (reply !== undefined) {
    if (reply === null) delete result.reply
    else result.reply = reply
  }
  return result
}

export async function findComment(store, path, id) {
  const record = await store.get(`${await itemPrefix(path)}${id}`, 'json')
  const legacy = record ? null : await store.get(`comments:${path}`, 'json')
  const stored = record || (Array.isArray(legacy) ? legacy.find(comment => comment.id === id) : null)
  return materialize(store, stored ? { ...stored, path } : null)
}

function encodeCursor(state) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(state))))
}
function decodeCursor(value, scope) {
  if (!value) return { v: 1, scope, stage: 'new', kv: '', offset: 0 }
  try {
    if (value.length > 12000) throw new Error()
    const state = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), char => char.charCodeAt(0))))
    if (state.v !== 1 || state.scope !== scope || !['new', 'legacy'].includes(state.stage)
      || typeof state.kv !== 'string' || state.kv.length > 8000
      || !Number.isInteger(state.offset) || state.offset < 0 || state.offset > 10000
      || state.key && !state.key.startsWith('comments:/')
      || state.nextKv && typeof state.nextKv !== 'string') throw new Error()
    return state
  } catch { throw new Error('invalid_cursor') }
}

// Scan a bounded storage page. A filtered page can be empty and still carry a cursor.
export async function listCommentsPage(store, { path = '', status = 'approved', cursor = '', limit = 20 } = {}) {
  const size = Math.min(50, Math.max(1, Math.floor(Number(limit)) || 20))
  const scope = JSON.stringify([path, status])
  let state = decodeCursor(cursor, scope)
  let records = [], next = null
  if (state.stage === 'new') {
    const result = await store.list({ prefix: await itemPrefix(path), cursor: state.kv || undefined, limit: size })
    records = await Promise.all(result.keys.map(key => store.get(key.name, 'json')))
    next = result.list_complete ? { v: 1, scope, stage: 'legacy', kv: '', offset: 0 }
      : { ...state, kv: result.cursor }
    if (records.length || !result.list_complete) return finish(records, next)
    state = next
  }
  let key = path ? `comments:${path}` : state.key
  let nextKv = state.nextKv || '', lastGroup = path ? true : Boolean(state.lastGroup)
  if (!key) {
    const result = await store.list({ prefix: 'comments:', cursor: state.kv || undefined, limit: 1 })
    key = result.keys[0]?.name
    if (!key) return { comments: [], nextCursor: result.list_complete ? '' : encodeCursor({ ...state, kv: result.cursor }) }
    nextKv = result.cursor || ''
    lastGroup = result.list_complete
  }
  const stored = await store.get(key, 'json')
  const group = Array.isArray(stored) ? stored : []
  const recordPath = path || normalizePath(key.slice('comments:'.length))
  records = group.slice(state.offset, state.offset + size).map(record => ({ ...record, path: recordPath }))
  if (state.offset + size < group.length) next = { ...state, key, nextKv, lastGroup, offset: state.offset + size }
  else next = lastGroup ? null : { v: 1, scope, stage: 'legacy', kv: nextKv, offset: 0 }
  return finish(records, next)

  async function finish(items, nextState) {
    const views = await Promise.all(items.map(record => materialize(store, record)))
    const comments = views.filter(record => record && (!path || record.path === path) && (status === 'all' || record.status === status))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    return { comments, nextCursor: nextState ? encodeCursor(nextState) : '' }
  }
}
