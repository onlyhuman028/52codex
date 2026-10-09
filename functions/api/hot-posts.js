import {
  RECENT_DAYS,
  getFallbackHotGroups, mergeHotGroups, isRecent, safeHref, fetchJsonWithTimeout
} from '../../.vitepress/theme/hot-posts-data.mjs'
import { selectHotPosts } from '../../.vitepress/theme/hot-posts-rules.mjs'

const CACHE_SECONDS = 900
const DEGRADED_CACHE_SECONDS = 60
const PLATFORM_TIMEOUT_MS = 6500

export async function onRequestGet({ request, env = {}, waitUntil }) {
  const cache = globalThis.caches?.default
  const cacheUrl = new URL(request.url)
  // Avoid serving the previous payload format or yesterday's search links.
  cacheUrl.searchParams.set('hot-posts-version', '5')
  cacheUrl.searchParams.set('day', new Date().toISOString().slice(0, 10))
  const cacheKey = new Request(cacheUrl)
  try {
    const cached = await cache?.match(cacheKey)
    if (cached) {
      const body = await cached.json()
      return jsonResponse({ ...body, groups: mergeHotGroups(body.groups) })
    }
  } catch { /* A cache failure should not disable the feed. */ }

  const builders = [buildGitHubGroup, buildBilibiliGroup, buildRedditGroup, buildYouTubeGroup]
  const groups = mergeHotGroups(await Promise.all(builders.map((build) => withPlatformDeadline((signal) => build(env, signal)))))
  const response = jsonResponse({ updatedAt: new Date().toISOString(), groups })
  if (cache) {
    const save = cache.put(cacheKey, response.clone()).catch(() => {})
    if (waitUntil) waitUntil(save)
    else await save
  }
  return response
}

async function withPlatformDeadline(task) {
  const controller = new AbortController()
  let timer
  try {
    return await Promise.race([
      task(controller.signal),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort()
          reject(new Error('Platform timed out'))
        }, PLATFORM_TIMEOUT_MS)
      })
    ])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function liveGroup(source, items, keyword) {
  if (!items.length) return null
  const base = getFallbackHotGroups().find((group) => group.source === source)
  return { ...base, status: 'live', notice: '', keyword, items }
}

async function buildGitHubGroup(env, signal) {
  const url = new URL('https://api.github.com/search/repositories')
  const query = `codex in:name,description pushed:>=${new Date(Date.now() - RECENT_DAYS * 86400000).toISOString().slice(0, 10)} stars:>0`
  url.searchParams.set('q', query)
  url.searchParams.set('sort', 'stars')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('per_page', '50')
  const data = await fetchJsonWithTimeout(url, { signal, headers: {
    Accept: 'application/vnd.github+json', 'User-Agent': '52codex-hot-posts',
    ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {})
  } })
  const now = Date.now()
  const items = selectHotPosts((data.items || [])
    .filter((repo) => isRecent(repo.pushed_at, now)
      && count(repo.stargazers_count) > 0 && safeHref(repo.html_url))
    .map((repo) => ({ text: `${repo.full_name}：${stripHtml(repo.description)}`,
      heat: count(repo.stargazers_count), authorKey: repo.owner?.login,
      item: { title: `${repo.full_name}：${stripHtml(repo.description).slice(0, 90)}`,
      author: repo.owner?.login || repo.full_name.split('/')[0],
      avatar: safeHref(repo.owner?.avatar_url) ? repo.owner.avatar_url : '',
      meta: `GitHub · ${formatRelativeTime(repo.pushed_at, now)}更新 · ${formatNumber(repo.stargazers_count)} 收藏（累计）`,
      publishedAt: repo.pushed_at, href: repo.html_url } })), now)
  const group = liveGroup('GitHub', items, 'Codex 中文项目 · 最近 7 天更新 · 累计收藏与更新时效')
  if (group) group.moreHref = `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories&s=stars&o=desc`
  return group
}

async function buildBilibiliGroup(_env, signal) {
  const url = new URL('https://api.bilibili.com/x/web-interface/search/type')
  url.searchParams.set('search_type', 'video')
  url.searchParams.set('keyword', 'codex')
  url.searchParams.set('order', 'click')
  url.searchParams.set('pubtime', '7')
  url.searchParams.set('page', '1')
  const data = await fetchJsonWithTimeout(url, { signal, headers: {
    Referer: 'https://search.bilibili.com/', 'User-Agent': '52codex-hot-posts/1.0'
  } })
  const now = Date.now()
  const items = selectHotPosts((data.data?.result || [])
    .filter((video) => isRecent(count(video.pubdate) * 1000, now)
      && count(video.play) > 0 && (video.bvid || safeHref(video.arcurl)))
    .map((video) => ({ text: stripHtml(video.title), heat: count(video.play), authorKey: String(video.mid || video.author || ''),
      item: { title: stripHtml(video.title), author: video.author || 'B站创作者',
      meta: `B站视频 · ${formatRelativeTime(count(video.pubdate) * 1000, now)} · ${formatNumber(video.play)} 播放`,
      publishedAt: new Date(count(video.pubdate) * 1000).toISOString(),
      href: video.bvid ? `https://www.bilibili.com/video/${video.bvid}/` : video.arcurl } })), now)
  const group = liveGroup('B站', items, 'Codex 中文 · 最近 7 天 · 播放与时效热度')
  if (group) group.moreHref = 'https://search.bilibili.com/all?keyword=codex&order=click&pubtime=7'
  return group
}

