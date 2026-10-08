// A conservative local screen, not an AI judgment or a count of independent events.
const CODEX = /\bcodex\b/i
const HAN = /[\u3400-\u9fff]/
const PROMOTION = /扫码|私信.{0,8}(购买|领取|进群|加群)|加[我微]|限时优惠|付费课程|课程.{0,8}(购买|优惠)|代充|代购|账号出售|抽奖|返佣|推广码/
const REQUEST = /求助|请问|有没有|有谁|有啥|咋整|谁能|求推荐|求一份|想求|在哪里|哪里找/
const QUESTION = /求助|请问|有没有|有谁|有啥|怎么办|咋整|怎么回事|谁能|求推荐|求一份|想求|怎么|如何|为什么|是什么|在哪里|哪里找/
const COMPLAINT = /没用|无效|失败|报错|故障|异常|无法|垃圾|不好用|再也不用/
const SOLUTION = /解决方法|解决办法|解决方案|解决了|修复了|恢复正常|排查过程|原因是|方法(?:是|如下)|步骤|操作方法|可以通过|只[需要]|完整教程|详细教程|保姆级|(?:修复|排查|解决|处理)(?:教程|指南|方法|步骤)/
const GUIDE = /教程|入门|指南|攻略|实战|案例|工作流|技巧|经验|步骤|配置|安装|部署|自动化|提示词|\bprompt\b|\bskills?\b|插件|实践/i
const ACTION = /做[了出成]|制作|搭建|创建|生成|整理|分析|构建|批量|完成|改造|实现|root|修复|解决|接入|导出|提取|抓取|转换/i
const UPDATE = /发布|上线|新增|更新|支持|开放|推出|移除|下线|调整/
const CHANGE = /功能|版本|模型|价格|定价|额度|限制|权限|平台|登录|登陆|账户|账号|定时任务|电脑操作|上下文|\b(?:API|SDK|MCP|Windows|macOS|Linux|GPT-\d)\b|\d+\.\d+/i

export function isUsefulCodexContent(title, body = '') {
  const text = `${title || ''}\n${body || ''}`.replace(/https?:\/\/\S+/g, '').trim()
  if (!CODEX.test(text) || !HAN.test(text) || PROMOTION.test(text)) return false
  const sentences = text.match(/[^。！？!?；;\n]+[。！？!?；;]?/g) || []
  // Asking for "解决方法/完整教程" is not evidence of supplying an answer.
  const answerClauses = sentences.filter((sentence) => CODEX.test(sentence)
    || !/\b(?:Excel|Cursor|Claude|Gemini|Photoshop)\b|剪映/i.test(sentence)).flatMap((sentence) => sentence.split(/[,，]/))
  const hasSolution = answerClauses.some((sentence) => (!QUESTION.test(sentence)
    || /教程|指南|实战|案例|操作步骤/.test(sentence) && !REQUEST.test(sentence) && !/[？?]/.test(sentence))
    && !/没用|无效|未解决|没有解决|待补充|垃圾|不好用/.test(sentence)
    && (CODEX.test(sentence) || !/\b(?:Excel|Cursor|Claude|Gemini|Photoshop)\b|剪映/i.test(sentence))
    && (SOLUTION.test(sentence) || /教程|指南|实战|案例|操作步骤/.test(sentence)))
  // Keep the useful signal close to Codex, instead of accepting a keyword buried
  // in a market roundup, model list or unrelated tutorial later in the post.
  const clauses = sentences.filter((clause) => CODEX.test(clause)
    && !clause.split(/[,，、]/).some((part) => /^\s*#?codex\s*$/i.test(part)))
  const contexts = clauses.map((clause) => {
    const index = clause.search(CODEX)
    return clause.slice(Math.max(0, index - 40), index + 100)
  })
  if ((QUESTION.test(text) || COMPLAINT.test(text)) && !hasSolution) return false
  return contexts.some((context) => GUIDE.test(context)
    || /(?:用|让|通过|借助).{0,8}\bcodex\b/i.test(context) && ACTION.test(context)
    || UPDATE.test(context) && CHANGE.test(context))
    // A question may be followed by an actual solution in the next sentence/body.
    || contexts.some((context) => QUESTION.test(context) || /登录|登陆|报错|失败|故障|异常/.test(context)) && hasSolution
}

export function selectHotPosts(candidates, now = Date.now()) {
  const selected = []
  const ranked = candidates.filter((candidate) => isUsefulCodexContent(candidate.text, candidate.body)
    && Number.isFinite(candidate.heat) && candidate.heat > 0
    && Number.isFinite(Date.parse(candidate.item.publishedAt)))
    .sort((a, b) => decayedHeat(b, now) - decayedHeat(a, now)
      || Date.parse(b.item.publishedAt) - Date.parse(a.item.publishedAt))
  for (const candidate of ranked) {
    if (selected.some((previous) => previous.item.href === candidate.item.href
      || candidate.authorKey && previous.authorKey === candidate.authorKey
      && repeatedContent(previous.text, candidate.text))) continue
    selected.push(candidate)
    if (selected.length === 3) break
  }
  return selected.map(({ item }) => item)
}

function decayedHeat(candidate, now) {
  const ageHours = Math.max(0, now - Date.parse(candidate.item.publishedAt)) / 3600000
  return candidate.heat * 2 ** (-ageHours / 24)
}

function repeatedContent(a, b) {
  const normalize = (text) => String(text).toLowerCase().replace(/https?:\/\/\S+/g, '').replace(/[^\p{L}\p{N}]/gu, '')
  const left = normalize(a)
  const right = normalize(b)
  // Compare only substantive texts; a shared short title like "Codex 教程"
  // does not prove that two different tutorials cover the same material.
  if (Math.min(left.length, right.length) < 16) return false
  if (left === right) return true
  const pairs = (text) => new Set(Array.from({ length: text.length - 1 }, (_, index) => text.slice(index, index + 2)))
  const first = pairs(left)
  const second = pairs(right)
  const overlap = [...first].filter((pair) => second.has(pair)).length
  return overlap / (first.size + second.size - overlap) >= 0.9
}
