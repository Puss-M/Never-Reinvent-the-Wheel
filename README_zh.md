# Never Reinvent the Wheel

[English](./README.md)

`Never Reinvent the Wheel` 是一个面向编码 Agent 的开源指令包。它的目标是在真正开始实现之前，强制执行一次 build-vs-buy 审查：先做 GitHub 优先、再按需扩展到其他平台的多平台搜索，然后再决定应该直接采用、基于现有组件 fork/组合，还是从零开始构建。

这个仓库以兼容 Codex 的 `SKILL.md` 为核心，同时提供适配 Claude Code 风格工作流的 `CLAUDE.md`。整体结构保持轻量，也方便其他支持 Markdown 指令文件的 Agent 复用。

## 适用场景

当你希望 Agent 在开始动手之前，先评估下面这类想法是否已经有成熟方案时，可以使用这个仓库：

- 开发者工具
- SaaS 或内部平台
- AI Agent 与自动化系统
- AI、CV、ML 相关产品想法
- 可复用的子系统、工作流引擎或基础设施能力

它最适合用在架构设计或实现之前的决策阶段。

## 它会强制做什么

- 把模糊的产品想法重写成可搜索的能力描述
- 先在 GitHub 上做第一轮严肃的开源项目基线搜索
- 再根据想法类型，只在确实相关的生态中继续做第二阶段搜索，例如 npm、PyPI、Hugging Face、Roboflow
- 每个搜索阶段结束后先停下来汇报，而不是默认无限扩大搜索
- 最终只给出一个明确结论：
  `Adopt existing project`、`Fork/compose an existing component` 或 `Build from scratch`

## 它会在什么时候打断实现

这个仓库的设计目标之一，就是在 Agent 看到明显“要开始造轮子”的信号时，先插入一次审查，典型场景包括：

- 用户说“我想做一个……”并且目标是完整系统或产品
- 用户强调“从零开始”“不要依赖”“自己实现”
- 高重复领域，例如认证、上传、解析器、队列、仪表盘、编辑器、工作流引擎、Agent 框架

以下场景通常不应该主动打断：

- 学习、教学、练习性质的请求
- 调试或修改现有代码
- 很窄的算法、函数或正则问题
- 已经明确选定上游项目，只是需要基于它继续做事

## 支持的 Agent 入口

| Agent 或工作流 | 入口文件 | 说明 |
| --- | --- | --- |
| Codex / skill 类客户端 | `SKILL.md` | 主入口 |
| Claude Code 风格工作流 | `CLAUDE.md` | 行为一致，但改写成通用指令文件 |
| 其他支持 Markdown 指令的 Agent | `SKILL.md` 或 `CLAUDE.md` | 选择更适合你客户端的版本 |

这个仓库不是每个 Agent 的官方集成。不同客户端加载指令文件的方式不同，所以这里提供的是可移植的 prompt / instruction artifacts。

## 仓库结构

```text
.
├── CLAUDE.md
├── LICENSE
├── README.md
├── README_zh.md
├── SKILL.md
├── scripts/
│   ├── github-baseline-search.mjs
│   └── validate-repo.mjs
└── agents/
    └── openai.yaml
```

## 安装方式

### Codex

把整个目录复制到本地 skills 目录：

- Windows: `C:\CodexData\skills\never-reinvent-the-wheel`
- 兜底路径: `~/.codex/skills/never-reinvent-the-wheel`

然后重启客户端或重新加载 skills。

### Claude Code

把 `CLAUDE.md` 的内容放到你在 Claude Code 中使用的 instruction file 或项目级指导文件中。如果你的工作流支持仓库级 Agent 指令，也可以直接保留 `CLAUDE.md` 在仓库根目录并让 Claude Code 使用它。

### 其他 Agent

如果你的工具支持 system prompt、instruction file 或可复用 Markdown playbook，优先从 `CLAUDE.md` 开始；如果它更接近 Codex 的 skill 机制，则优先使用 `SKILL.md`。

## 可选辅助脚本

如果你希望用一个可重复的 GitHub 基线搜索，而不是每次都临时手搜，可以使用：

```bash
node scripts/github-baseline-search.mjs "feature flag platform"
node scripts/github-baseline-search.mjs "document extraction agent" --limit 5 --min-stars 200
```

这个脚本是可选的，而且它只覆盖 GitHub 基线阶段。完整流程并不止 GitHub，还会在需要时继续检查最相关的二级平台。

## 示例 Prompt

```text
Use never-reinvent-the-wheel to evaluate whether an AI code review assistant should reuse an existing project, fork a component, or be built from scratch.
```

```text
Before we build this browser automation platform, do a never-reinvent-the-wheel pass and tell me whether we should adopt, fork, or build.
```

```text
Evaluate whether a self-hosted feature flag platform for internal tools should adopt an existing open-source project or be built from scratch.
```

```text
I want to build a multimodal document extraction agent for invoices and contracts. Run a never-reinvent-the-wheel review across GitHub and relevant AI ecosystems first.
```

```text
Before implementing this developer portal, compare serious open-source candidates and tell me whether we should adopt one, fork a subsystem, or build our own stack.
```

### 示例使用场景

- 创业者想验证一个新的 AI workflow 产品到底有没有真正差异化。
- 平台团队想避免重复开发一个开源社区里已经很成熟的内部工具。
- 一个 Agent 在实现子系统之前，需要先经过 build-vs-buy 检查。
- 一个 AI / CV 工作流在开始 greenfield 开发前，需要先核查模型、数据集和代码生态。

## 决策流程

1. 重述想法并抽取搜索计划。
2. 先做 GitHub 基线搜索并停下来汇报。
3. 再按想法类型搜索最相关的二级生态，并再次停下来汇报。
4. 给出一个最终建议，并附上核心证据。

## 边界和限制

- 这个仓库不负责直接实现功能。
- 它更偏向分析强候选，而不是广撒网式抓取。
- 它是 GitHub 优先，不是 GitHub 唯一。
- 它面向公开互联网研究，因此敏感内部想法应先匿名化。
- 它能提升决策质量，但不能保证被推荐的上游项目一定安全、健康或适合生产。

## 参与贡献

欢迎通过 issue 和 PR 改进搜索纪律、推荐质量或多 Agent 可移植性。请尽量保持改动聚焦在通用指令质量上，而不是只为某一个客户端写特化 hack。更细的贡献边界见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## License

MIT
