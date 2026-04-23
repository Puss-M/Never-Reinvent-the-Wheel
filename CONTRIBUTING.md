# Contributing

This repository is a portable instruction pack, not a general software project. Contributions should improve instruction quality, portability, and decision rigor.

## Good Contributions

- tighten search workflow or recommendation logic
- improve wording that makes the skill easier to reuse across agents
- add realistic examples to `README.md`
- fix contradictions between `SKILL.md`, `CLAUDE.md`, and `agents/openai.yaml`
- improve portability without making the repo dependent on one client

## Avoid

- platform-specific hacks that only work for one agent runtime
- adding heavy scaffolding with little value
- turning the repo into an implementation framework
- weakening the requirement to check existing projects before building

## Pull Request Notes

- Keep edits small and intentional.
- Preserve the core decision flow: GitHub first, selective secondary search, then a single final recommendation.
- When changing behavior, update both `SKILL.md` and `CLAUDE.md` unless the change is intentionally client-specific.
- If you change the public positioning of the repo, update `README.md` too.
