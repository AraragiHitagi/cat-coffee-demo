# Cat Coffee Demo

这个仓库用于沉淀 AI 第一课的学习结果，当前重点包括两部分：

1. 如何通过命令行最小化启动不同的 Agent CLI
2. 如何理解并总结元规则在真实项目中的落地方式

## 当前内容

- `minimal-codex.js`
  通过 `codex exec --json` 调起 Codex CLI，并逐行解析 JSON 事件，提取最终回复文本。

- `minimal-opencode.js`
  通过 `opencode run --format json` 调起 OpenCode CLI，并逐行解析 JSON 事件，提取回复文本。

- `invoke.js`
  提供统一的 `invoke(cli, prompt)` 方法，屏蔽 `codex` 和 `opencode` 在启动参数、事件格式、stderr 处理上的差异。

- `learning/clowder-ai-meta-rules-notes.md`
  总结 `clowder-ai` 项目如何把元规则落地为入口规则、共享规则、Skills 和 SOP。

- `learning/lesson-01-summary.md`
  对第一课学习内容做进一步整理，包括 CLI 启动思路、通用封装思路和元规则理解。

## 运行方式

### 1. 直接运行最小脚本

```bash
node minimal-codex.js "你是什么模型？"
node minimal-opencode.js "你是什么模型？"
```

### 2. 使用统一 invoke 接口

```js
const { invoke } = require("./invoke");

async function main() {
  const codexReply = await invoke("codex", "你好");
  const opencodeReply = await invoke("opencode", "你好");

  console.log("codex:", codexReply);
  console.log("opencode:", opencodeReply);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
```

## 设计要点

- 两个 CLI 都是通过 Node.js 原生 `child_process.spawn()` 调起
- 输出都采用逐行 JSON 解析，而不是依赖一次性 stdout 文本处理
- 不同 CLI 的事件格式不同，所以需要按 provider 分别提取文本
- `stderr` 不能直接粗暴丢弃，需要保留过滤能力，避免吞掉真实错误
- 抽象层应该放在“统一 invoke 接口”，而不是强行把两个 CLI 的协议揉成一种假格式

## 学习重点

这次第一课最值得记住的不是某条命令，而是两个抽象：

1. 从 SDK 思维转向 CLI 思维  
   当官方没有好用的 Agent SDK 时，可以从可执行 CLI 切入，通过进程管理和事件解析拿到 agent 能力。

2. 从 prompt 思维转向规则系统思维  
   元规则要真正生效，不能只写在提示词里，而要落成入口规则、Skills、流程门禁和交接模板。

