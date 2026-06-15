const CACHE_SECONDS = 900
const X_SEARCH_RESULT_COUNT = 50
const X_SEARCH_DAYS = 7
const DEFAULT_X_SEARCH_QUERY = 'codex lang:zh -is:retweet -is:reply'
const RECENT_DAYS = 7

const fallbackGroups = [
  {
    source: 'X',
    tagClass: 's-x',
    keyword: 'codex 案例',
    moreHref: 'https://x.com/search?q=codex%20%E6%A1%88%E4%BE%8B&src=typed_query&f=live'
  },
  {
    source: 'GitHub',
    tagClass: 's-github',
    keyword: 'codex 案例',
    moreHref: 'https://github.com/search?q=codex+%E6%A1%88%E4%BE%8B&type=repositories&s=updated&o=desc'
  },
  {
    source: 'B站',
    tagClass: 's-bilibili',
    keyword: 'codex',
    moreHref: 'https://search.bilibili.com/all?keyword=codex&from_source=web_search&spm_id_from=333.788&search_source=5&order=stow'
  },
  {
    source: 'Reddit',
    tagClass: 's-reddit',
    keyword: 'OpenAI Codex case / build',
    moreHref: 'https://www.reddit.com/r/codex/search/?q=build%20OR%20case&restrict_sr=1&sort=new'
  },
  {
    source: 'YouTube',
    tagClass: 's-youtube',
    keyword: 'codex 案例',
    moreHref: 'https://www.youtube.com/results?search_query=codex+%E6%A1%88%E4%BE%8B'
  }
]

export async function onRequestGet({ request, env }) {
  const cache = caches.default
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const groups = await buildHotGroups(env)
  const response = jsonResponse({ updatedAt: new Date().toISOString(), groups })

  await cache.put(request, response.clone())
  return response
}

async function buildHotGroups(env) {
  const groups = await Promise.all([
    buildXGroup(env),
    buildGitHubGroup(env),
    buildBilibiliGroup(),
    buildRedditGroup(),
    buildYouTubeGroup(env)
  ])

  return groups.filter(Boolean)
}

async function buildXGroup(env) {
  const token = env.X_BEARER_TOKEN
  const ids = splitEnvList(env.X_POST_IDS)
  const usePinnedIds = shouldUseXPostIds(env) && ids.length

  if (!token) {
    return null
  }

  try {
    const data = usePinnedIds
      ? await fetchXTweetsByIds(token, ids)
      : await searchXTweets(token, getXSearchQuery(env.X_SEARCH_QUERY))
    const items = mapXTweets(data)

    return items.length
      ? {
          ...fallbackGroups[0],
          keyword: usePinnedIds ? fallbackGroups[0].keyword : 'codex · 近 7 天中文',
          moreHref: usePinnedIds ? fallbackGroups[0].moreHref : buildXSearchHref(env.X_SEARCH_QUERY),
          items
        }
      : null
  } catch (error) {
    console.warn('Unable to fetch X hot posts', error?.message || error)
    return null
  }
}

