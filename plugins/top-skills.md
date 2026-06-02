---
title: Codex 十大必装 Skills：把常用工作流装进 Codex
description: 适合 Codex 新手和进阶用户收藏的 10 个 Skills 仓库，覆盖工程规范、前端检查、上下文管理、外部工具连接和技能灵感库。
tags: [Skill, 插件, 效率]
level: 2
date: 2026-06-02
---

# Codex 十大必装 Skills：把常用工作流装进 Codex

如果你已经开始用 Codex 做项目，很快会遇到一个问题：

同样的话，总要一遍遍提醒它。

比如“先看项目规范”“别乱改文件”“改完跑测试”“写计划再动手”“帮我检查页面可访问性”。这些要求当然可以每次手打，但更好的办法是把它们封装成 Skill。

Skill 可以理解成 Codex 的“能力包”。它不只是提示词，还可以包含流程、规则、参考资料、脚本和模板。装好以后，你就能用更稳定的方式让 Codex 重复执行一类任务。

下面这 10 个 Skills / Skills 仓库，适合先收藏，再按自己的使用场景安装。

## 先看怎么选

如果你是新手，建议先看这 3 类：

| 你想解决的问题 | 优先看 |
|---|---|
| Codex 改代码不够稳 | Superpowers、Vercel Agent Skills |
| 不知道怎么给 Codex 下指令 | SuperClaude Framework、MiniMaxSkills |
| 长项目容易丢上下文 | Planning with Files、Context Engineering Skills |

如果你已经在做真实项目，可以再看 Composio Skills、Antfu Skills 和 Awesome Agent Skills，把 Codex 扩展成更完整的工作助手。

## 01 Superpowers

来源：[obra/superpowers](https://github.com/obra/superpowers)

Superpowers 的重点不是“让 Codex 更会说”，而是让它更像一个认真负责的工程师。

它会把测试、实现、检查这些步骤变成固定流程，减少那种“表面能跑，细节有坑”的情况。对不懂代码的人来说，这类 Skill 很有价值，因为它会替你补上工程里的基本纪律。

适合：

- 让 Codex 改已有项目
- 担心它直接上手乱改
- 希望它先验证，再交付

## 02 SuperClaude Framework

来源：[SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)

SuperClaude Framework 更像一套常用指令菜单。

你不用每次都写很长的需求说明，而是通过一套约定好的命令，让 Codex 进入分析、修 bug、写代码、优化、写文档等不同工作模式。

适合：

- 经常让 Codex 做不同类型任务
- 想把复杂指令变成短命令
- 希望 Codex 的输出更稳定

## 03 MiniMaxSkills

来源：[MiniMax-AI/skills](https://github.com/MiniMax-AI/skills)

MiniMaxSkills 更像一组现成工作流模板。

它覆盖前端、全栈、移动端、文档写作等常见场景。新手最难的不是“不知道 Codex 能不能做”，而是“不知道该怎么开口让它做”。这类模板可以直接当参考。

适合：

- 不知道怎么拆任务的新手
- 想学习别人怎么写 Skill
- 需要前端、全栈、文档类工作流模板

## 04 Anthropic Official Skills

来源：[anthropics/skills](https://github.com/anthropics/skills)

这是官方示例技能库，最适合用来学习 Skill 的基本写法。

你可以把它当成“范文库”：看一个 Skill 应该包含哪些说明、怎么组织文件、如何让模型知道什么时候调用它。真正开始写自己的 Skill 之前，先看官方示例会省很多试错时间。

适合：

- 想自己写 Skill
- 想了解 Skill 的标准结构
- 想把别人的模板改成自己的工作流

## 05 Vercel Agent Skills

来源：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)

如果你经常让 Codex 做网页，Vercel Agent Skills 很值得看。

它把前端项目里常见的检查项整理成规则，比如页面结构、性能、可访问性、框架约定等。对 React、Next.js、VitePress 这类项目尤其有帮助。

适合：

- 做网站、落地页、前端工具
- 想让 Codex 主动检查页面质量
- 希望前端交付不只“看起来能打开”

## 06 Planning with Files

来源：[OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)

长项目最怕一件事：聊着聊着，前面定过的计划、限制、取舍全丢了。

Planning with Files 的思路是让 Codex 用 Markdown 文件记录计划、进度和上下文。这样项目不是只靠聊天记录往前滚，而是有一个可以反复查看的工作台账。

适合：

- 一次做不完的大项目
- 多轮迭代的网站、系统、自动化工具
- 希望 Codex 清楚知道“现在做到哪了”

## 07 Context Engineering Skills

来源：[muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

复杂项目里，真正影响 Codex 表现的不是单句 Prompt，而是上下文管理。

Context Engineering Skills 关注的是：什么信息该保留，什么该总结，什么时候该清理，怎样避免重复解释。它适合已经明显感受到“上下文太乱会拖慢项目”的用户。

适合：

- 多文件、多模块项目
- 需求经常变化的项目
- 想减少 Codex 跑偏和重复沟通

## 08 Composio Skills

来源：[ComposioHQ/skills](https://github.com/ComposioHQ/skills)

Composio Skills 的方向是把 Codex 接到更多外部工具上。

比如 GitHub、Notion、Slack、数据库等。这样 Codex 不只是写代码，还可以参与信息整理、工具操作和自动化流程。

适合：

- 想让 Codex 连接外部服务
- 有团队协作、知识库、数据库场景
- 希望把“写代码”和“办事情”连起来

## 09 Antfu Skills

来源：[antfu/skills](https://github.com/antfu/skills)

Antfu Skills 更适合进阶用户学习。

它的价值不只是直接安装使用，而是看优秀开发者怎么把自己的经验沉淀成可复用的 Skill。你会发现，好的 Skill 不是堆很多规则，而是把一个人长期形成的判断方式写清楚。

适合：

- 想学习高手的工作流设计
- 想写自己的专业 Skill
- 想提升 Codex 协作质量

## 10 Awesome Agent Skills

来源：[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

Awesome Agent Skills 是一个大型技能导航目录。

它不是单个 Skill，而是帮你发现更多公司、社区、个人整理出来的技能资源。等你知道自己缺什么能力时，可以到这里找灵感。

适合：

- 想持续发现新 Skill
- 想找某个具体场景的模板
- 想了解社区都在怎么扩展 AI Agent

## 我的安装建议

不要一口气装满。

更稳的顺序是：

1. 先装 1 个工程规范类 Skill，比如 Superpowers。
2. 再装 1 个指令模板类 Skill，比如 SuperClaude Framework 或 MiniMaxSkills。
3. 做长项目时，再加入 Planning with Files。
4. 等你开始写自己的工作流，再研究 Anthropic Official Skills、Antfu Skills 和 Awesome Agent Skills。

Skill 的价值不在于数量，而在于它是否真的解决了你每天重复遇到的问题。

## 一句话总结

如果你只是偶尔问 Codex 几个问题，不装 Skill 也能用。

但如果你已经开始让 Codex 做网站、改项目、写自动化、搭系统，那么 Skill 就是把“每次都要提醒它的话”变成固定能力。

这会让 Codex 更稳定，也会让你少操很多心。

本文根据 [X 原帖](https://x.com/wangfenganc/status/2060973813010210991)整理改写。
