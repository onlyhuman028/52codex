import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { isUsefulCodexContent, selectHotPosts } from './theme/hot-posts-rules.mjs'
import { getFallbackHotGroups, mergeHotGroups } from './theme/hot-posts-data.mjs'

const original = { fetch, caches: globalThis.caches, setTimeout, Date }
const now = Date.parse('2026-10-07T08:00:00Z')
const hour = 3600000
const date = (hours = 1) => new original.Date(now - hours * hour).toISOString()
const response = (body) => new Response(JSON.stringify(body))
let handler

beforeEach(async () => {
  globalThis.Date = class extends original.Date {
    constructor(...args) { super(...(args.length ? args : [now])) }
    static now() { return now }
  }
  globalThis.caches = { default: { match: async () => null, put: async () => {} } }
  globalThis.fetch = async () => { throw new Error('offline') }
  const path = new URL('../functions/api/hot-posts.js', import.meta.url)
  const source = (await readFile(path, 'utf8')).replace(/from '(\.\.?\/[^']+)'/g,
    (_, relative) => `from '${new URL(relative, path).href}'`)
  handler = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).onRequestGet
})

afterEach(() => {
  Object.assign(globalThis, original)
})

async function groups(env = {}) {
  const result = await handler({ request: new Request('https://52codex.site/api/hot-posts'), env })
  assert.equal(result.status, 200)
  return (await result.json()).groups
}

const curatedLinks = [
  'https://x.com/thsottiaux/status/2106845241357824205',
  'https://x.com/liyue_ai/status/2105937541732200691',
  'https://x.com/miles_mazy/status/2091339513134010554'
]

test('X shows the three manual selections in editorial order even offline', async () => {
  const x = (await groups())[0]
  assert.equal(x.status, 'curated')
  assert.deepEqual(x.items.map((item) => item.href), curatedLinks)
  assert.match(x.keyword, /人工精选/)
  assert.doesNotMatch(x.keyword + x.notice, /最近 7 天|暂无可用实时热帖|本周热度/)
})

test('old X provider settings cannot trigger an automatic or paid X request', async () => {
  const requests = []
  globalThis.fetch = async (address) => { requests.push(new URL(address).hostname); return response({}) }
  for (const env of [
    { X_PROVIDER: 'socialdata', SOCIALDATA_API_KEY: 'test-token' },
    { X_PROVIDER: 'official', X_BEARER_TOKEN: 'test-token', X_POST_SOURCE: 'ids', X_POST_IDS: '123' }
  ]) {
    assert.deepEqual((await groups(env))[0].items.map((item) => item.href), curatedLinks)
  }
  assert.ok(!requests.includes('api.socialdata.tools'))
  assert.ok(!requests.includes('api.x.com'))
})

test('frontend merge and stale API cache cannot replace the curated X cards', async () => {
  const old = { updatedAt: date(), groups: [{ source: 'X', status: 'live', keyword: '最近 7 天',
    items: [{ title: '无关 Codex 内容', meta: '10 万浏览', href: 'https://x.com/old/status/1', publishedAt: date() }] }] }
  assert.deepEqual(mergeHotGroups(old.groups)[0].items.map((item) => item.href), curatedLinks)
  globalThis.caches.default.match = async () => response(old)
  assert.deepEqual((await groups())[0].items.map((item) => item.href), curatedLinks)
})

test('manual selections do not age out when there are no new posts', () => {
  const x = getFallbackHotGroups(Date.parse('2027-01-01T00:00:00Z'))[0]
  assert.equal(x.status, 'curated')
  assert.deepEqual(x.items.map((item) => item.href), curatedLinks)
})

test('offline non-X fallback is historical and Chinese', async () => {
  const data = await groups()
  for (const group of data.filter((group) => group.source !== 'X')) {
    assert.equal(group.status, 'fallback')
    assert.doesNotMatch(group.keyword, /最近 7 天/)
    for (const item of group.items) {
      assert.doesNotMatch(item.meta, /本周|最近热帖/)
      assert.match(item.title, /[\u3400-\u9fff]/)
    }
  }
})

test('Bilibili sorts by heat and rejects stale, future, unrelated and English videos', async () => {
  const video = (id, play, extra = {}) => ({ bvid: id, title: 'Codex 中文教程', pubdate: (now - hour) / 1000, play, ...extra })
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.bilibili.com' ? response({ data: { result: [
    video('low', 10), video('high', '20000'), video('old', 90000, { pubdate: (now - 200 * hour) / 1000 }),
    video('future', 90000, { pubdate: (now + hour) / 1000 }), video('unrelated', 90000, { title: '其他中文教程' }),
    video('english', 90000, { title: 'Codex tutorial' }), video('zero', 0)
  ] } }) : response({})
  const bili = (await groups()).find((group) => group.source === 'B站')
  assert.equal(bili.status, 'live')
  assert.deepEqual(bili.items.map((item) => item.href.split('/').at(-2)), ['high', 'low'])
})