async function fetchXTweetsByIds(token, ids) {
  const url = new URL('https://api.x.com/2/tweets')
  url.searchParams.set('ids', ids.slice(0, 10).join(','))
  url.searchParams.set('tweet.fields', 'author_id,created_at,public_metrics')
  url.searchParams.set('expansions', 'author_id')
  url.searchParams.set('user.fields', 'name,username')

  return fetchJson(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

async function searchXTweets(token, query) {
  const url = new URL('https://api.x.com/2/tweets/search/recent')
  url.searchParams.set('query', query)
  url.searchParams.set('max_results', String(X_SEARCH_RESULT_COUNT))
  url.searchParams.set('sort_order', 'recency')
  url.searchParams.set('start_time', getXSearchStartTime())
  url.searchParams.set('tweet.fields', 'author_id,created_at,public_metrics')
  url.searchParams.set('expansions', 'author_id')
  url.searchParams.set('user.fields', 'name,username')

  return fetchJson(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

function mapXTweets(data) {
  const users = new Map((data.includes?.users || []).map((user) => [user.id, user]))
  const now = Date.now()

  return (data.data || [])
    .slice()
    .filter((tweet) => getAgeHours(tweet.created_at, now) <= RECENT_DAYS * 24)
    .sort((a, b) => getTweetScore(b, now) - getTweetScore(a, now))
    .slice(0, 3)
    .map((tweet) => {
      const user = users.get(tweet.author_id)
      const author = user?.name || user?.username || 'X'
      const metric = getTweetPrimaryMetric(tweet)
      const timeText = formatRelativeTime(tweet.created_at, now)

      return {
        title: `${author}：${cleanTweetText(tweet.text)}`,
        author,
        meta: ['X 原帖', timeText, metric].filter(Boolean).join(' · '),
        href: `https://x.com/${user?.username || 'i'}/status/${tweet.id}`
      }
    })
}

function getTweetScore(tweet, now) {
  const metrics = tweet.public_metrics || {}
  const engagement = (metrics.impression_count || 0) * 0.08
    + (metrics.like_count || 0) * 10
    + (metrics.retweet_count || 0) * 20
    + (metrics.quote_count || 0) * 16
    + (metrics.reply_count || 0) * 6
    + (metrics.bookmark_count || 0) * 8
  const ageHours = getAgeHours(tweet.created_at, now)
  const recencyWeight = Math.max(0.25, 1 - ageHours / (24 * 7))
  const freshPostLift = Math.max(0, 48 - ageHours) * 2

  return engagement * recencyWeight + freshPostLift
}

async function buildGitHubGroup(env) {
  try {
    const url = new URL('https://api.github.com/search/repositories')
    url.searchParams.set('q', `codex pushed:>=${formatSearchDate(getRecentCutoffDate())}`)
    url.searchParams.set('sort', 'stars')
    url.searchParams.set('order', 'desc')
    url.searchParams.set('per_page', '3')
    const data = await fetchJson(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': '52codex-hot-posts',
        ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {})
      }
    })
    const items = (data.items || []).slice(0, 3).map((repo) => ({
      title: formatGitHubTitle(repo.full_name),
      author: repo.owner?.login || repo.full_name.split('/')[0],
      meta: `GitHub · ${formatNumber(repo.stargazers_count)} stars`,
      href: repo.html_url
    }))

    return items.length ? { ...fallbackGroups[1], keyword: 'codex · 最近 7 天更新', items } : null
  } catch {
    return null
  }
}

function buildBilibiliGroup() {
  return null
}

async function buildRedditGroup() {
  try {
    const url = 'https://www.reddit.com/r/codex/search.json?q=Codex%20build%20OR%20case&restrict_sr=1&sort=top&t=week&limit=6'
    const data = await fetchJson(url, {
      headers: { 'User-Agent': '52codex-hot-posts/1.0' }
    })
    const now = Date.now()
    const items = (data.data?.children || [])
      .map(({ data: post }) => post)
      .filter((post) => isRecentTimestamp(post.created_utc, now))
      .slice(0, 3)
      .map((post) => ({
        title: `Reddit：${post.title}`,
        author: post.author ? `u/${post.author}` : 'r/codex 社区',
        meta: `r/codex · ${formatRelativeTime(post.created_utc * 1000, now)} · ${formatNumber(post.ups)} upvotes · ${formatNumber(post.num_comments)} comments`,
        href: `https://www.reddit.com${post.permalink}`
      }))

    return items.length ? { ...fallbackGroups[3], keyword: 'Codex build / case · 最近 7 天', items } : null
  } catch {
    return null
  }
}

async function buildYouTubeGroup(env) {
  const apiKey = env.YOUTUBE_API_KEY

  if (!apiKey) {
    return null
  }

  try {
    const ids = splitEnvList(env.YOUTUBE_VIDEO_IDS)
    const data = ids.length
      ? await fetchYouTubeVideos(apiKey, ids)
      : await searchYouTubeVideos(apiKey, env.YOUTUBE_SEARCH_QUERY)
    const now = Date.now()
    const items = (data.items || [])
      .filter((video) => isRecentDateString(video.snippet?.publishedAt, now))
      .slice(0, 3)
      .map((video) => ({
        title: `${video.snippet.channelTitle}：${video.snippet.title}`,
        author: video.snippet.channelTitle,
        meta: `YouTube · ${formatRelativeTime(video.snippet.publishedAt, now)} · ${formatNumber(video.statistics.viewCount)} views`,
        href: `https://www.youtube.com/watch?v=${video.id}`
      }))

    return items.length ? { ...fallbackGroups[4], keyword: 'codex 案例 · 最近 7 天', items } : null
  } catch {
    return null
  }
}

async function searchYouTubeVideos(apiKey, query) {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  searchUrl.searchParams.set('part', 'id')
  searchUrl.searchParams.set('q', query || 'Codex 案例 OpenAI Codex')
  searchUrl.searchParams.set('type', 'video')
  searchUrl.searchParams.set('order', 'viewCount')
  searchUrl.searchParams.set('maxResults', '6')
  searchUrl.searchParams.set('publishedAfter', getRecentCutoffDate().toISOString())
  searchUrl.searchParams.set('key', apiKey)

  const searchData = await fetchJson(searchUrl)
  const ids = (searchData.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean)

  return fetchYouTubeVideos(apiKey, ids)
}

async function fetchYouTubeVideos(apiKey, ids) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'snippet,statistics')
  url.searchParams.set('id', ids.slice(0, 6).join(','))
  url.searchParams.set('key', apiKey)

  return fetchJson(url)
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      'access-control-allow-origin': '*'
    }
  })
}

