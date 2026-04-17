# Gem Duel Full Rebuild Plan

## ZH

### 目标

- 以绿地重写方式将项目升级为 `pnpm + Turborepo` monorepo。
- 将 `Next.js App Router` 作为主应用，`Electron` 保留为桌面发行壳。
- 建立独立核心引擎、契约层、应用层与房间服务，避免 UI 与规则耦合。
- 推行确定性、actor-based state machine、契约优先、错误模型统一、文档双语治理与质量门禁。

### 非目标

- 不承诺兼容旧回放、旧存档、旧联机协议。
- 不在首轮交付账号、匹配、排行榜与完整运营后台。
- 不将 `old/legacy-vite-electron/` 内的旧实现直接迁入新核心。

### 新目录

- `apps/web`: Next.js Web 主应用与 BFF route handlers。
- `apps/desktop`: Electron 桌面壳，只承载窗口、桥接和分发。
- `apps/room-service`: 权威在线房间服务。
- `packages/contracts`: Zod 契约、DTO、消息信封、错误码、Snapshot 类型与 API 描述源。
- `packages/domain`: 规则常量、值对象、领域错误、Ruleset 版本、Run/Meta 模型与 Buff 注册表。
- `packages/core-engine`: `XState v5 actor model` 状态机、effect actors 与确定性命令处理。
- `packages/application`: 用例编排、session、replay 导出、view model 构建与模式切换。
- `packages/adapters`: namespaced RNG、clock、ID、内存仓储、日志、telemetry 等适配器。
- `packages/ui`: 纯展示组件与设计系统。
- `docs/*`: 架构、领域、契约、运维、ADR、legacy 归档。

### 分层规则

- `contracts/domain` 不依赖任何 app。
- `core-engine` 只依赖 `contracts/domain`。
- `application` 编排引擎，不接触框架 UI。
- `adapters` 负责 IO 与技术实现，不反向依赖 app 页面。
- `apps/web` 和 `apps/desktop` 只能消费 `application`、`contracts`、`ui`。
- `apps/room-service` 必须复用共享 `packages/core-engine`，不得 fork 或重写规则引擎。

### 状态机策略

- 主对局采用 `XState v5 actor model`，以 turn phase 驱动主流程，以 effect actors 处理购卡能力、Royal 效果、extra turn 与 Buff hook。
- phase 只表达主流程位置；连锁效果通过 effect actor / child actor 生命周期处理，而不是把所有效果平铺成并列 phase。
- 任何命令都必须经过 phase guard；非法命令返回 typed result 错误而不是裸异常。
- 核心引擎内部禁止时间、随机、网络、数据库和宿主 API。
- Effect/Hook 原语在经典规则迁移前冻结：`EffectAtom`、`EffectHookPoint`、actor 生命周期、hook 顺序与冲突处理一旦确认，不在 Step 07 回改。
- `activeEffects` 作为公开快照中的序列化生命周期视图固定下来，不表示 live actor 引用。

### 领域状态策略

- `MatchState`: 单局对战的全部领域状态。
- `RunState`: 单个 Roguelike run 的多局进度、已获 Buff、run-level 奖励与中间选择。
- `MetaState`: 跨 run 的解锁、统计、长期进度与存档。
- 经典模式必须仅依赖 `MatchState` 运行；`RunState` 与 `MetaState` 只在 Roguelike 路径中附加。

### 在线架构

- 本地与 AI 对局直接运行共享 `packages/core-engine`。
- 在线对局由 `apps/room-service` 作为权威裁判，客户端只发送命令、不上传状态。
- room-service 只在共享引擎外层增加认证、持久化、广播、幂等、限流、审计和信息过滤。
- Web route handlers 只做代理与 BFF，不承载在线裁判逻辑。
- WebSocket 协议固定围绕 `room.join`、`room.watch`、`room.state`、`match.command`、`match.patch`、`match.resync`、`match.observe`、`room.leave`、`room.error`。
- `match.patch` 必须带单调递增 `seq`；`match.resync` 必须携带 `lastKnownSeq` 并支持 full resync。
- 所有外发状态都必须做 `fog-of-war serialization`：玩家端发送 `PlayerSnapshot`，观战端发送 `SpectatorSnapshot`，不得暴露牌堆顺序、对手 reserve 或其他隐藏信息。

