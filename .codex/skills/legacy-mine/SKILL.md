---
name: legacy-mine
description: Mine docs/99-legacy notes and git history for rule intent without reusing code. Use when extracting legacy rule intent or documenting classic-rule parity expectations before a clean-room rewrite.
---

# Legacy Mine

Use this skill when the rebuild needs legacy rule intent, but the code itself must stay quarantined.

## Workflow

1. Run `scripts/find-legacy-topic.sh <topic>` to find existing extracts and the best available historical sources.
2. Read `references/extracted-topics.md` and `docs/99-legacy/README.md` before opening history or any archived legacy material.
3. Inspect the smallest possible surface in `docs/99-legacy/` first, then use git history for surrounding legacy context when the current notes are insufficient. Read only; do not copy code into notes or implementation files.
4. Translate what you found into rule intent, invariants, edge cases, and hidden assumptions.
5. Create or update `docs/99-legacy/extracted-<topic>.md` from `templates/extracted-topic-template.md`.
6. When implementation work starts later, rebuild from scratch through `contracts -> domain -> core-engine`.
7. Add replay parity notes if the extracted rule affects deterministic behavior.
8. Update `docs/00-refactor/rebuild-execution-tracker.md` and the matching step log.

## Guardrails

- Never import, paste, or transliterate legacy code line-for-line.
- The extraction note must describe rules in prose, data shape, and test cases, not copied implementation.
- If a topic has already been extracted, extend that note instead of duplicating the excavation.
- Any parity claim should point at a replay or scenario, not at a copied function.
- After Step 08, treat `docs/99-legacy/` plus git history as the durable source set; do not rely on a live legacy source tree being present.

## Required Outputs

- A new or updated `docs/99-legacy/extracted-<topic>.md`
- A short legacy-source inventory note
- A clean-room implementation plan or follow-up pointer
- Replay parity note when the rule changes deterministic outputs

## Resources

- `references/extracted-topics.md`: inventory of already-mined topics and their history pointers.
- `templates/extracted-topic-template.md`: standard extraction note format.
- `scripts/find-legacy-topic.sh`: avoid duplicated archaeology before opening docs, history, or archived legacy material.
