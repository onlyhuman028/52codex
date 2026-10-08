<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { beijingDate, calendarDays, resetLoader, resetStatistics } from './codex-reset-data.mjs'
import './codex-reset.css'

type ResetPost = { id: string; text: string; originalText: string; stage: string; publishedAt: string; url: string }
type ResetEvent = {
  id: string; type: string; date: string; label: string; status: string; audience: string; products: string;
  confirmedAt: string; occurredOn: string; confirmationBasis: string; scheduleLabel: string;
  estimateLabel: string; estimateReason: string; timeInferred: boolean; posts: ResetPost[];
}
type ResetSnapshot = {
  today: string; checkedAt: string; historyFrom: string; events: ResetEvent[];
  monitor: { status: string; lastAttemptAt: string; lastCollectedAt: string; lastVerifiedAt: string }; outage: boolean;
}

const data = ref<ResetSnapshot | null>(null)
const loading = ref(true)
const failed = ref(false)
const stale = ref(false)
const completeHistory = ref(false)
const today = ref('')
const month = ref('')
const selectedDate = ref('')
const filter = ref('all')
const nextRefreshAt = ref(0)
const now = ref(0)
let controller: AbortController | undefined
let timer: ReturnType<typeof setInterval> | undefined

const events = computed(() => data.value?.events || [])
const pending = computed(() => events.value.filter(event => event.status === 'announced'))
const latest = computed(() => pending.value[0] || events.value[0])
const statistics = computed(() => today.value ? resetStatistics(events.value, today.value) : null)
const minMonth = computed(() => data.value?.historyFrom?.slice(0, 7) || today.value.slice(0, 7))
const maxMonth = computed(() => [today.value, ...events.value.map(event => event.date)].sort().at(-1)?.slice(0, 7) || '')
const dayGroups = computed(() => {
  const groups = new Map<string, ResetEvent[]>()
  events.value.filter(event => filter.value === 'all' || event.type === filter.value).forEach(event => {
    groups.set(event.date, [...(groups.get(event.date) || []), event])
  })
  return groups
})
const days = computed(() => month.value ? calendarDays(month.value).map(day => ({ ...day, events: dayGroups.value.get(day.date) || [] })) : [])
const selectedEvents = computed(() => dayGroups.value.get(selectedDate.value) || [])
const monthEvents = computed(() => events.value.filter(event => event.date.startsWith(month.value)))
const monthResetCount = computed(() => monthEvents.value.filter(event => event.type === 'direct_reset').length)
const monthCreditCount = computed(() => monthEvents.value.filter(event => event.type === 'reset_credit').length)
const refreshDisabled = computed(() => loading.value || now.value < nextRefreshAt.value)
const monitorHealthy = computed(() => data.value?.monitor.status === 'healthy' && !data.value?.outage && !stale.value
  && Date.parse(data.value?.checkedAt || '') >= now.value - 30 * 60000)
const statusLabels: Record<string, string> = { confirmed: '已确认', likely_completed: '预计已生效 · 未确认', announced: '已宣布 · 等待生效', unknown: '待核实' }

function dateLabel(value: string) {
  if (!value) return '待补充'
  const [, m, d] = value.split('-')
  return `${Number(m)}月${Number(d)}日`
}

function timeLabel(value: string) {
  const date = new Date(value)
  if (!value || !Number.isFinite(date.getTime())) return '待补充'
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

function monthLabel(value: string) {
  const [y, m] = value.split('-')
  return `${y} 年 ${Number(m)} 月`
}

function moveMonth(offset: number) {
  const [y, m] = month.value.split('-').map(Number)
  month.value = new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7)
  selectedDate.value = month.value === today.value.slice(0, 7) ? today.value : `${month.value}-01`
}

