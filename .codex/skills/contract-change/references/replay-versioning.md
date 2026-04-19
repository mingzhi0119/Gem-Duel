# Replay Versioning

## Current Repo Truth

- `SCHEMA_VERSION`: `7.0.0`
- `RULESET_VERSION`: `2026.1`
- `ENGINE_VERSION`: `2026.04-step8`
- Current bundle implementation stores both `commands[]` and `events[]`.
- 2026-04-19 removed `BEGIN_GEM_SELECTION`, `BEGIN_RESERVE`, `BEGIN_BUY`, and `BEGIN_PRIVILEGE` from the public command surface, so old `commands[]` streams that depend on those entries are not forward-compatible without migration.

## Frozen Governance Target

- Replays move to authoritative `MessagePack`.
- Replays store both `commands[]` and `events[]`.
- Replays add `engineVersion` and `finalStateHash`.

## Upgrade Matrix

| Change type                                    | Bump                  | ADR required | Migration note required |
| ---------------------------------------------- | --------------------- | ------------ | ----------------------- |
| Add optional contract field                    | `schemaVersion` minor | No           | Yes                     |
| Rename/remove contract field                   | `schemaVersion` major | Yes          | Yes                     |
| Change replay authority format                 | `schemaVersion` major | Yes          | Yes                     |
| Change rules without wire-shape change         | `rulesetVersion`      | Maybe        | Yes                     |
| Change engine semantics without ruleset rename | `engineVersion`       | Maybe        | Yes                     |

## Replay Safety Rules

- Treat format changes as breaking.
- Treat hash-strategy changes as breaking.
- Never claim command replay compatibility unless the migration matrix says so explicitly.
