# Phase Map

Current phase inventory from `packages/domain/src/index.ts`:

- `initialization`
- `modeSelection`
- `turnIdle`
- `gemSelection`
- `reserving`
- `buying`
- `privilege`
- `replay`
- `terminal`

## Current Intended Flow

- `initialization -> modeSelection -> turnIdle`
- `turnIdle -> gemSelection -> turnIdle`
- `turnIdle -> reserving -> turnIdle`
- `turnIdle -> buying -> turnIdle`
- `turnIdle -> privilege -> turnIdle`
- `turnIdle -> active royal effect handoff -> turnIdle`
- `turnIdle -> replay -> turnIdle`
- `turnIdle -> terminal`

## Governance Notes

- Step 03 removes the public `royalResolution` phase; royal handoff now lives in `activeEffects` while the public phase stays `turnIdle`.
- Chained effects and extra turns should be modeled through effect actors, not hidden cross-phase jumps.
- Buff is a semantic hook consumer, not a standalone phase in the main match flow.
