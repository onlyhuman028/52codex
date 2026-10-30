<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
type Heading = { title: string; slug: string; level: number; children?: Heading[] }
const headings = computed(() => {
  const flatten = (items: Heading[]): Heading[] => items.flatMap(item => [item, ...flatten(item.children || [])])
  return flatten(page.value.headers || []).filter(item => item.level === 2 || item.level === 3)
})
</script>

<template>
  <nav v-if="headings.length >= 3" class="article-toc" aria-label="文章目录">
    <details open>
      <summary>本文目录</summary>
      <ol><li v-for="heading in headings" :key="heading.slug" :class="{ 'toc-child': heading.level === 3 }"><a :href="`#${heading.slug}`">{{ heading.title }}</a></li></ol>
    </details>
  </nav>
</template>
