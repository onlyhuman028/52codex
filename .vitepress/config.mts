import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '我爱CodeX',
  description: '技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。',
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
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }]
  ],
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
