---
name: never-reinvent-the-wheel
description: Architectural deduplication and build-vs-buy review for new software tools, developer platforms, AI agents, automation ideas, and AI/CV model or workflow concepts. Use when Codex needs to determine whether an idea should adopt an existing open-source project, fork or compose an existing component, or be built from scratch by running a staged cross-platform search and maturity analysis.
---

# Never Reinvent The Wheel

Restate a proposed idea, search for serious existing projects, and produce a recommendation on whether to adopt, fork, or build. Treat this as a pre-development architecture review, not an implementation task.

This skill is intended to be portable across agent workflows. When used outside Codex, keep the workflow and decision criteria intact even if the host client does not support native skill loading.

## Core Rules

- Warn the user before searching if the idea appears sensitive, proprietary, or commercially confidential. Ask them to anonymize it first if needed.
- Use existing search capabilities and focused `site:` queries. Do not invent custom API integrations.
- Search GitHub first for every request. Do not skip directly to package indexes or model hubs.
- Keep the search narrow and evidence-based. Inspect only the strongest candidates instead of scraping large result sets.
- Include a real clickable URL for every project, package, model, or dataset mentioned.
- Do not fabricate popularity, maintenance, or capability claims. If evidence is weak, say so explicitly.
- Use current maintenance and adoption signals. Prefer real recency indicators, stars, forks, downloads, model likes, or similar ecosystem-specific traction signals when available.
- Stop and ask for confirmation after the GitHub phase and again after the secondary-platform phase before continuing to a broader search or final synthesis.

## Triggering

Use this skill proactively when the user is clearly about to build a complete product, subsystem, or workflow from scratch, even if they did not explicitly ask for a build-vs-buy review yet.

Strong trigger patterns:

- "I want to build", "help me build", "I am going to make", "create a project for"
- complete systems such as auth, upload, queue, editor, parser, crawler, chat, scheduling, feature flags, developer portals, agent frameworks, or workflow engines
- requests that imply a reusable product rather than a one-off script or tiny fix
- "from scratch", "without dependencies", "implement my own", "no framework"

High-frequency wheel-making areas:

- auth and permissions
- parsing and document extraction
- infrastructure and workflow orchestration
- common business subsystems such as billing, uploads, editors, dashboards, or notifications
- AI agent frameworks, automation runners, and multimodal pipelines

Do not trigger by default when:

- the user explicitly says the task is for learning, teaching, or practice
- the user is debugging or modifying an existing codebase
- the request is a narrow algorithm, regex, or function-level question
- the user has already chosen a concrete upstream project and wants help using it
- the task is obviously local and one-off rather than a reusable product decision

When triggering proactively, interrupt briefly before implementation work starts:

> "Before building this, I should check whether strong existing projects already cover most of it. I will do a GitHub baseline pass first."

## Workflow

### Phase 0: Frame The Request

Restate the idea in one short paragraph:

- what the user wants to build
- the primary users or use case
- the core capabilities implied by the request
- whether the idea is software/product, AI/CV, or mixed

Then derive a compact search plan:

- primary keywords
- synonyms and adjacent terms
- exclusions to avoid false positives
- likely platform sequence after GitHub

Prefer capability-oriented phrasing over marketing language. Break compound ideas into searchable building blocks.

### Phase 1: GitHub Baseline Search

GitHub is mandatory and always comes first. Use targeted search queries such as:

- `site:github.com <idea>`
- `site:github.com <core capability> open source`
- `site:github.com <adjacent term> github`

Prioritize reusable projects over tutorials, blog posts, wrappers, and abandoned demos.

For the top 3-5 serious candidates, capture only the minimum evidence needed:

- project name
- URL
- one-line purpose
- apparent scope and fit
- maintenance recency
- traction indicators
- obvious strengths or red flags

Then pause and report:

- the reformulated idea
- the GitHub search terms used
- the top candidates
- the leading patterns you see in the ecosystem
- what is still unknown

End this phase by explicitly asking whether to continue to secondary platforms, narrow the problem, or stop with a GitHub-only verdict.

### Phase 2: Secondary Platform Search

Choose platforms based on the idea type. Do not search every ecosystem by default.

For software or product ideas, prefer:

- npm
- PyPI
- other package ecosystems only if clearly relevant

For AI, ML, or CV ideas, prefer:

- Hugging Face
- Roboflow
- optionally model or dataset ecosystems that are clearly relevant

For mixed ideas, use both code ecosystems and AI ecosystems, but stay selective.

Search with focused queries such as:

- `site:npmjs.com <term>`
- `site:pypi.org <term>`
- `site:huggingface.co <term>`
- `site:roboflow.com <term>`

Limit detailed analysis to the top relevant candidates from each platform. Treat packages, models, and datasets as evidence of ecosystem maturity and reusable building blocks, not proof that the full product already exists.

If a search yields nothing useful, apply zero-result recovery before concluding the space is empty:

- remove overly specific qualifiers
- swap in synonyms
- search for the adjacent workflow rather than the exact product framing
- broaden from branded phrasing to capability phrasing

After this phase, pause again and summarize:

- which additional ecosystems were checked
- the strongest non-GitHub candidates
- whether the ecosystem suggests adopt, fork, or build pressure
- what uncertainty remains

### Phase 3: Final Verdict

Produce a concise decision report with these sections:

1. `Idea Restatement`
2. `Search Strategy`
3. `Candidate Comparison`
4. `Maturity Analysis`
5. `Gaps vs Requested Idea`
6. `Recommendation`
7. `Suggested Next Actions`

The `Candidate Comparison` section should be a compact table when possible. Evaluate each serious candidate on:

- relevance to the requested idea
- maintenance recency
- community traction
- completeness
- forkability or extensibility
- execution risk

The `Recommendation` section must choose exactly one:

- `Adopt existing project`
- `Fork/compose an existing component`
- `Build from scratch`

Justify the winning option and explain why the other two did not win.

## Decision Heuristics

Lean toward `Adopt existing project` when:

- one candidate already solves most of the core problem
- maintenance and community signals are healthy
- customization needs appear modest

Lean toward `Fork/compose an existing component` when:

- a full solution is not a fit, but strong subsystems or frameworks exist
- the gap is architectural integration, productization, or domain adaptation
- the upstream project is viable enough to reuse but not enough to adopt whole

Lean toward `Build from scratch` when:

- available options are stale, narrow, or structurally mismatched
- the idea depends on differentiated workflow or architecture not present upstream
- reuse would add more complexity than it removes

Do not recommend building from scratch just because no exact-name match exists. Look for reusable adjacent projects and components first.

## Output Discipline

- Prefer compact summaries over raw dumps.
- Mention only the strongest candidates.
- Call out uncertainty instead of padding with weak evidence.
- Distinguish between repositories, packages, models, datasets, and end-user products.
- Treat recent updates and community traction as evidence, not guarantees.
- If the user asks for a deeper pass after the final verdict, continue from the strongest branch instead of restarting from scratch.
