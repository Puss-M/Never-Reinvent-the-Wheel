# Never Reinvent the Wheel

[简体中文](./README_zh.md)

`Never Reinvent the Wheel` is an open research pack for coding agents. It forces a GitHub-first, multi-platform build-vs-buy review before implementation starts, then helps the agent decide whether to adopt an existing project, fork or compose a component, or build from scratch.

The repository stays instruction-first: `SKILL.md` and `CLAUDE.md` define the decision process, while the `scripts/` directory adds optional helper tooling for repeatable evidence gathering.

## Who This Is For

Use this repository when you want an agent to evaluate ideas such as:

- developer tools
- SaaS or internal platforms
- AI agents and automations
- AI, CV, or ML product ideas
- reusable subsystems or workflow engines

This is most useful before architecture work or implementation begins.

## What It Enforces

- Reframe vague product ideas into concrete searchable capabilities
- Search GitHub first for serious reusable projects
- Inspect repository structure and key source files for serious GitHub candidates instead of trusting `README` alone
- Continue into the most relevant secondary ecosystems for the idea type, such as npm, PyPI, Hugging Face, or Roboflow
- Pause after each search phase instead of over-searching by default
- Produce one explicit outcome:
  `Adopt existing project`, `Fork/compose an existing component`, or `Build from scratch`

## When It Should Interrupt

This repository is designed to intervene before implementation when an agent sees obvious wheel-making signals, especially:

- "I want to build" requests for complete systems or products
- "from scratch" or "without dependencies" phrasing
- high-repeat categories such as auth, uploads, parsers, queues, dashboards, editors, workflow engines, and agent frameworks

It should usually stay quiet for learning exercises, bug fixing, narrow algorithm questions, or work that is clearly based on an already chosen upstream project.

## Supported Agent Entry Points

| Agent or workflow | Entry file | Notes |
| --- | --- | --- |
| Codex / skill-based clients | `SKILL.md` | Primary source of truth |
| Claude Code style workflows | `CLAUDE.md` | Same behavior, adapted to a general instruction file |
| Other markdown-driven agents | `SKILL.md` or `CLAUDE.md` | Copy or adapt the prompt file that best matches your client |

This repository is not an official integration for every agent. Different clients load instruction files differently, so treat the included files as portable prompt artifacts.

## Repository Layout

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

## Install

### Codex

Copy this folder into your local skills directory:

- Windows: `C:\CodexData\skills\never-reinvent-the-wheel`
- Fallback: `~/.codex/skills/never-reinvent-the-wheel`

Then restart the client or reload skills.

### Claude Code

Copy the contents of `CLAUDE.md` into the instruction file or project guidance mechanism you use with Claude Code. If your workflow supports repository-level agent instructions, keep `CLAUDE.md` in the repo root and point Claude Code at it.

### Other Agents

If your tool accepts a system prompt, instruction file, or reusable markdown playbook, start with `CLAUDE.md`. If it has first-class skill support similar to Codex, start with `SKILL.md`.

## Optional Helper Scripts

The scripts are optional. The repository still works as a pure instruction pack without them.

Examples:

```bash
node scripts/github-baseline-search.mjs "feature flag platform" --limit 5
node scripts/npm-baseline-search.mjs "feature flag platform" --min-downloads 10000
node scripts/hf-baseline-search.mjs "document extraction agent" --type ai
node scripts/search-stack.mjs "document extraction agent" --type ai --limit 5
```

Script boundary:

- scripts gather evidence and normalize results into JSON
- scripts do not decide `Adopt`, `Fork/compose`, or `Build from scratch`
- the final recommendation is still an agent judgment based on the evidence

## Platform Selection Matrix

| Idea type | Mandatory first phase | Secondary platforms |
| --- | --- | --- |
| `software` | GitHub repositories | npm, PyPI |
| `ai` | GitHub repositories | Hugging Face, Roboflow |
| `mixed` | GitHub repositories | npm, PyPI, Hugging Face, Roboflow |

Use the second phase selectively:

- if GitHub already exposes one or more strong mature matches, use secondary platforms to validate ecosystem depth instead of widening endlessly
- if secondary platforms add no meaningful evidence, stop
- do not treat the absence of an exact-name match as evidence for `Build from scratch`

## Evaluation Framework

The final recommendation should compare serious candidates on these dimensions:

- `relevance`
- `maintenance`
- `traction`
- `completeness`
- `extensibility`
- `execution_risk`

The helper scripts expose enough raw metadata to support this comparison, but they do not assign the final verdict.

## Example Prompts

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

## Example Outputs

### GitHub Phase Example

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

### Secondary Platform Example

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

### Final Verdict Example

```text
Recommendation: Fork/compose an existing component

Why:
- GitHub already shows strong open-source building blocks.
- npm and PyPI confirm mature package ecosystems.
- Hugging Face adds usable model assets, but not a full end-to-end product.
- Building from scratch would duplicate existing infrastructure while adding little differentiation.
```

## Example Use Cases

- A founder wants to validate whether a new AI workflow product is actually differentiated.
- A platform team wants to avoid rebuilding an internal tool that already exists upstream.
- An agent is about to implement a subsystem and needs a forced build-vs-buy checkpoint first.
- A research or CV workflow needs to check models, datasets, and codebases before any greenfield work starts.

## Decision Flow

1. Restate the idea and derive the search plan.
2. Search GitHub first and stop for review.
   For each serious candidate, inspect repo structure and 1 to 3 implementation files before making capability claims.
3. Search the most relevant secondary ecosystems for the idea type and stop again.
4. Deliver one final recommendation with supporting evidence.

## Scope and Limits

- This repository does not perform implementation.
- It favors evidence from strong candidates over broad scraping.
- It is intentionally GitHub-first, not GitHub-only.
- The Roboflow helper is experimental for live use because the documented Universe API expects an API key.
- It is designed for public internet research, so sensitive internal ideas should be anonymized first.
- It improves decision quality, but it does not guarantee that the chosen upstream project is safe, healthy, or production-ready.

## Contributing

Issues and pull requests are welcome if they improve search discipline, recommendation quality, or multi-agent portability. Keep changes focused on reusable instruction quality rather than client-specific hacks. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the preferred contribution scope.

## License

MIT
