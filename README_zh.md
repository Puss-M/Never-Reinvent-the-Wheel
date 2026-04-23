# Never Reinvent the Wheel

[English](./README.md)

`Never Reinvent the Wheel` 是一个面向编码 Agent 的开源 research pack。它会在真正开始实现之前，强制执行一次 GitHub 优先、再按需扩展到其他平台的 build-vs-buy 审查，然后帮助 Agent 判断应该直接采用现有项目、基于现有组件 fork/组合，还是从零开始构建。

这个仓库仍然保持 instruction-first：`SKILL.md` 和 `CLAUDE.md` 定义决策流程，`scripts/` 目录则提供可选的辅助脚本，用于更稳定地抓取证据。

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
- 对严肃候选仓库检查目录结构和关键源码文件，而不是只根据 `README` 下判断
- 再根据想法类型继续查最相关的二级生态，例如 npm、PyPI、Hugging Face、Roboflow
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
├── agents/
│   └── openai.yaml
└── scripts/
    ├── _shared.mjs
    ├── fixtures/
    │   └── search-fixtures.json
    ├── github-baseline-search.mjs
    ├── hf-baseline-search.mjs
    ├── npm-baseline-search.mjs
    ├── pypi-baseline-search.mjs
    ├── roboflow-baseline-search.mjs
    ├── search-stack.mjs
    └── validate-repo.mjs
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

这些脚本都是可选的。即使完全不用脚本，这个仓库仍然可以作为纯 instruction pack 使用。

示例：

```bash
node scripts/github-baseline-search.mjs "feature flag platform" --limit 5
node scripts/npm-baseline-search.mjs "feature flag platform" --min-downloads 10000
node scripts/hf-baseline-search.mjs "document extraction agent" --type ai
node scripts/search-stack.mjs "document extraction agent" --type ai --limit 5
```

脚本边界：

- 脚本负责抓取证据并统一成 JSON
- 脚本不直接决定 `Adopt`、`Fork/compose` 或 `Build from scratch`
- 最终结论仍然由 Agent 综合判断

## 平台选择矩阵

| 想法类型 | 必须先查 | 第二阶段平台 |
| --- | --- | --- |
| `software` | GitHub 仓库 | npm、PyPI |
| `ai` | GitHub 仓库 | Hugging Face、Roboflow |
| `mixed` | GitHub 仓库 | npm、PyPI、Hugging Face、Roboflow |

第二阶段应当有选择地使用：

- 如果 GitHub 已经出现高拟合的成熟项目，第二阶段主要用于验证生态深度，而不是继续无限扩搜
- 如果二级平台没有带来新的强证据，就应停止
- 不要把“没有同名项目”当作 `Build from scratch` 的依据

## 评估框架

最终结论应该围绕这些维度比较候选项：

- `relevance`
- `maintenance`
- `traction`
- `completeness`
- `extensibility`
- `execution_risk`

辅助脚本会尽量输出支撑这些维度的原始字段，但不会直接给最终结论。

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

## 示例输出

### GitHub 阶段示例

```json
{
  "platform": "github",
  "status": "ok",
  "query": "feature flag platform",
  "returned_count": 2,
  "items": [
    {
      "title": "example/feature-flag-platform",
      "url": "https://github.com/example/feature-flag-platform",
      "metrics": {
        "stars": 5400,
        "forks": 620
      },
      "assessment": {
        "relevance": "requires_agent_judgment",
        "maintenance": "high",
        "traction": "high"
      }
    }
  ]
}
```

### 二级平台阶段示例

```json
{
  "platform": "huggingface",
  "status": "ok",
  "query": "document extraction agent",
  "source_breakdown": {
    "models": 1,
    "datasets": 1,
    "spaces": 1
  },
  "items": [
    {
      "source_type": "model",
      "title": "example/doc-extractor-model",
      "metrics": {
        "likes": 480,
        "downloads": 9400
      }
    }
  ]
}
```

### 最终结论示例

```text
Recommendation: Fork/compose an existing component

Why:
- GitHub 已经显示出强候选的开源基础项目。
- npm 和 PyPI 证明相关包生态已经比较成熟。
- Hugging Face 提供了可用的模型资产，但没有完整的端到端产品。
- 从零开始会重复建设已有基础设施，而新增差异化有限。
```

## 示例使用场景

- 创业者想验证一个新的 AI workflow 产品到底有没有真正差异化。
- 平台团队想避免重复开发一个开源社区里已经很成熟的内部工具。
- 一个 Agent 在实现子系统之前，需要先经过 build-vs-buy 检查。
- 一个 AI / CV 工作流在开始 greenfield 开发前，需要先核查模型、数据集和代码生态。

## 决策流程

1. 重述想法并抽取搜索计划。
2. 先做 GitHub 基线搜索并停下来汇报。
   对每个严肃候选，先检查仓库结构和 1 到 3 个关键实现文件，再描述它真实具备什么能力。
3. 再按想法类型搜索最相关的二级生态，并再次停下来汇报。
4. 给出一个最终建议，并附上核心证据。

## 边界和限制

- 这个仓库不负责直接实现功能。
- 它更偏向分析强候选，而不是广撒网式抓取。
- 它是 GitHub 优先，不是 GitHub 唯一。
- Roboflow 辅助脚本的实时模式目前是实验性的，因为官方 Universe API 需要 API key。
- 它面向公开互联网研究，因此敏感内部想法应先匿名化。
- 它能提升决策质量，但不能保证被推荐的上游项目一定安全、健康或适合生产。

## 参与贡献

欢迎通过 issue 和 PR 改进搜索纪律、推荐质量或多 Agent 可移植性。请尽量保持改动聚焦在通用指令质量上，而不是只为某一个客户端写特化 hack。更细的贡献边界见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## License

MIT
