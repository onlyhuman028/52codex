const rawGuidePages = Object.entries(import.meta.glob('/guide/*.md', { eager: true, query: '?raw', import: 'default' }))

function getFrontmatterValue(content: string, key: string) {
  return content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() || ''
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
  .sort(([a], [b]) => a.localeCompare(b, 'zh-CN', { numeric: true }))
  .map(([path, content]) => {
    const text = String(content)
    return {
      order: getOrder(path),
      text: getFrontmatterValue(text, 'title') || getFallbackTitle(path),
      description: getFrontmatterValue(text, 'description'),
      link: path.replace(/\.md$/, '')
    }
  })
