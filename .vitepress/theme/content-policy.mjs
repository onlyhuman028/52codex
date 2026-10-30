export const CONTENT_STATES = { published: '已发布', improving: '待完善', 'coming-soon': '待上线' }

export function normalizeContentUrl(value) {
  const url = String(value).replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0]
  return `/${url.replace(/^\//, '').replace(/(^|\/)index\.(md|html)$/, '$1').replace(/\.(md|html)$/, '')}`
}

export function isIndexable(frontmatter = {}) {
  return !frontmatter.hidden && !frontmatter.noindex && (!frontmatter.status || frontmatter.status === 'published')
}

export function readingMinutes(source = '') {
  const text = source.replace(/^---\s*\n[\s\S]*?\n---/, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/https?:\/\/\S+/g, '')
    .replace(/<[^>]+>/g, '').replace(/[#*`|_>]/g, '')
  const han = (text.match(/[\u3400-\u9fff]/g) || []).length
  const words = (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length
  return Math.max(1, Math.ceil(han / 300 + words / 200))
}

export function contentDestination(page) {
  return page.status === 'coming-soon' ? '/coming-soon' : page.link
}

export function filterCases(pages, category) {
  return category === '全部' ? pages : pages.filter(page => page.category === category)
}

export function filterReadingLinks(links, pages) {
  return links.filter(item => pages.some(page => page.link === normalizeContentUrl(item.link) && !page.hidden && page.status === 'published'))
}

export function selectFeatured(pages) {
  return pages.filter(page => page.featured && !page.hidden && !page.isIndex)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.order - b.order)
}

export function buildContentPages(entries) {
  return entries.map(({ url, frontmatter: fm, src }) => {
    if (!Object.hasOwn(CONTENT_STATES, fm.status)) throw new Error(`${url}: status 必须为 published / improving / coming-soon`)
    const link = normalizeContentUrl(url)
    const isIndex = link.endsWith('/') || link === '/tips/01-index'
    const text = String(fm.navTitle || fm.title || link)
    const quota = fm.quotaUsage
    return {
      link, isIndex, text, description: String(fm.description || ''),
      order: Number(fm.order) || Number(text.match(/^(\d+)\s/)?.[1]) || Number(link.match(/\/(\d+)-[^/]+$/)?.[1]) || 999,
      level: Number(fm.level) || 0, tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      status: fm.status, statusLabel: CONTENT_STATES[fm.status], hidden: Boolean(fm.hidden),
      recommendable: !isIndex && !fm.hidden && fm.status === 'published',
      category: String(fm.category || ''), featured: fm.featured === true,
      featuredOrder: Number(fm.featuredOrder) || Number(fm.order) || 999,
      cover: typeof fm.cover === 'string' ? fm.cover.replace(/^\.\//, `${link.slice(0, link.lastIndexOf('/') + 1)}`) : '',
      coverAlt: String(fm.coverAlt || fm.title || ''), readingMinutes: readingMinutes(src),
      quotaUsage: quota && typeof quota.value === 'number' && Number.isFinite(quota.value) && quota.value >= 0 && quota.value <= 100 && typeof quota.source === 'string' && quota.source.trim()
        ? { value: quota.value, source: quota.source.trim() } : null
    }
  }).sort((a, b) => a.order - b.order || a.link.localeCompare(b.link, 'zh-CN', { numeric: true }))
}