async function buildRedditGroup(_env, signal) {
  const url = 'https://www.reddit.com/r/codex/search.json?q=Codex&restrict_sr=1&sort=top&t=week&limit=50'
  const data = await fetchJsonWithTimeout(url, { signal, headers: { 'User-Agent': '52codex-hot-posts/1.0' } })
  const now = Date.now()
  const items = selectHotPosts((data.data?.children || []).map(({ data }) => data)
    .filter((post) => post && isRecent(count(post.created_utc) * 1000, now) && /[\u3400-\u9fff]/.test(post.title)
      && !post.over_18 && !post.stickied && count(post.score) > 0 && typeof post.permalink === 'string' && post.permalink.startsWith('/r/'))
    .map((post) => ({ text: post.title, body: post.selftext, heat: count(post.score),
      authorKey: post.author === '[deleted]' ? '' : post.author,
      item: { title: post.title, author: post.author ? `u/${post.author}` : 'r/codex 社区',
      meta: `r/codex · ${formatRelativeTime(count(post.created_utc) * 1000, now)} · ${formatNumber(post.score)} 净赞 · ${formatNumber(post.num_comments)} 评论`,
      publishedAt: new Date(count(post.created_utc) * 1000).toISOString(), href: `https://www.reddit.com${post.permalink}` } })), now)
  const group = liveGroup('Reddit', items, 'Codex 中文 · 最近 7 天 · 净赞与时效热度')
  if (group) group.moreHref = 'https://www.reddit.com/r/codex/search/?q=Codex&restrict_sr=1&sort=top&t=week'
  return group
}

async function buildYouTubeGroup(env, signal) {
  const apiKey = env.YOUTUBE_API_KEY
  if (!apiKey) return null
  let ids = splitEnvList(env.YOUTUBE_VIDEO_IDS)
  if (!ids.length) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    Object.entries({ part: 'id', q: env.YOUTUBE_SEARCH_QUERY || 'Codex 中文 教程 案例', type: 'video',
      order: 'viewCount', maxResults: '25', relevanceLanguage: 'zh',
      publishedAfter: new Date(Date.now() - RECENT_DAYS * 86400000).toISOString(), key: apiKey })
      .forEach(([key, value]) => url.searchParams.set(key, value))
    const data = await fetchJsonWithTimeout(url, { signal })
    ids = (data.items || []).map((item) => item.id?.videoId).filter(Boolean)
  }
  if (!ids.length) return null
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  Object.entries({ part: 'snippet,statistics', id: ids.slice(0, 25).join(','), key: apiKey })
    .forEach(([key, value]) => url.searchParams.set(key, value))
  const data = await fetchJsonWithTimeout(url, { signal })
  const now = Date.now()
  const items = selectHotPosts((data.items || [])
    .filter((video) => video.id && isRecent(video.snippet?.publishedAt, now) && /[\u3400-\u9fff]/.test(video.snippet?.title)
      && count(video.statistics?.viewCount) > 0)
    .map((video) => ({ text: video.snippet.title, body: video.snippet.description,
      heat: count(video.statistics.viewCount), authorKey: video.snippet.channelId || video.snippet.channelTitle,
      item: { title: video.snippet.title, author: video.snippet.channelTitle || 'YouTube 创作者',
      meta: `YouTube · ${formatRelativeTime(video.snippet.publishedAt, now)} · ${formatNumber(video.statistics.viewCount)} 播放`,
      publishedAt: video.snippet.publishedAt, href: `https://www.youtube.com/watch?v=${video.id}` } })), now)
  return liveGroup('YouTube', items, 'Codex 中文 · 最近 7 天 · 播放与时效热度')
}

function jsonResponse(body) {
  const ttl = body.groups.some((group) => group.status === 'live') ? CACHE_SECONDS : DEGRADED_CACHE_SECONDS
  return new Response(JSON.stringify(body), { headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'access-control-allow-origin': '*'
  } })
}

function splitEnvList(value) { return String(value || '').split(',').map((item) => item.trim()).filter(Boolean) }
function stripHtml(value) { return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }
function count(value) { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0 }
function formatRelativeTime(value, now) {
  const age = (now - (typeof value === 'number' ? value : Date.parse(value))) / 3600000
  if (age < 1) return `${Math.max(1, Math.floor(age * 60))} 分钟前`
  if (age < 24) return `${Math.floor(age)} 小时前`
  return `${Math.floor(age / 24)} 天前`
}
function formatNumber(value) {
  const number = count(value)
  if (number >= 10000) return `${(number / 10000).toFixed(1)} 万`
  return String(number)
}
