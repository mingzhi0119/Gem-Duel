# Determinism and Replay Discipline

## ZH

本文件定义核心引擎与领域层的确定性纪律。所有未来玩法迁移、联机裁判和回放回归都必须服从本约束。

## Command -> Event -> State

- `Command` 表达玩家意图或系统输入。
- `Event` 表达已经发生的领域事实。
- `State` 只由初始快照和事件折叠得到，不得偷偷读取环境。
- 同一组 `Command` + 同一 `seed` + 同一规则版本，必须得到同一组 `Event` 与同一终局 `State`。

## 禁止项

- 禁止在 `packages/domain` 与 `packages/core-engine` 中使用 `Math.random()`、`Date.now()`、`new Date()`、`performance.now()`。
- 禁止读取浏览器、Electron、Node 文件系统、网络、数据库或进程环境作为规则判断输入。
- 禁止让 UI state、transport payload 或日志 side effect 参与胜负判定。

## 确定性输入

- 随机性统一来自显式注入的 seeded PRNG。
- 当前默认 PRNG 选型记录为 `pure-rand`，因为它更符合纯函数式和可复放需求。
- 时间统一来自显式 `tick`、turn index 或外部 `ClockPort`，不直接读系统时钟。
- 规则版本必须进入 replay 元数据，避免不同 ruleset 之间混放。

## Golden Replays

- 固定目录：`packages/core-engine/__replays__/`
- 每个 golden replay 至少包含：
    - `schemaVersion`
    - `rulesetVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `expectedEventCount`
    - `expectedStateHash`
- 任意影响规则语义的改动，都必须让 replay 回归测试明确表现为“保持不变”或“有意更新”。

## 测试策略

- 状态机测试：验证 phase、guard、typed result 与错误码。
- Replay regression：验证黄金回放的最终 state hash。
- 性质测试：采用 `fast-check` + `@fast-check/vitest`，至少覆盖“相同命令流 + 相同 seed = 相同 state”和“合法前缀 fold 后 state 仍合法”。

## EN

This document defines the determinism discipline for the core engine and domain layer. All future gameplay migration, authoritative matchmaking, and replay regression must obey these rules.

## Command -> Event -> State

- A `Command` expresses player intent or system input.
- An `Event` expresses domain facts that have occurred.
- `State` is derived only from the initial snapshot plus event folding and may not read hidden environment inputs.
- The same `Command` stream + the same `seed` + the same ruleset version must produce the same `Event` stream and final `State`.

## Forbidden Inputs

- Do not use `Math.random()`, `Date.now()`, `new Date()`, or `performance.now()` inside `packages/domain` or `packages/core-engine`.
- Do not read browser APIs, Electron APIs, Node filesystem APIs, networking, databases, or process environment as rule inputs.
- Do not let UI state, transport payloads, or logging side effects participate in victory resolution.

## Deterministic Inputs

- Randomness comes only from an explicitly injected seeded PRNG.
- The current recorded PRNG choice is `pure-rand` because it fits pure-function replayability well.
- Time comes only from explicit `tick`, turn index, or an external `ClockPort`, never from the system clock.
- Ruleset versioning must be embedded in replay metadata so different rulesets never mix silently.

## Golden Replays

- Fixed directory: `packages/core-engine/__replays__/`
- Every golden replay should include at least:
    - `schemaVersion`
    - `rulesetVersion`
    - `seed`
    - `initialSnapshot`
    - `commands[]`
    - `expectedEventCount`
    - `expectedStateHash`
- Any change that affects gameplay semantics must make replay regression behavior explicit: either unchanged by design or intentionally updated.

## Test Strategy

- State-machine tests validate phases, guards, typed results, and error codes.
- Replay regression validates the final state hash of golden fixtures.
- Property tests use `fast-check` + `@fast-check/vitest` and must at least cover “same command stream + same seed = same state” and “legal prefixes still fold into legal state”.
