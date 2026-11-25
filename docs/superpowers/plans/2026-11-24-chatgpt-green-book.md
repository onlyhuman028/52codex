# 《ChatGPT绿皮书》Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 52codex 的全部读者内容（首页网络热帖除外）整理为可导入飞书并由飞书导出 PDF 的《ChatGPT绿皮书》Markdown。

**Architecture:** 用一份可重复执行的本地生成脚本读取既有 Markdown，按明确清单清洗 frontmatter、VitePress 容器、站内链接和图片路径，合并为一个标准 Markdown 文件。生成流程不修改原文章；中间清单和审计文件留在 `tmp/pdfs/`，最终 Markdown 与可选封面图写入 `output/markdown/`。

**Tech Stack:** Python 3 标准库、项目现有 Markdown/图片、ImageMagick 或 macOS 图像工具（仅用于可选封面图）。

**Spec:** `docs/superpowers/specs/2026-11-24-chatgpt-green-book-design.md`

## Global Constraints

- 不修改 `AGENTS.md`、`DESIGN.md`、原始文章、`.vitepress/dist`、`.vitepress/cache`、`node_modules` 或 `.npm-cache`。
- 不新增 npm 依赖、UI 组件库、Tailwind、localStorage 或 sessionStorage。
- 书名固定为《ChatGPT绿皮书》，作者固定为“清风”，文字封面和可选封面图不得出现二维码。
- 收录读者内容，唯一业务内容排除项是“网络热帖”；工程与后台文件不作为读者内容。
- 保留原文和图片，不编造内容；重复文章只排一次。
- 不把用户现有的未提交修改纳入本任务提交，也不擅自提交 Git。

## Review Focus

- Markdown 图片路径可能是相对路径或站点绝对路径：生成前必须解析并报告任何缺失图片。
- 中文、英文、代码和 Emoji 混排：打印后必须确认无方框、乱码或字体缺失。
- 超长代码、Prompt 和表格：必须换行或横向滚动式裁切保护，不能越出版心。
- 同文重复出现在案例与插件栏目：正文只出现一次，目录仍保持合理归类。
- 飞书不保证保留自定义 CSS 和分页：主文件必须只依赖标准 Markdown，导入后仍完整可读。

---

### Task 1: 建立内容清单与静态校验

**Files:**
- Create: `tmp/pdfs/book_manifest.json`
- Create: `tmp/pdfs/source_audit.txt`

**Interfaces:**
- Consumes: 项目根目录下读者可见的 Markdown 与图片。
- Produces: 有序章节清单、去重映射、图片解析结果和排除项报告。

- [ ] **Step 1:** 读取导航配置与栏目目录，确定首页、guide、tips、cases、plugins、resources 和 FAQ 的展示顺序。
- [ ] **Step 2:** 将首页网络热帖、后台管理页、工程说明和构建文件写入明确排除清单。
- [ ] **Step 3:** 以规范化正文哈希和已知重复路径检测重复文章，只保留一份正文。
- [ ] **Step 4:** 解析所有 Markdown 图片路径，生成缺失图片列表；预期为 0 个无法解释的缺失项。
- [ ] **Step 5:** 输出清单和审计报告，人工核对章节数量与原始文件数量。

### Task 2: 生成飞书兼容 Markdown

**Files:**
- Create: `tmp/pdfs/build_green_book.py`
- Create: `output/markdown/ChatGPT绿皮书.md`

**Interfaces:**
- Consumes: Task 1 的 `book_manifest.json`。
- Produces: 单文件 Markdown，图片使用站点 HTTPS 绝对地址。

- [ ] **Step 1:** 实现 frontmatter、重复 H1、VitePress 容器、复杂 HTML、站内链接和图片路径的安全转换。
- [ ] **Step 2:** 实现文字封面、使用说明、前言、可点击目录、章节分隔和正文模板。
- [ ] **Step 3:** 将正文图片改写为已发布的 HTTPS 构建资源；尚未发布的少量本地图片以内嵌 data URI 保留，继续保持单文件交付，并保留标准 Markdown 表格、代码块和 Prompt。
- [ ] **Step 4:** 运行生成脚本，检查书名、作者、章节标题、图片数量和“网络热帖”排除断言。
- [ ] **Step 5:** 检查输出不包含 frontmatter、Vue 组件、脚本标签和未闭合代码围栏。

### Task 3: 生成可选封面图

**Files:**
- Create: `output/markdown/ChatGPT绿皮书封面.png`

**Interfaces:**
- Consumes: 已确认的书名、作者和绿色视觉要求。
- Produces: 可由用户在飞书中插入首页的高分辨率封面 PNG。

- [ ] **Step 1:** 制作 A4 比例封面，使用左侧深绿色带、奶油白底、鼠尾草绿信息块和暖金细节。
- [ ] **Step 2:** 写入《ChatGPT绿皮书》、副标题、作者“清风”、版本日期与五部分导航，不放二维码。
- [ ] **Step 3:** 渲染 PNG 并检查中文字形、对齐、裁切和色彩对比度。

### Task 4: Markdown 完整性验收

**Files:**
- Create: `tmp/pdfs/markdown_audit.txt`

**Interfaces:**
- Consumes: Task 2 的 Markdown 和 Task 3 的封面图。
- Produces: 内容、结构和资源完整性验收记录。

- [ ] **Step 1:** 检查每个 manifest 条目都在正文中且只出现一次。
- [ ] **Step 2:** 检查图片链接全部为 HTTPS、没有本地相对路径或缺失源文件。
- [ ] **Step 3:** 检查代码围栏、VitePress 容器和复杂 HTML 已正确清洗。
- [ ] **Step 4:** 抽查封面、目录、每个章节开头、图片密集文章、Prompt 和表格。
- [ ] **Step 5:** 记录最终字数、行数、章节数、文章数、图片数和检查结论。

### Task 5: 最终工作区核对与交付

**Files:**
- Verify: `output/markdown/ChatGPT绿皮书.md`
- Verify: `output/markdown/ChatGPT绿皮书封面.png`

**Interfaces:**
- Consumes: Task 4 通过的 Markdown 与封面图。
- Produces: 可导入飞书的主文件、可选封面图和变更说明。

- [ ] **Step 1:** 运行 `git status --short`，确认原始文章和受保护目录没有被本任务改动。
- [ ] **Step 2:** 确认最终 Markdown 与封面图路径、文件大小和哈希，重新读取验证可用性。
- [ ] **Step 3:** 在交付说明中明确收录范围、排除项、文章/图片数量和未修改的用户文件。
