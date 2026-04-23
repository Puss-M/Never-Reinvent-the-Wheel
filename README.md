# Never Reinvent the Wheel

`Never Reinvent the Wheel` is an open instruction pack for coding agents. It forces a build-vs-buy review before implementation work starts, so an agent checks serious existing projects first and then recommends whether to adopt, fork/compose, or build from scratch.

The repository is centered on a Codex-compatible `SKILL.md`, with a companion `CLAUDE.md` for Claude Code style workflows and a lightweight structure that other markdown-driven agents can adapt.

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
- Check only the most relevant secondary ecosystems for the idea type
- Pause after each search phase instead of over-searching by default
- Produce a final recommendation with one explicit outcome:
  `Adopt existing project`, `Fork/compose an existing component`, or `Build from scratch`

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
├── SKILL.md
└── agents/
    └── openai.yaml
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

### Example Use Cases

- A founder wants to validate whether a new AI workflow product is actually differentiated.
- A platform team wants to avoid rebuilding an internal tool that already exists upstream.
- An agent is about to implement a subsystem and needs a forced build-vs-buy checkpoint first.
- A research or CV workflow needs to check models, datasets, and codebases before any greenfield work starts.

## Decision Flow

1. Restate the idea and derive the search plan.
2. Search GitHub first and stop for review.
3. Search only the most relevant secondary ecosystems and stop again.
4. Deliver one final recommendation with supporting evidence.

## Scope and Limits

- This repository does not perform implementation.
- It favors evidence from strong candidates over broad scraping.
- It is designed for public internet research, so sensitive internal ideas should be anonymized first.
- It improves decision quality, but it does not guarantee that the chosen upstream project is safe, healthy, or production-ready.

## Contributing

Issues and pull requests are welcome if they improve search discipline, recommendation quality, or multi-agent portability. Keep changes focused on reusable instruction quality rather than client-specific hacks. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the preferred contribution scope.

## License

MIT
