# Contract Hardening Spec

## ZH

本文件定义 `packages/contracts` 的治理硬化方向。契约必须同时满足运行时校验、类型推导、文档生成、信息过滤与回归快照。

## 单一真相源

- `zod` 作为当前默认的 schema 真相源。
- TypeScript 类型必须从 schema 推导，而不是反向手写镜像类型。
- 错误码、Problem Details 结构、事件名与 Snapshot 类型必须在契约层统一声明。
- 标识符、schema 字段、错误码与事件名保持英文原名。

## Snapshot 与信息集

- `AuthoritativeSnapshot`：仅权威裁判持有，包含牌堆顺序、token bag、隐藏 reserve 与所有内部状态。
- `PlayerSnapshot`：发给单个玩家的视图，只允许暴露该玩家可见的信息与自己的隐藏信息。
- `SpectatorSnapshot`：发给观战者的视图，对局进行中不得暴露任何玩家的隐藏牌或未来牌堆信息。
- 所有外发快照都必须从 `AuthoritativeSnapshot` 通过信息过滤投影得到，禁止直接复用权威结构下发到客户端。
- 自 Step 04 起，classic snapshot surface 必须显式暴露 board、pyramid、royal supply、privilege supply、reserve slot occupancy、turn metadata 与 `victoryReason`，而不再依赖 placeholder score-only fields。

## Effect / Hook 契约

- `EffectAtom` 是 effect actor 与 Buff hook 的最小原子集合，首批至少包含：
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
- `take_board_token`
- `override_bonus_color`
- `EffectHookPoint` 固定为 `BEFORE_*` / `AFTER_*` 事件位，用于经典规则与 Roguelike Buff 的统一接入。
- Match 级 hook 固定为：
    - `BEFORE_USE_PRIVILEGE` / `AFTER_USE_PRIVILEGE`
    - `BEFORE_REPLENISH_BOARD` / `AFTER_REPLENISH_BOARD`
    - `BEFORE_TAKE_TOKENS` / `AFTER_TAKE_TOKENS`
    - `BEFORE_RESERVE_CARD` / `AFTER_RESERVE_CARD`
    - `BEFORE_BUY_CARD` / `AFTER_BUY_CARD`
    - `BEFORE_GAIN_ROYAL` / `AFTER_GAIN_ROYAL`
    - `BEFORE_EXTRA_TURN` / `AFTER_EXTRA_TURN`
    - `BEFORE_DISCARD_TO_LIMIT` / `AFTER_DISCARD_TO_LIMIT`
    - `BEFORE_VICTORY_CHECK` / `AFTER_VICTORY_CHECK`
- Run 级 hook 占位固定为：
    - `BEFORE_MATCH_SETUP` / `AFTER_MATCH_SETUP`
    - `BEFORE_BUFF_ACQUISITION` / `AFTER_BUFF_ACQUISITION`
    - `BEFORE_RUN_REWARD_SELECTION` / `AFTER_RUN_REWARD_SELECTION`
- hook 处理采用顺序 pure reducer：前一个 hook 的输出作为后一个 hook 的输入；不引入隐式并行 merge。
- `activeEffects` 是公开快照中的序列化生命周期视图，不是 live actor 引用。
- Step 03 后，公开 snapshot phase 不再包含 `royalResolution`；Royal pending handoff 改由 `activeEffects` 与命令合法性共同表达。
- effect lifecycle 事件集固定为 `effect.spawned`、`effect.started`、`effect.completed`，且 `effect.completed.outcome` 只允许 `resolved`、`skipped`、`cancelled`。

## 契约输出

