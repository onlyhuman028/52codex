---
title: 02 内容创作者必用的10个Codex Skills 
description: 这是一份面向中文内容创作者的 Codex Skills 推荐清单，覆盖去 AI 味、选题诊断、长文写作、资料研究、正文配图、封面卡片、PPT 和 HTML 海报制作。
tags: [Codex, Skill, 插件, 内容创作]
level: 2
date: 2026-06-02
author: Serena
---

# 中文内容创作者怎么给 Codex 装 Skills？10 个写作和配图技能推荐

如果你用 Codex 做内容创作，最常见的需求大概有几类：

- 让文章少一点 AI 腔
- 帮你判断选题和标题能不能打
- 把资料整理成提纲和初稿
- 给公众号、小红书、X 长文做配图
- 把文章二次加工成卡片、封面、PPT 或 HTML 页面

这些事情当然可以每次都写 Prompt，但更稳定的方式，是把常用工作流装成 Skill。

这篇文章根据原作者 Serena 的 [X 原帖](https://x.com/369Serena/status/2061306852990931229)整理改写，适合中文内容创作者按自己的场景挑选安装。

## 适合谁

这篇文章适合这几类用户：

- 经常用 Codex 写公众号、Newsletter、博客或 X 长文
- 想让 AI 初稿更像真人表达，而不是模板化文章
- 做小红书、知识卡片、封面图、信息图等视觉内容
- 有自己的资料库，希望文章少一点胡编乱造
- 想把“写作、润色、配图、分发包装”连成一套流程

如果你只是偶尔让 Codex 改一句话，不一定需要一次装很多 Skill。先装 1 到 2 个最贴近自己痛点的就够了。

## 这篇文章解决什么问题

看完这篇文章，你会知道：

- 内容创作者应该优先看哪几类 Skill
- 10 个 Skill 分别适合什么创作环节
- 如果只想先装 5 个，应该怎么选
- 怎么把这些 Skill 组合成一条内容生产流程

这里不会承诺“装完一定出爆款”。Skill 只能提高流程稳定性和产出效率，真正决定内容质量的，仍然是你的选题、判断和素材。

## 先按创作流程来选

不要一开始就把所有 Skill 都装上。

更推荐按自己的内容流程选：

| 创作环节 | 优先看 |
|---|---|
| 去 AI 味和润色 | Humanizer-zh |
| 选题、标题、商业表达诊断 | dbskill |
| 资料研究、提纲、初稿 | content-research-writer、NotebookLM Claude Code Skill |
| 长文和研究报告 | khazix-skills |
| 正文插图 | ian-xiaohei-illustrations |
| 小红书卡片和公众号封面 | guizang-social-card-skill |
| 信息图和结构图 | baoyu-skills |
| PPT 和演讲图 | guizang-ppt-skill |
| HTML 页面、海报、知识卡片 | html-anything |

下面逐个介绍。

## 01 Humanizer-zh

仓库：[op7418/Humanizer-zh](https://github.com/op7418/Humanizer-zh)

Humanizer-zh 适合用来处理 AI 初稿里的生硬表达。

它的重点不是“把文章改得更花”，而是识别空话、套话、三段式、过度排比、AI 腔等常见问题，再把文字改得更像正常中文表达。

适合：

- 公众号文章润色
- 小红书文案去模板感
- 把 AI 初稿改得更自然
- 检查文章里有没有过度机械的表达

::: tip Prompt
请用 Humanizer-zh 帮我检查这篇文章，把明显的 AI 腔、空话、套话和过度排比改得更自然，但不要改变原意。
:::

## 02 dbskill

仓库：[dontbesilent2025/dbskill](https://github.com/dontbesilent2025/dbskill)

dbskill 更像内容创作者的选题诊断器。

它适合帮你看一个选题是否清楚、标题是否有吸引力、开头是否能留住人、表达是否足够具体。对于做中文自媒体、知识型内容、商业表达的人来说，这类诊断比单纯“帮我写一篇文章”更有价值。

适合：

- 选题诊断
- 标题和 hook 优化
- 公众号文章结构复盘
- 小红书标题和爆款拆解
- 商业表达和产品观点打磨

::: tip Prompt
请用 dbskill 诊断这篇文章的选题、标题、开头、结构和表达，指出最影响传播的 3 个问题，并给出可执行修改建议。
:::

## 03 content-research-writer

仓库：[ComposioHQ/awesome-claude-skills 的 content-research-writer](https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer)

content-research-writer 适合把写作前半段流程串起来。

它可以围绕一个选题做资料研究、整理引用、生成提纲，再推进到初稿。对于公众号、Newsletter、X 长文、博客和深度文章来说，它更像一个写作助理，而不是只负责润色的工具。

适合：

- 从零开始写长文
- 先研究资料再写文章
- 需要提纲、引用和初稿
- 想让写作流程更完整

::: tip Prompt
请用 content-research-writer 围绕这个选题做资料研究，先列出文章角度、核心论点、提纲和需要核实的信息，再写一版初稿。
:::

## 04 NotebookLM Claude Code Skill

仓库：[PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill)

NotebookLM Claude Code Skill 适合资料型写作者。

如果你已经把报告、文章、课程稿、访谈记录或行业资料放进 NotebookLM，这个 Skill 可以让 Codex 基于你的资料库提问和整理内容。它的价值是减少“模型看起来很懂，但其实在编”的情况。

适合：

- 行业研究
- 课程稿整理
- 深度文章写作
- 基于资料库做问答和摘要
- 长期维护同一主题的内容库

::: info 说明
这类 Skill 通常需要你先准备好资料库，并确认本地环境、浏览器登录和权限配置正常。涉及事实、数据、政策或最新信息时，仍然要人工复核来源。
:::

## 05 khazix-skills

仓库：[KKKKhazix/khazix-skills](https://github.com/KKKKhazix/khazix-skills)

khazix-skills 更适合长文和研究型内容。

如果你经常写 AI 热点分析、万字长文、趋势拆解、深度观点输出，可以把它当成更重的写作工作流参考。它不适合所有轻量文案，但适合需要多轮拆解和组织材料的内容。

适合：

- 公众号长文
- 万字研究报告
- AI 热点分析
- 深度观点文章
- 需要多轮推敲结构的内容

## 06 ian-xiaohei-illustrations

仓库：[helloianneo/ian-xiaohei-illustrations](https://github.com/helloianneo/ian-xiaohei-illustrations)

ian-xiaohei-illustrations 适合给中文文章做正文插图。

它不是随便生成一张装饰图，而是把文章里的观点、流程、情绪或隐喻转成“小黑”风格插图。对于需要配图但不想使用普通图库图的人来说，很实用。

适合：

- 公众号正文插图
- 观点解释图
- 流程或场景插图
- 文章里的情绪和隐喻表达

::: tip Prompt
请阅读这篇文章，挑出最适合做正文插图的 3 个段落，并分别生成小黑风格插图提示词。
:::

## 07 guizang-social-card-skill

仓库：[op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill)

guizang-social-card-skill 适合把文章二次加工成社交平台图片。

比如你写完一篇长文后，可以让它拆成小红书图文卡片、公众号封面或观点卡片。它解决的是内容分发里的包装问题：同一篇文章，不同平台需要不同形态。

适合：

- 小红书图文卡片
- 公众号封面
- 文章观点卡片
- 长文拆图文
- 多平台内容分发

::: tip Prompt
请把这篇文章拆成 6 张小红书图文卡片，保留核心观点，每张卡片只讲一个信息点，并给出封面标题。
:::

## 08 baoyu-skills

仓库：[JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills)

baoyu-skills 更像中文内容创作者的视觉工具箱。

它覆盖的方向比较多，包括封面图、信息图、结构图和图解。适合把复杂观点变成更容易理解的视觉内容，也适合给文章做二次包装。

适合：

- 信息图
- 结构图
- 文章配图
- 观点可视化
- 内容发布前的视觉包装

## 09 guizang-ppt-skill

仓库：[op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)

guizang-ppt-skill 适合把文章观点做成 PPT、演讲图、公众号头图或小红书封面。

如果你经常把一篇文章改成分享稿、线上课、社群分享或演讲材料，这个 Skill 会很有用。它的重点是把文字观点转成有版式、有节奏的视觉页面。

适合：

- 文章转 PPT
- 线上分享稿
- 演讲图
- 公众号头图
- 小红书封面

::: tip Prompt
请把这篇文章整理成 8 页 PPT：第 1 页是封面，第 2 页讲问题，第 3 到 6 页讲方法，第 7 页讲案例，第 8 页总结行动建议。
:::

## 10 html-anything

仓库：[nexu-io/html-anything](https://github.com/nexu-io/html-anything)

html-anything 适合把 Markdown、文案、文章或资料变成 HTML 页面、海报、卡片和 PNG。

它更偏内容成品制作：比如杂志风文章、知识卡片、小红书卡片、分享图、数据报告页面等。如果你希望文章不只停留在 Markdown，而是变成可展示、可截图、可发布的视觉成品，可以重点看它。

适合：

- Markdown 转 HTML
- 杂志风文章
- 知识卡片
- 小红书卡片
- 海报和 PNG 输出

## 如果只先装 5 个

如果你是中文内容创作者，不想一次装太多，可以先从这 5 个开始：

1. Humanizer-zh
2. dbskill
3. content-research-writer
4. ian-xiaohei-illustrations
5. guizang-social-card-skill

前 3 个解决文字质量：从选题、资料、初稿到润色。

后 2 个解决分发包装：从正文插图到社交平台卡片。

等你的内容流程稳定以后，再根据需要补 NotebookLM、baoyu-skills、guizang-ppt-skill 和 html-anything。

## 一条可参考的创作流程

你可以按下面这条流程组合使用：

1. 用 dbskill 诊断选题和标题。
2. 用 content-research-writer 做资料整理、提纲和初稿。
3. 用 NotebookLM Claude Code Skill 核对资料库里的关键信息。
4. 用 Humanizer-zh 润色文章，减少 AI 腔。
5. 用 ian-xiaohei-illustrations 给正文生成插图。
6. 用 guizang-social-card-skill 拆成小红书卡片或公众号封面。
7. 用 guizang-ppt-skill 或 html-anything 做二次分发成品。

真正提效的不是让 AI 每次“写一篇文章”，而是让 Codex 按你的创作流程干活。

## 常见问题

### 这些 Skill 都必须安装吗？

不需要。

先选最符合当前痛点的 1 到 2 个。装太多反而容易增加判断成本，也不方便观察哪个真的有用。

### Skill 可以替我判断内容真实吗？

不能完全替代。

Skill 可以帮助你整理资料、降低胡编乱造概率、提醒你核实来源，但涉及事实、数据、法律、医疗、金融、政策和最新消息时，必须人工复核。

### Skill 和 Prompt 有什么区别？

Prompt 更像一次性指令。

Skill 更像可复用的工作流，里面可以包含触发规则、步骤、参考资料、脚本和模板。对于反复发生的内容生产任务，Skill 会比单次 Prompt 更稳定。

## 下一步推荐阅读

- [插件与技能总览](/plugins/)
- [Codex 十大必装 Skills 怎么选](/plugins/top-skills)
- [自定义 Skill](/plugins/custom-skill)
- [Codex 的 Skill 和插件怎么用](/guide/07-skills-and-plugins)

 
