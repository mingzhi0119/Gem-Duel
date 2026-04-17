# Contract Migration Note

- Change summary: Step 03 removes `royalResolution` from the public `GamePhase` surface and moves `finalStateHash` authority beside `packages/core-engine`.
- Affected schemas or message types: `GamePhase`, snapshot payloads that expose `context.phase`, generated OpenAPI / AsyncAPI documents, and `ReplayBundle.finalStateHash` ownership.
- Old shape: snapshots could expose `context.phase = 'royalResolution'`, and replay hashing was assembled in `packages/application`.
- New shape: snapshots no longer expose `royalResolution`; royal handoff is represented through `activeEffects`, and replay/hash helpers are exported by `packages/core-engine`.
- Required consumer updates: remove UI or orchestration branches keyed on `royalResolution`, read royal pending state from `activeEffects`, and consume engine-owned replay/hash helpers instead of local hashing utilities.
- Replay/version impact: `SCHEMA_VERSION` bumps for the public phase-surface change, `ENGINE_VERSION` bumps for the replay/hash ownership change, and existing replay fixtures must be regenerated together with contract artifacts.
- ADR link: [`ADR-0005-step-03-phase-tightening-and-replay-authority.md`](../90-adr/ADR-0005-step-03-phase-tightening-and-replay-authority.md)
