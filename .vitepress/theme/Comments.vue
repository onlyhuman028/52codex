<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

type CommentItem = {
  id: string
  name: string
  message: string
  createdAt: string
}

const route = useRoute()
const { frontmatter } = useData()

const comments = ref<CommentItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const notice = ref('')

const form = reactive({
  name: '',
  message: '',
  website: ''
})

const pagePath = computed(() => route.path)
const pageTitle = computed(() => String(frontmatter.value.title || '当前页面'))
const messageLength = computed(() => form.message.trim().length)
const canSubmit = computed(() => form.name.trim().length >= 2 && messageLength.value >= 5 && !submitting.value)

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
  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    const response = await fetch(`/api/comments?path=${encodeURIComponent(pagePath.value)}`)
    const contentType = response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      throw new Error('本地预览未运行留言接口，请用 Cloudflare Pages 预览或上线后测试')
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || '留言暂时无法加载')
    }

    comments.value = Array.isArray(data.comments) ? data.comments : []
  } catch (err) {
    comments.value = []
    error.value = err instanceof Error ? err.message : '留言暂时无法加载'
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!canSubmit.value) return

  submitting.value = true
  error.value = ''
  notice.value = ''

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        path: pagePath.value,
        title: pageTitle.value,
        name: form.name,
        message: form.message,
        website: form.website
      })
    })
    const contentType = response.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      throw new Error('本地预览未运行留言接口，请用 Cloudflare Pages 预览或上线后测试')
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || '留言提交失败')
    }

    form.name = ''
    form.message = ''
    form.website = ''
    comments.value = Array.isArray(data.comments) ? data.comments : comments.value
    notice.value = data.message || '留言已发布'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '留言提交失败'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchComments)

watch(
  () => route.path,
  () => {
    form.name = ''
    form.message = ''
    form.website = ''
    fetchComments()
  }
)
</script>

<template>
  <section id="comments" class="comments" aria-labelledby="comments-title">
    <div class="comments-head">
      <div>
        <p class="comments-kicker">留言</p>
        <h2 id="comments-title">一起补充经验</h2>
      </div>
      <span class="comments-count">{{ comments.length }} 条</span>
    </div>

    <form class="comment-form" @submit.prevent="submitComment">
      <label class="comment-field">
        <span>昵称</span>
        <input v-model="form.name" type="text" name="name" maxlength="24" autocomplete="name" placeholder="怎么称呼你" />
      </label>

      <label class="comment-field">
        <span>留言</span>
        <textarea v-model="form.message" name="message" maxlength="500" rows="5" placeholder="写下你的问题、经验或补充"></textarea>
      </label>

      <label class="comment-honeypot" aria-hidden="true">
        <span>网站</span>
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </label>

      <div class="comment-actions">
        <span>{{ messageLength }}/500</span>
        <button type="submit" :disabled="!canSubmit">
          {{ submitting ? '提交中...' : '提交留言' }}
        </button>
      </div>
    </form>

    <p v-if="notice" class="comment-status ok">{{ notice }}</p>
    <p v-if="error" class="comment-status">{{ error }}</p>

    <div v-if="loading" class="comments-empty">正在加载留言...</div>
    <div v-else-if="!comments.length && !error" class="comments-empty">还没有留言，先写第一条。</div>
    <ol v-else class="comment-list">
      <li v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-meta">
          <strong>{{ comment.name }}</strong>
          <time :datetime="comment.createdAt">{{ formatDate(comment.createdAt) }}</time>
        </div>
        <p>{{ comment.message }}</p>
      </li>
    </ol>
  </section>
</template>