- HTTP 契约：通过 `@asteasolutions/zod-to-openapi` 生成 OpenAPI 3.1。
- WebSocket / event 契约：采用 AsyncAPI 3.0 作为目标描述格式。
- Replay 契约：权威 wire format 为 `MessagePack`，推荐实现库记录为 `msgpackr`；JSON 只作为调试/导出视图。
- Step 03 的 replay build、stable hash projection 与 verify helper 固定由 `packages/core-engine` 输出；`packages/application` 不再拥有 `finalStateHash` 权威。
- HTTP 错误表达：对齐 `RFC 9457 Problem Details for HTTP APIs`。
- 运行时 root barrel `@gem-duel/contracts` 不得 re-export 文档生成或校验模块；OpenAPI / AsyncAPI 入口固定为 `@gem-duel/contracts/openapi` 与 `@gem-duel/contracts/asyncapi`，避免 Web/Client bundle 引入 Node-only 依赖。
- 提交到仓库的生成产物固定为：
    - `packages/contracts/generated/openapi/openapi.json`
    - `packages/contracts/generated/asyncapi/asyncapi.yaml`
- 预期 fixtures 固定为：
    - `packages/contracts/src/__fixtures__/openapi.expected.json`
    - `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`
    - `packages/contracts/src/__fixtures__/replay/*.json`
- repo 中提交的 replay fixtures / golden fixtures 是权威 replay bundle 的 JSON debug/export 视图，而不是对 `MessagePack` authority 的否定。
- 生成命令：`pnpm contracts:generate`
- 漂移校验命令：`pnpm contracts:verify`

## Replay Bundle

