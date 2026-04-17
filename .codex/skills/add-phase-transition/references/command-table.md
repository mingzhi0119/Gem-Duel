# Command Table

Current legal command matrix from `packages/core-engine/src/runtime.ts`:

- `initialization`: `SELECT_MODE`
- `modeSelection`: `START_MATCH`
- `turnIdle`: `BEGIN_GEM_SELECTION`, `BEGIN_RESERVE`, `BEGIN_BUY`, `BEGIN_PRIVILEGE`, `BEGIN_ROYAL_RESOLUTION`, `ENTER_REPLAY`, `FINISH_MATCH`
- `turnIdle` with pending royal effect: `SELECT_ROYAL`
- `gemSelection`: `TAKE_GEM`
- `reserving`: `RESERVE_CARD`
- `buying`: `BUY_CARD`
- `privilege`: `USE_PRIVILEGE`
- `replay`: `EXIT_REPLAY`
- `terminal`: no commands

## Change Checklist

- If a command becomes legal in a new phase, update the command table and the corresponding guard tests.
- If command legality depends on `activeEffects`, document both the public phase and the effect context.
- If a command name changes, route through `contract-change`.
- If a command affects replay hashes or event ordering, route through `replay-golden`.
- Do not create commands for private Buff resolution phases; Buff behavior must attach to the frozen semantic hooks.
