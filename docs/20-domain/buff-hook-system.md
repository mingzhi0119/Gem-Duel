# Buff Hook System

## ZH

本文件定义 Roguelike / Buff 的前置治理规则。Buff 必须建立在已冻结的 effect/hook 原语之上，不允许在核心引擎中散落硬编码 if/else。

## 核心原则

- Buff 采用 pure hook reducer 模型。
- Buff 只以 `id` 持久化，行为通过 hook 注册表解释。
- Buff 不直接持有宿主 API、随机源或外部 IO。
- Step 02.5 只冻结 hook 原语与生命周期；Step 07 才填充具体 Buff 业务。
- Buff 不引入独立的 `BUFF_RESOLUTION` 顶层 hook family，也不拥有独立主流程 phase；Buff 只是既有语义 hook 的 consumer。
- Step 07 的 starter Buff 只允许消费现有 hook points / effect atoms；若需要新 atom、新隐藏通道或新主流程 phase，必须回到契约决策层而不是在实现里偷开口子。

## 冻结后的原语

- `activeEffects` 是公开快照中的序列化生命周期视图，不是 live actor 引用。
- 经典规则完整首批 `EffectAtom` 固定为：
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
    - `take_board_token`
    - `override_bonus_color`
- lifecycle 事件集固定为：
    - `effect.spawned`
    - `effect.started`
    - `effect.completed`
- `effect.completed.outcome` 只允许：
    - `resolved`
    - `skipped`
    - `cancelled`

## Hook 范围

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

## 推荐结构

- `BuffDefinition`: 静态元数据、说明、hook 注册入口。
- `BuffInstance`: run 中实际持有的 Buff，仅保存 `id` 与最小运行时上下文。
- `ActiveEffect`: effect actor 的序列化视图，暴露 `effectId`、`parentEffectId`、`atom`、`hookPoint`、`source`、`scope`、`owner`、`sequence`、`stage`、`rngNamespace`。
- `EffectHookPoint`: `BEFORE_*` / `AFTER_*` 事件位。
- hook handler：`(state, event) => state` 或 `(state, event) => nextPayload/state` 的 pure reducer。

## 顺序与冲突处理

- hook 按固定顺序串行执行，而不是并行合并。
- 默认顺序为：active player Buffs -> opposing player Buffs -> global run Buffs。
- 同一作用域内按注册表顺序执行；若存在重复实例，则按获取顺序执行。
- 后一个 hook 接收前一个 hook 的输出；冲突由顺序本身解决，不再引入额外隐式优先级。

## 序列化与回放

- replay 与存档只记录 Buff `id` 与最小实例上下文，不记录可执行函数。
- Roguelike match snapshot 通过 `runContext.activeBuffs` 暴露当前 Buff 实例序列化视图；classic / online non-roguelike 对局必须显式发送 `runContext: null`。
- Buff 引起的真实规则结果必须表现为标准 `GameEvent` / `EffectAtom`，从而进入权威事件流。
- Buff 不得引入绕过 `finalStateHash` 的隐式状态。

## 测试粒度

- 每个 Buff 至少有一份单元测试，验证其 hook 输入输出。
- 每组关键 Buff 交互至少有一份组合测试。
- 引起经典规则语义变化的 Buff 必须补 replay 样例。
- Buff 文档必须明确其 hook 点、输入、输出与副作用原子。

## EN

This document defines the upfront governance model for Roguelike / Buff systems. Buffs must be built on top of the frozen effect/hook primitives and may not spread hard-coded if/else logic across the core engine.

## Core Principles

- Buffs use a pure hook reducer model.
- Buffs persist by `id` only, while behavior is interpreted through hook registries.
- Buffs do not own host APIs, random sources, or external IO directly.
- Step 02.5 freezes hook primitives and lifecycle; Step 07 fills in concrete Buff business behavior.
- Buffs do not introduce a dedicated top-level `BUFF_RESOLUTION` hook family or a standalone main-flow phase; Buffs are consumers of the existing semantic hook surface.
- The Step 07 starter Buff set may consume only the existing hook points and effect atoms; any need for a new atom, hidden channel, or main-flow phase must escalate back to the contract layer instead of appearing as an implementation shortcut.