function splitEnvList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function shouldUseXPostIds(env) {
  const mode = String(env.X_POST_SOURCE || env.X_SOURCE_MODE || '').trim().toLowerCase()
  const flag = String(env.X_USE_POST_IDS || '').trim().toLowerCase()

  return ['ids', 'fixed', 'manual', 'pinned'].includes(mode) || ['1', 'true', 'yes'].includes(flag)
}

function getXSearchQuery(value) {
  return String(value || '').trim() || DEFAULT_X_SEARCH_QUERY
}

function buildXSearchHref(query) {
  return `https://x.com/search?q=${encodeURIComponent(getXSearchQueryWithDateRange(query))}&src=typed_query&f=live`
}

function getXSearchStartTime() {
  return getRecentCutoffDate().toISOString()
}

function getXSearchQueryWithDateRange(query) {
  const now = new Date()
  const since = new Date(now.getTime() - X_SEARCH_DAYS * 24 * 60 * 60 * 1000)
  const until = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return `${getXSearchQuery(query)} since:${formatSearchDate(since)} until:${formatSearchDate(until)}`
}

function formatSearchDate(date) {
  return date.toISOString().slice(0, 10)
}

function getRecentCutoffDate() {
  return new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000)
}

function getTweetPrimaryMetric(tweet) {
  const metrics = tweet.public_metrics || {}

  if (metrics.impression_count) {
    return `${formatNumber(metrics.impression_count)} views`
  }

  if (metrics.like_count) {
    return `${formatNumber(metrics.like_count)} likes`
  }

  if (metrics.retweet_count) {
    return `${formatNumber(metrics.retweet_count)} reposts`
  }

  if (metrics.reply_count) {
    return `${formatNumber(metrics.reply_count)} replies`
  }

  return '最近热帖'
}

function formatRelativeTime(createdAt, now) {
  const ageHours = getAgeHours(createdAt, now)

  if (!Number.isFinite(ageHours)) {
    return ''
  }

  if (ageHours < 1) {
    return `${Math.max(1, Math.round(ageHours * 60))} 分钟前`
  }

  if (ageHours < 24) {
    return `${Math.floor(ageHours)} 小时前`
  }

  if (ageHours < 7 * 24) {
    return `${Math.floor(ageHours / 24)} 天前`
  }

  return ''
}

function getAgeHours(createdAt, now) {
  const timestamp = typeof createdAt === 'number' ? createdAt : Date.parse(createdAt)

  if (!Number.isFinite(timestamp)) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(0, (now - timestamp) / (60 * 60 * 1000))
}

function isRecentDateString(value, now) {
  return getAgeHours(value, now) <= RECENT_DAYS * 24
}

function isRecentTimestamp(value, now) {
  return Number.isFinite(value) && (now - value * 1000) <= RECENT_DAYS * 24 * 60 * 60 * 1000
}

function cleanTweetText(text) {
  return String(text || '')
    .replace(/\s*https:\/\/t\.co\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70)
}

function formatGitHubTitle(fullName) {
  const text = String(fullName || '').trim()

  if (text.length <= 42) {
    return text
  }

  return `${text.slice(0, 39)}...`
}

function formatNumber(value) {
  const number = Number(value || 0)

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`
  }

  return String(number)
}
