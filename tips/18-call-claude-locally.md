---
status: published
category: 用法技巧
title: 18 无需 KYC，手把手教你本地调用 Claude 大模型
description: 用 Cherry Studio 在电脑上调用 Claude 模型，无需开通 Claude Pro。本文按顺序演示如何安装客户端、注册并充值 OpenRouter、创建 API 密钥、查找模型 ID，以及在 Cherry Studio 中添加模型并测试对话，最后介绍如何接入本地知识库。
tags: [新手入门, Vibe Coding]
level: 2
date: 2026-10-12
---

# 18 无需 KYC，手把手教你本地调用 Claude 大模型

好消息是 Claude 新模型上线了，坏消息是，如果账号被要求做真人认证（KYC）却没通过，开通官方 Claude Pro 会员就可能受阻。 [Claude 身份验证说明](https://support.claude.com/en/articles/14328960-identity-verification-on-claude)

Anthropic 在国庆前发布了 Claude Opus 5.5，下图是原文记录的榜单截图。 [榜单来源](https://aihot.news/leaderboard)

![原文记录的 Claude Opus 5.5 榜单](./assets/18-call-claude-locally/opus-leaderboard.png){#screenshot}

10 月 7 日，Anthropic 又发布了小型模型 Claude Haiku 5.5。 [Anthropic 模型发布记录](https://www.anthropic.com/news?date=2026-09-10)

![原文引用的 Claude Haiku 5.5 讨论](./assets/18-call-claude-locally/haiku-discussion.png){#screenshot}

![Claude Haiku 5.5 的评测对比](./assets/18-call-claude-locally/haiku-benchmarks.png){#screenshot}

加上此前的 Fable 5.1，这些模型可用于前端开发、编程、写作和软件逆向。

原作者有位做科研的朋友，想在官方会员之外找一种调用 Claude 的方式。原文演示的办法是安装 Cherry Studio，在 OpenRouter 创建 API 密钥，再把密钥填进客户端。这套流程无需开通 Claude Pro，模型推理通过 OpenRouter 在线完成。 [原文教程](https://blog-er7.pages.dev/posts/20261011-onewaytouseclaude/)

## 一、安装 Cherry Studio

Cherry Studio 是免费开源的桌面 AI 客户端，支持 Windows、macOS 和 Linux。

![Cherry Studio 官网](./assets/18-call-claude-locally/cherry-studio-home.png){#screenshot}

客户端支持多家模型服务商，提供知识库、智能体和多模型对比功能，应用数据默认保存在本机。

1. 从 [Cherry Studio 官网](https://www.cherry-ai.com/) 下载对应系统的安装包。

   ![Cherry Studio 官网下载入口](./assets/18-call-claude-locally/cherry-studio-download.png){#screenshot}

2. Windows 用户双击 `.exe` 安装。macOS 用户打开 `.dmg`，将应用拖进「应用程序」。

   ![macOS 将 Cherry Studio 拖入应用程序](./assets/18-call-claude-locally/cherry-studio-installers.png){#screenshot}

3. 安装后打开客户端。客户端可以直接使用，无需注册 Cherry Studio 账号。

   ![Cherry Studio 客户端界面演示](./assets/18-call-claude-locally/cherry-studio-demo.gif){#screenshot}

## 二、注册 OpenRouter 并创建 API 密钥

OpenRouter 是模型聚合平台。一把 API 密钥可以调用 Claude、GPT、Gemini 和 DeepSeek 等模型，付费模型按用量计费。 [OpenRouter 计费说明](https://openrouter.ai/pricing)

### 1. 注册账号

打开 [OpenRouter](https://openrouter.ai/)，可用 Google、GitHub 账号或邮箱注册。

![OpenRouter 注册入口](./assets/18-call-claude-locally/openrouter-sign-up.png){#screenshot}

登录后可在模型目录查看可用模型。

![OpenRouter 模型目录](./assets/18-call-claude-locally/openrouter-models.png){#screenshot}

![浏览 OpenRouter 模型目录的演示](./assets/18-call-claude-locally/openrouter-models-demo.gif){#screenshot}

### 2. 充值额度

打开 **Credits**（额度），点击 **Add Credits**（充值）。

![OpenRouter 额度页面的充值入口](./assets/18-call-claude-locally/openrouter-add-credits.png){#screenshot}

勾选 **Use one-time payment methods**（一次性支付）。原文截图中有支付宝和微信支付，最低充值额为 5 美元。可用的支付方式以结算页面为准。 [OpenRouter 支付说明](https://openrouter.ai/support/)

![勾选一次性支付方式](./assets/18-call-claude-locally/openrouter-one-time-payment.png){#screenshot}

### 3. 创建 API 密钥

打开 [OpenRouter 密钥页](https://openrouter.ai/keys)，点击 **Create Key**。输入名称，例如 `CherryStudio`，也可以给这把密钥设置消费额度。

![创建 OpenRouter 密钥并设置名称和额度](./assets/18-call-claude-locally/openrouter-create-key.png){#screenshot}

创建后复制并妥善保存 `sk-or-...` 开头的 API 密钥。完整密钥只显示一次。

![OpenRouter 创建后复制 API 密钥](./assets/18-call-claude-locally/openrouter-copy-key.png){#screenshot}

### 4. 找到 Claude 模型并复制 ID

在 [OpenRouter 模型目录](https://openrouter.ai/models) 搜索 Claude。原文使用以下模型作为示例。

| 模型 | 模型 ID |
| --- | --- |
| Claude Opus 5.5 | `anthropic/claude-opus-5.5` |
| Claude Sonnet 5.5 | `anthropic/claude-sonnet-5.5` |
| Claude Haiku 5.5 | `anthropic/claude-haiku-5.5` |

![在 OpenRouter 搜索 Claude 模型](./assets/18-call-claude-locally/openrouter-search-claude.png){#screenshot}

打开想用的模型，复制模型 ID 备用。

![从模型详情页复制 Claude 模型 ID](./assets/18-call-claude-locally/openrouter-copy-model-id.png){#screenshot}

## 三、在 Cherry Studio 里调用 Claude

1. 打开 Cherry Studio，点击左下角「设置」，进入「模型服务」。

   ![打开 Cherry Studio 的模型服务设置](./assets/18-call-claude-locally/cherry-studio-settings.png){#screenshot}

2. 找到 **OpenRouter**，打开服务商配置页。

   ![在模型服务中选择 OpenRouter](./assets/18-call-claude-locally/cherry-studio-select-openrouter.png){#screenshot}

3. 在 **API Key** 一栏粘贴刚才保存的密钥。原文演示中，内置 OpenRouter 服务的 API 地址保持默认 `https://openrouter.ai/api`。

   ![在 Cherry Studio 填写 OpenRouter 密钥](./assets/18-call-claude-locally/cherry-studio-set-key.png){#screenshot}

4. 点击「获取模型列表」，搜索 Claude，把需要的模型添加到「我的模型」，例如 `anthropic/claude-sonnet-5.5`。

   ![搜索并添加 Claude 模型](./assets/18-call-claude-locally/cherry-studio-add-model.png){#screenshot}

5. 点击「检测」，确认连接成功。

   ![Cherry Studio 的连接检测界面](./assets/18-call-claude-locally/cherry-studio-test-connection.png){#screenshot}

6. 回到对话界面，选中刚添加的 Claude 模型。如果弹出启用桥接的提示，按原文演示点击「确定」，再发一条消息。

   ![Cherry Studio 的模型选择和对话输入框](./assets/18-call-claude-locally/cherry-studio-select-model.png){#screenshot}

   ![Cherry Studio 调用 Claude 对话](./assets/18-call-claude-locally/cherry-studio-claude-chat.png){#screenshot}

## 进阶用法：接入本地知识库

1. 在 Cherry Studio 左侧打开「知识库」，新建一个知识库。
2. 导入 PDF、Word、Markdown 或笔记，也可以按文件夹批量导入。
3. 配置嵌入模型，例如 `bge-m3`，或从 OpenRouter 选择嵌入模型，用来建立检索索引。
4. 回到对话，点击输入框旁的知识库按钮，选择刚建好的知识库。

![在 Cherry Studio 对话中选择知识库](./assets/18-call-claude-locally/cherry-studio-knowledge-base.png){#screenshot}

提问时，客户端会把检索到的相关片段发给云端模型，供它参考作答。

原作者建议先用 Haiku 5.5 或 Sonnet 5.5 试试，再按需换到 Opus。

原文也演示了在 OpenRouter 搜索 Fable。

![在 OpenRouter 搜索 Claude Fable](./assets/18-call-claude-locally/openrouter-search-fable.png){#screenshot}

日常对话、写作、编程问答和资料问答都可以用这套配置。OpenRouter 以额度结算，充值时会收取服务费。 [OpenRouter 计费说明](https://openrouter.ai/pricing)