## Frozen Primitives

- `activeEffects` is the serialized lifecycle view exposed in public snapshots, not a live actor reference.
- The first classic-complete `EffectAtom` set is fixed to:
    - `grant_privilege`
    - `take_opponent_token`
    - `gain_royal`
    - `take_extra_turn`
    - `discard_to_limit`
    - `take_board_token`
    - `override_bonus_color`
- The lifecycle event set is fixed to:
    - `effect.spawned`
    - `effect.started`
    - `effect.completed`
- `effect.completed.outcome` is restricted to:
    - `resolved`
    - `skipped`
    - `cancelled`

## Hook Scope

- Match-level hooks are fixed to:
    - `BEFORE_USE_PRIVILEGE` / `AFTER_USE_PRIVILEGE`
    - `BEFORE_REPLENISH_BOARD` / `AFTER_REPLENISH_BOARD`
    - `BEFORE_TAKE_TOKENS` / `AFTER_TAKE_TOKENS`
    - `BEFORE_RESERVE_CARD` / `AFTER_RESERVE_CARD`
    - `BEFORE_BUY_CARD` / `AFTER_BUY_CARD`
    - `BEFORE_GAIN_ROYAL` / `AFTER_GAIN_ROYAL`
    - `BEFORE_EXTRA_TURN` / `AFTER_EXTRA_TURN`
    - `BEFORE_DISCARD_TO_LIMIT` / `AFTER_DISCARD_TO_LIMIT`
    - `BEFORE_VICTORY_CHECK` / `AFTER_VICTORY_CHECK`
- Run-level hook placeholders are fixed to:
    - `BEFORE_MATCH_SETUP` / `AFTER_MATCH_SETUP`
    - `BEFORE_BUFF_ACQUISITION` / `AFTER_BUFF_ACQUISITION`
    - `BEFORE_RUN_REWARD_SELECTION` / `AFTER_RUN_REWARD_SELECTION`

## Recommended Structure

- `BuffDefinition`: static metadata, documentation, and hook registration entrypoints.
- `BuffInstance`: the run-time held Buff, storing only `id` plus minimal runtime context.
- `ActiveEffect`: the serialized effect-actor view exposing `effectId`, `parentEffectId`, `atom`, `hookPoint`, `source`, `scope`, `owner`, `sequence`, `stage`, and `rngNamespace`.
- `EffectHookPoint`: `BEFORE_*` / `AFTER_*` event hooks.
- Hook handler: a pure reducer such as `(state, event) => state` or `(state, event) => nextPayload/state`.

## Ordering and Conflict Handling

- Hooks execute sequentially in a fixed order rather than merging in parallel.
- The default scope order is active player Buffs -> opposing player Buffs -> global run Buffs.
- Within the same scope, hooks execute in registry order; repeated instances execute in acquisition order.
- Hook N+1 consumes the output of hook N, so ordering itself resolves conflicts without extra implicit priorities.

## Serialization and Replay

- Replays and saves store only Buff `id` plus minimal instance context, never executable functions.
- Roguelike match snapshots expose the current serialized Buff instance view through `runContext.activeBuffs`; classic / online non-roguelike matches must emit `runContext: null` explicitly.
- Any gameplay effect caused by a Buff must materialize as standard `GameEvent` / `EffectAtom` values in the authoritative event stream.
- Buffs may not introduce hidden state that bypasses `finalStateHash`.

## Test Granularity

- Every Buff has at least one unit test validating its hook input/output behavior.
- Every critical Buff interaction group has at least one composition test.
- Any Buff that changes classic gameplay semantics must add a replay sample.
- Buff docs must state the hook point, inputs, outputs, and effect atoms explicitly.