function selectDay(date: string, reveal = false) {
  selectedDate.value = date
  month.value = date.slice(0, 7)
  if (reveal) document.getElementById('reset-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goToday() {
  month.value = today.value.slice(0, 7)
  selectedDate.value = today.value
}

function confirmationLabel(event: ResetEvent) {
  if (event.status !== 'confirmed') return statusLabels[event.status]
  return event.confirmationBasis === 'receipt_review' ? '到账核实' : '原帖确认'
}

async function refresh() {
  if (loading.value && controller) return
  loading.value = true
  failed.value = false
  controller = new AbortController()
  try {
    const result = await resetLoader.load({ signal: controller.signal })
    data.value = result.snapshot
    stale.value = result.stale
    completeHistory.value = result.completeHistory
    nextRefreshAt.value = result.nextRefreshAt
  } catch {
    if (!controller.signal.aborted) failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  now.value = Date.now()
  today.value = beijingDate(now.value)
  goToday()
  refresh()
  timer = setInterval(() => {
    now.value = Date.now()
    today.value = beijingDate(now.value)
    if (now.value >= nextRefreshAt.value && document.visibilityState === 'visible') refresh()
  }, 30000)
})

onUnmounted(() => {
  controller?.abort()
  if (timer) clearInterval(timer)
})
</script>

<template>
  <main class="reset-page">
    <div class="reset-container">
      <header class="reset-header">
        <div class="reset-eyebrow"><span class="reset-eyebrow-line"></span>CODEX USAGE UPDATES</div>
        <h1>Codex 重置监控</h1>
        <p class="reset-intro">额度什么时候重置，重置卡发给谁？查看最新消息、历史记录和原帖。</p>
        <div class="reset-header-meta">
          <span>全部为北京时间 · UTC+8</span>
        </div>
      </header>

      <p v-if="failed || stale" class="reset-notice" role="status">
        {{ data ? '暂时无法更新，当前显示上一次成功获取的记录。请留意下方核实时间。' : '暂时无法读取重置记录，请稍后重试。' }}
      </p>
      <p v-else-if="data && !completeHistory" class="reset-notice" role="status">完整历史暂时不可用，当前仅展示近 7 天及等待生效的公告。</p>

      <section class="reset-latest" aria-labelledby="reset-latest-title" :aria-busy="loading">
        <div class="reset-latest-top">
          <span class="reset-section-label">最新动态</span>
          <span v-if="data" class="reset-pill" :class="{ 'reset-pill-pending': pending.length }">{{ pending.length ? `${pending.length} 条公告等待生效` : '暂无等待生效的公告' }}</span>
          <span v-else class="reset-pill">{{ loading ? '正在读取记录' : '数据暂不可用' }}</span>
        </div>
        <div class="reset-latest-body">
          <div class="reset-latest-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 7v5h-5M4 17v-5h5M6.1 6.1a8.3 8.3 0 0 1 13.5 3M17.9 17.9a8.3 8.3 0 0 1-13.5-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </div>
          <div class="reset-latest-copy">
            <h2 id="reset-latest-title">{{ latest ? `${latest.label}：${dateLabel(latest.date)}` : loading ? '正在加载最新动态…' : data ? '暂时没有可展示的记录' : '等待获取重置记录' }}</h2>
            <p v-if="latest" class="reset-latest-scope">{{ latest.audience }}<template v-if="latest.products"> · {{ latest.products }}</template></p>
            <p class="reset-latest-note">{{ latest ? `${statusLabels[latest.status]}。确认帖时间不代表精确到账时间；个人额度和重置卡请在 Codex 中查看。` : '只展示已有公告，不预测尚未公布的下一次重置。' }}</p>
          </div>
          <button v-if="latest" class="reset-button reset-button-primary" type="button" @click="selectDay(latest.date, true)">查看这次记录 <span aria-hidden="true">↓</span></button>
        </div>
        <div v-if="latest?.posts[0]" class="reset-latest-quote">
          <span class="reset-quote-label">Tibo 原帖译文</span>
          <p>{{ latest.posts[0].text || '译文待补充' }}</p>
          <a :href="latest.posts[0].url" target="_blank" rel="noreferrer">{{ timeLabel(latest.posts[0].publishedAt) }} · 查看 X 原帖 ↗</a>
        </div>
      </section>

      <section class="reset-statistics" aria-label="近 90 天已确认记录统计">
        <div class="reset-stat"><span>近 90 天已确认重置记录</span><strong>{{ completeHistory ? statistics?.resets : '—' }}<small v-if="completeHistory">次</small></strong></div>
        <div class="reset-stat"><span>近 90 天已确认发重置卡</span><strong>{{ completeHistory ? statistics?.credits : '—' }}<small v-if="completeHistory">次</small></strong></div>
        <div class="reset-stat"><span>重置间隔中位数</span><strong>{{ completeHistory && statistics?.medianDays != null ? statistics.medianDays : '—' }}<small v-if="completeHistory && statistics?.medianDays != null">天</small></strong></div>
        <div class="reset-stat"><span>近 90 天最近确认重置</span><strong class="reset-stat-date">{{ completeHistory && statistics?.lastReset ? dateLabel(statistics.lastReset) : '—' }}</strong></div>
      </section>
      <p class="reset-stat-note">统计仅计入已确认记录；间隔按不同重置日期计算，同日多条记录不产生零天间隔。历史间隔不代表下一次重置时间。</p>

      <section id="reset-history" class="reset-history" aria-labelledby="reset-calendar-title">
        <div class="reset-section-heading">
          <div><h2 id="reset-calendar-title">重置日历</h2><p>选一个日期，查看当天的重置、发卡和原帖。</p></div>
          <div class="reset-filters" aria-label="筛选记录类型">
            <button v-for="item in [{ value: 'all', label: '全部' }, { value: 'direct_reset', label: '额度重置' }, { value: 'reset_credit', label: '重置卡' }]" :key="item.value" type="button" :aria-pressed="filter === item.value" @click="filter = item.value">{{ item.label }}</button>
          </div>
        </div>

        <div class="reset-history-grid">
          <div class="reset-calendar">
            <div class="reset-calendar-toolbar">
              <div><h3>{{ month ? monthLabel(month) : '正在加载日历' }}</h3><p>{{ data ? `本月 ${monthResetCount} 条重置 · ${monthCreditCount} 条发卡记录` : '正在读取记录' }}</p></div>
              <div class="reset-month-actions">
                <button type="button" class="reset-icon-button" aria-label="上个月" :disabled="!data || month <= minMonth" @click="moveMonth(-1)">‹</button>
                <button type="button" class="reset-today-button" :disabled="!today" @click="goToday">今天</button>
                <button type="button" class="reset-icon-button" aria-label="下个月" :disabled="!data || month >= maxMonth" @click="moveMonth(1)">›</button>
              </div>
            </div>
            <div class="reset-weekdays" aria-hidden="true"><span v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day">{{ day }}</span></div>
            <div class="reset-calendar-grid">
              <button v-for="day in days" :key="day.date" type="button" class="reset-day"
                :class="{ 'is-other-month': !day.inMonth, 'is-selected': selectedDate === day.date, 'is-today': day.date === today, 'has-events': day.events.length }"
                :disabled="!data || day.date.slice(0, 7) < minMonth || day.date.slice(0, 7) > maxMonth"
                :aria-label="`${day.date}${day.date === today ? ' 今天' : ''}，${day.events.length} 条记录`"
                :aria-pressed="selectedDate === day.date" @click="selectDay(day.date)">
                <span class="reset-day-number">{{ day.day }}<span v-if="day.date === today" class="reset-today-dot"></span></span>
                <span v-if="day.events.length" class="reset-day-caption">{{ day.events[0].type === 'reset_credit' ? '发重置卡' : day.events[0].label === '额度重置' ? '额度重置' : '重置记录' }}</span>
                <span class="reset-day-markers"><span v-for="event in day.events.slice(0, 3)" :key="event.id" :class="['reset-marker', event.type, event.status]"></span><small v-if="day.events.length > 1">{{ day.events.length }}</small></span>
              </button>
            </div>
            <div class="reset-calendar-legend"><span><i class="reset-marker confirmed"></i>已确认</span><span><i class="reset-marker likely_completed"></i>预计已生效</span><span><i class="reset-marker announced"></i>等待生效</span></div>
          </div>

          <div class="reset-day-detail" aria-live="polite">
            <div class="reset-detail-heading"><h3>{{ dateLabel(selectedDate) }}<span v-if="selectedDate === today">今天</span></h3><p>{{ selectedDate.slice(0, 4) }} · {{ selectedEvents.length }} 条记录</p></div>
            <div v-if="!data" class="reset-detail-empty"><span class="reset-empty-symbol" aria-hidden="true">↻</span><p>{{ loading ? '正在读取历史记录…' : '记录暂时不可用' }}</p><span>读取成功后，可按日期查看详情。</span></div>
            <div v-else-if="!selectedEvents.length" class="reset-detail-empty"><span class="reset-empty-symbol" aria-hidden="true">—</span><p>这一天没有{{ filter === 'reset_credit' ? '发卡' : filter === 'direct_reset' ? '重置' : '' }}记录</p><span>试试日历中带标记的日期。</span></div>
            <article v-for="event in selectedEvents" :key="event.id" class="reset-event">
              <div class="reset-event-status"><i :class="['reset-marker', event.status]"></i>{{ statusLabels[event.status] }}</div>
              <h4>{{ event.label }}</h4>
              <p class="reset-event-audience">{{ event.audience }}<template v-if="event.products"> · {{ event.products }}</template></p>
              <p class="reset-event-time" v-if="event.confirmedAt">确认帖 {{ timeLabel(event.confirmedAt) }} · {{ confirmationLabel(event) }}</p>
              <p class="reset-event-time" v-else-if="event.occurredOn">{{ dateLabel(event.occurredOn) }} · {{ confirmationLabel(event) }}</p>
              <p class="reset-event-time" v-else>{{ confirmationLabel(event) }}</p>
              <div v-if="event.status !== 'confirmed' && (event.scheduleLabel || event.estimateLabel)" class="reset-estimate">
                <span>{{ event.scheduleLabel || event.estimateLabel }}</span>
                <p v-if="event.estimateLabel && event.estimateLabel !== event.scheduleLabel">参考估算：{{ event.estimateLabel }}</p>
                <p>预计时间仅供参考，尚未收到确认。</p>
              </div>
              <div v-for="post in event.posts" :key="post.id" class="reset-post">
                <div class="reset-post-author"><span class="reset-author-avatar" aria-hidden="true">T</span><div><strong>Tibo</strong><span>@thsottiaux · {{ post.stage || '原帖' }}</span></div></div>
                <p class="reset-post-text">{{ post.text || '译文待补充' }}</p>
                <details v-if="post.originalText" class="reset-original"><summary>英文原文</summary><p>{{ post.originalText }}</p></details>
                <a :href="post.url" target="_blank" rel="noreferrer">{{ timeLabel(post.publishedAt) }} · 在 X 查看 ↗</a>
              </div>
              <p v-if="!event.posts.length" class="reset-event-time">原帖链接待补充。</p>
              <p v-if="event.confirmedAt" class="reset-confirm-note">确认帖日期不代表精确到账时间。</p>
            </article>
          </div>
        </div>
      </section>

      <section class="reset-explanation" aria-labelledby="reset-rules-title">
        <div class="reset-section-heading"><div><h2 id="reset-rules-title">怎么看这些记录？</h2><p>先分清重置类型，再看适用范围和确认状态。</p></div></div>
        <div class="reset-explanation-grid">
          <div><span class="reset-explanation-number">01</span><h3>额度重置与发卡分开看</h3><p>额度重置与重置卡发放分别记录。收到重置卡不代表额度已经恢复，是否需要使用、余额多少，请在 Codex 中查看。</p></div>
          <div><span class="reset-explanation-number">02</span><h3>预计时间不等于确认到账</h3><p>“已确认”有原帖确认或到账核实依据。“预计已生效”仍未确认；等待生效的公告也不代表所有账户同时到账。</p></div>
          <div><span class="reset-explanation-number">03</span><h3>没有公告，就不预测</h3><p>时间与适用范围以公告和核实记录为准，未明确的内容保持未明确。历史间隔仅用于回看，不推算尚未宣布的下一次重置。</p></div>
        </div>
      </section>

      <footer class="reset-source-footer">
        <div class="reset-source-status"><span class="reset-monitor-dot" :class="{ healthy: monitorHealthy }"></span><strong>{{ data ? monitorHealthy ? '数据更新正常' : '数据状态待核实' : '尚未取得数据' }}</strong><span v-if="data?.checkedAt">最近检查 {{ timeLabel(data.checkedAt) }}</span></div>
        <div v-if="data" class="reset-source-times"><span>最近采集 {{ timeLabel(data.monitor.lastCollectedAt) }}</span><span>完整核验 {{ timeLabel(data.monitor.lastVerifiedAt) }}</span></div>
        <div class="reset-source-actions"><p>仅展示公开动态 · 非 OpenAI 官方页面</p><button class="reset-button" type="button" :disabled="refreshDisabled" @click="now = Date.now(); refresh()">{{ loading ? '读取中…' : '刷新记录' }}</button></div>
        <p class="reset-source-note">页面打开时读取历史，之后每 10 分钟更新近期动态。</p>
      </footer>
    </div>
  </main>
</template>