### 数据契约

- 关键公开接口：`GameCommand`、`GameEvent`、`EffectAtom`、`EffectHookPoint`、`AuthoritativeSnapshot`、`PlayerSnapshot`、`SpectatorSnapshot`、`ReplayBundle`、`RoomDetail`、`UiViewModel`。
- Step 02.5 进一步冻结 `ActiveEffect`、`EffectSource`、`EffectExecutionScope`、`EffectLifecycleStage`、`EffectOutcome` 作为公开 vocabulary。
- `SeededRng` 采用 namespaced RNG streams，标准接口包含 `fork(namespace: string)`。
- Replay 采用权威 `MessagePack` bundle，JSON 只作为调试/导出视图。
- `ReplayBundle` 至少包含 `schemaVersion`、`rulesetVersion`、`engineVersion`、`seed`、`initialSnapshot`、`commands[]`、`events[]`、`finalStateHash`、`resultSummary`。
- 在线命令契约至少包含 `MatchCommand.clientCommandId` 与 `MatchCommand.expectedSeq`；服务端 patch 至少包含 `match.patch.seq`；resync 至少包含 `match.resync.lastKnownSeq`。
- 错误统一为 `validation`、`rules`、`conflict`、`infra`、`authz`、`desync` 六类。

### Replay 与确定性策略

- 同一 `seed + command stream + rulesetVersion + engineVersion` 必须得到同一终局结果。
- 回放同时记录 `commands[]` 与 `events[]`；`events[]` 是权威结果，`commands[]` 用于调试、训练与行为复盘。
- 每份 golden replay 都必须携带 `finalStateHash`，CI 只以哈希比对为准，不接受“看起来没问题”。
- 经典规则完成后，至少 5 份真实对局 golden replay 纳入 CI；后续扩展到 Buff、AI、在线权威模式。

### Roguelike / Buff 策略

- Buff 采用 pure hook reducer 模型，不允许在引擎核心散落 hard-coded if/else。
- Buff 只以 `id` 持久化，行为由 hook 注册表解释。
- Buff 不拥有独立的 `BUFF_RESOLUTION` 顶层 hook family，也不拥有独立主流程 phase；只消费既有语义 hook。
- hook 顺序、冲突处理、组合顺序、测试粒度与 replay 序列化规则必须文档化。
- Step 02.5 只冻结 Buff 接入原语与 hook 点，不实现具体 Buff；Step 07 只填充 Buff 业务内容、Run/Meta 规则与样例。
- Step 02.5 的 hook 范围固定为 Match + Run，并采用语义命名如 `GAIN_ROYAL` 与 `EXTRA_TURN`。

### 测试矩阵

- 契约 schema 测试。
- Replay bundle 与 contract snapshot 测试。
- 核心引擎确定性测试。
- actor/state-machine phase guard 测试。
- `fast-check` 性质测试。
- golden replay regression。
- HTTP/WS 契约测试。
- 命令幂等、seq 缺口 resync、观战信息过滤测试。
- Web 与 Desktop 对同一 `UiViewModel` 的消费一致性检查。

### 迁移切换策略

- `old/legacy-vite-electron/` 保持只读；新代码禁止 import。
- 根级 README、TESTING、RELEASE_NOTES 改成索引文档。
- CI 从 `npm + Vite + electron-builder` 迁到 `pnpm + turbo`。
- Step 02 冻结契约边界后，再进入 Step 02.5/03/04 的实现；Step 07 不允许回改 Step 02.5 已冻结的 effect/hook 原语。

### 风险清单

- Splendor Duel 的连锁能力、Royal 与 extra turn 会直接挑战平铺 phase 设计；若不在 Step 02.5 冻结原语，Step 07 会被迫回改底层。
- Roguelike 模式的 Buff、Run、Meta state 与额外随机源会迅速放大架构复杂度；必须用分域 RNG 与 hook 原语先收敛。
- 若 room-service 自行实现一份“服务端版简化引擎”，本地、AI、在线三种模式将不可避免地产生规则漂移。

### 验收标准

