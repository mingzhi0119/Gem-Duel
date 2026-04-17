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

## Effect / Hook 契约

- `EffectAtom` 是 effect actor 与 Buff hook 的最小原子集合，首批至少包含：
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
- `EffectHookPoint` 固定为 `BEFORE_*` / `AFTER_*` 事件位，用于经典规则与 Roguelike Buff 的统一接入。
- hook 处理采用顺序 pure reducer：前一个 hook 的输出作为后一个 hook 的输入；不引入隐式并行 merge。

## 契约输出

- HTTP 契约：通过 `@asteasolutions/zod-to-openapi` 生成 OpenAPI 3.1。
- WebSocket / event 契约：采用 AsyncAPI 3.0 作为目标描述格式。
- Replay 契约：权威 wire format 为 `MessagePack`，推荐实现库记录为 `msgpackr`；JSON 只作为调试/导出视图。
- HTTP 错误表达：对齐 `RFC 9457 Problem Details for HTTP APIs`。
- 运行时 root barrel `@gem-duel/contracts` 不得 re-export 文档生成或校验模块；OpenAPI / AsyncAPI 入口固定为 `@gem-duel/contracts/openapi` 与 `@gem-duel/contracts/asyncapi`，避免 Web/Client bundle 引入 Node-only 依赖。
- 提交到仓库的生成产物固定为：
    - `packages/contracts/generated/openapi/openapi.json`
    - `packages/contracts/generated/asyncapi/asyncapi.yaml`
- 预期 fixtures 固定为：
    - `packages/contracts/src/__fixtures__/openapi.expected.json`
    - `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`
    - `packages/contracts/src/__fixtures__/replay/*.json`
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

## Effect / Hook Contracts

- `EffectAtom` is the minimum atom set shared by effect actors and Buff hooks. The initial set includes:
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
- `EffectHookPoint` is standardized around `BEFORE_*` / `AFTER_*` event hooks so classic rules and roguelike Buffs share the same integration surface.
- Hook processing uses sequential pure reducers: the output of hook N becomes the input of hook N+1, with no hidden parallel merge semantics.

## Contract Outputs

- HTTP contracts: generate OpenAPI 3.1 through `@asteasolutions/zod-to-openapi`.
- WebSocket / event contracts: use AsyncAPI 3.0 as the target description format.
- Replay contracts: the authoritative wire format is `MessagePack`, with `msgpackr` recorded as the preferred implementation; JSON exists only for debug/export views.
- HTTP error representation: align with `RFC 9457 Problem Details for HTTP APIs`.
- The runtime root barrel `@gem-duel/contracts` must not re-export documentation generation or validation modules; OpenAPI / AsyncAPI entrypoints are fixed at `@gem-duel/contracts/openapi` and `@gem-duel/contracts/asyncapi` so Web/Client bundles do not pull in Node-only dependencies.
- Generated artifacts committed to the repo are fixed at:
    - `packages/contracts/generated/openapi/openapi.json`
    - `packages/contracts/generated/asyncapi/asyncapi.yaml`
- Expected fixtures are fixed at:
    - `packages/contracts/src/__fixtures__/openapi.expected.json`
    - `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`
    - `packages/contracts/src/__fixtures__/replay/*.json`
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
