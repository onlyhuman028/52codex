# AGENTS.md — 52codex.site

## 项目

- 名称：我爱CodeX（52codex），网址 www.52codex.site
- 定位：非程序员的 Codex 实战站
- 技术栈：VitePress + Tailwind CSS + Cloudflare Pages
- 视觉规范：严格遵守 DESIGN.md
- 设计稿：reference/ 下的两个 HTML 是最终设计，VitePress 实现需还原其效果（reference/ 不参与构建）

## 目录结构

```
.vitepress/         配置与主题（config.ts / theme/）
cases/              实战案例，每篇一个 .md
guide/              新手指南
tips/               高频技巧
plugins/            插件精选
resources/          资源集锦
faq.md              常见问题
coming-soon.md      占位页，未完成内容跳转到此
public/             仅 favicon / logo
reference/          设计稿 HTML，不参与构建
```

- 文件名用英文短横线命名（如 `auto-collect-posts.md`）
- 文章图片放同目录 assets/ 子文件夹（如 `cases/assets/文章名/`）
- 不新建顶级文件夹，不删除/重命名已有 .md

## 页面要点

- **首页**是自定义 Vue 组件（HomePage.vue），8 个板块：Hero、网络热帖、实战案例、新手指南、高频技巧、插件精选、FAQ、Footer
- **导航栏**含下拉菜单（实战案例/新手指南/高频技巧/插件精选 四个有下拉，资源集锦/FAQ 直链），移动端汉堡菜单
- **详情页**用 Markdown，frontmatter 含 title/description/tags/level/date
- **Prompt 框**用自定义容器 `::: tip Prompt`，需定制为深色背景 + 绿标签 + 复制按钮（不用默认 tip 样式）

## 构建

```bash
npm run dev      # 本地开发
npm run build    # 构建，输出 .vitepress/dist
```

Cloudflare Pages：构建命令 `npm run build`，输出目录 `.vitepress/dist`，Node 18+

## 撰写

按照write_rules.md 格式撰写具体栏目下的文章。

## 禁止

- 不引入额外 npm 依赖（Tailwind 除外），需要时先问我
- 不引入 UI 组件库（Element / Ant Design 等）
- 不用 localStorage / sessionStorage
- 不修改 DESIGN.md 和 AGENTS.md
- 不把 reference/ 的 HTML 纳入构建
- 不擅自改已有文章的文字内容
