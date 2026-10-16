---
title: 01 Codex 报错查询
description: Codex 国内使用与报错速查
tags: [Codex, 新手入门]
level: 1
date: 2026-10-16
---

# 01 Codex 报错查询

## Codex 国内使用与报错速查（2026）：安装、登录、手机号、代理、额度

国内用 Codex，卡住的地方基本就那几处：装不上、打不开、登录跳不回来、要验证手机号、终端连不上、用着用着断线、额度用完。

有热心网友做了一个合集，针对没中报错提供了解决思路

每条报错，写清楚多半是什么原因、按什么顺序处理，并附上官方文档或 openai/codex 仓库里维护者回复的出处，可以自己点进去核对。

[查看完整报错速查项目：codex-china-guide](https://github.com/Avarce/codex-china-guide)

来源：AONIR 整理维护的 codex-china-guide（GitHub：Avarce）。

## 这几天问得最多的（2026 年 10 月 15 日）

- 重连 5 次后失败，`stream disconnected before completion: An error occurred while processing your request`，后面带一串 request ID：是服务器那边出错，换节点没用：[看这里](https://github.com/Avarce/codex-china-guide#%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%A4%84%E7%90%86%E5%A4%B1%E8%B4%A5an-error-occurred-while-processing-your-request)
- 桌面版新对话发不出去，提示「无法加载工作空间设置」，还没修：[看这里](https://github.com/Avarce/codex-china-guide#%E6%97%A0%E6%B3%95%E5%8A%A0%E8%BD%BD%E5%B7%A5%E4%BD%9C%E7%A9%BA%E9%97%B4%E8%AE%BE%E7%BD%AEcouldnt-load-workspace-settings)
- 每条消息都是 `Selected model is at capacity`，额度明明还有：10 月 9–10 日、12–14 日各来了一波，13 日、14 日状态页也挂了故障：[看这里](https://github.com/Avarce/codex-china-guide#%E6%A8%A1%E5%9E%8B%E6%BB%A1%E8%BD%BDselected-model-is-at-capacity)。修复方式：[Codex 找不到模型怎么办](https://52codex.site/tips/17-gemini-model-not-found)。
- Windows 上所有命令都跑不了，`setup refresh had errors`，桌面版已修、CLI 没修：[看这里](https://github.com/Avarce/codex-china-guide#windows-%E6%B2%99%E7%9B%92setup-refresh-had-errors-os-error-32)
- GPT-5.5 已在 10 月 14 日下线，设置里还写着 `gpt-5.5` 的会报模型不支持，要改：[看这里](https://github.com/Avarce/codex-china-guide#%E6%A8%A1%E5%9E%8B%E4%B8%8D%E6%94%AF%E6%8C%81model-is-not-supported)

大家可以按图索骥，提高自己使用Codex的效率。

再次感谢GitHub：Avarce
