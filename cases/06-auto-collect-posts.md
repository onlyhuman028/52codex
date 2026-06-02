---
title: 06 自动搜集公众号热帖
description: 用 Codex 的 Computer Use 控制微信搜一搜，定时抓取关键词热帖，自动整理成报告。
tags: [自动化, Computer Use]
level: 2
date: 2026-05-28
---

# 自动搜集公众号热帖

<div class="article-meta">
  <span class="level-badge lv2">Lv.2</span>
  <span class="tag-pill">自动化</span>
  <span class="tag-pill">Computer Use</span>
  <span class="date">2026-05-28 · 阅读约 8 分钟 · 额度消耗 ≈ 30%</span>
</div>

## 背景

做运营的同事每天要手动在微信搜一搜里搜"Codex"、"AI 编程"等关键词，浏览几十篇文章，筛选出有价值的内容整理成日报发到群里。每天重复操作至少 30 分钟。

这种**高频、重复、有固定流程**的任务，正是 Codex Computer Use 最擅长的场景。

## 成果

配置完成后，Codex 每天早上 9 点自动执行：打开微信 → 进入搜一搜 → 输入关键词 → 抓取前 10 条结果的标题和链接 → 整理成 Markdown 格式的日报 → 保存到指定文件夹。

## 操作路径

### Step 1：安装 Computer Use 插件

打开 Codex 桌面 App，进入设置 → 电脑使用，安装 Computer Use 插件。安装完成后需要给 Codex 屏幕录制和辅助功能权限。

### Step 2：创建项目和线程

新建一个项目（比如叫"每日热帖"），选一个本地文件夹存放输出文件。然后新建一个线程，开始对话。

### Step 3：输入 Prompt

::: tip Prompt
使用 computer use，打开微信搜一搜，查找过去 1 天关键字"codex"相关的热帖。

请搜集前 10 条结果，记录每条的：
1. 标题
2. 来源公众号
3. 发布时间
4. 链接

整理成 Markdown 格式，保存到项目文件夹的 daily-report.md 文件中。
:::

### Step 4：授权和等待

如果你选的是默认权限，Codex 每一步操作都会找你确认。建议改成"自动审查"模式，让它自主判断权限需求。整个过程大约需要 5-10 分钟。

Codex 会虚拟一个鼠标，像人一样操作——打开微信、点击搜一搜、输入文字、滚动页面、截取信息。全程可以在 Codex 界面看到它的操作画面。

### Step 5：设置定时任务

在 Codex 的 Automations 功能中创建一个定时任务，设置为每天早上 9:00 执行。这样每天醒来就有一份整理好的热帖日报等着你。

## 进阶 Prompt

如果你想做得更精细，可以用这个增强版：

::: tip Prompt · 进阶
使用 computer use，执行以下任务：

1. 打开微信，进入"搜一搜"
2. 分别搜索关键词：codex, AI编程, vibe coding
3. 每个关键词取前 5 条结果
4. 去重（按标题判断）
5. 按发布时间倒序排列
6. 输出格式：
   ## yyyy-MM-dd Codex 每日热帖
   | 序号 | 标题 | 来源 | 时间 |
   每条附带链接
7. 保存为 reports/yyyy-MM-dd.md
8. 如果搜索过程中遇到弹窗或异常，截图保存到 errors/ 文件夹
:::

## 踩过的坑

### 1. 微信搜一搜加载慢

Codex 有时候操作太快，页面还没加载完就开始点击。解决方案：在 Prompt 里加一句"每次操作后等待 3 秒再进行下一步"。

### 2. 额度消耗比预期高

Computer Use 因为要做屏幕识别，额度消耗大约是普通对话的 3-5 倍。建议用 Pro 账号，或者把搜索关键词减少到 1-2 个。

### 3. 微信偶尔弹广告弹窗

在 Prompt 里加上异常处理指令：`如果遇到弹窗，先关闭弹窗再继续操作`。Codex 能识别并处理大多数弹窗。

## 可复用的 Skill

你可以把这个流程封装成一个 Skill，这样以后只需要说"执行每日热帖搜集"就自动跑起来：

```json
{
  "name": "daily-hot-posts",
  "description": "搜集微信搜一搜热帖并生成日报",
  "triggers": ["每日热帖", "搜集热帖"],
  "requires": ["computer-use"],
  "steps": "见上方进阶 Prompt"
}
```

## 下一步扩展

- 把搜集范围扩展到 X、知乎、B站（每个平台一个 Skill）
- 加上 AI 摘要功能——搜集完后让 Codex 给每篇文章写一句话摘要
- 输出到飞书文档（结合飞书 MCP 插件）
- 做一个简单的 Web 页面展示历史日报（这又是一个 Lv.1 案例）