test('slow response body expires while fast platforms still appear', async () => {
  globalThis.setTimeout = (fn, ms, ...args) => original.setTimeout(fn, ms <= 10000 ? 20 : ms, ...args)
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.github.com'
    ? { ok: true, json: () => new Promise(() => {}) }
    : new URL(url).hostname === 'api.bilibili.com'
      ? response({ data: { result: [{ bvid: 'fast', title: 'Codex 中文教程', pubdate: (now - hour) / 1000, play: 1000 }] } })
      : response({})
  const data = await Promise.race([groups(), new Promise((_, reject) => original.setTimeout(() => reject(new Error('whole response blocked')), 500))])
  assert.equal(data.find((group) => group.source === 'GitHub').status, 'fallback')
  assert.equal(data.find((group) => group.source === 'B站').status, 'live')
})

test('cache failures do not take down the hot posts endpoint', async () => {
  globalThis.caches = { default: { match: async () => { throw new Error('cache down') }, put: async () => { throw new Error('cache down') } } }
  assert.equal((await groups()).length, 5)
})

test('GitHub uses Chinese descriptions, recent updates and cumulative stars without admitting English projects', async () => {
  const repo = (name, stars, extra = {}) => ({ full_name: name, description: 'Codex 中文教程',
    pushed_at: date(), stargazers_count: stars, html_url: `https://github.com/${name}`, ...extra })
  globalThis.fetch = async (address) => new URL(address).hostname === 'api.github.com'
    ? response({ items: [repo('u/low', 10), repo('u/high', 1000), repo('u/old', 10000, { pushed_at: date(200) }),
      repo('u/english', 10000, { description: 'Codex tutorial' })] }) : response({})
  const github = (await groups()).find((group) => group.source === 'GitHub')
  assert.deepEqual(github.items.map((item) => item.href), ['https://github.com/u/high', 'https://github.com/u/low'])
  assert.match(github.items[0].meta, /累计/)
})

test('YouTube ranks recent Chinese videos by views and excludes missing statistics', async () => {
  const video = (id, views, extra = {}) => ({ id, snippet: { title: 'Codex 中文教程', publishedAt: date(), channelTitle: '作者' },
    statistics: { viewCount: views }, ...extra })
  globalThis.fetch = async (address) => new URL(address).hostname === 'www.googleapis.com'
    ? response({ items: [video('low', '100'), video('high', '20000'), video('missing', 0, { statistics: undefined }),
      video('old', '90000', { snippet: { title: 'Codex 中文教程', publishedAt: date(200) } })] }) : response({})
  const youtube = (await groups({ YOUTUBE_API_KEY: 'test-key', YOUTUBE_VIDEO_IDS: 'low,high,missing,old' })).find((group) => group.source === 'YouTube')
  assert.deepEqual(youtube.items.map((item) => new URL(item.href).searchParams.get('v')), ['high', 'low'])
})

test('Reddit ranks recent Chinese posts by score and rejects future or English posts', async () => {
  const post = (id, score, extra = {}) => ({ title: 'Codex 中文经验', score, created_utc: (now - hour) / 1000,
    permalink: `/r/codex/comments/${id}/`, ...extra })
  globalThis.fetch = async (address) => new URL(address).hostname === 'www.reddit.com'
    ? response({ data: { children: [post('low', 2), post('high', 100), post('future', 200, { created_utc: (now + hour) / 1000 }),
      post('english', 200, { title: 'Codex experience' })].map((data) => ({ data })) } }) : response({})
  const reddit = (await groups()).find((group) => group.source === 'Reddit')
  assert.deepEqual(reddit.items.map((item) => item.href.split('/').at(-2)), ['high', 'low'])
})

test('a cached post that ages beyond seven days becomes historical fallback', async () => {
  globalThis.caches.default.match = async () => response({ updatedAt: date(2), groups: [{
    source: 'B站', status: 'live', keyword: '最近 7 天', items: [{ title: 'Codex 中文', meta: '5 播放',
      publishedAt: date(169), href: 'https://www.bilibili.com/video/old/' }] }] })
  const bili = (await groups()).find((group) => group.source === 'B站')
  assert.equal(bili.status, 'fallback')
  assert.doesNotMatch(bili.items[0].meta, /本周/)
})

test('slow headers are aborted and still return usable fallback', async () => {
  globalThis.setTimeout = (fn, ms, ...args) => original.setTimeout(fn, ms <= 10000 ? 20 : ms, ...args)
  const signals = []
  globalThis.fetch = (_address, init) => { signals.push(init.signal); return new Promise(() => {}) }
  await groups()
  assert.ok(signals.length > 0)
  assert.ok(signals.every((signal) => signal.aborted))
})

