const rawGuidePages = Object.entries(import.meta.glob('/guide/*.md', { eager: true, query: '?raw', import: 'default' }))

function getFrontmatterValue(content: string, key: string) {
  return content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() || ''
}

function getFrontmatterNumber(content: string, key: string) {
  const value = getFrontmatterValue(content, key)
  return value ? Number(value) : 0
}

function getFrontmatterBoolean(content: string, key: string) {
  return getFrontmatterValue(content, key).toLowerCase() === 'true'
}

function getOrder(path: string) {
  const file = path.split('/').pop() || ''
  return Number(file.match(/^(\d+)-/)?.[1] || 999)
}

function getFallbackTitle(path: string) {
  return (path.split('/').pop() || '')
    .replace(/^\d+-/, '')
    .replace(/\.md$/, '')
    .replaceAll('-', ' ')
}

export const guidePages = rawGuidePages
  .filter(([path]) => !path.endsWith('/index.md'))
  .map(([path, content]) => {
    const text = String(content)
    return {
      hidden: getFrontmatterBoolean(text, 'hidden'),
      order: getFrontmatterNumber(text, 'order') || getOrder(path),
      text: getFrontmatterValue(text, 'title') || getFallbackTitle(path),
      description: getFrontmatterValue(text, 'description'),
      link: path.replace(/\.md$/, '')
    }
  })
  .filter((page) => !page.hidden)
  .sort((a, b) => a.order - b.order || a.link.localeCompare(b.link, 'zh-CN', { numeric: true }))
