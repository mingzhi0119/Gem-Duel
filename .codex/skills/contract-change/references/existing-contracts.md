# Existing Contracts

## Current Repo Truth

- Error categories in `packages/domain/src/index.ts`:
    - `validation`
    - `rules`
    - `conflict`
    - `infra`
    - `authz`
    - `desync`
- Current WebSocket message types in `packages/contracts/src/index.ts`:
    - `room.join`
    - `room.state`
    - `match.command`
    - `match.patch`
    - `match.resync`
    - `room.leave`
    - `room.error`
- Current replay bundle fields in `packages/contracts/src/index.ts`:
    - `schemaVersion`
    - `rulesetVersion`
    - `seed`
    - `initialSnapshot`
    - `events`
    - `resultSummary`

## Frozen Target From Docs

- Snapshot tiers frozen in docs:
    - `AuthoritativeSnapshot`
    - `PlayerSnapshot`
    - `SpectatorSnapshot`
- Replay target fields frozen in docs:
    - `schemaVersion`
    - `rulesetVersion`
    - `engineVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `events[]`
    - `finalStateHash`
    - `resultSummary`
- Online protocol additions frozen in docs:
    - `room.watch`
    - `match.observe`
    - `MatchCommand.clientCommandId`
    - `MatchCommand.expectedSeq`
    - `match.patch.seq`
    - `match.resync.lastKnownSeq`

## Public Contract Types To Watch

- `GameCommand`
- `GameEvent`
- `GameSnapshot`
- `ReplayBundle`
- `RoomDetail`
- `RoomWsMessage`
- `UiViewModel`