- Monorepo 可安装、可构建、可运行基础 Web 与 room-service。
- 存在可运行的确定性 session，从 UI 能驱动状态机并导出 replay。
- 本地、AI 与在线权威模式共享同一 `packages/core-engine`。
- `AGENTS.md`、双语文档、ADR、legacy 归档与 golden replay 质量门已建立。

## EN

### Goals

- Upgrade the project into a `pnpm + Turborepo` monorepo through a greenfield rebuild.
- Make `Next.js App Router` the primary product shell while retaining `Electron` as the desktop distribution shell.
- Introduce an independent core engine, contract layer, application layer, and room service to prevent UI/rule coupling.
- Enforce determinism, actor-based state machines, contract-first boundaries, typed errors, bilingual governance docs, and quality gates.

### Non-goals

- No backward compatibility for legacy replays, saves, or network protocols.
- No accounts, matchmaking, leaderboards, or full live-ops backend in the first delivery wave.
- No direct migration of legacy code from `old/legacy-vite-electron/` into the new core implementation.

### Directory Layout

- `apps/web`: Next.js app and BFF route handlers.
- `apps/desktop`: Electron shell for windows, bridging, and distribution only.
- `apps/room-service`: authoritative online room service.
- `packages/contracts`: Zod contracts, DTOs, envelopes, error codes, snapshot types, and API description sources.
- `packages/domain`: rules constants, value objects, domain errors, ruleset versions, Run/Meta models, and Buff registries.
- `packages/core-engine`: `XState v5 actor model`, effect actors, and deterministic command handling.
- `packages/application`: use cases, sessions, replay export, view-model composition, and mode orchestration.
- `packages/adapters`: namespaced RNG, clock, IDs, in-memory repositories, logging, telemetry, and technical adapters.
- `packages/ui`: pure presentational components and design primitives.
- `docs/*`: architecture, domain, contracts, operations, ADRs, and legacy archive.

### Layering Rules

- `contracts/domain` may not depend on app shells.
- `core-engine` depends only on `contracts/domain`.
- `application` orchestrates the engine and stays framework-agnostic.
- `adapters` owns technical IO without pushing logic upward into pages.
- `apps/web` and `apps/desktop` may only consume `application`, `contracts`, and `ui`.
- `apps/room-service` must reuse the shared `packages/core-engine` and may not fork or reimplement the rule engine.

### State Machine Strategy

- The main match flow uses `XState v5 actor model`, with turn phases driving the main flow and effect actors resolving card abilities, royal effects, extra turns, and Buff hooks.
- Phases describe the main flow only; chained effects are handled through effect-actor / child-actor lifecycles rather than by flattening every effect into sibling phases.
- Every command must pass a phase guard; invalid commands return typed results instead of raw exceptions.
- The core engine may not access time, randomness, network, databases, or host APIs directly.
- Effect/Hook primitives are frozen before classic-rule migration: `EffectAtom`, `EffectHookPoint`, actor lifecycle, hook order, and conflict handling must not be revisited in Step 07.
- `activeEffects` is frozen as the serialized lifecycle view exposed in public snapshots and never represents live actor references.

### Domain State Strategy

- `MatchState`: all state for a single match.
- `RunState`: multi-match progress, Buff acquisitions, run-level rewards, and branching choices for a single roguelike run.
- `MetaState`: cross-run unlocks, statistics, long-term progression, and save data.
- Classic mode must run on `MatchState` alone; `RunState` and `MetaState` only layer on top for roguelike flows.

### Online Architecture

- Local and AI matches run directly on the shared `packages/core-engine`.
- Online matches are authoritative in `apps/room-service`; clients send commands only and never submit state.
- room-service adds only authentication, persistence, broadcasting, idempotency, rate limiting, auditing, and information filtering around the shared engine.
- Web route handlers stay limited to proxy/BFF work and must not host match authority logic.
- The WebSocket contract is centered on `room.join`, `room.watch`, `room.state`, `match.command`, `match.patch`, `match.resync`, `match.observe`, `room.leave`, and `room.error`.
- `match.patch` must carry a monotonic `seq`; `match.resync` must include `lastKnownSeq` and support full resync.
- All outbound state must use fog-of-war serialization: players receive `PlayerSnapshot`, spectators receive `SpectatorSnapshot`, and hidden data such as deck order or opponent reserves must never leak.

