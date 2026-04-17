---
name: replay-golden
description: Capture, verify, migrate, and review golden replays for deterministic regression. Use when changing replay schemas, `finalStateHash` behavior, state-machine semantics, room-service resync behavior, or any gameplay rule that can alter authoritative replay outputs.
---

# Replay Golden

Use this skill when replay fixtures or deterministic expectations need to be captured, checked, or deliberately updated.

## Workflow

1. Read:
    - `references/replay-format.md`
    - `references/hash-strategy.md`
    - `references/migration-matrix.md`
    - `docs/20-domain/determinism-and-replay-discipline.md`
2. Decide whether the task is capture, verify, or migrate.
3. Use the matching script:
    - `scripts/capture-replay.ts`
    - `scripts/verify-replay.ts`
    - `scripts/migrate-replay.ts`
4. If the replay schema or metadata changes, use `contract-change` before touching fixtures.
5. Compare the resulting `finalStateHash` against the expected value and record whether the semantic change is intentional.
6. Update fixture notes or the matching example so reviewers can see why the replay exists.
7. Update `docs/00-refactor/rebuild-execution-tracker.md` and the matching step log.

## Guardrails

- `events[]` remain the authoritative replay truth; `commands[]` are retained for debug and review.
- Never accept "looks fine" as replay validation. Always use hashes or a documented migration path.
- Never overwrite a golden replay silently. Record why the hash changed and whether a migration or ADR is needed.
- Keep spectator filtering, seq behavior, and resync semantics in mind when replay payloads change.

## Required Outputs

- Captured, verified, or migrated replay fixture
- Hash comparison result
- Migration note or ADR pointer when compatibility changes
- Tracker and log update

## Resources

- `references/replay-format.md`: authoritative replay fields and storage rules.
- `references/hash-strategy.md`: stable hash construction requirements.
- `references/migration-matrix.md`: allowed and forbidden cross-version replay moves.
- `examples/classic-golden-replay.md`: what a well-documented golden replay should explain.
