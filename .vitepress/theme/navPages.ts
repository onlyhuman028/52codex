type RawPage = [string, string]

type NavPage = {
  hidden: boolean
  order: number
  level: number
  text: string
  description: string
  tags: string[]
  link: string
}

const rawGuidePages = Object.entries(import.meta.glob('/guide/*.md', { eager: true, query: '?raw', import: 'default' })) as RawPage[]
const rawTipPages = Object.entries(import.meta.glob('/tips/*.md', { eager: true, query: '?raw', import: 'default' })) as RawPage[]
const rawCasePages = Object.entries(import.meta.glob('/cases/*.md', { eager: true, query: '?raw', import: 'default' })) as RawPage[]
const rawPluginPages = Object.entries(import.meta.glob('/plugins/*.md', { eager: true, query: '?raw', import: 'default' })) as RawPage[]

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

function getFrontmatterTags(content: string) {
  const value = getFrontmatterValue(content, 'tags')
  if (!value.startsWith('[') || !value.endsWith(']')) return []

  return value
    .slice(1, -1)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getOrder(path: string) {
  const file = path.split('/').pop() || ''
  return Number(file.match(/^(\d+)[-\s]/)?.[1] || 999)
}

function getTitleOrder(title: string) {
  return Number(title.match(/^(\d+)\s/)?.[1] || 0)
}

function getFallbackTitle(path: string) {
  return (path.split('/').pop() || '')
    .replace(/^\d+[-\s]/, '')
    .replace(/\.md$/, '')
    .replaceAll('-', ' ')
}

function isBuildPage(path: string, options: { includeIndex?: boolean } = {}) {
  const file = path.split('/').pop() || ''
  if (!options.includeIndex && file === 'index.md') return false

  return !file.includes(' ')
}

function createPages(rawPages: RawPage[], options: { includeIndex?: boolean } = {}) {
  return rawPages
    .filter(([path]) => isBuildPage(path, options))
    .map(([path, content]) => {
      const text = String(content)
      const title = getFrontmatterValue(text, 'navTitle') || getFrontmatterValue(text, 'title') || getFallbackTitle(path)
      return {
        hidden: getFrontmatterBoolean(text, 'hidden'),
        order: getFrontmatterNumber(text, 'order') || getTitleOrder(title) || getOrder(path),
        level: getFrontmatterNumber(text, 'level'),
        text: title,
        description: getFrontmatterValue(text, 'description'),
        tags: getFrontmatterTags(text),
        link: path.replace(/\.md$/, '')
      }
    })
    .filter((page) => !page.hidden)
    .sort((a, b) => a.order - b.order || a.link.localeCompare(b.link, 'zh-CN', { numeric: true }))
}

export const guidePages: NavPage[] = createPages(rawGuidePages)
export const tipPages: NavPage[] = createPages(rawTipPages, { includeIndex: true })
export const casePages: NavPage[] = createPages(rawCasePages)
export const pluginPages: NavPage[] = createPages(rawPluginPages)
export const skillPages = pluginPages.filter((page) => page.tags.includes('Skill'))
export const pluginToolPages = pluginPages.filter((page) => !page.tags.includes('Skill'))
