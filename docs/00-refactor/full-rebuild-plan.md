# Gem Duel Full Rebuild Plan

## ZH

### 目标

- 以绿地重写方式将项目升级为 `pnpm + Turborepo` monorepo。
- 将 `Next.js App Router` 作为主应用，`Electron` 保留为桌面发行壳。
- 建立独立核心引擎、契约层、应用层与房间服务，避免 UI 与规则耦合。
- 推行确定性、状态机、契约优先、错误模型统一、文档双语治理与质量门禁。

### 非目标

- 不承诺兼容旧回放、旧存档、旧联机协议。
- 不在首轮交付账号、匹配、排行榜与完整运营后台。
- 不将 `old/legacy-vite-electron/` 内的旧实现直接迁入新核心。

### 新目录

- `apps/web`: Next.js Web 主应用与 BFF route handlers。
- `apps/desktop`: Electron 桌面壳，只承载窗口、桥接和分发。
- `apps/room-service`: 权威在线房间服务。
- `packages/contracts`: Zod 契约、DTO、消息信封、错误码与 OpenAPI 源。
- `packages/domain`: 规则常量、值对象、领域错误与规则版本。
- `packages/core-engine`: XState v5 状态机与确定性命令处理。
- `packages/application`: 用例编排、session、replay 导出、view model 构建。
- `packages/adapters`: RNG、clock、ID、内存仓储、日志等适配器。
- `packages/ui`: 纯展示组件与设计系统。
- `docs/*`: 架构、领域、契约、运维、ADR、legacy 归档。

### 分层规则

- `contracts/domain` 不依赖任何 app。
- `core-engine` 只依赖 `contracts/domain`。
- `application` 编排引擎，不接触框架 UI。
- `adapters` 负责 IO 与技术实现，不反向依赖 app 页面。
- `apps/web` 和 `apps/desktop` 只能消费 `application`、`contracts`、`ui`。

### 状态机策略

- 强制显式 phase：`initialization`、`modeSelection`、`turnIdle`、`gemSelection`、`reserving`、`buying`、`privilege`、`royalResolution`、`buffResolution`、`replay`、`terminal`。
- 任何命令都必须经过 phase guard；非法命令返回 typed result 错误而不是裸异常。
- 核心引擎内部禁止时间、随机、网络、数据库和宿主 API。

### 在线架构

- 本地与 AI 对局直接运行 `packages/core-engine`。
- 在线对局由 `apps/room-service` 作为权威裁判，客户端只发送命令、不上传状态。
- Web route handlers 只做代理与 BFF，不承载在线裁判逻辑。
- WebSocket 协议固定为 `room.join`、`room.state`、`match.command`、`match.patch`、`match.resync`、`room.leave`、`room.error`。

### 数据契约

- 关键公开接口：`GameCommand`、`GameEvent`、`GameSnapshot`、`ReplayBundle`、`RoomDetail`、`UiViewModel`。
- Replay 使用版本化 bundle，包含 `schemaVersion`、`rulesetVersion`、`seed`、`initialSnapshot`、`events`、`resultSummary`。
- 错误统一为 `validation`、`rules`、`conflict`、`infra`、`authz`、`desync` 六类。

### 测试矩阵

- 契约 schema 测试。
- 核心引擎确定性测试。
- 状态机 phase guard 测试。
- HTTP/WS 契约测试。
- 房间创建、加入、回放导出测试。
- Web 与 Desktop 对同一 `UiViewModel` 的消费一致性检查。

### 迁移切换策略

- `old/legacy-vite-electron/` 保持只读；新代码禁止 import。
- 根级 README、TESTING、RELEASE_NOTES 改成索引文档。
- CI 从 `npm + Vite + electron-builder` 迁到 `pnpm + turbo`。

### 风险清单

- 全量玩法尚未完成新引擎迁移前，Next 与 room-service 只能展示基础骨架能力。
- 旧逻辑体量大，真实规则回归需要按 Buff、AI、联机边缘行为分批移植。
- Electron 正式打包仍需接入 standalone Web 输出路径与更新策略。

### 验收标准

- Monorepo 可安装、可构建、可运行基础 Web 与 room-service。
- 存在可运行的确定性 session，从 UI 能驱动状态机并导出 replay。
- `AGENTS.md` 与双语文档已建立，legacy 文档已有归档入口。

