# Clowder AI 元规则落地笔记

日期：2026-04-08

## 问题

第三课《03-meta-rules.md》里提出的元规则，在开源项目 `zts212653/clowder-ai` 中是如何真正落地的？

仓库：

- https://github.com/zts212653/clowder-ai

相关文章：

- https://github.com/zts212653/cat-cafe-tutorials/blob/main/docs/lessons/03-meta-rules.md

## 结论

作者不是把元规则只写成一段抽象 prompt，而是把它拆成了四层：

1. Agent 入口规则文件
2. 共享规则文件
3. 场景化 Skills
4. SOP 流程编排

这意味着她的做法不是“告诉 AI 要认真一点”，而是把这些要求做成可加载、可触发、可检查、可阻断的执行体系。

## 1. 规则放在什么地方

### 1.1 Agent 入口文件

这些文件定义了不同 agent 的身份、边界、基本纪律和行为风格：

- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/AGENTS.md
- https://raw.githubusercontent.com/zts212653/clowder-ai/main/CLAUDE.md
- https://raw.githubusercontent.com/zts212653/clowder-ai/main/GEMINI.md

这些文件更像总纲，不负责完整执行细节。

### 1.2 共享规则文件

跨 agent 通用的元规则，被集中放在：

- `cat-cafe-skills/refs/shared-rules.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/refs/shared-rules.md

这样做的目的很明确：避免每个 agent 文件都重复写一遍相同原则，形成单一真相源。

### 1.3 Skills 目录

真正执行元规则的地方，是：

- `cat-cafe-skills/`

参考：

- https://github.com/zts212653/clowder-ai/tree/main/cat-cafe-skills

第三课里提到的“交接必须写 WHY”“review 不能表演性同意”“没有 reviewer 放行不能 merge”，在 `clowder-ai` 里都已经被做成具体 skill。

### 1.4 SOP 流程文件

技能不是散着用的，而是被串进完整工作流：

- `docs/SOP.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/docs/SOP.md

## 2. 作者是如何应用这些元规则的

### 2.1 把“交接必须写 WHY”变成 handoff skill

对应 skill：

- `cat-cafe-skills/cross-cat-handoff/SKILL.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/cross-cat-handoff/SKILL.md

这个 skill 强制交接时写五件套：

- What
- Why
- Tradeoff
- Open Questions
- Next Action

这正是第三课里“WHY 比 WHAT 重要”的直接落地版本。

### 2.2 把“不能靠自信宣布完成”变成 quality gate

对应 skill：

- `cat-cafe-skills/quality-gate/SKILL.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/quality-gate/SKILL.md

这个 skill 的核心就是：

- 没有新鲜验证证据，不能声称完成
- 不能只说“应该没问题”
- 必须跑测试、看输出、验证行为
- 前端任务还要求截图、录屏或可视证据

这对应第三课中针对“过度自信”的补丁。

### 2.3 把“review 不能讨好用户”变成 receive-review

对应 skill：

- `cat-cafe-skills/receive-review/SKILL.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/receive-review/SKILL.md

这个 skill 强调：

- 禁止表演性同意
- 不能先说“你完全正确”
- 必须先分类问题，再验证，再修复
- reviewer 说法不对时可以 push back

这对应第三课里对 AI “讨好倾向”的纠偏。

### 2.4 把“请求 review 前先自检”变成 request-review

对应 skill：

- `cat-cafe-skills/request-review/SKILL.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/request-review/SKILL.md

这个 skill 要求：

- 发起 review 前必须先过 quality gate
- 带上原始需求摘录
- 带上测试/验证证据
- 指明 review 范围和目标

这使得 review 不是一句随便的“帮我看看”，而是一个结构化交接动作。

### 2.5 把“没有 reviewer 放行不能 merge”变成 merge gate

对应 skill：

- `cat-cafe-skills/merge-gate/SKILL.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/merge-gate/SKILL.md

这个 skill 负责把合入条件变成硬门禁，例如：

- reviewer 明确放行
- P1/P2 清零
- gate 命令通过
- PR / cloud review 状态满足

这就是第三课里“merge-approval-gate”的工程化实现。

## 3. 这些规则是怎么被触发的

作者没有把 skill 当成“可选参考”，而是把它们设计成“适用即必须加载”。

这个原则直接写在：

- `cat-cafe-skills/BOOTSTRAP.md`

参考：

- https://raw.githubusercontent.com/zts212653/clowder-ai/main/cat-cafe-skills/BOOTSTRAP.md

里面明确写了：

- Skill 适用就必须加载
- Claude: 自动触发
- Gemini: 自动触发
- Codex: 手动加载 skill 文件

同时还说明了挂载方式：

- 通过 symlink 链接到 `~/.claude/skills/`
- 链接到 `~/.codex/skills/`
- 链接到 `~/.gemini/skills/`

这表示作者不只是写了 skill 文件，而是真的把它们接入到各个 agent CLI 的实际运行环境里。

## 4. 整体工作方式

我对 `clowder-ai` 的理解是：

1. 用 `AGENTS.md / CLAUDE.md / GEMINI.md` 定义身份与总纲
2. 用 `shared-rules.md` 放通用元规则
3. 用各类 `SKILL.md` 在具体场景中强制执行规则
4. 用 `docs/SOP.md` 把这些 skill 串成完整开发流程

这套方法本质上是在回答第三课的问题：

“为什么普通 AI 只会说 looks good，而她们的 AI 可以做 6 轮严肃 review？”

答案不是模型更聪明，而是流程更硬、规则更明确、执行更结构化。

## 5. 一句话总结

`clowder-ai` 对元规则的落地方式是：

把抽象原则拆成 `入口规则 + 共用规则 + 场景 skill + SOP 流程`，并通过 skill 挂载与触发机制让这些规则在交接、review、验证、merge 等场景中被强制执行。
