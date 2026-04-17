# ADR-0004: Step 02.5 Effect/Hook Vocabulary Freeze

## ZH

### 决策

- 公开快照字段统一使用 `activeEffects`，不再使用 `pendingEffects`。
- effect lifecycle 事件集固定为 `effect.spawned`、`effect.started`、`effect.completed`。
- `effect.completed` 的 `outcome` 固定为 `resolved`、`skipped`、`cancelled`。
- hook family 使用 semantic naming，保留 Match + Run 两层范围，不再保留 `ROYAL_RESOLUTION` / `BUFF_RESOLUTION` 这类 phase-oriented 顶层 hook。
- `EffectAtom` 直接冻结为经典规则首批完整集合：`grant_privilege`、`take_opponent_token`、`gain_royal`、`take_extra_turn`、`discard_to_limit`、`take_board_token`、`override_bonus_color`。
- Buff 不是主流程 phase，也不是顶层 hook family；Buff 只能消费已冻结的 semantic hooks。

### 原因

- `activeEffects` 更准确表达 actor lifecycle 视角下“当前正在运行或等待完成的效果视图”，避免把实现误导成传统队列。
- `effect.spawned -> effect.started -> effect.completed` 已足够表达 replay-visible lifecycle，又不会在 Step 02.5 提前泄露 Step 03 的完整 orchestration 细节。
- semantic hooks 能承载经典规则、Royal、extra turn 与未来 Run/Buff 扩展，而 phase-oriented hooks 会把扩展性绑死在当前 phase 图上。
- 一次性冻结 classic-complete `EffectAtom`，可以让 Step 03 / 04 / 07 按 vocabulary 施工，而不是反复重命名或补底层字段。

## EN

### Decision

- The public snapshot field is standardized on `activeEffects`; `pendingEffects` is retired.
- The effect lifecycle event set is fixed to `effect.spawned`, `effect.started`, and `effect.completed`.
- The `outcome` field on `effect.completed` is fixed to `resolved`, `skipped`, and `cancelled`.
- Hook families use semantic naming across Match + Run scope and no longer keep top-level phase-oriented families such as `ROYAL_RESOLUTION` or `BUFF_RESOLUTION`.
- `EffectAtom` is frozen as the classic-complete first-wave set: `grant_privilege`, `take_opponent_token`, `gain_royal`, `take_extra_turn`, `discard_to_limit`, `take_board_token`, and `override_bonus_color`.
- Buff is neither a main-flow phase nor a top-level hook family; it may only consume the frozen semantic hooks.

### Rationale

- `activeEffects` more accurately describes the actor-lifecycle view of effects that are currently active or awaiting completion, without implying an internal queue implementation.
- `effect.spawned -> effect.started -> effect.completed` is sufficient for replay-visible lifecycle semantics without leaking Step 03 orchestration detail too early.
- Semantic hooks can support classic rules, royal rewards, extra turns, and future Run/Buff extensions, while phase-oriented hooks would overfit the current phase graph.
- Freezing the classic-complete `EffectAtom` set in one shot lets Step 03 / 04 / 07 build on stable vocabulary instead of repeatedly renaming or widening the base layer.
