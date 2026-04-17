# Step 07 Migration Note - Run / Buff / Replay Vertical Slice

## ZH

- Step 07 在不扩 online protocol family 的前提下，引入 Roguelike 所需的 `run` contract surface、starter Buff catalog 与 snapshot-level `runContext`。
- 这是一次 contract-first 的 breaking change：所有 snapshot-bearing payload 现在都允许携带 `runContext`，同时 `packages/contracts` 新增 Run/Meta/Buff schema surface。

### 迁移内容

- 新增 `packages/contracts/src/run.ts`，集中声明 `BuffId`、`BuffCatalogEntry`、`BuffInstance`、`RunRewardOffer`、`RunState`、`MetaState` 与相关枚举 schema。
- `AuthoritativeSnapshot`、`PlayerSnapshot`、`SpectatorSnapshot` 与 `ReplayBundle.initialSnapshot` 新增 `runContext`：
    - classic / online 非 roguelike 对局必须发送 `runContext: null`
    - Roguelike 本地 / AI 对局通过 `runContext.activeBuffs` 暴露当前 run 的 Buff 序列化上下文
- Step 07 bump `SCHEMA_VERSION` 与 `ENGINE_VERSION`，但不新增 room-service WebSocket 消息类型，也不把 AI trace 写入 replay wire shape。

### 兼容性说明

- `ReplayBundle` 继续是 match-scoped；run progression 通过 snapshot 内的 `runContext` 和 higher-layer `RunState` 表达，而不是另起 run-level replay envelope。
- `RoomDetail`、`match.patch`、`match.resync` 与 `match.observe` 只会因为 snapshot schema 扩展而再生，不新增新的在线语义。
- AI strategy trace 只存在于 application / shell 调试面板，不属于 `packages/contracts` 的对外协议职责。

## EN

- Step 07 introduces the roguelike-facing `run` contract surface, the starter Buff catalog, and snapshot-level `runContext` without adding a new online protocol family.
- This is a contract-first breaking change: every snapshot-bearing payload may now carry `runContext`, and `packages/contracts` gains a Run/Meta/Buff schema surface.

### Migration Surface

- `packages/contracts/src/run.ts` now declares `BuffId`, `BuffCatalogEntry`, `BuffInstance`, `RunRewardOffer`, `RunState`, `MetaState`, and the related enum schemas.
- `AuthoritativeSnapshot`, `PlayerSnapshot`, `SpectatorSnapshot`, and `ReplayBundle.initialSnapshot` now include `runContext`:
    - classic / online non-roguelike matches must emit `runContext: null`
    - roguelike local / AI matches expose the current serialized Buff context through `runContext.activeBuffs`
- Step 07 bumps `SCHEMA_VERSION` and `ENGINE_VERSION`, but it does not add room-service WebSocket message types or write AI traces into the replay wire shape.

### Compatibility Notes

- `ReplayBundle` remains match-scoped; run progression is expressed through snapshot `runContext` plus the higher-layer `RunState`, not through a second run-level replay envelope.
- `RoomDetail`, `match.patch`, `match.resync`, and `match.observe` regenerate only because the snapshot schema expands; they do not gain new online semantics.
- AI strategy traces live only in application / shell debugging surfaces and are not part of the outward `packages/contracts` protocol surface.
