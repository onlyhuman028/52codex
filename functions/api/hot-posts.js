const CACHE_SECONDS = 1800

const fallbackGroups = [
  {
    source: 'X',
    tagClass: 's-x',
    keyword: 'codex 案例',
    moreHref: 'https://x.com/search?q=codex%20%E6%A1%88%E4%BE%8B&src=typed_query&f=live',
    items: [
      {
        title: 'Arlan：把整个 Web 变成文件系统，让 Codex 直接读取文档',
        meta: 'X 原帖 · 185.4K views',
        href: 'https://x.com/arlanr/status/2041215978957389908'
      },
      {
        title: 'GitHub：GPT-5.2-Codex 已在 GitHub Copilot 中推出',
        meta: 'X 原帖 · 174.4K views',
        href: 'https://x.com/github/status/2011501527991546066'
      },
      {
        title: 'Vaibhav：介绍 Claude Code 工作流里的 Codex Plugin',
        meta: 'X 原帖 · 44.6K views',
        href: 'https://x.com/reach_vb/status/2039251986357338257'
      }
    ]
  },
  {
    source: 'GitHub',
    tagClass: 's-github',
    keyword: 'codex 案例',
    moreHref: 'https://github.com/search?q=codex+%E6%A1%88%E4%BE%8B&type=repositories&s=updated&o=desc',
    items: [
      {
        title: 'xianyu110/gpt-codex：写给 Codex 小白用户的完整教程',
        meta: '中文教程 · OpenAI Codex',
        href: 'https://github.com/xianyu110/gpt-codex'
      },
      {
        title: 'Ivesfsy/Codex：云原生 Codex CLI 快速入门指南',
        meta: '安装配置 · Codex CLI 教程',
        href: 'https://github.com/Ivesfsy/Codex'
      },
      {
        title: 'OpenAI Cookbook：用 Codex SDK 构建代码审查工作流',
        meta: '官方案例 · Codex SDK',
        href: 'https://github.com/openai/openai-cookbook/blob/main/examples/codex/build_code_review_with_codex_sdk.md'
      }
    ]
  },
  {
    source: 'B站',
    tagClass: 's-bilibili',
    keyword: 'codex',
    moreHref: 'https://search.bilibili.com/all?keyword=codex&from_source=web_search&spm_id_from=333.788&search_source=5&order=stow',
    items: [
      {
        title: 'Codex (APP) 保姆级全攻略，海量实战教程，一期精通 Codex',
        meta: '2026-04-28 · 75.6 万播放',
        href: 'https://www.bilibili.com/video/BV1Kk9kBAEJv/'
      },
      {
        title: '全网最全！40 分钟全面掌握 Codex【附完整文档】',
        meta: '2026-05-16 · 46.6 万播放',
        href: 'https://www.bilibili.com/video/BV1Nd596vEyU/'
      },
      {
        title: 'Codex APP 保姆级使用教程，实战项目全流程讲解',
        meta: '2026-03-03 · 20.2 万播放',
        href: 'https://www.bilibili.com/video/BV1oJAoz2Emf/'
      }
    ]
  },
  {
    source: 'Reddit',
    tagClass: 's-reddit',
    keyword: 'OpenAI Codex case / build',
    moreHref: 'https://www.reddit.com/r/codex/search/?q=build%20OR%20case&restrict_sr=1&sort=new',
    items: [
      {
        title: '你目前用 Codex 做出了哪些东西？',
        meta: 'r/codex · 2 周前 · 原题已翻译',
        href: 'https://www.reddit.com/r/codex/comments/1tcgyu7/what_have_you_built_so_far_using_codex/'
      },
      {
        title: '你用 Codex 做过最大、最复杂的项目是什么？',
        meta: 'r/codex · 上月 · 原题已翻译',
        href: 'https://www.reddit.com/r/codex/comments/1sx8dg4/what_is_the_biggest_thing_you_build_with_codex/'
      },
      {
        title: '社区热议：ChatGPT 登录的 Codex 可能移除 GPT-5.2 和 GPT-5.3-Codex',
        meta: 'r/codex · 社区热议 · 原题已翻译',
        href: 'https://www.reddit.com/r/codex/comments/1tp8ujz/openai_is_removing_gpt52_and_gpt53codex_from/'
      }
    ]
  },
  {
    source: 'YouTube',
    tagClass: 's-youtube',
    keyword: 'codex 案例',
    moreHref: 'https://www.youtube.com/results?search_query=codex+%E6%A1%88%E4%BE%8B',
    items: [
      {
        title: 'Codex Tutorial for Beginners：完整入门课程',
        meta: 'YouTube · 完整教程',
        href: 'https://www.youtube.com/watch?v=KXIdYEdOPys'
      },
      {
        title: 'Master Codex in One Hour：用 Codex 做评论分析、Skill 和自动化',
        meta: 'YouTube · 实战工作流',
        href: 'https://www.youtube.com/watch?v=3TdD8Qv5Tk8'
      },
      {
        title: 'Computer use in Codex：多任务电脑操作演示',
        meta: 'YouTube · 官方能力演示',
        href: 'https://www.youtube.com/watch?v=D_FCYsshMI4'
      }
    ]
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

  return groups.map((group, index) => group || fallbackGroups[index])
}

async function buildXGroup(env) {
  const token = env.X_BEARER_TOKEN
  const ids = splitEnvList(env.X_POST_IDS)

  if (!token) {
    return fallbackGroups[0]
  }

  try {
    const data = ids.length
      ? await fetchXTweetsByIds(token, ids)
      : await searchXTweets(token, env.X_SEARCH_QUERY)
    const items = mapXTweets(data)

    return items.length ? { ...fallbackGroups[0], items } : fallbackGroups[0]
  } catch {
    return fallbackGroups[0]
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
  url.searchParams.set('query', query || '(Codex OR "OpenAI Codex") -is:retweet')
  url.searchParams.set('max_results', '20')
  url.searchParams.set('tweet.fields', 'author_id,created_at,public_metrics')
  url.searchParams.set('expansions', 'author_id')
  url.searchParams.set('user.fields', 'name,username')

  return fetchJson(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

function mapXTweets(data) {
  const users = new Map((data.includes?.users || []).map((user) => [user.id, user]))

  return (data.data || [])
    .slice()
    .sort((a, b) => getTweetScore(b) - getTweetScore(a))
    .slice(0, 3)
    .map((tweet) => {
      const user = users.get(tweet.author_id)
      const author = user?.name || user?.username || 'X'
      const metric = tweet.public_metrics?.impression_count || tweet.public_metrics?.like_count
      const suffix = tweet.public_metrics?.impression_count ? 'views' : 'likes'

      return {
        title: `${author}：${cleanTweetText(tweet.text)}`,
        meta: `X 原帖 · ${formatNumber(metric)} ${suffix}`,
        href: `https://x.com/${user?.username || 'i'}/status/${tweet.id}`
      }
    })
}

function getTweetScore(tweet) {
  const metrics = tweet.public_metrics || {}

  return metrics.impression_count || (metrics.like_count || 0) * 10 + (metrics.retweet_count || 0) * 20
}

async function buildGitHubGroup(env) {
  try {
    const url = new URL('https://api.github.com/search/repositories')
    url.searchParams.set('q', 'codex tutorial OR codex guide')
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
      meta: `GitHub · ${formatNumber(repo.stargazers_count)} stars`,
      href: repo.html_url
    }))

    return items.length ? { ...fallbackGroups[1], items } : fallbackGroups[1]
  } catch {
    return fallbackGroups[1]
  }
}

function buildBilibiliGroup() {
  return fallbackGroups[2]
}

async function buildRedditGroup() {
  try {
    const url = 'https://www.reddit.com/r/codex/search.json?q=Codex%20build%20OR%20case&restrict_sr=1&sort=top&t=month&limit=3'
    const data = await fetchJson(url, {
      headers: { 'User-Agent': '52codex-hot-posts/1.0' }
    })
    const items = (data.data?.children || []).map(({ data: post }) => ({
      title: `Reddit：${post.title}`,
      meta: `r/codex · ${formatNumber(post.ups)} upvotes · ${formatNumber(post.num_comments)} comments`,
      href: `https://www.reddit.com${post.permalink}`
    }))

    return items.length ? { ...fallbackGroups[3], items } : fallbackGroups[3]
  } catch {
    return fallbackGroups[3]
  }
}

async function buildYouTubeGroup(env) {
  const apiKey = env.YOUTUBE_API_KEY

  if (!apiKey) {
    return fallbackGroups[4]
  }

  try {
    const ids = splitEnvList(env.YOUTUBE_VIDEO_IDS)
    const data = ids.length
      ? await fetchYouTubeVideos(apiKey, ids)
      : await searchYouTubeVideos(apiKey, env.YOUTUBE_SEARCH_QUERY)
    const items = (data.items || []).slice(0, 3).map((video) => ({
      title: `${video.snippet.channelTitle}：${video.snippet.title}`,
      meta: `YouTube · ${formatNumber(video.statistics.viewCount)} views`,
      href: `https://www.youtube.com/watch?v=${video.id}`
    }))

    return items.length ? { ...fallbackGroups[4], items } : fallbackGroups[4]
  } catch {
    return fallbackGroups[4]
  }
}

async function searchYouTubeVideos(apiKey, query) {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  searchUrl.searchParams.set('part', 'id')
  searchUrl.searchParams.set('q', query || 'Codex 案例 OpenAI Codex')
  searchUrl.searchParams.set('type', 'video')
  searchUrl.searchParams.set('order', 'viewCount')
  searchUrl.searchParams.set('maxResults', '6')
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
