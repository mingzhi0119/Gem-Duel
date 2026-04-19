# Command Table

Current legal command matrix from `packages/core-engine/src/runtime.ts`:

- `initialization`: `SELECT_MODE`
- `modeSelection`: `START_MATCH`
- `turnIdle`: `TAKE_TOKENS_ADD_POSITION`, `BUY_CARD`, `RESERVE_CARD`, `USE_PRIVILEGE_ADD_POSITION` (when privilege is available), `REPLENISH_BOARD` (when available), `ENTER_REPLAY`, `FINISH_MATCH`
- `turnIdle` with pending royal effect: `SELECT_ROYAL`
- `gemSelection`: `TAKE_TOKENS_ADD_POSITION`, `TAKE_TOKENS_CONFIRM`, `TAKE_TOKENS_CANCEL`, `TAKE_TOKENS`
- `privilege`: `USE_PRIVILEGE_ADD_POSITION`, `USE_PRIVILEGE_CONFIRM`, `USE_PRIVILEGE_CANCEL`, `USE_PRIVILEGE`
- `replay`: `EXIT_REPLAY`
- `terminal`: no commands

## Change Checklist

- If a command becomes legal in a new phase, update the command table and the corresponding guard tests.
- If a mode-gated begin command is removed, document which direct command now owns the hotspot entrypoint from `turnIdle`.
- If command legality depends on `activeEffects`, document both the public phase and the effect context.
- If a command name changes, route through `contract-change`.
- If a command affects replay hashes or event ordering, route through `replay-golden`.
- Do not create commands for private Buff resolution phases; Buff behavior must attach to the frozen semantic hooks.
