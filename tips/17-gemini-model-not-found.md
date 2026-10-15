---
title: 17 Codex 找不到模型怎么办
description: 使用 Codex 时遇到 "Model not found"（找不到模型），可以尝试检查浏览器时区。 
tags: [新手入门, 插件]
level: 1
date: 2026-10-15
---

# 17 Gemini找不到模型怎么办

Codex 报 `Model not found`（找不到模型）时，可尝试检查浏览器时区。

有用户反馈：浏览器时区与代理出口 IP 所在地时区不一致时，可能遇到此报错。

可尝试用 Chrome 时区插件将两者调为一致。

## 操作步骤

### 1. 打开插件安装地址

[Change Timezone for Google Chrome™](https://chromewebstore.google.com/detail/change-timezone-for-googl/cejckpjfigehbeecbbfhangbknpidcnh?pli=1)

### 2. 点击 Add to Chrome

在插件页面点击 **Add to Chrome**。

![Change Timezone 插件页面的 Add to Chrome 按钮](./assets/17-gemini-model-not-found/step-01-add-to-chrome.png){#screenshot}

### 3. 确认添加扩展程序

在弹出的窗口中点击 **添加扩展程序**。

![Chrome 添加扩展程序的确认窗口](./assets/17-gemini-model-not-found/step-02-confirm-extension.png){#screenshot}

### 4. 打开时区插件

点击浏览器右上角的扩展程序图标，在列表中打开 **Change Timezone**。

![从 Chrome 右上角的扩展程序列表打开时区插件](./assets/17-gemini-model-not-found/step-03-open-extension.png){#screenshot}

### 5. 开启自动更新时区

勾选 **Automatically update timezone based on my IP address**（根据 IP 地址自动更新时区），点击 **Save** 保存。

![勾选根据 IP 地址自动更新时区并点击 Save 保存](./assets/17-gemini-model-not-found/step-04-auto-timezone.png){#screenshot}

### 6. 重新登录

最后一步，退出Codex 桌面端 并重新登录 Codex，部分同学已经测试搞定！
