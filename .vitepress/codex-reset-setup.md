# Codex 重置监控

一级导航入口位于“网络热帖”左边，桌面与手机导航一致。页面路径 `/codex-reset`，源文件 `codex-reset.md`，组件 `.vitepress/theme/CodexResetMonitor.vue`。

## 数据来源

- 完整日历：https://aihot.news/api/v1/codex-resets
- 近期动态：https://aihot.news/api/v1/codex-resets/recent
- 数据说明：https://aihot.news/llms.txt
- 来源页面：https://aihot.news/codex-reset

浏览器请求本站 `/api/codex-resets`；近期更新使用 `/api/codex-resets?view=recent`。Pages Function 用默认 HTTP 客户端读取上游公开接口，避免浏览器直接跨站访问失败。无需 API Key 或新增 Cloudflare 环境绑定。边缘缓存 10 分钟，缓存故障时仍尝试读取来源。

首次读取完整历史；当前浏览器标签页以内存保存结果，之后至少间隔 10 分钟读取近期接口，并通过 ETag / If-None-Match 接收变化。没有写入 localStorage / sessionStorage，也没有把上游数据保存进仓库。接口只接受 full / recent 两种视图，不接受自定义上游地址。

完整历史失败时尝试近期接口，并明确提示仅有近期数据。后续刷新失败时保留当前页面已成功取得的数据并标注无法更新；首次全部失败时显示不可用状态，不生成历史记录、次数或重置结论。

AIHOT 的使用条件见 https://aihot.news/terms 。公开接口与开源代码的许可不同；正式公开展示、商业使用或持续再分发之前，应按对方规则确认适用许可与授权范围。

## 展示口径

- 优先使用 `presentation` 的确认状态、中文适用范围及 `displayLabel`。不把 legacy `scope` 的宽泛范围当成已核实范围。
- 日历日期优先采用到账核实日期和确认帖日期；未确认的记录采用来源预计日期或公告日期。
- 近 90 天统计仅包含已确认记录。间隔中位数按不同重置日期计算，同日多条记录不产生零天间隔；不预测下一次重置。
- 近期快照替换覆盖窗口内的历史记录，接收修改和删除；窗口之前的记录仅在本次浏览器会话内保留，重新加载页面读取完整快照。
- 来源状态和最近核验时间与本站读取是否成功分别展示。

## 验证

```bash
node --test .vitepress/*.test.mjs
node node_modules/vitepress/bin/vitepress.js build --outDir /tmp/52codex-reset-build
```

临时构建目录用于本地检查，不修改 `.vitepress/dist`。浏览器检查应覆盖导航位置、月份切换、日期选择、类型筛选、英文原文、桌面和手机布局，以及数据来源不可用时的提示。

`npm run dev` 和静态预览不执行 Pages Functions；完整联调应使用 Pages 环境或能够调用该 Function 的本地服务器。VitePress 构建与 Functions 打包需分别验证。

2026-10-08 核验：curl 和默认 Node fetch 读取接口均返回 HTTP 200；自动化 Chrome / Playwright HTTP 客户端直接访问则收到上游 `567 blocked`，因此采用服务端标准 SDK 请求。没有修改 User-Agent、切换代理或更换数据来源。首次来源不可用时的提示也已验证。
