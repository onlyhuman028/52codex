import {
  RECENT_DAYS, DEFAULT_X_SEARCH_QUERY, recentSearchQuery,
  getFallbackHotGroups, mergeHotGroups, isRecent, safeHref, fetchJsonWithTimeout
} from '../../.vitepress/theme/hot-posts-data.mjs'

const CACHE_SECONDS = 900
const DEGRADED_CACHE_SECONDS = 60
const PLATFORM_TIMEOUT_MS = 6500

export async function onRequestGet({ request, env = {}, waitUntil }) {
  const cache = globalThis.caches?.default
  const cacheUrl = new URL(request.url)
  // Avoid serving the previous payload format or yesterday's search links.
  cacheUrl.searchParams.set('hot-posts-version', '2')
  cacheUrl.searchParams.set('day', new Date().toISOString().slice(0, 10))
  const cacheKey = new Request(cacheUrl)
  try {
    const cached = await cache?.match(cacheKey)
    if (cached) {
      const body = await cached.json()
      return jsonResponse({ ...body, groups: mergeHotGroups(body.groups) })
    }
  } catch { /* A cache failure should not disable the feed. */ }

  const builders = [buildXGroup, buildGitHubGroup, buildBilibiliGroup, buildRedditGroup, buildYouTubeGroup]
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

async function buildXGroup(env, signal) {
  const provider = String(env.X_PROVIDER || 'official').toLowerCase()
  let data
  if (provider === 'socialdata') {
    if (!env.SOCIALDATA_API_KEY) return null
    const url = new URL('https://api.socialdata.tools/twitter/search')
    // SocialData uses website search operators, unlike the official v2 API.
    const query = String(env.X_SEARCH_QUERY || 'Codex lang:zh -filter:retweets -filter:replies')
      .replace(/-is:retweet\b/g, '-filter:retweets').replace(/-is:reply\b/g, '-filter:replies')
    url.searchParams.set('query', recentSearchQuery(query))
    url.searchParams.set('type', 'Top')
    const result = await fetchJsonWithTimeout(url, { signal, headers: {
      Authorization: `Bearer ${env.SOCIALDATA_API_KEY}`, Accept: 'application/json'
    } })
    data = {
      data: (result.tweets || []).map((tweet) => ({
        id: tweet.id_str, text: tweet.full_text || tweet.text, created_at: tweet.tweet_created_at,
        author_id: tweet.user?.id_str,
        referenced_tweets: tweet.retweeted_status ? [{ type: 'retweeted' }] : [],
        in_reply_to_user_id: tweet.in_reply_to_user_id_str,
        public_metrics: { like_count: tweet.favorite_count, retweet_count: tweet.retweet_count,
          reply_count: tweet.reply_count, quote_count: tweet.quote_count, bookmark_count: tweet.bookmark_count,
          impression_count: tweet.views_count }
      })),
      includes: { users: (result.tweets || []).map((tweet) => ({
        id: tweet.user?.id_str, name: tweet.user?.name, username: tweet.user?.screen_name
      })) }
    }
  } else if (provider === 'official') {
    const token = env.X_BEARER_TOKEN
    if (!token) return null
    const mode = String(env.X_POST_SOURCE || env.X_SOURCE_MODE || '').toLowerCase()
    const useIds = ['ids', 'fixed', 'manual', 'pinned'].includes(mode) || ['1', 'true', 'yes'].includes(String(env.X_USE_POST_IDS || '').toLowerCase())
    const url = new URL(useIds ? 'https://api.x.com/2/tweets' : 'https://api.x.com/2/tweets/search/recent')
    if (useIds) {
      const ids = splitEnvList(env.X_POST_IDS)
      if (!ids.length) return null
      url.searchParams.set('ids', ids.slice(0, 10).join(','))
    } else {
      // Remove fixed dates; start_time below owns the rolling seven-day window.
      url.searchParams.set('query', String(env.X_SEARCH_QUERY || DEFAULT_X_SEARCH_QUERY).replace(/\b(?:since|until|since_time|until_time):\S+/g, '').trim() || DEFAULT_X_SEARCH_QUERY)
      url.searchParams.set('max_results', '50')
      url.searchParams.set('sort_order', 'relevancy')
      url.searchParams.set('start_time', new Date(Date.now() - RECENT_DAYS * 86400000 + 1000).toISOString())
    }
    url.searchParams.set('post.fields', 'created_at,public_metrics,note_post')
    url.searchParams.set('expansions', 'author_id,in_reply_to_user_id,referenced_posts')
    url.searchParams.set('user.fields', 'name,username')
    data = await fetchJsonWithTimeout(url, { signal, headers: { Authorization: `Bearer ${token}` } })
  } else return null

  const now = Date.now()
  const users = new Map((data.includes?.users || []).map((user) => [user.id, user]))
  const items = (data.data || [])
    .filter((tweet) => tweet.id && isRecent(tweet.created_at, now) && chineseCodex(cleanTweetText(tweet.note_post?.text || tweet.text))
      && !tweet.in_reply_to_user_id && !(tweet.referenced_posts || tweet.referenced_tweets || []).some((ref) => ['retweeted', 'reposted'].includes(ref.type))
      && tweetEngagement(tweet) > 0)
    .sort((a, b) => decayedScore(tweetEngagement(b), b.created_at, now) - decayedScore(tweetEngagement(a), a.created_at, now))
    .slice(0, 3)
    .map((tweet) => {
      const user = users.get(tweet.author_id)
      const author = user?.name || user?.username || 'X 作者'
      const metrics = tweet.public_metrics || {}
      const primary = count(metrics.impression_count) > 0 ? `${formatNumber(metrics.impression_count)} 浏览`
        : count(metrics.like_count) > 0 ? `${formatNumber(metrics.like_count)} 赞`
        : `${formatNumber(count(metrics.retweet_count ?? metrics.repost_count) + count(metrics.reply_count) + count(metrics.quote_count) + count(metrics.bookmark_count))} 次互动`
      return { title: cleanTweetText(tweet.note_post?.text || tweet.text).slice(0, 90), author,
        meta: `X 原帖 · ${formatRelativeTime(tweet.created_at, now)} · ${primary}`,
        publishedAt: tweet.created_at, href: `https://x.com/${user?.username || 'i'}/status/${tweet.id}` }
    })
  return liveGroup('X', items, 'Codex 中文 · 最近 7 天 · 互动热度')
}

function tweetEngagement(tweet) {
  const m = tweet.public_metrics || {}
  return count(m.impression_count) * 0.08 + count(m.like_count) * 10
    + count(m.retweet_count ?? m.repost_count) * 20 + count(m.quote_count) * 16
    + count(m.reply_count) * 6 + count(m.bookmark_count) * 8
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
  const items = (data.items || [])
    .filter((repo) => isRecent(repo.pushed_at, now) && chineseCodex(`${repo.full_name} ${repo.description || ''}`)
      && count(repo.stargazers_count) > 0 && safeHref(repo.html_url))
    .sort((a, b) => count(b.stargazers_count) - count(a.stargazers_count))
    .slice(0, 3)
    .map((repo) => ({ title: `${repo.full_name}：${stripHtml(repo.description).slice(0, 90)}`,
      author: repo.owner?.login || repo.full_name.split('/')[0],
      meta: `GitHub · ${formatRelativeTime(repo.pushed_at, now)}更新 · ${formatNumber(repo.stargazers_count)} 收藏（累计）`,
      publishedAt: repo.pushed_at, href: repo.html_url }))
  const group = liveGroup('GitHub', items, 'Codex 中文项目 · 最近 7 天更新 · 累计收藏')
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
  const items = (data.data?.result || [])
    .filter((video) => isRecent(count(video.pubdate) * 1000, now) && chineseCodex(stripHtml(video.title))
      && count(video.play) > 0 && (video.bvid || safeHref(video.arcurl)))
    .sort((a, b) => count(b.play) - count(a.play))
    .slice(0, 3)
    .map((video) => ({ title: stripHtml(video.title), author: video.author || 'B站创作者',
      meta: `B站视频 · ${formatRelativeTime(count(video.pubdate) * 1000, now)} · ${formatNumber(video.play)} 播放`,
      publishedAt: new Date(count(video.pubdate) * 1000).toISOString(),
      href: video.bvid ? `https://www.bilibili.com/video/${video.bvid}/` : video.arcurl }))
  const group = liveGroup('B站', items, 'Codex 中文 · 最近 7 天 · 播放热度')
  if (group) group.moreHref = 'https://search.bilibili.com/all?keyword=codex&order=click&pubtime=7'
  return group
}

async function buildRedditGroup(_env, signal) {
  const url = 'https://www.reddit.com/r/codex/search.json?q=Codex&restrict_sr=1&sort=top&t=week&limit=50'
  const data = await fetchJsonWithTimeout(url, { signal, headers: { 'User-Agent': '52codex-hot-posts/1.0' } })
  const now = Date.now()
  const items = (data.data?.children || []).map(({ data }) => data)
    .filter((post) => post && isRecent(count(post.created_utc) * 1000, now) && chineseCodex(post.title)
      && !post.over_18 && !post.stickied && count(post.score) > 0 && typeof post.permalink === 'string' && post.permalink.startsWith('/r/'))
    .sort((a, b) => count(b.score) - count(a.score))
    .slice(0, 3)
    .map((post) => ({ title: post.title, author: post.author ? `u/${post.author}` : 'r/codex 社区',
      meta: `r/codex · ${formatRelativeTime(count(post.created_utc) * 1000, now)} · ${formatNumber(post.score)} 净赞 · ${formatNumber(post.num_comments)} 评论`,
      publishedAt: new Date(count(post.created_utc) * 1000).toISOString(), href: `https://www.reddit.com${post.permalink}` }))
  const group = liveGroup('Reddit', items, 'Codex 中文 · 最近 7 天 · 净赞热度')
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
  const items = (data.items || [])
    .filter((video) => video.id && isRecent(video.snippet?.publishedAt, now) && chineseCodex(video.snippet?.title)
      && count(video.statistics?.viewCount) > 0)
    .sort((a, b) => count(b.statistics.viewCount) - count(a.statistics.viewCount))
    .slice(0, 3)
    .map((video) => ({ title: video.snippet.title, author: video.snippet.channelTitle || 'YouTube 创作者',
      meta: `YouTube · ${formatRelativeTime(video.snippet.publishedAt, now)} · ${formatNumber(video.statistics.viewCount)} 播放`,
      publishedAt: video.snippet.publishedAt, href: `https://www.youtube.com/watch?v=${video.id}` }))
  return liveGroup('YouTube', items, 'Codex 中文 · 最近 7 天 · 播放热度')
}

function jsonResponse(body) {
  const ttl = body.groups.every((group) => group.status === 'fallback') ? DEGRADED_CACHE_SECONDS : CACHE_SECONDS
  return new Response(JSON.stringify(body), { headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'access-control-allow-origin': '*'
  } })
}

function splitEnvList(value) { return String(value || '').split(',').map((item) => item.trim()).filter(Boolean) }
function stripHtml(value) { return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }
function cleanTweetText(value) { return String(value || '').replace(/\s*https:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim() }
function chineseCodex(text) { return /codex/i.test(String(text || '')) && /[\u3400-\u9fff]/.test(String(text || '')) }
function count(value) { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0 }
function decayedScore(engagement, createdAt, now) { return engagement / (1 + (now - Date.parse(createdAt)) / 86400000) }
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