### Data Contracts

- The main public interfaces are `GameCommand`, `GameEvent`, `EffectAtom`, `EffectHookPoint`, `AuthoritativeSnapshot`, `PlayerSnapshot`, `SpectatorSnapshot`, `ReplayBundle`, `RoomDetail`, and `UiViewModel`.
- Step 02.5 also freezes `ActiveEffect`, `EffectSource`, `EffectExecutionScope`, `EffectLifecycleStage`, and `EffectOutcome` as public vocabulary.
- `SeededRng` uses namespaced RNG streams and standardizes on `fork(namespace: string)`.
- Replay uses an authoritative `MessagePack` bundle; JSON is for debug/export views only.
- `ReplayBundle` contains at least `schemaVersion`, `rulesetVersion`, `engineVersion`, `seed`, `initialSnapshot`, `commands[]`, `events[]`, `finalStateHash`, and `resultSummary`.
- Online command contracts include at least `MatchCommand.clientCommandId` and `MatchCommand.expectedSeq`; server patches include `match.patch.seq`; resync includes `match.resync.lastKnownSeq`.
- Errors are normalized into `validation`, `rules`, `conflict`, `infra`, `authz`, and `desync`.

### Replay and Determinism Strategy

- The same `seed + command stream + rulesetVersion + engineVersion` must produce the same final result.
- Replays store both `commands[]` and `events[]`; `events[]` are authoritative while `commands[]` support debugging, training, and player-intent review.
- Every golden replay must carry a `finalStateHash`, and CI treats hash comparison as the only source of truth.
- After classic rules land, at least 5 real match golden replays must enter CI before moving on.

### Roguelike / Buff Strategy

- Buffs use a pure hook reducer model; hard-coded if/else branches scattered across the engine are not allowed.
- Buffs persist by `id` only, while behavior is interpreted through hook registries.
- Buffs do not own a dedicated `BUFF_RESOLUTION` top-level hook family or a standalone main-flow phase; they consume the existing semantic hook surface.
- Hook order, conflict handling, composition order, test granularity, and replay serialization rules must be documented.
- Step 02.5 freezes the Buff integration primitives and hook points only; Step 07 fills in concrete Buff business logic, Run/Meta rules, and samples.
- Step 02.5 freezes Match + Run hook scope and semantic hook names such as `GAIN_ROYAL` and `EXTRA_TURN`.

### Test Matrix

- Contract schema tests.
- Replay bundle and contract snapshot tests.
- Core-engine determinism tests.
- Actor/state-machine phase guard tests.
- `fast-check` property tests.
- Golden replay regression.
- HTTP and WebSocket contract tests.
- Command idempotency, seq-gap resync, and spectator information-filtering tests.
- Consistency checks for Web and Desktop consumption of the same `UiViewModel`.

### Migration Strategy

- Keep `old/legacy-vite-electron/` read-only; importing it from the new codebase is forbidden.
- Rewrite the root README, TESTING, and RELEASE_NOTES into index documents.
- Move CI from `npm + Vite + electron-builder` to `pnpm + turbo`.
- Freeze contract boundaries in Step 02 before entering Step 02.5/03/04; Step 07 may not revisit the effect/hook primitives frozen in Step 02.5.

### Risks

- Splendor Duel chained abilities, royal rewards, and extra turns directly challenge flat phase modeling; failing to freeze primitives in Step 02.5 will force Step 07 to revisit the engine core.
- Roguelike Buffs, Run/Meta state, and extra random domains rapidly amplify architectural complexity; namespaced RNG and hook primitives must be settled first.
- If room-service grows its own “server-side simplified engine,” local, AI, and online modes will inevitably drift apart.

### Acceptance Criteria

- The monorepo installs, builds, and runs the baseline Web and room-service apps.
- A deterministic session exists and can be driven from UI into replay export.
- Local, AI, and authoritative online modes share the same `packages/core-engine`.
- `AGENTS.md`, bilingual docs, ADRs, legacy archive entries, and golden replay quality gates are all established.
