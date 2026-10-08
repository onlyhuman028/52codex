# 热帖数据配置

在 Cloudflare Pages 项目的 Settings → Variables and Secrets 中配置，生产和预览环境分别设置。密钥使用 Secret 类型，配置后重新部署。仓库不保存密钥。

## X 数据来源（二选一）

- 官方接口：`X_PROVIDER=official`（默认），Secret 为 `X_BEARER_TOKEN`。该账号必须具备最近 7 天搜索接口的访问权限和可用额度。
- SocialData：`X_PROVIDER=socialdata`，Secret 为 `SOCIALDATA_API_KEY`。使用 https://api.socialdata.tools/twitter/search，按该服务的价格计费。只有明确选择 socialdata 才会调用，不会自动切换付费供应商。

AIHOT 的开源配置也采用 SocialData。本站直接使用自己的凭据，不依赖 AIHOT 网站、私有数据或账号。

可选 `X_SEARCH_QUERY` 自定义关键词。默认只搜索中文 Codex 原帖，自动更新日期；固定的 since/until 操作符会被移除。接口返回后再次检查中文、Codex、最近 7 天、非未来时间、内容价值、互动指标及非转发/回复。浏览量本身不能让 X 帖子入选。

官方接口兼容原有固定 ID 模式：`X_POST_SOURCE=ids` 与 `X_POST_IDS`（逗号分隔，最多 10 条）。旧 `X_SOURCE_MODE` / `X_USE_POST_IDS` 开关仍支持。固定 ID 同样必须通过时效与互动筛选，不会把过期文章标成近期热帖。SocialData 使用搜索模式。

## 其他平台

- GitHub：可选 Secret `GITHUB_TOKEN`，仅用于提高读取限额。筛选中文介绍且最近 7 天有更新的 Codex 项目，累计 stars 按更新时间衰减后排序。stars 是累计收藏，并非本周新增。
- B站：无需密钥，获取播放量排序的候选视频，再按发布时间与中文标题筛选。平台限制请求时显示历史精选。
- Reddit：无需密钥，从 r/codex 本周高分候选中筛选中文标题。中文候选不足或接口不可用时显示历史精选，旧英文精选采用中文译题。
- YouTube：Secret `YOUTUBE_API_KEY`；可选 `YOUTUBE_SEARCH_QUERY` 或 `YOUTUBE_VIDEO_IDS`。筛选最近 7 天的中文标题，用视频介绍辅助判断内容价值，按播放量和时效排序。

热度仅表示各平台返回候选中的排序，不代表全网完整榜单。中文判断为标题/正文含汉字，不使用机器翻译生成实时标题。每个平台最多展示 3 条，不以历史精选补足实时榜单。

## 内容筛选与热度规则

参考 AIHOT 的“先筛选内容，再计算热度”，本站保留原帖卡片，使用 `.vitepress/theme/hot-posts-rules.mjs` 的本地规则，不增加模型调用、密钥或依赖。

- Codex 必须是具体讨论对象。教程、入门、实战、工作流、Prompt / Skills、配置方法、具体应用案例及功能、模型、价格、额度等更新可以入选。仅在列表中提及 Codex、泛泛夸赞或推广引流不入选。
- 有求助、报错或纯抱怨等内容时，必须同时提供解决方法、步骤或已解决的说明；“有没有完整教程”“求解决方法”不算提供答案。Reddit 正文和 YouTube 介绍可辅助筛选，展示标题仍使用原文。
- 内容信号需出现在讨论 Codex 的句子附近；其他话题的教程、经验或解决方法不能替顺带提及的 Codex 加分。这是启发式筛选，仍可能漏掉好内容或误判，不能当作人工或模型语义审核。
- 最近 7 天内的候选通过筛选后，热度每 24 小时减半：`平台热度 × 2^(-小时数 / 24)`。GitHub 使用最近更新时间，其余使用发布时间。
- X 互动分为：点赞 × 10、转发 × 20、引用 × 16、评论 × 4、收藏 × 24。浏览量 × 0.001 只作为补充，最多增加互动分的 10%；无任何互动时不入选。
- B站 / YouTube 使用播放量，Reddit 使用净赞，GitHub 使用累计 stars，均在各自平台内衰减排序，不跨平台比较。
- 同链接只展示一次。同一作者的实质相同文本（规范化后至少 16 字符，完全相同或双字片段相似度达到 90%）只保留排序靠前的一条。不同作者的相同事件暂不聚合，不宣称独立来源数量。
- 合格实时内容不足 3 条就少展示；没有合格候选或接口不可用时，展示明确标注的历史精选。

算法更新使用新的缓存版本，避免部署后继续命中上一版的筛选结果。现有 Cloudflare 环境变量和绑定无需调整，发布代码后生效。

## 可用性与验证

前后端共用 `.vitepress/theme/hot-posts-data.mjs` 中的一份历史精选。历史精选不标注“最近 7 天”或“本周热帖”；X 搜索链接随当前日期滚动。

单次外部请求 3.5 秒超时（包含响应体），每个平台总预算 6.5 秒，浏览器接口请求 8 秒。超时会取消请求并回退，各平台并行处理。成功缓存 15 分钟；全部平台回退时只缓存 1 分钟。读取缓存时会重新排除超过 7 天的内容。

热帖接口不需要新增 KV 绑定，既有 COMMENTS_KV / KV 与留言管理配置不变。`npm run dev` 只运行 VitePress，不执行 Pages Functions；接口联调需要 Cloudflare Pages 预览/生产环境。

运行回归检查：`node --test .vitepress/hot-posts.test.mjs`。页面构建与 Functions 打包应分别验证。没有有效凭据时只能验证回退与模拟数据行为，不能确认付费平台的实际搜索结果。

来源：

- https://github.com/KKKKhazix/AIHOT/blob/main/docs/sources.md
- https://github.com/KKKKhazix/AIHOT/blob/main/docs/selection.md
- https://github.com/KKKKhazix/AIHOT#聚簇与热点
- https://github.com/KKKKhazix/AIHOT/blob/main/.env.example
- https://docs.socialdata.tools/reference/get-search-results/
- https://docs.x.com/x-api/posts/search-recent-posts
