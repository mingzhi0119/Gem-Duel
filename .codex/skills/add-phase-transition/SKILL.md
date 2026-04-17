---
name: add-phase-transition
description: Add or revise a game phase, command transition, guard, or effect-actor handoff in the deterministic engine. Use when changing `packages/core-engine/*`, `packages/contracts/*` command shapes, phase legality, typed guard results, or replay-visible transition behavior.
---

# Add Phase Transition

Use this skill when a task changes legal phase transitions, command guards, or actor handoff behavior in the match state machine.

## Workflow

1. Read the current machine truth:
    - `references/phase-map.md`
    - `references/command-table.md`
    - `references/effect-queue.md`
    - `docs/20-domain/determinism-and-replay-discipline.md`
2. If the task introduces or renames a command/event shape, use `contract-change` first.
3. Update the phase map, guard reasoning, and effect-actor handoff plan before changing implementation files.
4. Start from `templates/command.ts.template` and `templates/phase-guard.test.ts.template` so command names, guard results, and failure cases stay consistent.
5. Keep every transition explicit: source phase, command, target phase, emitted event, and replay consequence.
6. Run `scripts/check-exhaustiveness.sh <phase-or-command>` and inspect every reported surface before closing the task.
7. If the transition changes gameplay semantics, hand off to `replay-golden` for fixture capture or verification.
8. Update `docs/00-refactor/rebuild-execution-tracker.md` and the matching step log.

## Guardrails

- A phase change is not done until command legality, guard failures, typed results, and replay consequences all line up.
- Never add a transition that bypasses the effect actor lifecycle documented for Step 02.5 and Step 03.
- Never hide a transition in UI code, transport code, or room-service orchestration.
- Prefer exhaustive matching and explicit state-machine entries over fallthrough logic.

## Required Outputs

- Updated command or phase contract when needed
- Updated state-machine transition and guard tests
- Updated phase/command docs
- Replay note when transition semantics affect final hashes

## Resources

- `references/phase-map.md`: current phases and intended adjacency.
- `references/command-table.md`: legal command matrix by phase.
- `references/effect-queue.md`: maps older queue terminology onto the project-standard actor lifecycle.