## EN

### Goals

- Upgrade the project into a `pnpm + Turborepo` monorepo through a greenfield rebuild.
- Make `Next.js App Router` the primary product shell while retaining `Electron` as the desktop distribution shell.
- Introduce an independent core engine, contract layer, application layer, and room service to prevent UI/rule coupling.
- Enforce determinism, explicit state machines, contract-first boundaries, typed errors, bilingual governance docs, and quality gates.

### Non-goals

- No backward compatibility for legacy replays, saves, or network protocols.
- No accounts, matchmaking, leaderboards, or full live-ops backend in the first delivery wave.
- No direct migration of legacy code from `old/legacy-vite-electron/` into the new core implementation.

### Directory Layout

- `apps/web`: Next.js app and BFF route handlers.
- `apps/desktop`: Electron shell for windows, bridging, and distribution only.
- `apps/room-service`: authoritative online room service.
- `packages/contracts`: Zod contracts, DTOs, envelopes, error codes, and OpenAPI source.
- `packages/domain`: rules constants, value objects, domain errors, and ruleset versions.
- `packages/core-engine`: XState v5 machine and deterministic command handling.
- `packages/application`: use cases, sessions, replay export, and view-model composition.
- `packages/adapters`: RNG, clock, IDs, repositories, logging, and technical adapters.
- `packages/ui`: pure presentational components and design primitives.
- `docs/*`: architecture, domain, contracts, operations, ADRs, and legacy archive.

### Layering Rules

- `contracts/domain` may not depend on app shells.
- `core-engine` depends only on `contracts/domain`.
- `application` orchestrates the engine and stays framework-agnostic.
- `adapters` owns technical IO without pushing logic upward into pages.
- `apps/web` and `apps/desktop` may only consume `application`, `contracts`, and `ui`.

### State Machine Strategy

- Enforce explicit phases: `initialization`, `modeSelection`, `turnIdle`, `gemSelection`, `reserving`, `buying`, `privilege`, `royalResolution`, `buffResolution`, `replay`, `terminal`.
- Every command must pass a phase guard; invalid commands return typed results instead of raw exceptions.
- The core engine may not access time, randomness, network, databases, or host APIs directly.

### Online Architecture

- Local and AI matches run directly on `packages/core-engine`.
- Online matches are authoritative in `apps/room-service`; clients send commands only and never submit state.
- Web route handlers stay limited to proxy/BFF work and must not host match authority logic.
- The WebSocket contract remains fixed around `room.join`, `room.state`, `match.command`, `match.patch`, `match.resync`, `room.leave`, and `room.error`.

### Data Contracts

- The main public interfaces are `GameCommand`, `GameEvent`, `GameSnapshot`, `ReplayBundle`, `RoomDetail`, and `UiViewModel`.
- Replay uses a versioned bundle with `schemaVersion`, `rulesetVersion`, `seed`, `initialSnapshot`, `events`, and `resultSummary`.
- Errors are normalized into `validation`, `rules`, `conflict`, `infra`, `authz`, and `desync`.

### Test Matrix

- Contract schema tests.
- Core-engine determinism tests.
- State-machine phase guard tests.
- HTTP and WebSocket contract tests.
- Room creation, join, and replay export tests.
- Consistency checks for Web and Desktop consumption of the same `UiViewModel`.

### Migration Strategy

- Keep `old/legacy-vite-electron/` read-only; importing it from the new codebase is forbidden.
- Rewrite the root README, TESTING, and RELEASE_NOTES into index documents.
- Move CI from `npm + Vite + electron-builder` to `pnpm + turbo`.

### Risks

- Until the full ruleset is migrated, the new Next.js and room-service flows only represent the first operational slice of the architecture.
- The legacy ruleset is large; true gameplay parity requires phased migration across buffs, AI behavior, and online edge cases.
- Electron production packaging still needs final standalone output wiring and updater integration.

### Acceptance Criteria

- The monorepo installs, builds, and runs the baseline Web and room-service apps.
- A deterministic session exists and can be driven from UI into replay export.
- `AGENTS.md`, bilingual docs, and the legacy archive entry points are present.
