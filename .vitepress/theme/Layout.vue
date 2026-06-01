<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { Content } from 'vitepress/dist/client/app/components/Content.js'
import Comments from './Comments.vue'
import { guidePages } from './guidePages'

const route = useRoute()
const { frontmatter } = useData()
const mobileOpen = ref(false)
const activeDropdown = ref('')
let dropdownCloseTimer: ReturnType<typeof window.setTimeout> | undefined

const isHome = computed(() => route.path === '/')
const isCasePost = computed(() => route.path.startsWith('/cases/') && route.path !== '/cases/')
const showComments = computed(() => !isHome.value && route.path !== '/coming-soon' && !route.path.endsWith('/'))
const sectionTitle = computed(() => {
  if (route.path === '/plugins/computer-use') return 'Computer use'
  if (route.path.startsWith('/cases/')) return '实战案例'
  if (route.path.startsWith('/guide/')) return '上手指南'
  if (route.path.startsWith('/tips/')) return '实用技巧'
  if (route.path.startsWith('/plugins/')) return '插件与技能'
  if (route.path.startsWith('/resources/')) return '资源集锦'
  if (route.path === '/faq') return 'FAQ'
  return ''
})
const sectionHref = computed(() => {
  if (route.path === '/plugins/computer-use') return '/plugins/computer-use'
  if (route.path.startsWith('/cases/')) return '/cases/'
  if (route.path.startsWith('/guide/')) return '/guide/'
  if (route.path.startsWith('/tips/')) return '/tips/'
  if (route.path.startsWith('/plugins/')) return '/plugins/'
  if (route.path.startsWith('/resources/')) return '/resources/'
  return '/'
})
const levelClass = computed(() => {
  const level = Number(frontmatter.value.level || 0)
  return level ? `lv lv${level}` : ''
})
const displayDate = computed(() => {
  const value = frontmatter.value.date
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const text = String(value)
  return text.includes('T') ? text.slice(0, 10) : text
})
function closeMobile() {
  mobileOpen.value = false
}

function closeDropdown() {
  activeDropdown.value = ''
}

function cancelDropdownClose() {
  if (dropdownCloseTimer) {
    window.clearTimeout(dropdownCloseTimer)
    dropdownCloseTimer = undefined
  }
}

function openDropdown(name: string) {
  cancelDropdownClose()
  activeDropdown.value = name
}

function toggleDropdown(name: string) {
  cancelDropdownClose()
  activeDropdown.value = activeDropdown.value === name ? '' : name
}

function scheduleDropdownClose() {
  cancelDropdownClose()
  dropdownCloseTimer = window.setTimeout(() => {
    activeDropdown.value = ''
    dropdownCloseTimer = undefined
  }, 240)
}

function decoratePromptBlocks() {
  document.querySelectorAll<HTMLElement>('.custom-block.tip').forEach((block) => {
    const title = block.querySelector<HTMLElement>('.custom-block-title')
    if (!title?.textContent?.trim().startsWith('Prompt')) return
    block.classList.add('prompt-block')
    if (block.querySelector('.prompt-copy')) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'prompt-copy'
    button.textContent = '复制'
    button.addEventListener('click', async () => {
      const text = Array.from(block.childNodes)
        .filter((node) => node !== title && node !== button)
        .map((node) => node.textContent || '')
        .join('')
        .trim()
      await navigator.clipboard.writeText(text)
      button.textContent = '已复制'
      window.setTimeout(() => {
        button.textContent = '复制'
      }, 1800)
    })
    block.appendChild(button)
  })
}

onMounted(() => {
  decoratePromptBlocks()
})

watch(
  () => route.path,
  async () => {
    closeMobile()
    closeDropdown()
    await nextTick()
    decoratePromptBlocks()
  }
)
</script>

