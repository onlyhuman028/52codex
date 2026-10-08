import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSnapshot, resetStatistics, calendarDays, mergeRecentSnapshot, createResetLoader } from './theme/codex-reset-data.mjs'

const event = (id, extra = {}) => ({
  id, type: 'direct_reset', displayLabel: '额度重置', status: 'confirmed',
  createdAt: '2026-10-07T01:00:00Z', confirmedAt: '2026-10-07T01:00:00Z',
  presentation: { status: 'confirmed', scopeKnown: true, audienceZh: 'Pro 用户', productsZh: 'Codex' },
  posts: [{ id: 'post', text: '已重置。', originalText: 'Reset completed.', url: 'https://x.com/thsottiaux/status/123' }],
  ...extra
})
const snapshot = (events, extra = {}) => ({
  schemaVersion: 1, today: '2026-10-08', checkedAt: '2026-10-08T15:00:00+08:00',
  historyFrom: '2026-06-12T00:00:00+08:00', events, monitor: { status: 'healthy' }, ...extra
})

test('presentation fields preserve uncertain status and audience instead of legacy broad scope', () => {
  const data = normalizeSnapshot(snapshot([event('uncertain', {
    scope: '所有付费订阅',
    presentation: { status: 'likely_completed', scopeKnown: false, kindExplicit: false },
    displayLabel: '重置（形式未明确）', confirmedAt: null,
    schedule: { from: '2026-10-06T23:30:00Z' }
  })]))
  assert.equal(data.events[0].status, 'likely_completed')
  assert.equal(data.events[0].audience, '适用范围未明确')
  assert.equal(data.events[0].label, '重置（形式未明确）')
  assert.equal(data.events[0].date, '2026-10-07')
})

test('receipt dates take precedence and source links exclude executable and unrelated URLs', () => {
  const data = normalizeSnapshot(snapshot([event('receipt', {
    occurredOn: '2026-09-30', confirmedAt: null, confirmationBasis: 'receipt_review',
    posts: [{ text: '<script>alert(1)</script>', url: 'javascript:alert(1)' }, { text: 'x', url: 'https://evil.example/post' }]
  })]))
  assert.equal(data.events[0].date, '2026-09-30')
  assert.equal(data.events[0].posts.length, 0)
  assert.throws(() => normalizeSnapshot({ events: 'not an array' }))
})

test('90-day statistics exclude unconfirmed and future events and count same-day resets without a zero-day interval', () => {
  const data = normalizeSnapshot(snapshot([
    event('1', { confirmedAt: '2026-10-01T10:00:00+08:00' }),
    event('2', { confirmedAt: '2026-10-03T10:00:00+08:00' }),
    event('3', { confirmedAt: '2026-10-03T11:00:00+08:00' }),
    event('4', { confirmedAt: '2026-10-08T10:00:00+08:00' }),
    event('card', { type: 'reset_credit' }),
    event('pending', { status: 'announced', presentation: { status: 'announced' }, confirmedAt: null }),
    event('future', { confirmedAt: '2026-10-10T10:00:00+08:00' }),
    event('old', { confirmedAt: '2026-07-01T10:00:00+08:00' })
  ]))
  assert.deepEqual(resetStatistics(data.events, '2026-10-08'), { resets: 4, credits: 1, medianDays: 3.5, lastReset: '2026-10-08' })
})

test('calendar starts on Monday and handles leap February and a December year boundary', () => {
  const feb = calendarDays('2024-02')
  assert.equal(feb[0].date, '2024-01-29')
  assert.equal(feb.filter(day => day.inMonth).length, 29)
  assert.equal(feb.length % 7, 0)
  const dec = calendarDays('2026-12')
  assert.equal(dec.at(-1).date, '2027-01-03')
})

test('recent refresh replaces corrected and removed events while retaining older history', () => {
  const full = normalizeSnapshot(snapshot([event('old', { confirmedAt: '2026-09-01T08:00:00+08:00' }), event('removed'), event('edited')]))
  const recent = normalizeSnapshot(snapshot([event('edited', { type: 'reset_credit' })], { historyFrom: '2026-10-01T00:00:00+08:00' }))
  const merged = mergeRecentSnapshot(full, recent)
  assert.deepEqual(merged.events.map(item => item.id).sort(), ['edited', 'old'])
  assert.equal(merged.events.find(item => item.id === 'edited').type, 'reset_credit')
  assert.equal(merged.historyFrom, '2026-06-12')
})

test('loader uses recent conditional requests after 10 minutes and retains successful data on network failure', async () => {
  let now = 0
  const calls = []
  const replies = [
    new Response(JSON.stringify(snapshot([event('full')])), { headers: { ETag: 'full-tag' } }),
    new Response(JSON.stringify(snapshot([event('recent')], { historyFrom: '2026-10-01T00:00:00+08:00' })), { headers: { ETag: 'recent-tag' } }),
    new Response(null, { status: 304 })
  ]
  const loader = createResetLoader(async (url, init) => {
    calls.push({ url, headers: init.headers })
    if (!replies.length) throw new Error('offline')
    return replies.shift()
  }, () => now)
  assert.equal((await loader.load()).snapshot.events[0].id, 'full')
  await loader.load()
  assert.equal(calls.length, 1)
  now += 600001
  assert.equal((await loader.load()).snapshot.events[0].id, 'recent')
  assert.equal(calls[1].url, '/api/codex-resets?view=recent')
  now += 600001
  assert.equal((await loader.load()).stale, false)
  assert.equal(calls[2].headers['If-None-Match'], 'recent-tag')
  now += 600001
  const result = await loader.load()
  assert.equal(result.stale, true)
  assert.equal(result.snapshot.events[0].id, 'recent')
})

test('initial history failure can show recent events without claiming a complete history', async () => {
  const loader = createResetLoader(async (url) => {
    if (!url.endsWith('?view=recent')) return new Response('', { status: 503 })
    return new Response(JSON.stringify(snapshot([event('recent')], { historyFrom: '2026-10-01T00:00:00+08:00' })))
  })
  const result = await loader.load()
  assert.equal(result.completeHistory, false)
  assert.equal(result.snapshot.events.length, 1)
})