test('other platforms apply content screening and use body text to recognize solved questions', async () => {
  globalThis.fetch = async (address) => {
    const host = new URL(address).hostname
    if (host === 'www.reddit.com') return response({ data: { children: [
      { data: { title: 'Codex 登录失败怎么办？', selftext: '解决方法：关闭代理后重新登录，亲测恢复正常。', author: 'helper',
        score: 20, created_utc: (now - hour) / 1000, permalink: '/r/codex/comments/solved/' } },
      { data: { title: 'Codex 登录失败怎么办？', author: 'asker', score: 1000,
        created_utc: (now - hour) / 1000, permalink: '/r/codex/comments/unsolved/' } }
    ] } })
    if (host === 'api.bilibili.com') return response({ data: { result: [
      { bvid: 'tutorial', title: 'Codex 中文实战教程', pubdate: (now - hour) / 1000, play: 100 },
      { bvid: 'ad', title: 'Codex 教程，扫码加群，私信购买', pubdate: (now - hour) / 1000, play: 100000 }
    ] } })
    return response({})
  }
  const data = await groups()
  assert.deepEqual(data.find((g) => g.source === 'Reddit').items.map((i) => i.href), ['https://www.reddit.com/r/codex/comments/solved/'])
  assert.deepEqual(data.find((g) => g.source === 'B站').items.map((i) => i.href), ['https://www.bilibili.com/video/tutorial/'])
})

test('content signals belong to the Codex topic rather than another item in a roundup', () => {
  const cases = [
    ['分享投资经验：港卡、美股、标普500、复利、Codex、雅思7.0。', '', false],
    ['想学的工具有：Excel、Codex、剪映。下面是剪映的实战教程。', '', false],
    ['最近试过 Codex、Excel、剪映。Excel 导出报错怎么办？解决方法如下。', '', false],
    ['Codex 新增定时任务功能，可以每天自动整理报表。', '', true],
    ['Codex 中文教程：从安装到制作第一个工具', '', true],
    ['让 Codex 帮我做客户管理工具，完成了导入和提醒功能。', '', true],
    ['Codex 怎么登录？', '步骤：在设置中退出账户后重新登录。', true],
    ['Codex 怎么登录？', '没有手机号，求助！', false],
    ['Codex 登录失败，有没有完整教程？', '', false],
    ['求助：Codex 安装步骤在哪里可以找到？', '', false],
    ['Codex 登录报错，有没有解决方法？亲测重装没用。', '', false],
    ['Codex 安装教程没用，登录还是失败。', '', false],
    ['Codex 的配置太垃圾了，完全不好用。', '', false],
    ['Codex 又新增了，好用！', '', false],
    ['Codex 安装报错，解决方法：删除旧配置后重新安装，恢复正常。', '', true],
    ['Codex 怎么配置？', '', false],
    ['想求一份 Codex 配置教程。', '', false],
    ['Codex 登录报错怎么办？', 'Excel 导出失败，解决方法是重新启动 Excel。', false],
    ['Codex 登录报错怎么办，解决方法：关闭代理后重新登录。', '', true],
    ['Codex 配置教程：如何设置第三方 API', '', true],
    ['其他工具的教程', '原来还有 Codex。', false],
    ['mycodex 中文教程', '', false],
    ['Codex 中文教程，扫码加群购买课程', '', false]
  ]
  for (const [title, body, expected] of cases) assert.equal(isUsefulCodexContent(title, body), expected, title)
})

test('same-author near duplicates do not crowd out distinct work or another author', () => {
  const text = 'Codex 实战教程：自动整理客户回访记录，提取客户姓名和联系方式，生成每周统计报表，并把待处理事项导出到表格。'
  const candidate = (id, authorKey, heat, extra = {}) => ({ text, authorKey, heat,
    item: { href: `https://x.com/test/status/${id}`, publishedAt: date() }, ...extra })
  const items = selectHotPosts([
    candidate('original', 'a', 100), candidate('repeat', 'a', 90, { text: `${text}附图。` }),
    candidate('other-author', 'b', 80), candidate('different-case', 'a', 70, { text: 'Codex 中文教程：搭建库存管理工具，支持物品入库和出库。' })
  ], now)
  assert.deepEqual(items.map((item) => item.href.split('/').pop()), ['original', 'other-author', 'different-case'])
})

test('a shared channel description does not merge tutorials about different tasks', () => {
  const body = '这个频道分享实用工具的使用方法、注意事项和操作演示，面向没有编程基础的读者。我们会介绍资料准备、需求整理、操作界面、文件管理、数据导入、结果校验、日常维护和版本发布，帮助大家理解从想法到成品的完整过程。每期视频都会记录环境设置、运行条件、使用限制、常见误区、改进方向与后续学习建议。演示素材仅用于练习，实际应用时请根据自己的场景调整字段和流程。欢迎在评论区交流实践经验，提出你希望看到的应用主题，后续内容会继续围绕业务办公、个人效率和团队协作展开。'
  const candidate = (id, text, heat) => ({ text, body, authorKey: 'same-channel', heat,
    item: { href: `https://www.youtube.com/watch?v=${id}`, publishedAt: date() } })
  const items = selectHotPosts([
    candidate('inventory', 'Codex 实战：制作库存管理工具', 100),
    candidate('customers', 'Codex 实战：制作客户管理工具', 90)
  ], now)
  assert.deepEqual(items.map((item) => new URL(item.href).searchParams.get('v')), ['inventory', 'customers'])
})
