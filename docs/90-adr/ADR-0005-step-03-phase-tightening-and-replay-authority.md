# ADR-0005: Step 03 Phase Tightening and Replay Authority

### Decision

- Remove `royalResolution` from the public `GamePhase` surface in Step 03 and represent royal handoff through the frozen effect actor lifecycle plus `activeEffects`.
- Move `finalStateHash`, replay bundle assembly, replay verification, and stable hash projection beside `packages/core-engine` instead of keeping hash authority in `packages/application`.
- Treat committed repo golden fixtures as JSON debug/export views of the authoritative replay bundle while keeping `MessagePack` as the governance-level authoritative wire format.

### Rationale

- `royalResolution` was explicitly left behind in Step 02.5 as a transitional public phase and now needs to be tightened so Step 04 can build on actor handoff rather than another phase layer.
- Golden replay regression is only trustworthy if replay build/verify and final-state hashing live next to the engine truth instead of in a higher orchestration layer.
- The repository still needs human-reviewable fixtures and schema drift checks in Step 03 even though the long-term authoritative replay transport remains `MessagePack`.

### Consequences

- Consumers may no longer branch on `snapshot.context.phase === 'royalResolution'`; they must instead react to `activeEffects` and command legality.
- Step 03 requires a breaking contract/version update and synchronized contract regeneration because the public phase enum changes.
- Future replay regression, golden capture, and verification work can reuse the engine-owned helpers without duplicating hash logic in application or service layers.
