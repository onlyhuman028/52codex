<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type AdminComment = {
  id: string
  path: string
  title?: string
  name: string
  message: string
  status: string
  createdAt: string
  reply?: {
    message: string
    href?: string
    createdAt: string
  }
}

const token = ref('')
const status = ref('pending')
const comments = ref<AdminComment[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const updating = ref('')
const nextCursor = ref('')
const busy = computed(() => loading.value || Boolean(updating.value))
const replyDrafts = ref<Record<string, { message: string; href: string }>>({})

const canLoad = computed(() => token.value.trim().length > 0 && !busy.value)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

async function fetchComments(reset = true, internal = false) {
  if (!token.value.trim() || loading.value || (!internal && updating.value)) return

  loading.value = true
  error.value = ''
  if (!internal) notice.value = ''
  if (reset) { nextCursor.value = ''; comments.value = [] }
  try {
    const params = new URLSearchParams({ status: status.value })
    if (!reset && nextCursor.value) params.set('cursor', nextCursor.value)
    const response = await fetch(`/api/comments-admin?${params}`, {
      headers: { 'x-admin-token': token.value.trim() }
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || '留言列表加载失败')
    }

    const items = Array.isArray(data.comments) ? data.comments : []
    comments.value = reset ? items : [...new Map([...comments.value, ...items].map(item => [item.id, item])).values()]
    nextCursor.value = data.nextCursor || ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '留言列表加载失败'
  } finally {
    loading.value = false
  }
}

function getReplyDraft(comment: AdminComment) {
  if (!replyDrafts.value[comment.id]) {
    replyDrafts.value[comment.id] = {
      message: comment.reply?.message || '',
      href: comment.reply?.href || ''
    }
  }

  return replyDrafts.value[comment.id]
}

async function updateComment(comment: AdminComment, action: 'approve' | 'delete' | 'reply' | 'clearReply') {
  if (busy.value) return
  updating.value = comment.id
  error.value = ''
  notice.value = ''
  const draft = getReplyDraft(comment)

  try {
    const response = await fetch('/api/comments-admin', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-token': token.value.trim()
      },
      body: JSON.stringify({
        action,
        id: comment.id,
        path: comment.path,
        replyMessage: draft.message,
        replyHref: draft.href
      })
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || '操作失败')
    }

    const noticeMap = {
      approve: '已通过留言',
      delete: '已删除留言',
      reply: '已保存回复',
      clearReply: '已清除回复'
    }

    notice.value = noticeMap[action]
    await fetchComments(true, true)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
  } finally { updating.value = '' }
}
watch([status, token], () => { comments.value = []; nextCursor.value = ''; error.value = ''; notice.value = ''; replyDrafts.value = {} })
</script>

<template>
  <section class="comment-admin">
    <div class="comment-admin-panel">
      <label class="comment-field">
        <span>管理口令</span>
        <input v-model="token" :disabled="busy" type="password" autocomplete="off" placeholder="COMMENTS_ADMIN_TOKEN" />
      </label>

      <label class="comment-field">
        <span>筛选</span>
        <select v-model="status" :disabled="busy">
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="all">全部</option>
        </select>
      </label>

      <button type="button" :disabled="!canLoad" @click="fetchComments()">
        {{ loading ? '加载中...' : '查看留言' }}
      </button>
    </div>

    <p v-if="notice" class="comment-status ok">{{ notice }}</p>
    <p v-if="error" class="comment-status">{{ error }}</p>

    <div v-if="!comments.length && !loading && !error && !nextCursor" class="comments-empty">暂无留言。</div>
    <ol v-else class="comment-admin-list">
      <li v-for="comment in comments" :key="comment.id" class="comment-admin-item">
        <div class="comment-meta">
          <strong>{{ comment.name }}</strong>
          <time :datetime="comment.createdAt">{{ formatDate(comment.createdAt) }}</time>
          <span class="comment-admin-status">{{ comment.status }}</span>
        </div>
        <a class="comment-admin-path" :href="comment.path" target="_blank" rel="noreferrer">
          {{ comment.title || comment.path }}
        </a>
        <p>{{ comment.message }}</p>
        <div v-if="comment.reply" class="comment-reply">
          <div class="comment-reply-label">当前回复</div>
          <p>{{ comment.reply.message }}</p>
          <a v-if="comment.reply.href" :href="comment.reply.href" target="_blank" rel="noreferrer">查看链接</a>
        </div>
        <div class="comment-admin-reply">
          <label class="comment-field">
            <span>回复文字</span>
            <textarea v-model="getReplyDraft(comment).message" :disabled="busy" rows="3" maxlength="500" placeholder="写给这条留言的回复"></textarea>
          </label>
          <label class="comment-field">
            <span>回复链接（可选）</span>
            <input v-model="getReplyDraft(comment).href" :disabled="busy" type="url" placeholder="https://example.com" />
          </label>
        </div>
        <p v-if="updating === comment.id" class="comment-status" role="status">正在保存…</p>
        <div class="comment-admin-actions">
          <button v-if="comment.status !== 'approved'" type="button" :disabled="busy" @click="updateComment(comment, 'approve')">通过</button>
          <button type="button" :disabled="busy" @click="updateComment(comment, 'reply')">保存回复</button>
          <button v-if="comment.reply" type="button" :disabled="busy" @click="updateComment(comment, 'clearReply')">清除回复</button>
          <button type="button" class="danger" :disabled="busy" @click="updateComment(comment, 'delete')">删除</button>
        </div>
      </li>
    </ol>
    <p v-if="nextCursor && !comments.length && !loading" class="comment-status">本页没有符合筛选条件的留言，可继续加载。</p>
    <button v-if="nextCursor" type="button" class="list-load-more" :disabled="busy" @click="fetchComments(false)">{{ loading ? '加载中…' : '加载更多留言' }}</button>
  </section>
</template>
