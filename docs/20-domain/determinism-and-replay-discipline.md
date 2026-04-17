# Determinism and Replay Discipline

## ZH

本文件定义核心引擎与领域层的确定性纪律。所有未来玩法迁移、联机裁判和回放回归都必须服从本约束。

## 状态分层

- `MatchState`：单局对战的全部领域状态。
- `RunState`：一个 Roguelike run 内的多局进度、Buff、奖励与选择。
- `MetaState`：跨 run 的解锁、统计、长期进度与存档。
- 经典模式只依赖 `MatchState`；`RunState` 与 `MetaState` 不能污染经典对局的确定性。

## Command -> Event -> State

- `Command` 表达玩家意图或系统输入。
- `Event` 表达已经发生的领域事实。
- `State` 只由初始快照与事件折叠得到，不得偷偷读取环境。
- 连锁效果采用 `effect actor -> emitted event -> state transition` 的形式落入事件流。
- effect 生命周期事件固定为 `effect.spawned -> effect.started -> effect.completed`。
- `activeEffects` 只表示未完成 effect actor 的序列化视图，不直接序列化 actor 引用。
- 同一组 `seed + command stream + rulesetVersion + engineVersion`，必须得到同一组 `Event` 与同一终局 `State`。

## 禁止项

- 禁止在 `packages/domain` 与 `packages/core-engine` 中使用 `Math.random()`、`Date.now()`、`new Date()`、`performance.now()`。
- 禁止使用 `lodash.shuffle`、`lodash.sample`、`lodash.sampleSize`、`array-shuffle`、`crypto.randomBytes` 或 `Array.prototype.sort(() => Math.random() - 0.5)`。
- 禁止读取浏览器、Electron、Node 文件系统、网络、数据库或进程环境作为规则判断输入。
- 禁止让 UI state、transport payload 或日志 side effect 参与胜负判定。

## 确定性输入

- 随机性统一来自显式注入的 namespaced RNG streams。
- 标准接口固定为 `SeededRng.fork(namespace: string)`，以避免不同子系统互相污染随机序列。
- 当前默认 PRNG 选型记录为 `pure-rand`。
- 时间统一来自显式 `tick`、turn index、stream position 或外部 `ClockPort`，不直接读系统时钟。
- token bag、牌堆顺序、Buff 池与商店刷新都必须通过纯函数抽取接口消费 RNG，而不是直接洗牌。

## Replay 权威模型

- 权威 replay wire format 为 `MessagePack`；JSON 只用于调试、导出与人类阅读。
- 回放同时记录 `commands[]` 与 `events[]`；`events[]` 是权威裁决结果，`commands[]` 用于调试、训练与行为复盘。
- 每个 replay 必须记录 `schemaVersion`、`rulesetVersion`、`engineVersion`、`seed`、`initialSnapshot`、`finalStateHash`。
- 每个 event 都应具有可排序的 `streamPosition` 或 `seq`，以支持 room-service 增量推送与 resync。
- `effect.completed.outcome` 只允许 `resolved`、`skipped`、`cancelled`。

## Golden Replays

