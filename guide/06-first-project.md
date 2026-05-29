---
title: 第一个项目
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'
const router = useRouter()
onMounted(() => { router.go('/coming-soon') })
</script>

正在跳转...
