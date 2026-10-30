# 内容维护与环境验证

## 文章状态

四个内容栏目所有 Markdown（含总览）都需要 frontmatter `status`。现有正文不改写。

| 值 | 展示 | 阅读入口 | 下一篇推荐 | 搜索引擎收录 |
|---|---|---|---|---|
| published | 已发布 | 原文章 | 参与 | 参与 |
| improving | 待完善 | 原文章，提示仍有待补素材 | 不参与 | noindex，排除 sitemap |
| coming-soon | 待上线 | 统一占位页 | 不参与 | noindex，排除 sitemap |

`hidden: true` 会从自动入口移除，且不收录；`noindex: true` 只控制收录，不作为保密机制。修改状态后需要重新构建部署。

元数据由 `.vitepress/theme/content.data.mts` 使用 VitePress 内置 YAML 解析器读取，共同规则在 `content-policy.mjs`；`navPages.ts`、首页、各栏目总览、推荐阅读和站点配置共同使用。不再在推荐或收录配置中手工维护文章路径黑名单。

案例使用 `category` 分类。首页六篇现有精选使用 `featured: true`，另需 `cover`、`coverAlt`、`description` 和 `level`。增加或取消首页精选只改文章元数据。`featuredOrder` 单独控制首页顺序，不影响导航编号；技巧首页同样使用 `featured: true`。插件 `tags` 含 `Skill` 时归入技能，其他归入插件。

`order` 决定排序，缺少时回退到标题编号和文件编号。阅读时间按中文每分钟 300 字、英文每分钟 200 词估算，排除元数据、脚本和图片地址；并非实际计时。额度默认不显示；确有记录时才填写：

```yaml
quotaUsage:
  value: 0
  source: 原始实测记录的位置或说明
```

value 接受 0—100 的数字，source 不得为空。不要把估算当成实测，也不要为填字段编造记录。

## 生产与预览环境

Cloudflare Pages 构建命令保持 `npm run build`，输出目录 `.vitepress/dist`，Node 18+。Functions 随同仓库部署，不能只上传静态目录后就认定接口可用。

| 绑定或变量 | 生产环境 | 预览环境 | 缺失表现 |
|---|---|---|---|
| COMMENTS_KV（兼容旧名 KV） | 绑定正式留言命名空间 | 绑定独立测试命名空间 | 留言返回 503 |
| COMMENTS_ADMIN_TOKEN | Secret，使用正式强口令 | Secret，使用独立测试口令 | 审核接口返回 503；错误口令返回 401 |
| GITHUB_TOKEN | 可选 Secret | 可选测试 Secret | 仍尝试公开读取，额度可能较低 |
| YOUTUBE_API_KEY | 需要实时 YouTube 时配置 Secret | 可不配置 | 明确显示“实时来源尚未配置”，展示历史精选 |
| YOUTUBE_SEARCH_QUERY / YOUTUBE_VIDEO_IDS | 可选搜索条件或视频 ID | 可选测试条件 | 使用默认搜索条件 |

X 为人工精选，不依赖 X 或 SocialData 密钥。B站、Reddit 与重置监控不新增密钥或 KV 绑定。配置变更后重新部署，并分别检查生产和预览绑定；本次代码修改没有操作任何线上配置。

管理口令只保存在当前页面内存中，不写入浏览器存储。投稿使用现有联系邮箱，GitHub 使用仓库 origin 地址。

## 留言存储与分页

- 旧 `comments:<页面路径>` 数组继续读取，部署时不重写、不删除历史数据。
- 新留言写入 `comment-v2:<路径摘要>:<时间与随机ID>` 独立记录，不再以新增留言淘汰前 100 条。
- 审核、回复和删除分别写入 `comment-state:` 字段，避免不同操作互相覆盖。删除是持久隐藏标记，原始记录仍保留；如需彻底清除存储内容，应另行制定清理流程。
- 公开接口只返回已通过留言。新格式先按存储游标读取，之后读取旧格式；每页内部按日期排序，后台跨页面不保证全局时间顺序。
- GET 支持 `limit`（默认 20，最多 50）和不透明 `cursor`，返回 `comments` 与 `nextCursor`。筛选后可能出现空页且仍有下一页，客户端保留“加载更多”。游标与路径、筛选状态绑定，切换查询应重新加载。
- KV 为最终一致存储，异地审核显示可能延迟；同一字段的同时修改仍取最后写入结果。原有每 IP 60 秒限流为尽力而为，不是原子防刷保证。不要将本地内存测试当成跨区域即时一致性证明。
- 新数据格式上线后，直接回滚到只支持旧数组的代码会看不到新留言；回滚时应保留本次双格式读取与字段合并逻辑。预览环境先验证旧留言兼容，再上线。

Cloudflare 依据：[KV 写入与并发](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)、[KV 一致性](https://developers.cloudflare.com/kv/concepts/how-kv-works/)、[列表游标与空页](https://developers.cloudflare.com/kv/api/list-keys/)。

## 检查命令

```bash
npm test
npm run check:build
```

`check:build` 将构建、缓存、SSR 临时文件和接口依赖打包放进系统临时目录，打印产物位置，不更新 `.vitepress/dist`、`.vitepress/cache` 或 node_modules。它会检查目录、阅读时间、状态、robots、sitemap 和首页入口。接口打包检查使用已有的 esbuild 工具链，不能替代 Cloudflare Pages 实际部署验证。

`npm run dev` / `npm run preview` 仅运行 VitePress 页面，不执行 Functions。完整联调使用绑定了测试 KV 的 Cloudflare Pages 预览环境；不要向正式留言库写测试记录。

## 部署前后检查

1. 状态：首页、导航、总览的标识一致；待上线入口到占位页；待完善可读但不进入推荐或 sitemap；已发布教程正常收录。
2. 交互：首页分类能切换；长文章目录能跳转；复制成功和拒绝权限均有反馈；桌面菜单支持方向键、Home/End、Escape，手机菜单支持焦点循环和 Escape。
3. 热帖：无候选、未配置 YouTube、来源拒绝访问分别显示对应提示，始终保留精选；已有 X 人工精选不被接口结果替换。
4. 重置：完整历史失败后展示近期记录，十分钟后重试；来源恢复后恢复完整历史和统计；全部来源失败时保留旧数据并提示。
5. 留言：并发两条提交都进入待审核；未审核不公开；错误管理口令无法读取或操作；审核、回复、清除回复、删除及跨页加载正常，执行中不重复提交。
6. 将本地测试、预览环境验证、生产观察分别记录，不把构建通过写成线上功能已验证。
