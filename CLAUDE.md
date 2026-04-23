# Never Reinvent the Wheel

Use this instruction file when the task is to decide whether an idea should adopt an existing project, fork or compose an existing component, or be built from scratch.

Treat this as a pre-development architecture review, not an implementation task.

## Core Rules

- Warn before searching if the idea appears sensitive, proprietary, or commercially confidential. Ask the user to anonymize it first if needed.
- Search GitHub first for every request. Do not skip directly to package indexes, model hubs, or app directories.
- Use narrow, evidence-based queries. Inspect only the strongest candidates instead of scraping large result sets.
- Include a real URL for every repository, package, model, dataset, or product mentioned.
- Do not invent popularity, maintenance, or feature claims. If evidence is weak, say so explicitly.
- Prefer current maintenance and adoption signals such as update recency, stars, forks, downloads, likes, or ecosystem-specific traction markers.
- Stop and ask for confirmation after the GitHub phase and again after the secondary-platform phase before broadening the search or delivering final synthesis.

## Triggering

Use this instruction pack proactively when the user is about to build a complete product, subsystem, or workflow from scratch.

Strong trigger patterns:

- "I want to build", "help me build", "create a project", "design a system"
- "from scratch", "without dependencies", "implement my own", "no framework"
- requests for reusable products such as auth, upload, queue, parser, chat, editor, dashboard, agent, or automation platforms

High-frequency wheel-making areas:

- auth and permissions
- parsers, crawlers, and document extraction
- chat, queues, schedulers, logging, and workflow engines
- billing, uploads, editors, dashboards, and admin systems
- AI agent frameworks, orchestration layers, and multimodal pipelines

Do not trigger by default when:

- the user says it is for learning, teaching, or practice
- the user is debugging or editing existing code
- the question is narrow and function-level
- the user already selected a specific upstream project
- the task is clearly local, one-off, or not a build-vs-buy decision

When triggering proactively, interrupt briefly before implementation work starts:

> "Before building this, I should check whether strong existing projects already cover most of it. I will do a GitHub baseline pass first."

## Workflow

### Phase 0: Frame the Request

Restate the idea in one short paragraph:

- what the user wants to build
- who it is for
- the core capabilities implied by the request
- whether the idea is software/product, AI/CV, or mixed

Then derive a compact search plan:

- primary keywords
- synonyms and adjacent terms
- exclusions to avoid false positives
- likely platform sequence after GitHub

Prefer capability-oriented phrasing over marketing phrasing. Break compound ideas into searchable building blocks.

### Phase 1: GitHub Baseline Search

GitHub is mandatory and always comes first. Use targeted search queries such as:

- `site:github.com <idea>`
- `site:github.com <core capability> open source`
- `site:github.com <adjacent term> github`

Prioritize reusable projects over tutorials, wrappers, thin demos, and abandoned experiments.

For the top 3 to 5 serious candidates, capture only the minimum evidence needed:

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
- the leading ecosystem patterns
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
- other model or dataset ecosystems only if clearly relevant

For mixed ideas, use both code ecosystems and AI ecosystems, but stay selective.

Search with focused queries such as:

- `site:npmjs.com <term>`
- `site:pypi.org <term>`
- `site:huggingface.co <term>`
- `site:roboflow.com <term>`

Treat packages, models, and datasets as evidence of reusable building blocks or ecosystem maturity, not proof that the full product already exists.

If a search yields nothing useful, recover before concluding the space is empty:

- remove overly specific qualifiers
- swap in synonyms
- search the adjacent workflow rather than the exact product framing
- broaden from branded phrasing to capability phrasing

After this phase, pause again and summarize:

- which ecosystems were checked
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

The recommendation must choose exactly one:

- `Adopt existing project`
- `Fork/compose an existing component`
- `Build from scratch`

Explain why the winning option beats the other two.

## Decision Heuristics

Lean toward `Adopt existing project` when:

- one candidate already solves most of the core problem
- maintenance and community signals are healthy
- customization needs appear modest

Lean toward `Fork/compose an existing component` when:

- a full solution is not a fit, but strong subsystems or frameworks exist
- the gap is integration, productization, or domain adaptation
- the upstream is viable enough to reuse but not enough to adopt wholesale

Lean toward `Build from scratch` when:

- available options are stale, narrow, or structurally mismatched
- the idea depends on a differentiated workflow or architecture not present upstream
- reuse would add more complexity than it removes

Do not recommend building from scratch just because no exact-name match exists. Look for reusable adjacent projects first.

## Output Discipline

- Prefer compact summaries over raw dumps.
- Mention only the strongest candidates.
- Call out uncertainty instead of padding with weak evidence.
- Distinguish between repositories, packages, models, datasets, and end-user products.
- Treat recency and traction as evidence, not guarantees.
