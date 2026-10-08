export const RECENT_DAYS = 7
export const DEFAULT_X_SEARCH_QUERY = 'Codex lang:zh -is:retweet -is:reply'

const historicalGroups = [
  {
    source: 'X',
    tagClass: 's-x',
    keyword: 'Codex · 历史精选',
    moreHref: '',
    items: [
      {
        title: 'Codex 公认最强的 6个 Skill',
        author: 'KyrieCheungYep',
        meta: 'X 原帖 · 历史精选',
        href: 'https://x.com/KyrieCheungYep/status/2068306688651018272'
      },
      {
        title: '让Codex APP 自动配置支持第三方API',
        author: 'wei_wang',
        meta: 'X 原帖 · 历史精选',
        href: 'https://x.com/wei_wang/status/2067443263276003667'
      },
      {
        title: '普通人平时到底都拿 Codex 干什么？',
        author: 'jianghaikuo666',
        meta: 'X 原帖 · 历史精选',
        href: 'https://x.com/jianghaikuo666/status/2066205008010567995'
      }
    ]
  },
  {
    source: 'GitHub',
    tagClass: 's-github',
    keyword: 'codex 案例',
    moreHref: 'https://github.com/search?q=openai+codex&type=repositories&s=updated&o=desc',
    items: [
      {
        title: 'xianyu110/gpt-codex：写给 Codex 小白用户的完整教程',
        author: 'xianyu110',
        meta: 'GitHub · 中文教程',
        href: 'https://github.com/xianyu110/gpt-codex'
      },
      {
        title: 'Ivesfsy/Codex：云原生 Codex CLI 快速入门指南',
        author: 'Ivesfsy',
        meta: 'GitHub · Codex CLI 教程',
        href: 'https://github.com/Ivesfsy/Codex'
      },
      {
        title: 'OpenAI Cookbook：用 Codex SDK 构建代码审查工作流',
        author: 'openai',
        meta: 'GitHub · 官方案例',
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
        author: '技术爬爬虾',
        meta: 'B站视频 · 人工精选',
        href: 'https://www.bilibili.com/video/BV1Kk9kBAEJv/'
      },
      {
        title: '全网最全！40 分钟全面掌握 Codex【附完整文档】',
        author: '秋芝2046',
        meta: 'B站视频 · 人工精选',
        href: 'https://www.bilibili.com/video/BV1Nd596vEyU/'
      },
      {
        title: 'Codex APP 保姆级使用教程，实战项目全流程讲解',
        author: 'AI随风随风',
        meta: 'B站视频 · 人工精选',
        href: 'https://www.bilibili.com/video/BV1oJAoz2Emf/'
      }
    ]
  },
  {
    source: 'Reddit',
    tagClass: 's-reddit',
    keyword: 'Codex · 历史精选',
    moreHref: 'https://www.reddit.com/r/codex/search/?q=build%20OR%20case&restrict_sr=1&sort=new',
    items: [
      {
        title: 'Reddit：你目前用 Codex 做出了什么？',
        author: 'r/codex 社区',
        meta: 'Reddit · 人工精选',
        href: 'https://www.reddit.com/r/codex/comments/1tcgyu7/what_have_you_built_so_far_using_codex/'
      },
      {
        title: 'Reddit：你用 Codex 做过最大的项目是什么？',
        author: 'r/codex 社区',
        meta: 'Reddit · 人工精选',
        href: 'https://www.reddit.com/r/codex/comments/1sx8dg4/what_is_the_biggest_thing_you_build_with_codex/'
      },
      {
        title: 'Reddit：OpenAI 将从 ChatGPT 登录方式中移除 GPT-5.2 和 GPT-5.3-Codex',
        author: 'r/codex 社区',
        meta: 'Reddit · 人工精选',
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
        title: 'Codex 新手教程：完整入门课程',
        author: 'YouTube 创作者',
        meta: 'YouTube · 人工精选',
        href: 'https://www.youtube.com/watch?v=KXIdYEdOPys'
      },
      {
        title: '一小时掌握 Codex：评论分析、Skill 和自动化',
        author: 'YouTube 创作者',
        meta: 'YouTube · 人工精选',
        href: 'https://www.youtube.com/watch?v=3TdD8Qv5Tk8'
      },
      {
        title: 'OpenAI：Codex 电脑操作功能的多任务演示',
        author: 'OpenAI',
        meta: 'YouTube · 官方演示',
        href: 'https://www.youtube.com/watch?v=D_FCYsshMI4'
      }
    ]
  }
]

export function recentSearchQuery(query = DEFAULT_X_SEARCH_QUERY, now = Date.now()) {
  const since = new Date(now - RECENT_DAYS * 86400000).toISOString().slice(0, 10)
  const until = new Date(now + 86400000).toISOString().slice(0, 10)
  // Old date operators in a custom query must not freeze the search window.
  const text = String(query).replace(/\b(?:since|until|since_time|until_time):\S+/g, '').trim()
  return `${text || DEFAULT_X_SEARCH_QUERY} since:${since} until:${until}`
}

export function getFallbackHotGroups(now = Date.now()) {
  return historicalGroups.map((group) => ({
    ...group,
    status: 'fallback',
    keyword: 'Codex · 历史精选',
    notice: '暂无可用实时热帖，以下为历史精选，未计入本周热度。',
    moreHref: group.source === 'X'
      ? `https://x.com/search?q=${encodeURIComponent(recentSearchQuery(undefined, now))}&src=typed_query&f=top`
      : group.moreHref,
    items: group.items.map((item) => ({ ...item, meta: `${item.meta.replace(/ · (人工精选|历史精选)/g, '')} · 历史精选` }))
  }))
}

export function isRecent(value, now = Date.now()) {
  const timestamp = typeof value === 'number' ? value : Date.parse(value)
  return Number.isFinite(timestamp) && timestamp <= now && timestamp >= now - RECENT_DAYS * 86400000
}

export function safeHref(value) {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export function mergeHotGroups(groups, now = Date.now()) {
  const bySource = new Map((Array.isArray(groups) ? groups : []).filter(Boolean).map((group) => [group.source, group]))
  return getFallbackHotGroups(now).map((fallback) => {
    const group = bySource.get(fallback.source)
    if (!group || group.status !== 'live' || !Array.isArray(group.items)) return fallback
    const items = group.items.filter((item) => item
      && typeof item.title === 'string' && /[\u3400-\u9fff]/.test(item.title)
      && typeof item.meta === 'string' && safeHref(item.href) && isRecent(item.publishedAt, now)
      && (item.author === undefined || typeof item.author === 'string')).slice(0, 3)
    if (!items.length) return fallback
    return { ...fallback, status: 'live', keyword: typeof group.keyword === 'string' ? group.keyword : 'Codex · 最近 7 天',
      moreHref: safeHref(group.moreHref) ? group.moreHref : fallback.moreHref, notice: '', items }
  })
}

// Bound the entire request, including JSON/body reading, and cancel its transport.
export async function fetchJsonWithTimeout(url, init = {}, timeoutMs = 3500) {
  const controller = new AbortController()
  let timer
  let onAbort
  const deadline = new Promise((_, reject) => {
    onAbort = () => {
      controller.abort()
      reject(new Error('Request timed out or cancelled'))
    }
    if (init.signal?.aborted) onAbort()
    else init.signal?.addEventListener('abort', onAbort, { once: true })
    timer = setTimeout(onAbort, timeoutMs)
  })
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { ...init, signal: controller.signal })
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return await response.json()
      })(),
      deadline
    ])
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener('abort', onAbort)
  }
}
