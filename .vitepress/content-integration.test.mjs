import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createMarkdownRenderer } from 'vitepress'
import { buildContentPages, contentDestination, isIndexable } from './theme/content-policy.mjs'

test('repository articles have explicit states and consistent entry-point eligibility', async () => {
  const md = await createMarkdownRenderer(process.cwd())
  const entries = []
  for (const folder of ['guide', 'tips', 'cases', 'plugins']) {
    for (const file of (await readdir(folder)).filter(file => file.endsWith('.md'))) {
      const src = await readFile(`${folder}/${file}`, 'utf8')
      const env = {}
      // Parse only frontmatter using the same renderer as the site; never execute article scripts.
      md.render(src.match(/^---\s*\n[\s\S]*?\n---/)?.[0] || '', env)
      entries.push({ url: `/${folder}/${file}`, frontmatter: env.frontmatter, src })
    }
  }
  const pages = buildContentPages(entries)
  for (const page of pages) {
    const entry = entries.find(entry => entry.url.replace(/\.md$/, '').replace(/\/index$/, '/') === page.link)
    assert.ok(entry, page.link)
    if (entry.src.includes("router.go('/coming-soon')")) assert.equal(page.status, 'coming-soon', page.link)
    if (page.status !== 'published') {
      assert.equal(page.recommendable, false, page.link)
      assert.equal(isIndexable(entry.frontmatter), false, page.link)
    }
    if (page.status === 'coming-soon') assert.equal(contentDestination(page), '/coming-soon')
    if (page.featured && page.link.startsWith('/cases/')) assert.ok(page.cover && page.category, `首页精选缺少封面或分类：${page.link}`)
    if (page.link.startsWith('/cases/') && !page.isIndex) assert.ok([1, 2, 3].includes(page.level), page.link)
  }
})
