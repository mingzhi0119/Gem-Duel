# Error Code Registry

## Naming Rules

- Use uppercase snake case such as `ENGINE_PHASE_GUARD`.
- Prefer a stable domain prefix when the source is obvious:
    - `ENGINE_*`
    - `ROOM_*`
    - `REPLAY_*`
    - `CONTRACT_*`
- Keep `category` aligned with `ERROR_CATEGORIES` in `packages/domain/src/index.ts`.
- Do not overload one code across different categories.

## Current Observed Codes

- `ENGINE_PHASE_GUARD`
- `ROOM_NOT_FOUND`
- `ROOM_FULL`
- `ROOM_SEAT_TAKEN`
- `ROOM_BINDING_REQUIRED`
- `ROOM_COMMAND_FORBIDDEN`
- `ROOM_ALREADY_BOUND`
- `ROOM_WAITING_FOR_PLAYERS`

## Change Rules

- When renaming a code, document the old -> new mapping in the migration note.
- When deleting a code, explain why existing consumers are safe.
- When adding a code, update any contract docs that mention failure shapes or protocol errors.
