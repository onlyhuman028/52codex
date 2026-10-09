<template>
  <div class="hot-author" :title="author">
    <span class="hot-author-avatar" aria-hidden="true">
      <span>{{ initial }}</span>
      <img v-if="avatarSrc && !avatarFailed" :src="avatarSrc" alt="" width="32" height="32"
        loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="avatarFailed = true">
    </span>
    <span class="hot-author-info">
      <span class="hot-author-name">{{ name }}</span>
      <span v-if="handle" class="hot-author-handle">{{ handle }}</span>
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { safeHref } from './hot-posts-data.mjs'

const props = defineProps({
  author: { type: String, required: true },
  avatar: { type: String, default: '' }
})
const authorParts = computed(() => props.author.trim().match(/^(.*?)\s*[（(](@[^）)]+)[）)]$/))
const name = computed(() => authorParts.value?.[1].trim() || props.author.trim())
const handle = computed(() => authorParts.value?.[2] || '')
const initial = computed(() => Array.from(name.value.replace(/^(?:u\/|@)/, ''))[0]?.toUpperCase() || '?')
const avatarSrc = computed(() => {
  if (typeof props.avatar !== 'string') return ''
  if (props.avatar.startsWith('/images/authors/')) return withBase(props.avatar)
  return safeHref(props.avatar) ? props.avatar : ''
})
const avatarFailed = ref(false)
watch(avatarSrc, () => { avatarFailed.value = false })
</script>
