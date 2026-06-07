---
title: 01 技巧总览
description: 汇总 Codex 使用中的高频问题和实用技巧，覆盖项目规则、AGENTS.md、额度节省、插件配置、登录验证和设计美感提升。
---

# 01 技巧总览

Codex 使用经验库。解决你最常遇到的问题，来自真实使用中的总结。


有个网友23olp说得很对： 

 

::: tip Codex最佳实践
不要把 codex 当成一个只会自动生成代码的工具，而要把它当成一个坐在你旁边、很会用终端的程序员同事来协作；你要给它项目规则，比如写进 AGENTS.md，让它知道怎么跑测试、代码结构是什么、团队风格是什么；开始写代码前，先让它搜索代码库、分析问题、提出方案，而不是直接开干；执行过程中要管好权限、控制上下文、让它小步修改、勤跑测试、勤提交，发现方向不对就用 Esc 及时打断；如果需要更多能力，就给它装 CLI 工具、接 MCP，甚至同时开多个 codex 分工合作。生活化地说，codex 就像一个特别勤快但需要你指挥的装修师傅：你不能只说“把房子弄好”，最好先给他户型图、装修规范、预算边界，让他先看现场、列方案、分步骤施工，每做完一部分就验收；这样它不是替你“瞎干活”，而是在你的把控下高效完成复杂工程
::: 

## 用法技巧

- [怎么让 Codex 越用越顺手](/tips/02-make-codex-better) — 记忆管理、偏好设置、习惯养成
- [Codex 如何接入第三方 API](/tips/03-codex-third-party-api) — 接入国产模型、中转站 GPT 或 Claude
- [ChatGPT/Codex 手机号二次验证怎么办](/tips/07-chatgpt-codex-phone-verification) — 高级账号安全、通行密钥、恢复密钥
- [Codex 手机验证刷屏了怎么办](/tips/08-sms-verification-platforms) — SMS、WhatsApp、实体 SIM 卡和账号安全
- [如何让 Codex 不断进化](/tips/09-self-evolution) — 项目复盘、偏好提炼、规则沉淀
- [如何提升 Codex 的设计美感](/tips/10-improve-codex-design) — DESIGN.md、参考风格、UI 审查清单
- [Giffgaff 境外卡激活教程](/tips/11-giffgaff-activation) — 实体 SIM、eSIM、充值激活、长期保号
- [怎么用 ChatGPT 账号给 OpenClaw 配 Codex 模型](/tips/12-openclaw-chatgpt-codex) — OpenClaw、ChatGPT OAuth、Codex 模型和额度提醒
- [怎么在 Codex 里运行 Claude Code](/tips/13-run-claude-code-in-codex) — 安装 Claude Code、在 Codex 终端启动、排查网络配置
- [怎么防止 Codex 乱改代码](/tips/04-agents-md) — 用 AGENTS.md 划定行为边界

## 工程化

- [AGENTS.md 怎么写](/tips/04-agents-md) — 实战模板 + 逐字段讲解
- [Codex 的 /goal 怎么用](/tips/05-goals) — 长任务拆解、检查点、停止条件
- [Codex 额度怎么省](/tips/06-save-quota) — Prompt、上下文、MCP、模型选择
