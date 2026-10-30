<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-inner">
        <span class="hero-badge fade-up">从编程神器到全能助手</span>
        <h1 class="fade-up fade-up-d1">借助 Codex，<br>构建你<span class="hero-accent">想要的一切</span></h1>
        <p class="fade-up fade-up-d2">技术小白的Codex 实践站。不用写代码，把脑子里的想法变成能用的工具。</p>
        <div class="hero-actions fade-up fade-up-d3">
          <a href="/cases/" class="btn btn-primary">查看案例</a>
          <a href="/guide/" class="btn btn-secondary">开始学习</a>
          <a href="https://www.99gpt.site" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Codex充值</a>
        </div>
      </div>
    </section>

    <section id="hot-posts" class="section section-soft">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2 class="section-title">网络热帖</h2>
            <p class="section-desc">X 人工精选，优先收录适合新手的 Codex 教程、实战与重要更新；其他平台展示近期热帖或历史精选</p>
          </div>
          <span class="section-hint">{{ hotUpdatedAt ? `其他平台数据获取于 ${hotUpdatedAt}（北京时间）` : '点击直接跳转原文' }}</span>
        </div>
        <div v-if="hotGroups.length" class="hot-list">
          <div v-for="group in hotGroups" :key="group.source" class="hot-platform">
            <div class="hot-platform-header">
              <div class="hot-platform-meta">
                <span :class="['source-tag', group.tagClass]">{{ group.source }}</span>
                <span class="hot-keyword">{{ group.keyword }}</span>
              </div>
              <a :href="group.moreHref" target="_blank" class="hot-more" rel="noreferrer">查看更多</a>
            </div>
            <p v-if="group.notice" class="hot-platform-notice">{{ group.notice }}</p>
            <div v-if="group.items.length" class="hot-row">
              <a v-for="item in group.items" :key="item.href" :href="item.href" target="_blank" class="hot-item" rel="noreferrer">
                <div class="hot-item-main">
                  <div class="hot-title">{{ item.title }}</div>
                  <HotAuthor v-if="item.author" :author="item.author" :avatar="item.avatar" />
                </div>
                <div class="hot-item-footer">
                  <span class="hot-time">{{ item.meta }}</span>
                  <span class="hot-open">原文</span>
                </div>
              </a>
            </div>
            <div v-else class="hot-platform-empty">{{ group.emptyText || '最近 7 天暂时没有抓到可确认的热帖。' }}</div>
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
        <div class="case-filters" role="group" aria-label="案例分类">
          <button v-for="category in caseCategories" :key="category" type="button" class="filter-tag"
            :class="{ active: selectedCategory === category }" :aria-pressed="selectedCategory === category"
            @click="selectedCategory = category">{{ category }}</button>
        </div>
        <p class="case-filter-count" role="status">{{ visibleCases.length }} 个案例</p>
        <div class="card-grid">
          <a v-for="page in visibleCases" :key="page.link" :href="contentDestination(page)" class="card">
            <div class="card-cover"><img v-if="page.cover" :src="page.cover" :alt="page.coverAlt" loading="lazy" decoding="async"></div>
            <div class="card-body">
              <div class="card-tags"><span :class="`lv lv${page.level}`">Lv.{{ page.level }}</span><span class="tag-pill">{{ page.category }}</span><span class="content-status" :class="`content-status-${page.status}`">{{ page.statusLabel }}</span></div>
              <h3>{{ page.text.replace(/^\d+\s*/, '') }}</h3>
              <p>{{ page.description || '内容正在整理，完成后开放阅读。' }}</p>
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
          <a v-for="(page, index) in featuredTips" :key="page.link" :href="contentDestination(page)" class="tip-card" :class="{ 'tip-card-featured': index === 0 }">
            <div class="tip-meta"><span>{{ page.category }}</span><span class="content-status" :class="`content-status-${page.status}`">{{ page.statusLabel }}</span></div>
            <h3>{{ page.text.replace(/^\d+\s*/, '') }}</h3>
            <p>{{ page.description }}</p>
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
          <a href="/guide/" class="tip-card">
            <div class="plugin-icon">CU</div>
            <h3>Computer Use</h3>
            <p class="plugin-sub">桌面控制 · 官方插件 <span class="plugin-stars">★★★★★</span></p>
            <p>控制 Mac 应用、点击、输入、截图，让 Codex 像人一样操作你的电脑。</p>
          </a>
          <a href="/guide/" class="tip-card">
            <div class="plugin-icon">PW</div>
            <h3>Playwright MCP</h3>
            <p class="plugin-sub">浏览器自动化 · 社区插件 <span class="plugin-stars">★★★★☆</span></p>
            <p>网页自动化、数据抓取、表单填写，精准的浏览器控制。</p>
          </a>
          <a href="/guide/" class="tip-card">
            <div class="plugin-icon">AT</div>
            <h3>Automations</h3>
            <p class="plugin-sub">定时任务 · 官方功能 <span class="plugin-stars">★★★★★</span></p>
            <p>设定 Cron 定时任务，让 Codex 每天自动执行工作流。</p>
          </a>
          <a href="/guide/" class="tip-card">
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
            <summary>Chat、Work 和 Codex 有什么区别？</summary>
            <div class="faq-body">Chat、Work 和 Codex 都在 ChatGPT 体系中。Chat 适合问答、解释和短文改写；Work 适合整理资料、生成文档、表格和 PPT、执行多步骤任务；Codex 更侧重编程、项目开发和代码维护。Work 和 Codex 都可以在授权范围内使用文件、插件和工具。ChatGPT Work 与 Codex 共用额度，不能把 Work 当成另一份独立额度。</div>
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
            <a href="https://github.com/onlyhuman028/52codex" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:hello@52codex.site">联系邮箱</a>
            <a href="mailto:hello@52codex.site?subject=52codex%20投稿">投稿</a>
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getFallbackHotGroups, mergeHotGroups, fetchJsonWithTimeout } from './hot-posts-data.mjs'
import { casePages, guidePages, tipPages } from './navPages'
import { contentDestination, filterCases, selectFeatured } from './content-policy.mjs'
import HotAuthor from './HotAuthor.vue'

const featuredGuidePages = guidePages.filter(page => page.recommendable).slice(0, 4)
const featuredTips = selectFeatured(tipPages)
const selectedCategory = ref('全部')
const homeCases = selectFeatured(casePages)
const caseCategories = ['全部', ...new Set(homeCases.map(page => page.category).filter(Boolean))]
const visibleCases = computed(() => filterCases(homeCases, selectedCategory.value))

const hotGroups = ref(getFallbackHotGroups())
const hotUpdatedAt = ref('')
const hotRequestController = new AbortController()

onUnmounted(() => hotRequestController.abort())
onMounted(async () => {
  // A static build may have been generated days ago; refresh the date links now.
  hotGroups.value = getFallbackHotGroups()
  try {
    const data = await fetchJsonWithTimeout('/api/hot-posts', { signal: hotRequestController.signal }, 8000)
    hotGroups.value = mergeHotGroups(data.groups)
    if (hotGroups.value.some((group) => group.status === 'live') && Number.isFinite(Date.parse(data.updatedAt))) {
      hotUpdatedAt.value = new Date(data.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    }
  } catch {
    hotGroups.value = getFallbackHotGroups()
  }
})
</script>
