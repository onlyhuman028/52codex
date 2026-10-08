import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { isUsefulCodexContent, selectHotPosts } from './theme/hot-posts-rules.mjs'

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

const tweet = (id, options = {}) => ({ id, text: `Codex 中文实战 ${id}`, author_id: 'u1',
  created_at: date(), public_metrics: { like_count: 10 }, ...options })
const xResponse = (tweets) => response({ data: tweets, includes: { users: [{ id: 'u1', name: '测试作者', username: 'tester' }] } })

test('offline fallback is historical, Chinese, and the search window moves with today', async () => {
  const data = await groups()
  for (const group of data) {
    assert.equal(group.status, 'fallback')
    assert.doesNotMatch(group.keyword, /最近 7 天/)
    for (const item of group.items) {
      assert.doesNotMatch(item.meta, /本周|最近热帖/)
      assert.match(item.title, /[\u3400-\u9fff]/)
    }
  }
  assert.match(new URL(data[0].moreHref).searchParams.get('q'), /since:2026-09-30 until:2026-10-08/)
})

test('X searches and ranks only recent Chinese Codex posts with engagement', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com' ? xResponse([
    tweet('1', { public_metrics: { like_count: 5 } }),
    tweet('2', { created_at: date(24), public_metrics: { like_count: 500 } }),
    tweet('3', { created_at: date(200) }),
    tweet('4', { created_at: date(-1) }),
    tweet('5', { text: 'Codex English tutorial' }),
    tweet('6', { text: '无关中文话题' }),
    tweet('7', { public_metrics: {} }),
    tweet('8', { created_at: 'invalid' }),
    tweet('9', { referenced_tweets: [{ type: 'retweeted', id: '1' }] })
  ]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.equal(x.status, 'live')
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['2', '1'])
  assert.equal(x.items[0].publishedAt, date(24))
  assert.match(x.items[0].meta, /500 赞/)
})

test('SocialData can supply Chinese X originals using the documented tweet fields', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.socialdata.tools'
    ? response({ tweets: [{ id_str: '123', full_text: 'Codex 中文工作流', tweet_created_at: date(),
      favorite_count: 100, retweet_count: 2, views_count: 2000, user: { id_str: 'u', name: '作者', screen_name: 'author' } }] })
    : response({})
  const x = (await groups({ X_PROVIDER: 'socialdata', SOCIALDATA_API_KEY: 'test-token' }))[0]
  assert.equal(x.status, 'live')
  assert.equal(x.items[0].href, 'https://x.com/author/status/123')
  assert.match(x.items[0].meta, /浏览/)
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

test('X accepts current post field names and excludes reposts in current responses', async () => {
  globalThis.fetch = async (address) => {
    const url = new URL(address)
    if (url.hostname !== 'api.x.com') return response({})
    if (!url.searchParams.get('post.fields')?.includes('created_at')) return new Response('', { status: 400 })
    return xResponse([tweet('10', { referenced_posts: [{ type: 'retweeted', id: '11' }] }), tweet('11')])
  }
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.equal(x.status, 'live')
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['11'])
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
    source: 'X', status: 'live', keyword: '最近 7 天', items: [{ title: 'Codex 中文', meta: '5 赞',
      publishedAt: date(169), href: 'https://x.com/test/status/1' }] }] })
  const x = (await groups())[0]
  assert.equal(x.status, 'fallback')
  assert.doesNotMatch(x.items[0].meta, /本周/)
})

test('slow headers are aborted and still return usable fallback', async () => {
  globalThis.setTimeout = (fn, ms, ...args) => original.setTimeout(fn, ms <= 10000 ? 20 : ms, ...args)
  const signals = []
  globalThis.fetch = (_address, init) => { signals.push(init.signal); return new Promise(() => {}) }
  await groups()
  assert.ok(signals.length > 0)
  assert.ok(signals.every((signal) => signal.aborted))
})

test('X rejects incidental mentions and unanswered complaints, but keeps cases and solutions', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com' ? xResponse([
    tweet('list', { text: '想象一下这辈子都不会接触到：港卡、美股、纳斯达克100、标普500、复利、雅思7.0、Codex。', public_metrics: { like_count: 10000 } }),
    tweet('help', { text: '这咋整啊？退出了一下Codex再来登录就要验证手机号了，以前从来不要，我没有手机号码，有啥好办法？', public_metrics: { like_count: 9000 } }),
    tweet('case', { text: '让 Codex 帮我把余下的几台小米路由器也 root 了。ROM 降级、SSH 注入、重启固化，一条龙完成。', public_metrics: { like_count: 100 } }),
    tweet('solution', { text: 'Codex 登录报错怎么办？解决方法：关闭代理后重新登录，亲测恢复正常。', public_metrics: { like_count: 50 } }),
    tweet('ad', { text: 'Codex 实战教程限时优惠，扫码加群领取，私信购买课程。', public_metrics: { like_count: 8000 } }),
    tweet('praise', { text: 'Codex 太厉害了，真的无敌！', public_metrics: { like_count: 7000 } })
  ]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['case', 'solution'])
})

test('X favors interaction over huge view counts and does not admit views alone', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com' ? xResponse([
    tweet('views', { public_metrics: { impression_count: 1000000, like_count: 1 } }),
    tweet('useful', { public_metrics: { impression_count: 100, like_count: 30, bookmark_count: 20 } }),
    tweet('views-only', { public_metrics: { impression_count: 2000000 } })
  ]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['useful', 'views'])
})

test('X halves heat each day and removes repeated content from the same author', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com' ? xResponse([
    tweet('old', { text: 'Codex 中文入门教程：从安装到完成第一个项目', created_at: date(72), public_metrics: { like_count: 100 } }),
    tweet('new', { text: 'Codex Skill 配置教程：自动整理业务报表', created_at: date(1), public_metrics: { like_count: 20 } }),
    tweet('repeat', { text: 'Codex Skill 配置教程：自动整理业务报表！https://t.co/copy', created_at: date(2), public_metrics: { like_count: 10 } }),
    tweet('different', { text: 'Codex 工作流：批量生成客户回访记录', author_id: 'u2', created_at: date(3), public_metrics: { like_count: 5 } })
  ]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['new', 'old', 'different'])
})

test('all rejected X candidates use marked historical fallback rather than filling the live feed', async () => {
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com'
    ? xResponse([tweet('help', { text: 'Codex 登录又失败了，有没有人知道怎么办？' })]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.equal(x.status, 'fallback')
  assert.match(x.notice, /历史精选/)
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

test('deployment bypasses the old cached ranking and uses newly screened results', async () => {
  globalThis.caches.default.match = async (key) => new URL(key.url).searchParams.get('hot-posts-version') === '2'
    ? response({ groups: [{ source: 'X', status: 'live', items: [{ title: '投资：美股、Codex', meta: '10万浏览',
      publishedAt: date(), href: 'https://x.com/old/status/1' }] }] }) : null
  globalThis.fetch = async (url) => new URL(url).hostname === 'api.x.com' ? xResponse([tweet('fresh')]) : response({})
  const x = (await groups({ X_BEARER_TOKEN: 'test-token' }))[0]
  assert.deepEqual(x.items.map((item) => item.href.split('/').pop()), ['fresh'])
})
