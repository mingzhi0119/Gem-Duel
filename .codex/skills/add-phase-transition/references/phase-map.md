# Phase Map

Current phase inventory from `packages/domain/src/index.ts`:

- `initialization`
- `modeSelection`
- `turnIdle`
- `gemSelection`
- `reserving`
- `buying`
- `privilege`
- `royalResolution`
- `buffResolution`
- `replay`
- `terminal`

## Current Intended Flow

- `initialization -> modeSelection -> turnIdle`
- `turnIdle -> gemSelection -> turnIdle`
- `turnIdle -> reserving -> turnIdle`
- `turnIdle -> buying -> turnIdle`
- `turnIdle -> privilege -> turnIdle`
- `turnIdle -> royalResolution -> turnIdle`
- `turnIdle -> buffResolution -> turnIdle`
- `turnIdle -> replay -> turnIdle`
- `turnIdle -> terminal`

## Governance Notes

- Step 03 upgrades this to an actor-based machine, but the semantic adjacency still needs to stay explicit.
- Chained effects and extra turns should be modeled through effect actors, not hidden cross-phase jumps.
