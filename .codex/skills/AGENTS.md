# Skills Rules

## MUST

- Every project-local skill must keep `SKILL.md` at or below 200 lines.
- Every skill frontmatter `description` must say `Use when ...`.
- Every skill must include at least one `references/` file, plus at least one `templates/` or `examples/` file, plus at least one `scripts/` file.
- Every skill must be referenced by `docs/00-refactor/rebuild-execution-tracker.md`.
- Keep skills focused on workflow and governance; do not place product implementation here.

## SHOULD

- Prefer progressive disclosure: short `SKILL.md`, deeper detail in `references/`.
- Keep templates and examples small enough to adapt quickly.
- Keep scripts safe to run in a partially built repo.

## NEVER DO

- Never turn a skill into a dumping ground for long architecture prose.
- Never duplicate product source files inside `.codex/skills/`.
