import { defineConfig } from 'vitepress'

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

const noindexPages = new Set([
  'coming-soon.md',
  'resources.md',
  'resources/comment-admin.md',
  'write_rules.md',
  'guide/06-first-project.md',
  'guide/10-snake-game.md',
  'guide/11-improve-old-project.md',
  'guide/13-skill-ppt.md',
  'guide/15-goal-mode-project.md',
  'guide/16-publish-project.md',
  'cases/05-install-openclaw.md',
  'cases/10-weekly-plan-system.md',
])

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
        .filter((item) => {
          const route = item.url.replace(siteUrl, '').replace(/^\//, '')
          const mdPath = route.endsWith('/') ? `${route}index.md` : `${route}.md`
          return !noindexPages.has(mdPath)
        })
        .map((item) => ({ ...item, changefreq: 'weekly' }))
    },
  },
  transformHead({ page, title, description, pageData }) {
    const path = pagePath(page)
    const url = `${siteUrl}${path}`
    const desc = description || siteDescription
    const image = pageData.frontmatter.image
      ? `${siteUrl}${pageData.frontmatter.image}`
      : defaultImage
    const shouldNoindex =
      noindexPages.has(page) ||
      pageData.frontmatter.hidden ||
      pageData.frontmatter.noindex ||
      pageData.frontmatter.title === '即将上线'

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
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    config(md) {
      md.core.ruler.after('inline', 'image_screenshot_attrs', applyScreenshotAttrs)
    }
  }
})
