# AGENTS.md — 52codex.site

任何时候修改本AGENTS.md，必须取得用户明确同意。

## 项目

## 1. 项目定位

- 名称：我爱CodeX（52codex）
- 网址：www.52codex.site
- 定位：非程序员的 Codex 实战站
- 读者：不会编程、刚接触 Codex、想把传统管理、业务经验、思路/想法做成工具的非技术用户
- 口吻：清楚、实用、教程化；不写营销腔，不夸大效果

## 2. 技术栈

- VitePress
- 自定义 Vue 主题
- 自定义 CSS
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare KV 用于留言功能

当前未接入 Tailwind CSS；不要直接使用 Tailwind 工具类。若确需引入 Tailwind，先确认。

## 3.目录结构

- .vitepress/：VitePress 配置、主题、样式、构建相关文件
- .vitepress/theme/：Layout、HomePage、导航数据、评论组件、全站 CSS
- guide/：新手指南
- tips/：实用技巧
- cases/：精选案例
- plugins/：插件与技能
- resources/：资源集锦、微信页、留言管理页
- functions/api/：Cloudflare Pages Functions 接口
- public/：favicon、logo、OG 图、二维码等公共资源
- reference/：设计稿 HTML，不参与构建
- write_rules.md：文章撰写规则
- DESIGN.md：视觉规范
- faq.md ：常见问题
- coming-soon.md：占位页，未完成内容跳转到此
- 文件名用英文短横线命名（如 `auto-collect-posts.md`）
- 文章图片放同目录 assets/ 子文件夹（如 `cases/assets/文章名/`）
- 不新建顶级文件夹，不删除/重命名已有 .md

## 4.页面要点


- 首页：自定义 Vue 组件 `HomePage.vue`
- 首页板块：Hero、网络热帖、精选案例、上手指南、实用技巧、插件与技能、FAQ、Footer
- 全站布局：`Layout.vue` 控制导航、文章外壳、元信息、推荐阅读、留言、Footer
- 导航：一级导航固定；`guide`、`tips`、`cases`、`plugins` 的二级导航自动生成
- 详情页：Markdown + frontmatter
- Prompt 框：`::: tip Prompt` 渲染为深色 Prompt 块、绿色标签和复制按钮

## 5. 构建命令



```bash
npm run dev
npm run build
npm run preview
Cloudflare Pages：

构建命令：npm run build
输出目录：.vitepress/dist
Node：18+
只读任务不要运行 npm run build，因为它会更新 .vitepress/dist。

## 6. 内容流程

修改或撰写 `guide/`、`tips/`、`cases/`、`plugins/` 下的文章时，必须先阅读 `write_rules.md`，并把它作为唯一完整写作规范。

参考撰写时通用原则：

- 保留原文核心意思和顺序。
- 缺少素材时写 `待补充`，不要虚构。
- Prompt、图片、frontmatter、正文结构都以 `write_rules.md` 为准。
- 修改文章后，检查对应栏目 index 是否需要同步。
- 用户要求使用原作者时，在 frontmatter 和署名信息里保留原作者。

## 7 接口与部署

本项目不是纯静态站，包含 Cloudflare Pages Functions。

关键接口：
- `/api/comments`：留言提交与读取，依赖 Cloudflare KV
- `/api/comments-admin`：留言审核，依赖管理口令
- `/api/hot-posts`：首页网络热帖，必须保留 fallback 内容

规则：
- 不要把首页展示依赖到实时 API 成功。
- 不要在代码里写死密钥、token 或管理口令。
- 修改接口相关代码时，同时检查前端调用组件和 Cloudflare Pages 环境绑定。

## 8. 全站硬规则

-  任何时候修改本AGENTS.md，必须取得用户明确同意。
-  严格遵守 DESIGN.md。
- 不引入额外 npm 依赖（Tailwind 除外），需要时先问我
- 不引入 UI 组件库（Element / Ant Design 等）
- 不用 localStorage / sessionStorage
- 不修改 DESIGN.md 和 AGENTS.md
- reference/ 是设计参考，但不纳入构建
- 不擅自改已有文章的文字内容
- 不编造案例、数据、截图、结论
- 不编辑 .vitepress/dist、.vitepress/cache、node_modules、.npm-cache
