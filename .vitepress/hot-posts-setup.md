# 热帖数据配置

在 Cloudflare Pages 项目的 Settings → Variables and Secrets 中配置，生产和预览环境分别设置。密钥使用 Secret 类型，配置后重新部署。仓库不保存密钥。

## X 人工精选

X 栏改为人工选定的三篇原帖，内容维护在 `.vitepress/theme/hot-posts-data.mjs` 的 X 分组中。编辑标题、作者、原帖日期和链接，保存后提交、推送并等待 Cloudflare Pages 部署。

- 按人工选入顺序展示，不自动替换、重新排序或按 7 天淘汰。
- 卡片明确标注“人工精选”，不显示“最近 7 天”“本周热度”或接口失败提示。
- 标题为中文编辑标题，作者和日期通过 X 的公开嵌入信息核实（嵌入日期采用 UTC）。第三篇标题同时参考链接对应的公开转载。没有核实的浏览、点赞等数字不展示。
- 前后端共用这一份精选。收到旧 API 或 CDN 数据时，前端仍保留当前人工选定的三篇。
- `/api/hot-posts` 不再调用 X 官方搜索或 SocialData。旧 `X_PROVIDER`、`SOCIALDATA_API_KEY`、`X_BEARER_TOKEN`、`X_SEARCH_QUERY` 和固定 ID 配置不再用于 X 栏，不需要为它新增或更换密钥。
- “查看更多”提供通用 Codex 搜索入口，不用固定日期限制人工精选。

当前选入：

1. https://x.com/thsottiaux/status/2106845241357824205
2. https://x.com/liyue_ai/status/2105937541732200691
3. https://x.com/miles_mazy/status/2091339513134010554

## 其他平台

- GitHub：可选 Secret `GITHUB_TOKEN`，仅用于提高读取限额。筛选中文介绍且最近 7 天有更新的 Codex 项目，累计 stars 按更新时间衰减后排序。stars 是累计收藏，并非本周新增。
- B站：无需密钥，获取播放量排序的候选视频，再按发布时间与中文标题筛选。平台限制请求时显示历史精选。
- Reddit：无需密钥，从 r/codex 本周高分候选中筛选中文标题。中文候选不足或接口不可用时显示历史精选，旧英文精选采用中文译题。
- YouTube：Secret `YOUTUBE_API_KEY`；可选 `YOUTUBE_SEARCH_QUERY` 或 `YOUTUBE_VIDEO_IDS`。筛选最近 7 天的中文标题，用视频介绍辅助判断内容价值，按播放量和时效排序。

热度仅表示各平台返回候选中的排序，不代表全网完整榜单。中文判断为标题/正文含汉字，不使用机器翻译生成实时标题。每个平台最多展示 3 条，不以历史精选补足实时榜单。以下自动筛选和热度规则仅用于 GitHub、B站、Reddit 与 YouTube，不作用于 X 人工精选。

## 内容筛选与热度规则

参考 AIHOT 的“先筛选内容，再计算热度”，本站保留原帖卡片，使用 `.vitepress/theme/hot-posts-rules.mjs` 的本地规则，不增加模型调用、密钥或依赖。

- Codex 必须是具体讨论对象。教程、入门、实战、工作流、Prompt / Skills、配置方法、具体应用案例及功能、模型、价格、额度等更新可以入选。仅在列表中提及 Codex、泛泛夸赞或推广引流不入选。
- 有求助、报错或纯抱怨等内容时，必须同时提供解决方法、步骤或已解决的说明；“有没有完整教程”“求解决方法”不算提供答案。Reddit 正文和 YouTube 介绍可辅助筛选，展示标题仍使用原文。
- 内容信号需出现在讨论 Codex 的句子附近；其他话题的教程、经验或解决方法不能替顺带提及的 Codex 加分。这是启发式筛选，仍可能漏掉好内容或误判，不能当作人工或模型语义审核。
- 最近 7 天内的候选通过筛选后，热度每 24 小时减半：`平台热度 × 2^(-小时数 / 24)`。GitHub 使用最近更新时间，其余使用发布时间。
- B站 / YouTube 使用播放量，Reddit 使用净赞，GitHub 使用累计 stars，均在各自平台内衰减排序，不跨平台比较。
- 同链接只展示一次。同一作者的实质相同标题（规范化后至少 16 字符，完全相同或双字片段相似度达到 90%）只保留排序靠前的一条。视频介绍不参与去重，避免频道共用说明把不同教程合并。不同作者的相同事件暂不聚合，不宣称独立来源数量。
- 合格实时内容不足 3 条就少展示；没有合格候选或接口不可用时，展示明确标注的历史精选。

算法更新使用新的缓存版本，避免部署后继续命中上一版的筛选结果。现有 Cloudflare 环境变量和绑定无需调整，发布代码后生效。

## 可用性与验证

前后端共用 `.vitepress/theme/hot-posts-data.mjs` 中的一份历史精选。历史精选不标注“最近 7 天”或“本周热帖”；X 人工精选独立标注，不参与时效过滤。

单次外部请求 3.5 秒超时（包含响应体），每个平台总预算 6.5 秒，浏览器接口请求 8 秒。超时会取消请求并回退，各平台并行处理。其他平台有实时内容时缓存 15 分钟；只有 X 人工精选及其他平台历史精选时缓存 1 分钟。读取缓存时会重新排除其他平台超过 7 天的实时内容。

热帖接口不需要新增 KV 绑定，既有 COMMENTS_KV / KV 与留言管理配置不变。`npm run dev` 只运行 VitePress，不执行 Pages Functions；接口联调需要 Cloudflare Pages 预览/生产环境。

运行回归检查：`node --test .vitepress/hot-posts.test.mjs`。页面构建与 Functions 打包应分别验证。X 人工精选不依赖任何凭据；其他平台仍需分别验证回退与实时数据行为。

来源：

- https://github.com/KKKKhazix/AIHOT/blob/main/docs/sources.md
- https://github.com/KKKKhazix/AIHOT/blob/main/docs/selection.md
- https://github.com/KKKKhazix/AIHOT#聚簇与热点
- https://github.com/KKKKhazix/AIHOT/blob/main/.env.example
- https://publish.twitter.com/oembed
- https://bittide.aicompass.dev/article/83ae0a55-5013-4607-9415-fa82432f1ece?locale=zh
