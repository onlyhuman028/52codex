export const RESET_API_URL = '/api/codex-resets'
export const RESET_RECENT_API_URL = '/api/codex-resets?view=recent'
export const RESET_REFRESH_MS = 10 * 60 * 1000
const DAY = 86400000

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function beijingDate(value) {
  const input = text(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(`${input}T00:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === input ? input : ''
  }
  const ms = typeof value === 'number' ? value : Date.parse(input)
  return Number.isFinite(ms) ? new Date(ms + 8 * 3600000).toISOString().slice(0, 10) : ''
}

function sourceLink(value) {
  try {
    const url = new URL(text(value))
    return url.protocol === 'https:' && ['x.com', 'twitter.com'].includes(url.hostname) && !url.username && !url.password
      ? url.href : ''
  } catch { return '' }
}

export function normalizeSnapshot(raw) {
  if (raw?.schemaVersion !== 1 || !Array.isArray(raw.events) || !beijingDate(raw.today)) {
    throw new Error('重置数据格式暂不支持')
  }
  const events = raw.events.filter(event => event && text(event.id)).map(event => {
    const presentation = event.presentation || {}
    const status = text(presentation.status) || text(event.status)
    const date = beijingDate(event.occurredOn) || beijingDate(event.confirmedAt)
      || beijingDate(event.estimate?.from) || beijingDate(event.schedule?.from)
      || beijingDate(presentation.reportedAt) || beijingDate(event.createdAt)
    const type = ['direct_reset', 'reset_credit'].includes(event.type) ? event.type : 'unknown'
    return {
      id: event.id, type, date,
      label: text(event.displayLabel) || (type === 'reset_credit' ? '重置卡发放' : '重置（形式未明确）'),
      status: ['confirmed', 'likely_completed', 'announced'].includes(status) ? status : 'unknown',
      audience: presentation.scopeKnown === true
        ? text(presentation.audienceZh) || text(presentation.scopeLabel) || '适用范围未明确'
        : '适用范围未明确',
      products: text(presentation.productsZh),
      confirmedAt: text(event.confirmedAt),
      occurredOn: beijingDate(event.occurredOn),
      confirmationBasis: text(event.confirmationBasis),
      scheduleLabel: text(event.schedule?.label),
      estimateLabel: text(event.estimate?.label),
      estimateReason: text(event.estimate?.reason),
      timeInferred: presentation.timeInferred === true,
      posts: (Array.isArray(event.posts) ? event.posts : []).filter(post => post && sourceLink(post.url)).map(post => ({
        id: text(post.id) || sourceLink(post.url),
        text: text(post.text), originalText: text(post.originalText),
        stage: text(post.stage), publishedAt: text(post.publishedAt), url: sourceLink(post.url)
      }))
    }
  }).filter(event => event.date)
  const unique = [...new Map(events.map(event => [event.id, event])).values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.confirmedAt.localeCompare(a.confirmedAt))
  const monitor = raw.monitor || {}
  return {
    today: beijingDate(raw.today), checkedAt: text(raw.checkedAt),
    historyFrom: beijingDate(raw.historyFrom), events: unique,
    monitor: {
      status: text(monitor.status), lastAttemptAt: text(monitor.lastAttemptAt),
      lastCollectedAt: text(monitor.lastCollectedAt), lastVerifiedAt: text(monitor.lastVerifiedAt)
    }, outage: Boolean(raw.outage)
  }
}

export function resetStatistics(events, today) {
  const end = Date.parse(`${today}T00:00:00Z`)
  const start = new Date(end - 89 * DAY).toISOString().slice(0, 10)
  const confirmed = events.filter(event => event.status === 'confirmed' && event.date >= start && event.date <= today)
  const resets = confirmed.filter(event => event.type === 'direct_reset')
  const dates = [...new Set(resets.map(event => event.date))].sort()
  const intervals = dates.slice(1).map((date, index) => (Date.parse(date) - Date.parse(dates[index])) / DAY).sort((a, b) => a - b)
  const middle = Math.floor(intervals.length / 2)
  const medianDays = intervals.length ? (intervals.length % 2 ? intervals[middle] : (intervals[middle - 1] + intervals[middle]) / 2) : null
  return {
    resets: resets.length, credits: confirmed.filter(event => event.type === 'reset_credit').length,
    medianDays, lastReset: dates.at(-1) || ''
  }
}

export function calendarDays(month) {
  const [year, index] = month.split('-').map(Number)
  const first = new Date(Date.UTC(year, index - 1, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(year, index, 0)).getUTCDate()
  const length = Math.ceil((offset + count) / 7) * 7
  return Array.from({ length }, (_, i) => {
    const date = new Date(first.getTime() + (i - offset) * DAY).toISOString().slice(0, 10)
    return { date, day: Number(date.slice(-2)), inMonth: date.startsWith(month) }
  })
}

export function mergeRecentSnapshot(full, recent) {
  const incoming = new Set(recent.events.map(event => event.id))
  const historical = full.events.filter(event => event.date < recent.historyFrom && event.status !== 'announced' && !incoming.has(event.id))
  return {
    ...recent, historyFrom: full.historyFrom,
    events: [...historical, ...recent.events].sort((a, b) => b.date.localeCompare(a.date) || b.confirmedAt.localeCompare(a.confirmedAt))
  }
}

export function createResetLoader(fetcher = globalThis.fetch, clock = Date.now) {
  let snapshot = null
  let completeHistory = false
  let recentEtag = ''
  let lastAttempt = -Infinity
  let stale = false
  let pending = null

  const result = () => ({ snapshot, completeHistory, stale, nextRefreshAt: lastAttempt + RESET_REFRESH_MS })
  async function request(url, signal, etag = '') {
    const controller = new AbortController()
    const abort = () => controller.abort()
    if (signal?.aborted) controller.abort()
    signal?.addEventListener('abort', abort, { once: true })
    let timer
    try {
      return await Promise.race([
        (async () => {
          const response = await fetcher(url, { signal: controller.signal, headers: { Accept: 'application/json', ...(etag ? { 'If-None-Match': etag } : {}) } })
          if (response.status === 304) return { unchanged: true }
          if (!response.ok) throw new Error(`数据源返回 ${response.status}`)
          return { snapshot: normalizeSnapshot(await response.json()), etag: response.headers.get('ETag') || '' }
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error('读取数据超时')) }, 8000)
        })
      ])
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
  }

  async function refresh(signal) {
    lastAttempt = clock()
    try {
      if (!snapshot) {
        try {
          const full = await request(RESET_API_URL, signal)
          snapshot = full.snapshot
          completeHistory = true
        } catch (error) {
          if (signal?.aborted) throw error
          const recent = await request(RESET_RECENT_API_URL, signal)
          snapshot = recent.snapshot
          recentEtag = recent.etag
        }
      } else {
        const recent = await request(RESET_RECENT_API_URL, signal, recentEtag)
        if (!recent.unchanged) {
          snapshot = completeHistory ? mergeRecentSnapshot(snapshot, recent.snapshot) : recent.snapshot
          recentEtag = recent.etag
        }
      }
      stale = false
      return result()
    } catch (error) {
      if (!snapshot || signal?.aborted) throw error
      stale = true
      return result()
    }
  }

  return {
    load({ signal } = {}) {
      if (pending) return pending
      if (snapshot && clock() - lastAttempt < RESET_REFRESH_MS) return Promise.resolve(result())
      pending = refresh(signal).finally(() => { pending = null })
      return pending
    }
  }
}

// The cache lasts for this browser tab only; nothing is written to browser storage.
export const resetLoader = createResetLoader()
