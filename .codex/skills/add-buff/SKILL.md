---
name: add-buff
description: Add or revise a Roguelike Buff under the frozen hook/effect model. Use when adding files in `packages/domain/buffs/`, updating Buff registries, defining Buff-facing replay behavior, or documenting Buff stacking, rarity, and hook semantics.
---

# Add Buff

Use this skill when a task adds or changes a Buff and needs to stay inside the frozen hook/effect system.

## Workflow

1. Read the current governance truth:
    - `references/hook-points.md`
    - `references/effect-primitives.md`
    - `references/buff-taxonomy.md`
    - `docs/20-domain/buff-hook-system.md`
2. Choose the nearest valid `EffectHookPoint`. Do not invent a new hook if an existing one fits.
3. Choose effect atoms from `references/effect-primitives.md`. If the required effect does not exist, stop and route the task through Step 02.5 with `contract-change`.
4. Copy `templates/buff.ts.template` and `templates/buff.test.ts.template` into the target Buff files under `packages/domain/buffs/`.
5. Compare the intended Buff against the closest example in `examples/` and keep naming, metadata, stacking, and serialization shape consistent.
6. Add or update the Buff registry entry and the matching docs for rarity, scope, and hook ordering.
7. Run `scripts/check-buff-governance.sh <buff-id>` and verify the Buff is referenced in the registry, docs, and at least one replay or replay plan.
8. If the Buff changes classic semantics or replay output, use `replay-golden` before closing the task.
9. Update `docs/00-refactor/rebuild-execution-tracker.md` and the matching step log.

## Guardrails

- Buffs persist by `id` plus minimal instance context only.
- Buffs do not read time, random, IO, transport state, or UI state directly.
- Buffs do not hide logic in ad hoc `if/else` branches inside core-engine files.
- Buff stacking must be explicit: scope order, registry order, and acquisition order all need tests or docs.
- Any new hook point or effect atom is a Step 02.5 contract decision, not a Step 07 shortcut.

## Required Outputs

- Buff implementation file
- Matching Buff test file
- Registry update
- Docs update for hook point, effect atoms, rarity, and stacking semantics
- Replay validation note when gameplay semantics or final hashes can change

## Resources

- `references/hook-points.md`: current hook inventory and the intended ownership of each hook.
- `references/effect-primitives.md`: approved effect atoms and escalation rules.
- `references/buff-taxonomy.md`: rarity, scope, lifecycle, and stacking categories.
- `examples/`: closest example first, then adapt rather than inventing structure from scratch.
