---
title: 07 GPT Codex能够控制电脑了！
description: 介绍 Codex 桌面版电脑控制能力，说明如何在 macOS 上安装 Computer MCP、打开内置浏览器，并理解后台操作、多 Agent 并行和手机遥控等新功能。
tags: [Codex, Computer Use, 自动化]
level: 2
date: 2026-06-02
---

GPT Codex能够控制电脑了！

GPT Codex能够控制你的电脑了！

可以实现：

目前只有苹果版有这个新功能，Windows要等一下。

1. 打开 https://chatgpt.com/zh-Hans-CN/codex/get-started/ 下载 Codex APP

![image](https://files.mdnice.com/user/67011/576f9a56-5ff9-41d2-81f8-bfb232c3eabb.png)


2. 点开设置 → 电脑使用 ，安装 Computer Mcp，然后就能够开始控制电脑了

![image](https://files.mdnice.com/user/67011/1c4d004c-1c8e-491b-b403-9e318b71e395.png)



打开 codex，点击左上角的 codex




我真是大开眼界。它能做自动检测修复电脑配置，网络配置，非常省事。都是自动的

----

截至 **2026 年 4 月 19 日**，Codex 最新一轮大更新是 OpenAI 在 **2026 年 4 月 16 日**发布的 **“Codex for (almost) everything”**。重点是：Codex 从“写代码助手”进一步变成“能参与完整软件开发流程的桌面工作代理”。

主要新增功能如下：

1. **后台控制电脑 / 操作桌面 App**
   - Codex 可以在 macOS 上通过“看、点、输入”来操作电脑上的应用。
   - 多个 Codex agent 可以并行工作，不影响你自己操作其他 App。
   - 适合前端调试、App 测试、没有 API 的桌面软件操作等场景。
   - 目前电脑控制能力 **首先支持 macOS**，部分地区逐步开放。

2. **内置浏览器**
   - Codex App 现在有 in-app browser。
   - 你可以直接在网页上评论、标注，让 Codex 更精确地理解要改哪里。
   - 对前端页面、游戏、localhost 应用调试很有用。

3. **图片生成与迭代**
   - Codex 可以调用 `gpt-image-1.5` 生成和修改图片。
   - 可用于产品概念图、前端设计、mockup、游戏素材等。
   - 这意味着它不只是改代码，也能参与视觉资产制作。

4. **90 多个新增插件**
   - 新增大量插件，结合 skills、App 集成和 MCP server。
   - OpenAI 官方提到的例子包括 Atlassian Rovo、CircleCI、CodeRabbit、GitLab Issues、Microsoft Suite、Neon、Remotion、Render 等。
   - 目标是让 Codex 能从更多工具里取上下文、执行操作。

5. **GitHub Review 评论处理**
   - Codex App 新增对 GitHub review comments 的处理支持。
   - 更适合让它根据 PR 评论直接修改代码、回应 review。

6. **多个终端 Tab**
   - App 内可以运行多个 terminal tabs。
   - 对同时跑 dev server、测试、构建、日志观察更方便。

7. **远程 devbox SSH 连接，Alpha**
   - Codex App 支持通过 SSH 连接远程开发环境，目前是 alpha。
   - 对云开发机、远程服务器开发场景有帮助。

8. **侧边栏富文件预览**
   - 可以直接在 sidebar 打开文件。
   - 支持 PDF、表格、幻灯片、文档等 rich previews。
   - 不只是代码文件，需求文档、设计文档也能纳入工作上下文。

9. **Summary Pane 总结面板**
   - 新增 summary pane，用来跟踪 agent 的计划、来源、产物。
   - 更容易看 Codex 当前在做什么、基于什么资料做、产出了什么。

10. **自动化增强**
   - Automations 可以复用已有对话线程，保留之前积累的上下文。
   - Codex 可以安排未来任务，并在之后自动唤醒继续长期任务。
   - 官方举例是跨几天或几周推进长期工作。

11. **Memory 记忆功能预览**
   - Codex 可以记住偏好、纠正记录、之前花时间收集的信息。
   - 目的是减少重复说明，让后续任务更快达到你想要的质量。
   - 个性化能力包括 memory 和 context-aware suggestions，会逐步向 Enterprise、Edu、EU/UK 用户开放。

12. **主动建议下一步工作**
   - Codex 可以根据项目、插件和记忆，主动建议你从哪里继续。
   - 比如识别 Google Docs 里的未处理评论、拉取 Slack/Notion/代码库上下文，然后给你优先级列表。

**和你现在最相关的结论：**

如果你用的是 **Codex 桌面 App + ChatGPT 登录**，这次更新最值得关注的是：

- macOS 上的电脑控制
- 内置浏览器
- 图片生成
- 多终端
- GitHub review 处理
- 自动化和记忆
- 插件能力扩展

如果你只是用 CLI，很多桌面控制、内置浏览器、文件预览这些能力主要是在 **Codex App** 里体现。

来源：
- OpenAI 官方发布：[Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/)
- OpenAI ChatGPT Release Notes：[ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- The Verge 报道：[OpenAI’s big Codex update is a direct shot at Claude Code](https://www.theverge.com/ai-artificial-intelligence/913034/openai-codex-updates-use-macos)
- TechRadar 报道：[Codex can now operate your computer alongside you](https://www.techradar.com/pro/codex-can-now-operate-your-computer-alongside-you-openai-takes-major-shot-at-claude-code-with-major-workplace-updates)
