---
title: 新手指南 — 学习路线图
---

<script setup>
import { guidePages } from '../.vitepress/theme/guidePages'
</script>

# 新手指南

面向完全不会 Codex 的用户。从 0 开始，一步步走到能独立做项目。

## 学习路线图

```
Phase 0  理解概念        什么是 Vibe Coding？Codex 是什么角色？
   ↓
Phase 1  环境搭建        注册账号 → 下载安装 → 熟悉界面
   ↓
Phase 2  上手实战        第一次对话 → 做一个网页 → 学会批注
   ↓
Phase 3  工具扩展        插件 → Skill → 自动化 → 定时任务
   ↓
Phase 4  工程化落地      AGENTS.md → DESIGN.md → Goals → 完整系统
```

## 按顺序学习

<table>
  <thead>
    <tr>
      <th>序号</th>
      <th>主题</th>
      <th>你会学到</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="page in guidePages" :key="page.link">
      <td>{{ String(page.order).padStart(2, '0') }}</td>
      <td><a :href="page.link">{{ page.text }}</a></td>
      <td>{{ page.description || '内容正在整理中' }}</td>
    </tr>
  </tbody>
</table>

::: tip 不用从头看
如果你已经装好了 Codex，直接跳到你需要的章节。每篇都是独立的。
:::

## 学完之后去哪里

- 想看别人怎么用 → [实战案例](/cases/)
- 想提升效率 → [实用技巧](/tips/)
- 想扩展能力 → [插件与技能](/plugins/)
