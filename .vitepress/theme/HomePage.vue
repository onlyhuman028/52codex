<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-inner">
        <span class="hero-badge fade-up">从编程神器到全能助手</span>
        <h1 class="fade-up fade-up-d1">大家在用 Codex<br>做什么<span class="hero-accent">好玩的</span>？</h1>
        <p class="fade-up fade-up-d2">技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。</p>
        <div class="hero-actions fade-up fade-up-d3">
          <a href="/cases/" class="btn btn-primary">查看案例</a>
          <a href="/guide/" class="btn btn-secondary">开始学习</a>
        </div>
      </div>
    </section>

    <section id="hot-posts" class="section section-soft">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2 class="section-title">网络热帖</h2>
            <p class="section-desc">优先抓取最近 7 天内的 Codex 讨论，缺少实时数据时保留可直接打开的具体原文</p>
          </div>
          <span class="section-hint">点击直接跳转原文</span>
        </div>
        <div v-if="hotGroups.length" class="hot-list">
          <div v-for="group in hotGroups" :key="group.source" class="hot-platform">
            <div class="hot-platform-header">
              <div class="hot-platform-meta">
                <span :class="['source-tag', group.tagClass]">{{ group.source }}</span>
                <span class="hot-keyword">搜索词：{{ group.keyword }}</span>
              </div>
              <a :href="group.moreHref" target="_blank" class="hot-more" rel="noreferrer">更多案例</a>
            </div>
            <div class="hot-row">
              <a v-for="item in group.items" :key="item.href" :href="item.href" target="_blank" class="hot-item" rel="noreferrer">
                <div class="hot-item-main">
                  <div class="hot-title">{{ item.title }}</div>
                  <div v-if="item.author" class="hot-author">作者：{{ item.author }}</div>
                </div>
                <div class="hot-item-footer">
                  <span class="hot-time">{{ item.meta }}</span>
                  <span class="hot-open">原文</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div v-else class="hot-empty">最近 7 天暂时没有抓到可确认的 Codex 热帖。</div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2 class="section-title">精选案例</h2>
            <p class="section-desc">本站原创拆解，完整工作流 + Prompt + 踩坑记录</p>
          </div>
          <a href="/cases/" class="section-link">查看全部</a>
        </div>
        <div class="case-filters">
          <span class="filter-tag active">全部</span>
          <span class="filter-tag">做网站</span>
          <span class="filter-tag">自动化</span>
          <span class="filter-tag">建系统</span>
          <span class="filter-tag">内容创作</span>
          <span class="filter-tag">数据处理</span>
          <span class="filter-tag">环境搭建</span>
        </div>
        <div class="card-grid">
          <a href="/cases/02-snake-game" class="card">
            <div class="card-cover">
              <img src="/cases/assets/11-snake-game/final-game-with-image.png" alt="写一个武侠版贪吃蛇案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv1">Lv.1</span><span class="tag-pill">小游戏</span></div>
              <h3>写一个武侠版贪吃蛇</h3>
              <p>从新建项目、输入需求、审核实施，到运行测试和继续优化。</p>
            </div>
          </a>
          <a href="/cases/06-auto-collect-posts" class="card">
            <div class="card-cover">
              <img src="/cases/assets/06-auto-collect-posts/cover.svg" alt="自动搜集公众号热帖案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv2">Lv.2</span><span class="tag-pill">自动化</span></div>
              <h3>自动搜集公众号热帖</h3>
              <p>用 Computer Use 控制微信搜一搜，定时抓取关键词热帖。</p>
            </div>
          </a>
          <a href="/cases/05-install-openclaw" class="card">
            <div class="card-cover">
              <img src="/cases/assets/05-install-openclaw/cover.svg" alt="用 Computer Use 安装龙虾案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv2">Lv.2</span><span class="tag-pill">环境搭建</span></div>
              <h3>用 Computer Use 安装龙虾</h3>
              <p>让 Codex 自动安装 OpenClaw、配置 API Key、启动 Web UI。</p>
            </div>
          </a>
          <a href="/cases/09-goal-mode-project" class="card">
            <div class="card-cover">
              <img src="/cases/assets/09-goal-mode-project/cover.svg" alt="目标模式开发软件项目案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv3">Lv.3</span><span class="tag-pill">建系统</span></div>
              <h3>目标/Goal 模式开发软件项目</h3>
              <p>用 Goal 模式拆解并推进软件项目，学习从设计规范到持续开发的完整流程。</p>
            </div>
          </a>
          <a href="/cases/04-skill-ppt" class="card">
            <div class="card-cover">
              <img src="/cases/assets/04-skill-ppt/cover.svg" alt="调用 Skill 写 PPT 案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv1">Lv.1</span><span class="tag-pill">内容创作</span></div>
              <h3>调用 Skill 写 PPT</h3>
              <p>用 Codex 调用 Skill 完成 PPT 生成任务，理解素材准备、结构输出和文件交付流程。</p>
            </div>
          </a>
          <a href="/cases/10-weekly-plan-system" class="card">
            <div class="card-cover">
              <img src="/cases/assets/10-weekly-plan-system/cover.svg" alt="编写周计划管理系统案例封面">
            </div>
            <div class="card-body">
              <div class="card-tags"><span class="lv lv3">Lv.3</span><span class="tag-pill">建系统</span></div>
              <h3>编写一个周计划管理系统</h3>
              <p>把日常计划、任务安排和每周复盘做成可持续维护的小工具。</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="section-inner">
        <h2 class="section-title">上手指南</h2>
        <p class="section-desc">面向完全不会 Codex 的用户，告诉你从哪里开始</p>
        <div class="guide-grid">
          <a v-for="page in featuredGuidePages" :key="page.link" :href="page.link" class="guide-card">
            <div class="guide-num">{{ String(page.order).padStart(2, '0') }}</div>
            <h3>{{ page.text }}</h3>
            <p>{{ page.description || '这篇内容正在整理中，先占位到学习路线里。' }}</p>
          </a>
        </div>
        <div class="guide-more">
          <a href="/guide/" class="section-link">查看完整学习路线</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2 class="section-title">实用技巧</h2>
            <p class="section-desc">真实使用经验，解决你用 Codex 最常遇到的问题</p>
          </div>
          <a href="/tips/01-index" class="section-link">查看全部</a>
        </div>
        <div class="tip-grid tip-grid-featured">
          <a href="/tips/02-make-codex-better" class="tip-card tip-card-featured">
            <div class="tip-meta">
              <span>用法技巧</span>
              <span>入门必看</span>
            </div>
            <h3>怎么让 Codex 越用越顺手</h3>
            <p>记忆管理、偏好设置、项目规范，让 Codex 越来越懂你的习惯。</p>
            <span class="tip-action">开始优化</span>
          </a>
          <a href="/tips/03-codex-third-party-api" class="tip-card">
            <div class="tip-meta">
              <span>扩展配置</span>
              <span>进阶</span>
            </div>
            <h3>Codex 怎么接入第三方 API</h3>
            <p>用 Codex++ 接入国产模型、中转站 GPT 或 Claude，保留图形化设置。</p>
          </a>
          <a href="/tips/04-agents-md" class="tip-card">
            <div class="tip-meta">
              <span>项目规范</span>
              <span>模板</span>
            </div>
            <h3>AGENTS.md 怎么写</h3>
            <p>从实战模板出发，手把手教你写好项目规范文档。</p>
          </a>
          <a href="/tips/05-goals" class="tip-card">
            <div class="tip-meta">
              <span>项目管理</span>
              <span>长任务</span>
            </div>
            <h3>/goal 长任务怎么拆</h3>
            <p>迁移、重构、修测试这类长任务，要写清目标、检查点和停止条件。</p>
          </a>
          <a href="/tips/08-prevent-bad-edits" class="tip-card">
            <div class="tip-meta">
              <span>避坑</span>
              <span>安全边界</span>
            </div>
            <h3>怎么防止 Codex 乱改代码</h3>
            <p>用 AGENTS.md 划定行为边界，让 Codex 只改该改的地方。</p>
          </a>
          <a href="/tips/09-self-evolution" class="tip-card">
            <div class="tip-meta">
              <span>工作流</span>
              <span>复用</span>
            </div>
            <h3>怎么让 Codex 自我进化</h3>
            <p>让 Codex 自己总结经验、优化 Prompt、建立可复用的工作流。</p>
          </a>
          <a href="/tips/06-save-quota" class="tip-card">
            <div class="tip-meta">
              <span>额度策略</span>
              <span>省钱</span>
            </div>
            <h3>额度怎么省</h3>
            <p>少浪费上下文和无效交互，用 Prompt、模型选择和检查点控制消耗。</p>
          </a>
          <a href="/tips/07-chatgpt-codex-phone-verification" class="tip-card">
            <div class="tip-meta">
              <span>账号安全</span>
              <span>登录验证</span>
            </div>
            <h3>手机号二次验证怎么办</h3>
            <p>用高级账号安全和通行密钥减少短信依赖，先讲清恢复密钥风险。</p>
          </a>
          <a href="/tips/08-sms-verification-platforms" class="tip-card">
            <div class="tip-meta">
              <span>账号验证</span>
              <span>手机号</span>
            </div>
            <h3>接码平台和实体卡一览</h3>
            <p>临时接码适合一次验证，长期账号更建议准备可复用实体 SIM 卡。</p>
          </a>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2 class="section-title">插件与技能</h2>
            <p class="section-desc">扩展 Codex 能力边界，Skill、插件、Agent 工具、自动化</p>
          </div>
          <a href="/plugins/" class="section-link">查看全部</a>
        </div>
        <div class="tip-grid">
          <a href="/plugins/computer-use" class="tip-card">
            <div class="plugin-icon">CU</div>
            <h3>Computer Use</h3>
            <p class="plugin-sub">桌面控制 · 官方插件 <span class="plugin-stars">★★★★★</span></p>
            <p>控制 Mac 应用、点击、输入、截图，让 Codex 像人一样操作你的电脑。</p>
          </a>
          <a href="/plugins/playwright" class="tip-card">
            <div class="plugin-icon">PW</div>
            <h3>Playwright MCP</h3>
            <p class="plugin-sub">浏览器自动化 · 社区插件 <span class="plugin-stars">★★★★☆</span></p>
            <p>网页自动化、数据抓取、表单填写，精准的浏览器控制。</p>
          </a>
          <a href="/plugins/automations" class="tip-card">
            <div class="plugin-icon">AT</div>
            <h3>Automations</h3>
            <p class="plugin-sub">定时任务 · 官方功能 <span class="plugin-stars">★★★★★</span></p>
            <p>设定 Cron 定时任务，让 Codex 每天自动执行工作流。</p>
          </a>
          <a href="/plugins/custom-skill" class="tip-card">
            <div class="plugin-icon">SK</div>
            <h3>自定义 Skill</h3>
            <p class="plugin-sub">能力扩展 · 自建 <span class="plugin-stars">★★★★★</span></p>
            <p>把重复操作封装成可复用的 Skill，一次配置永久调用。</p>
          </a>
        </div>
      </div>
    </section>

    <section id="faq" class="section">
      <div class="faq-section">
        <h2 class="section-title">常见问题</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Codex 是什么？</summary>
            <div class="faq-body">Codex 是 OpenAI 推出的 AI 编程助手，2025 年 10 月上线。它可以根据自然语言指令编写代码、操作电脑、执行自动化任务。你不需要会编程，只需要能清楚描述你要做什么。</div>
          </details>
          <details class="faq-item">
            <summary>不会编程能不能用？</summary>
            <div class="faq-body">完全可以。Codex 的核心理念就是 Vibe Coding，你用自然语言描述需求，Codex 帮你写代码。你需要的是说清楚你要什么的能力，不是编程能力。本站大量案例都来自不会编程的业务人员。</div>
          </details>
          <details class="faq-item">
            <summary>Codex 和 ChatGPT 有什么区别？</summary>
            <div class="faq-body">ChatGPT 是对话聊天工具，Codex 是项目级编程助手。Codex 按项目管理代码，有文件系统访问权限，可以直接操作你的电脑，支持插件和自动化任务。简单说：ChatGPT 帮你回答问题，Codex 帮你做事情。</div>
          </details>
          <details class="faq-item">
            <summary>为什么 Codex 会改错代码？</summary>
            <div class="faq-body">通常是因为缺少项目上下文。Codex 不知道你的项目规则和边界，就会按自己的理解改。解决方案是写好 AGENTS.md，告诉它哪些能改、哪些不能改。本站实用技巧板块有详细教程。</div>
          </details>
          <details class="faq-item">
            <summary>如何正确使用 Codex？</summary>
            <div class="faq-body">从上手指南开始，跟着学习路线走。核心原则：先想清楚你要什么，再用自然语言精确描述，最后用 AGENTS.md 和 /goal 管理大项目。别急着做大系统，从一个小网页开始。</div>
          </details>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="nav-logo"><span>我爱</span><span>CodeX</span></div>
          <p>技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。</p>
          <p class="disclaimer">52codex.site 是独立第三方站点，非 OpenAI 官方产品。</p>
          <p class="disclaimer copyright">© 2026 我爱CodeX</p>
          <a class="footer-hidden-link" href="/resources/comment-admin" aria-label="留言管理">.</a>
        </div>
        <div>
          <h4>资源</h4>
          <div class="footer-links">
            <a href="https://openai.com/codex" target="_blank" rel="noreferrer">Codex 官网</a>
            <a href="https://platform.openai.com/docs" target="_blank" rel="noreferrer">Codex 官方文档</a>
            <a href="https://codexguide.ai" target="_blank" rel="noreferrer">CodexGuide（苍何）</a>
            <a href="https://github.com/VoltAgent/awesome-design-md" target="_blank" rel="noreferrer">awesome-design-md</a>
            <a href="https://www.91openclaw.site" target="_blank" rel="noreferrer">OpenClaw 中文站</a>
          </div>
        </div>
        <div>
          <h4>社区</h4>
          <div class="footer-links">
            <a href="/resources/wechat#wechat">公众号</a>
            <a href="/resources/wechat#wechat-group">微信交流群</a>
            <a href="#" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:hello@52codex.site">联系邮箱</a>
            <a href="#">投稿</a>
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { guidePages } from './navPages'

