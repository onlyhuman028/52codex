import { defineConfig } from 'vitepress'
import { isIndexable, normalizeContentUrl } from './theme/content-policy.mjs'

const siteUrl = 'https://www.52codex.site'
const siteTitle = '我爱CodeX'
const siteDescription = '技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。'
const defaultImage = `${siteUrl}/images/og-default.svg`
const siteKeywords = [
  'Codex',
  'Codex 学习',
  'Codex 新人',
  'Codex 实战',
  'Codex 入门',
  'Codex 免费',
  'Codex 重置',
  'Codex 新手',
  'Codex 小白',
  '不会编程',
  'Codex 教程',
  'Codex 安装',
  'Codex 配置',
  'Codex 保姆教程',
  'Codex 工作流',
  'Codex 实操',
  'AI 编程',
  'Codex 学习地图',
  'Codex 零基础',
  'Codex 指南',
  'Codex 经验',
  'Codex Skills',
  'Skills 安装',
  'Codex Windows',
  'Codex 怎么用',
  'Codex 是什么',
  'Codex GitHub',
  'Codex 下载',
  'Codex 自动化',
  'Codex 插件',
  'Codex 心法',
  'GPT-6.1 Sol',
  'GPT-6 Astra',
  'GPT-6 Sol',
  'GPT-6 Luna',
  'Codex GPT-6.1 Sol',
  'Codex GPT-6 Astra',
  'Codex GPT-6 Sol',
  'Codex GPT-6 Luna',
  'ChatGPT Work',
  'Codex Ultra',
  'Codex 子代理',
  'GPT-5.6',
  'GPT-5.6 Sol',
  'GPT-5.6 Terra',
  'GPT-5.6 Luna',
  'Codex 5.6',
  'Codex 5.6 Sol',
  'Codex 5.6 Terra',
  'Codex 5.6 Luna',
  'Codex GPT-5.6',
  'Codex 模型选择',
].join(', ')

const excludedRoutes = new Set<string>()

function pagePath(page: string) {
  if (page === 'index.md') return '/'
  return `/${page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
}

function applyScreenshotAttrs(state: any) {
  for (const token of state.tokens) {
    if (token.type !== 'inline' || !token.children) continue

    for (let index = 0; index < token.children.length; index += 1) {
      const child = token.children[index]
      const next = token.children[index + 1]

      if (child.type !== 'image' || next?.type !== 'text') continue

      const match = next.content.match(/^\{#([A-Za-z][\w-]*)\}/)
      if (!match) continue

      child.attrSet('id', match[1])
      next.content = next.content.slice(match[0].length)

      if (!next.content) {
        token.children.splice(index + 1, 1)
      }
    }
  }
}

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',
  cleanUrls: true,
  srcExclude: [
    'AGENTS.md',
    'DESIGN.md',
    'write_rules.md',
    'plugins/01 top-skills.md',
    'plugins/02 content-creator-skills.md',
    'plugins/03 codex-practical-plugins.md',
  ],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }],
    ['meta', { name: 'keywords', content: siteKeywords }],
    ['meta', { property: 'og:site_name', content: siteTitle }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@onlyhuman028' }],
  ],
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items
        .filter(item => !excludedRoutes.has(normalizeContentUrl(item.url)))
        .map((item) => ({ ...item, changefreq: 'weekly' }))
    },
  },
  transformPageData(pageData) {
    const url = normalizeContentUrl(pageData.relativePath)
    if (isIndexable(pageData.frontmatter)) excludedRoutes.delete(url)
    else excludedRoutes.add(url)
  },
  transformHead({ page, title, description, pageData }) {
    const path = pagePath(page)
    const url = `${siteUrl}${path}`
    const desc = description || siteDescription
    const image = pageData.frontmatter.image
      ? `${siteUrl}${pageData.frontmatter.image}`
      : defaultImage
    const shouldNoindex = !isIndexable(pageData.frontmatter)

    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:type', content: pageData.frontmatter.date ? 'article' : 'website' }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: image }],
      ...(shouldNoindex ? [['meta', { name: 'robots', content: 'noindex,follow' }] as const] : []),
    ]
  },
  markdown: {
    headers: { level: [2, 3] },
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    config(md) {
      md.core.ruler.after('inline', 'image_screenshot_attrs', applyScreenshotAttrs)
    }
  }
})
