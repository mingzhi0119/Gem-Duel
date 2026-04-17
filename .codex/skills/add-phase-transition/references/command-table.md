# Command Table

Current legal command matrix from `packages/core-engine/src/index.ts`:

- `initialization`: `SELECT_MODE`
- `modeSelection`: `START_MATCH`
- `turnIdle`: `BEGIN_GEM_SELECTION`, `BEGIN_RESERVE`, `BEGIN_BUY`, `BEGIN_PRIVILEGE`, `BEGIN_ROYAL_RESOLUTION`, `BEGIN_BUFF_RESOLUTION`, `ENTER_REPLAY`, `FINISH_MATCH`
- `gemSelection`: `TAKE_GEM`
- `reserving`: `RESERVE_CARD`
- `buying`: `BUY_CARD`
- `privilege`: `USE_PRIVILEGE`
- `royalResolution`: `SELECT_ROYAL`
- `buffResolution`: `RESOLVE_BUFF`
- `replay`: `EXIT_REPLAY`
- `terminal`: no commands

## Change Checklist

- If a command becomes legal in a new phase, update the command table and the corresponding guard tests.
- If a command name changes, route through `contract-change`.
- If a command affects replay hashes or event ordering, route through `replay-golden`.
