import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildContentPages, isIndexable, readingMinutes, filterCases, contentDestination, normalizeContentUrl, filterReadingLinks, selectFeatured } from './theme/content-policy.mjs'

const page = (url, status, extra = {}, src = '# 标题\n\n正文。') => ({ url, src, frontmatter: { title: url, status, ...extra } })

test('all entry points share status, visibility, ordering and destination rules', () => {
  const pages = buildContentPages([
    page('/cases/03-test', 'coming-soon', { order: 3, level: 2, category: '自动化' }),
    page('/cases/02-test', 'improving', { order: 2, category: '做网站' }),
    page('/cases/01-test', 'published', { order: 1, category: '做网站' }),
    page('/cases/04-test', 'published', { hidden: true }),
    page('/cases/', 'published')
  ])
  assert.deepEqual(pages.filter(p => !p.hidden && !p.isIndex).map(p => p.statusLabel), ['已发布', '待完善', '待上线'])
  assert.deepEqual(pages.filter(p => p.recommendable).map(p => p.link), ['/cases/01-test'])
  assert.deepEqual(filterCases(pages.filter(p => !p.isIndex && !p.hidden), '做网站').map(p => p.link), ['/cases/01-test', '/cases/02-test'])
  assert.equal(contentDestination(pages.find(p => p.status === 'coming-soon')), '/coming-soon')
  assert.equal(isIndexable({ status: 'published' }), true)
  for (const fm of [{ status: 'improving' }, { status: 'coming-soon' }, { status: 'published', hidden: true }, { status: 'published', noindex: true }]) assert.equal(isIndexable(fm), false)
})

test('invalid article states fail clearly rather than silently publishing', () => {
  assert.throws(() => buildContentPages([page('/tips/test', 'draft')]), /status/)
  assert.throws(() => buildContentPages([page('/tips/test', undefined)]), /status/)
})

test('reading estimates ignore frontmatter, scripts, URLs and image addresses', () => {
  assert.equal(readingMinutes('---\ntitle: ' + '字'.repeat(2000) + '\n---\n<script>const x="' + '字'.repeat(2000) + '"</script>\n![说明](https://example.com/' + 'a'.repeat(2000) + '.png)\n你好'), 1)
  assert.equal(readingMinutes('字'.repeat(601)), 3)
})

test('only documented quota records are exposed, including a real zero', () => {
  const pages = buildContentPages([
    page('/cases/a', 'published', { quotaUsage: { value: 0, source: '原文记录' } }),
    page('/cases/b', 'published', { quotaUsage: { value: 30 } }),
    page('/cases/c', 'published', { quotaUsage: { value: '估计', source: '测试' } })
  ])
  assert.deepEqual(pages[0].quotaUsage, { value: 0, source: '原文记录' })
  assert.equal(pages[1].quotaUsage, null)
  assert.equal(pages[2].quotaUsage, null)
})

test('clean, html and index routes map to the same content identity', () => {
  assert.equal(normalizeContentUrl('https://www.52codex.site/guide/index.html'), '/guide/')
  assert.equal(normalizeContentUrl('cases/example.html'), '/cases/example')
  assert.equal(normalizeContentUrl('guide/example.md'), '/guide/example')
})

test('cross-section recommendations obey the target article state, including hidden hubs', () => {
  const pages = buildContentPages([
    page('/tips/live', 'published'), page('/tips/unfinished', 'improving'), page('/tips/future', 'coming-soon'),
    page('/guide/', 'published', { hidden: true }), page('/cases/', 'published')
  ])
  const links = ['/tips/live', '/tips/unfinished', '/tips/future', '/guide/', '/cases/', '/tips/missing'].map(link => ({ link }))
  assert.deepEqual(filterReadingLinks(links, pages).map(item => item.link), ['/tips/live', '/cases/'])
})

test('featured ordering is independent of navigation numbering and retains visible upcoming labels', () => {
  const pages = buildContentPages([
    page('/cases/01-first', 'published', { featured: true, featuredOrder: 2 }),
    page('/cases/02-next', 'coming-soon', { featured: true, featuredOrder: 1 }),
    page('/cases/03-hidden', 'published', { featured: true, hidden: true })
  ])
  assert.deepEqual(selectFeatured(pages).map(page => page.link), ['/cases/02-next', '/cases/01-first'])
})