- `ReplayBundle` 至少包含：
    - `schemaVersion`
    - `rulesetVersion`
    - `engineVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `events[]`
    - `finalStateHash`
    - `resultSummary`
- `events[]` 是权威裁决结果；`commands[]` 保留玩家意图与调试价值。
- 任何 replay 迁移策略都必须明确说明哪些版本支持 command replay、哪些版本只支持 event playback。

## 在线协议字段

- `MatchCommand.clientCommandId`: 客户端命令幂等 key。
- `MatchCommand.expectedSeq`: 客户端期望服务端当前 seq，用于并发校验与重放保护。
- `match.patch.seq`: 服务端单调递增 patch 序号。
- `match.resync.lastKnownSeq`: 客户端已知最后一个 seq。
- `room.watch` / `match.observe`: 观战入口与观战态协议事件。
- Step 05 起，`room.join` 是唯一权威的实时 seat claim；`POST /rooms/:roomId/join` 只保留兼容 shim，不建立 live websocket binding。
- Step 05 起，服务端必须忽略 `match.command.command.issuedBy` 的 seat authority，实际命令归属来自 websocket 绑定的玩家座位。
- duplicate `clientCommandId` 必须返回同一份原始 `match.patch` 给请求方，不推进状态，也不再次广播。
- stale `expectedSeq` 必须返回 `match.resync` 与当前完整的 viewer-filtered snapshot；这不是 `room.error` 分支。
- `GET /rooms/:roomId` 只允许返回 public / spectator-safe `RoomDetail`；玩家私有视角只能通过绑定后的 websocket `room.state` / `match.patch` 下发。
- spectator 连接只允许收到 `room.state` 与后续 `match.observe`，不得收到任何玩家私有 `match.patch`。
- Step 06 起，`UiActionDescriptor` 是 schema-backed contract，可通过 room/UI payload 传输。
- Step 06 起，`RoomDetail`、`match.patch`、`match.resync` 与 `match.observe` 必须携带 viewer-scoped `availableActions`。
- spectator 与非当前行动玩家的 `availableActions` 必须为空数组；客户端不得依据可见 snapshot 自行推断 turn ownership 或隐藏 deck legality。

## 修改顺序

- 先改 schema。
- 再改 Snapshot / effect / protocol 文档与错误码说明。
- 再更新生成产物与快照。
- 最后才允许改调用方与实现层。

## 回归要求

- 所有公共 HTTP、WebSocket、Replay 消息都应有快照或 fixture。
- 快照变化必须在 `docs/30-contracts/` 和对应 ADR 中说明是“预期变更”还是“破坏性变更”。
- replay CI 以 `finalStateHash` 为准，不接受主观“看起来没问题”的判断。
- 契约层不允许绕过 schema 直接定义跨边界 payload。
- `pnpm check-contracts` 必须覆盖 schema parse tests、OpenAPI 生成/漂移测试、AsyncAPI 生成/校验/漂移测试，以及最小 replay wire-shape fixture 测试。

## EN

This document defines the hardening path for `packages/contracts`. Contracts must support runtime validation, type inference, generated documentation, information filtering, and regression snapshots at the same time.

## Single Source of Truth

- `zod` is the current default schema source of truth.
- TypeScript types must be inferred from schemas rather than maintained as hand-written mirror types.
- Error codes, Problem Details shapes, event names, and snapshot types must be declared centrally in the contract layer.
- Identifiers, schema fields, error codes, and event names keep their English identifiers.

## Snapshots and Information Sets

- `AuthoritativeSnapshot`: held only by the authoritative referee and includes deck order, token bag, hidden reserves, and all internal state.
- `PlayerSnapshot`: sent to one player and may reveal only public information plus that player's own hidden information.
- `SpectatorSnapshot`: sent to spectators and must not reveal hidden cards or future deck information while the match is live.
- All outbound snapshots must be projected from `AuthoritativeSnapshot` through information filtering; raw authoritative structures may never be sent externally.
- Starting in Step 04, the classic snapshot surface must explicitly expose board, pyramid, royal supply, privilege supply, reserve-slot occupancy, turn metadata, and `victoryReason` instead of placeholder score-only fields.

## Effect / Hook Contracts

- `EffectAtom` is the minimum atom set shared by effect actors and Buff hooks. The initial set includes:
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
- `take_board_token`
- `override_bonus_color`
- `EffectHookPoint` is standardized around `BEFORE_*` / `AFTER_*` event hooks so classic rules and roguelike Buffs share the same integration surface.
- The fixed Match-level hooks are:
    - `BEFORE_USE_PRIVILEGE` / `AFTER_USE_PRIVILEGE`
    - `BEFORE_REPLENISH_BOARD` / `AFTER_REPLENISH_BOARD`
    - `BEFORE_TAKE_TOKENS` / `AFTER_TAKE_TOKENS`
    - `BEFORE_RESERVE_CARD` / `AFTER_RESERVE_CARD`
    - `BEFORE_BUY_CARD` / `AFTER_BUY_CARD`
    - `BEFORE_GAIN_ROYAL` / `AFTER_GAIN_ROYAL`
    - `BEFORE_EXTRA_TURN` / `AFTER_EXTRA_TURN`
    - `BEFORE_DISCARD_TO_LIMIT` / `AFTER_DISCARD_TO_LIMIT`
    - `BEFORE_VICTORY_CHECK` / `AFTER_VICTORY_CHECK`
- The fixed Run-level placeholders are:
    - `BEFORE_MATCH_SETUP` / `AFTER_MATCH_SETUP`
    - `BEFORE_BUFF_ACQUISITION` / `AFTER_BUFF_ACQUISITION`
    - `BEFORE_RUN_REWARD_SELECTION` / `AFTER_RUN_REWARD_SELECTION`
- Hook processing uses sequential pure reducers: the output of hook N becomes the input of hook N+1, with no hidden parallel merge semantics.
- `activeEffects` is the serialized lifecycle view exposed in public snapshots, not a live actor reference.
- After Step 03, the public snapshot phase no longer includes `royalResolution`; pending royal handoff is represented through `activeEffects` plus command legality.
- The effect lifecycle event set is fixed to `effect.spawned`, `effect.started`, and `effect.completed`, with `effect.completed.outcome` restricted to `resolved`, `skipped`, or `cancelled`.

## Contract Outputs

- HTTP contracts: generate OpenAPI 3.1 through `@asteasolutions/zod-to-openapi`.
- WebSocket / event contracts: use AsyncAPI 3.0 as the target description format.
- Replay contracts: the authoritative wire format is `MessagePack`, with `msgpackr` recorded as the preferred implementation; JSON exists only for debug/export views.
- Step 03 fixes replay build, stable hash projection, and verify helpers inside `packages/core-engine`; `packages/application` no longer owns `finalStateHash` authority.
- HTTP error representation: align with `RFC 9457 Problem Details for HTTP APIs`.
- The runtime root barrel `@gem-duel/contracts` must not re-export documentation generation or validation modules; OpenAPI / AsyncAPI entrypoints are fixed at `@gem-duel/contracts/openapi` and `@gem-duel/contracts/asyncapi` so Web/Client bundles do not pull in Node-only dependencies.
- Generated artifacts committed to the repo are fixed at:
    - `packages/contracts/generated/openapi/openapi.json`
    - `packages/contracts/generated/asyncapi/asyncapi.yaml`
- Expected fixtures are fixed at:
    - `packages/contracts/src/__fixtures__/openapi.expected.json`
    - `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`
    - `packages/contracts/src/__fixtures__/replay/*.json`
- Replay fixtures and repo golden fixtures remain JSON debug/export views of the authoritative replay bundle rather than a replacement for `MessagePack` authority.
- Generation command: `pnpm contracts:generate`
- Drift verification command: `pnpm contracts:verify`

## Replay Bundle

- `ReplayBundle` contains at least:
    - `schemaVersion`
    - `rulesetVersion`
    - `engineVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `events[]`
    - `finalStateHash`
    - `resultSummary`
- `events[]` are authoritative while `commands[]` preserve player intent and debugging value.
- Any replay migration policy must explicitly state which version ranges support command replay and which support event playback only.

## Online Protocol Fields

- `MatchCommand.clientCommandId`: idempotency key for client commands.
- `MatchCommand.expectedSeq`: the seq the client believes the server is currently at, used for concurrency checks and replay protection.
- `match.patch.seq`: monotonic server patch sequence number.
- `match.resync.lastKnownSeq`: the last seq known by the client.
- `room.watch` / `match.observe`: spectator entrypoint and spectator protocol events.
- Starting in Step 05, `room.join` is the only authoritative live seat-claim path; `POST /rooms/:roomId/join` remains a compatibility shim only and does not create a live websocket binding.
- Starting in Step 05, the server must ignore the seat authority of `match.command.command.issuedBy`; actual command ownership comes from the websocket-bound player seat.
- Duplicate `clientCommandId` values must return the same original `match.patch` to the requester without advancing state or rebroadcasting.
- Stale `expectedSeq` values must return `match.resync` with the full current viewer-filtered snapshot; this is not a `room.error` branch.
- `GET /rooms/:roomId` may return only public / spectator-safe `RoomDetail`; player-private views may be delivered only through bound websocket `room.state` / `match.patch` flows.
- Spectator connections may receive `room.state` and later `match.observe` only and may never receive player-private `match.patch` payloads.
- Starting in Step 06, `UiActionDescriptor` is a schema-backed contract that may travel through room/UI payloads.
- Starting in Step 06, `RoomDetail`, `match.patch`, `match.resync`, and `match.observe` must carry viewer-scoped `availableActions`.
- Spectators and non-active players must receive `availableActions: []`; clients may not infer turn ownership or hidden-deck legality from visible snapshots alone.

## Change Order

- Change the schema first.
- Then update snapshot / effect / protocol docs and error-code references.
- Then update generated artifacts and snapshots.
- Only then may callers and implementation layers change.

## Regression Requirements

- All public HTTP, WebSocket, and replay messages should have snapshots or fixtures.
- Snapshot changes must be explained in `docs/30-contracts/` and the matching ADR as either expected or breaking.
- Replay CI uses `finalStateHash` as the source of truth and does not accept subjective “looks fine” validation.
- The contract layer may not bypass schemas when defining cross-boundary payloads.
- `pnpm check-contracts` must cover schema parse tests, OpenAPI generation/drift checks, AsyncAPI generation/validation/drift checks, and minimal replay wire-shape fixture parsing.