- 固定目录：`packages/core-engine/__replays__/golden/`
- 每个 golden replay 至少包含：
    - `schemaVersion`
    - `rulesetVersion`
    - `engineVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `events[]`
    - `finalStateHash`
    - `resultSummary`
- Step 04 起最少保留 5 份经典规则真实对局 golden replay 进入 CI。
- 任意影响规则语义的改动，都必须让 replay 回归测试明确表现为“保持不变”或“有意更新”。

## 测试策略

- 状态机测试：验证 phase、guard、typed result 与 actor 生命周期。
- Replay regression：验证黄金回放的 `finalStateHash`。
- 性质测试：采用 `fast-check` + `@fast-check/vitest`，至少覆盖“相同命令流 + 相同 seed = 相同 state”和“合法前缀 fold 后 state 仍合法”。
- 模式一致性测试：本地、AI、在线权威模式对同一 replay 必须得到相同终局结果。

## 自检场景

- 购卡连锁能力 + Royal + extra turn。
- Replenish Board 导致 privilege 变化。
- reserve 盲抽与隐藏信息过滤。
- 命令重发的幂等处理。
- seq 缺口后的 full resync。
- spectator 延迟推送与 post-match reveal。

## EN

This document defines the determinism discipline for the core engine and domain layer. All future gameplay migration, authoritative matchmaking, and replay regression must obey these rules.

## State Tiers

- `MatchState`: all state for a single match.
- `RunState`: multi-match progress, Buff acquisitions, rewards, and choices within a roguelike run.
- `MetaState`: cross-run unlocks, statistics, long-term progression, and save data.
- Classic mode depends on `MatchState` alone; `RunState` and `MetaState` must not pollute classic-match determinism.

## Command -> Event -> State

- A `Command` expresses player intent or system input.
- An `Event` expresses domain facts that have occurred.
- `State` is derived only from the initial snapshot plus event folding and may not read hidden environment inputs.
- Chained effects enter the event stream as `effect actor -> emitted event -> state transition`.
- The lifecycle event set is frozen to `effect.spawned -> effect.started -> effect.completed`.
- `activeEffects` is only the serialized view of unfinished effect actors and never a serialized actor reference.
- The same `seed + command stream + rulesetVersion + engineVersion` must produce the same `Event` stream and final `State`.

## Forbidden Inputs

- Do not use `Math.random()`, `Date.now()`, `new Date()`, or `performance.now()` inside `packages/domain` or `packages/core-engine`.
- Do not use `lodash.shuffle`, `lodash.sample`, `lodash.sampleSize`, `array-shuffle`, `crypto.randomBytes`, or `Array.prototype.sort(() => Math.random() - 0.5)`.
- Do not read browser APIs, Electron APIs, Node filesystem APIs, networking, databases, or process environment as rule inputs.
- Do not let UI state, transport payloads, or logging side effects participate in victory resolution.

## Deterministic Inputs

- Randomness comes only from explicitly injected namespaced RNG streams.
- The standard interface is `SeededRng.fork(namespace: string)` so subsystems do not contaminate one another's random streams.
- The current recorded PRNG choice is `pure-rand`.
- Time comes only from explicit `tick`, turn index, stream position, or an external `ClockPort`, never from the system clock.
- Token-bag draws, deck order, Buff pools, and shop refreshes must consume RNG through pure draw/shuffle interfaces rather than ad hoc shuffling.

## Replay Authority Model

- The authoritative replay wire format is `MessagePack`; JSON exists for debug/export and human-readable views only.
- Replays store both `commands[]` and `events[]`; `events[]` are authoritative while `commands[]` support debugging, training, and behavior review.
- Every replay records `schemaVersion`, `rulesetVersion`, `engineVersion`, `seed`, `initialSnapshot`, and `finalStateHash`.
- Every event should carry an ordered `streamPosition` or `seq` so room-service can support incremental delivery and resync.
- `effect.completed.outcome` is restricted to `resolved`, `skipped`, or `cancelled`.

## Golden Replays

- Fixed directory: `packages/core-engine/__replays__/golden/`
- Every golden replay should include at least:
    - `schemaVersion`
    - `rulesetVersion`
    - `engineVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `events[]`
    - `finalStateHash`
    - `resultSummary`
- Starting in Step 04, at least 5 real classic matches must be preserved as golden replays in CI.
- Any change that affects gameplay semantics must make replay regression behavior explicit: either unchanged by design or intentionally updated.

## Test Strategy

- State-machine tests validate phases, guards, typed results, and actor lifecycles.
- Replay regression validates the `finalStateHash` of golden fixtures.
- Property tests use `fast-check` + `@fast-check/vitest` and must at least cover “same command stream + same seed = same state” and “legal prefixes still fold into legal state”.
- Mode-consistency tests require local, AI, and authoritative online flows to produce the same final result for the same replay.

## Self-Check Scenarios

- Buy-chain ability + Royal + extra turn.
- Replenish Board causing privilege changes.
- Blind reserve draw plus hidden-information filtering.
- Idempotent handling of retried commands.
- Full resync after a seq gap.
- Spectator delayed delivery and post-match reveal.
