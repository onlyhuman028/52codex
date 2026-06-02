import { defineConfig } from 'vitepress'

const siteUrl = 'https://www.52codex.site'
const siteTitle = '我爱CodeX'
const siteDescription = '技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。'
const defaultImage = `${siteUrl}/images/og-default.svg`

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
    }
  }
})
