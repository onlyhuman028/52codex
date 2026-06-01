<script setup lang="ts">
import { computed, ref } from 'vue'

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
const replyDrafts = ref<Record<string, { message: string; href: string }>>({})

const canLoad = computed(() => token.value.trim().length > 0 && !loading.value)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

async function fetchComments() {
  if (!canLoad.value) return

  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    const response = await fetch(`/api/comments-admin?status=${encodeURIComponent(status.value)}`, {
      headers: { 'x-admin-token': token.value.trim() }
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || '留言列表加载失败')
    }

    comments.value = Array.isArray(data.comments) ? data.comments : []
  } catch (err) {
    comments.value = []
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
    await fetchComments()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
  }
}
</script>

<template>
  <section class="comment-admin">
    <div class="comment-admin-panel">
      <label class="comment-field">
        <span>管理口令</span>
        <input v-model="token" type="password" autocomplete="off" placeholder="COMMENTS_ADMIN_TOKEN" />
      </label>

      <label class="comment-field">
        <span>筛选</span>
        <select v-model="status">
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="all">全部</option>
        </select>
      </label>

      <button type="button" :disabled="!canLoad" @click="fetchComments">
        {{ loading ? '加载中...' : '查看留言' }}
      </button>
    </div>

    <p v-if="notice" class="comment-status ok">{{ notice }}</p>
    <p v-if="error" class="comment-status">{{ error }}</p>

    <div v-if="!comments.length && !loading && !error" class="comments-empty">暂无留言。</div>
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
            <textarea v-model="getReplyDraft(comment).message" rows="3" maxlength="500" placeholder="写给这条留言的回复"></textarea>
          </label>
          <label class="comment-field">
            <span>回复链接（可选）</span>
            <input v-model="getReplyDraft(comment).href" type="url" placeholder="https://example.com" />
          </label>
        </div>
        <div class="comment-admin-actions">
          <button v-if="comment.status !== 'approved'" type="button" @click="updateComment(comment, 'approve')">通过</button>
          <button type="button" @click="updateComment(comment, 'reply')">保存回复</button>
          <button v-if="comment.reply" type="button" @click="updateComment(comment, 'clearReply')">清除回复</button>
          <button type="button" class="danger" @click="updateComment(comment, 'delete')">删除</button>
        </div>
      </li>
    </ol>
  </section>
</template>
