---
title: 新手指南 — 学习路线图
description: 为什么做这个网站，以及从 0 开始学习 Codex 的路线图。
order: 1
---

<script setup>
import { guidePages } from '../.vitepress/theme/guidePages'
</script>

# 新手指南



## 为什么做这个网站？

清风我当过一段时间的 IT 经理，同部门有一位编程高手。

我们一起合作过很多系统——自己开发的、外面买来实施的——各种网站、ITSM、计划管理、合同管理、成本管理、人力资源管理……  自己开发的往往是最好用的，生命周期最长的，当然也是最省钱的。

每次开发新系统，都是我来收集需求、做分析、写功能规划，程序员同事负责数据结构和编码，一起测试，最后我再来做培训，出教材，在公司内部推动上线使用。

后来到了新单位，在各种业务部门横跳，场景更多了，有想法，但没有程序员搭档，很多念头就搁在那了。

直到遇到 Codex。一用之下，惊为天人。



::: tip 真的太好用了。
**"Codex 让我仿佛那个程序员搭子又回来了。"**
:::

 

- 如果你是业务熟手，对自己领域很了解，但不会写代码

- 如果你有一个具体的想法想落地，但过去必须依赖程序员才能实现

- 如果你有某个效率很低的场景，想用信息化或 AI 来改善

**这个网站就是为你做的**。这里记录的，是普通人用 Codex 把脑子里的东西做出来的真实过程。

## 学习路线图

```
Phase 0  理解概念        什么是AI编程？Codex 是什么角色？
   ↓
Phase 1  环境搭建        注册账号 → 下载安装 → 熟悉界面
   ↓
Phase 2  上手实战        第一次对话 → 做一个网页 → 学会批注
   ↓
Phase 3  工具扩展        插件 → Skill → 自动化 → 定时任务
   ↓
Phase 4  工程化落地      AGENTS.md → DESIGN.md → Goals → 快速发布 → 完整系统
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
    <tr>
      <td>01</td>
      <td><a href="/guide/">学习路线图</a></td>
      <td>为什么做这个网站，以及从 0 开始学习 Codex 的路线图</td>
    </tr>
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

- 想看别人怎么用 → [精选案例](/cases/)
- 想提升效率 → [实用技巧](/tips/)
- 想扩展能力 → [插件与技能](/plugins/)