<template>
  <div class="site-shell">
    <nav class="nav" @mouseenter="cancelDropdownClose" @mouseleave="scheduleDropdownClose">
      <div class="nav-inner">
        <a href="/" class="nav-logo" aria-label="我爱CodeX 首页">
          <svg class="nav-logo-mark" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="18" />
            <path d="M21.5 10.4c-7.1 0-12 5.1-12 12.6s5 12.6 12.2 12.6c4.3 0 7.7-1.6 9.8-4.6l-4.4-3.4c-1.3 1.7-3.1 2.6-5.3 2.6-3.8 0-6.2-2.9-6.2-7.2s2.5-7.1 6.1-7.1c2.2 0 3.9.8 5.2 2.5l4.4-3.4c-2.1-3.1-5.5-4.7-9.8-4.7z" />
          </svg>
          <span>我爱</span><span>CodeX</span>
        </a>

        <div class="nav-links">
          <a href="/#hot-posts" class="nav-item">网络热帖</a>

          <div
            class="nav-item has-dropdown"
            :class="{ open: activeDropdown === 'guide' }"
            @mouseenter="openDropdown('guide')"
            @click.self="toggleDropdown('guide')"
          >
            上手指南
            <div class="nav-dropdown" @mouseenter="openDropdown('guide')">
              <a href="/guide/" @click="closeDropdown">01 学习路线图</a>
              <a v-for="page in guidePages" :key="page.link" :href="page.link" @click="closeDropdown">{{ page.text }}</a>
            </div>
          </div>

          <div
            class="nav-item has-dropdown"
            :class="{ open: activeDropdown === 'tips' }"
            @mouseenter="openDropdown('tips')"
            @click.self="toggleDropdown('tips')"
          >
            实用技巧
            <div class="nav-dropdown" @mouseenter="openDropdown('tips')">
              <a href="/tips/" @click="closeDropdown">技巧总览</a>
              <a href="/tips/make-codex-better" @click="closeDropdown">让 Codex 越用越顺手</a>
              <a href="/tips/agents-md" @click="closeDropdown">AGENTS.md 怎么写</a>
              <a href="/tips/goals" @click="closeDropdown">Goals 拆解术</a>
              <a href="/tips/prevent-bad-edits" @click="closeDropdown">防止乱改代码</a>
              <a href="/tips/self-evolution" @click="closeDropdown">让 Codex 自我进化</a>
              <a href="/tips/save-quota" @click="closeDropdown">额度怎么省</a>
            </div>
          </div>

          <div
            class="nav-item has-dropdown"
            :class="{ open: activeDropdown === 'cases' }"
            @mouseenter="openDropdown('cases')"
            @click.self="toggleDropdown('cases')"
          >
            实战案例
            <div class="nav-dropdown" @mouseenter="openDropdown('cases')">
              <a href="/cases/" @click="closeDropdown">案例总览</a>
              <div class="dd-divider">Lv.1 入门</div>
              <a href="/cases/build-company-site" @click="closeDropdown">半天做一个公司网站</a>
              <a href="/cases/batch-image-ppt" @click="closeDropdown">批量生图做 PPT</a>
              <div class="dd-divider">Lv.2 进阶</div>
              <a href="/cases/auto-collect-posts" @click="closeDropdown">自动搜集公众号热帖</a>
              <a href="/cases/install-openclaw" @click="closeDropdown">用 Computer Use 安装龙虾</a>
              <a href="/cases/auto-video-edit" @click="closeDropdown">自动剪辑视频</a>
              <div class="dd-divider">Lv.3 系统</div>
              <a href="/cases/investment-system" @click="closeDropdown">从零搭建投资管理系统</a>
              <a href="/cases/hr-system" @click="closeDropdown">搭建招聘管理系统</a>
            </div>
          </div>

          <div
            class="nav-item has-dropdown"
            :class="{ open: activeDropdown === 'plugins' }"
            @mouseenter="openDropdown('plugins')"
            @click.self="toggleDropdown('plugins')"
          >
            插件与技能
            <div class="nav-dropdown" @mouseenter="openDropdown('plugins')">
              <a href="/plugins/" @click="closeDropdown">插件总览</a>
              <a href="/plugins/computer-use" @click="closeDropdown">Computer Use</a>
              <a href="/plugins/playwright" @click="closeDropdown">Playwright MCP</a>
              <a href="/plugins/automations" @click="closeDropdown">Automations</a>
              <a href="/plugins/feishu" @click="closeDropdown">飞书 MCP</a>
              <a href="/plugins/custom-skill" @click="closeDropdown">自定义 Skill</a>
            </div>
          </div>

          <a href="/plugins/computer-use" class="nav-item" @click="closeDropdown">Computer use</a>

          <div
            class="nav-item has-dropdown"
            :class="{ open: activeDropdown === 'resources' }"
            @mouseenter="openDropdown('resources')"
            @click.self="toggleDropdown('resources')"
          >
            资源集锦
            <div class="nav-dropdown" @mouseenter="openDropdown('resources')">
              <a href="/resources/#官方资源" @click="closeDropdown">官方资源</a>
              <a href="/resources/#社区项目" @click="closeDropdown">社区资源</a>
              <a href="/resources/#工具推荐" @click="closeDropdown">推荐工具</a>
              <a href="/resources/#学习资料" @click="closeDropdown">学习资料</a>
            </div>
          </div>

          <a href="/faq" class="nav-item" @click="closeDropdown">FAQ</a>
        </div>

        <button class="nav-hamburger" type="button" aria-label="打开导航菜单" @click="mobileOpen = true">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <div class="mobile-overlay" :class="{ open: mobileOpen }">
      <div class="mobile-header">
        <a href="/" class="nav-logo" @click="closeMobile">
          <svg class="nav-logo-mark" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="18" />
            <path d="M21.5 10.4c-7.1 0-12 5.1-12 12.6s5 12.6 12.2 12.6c4.3 0 7.7-1.6 9.8-4.6l-4.4-3.4c-1.3 1.7-3.1 2.6-5.3 2.6-3.8 0-6.2-2.9-6.2-7.2s2.5-7.1 6.1-7.1c2.2 0 3.9.8 5.2 2.5l4.4-3.4c-2.1-3.1-5.5-4.7-9.8-4.7z" />
          </svg>
          <span>我爱</span><span>CodeX</span>
        </a>
        <button class="mobile-close" type="button" aria-label="关闭导航菜单" @click="closeMobile">×</button>
      </div>
      <div class="mobile-body">
        <a href="/#hot-posts" @click="closeMobile">网络热帖</a>
        <a href="/guide/" @click="closeMobile">上手指南</a>
        <a v-for="page in guidePages" :key="`mobile-${page.link}`" :href="page.link" class="sub-link" @click="closeMobile">{{ page.text }}</a>
        <a href="/tips/" @click="closeMobile">实用技巧</a>
        <a href="/tips/agents-md" class="sub-link" @click="closeMobile">AGENTS.md 怎么写</a>
        <a href="/cases/" @click="closeMobile">实战案例</a>
        <a href="/cases/build-company-site" class="sub-link" @click="closeMobile">半天做一个公司网站</a>
        <a href="/cases/auto-collect-posts" class="sub-link" @click="closeMobile">自动搜集公众号热帖</a>
        <a href="/cases/investment-system" class="sub-link" @click="closeMobile">从零搭建投资管理系统</a>
        <a href="/plugins/" @click="closeMobile">插件与技能</a>
        <a href="/plugins/computer-use" @click="closeMobile">Computer use</a>
        <a href="/resources/" @click="closeMobile">资源集锦</a>
        <a href="/resources/#官方资源" class="sub-link" @click="closeMobile">官方资源</a>
        <a href="/resources/#社区项目" class="sub-link" @click="closeMobile">社区资源</a>
        <a href="/resources/#工具推荐" class="sub-link" @click="closeMobile">推荐工具</a>
        <a href="/resources/#学习资料" class="sub-link" @click="closeMobile">学习资料</a>
        <a href="/faq" @click="closeMobile">FAQ</a>
      </div>
    </div>

    <Content v-if="isHome" />

    <main v-else class="article-page">
      <article class="article-wrapper">
        <div class="breadcrumb">
          <a href="/">首页</a>
          <span class="sep">/</span>
          <a v-if="sectionTitle" :href="sectionHref">{{ sectionTitle }}</a>
          <span v-if="sectionTitle" class="sep">/</span>
          <span class="current">{{ frontmatter.title }}</span>
        </div>

        <div v-if="isCasePost" class="article-tags">
          <span v-if="levelClass" :class="levelClass">Lv.{{ frontmatter.level }}</span>
          <span v-for="tag in frontmatter.tags || []" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>

        <h1 class="article-title">{{ frontmatter.title }}</h1>
        <p v-if="frontmatter.description" class="article-lead">{{ frontmatter.description }}</p>
        <div v-if="isCasePost" class="article-meta">
          <span>{{ displayDate }}</span>
          <span>·</span>
          <span>阅读约 8 分钟</span>
          <span>·</span>
          <span>额度消耗 ≈ 30%</span>
        </div>
        <div v-if="isCasePost" class="article-cover">
          <div class="article-cover-inner">封面图</div>
        </div>

        <div class="article-content">
          <Content />
        </div>
        <Comments v-if="showComments" />
      </article>
    </main>

    <footer v-if="!isHome" class="footer">
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
            <a href="https://www.91openclaw.site" target="_blank" rel="noreferrer">OpenClaw 中文站</a>
          </div>
        </div>
        <div>
          <h4>社区</h4>
          <div class="footer-links">
            <a href="#">公众号</a>
            <a href="#">微信交流群</a>
            <a href="#" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:hello@52codex.site">联系邮箱</a>
          </div>
        </div>
      </div>
    </footer>

    <a v-if="showComments" class="comment-fab" href="#comments">留言</a>
  </div>
</template>