const featuredGuidePages = guidePages.slice(0, 4)

const fallbackHotGroups = [
  {
    source: 'X',
    tagClass: 's-x',
    keyword: 'codex 案例',
    moreHref: 'https://x.com/search?q=codex%20%E6%A1%88%E4%BE%8B&src=typed_query&f=live',
    items: [
      {
        title: 'Arlan：把整个 Web 变成文件系统，让 Codex 直接读取文档',
        author: 'Arlan',
        meta: 'X 原帖 · 人工精选',
        href: 'https://x.com/arlanr/status/2041215978957389908'
      },
      {
        title: 'GitHub：GPT-5.2-Codex 已在 GitHub Copilot 中推出',
        author: 'GitHub',
        meta: 'X 原帖 · 人工精选',
        href: 'https://x.com/github/status/2011501527991546066'
      },
      {
        title: 'Vaibhav：介绍 Claude Code 工作流里的 Codex Plugin',
        author: 'Vaibhav',
        meta: 'X 原帖 · 人工精选',
        href: 'https://x.com/reach_vb/status/2039251986357338257'
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
    keyword: 'OpenAI Codex case / build',
    moreHref: 'https://www.reddit.com/r/codex/search/?q=build%20OR%20case&restrict_sr=1&sort=new',
    items: [
      {
        title: 'Reddit：What have you built so far using Codex?',
        author: 'r/codex 社区',
        meta: 'Reddit · 人工精选',
        href: 'https://www.reddit.com/r/codex/comments/1tcgyu7/what_have_you_built_so_far_using_codex/'
      },
      {
        title: 'Reddit：What is the biggest thing you build with Codex?',
        author: 'r/codex 社区',
        meta: 'Reddit · 人工精选',
        href: 'https://www.reddit.com/r/codex/comments/1sx8dg4/what_is_the_biggest_thing_you_build_with_codex/'
      },
      {
        title: 'Reddit：OpenAI is removing GPT-5.2 and GPT-5.3-Codex from ChatGPT login',
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
        title: 'Codex Tutorial for Beginners：完整入门课程',
        author: 'YouTube 创作者',
        meta: 'YouTube · 人工精选',
        href: 'https://www.youtube.com/watch?v=KXIdYEdOPys'
      },
      {
        title: 'Master Codex in One Hour：用 Codex 做评论分析、Skill 和自动化',
        author: 'YouTube 创作者',
        meta: 'YouTube · 人工精选',
        href: 'https://www.youtube.com/watch?v=3TdD8Qv5Tk8'
      },
      {
        title: 'OpenAI：Computer use in Codex 多任务电脑操作演示',
        author: 'OpenAI',
        meta: 'YouTube · 官方演示',
        href: 'https://www.youtube.com/watch?v=D_FCYsshMI4'
      }
    ]
  }
]

const hotGroups = ref(fallbackHotGroups)

onMounted(async () => {
  try {
    const response = await fetch('/api/hot-posts')

    if (!response.ok) {
      return
    }

    const data = await response.json()

    if (isValidHotGroups(data.groups)) {
      hotGroups.value = mergeHotGroups(data.groups)
    }
  } catch {
    hotGroups.value = fallbackHotGroups
  }
})

function isValidHotGroups(groups) {
  return Array.isArray(groups) && groups.every((group) => {
    return group
      && typeof group.source === 'string'
      && typeof group.tagClass === 'string'
      && typeof group.keyword === 'string'
      && typeof group.moreHref === 'string'
      && Array.isArray(group.items)
      && group.items.length > 0
      && group.items.every((item) => {
        return item
          && typeof item.title === 'string'
          && typeof item.meta === 'string'
          && typeof item.href === 'string'
          && (item.author === undefined || typeof item.author === 'string')
      })
  })
}

function mergeHotGroups(groups) {
  const bySource = new Map(groups.map((group) => [group.source, group]))

  return fallbackHotGroups.map((group) => bySource.get(group.source) || group)
}
</script>
