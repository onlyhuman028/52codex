---
title: 01 十个Codex项目规范Skills 
description: 这是一份面向 Codex 新手和进阶用户的 Skills 推荐清单，整理 10 个常用技能仓库，覆盖工程规范、前端检查、上下文管理、外部工具连接和技能模板。
tags: [Codex, Skill, 插件]
level: 2
date: 2026-06-02
author: 王峰Anc
authorLink: https://x.com/wangfenganc

---

# Codex 十大必装 Skills 怎么选？新手常用技能清单

![Codex 十大必装 Skills 麦肯锡风格信息图](/plugins/assets/top-skills/top-skills-mckinsey.svg)

很多人刚开始用 Codex 时，都会遇到同一个问题：

同样的话，总要一遍遍提醒它。

比如：

- 先看项目规范
- 不要乱改无关文件
- 改完以后跑测试
- 先写计划，再动手改
- 帮我检查页面性能和可访问性

这些要求当然可以每次手动输入，但更好的方式是把它们整理成 Skill。

Skill 可以理解成 Codex 的能力包。它不只是提示词，还可以包含流程、规则、参考资料、脚本和模板。装好以后，你就能用更稳定的方式，让 Codex 重复执行同一类任务。

这篇文章根据 [X 原帖](https://x.com/wangfenganc/status/2060973813010210991)整理改写，适合先收藏，再按自己的使用场景安装。

## 适合谁

这篇文章适合这几类用户：

- 刚开始用 Codex，不知道 Skill 有什么用
- 经常让 Codex 改项目，但担心它改错文件
- 想让 Codex 先计划、再执行、最后检查
- 想把常用提示词和工作流变成可复用能力
- 想找一些社区里已经整理好的 Skill 模板

如果你只是偶尔问 Codex 几个问题，不一定需要马上装 Skill。

但如果你已经开始让 Codex 做网站、改项目、写自动化、搭系统，那么 Skill 会很有帮助。

## 这篇文章解决什么问题

看完这篇文章，你会知道：

- Skill 大概能解决哪些问题
- 新手应该优先看哪几类 Skill
- 10 个常用 Skill 仓库分别适合什么场景
- 不想一次装太多时，应该按什么顺序选择

这里不会承诺“装完效率一定提升多少倍”。Skill 的价值取决于你的任务类型、项目复杂度和使用频率。

## 准备工作

在安装或使用这些 Skill 之前，建议先准备好三件事：

1. 已经能正常打开 Codex。
2. 知道自己最常让 Codex 做哪类任务。
3. 有一个真实项目可以测试，而不是只在空白对话里试用。

如果你还不知道 Skill 和插件有什么区别，可以先看下一步推荐阅读里的入门文章。

## 先看怎么选

不要一开始就把所有 Skill 都装上。

更好的方式，是先按自己的痛点选。

| 你想解决的问题 | 优先看 |
|---|---|
| Codex 改代码不够稳 | Superpowers、Vercel Agent Skills |
| 不知道怎么给 Codex 下指令 | SuperClaude Framework、MiniMaxSkills |
| 长项目容易丢上下文 | Planning with Files、Context Engineering Skills |
| 想连接外部工具 | Composio Skills |
| 想学习怎么写自己的 Skill | Anthropic Official Skills、Antfu Skills、Awesome Agent Skills |

下面按清单逐个介绍。

## 01 Superpowers

仓库：[obra/superpowers](https://github.com/obra/superpowers)

Superpowers 的重点不是让 Codex 更会聊天，而是让它更像一个认真负责的工程师。

它会把测试、实现、检查这些步骤整理成固定流程，减少“表面能跑，但细节有坑”的情况。对不懂代码的人来说，这类 Skill 很有价值，因为它会替你补上一部分工程纪律。

适合：

- 让 Codex 修改已有项目
- 担心 Codex 直接上手乱改
- 希望 Codex 先验证，再交付

## 02 SuperClaude Framework

仓库：[SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)

SuperClaude Framework 更像一套常用指令菜单。

你不用每次都写很长的需求说明，而是通过一套约定好的命令，让 Codex 进入分析、修 bug、写代码、优化项目、生成文档等不同工作模式。

适合：

- 经常让 Codex 做不同类型任务
- 想把复杂指令变成短命令
- 希望 Codex 的输出更稳定

## 03 MiniMaxSkills

仓库：[MiniMax-AI/skills](https://github.com/MiniMax-AI/skills)

MiniMaxSkills 更像一组现成的工作流模板。

它覆盖前端、全栈、移动端和文档写作等常见场景。新手最难的不是“不知道 Codex 能不能做”，而是“不知道该怎么开口让它做”。这类模板可以直接当参考。

适合：

- 不知道怎么拆任务的新手
- 想学习别人怎么写 Skill
- 需要前端、全栈、文档类工作流模板

## 04 Anthropic Official Skills

仓库：[anthropics/skills](https://github.com/anthropics/skills)

这是官方示例技能库，最适合用来学习 Skill 的基本写法。

你可以把它当成范文库：看一个 Skill 应该包含哪些说明、怎么组织文件、如何让模型知道什么时候调用它。真正开始写自己的 Skill 之前，先看官方示例会省很多试错时间。

适合：

- 想自己写 Skill
- 想了解 Skill 的标准结构
- 想把别人的模板改成自己的工作流

## 05 Vercel Agent Skills

仓库：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)

如果你经常让 Codex 做网页，Vercel Agent Skills 很值得看。

它把前端项目里常见的检查项整理成规则，比如页面结构、性能、可访问性和框架约定等。对 React、Next.js、VitePress 这类项目尤其有帮助。

适合：

- 做网站、落地页、前端工具
- 想让 Codex 主动检查页面质量
- 希望前端交付不只停留在“能打开”

## 06 Planning with Files

仓库：[OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)

长项目最怕一件事：聊着聊着，前面定过的计划、限制和取舍全丢了。

Planning with Files 的思路是让 Codex 用 Markdown 文件记录计划、进度和上下文。这样项目不是只靠聊天记录往前滚，而是有一个可以反复查看的工作台账。

适合：

- 一次做不完的大项目
- 多轮迭代的网站、系统、自动化工具
- 希望 Codex 清楚知道现在做到哪一步

## 07 Context Engineering Skills

仓库：[muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

复杂项目里，真正影响 Codex 表现的不是单句 Prompt，而是上下文管理。

Context Engineering Skills 关注的是：什么信息该保留，什么该总结，什么时候该清理，怎样避免重复解释。它适合已经明显感受到“上下文太乱会拖慢项目”的用户。

适合：

- 多文件、多模块项目
- 需求经常变化的项目
- 想减少 Codex 跑偏和重复沟通

## 08 Composio Skills

仓库：[ComposioHQ/skills](https://github.com/ComposioHQ/skills)

Composio Skills 的方向是把 Codex 接到更多外部工具上。

比如 GitHub、Notion、Slack、数据库等。这样 Codex 不只是写代码，还可以参与信息整理、工具操作和自动化流程。

适合：

- 想让 Codex 连接外部服务
- 有团队协作、知识库、数据库场景
- 希望把写代码和日常工具操作连起来

## 09 Antfu Skills

仓库：[antfu/skills](https://github.com/antfu/skills)

Antfu Skills 更适合进阶用户学习。

它的价值不只是直接安装使用，而是看优秀开发者怎么把自己的经验沉淀成可复用的 Skill。你会发现，好的 Skill 不是堆很多规则，而是把长期形成的判断方式写清楚。

适合：

- 想学习高手的工作流设计
- 想写自己的专业 Skill
- 想提升 Codex 协作质量

## 10 Awesome Agent Skills

仓库：[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

Awesome Agent Skills 是一个大型技能导航目录。

它不是单个 Skill，而是帮你发现更多公司、社区、个人整理出来的技能资源。等你知道自己缺什么能力时，可以到这里找灵感。

适合：

- 想持续发现新 Skill
- 想找某个具体场景的模板
- 想了解社区都在怎么扩展 AI Agent

## 建议安装顺序

如果你不知道从哪里开始，可以按这个顺序来：

1. 先看 1 个工程规范类 Skill，比如 Superpowers。
2. 再看 1 个指令模板类 Skill，比如 SuperClaude Framework 或 MiniMaxSkills。
3. 做长项目时，再研究 Planning with Files。
4. 需要前端质量检查时，再看 Vercel Agent Skills。
5. 等你想写自己的工作流，再看 Anthropic Official Skills、Antfu Skills 和 Awesome Agent Skills。

Skill 的价值不在于数量，而在于它是否真的解决了你每天重复遇到的问题。

## 常见问题

### 这些 Skill 都必须安装吗？

不需要。

建议先选 1 到 2 个和自己当前任务最相关的 Skill。一次装太多，反而不容易判断哪个真的有用。

### Skill 和插件有什么区别？

可以简单理解为：

- Skill 更像一套做事方法，重点是提示词、流程、规则和模板。
- 插件更像外部能力连接，重点是让 Codex 操作浏览器、电脑、文档、数据库或其他工具。

两者可以配合使用。

### 新手最适合先看哪个？

如果你经常让 Codex 改项目，可以先看 Superpowers。

如果你不知道怎么给 Codex 下指令，可以先看 SuperClaude Framework 或 MiniMaxSkills。

如果你正在做一个长期项目，可以先看 Planning with Files。

## 下一步推荐阅读

- [插件与技能总览](/plugins/)
- [Codex 的 Skill 和插件怎么用](/guide/07-skills-and-plugins)
- [AGENTS.md 怎么写](/tips/04-agents-md)
- [Codex 的 /goal 怎么用](/tips/05-goals)

