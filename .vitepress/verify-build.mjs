import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import path from 'node:path'

const root = process.argv[2]
if (!root) throw new Error('用法：node .vitepress/verify-build.mjs <临时构建目录>')
const html = file => readFile(path.join(root, file), 'utf8')
const article = await html('tips/04-agents-md.html')
assert.ok(article.includes('本文目录'), '长文章必须提供目录')
assert.match(article, /阅读约 \d+ 分钟（估算）/)
assert.ok(!article.includes('额度消耗 ≈ 30%'))
const upcoming = await html('cases/09-goal-mode-project.html')
assert.ok(upcoming.includes('noindex,follow'))
const improving = await html('cases/03-auto-video-edit.html')
assert.ok(improving.includes('noindex,follow'))
const published = await html('guide/16-publish-project.html')
assert.ok(!published.includes('noindex,follow'))
const sitemap = await html('sitemap.xml')
assert.ok(!sitemap.includes('09-goal-mode-project'))
assert.ok(!sitemap.includes('03-auto-video-edit'))
assert.ok(sitemap.includes('16-publish-project'))
const home = await html('index.html')
assert.ok(home.includes('aria-label="案例分类"'))
assert.ok(home.includes('mailto:hello@52codex.site?subject='))
assert.ok(home.includes('https://github.com/onlyhuman028/52codex'))
assert.ok(!home.includes('href="#"'))
console.log('构建产物检查通过：目录、阅读时间、文章状态、robots、sitemap、首页入口。')
