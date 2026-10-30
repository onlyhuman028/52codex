<script setup lang="ts">
import { computed } from 'vue'
import { data } from './content.data'
import { contentDestination } from './content-policy.mjs'

const props = defineProps<{ section: string; level?: number; kind?: string; category?: string }>()
const pages = computed(() => data.filter(page => !page.hidden && !page.isIndex && page.link.startsWith(`/${props.section}/`)
  && (props.level === undefined || page.level === props.level)
  && (!props.kind || (props.kind === 'Skill' ? page.tags.includes('Skill') : !page.tags.includes('Skill')))
  && (!props.category || page.category === props.category)))
</script>

<template>
  <ul class="content-list">
    <li v-for="page in pages" :key="page.link">
      <a :href="contentDestination(page)">{{ page.text }}</a>
      <span class="content-status" :class="`content-status-${page.status}`">{{ page.statusLabel }}</span>
      <p v-if="page.description">{{ page.description }}</p>
    </li>
  </ul>
</template>
