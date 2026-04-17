---
name: contract-change
description: Update contract-facing types, schemas, WebSocket messages, error codes, replay envelopes, and related governance docs in Gem Duel. Use when modifying `packages/contracts/*`, `packages/domain/*` error categories, room-service protocol fields, replay metadata, snapshot types, or any change that can break consumers across apps, engine, or services.
---

# Contract Change

Use this skill when a task touches the contract boundary. Keep the workflow contract-first, docs-synchronized, and replay-safe.

## Workflow

1. Read the current truth:
    - `references/existing-contracts.md`
    - `references/error-code-registry.md`
    - `references/replay-versioning.md`
    - `docs/30-contracts/contract-hardening-spec.md`
2. Change schemas first in `packages/contracts/src/*.ts`. If the change also affects categories or domain error shape, update `packages/domain/src/index.ts` in the same change.
3. Update contract docs in `docs/30-contracts/` and keep ZH/EN synchronized.
4. Update error-code references. If the change is breaking or changes replay compatibility, create an ADR from `templates/adr-template.md`.
5. Run `scripts/validate-contract.sh`. If snapshots are intentionally changing, update them explicitly after reviewing the diff.
6. Run `scripts/check-referenced.sh <symbol-or-event>` for renamed fields, messages, or error codes.
7. Update `docs/00-refactor/rebuild-execution-tracker.md` and the matching step log before closing the task.

## Breaking-Change Rules

- Treat replay wire-shape changes, snapshot-tier changes, and WS message shape changes as breaking until proven otherwise.
- Never remove an error code or message type silently. Deprecate or document the replacement path.
- Never update contracts without checking whether `apps/web`, `apps/room-service`, `packages/application`, and `packages/core-engine` need synchronized changes.

## Required Outputs

- Updated schema files
- Updated contract docs
- Updated error-code references
- ADR when compatibility or architectural policy changes
- Validation command output or an explicit note that the repo is not yet wired for the planned check

## Resources

- Read `references/existing-contracts.md` for the current contract inventory and the frozen target additions already documented in project docs.
- Read `references/error-code-registry.md` before adding or renaming any `DomainError.code`.
- Read `references/replay-versioning.md` before touching `schemaVersion`, `rulesetVersion`, `engineVersion`, or replay payload structure.
- Use `templates/migration-note-template.md` when a contract change needs a consumer migration note.
