# Phase 2 Interaction and UiViewModel Plan

## ZH

### 文档定位

本文是 `docs/10-architecture/full-board-ui-roadmap.md` Phase 2 的治理主文档，用来把“多阶段交互范式决策”和“`UiViewModel` 2.0 契约扩展”的前置门、迁移顺序、write-scope 与非目标写清楚，避免后续实现直接滑入页面层临时拼装。

### 当前约束与触发原因

- 当前 `packages/contracts/src/ui.ts` 中的 `UiViewModelSchema` 只有：
    - `title`
    - `subtitle`
    - `snapshot`
    - `availableActions`
- 当前 `packages/application/src/index.ts` 仍通过枚举式 `buildActions()` 生成全部 `UiActionDescriptor`，与 full-board UI 需要的分步点击、高亮、确认、取消等中间状态不匹配。
- 当前 `apps/web/app/rooms/[roomId]/room-live-client.tsx` 仍在页面层本地推导：
    - `room.status`
    - `viewer`
    - join/watch/binding 周边的显示状态
- Step 06 的 shared shell integration 只冻结了 viewer-scoped `availableActions`，并未冻结 full-board 所需的 board-facing presentation contract。

### Phase 2 不变边界

- 在 ADR 决策落地前，不直接改 `packages/contracts`、`packages/core-engine` 或 `packages/application` 的 runtime behavior。
- 不在 `apps/web`、`apps/desktop` 或 `packages/ui` 中偷渡 phase legality、隐藏信息推导、可选目标推导。
- 不把 design tokens、shared CSS ownership、visual harness 混入本 phase；这些属于 Phase 2.5。
- 不把 `/play/local` 切为 full-board renderer；这些属于 Phase 4。

### 前置门：Board Selection Model ADR

在任何 contract PR 开始前，必须先写一份短 ADR，明确多阶段交互采用哪一种范式：

- 方案 A：把多位置选择统一建模为 effect-prompt / pending-selection 风格的原子化命令序列。
- 方案 B：允许客户端维护 draft intent，再把结果一次性提交给引擎。

默认推荐 A，理由：

- 与 Step 02.5 冻结的 `activeEffects / effectPrompts` 语义更一致；
- 更适合 online / spectator / replay 同步中间状态；
- 可把“合法下一步”继续收敛在引擎与 projection，而不是页面临时推导；
- 更容易与 `take_board_token`、`take_opponent_token`、`gain_royal` 一类已有 prompt 原语对齐。

若最终选择 B，必须额外满足：

- 在 `UiViewModel` 中显式引入 `selectionHints` / `selectionDraft` 之类的 schema-backed 提示面；
- 明确客户端 draft state 的取消、重连、spectator、resync 与 replay 语义；
- 证明页面层不会重新成为合法性交互推导中心。

### ADR 评估维度

ADR 至少需要对以下维度给出结论：

- 多选交互是否能完整表达：
    - `USE_PRIVILEGE` 取 2 格；
    - `TAKE_TOKENS` 连线多选；
    - reserve + gold 联动；
    - buy 后 bonus token / royal prompt 串联。
- 中间状态是否能被 replay / resync / spectator 安全表达。
- `room-service` 是否只需继续转发 filtered snapshot 与 projected actions，而不新增壳层规则。
- UI 是否能只消费 contract-facing selection state，而不需要自己猜 phase。
- 若新增 command / phase surface，是否需要 `contract-change` + `add-phase-transition` 双流程治理。

### `UiViewModel` 2.0 目标

Phase 2 的 contract 目标不是“把完整 React 组件树塞进 schema”，而是为 board-facing renderer 提供最小充分、viewer-aware、room-aware 的展示契约。

本 phase 至少要覆盖以下字段族：

- viewer / seat：
    - `viewerRole`
    - `seat`
- session / room status：
    - `sessionStatus`
    - room-completion / waiting / resyncing / disconnected 相关状态
- board presentation：
    - `boardCells[]`
    - 每格的 token / selectable / selected / disabled reason
- market / reserve / player zone presentation：
    - `marketSlots[]`
    - `reserveSlots[]`
    - `playerZones[]`
- chained prompt / selection state：
    - `promptStack[]`
    - `selectionDraft?`
- mode-specific sidecars：
    - `runPanel?`
    - 未来 AI trace / replay 只挂 sidecar-facing 字段，不重新开第二套主盘面契约

### 推荐迁移顺序

1. 先完成 ADR，冻结多阶段交互范式。
2. 再写 contract prep / migration note，把新增字段、受影响 payload、fixtures 与 tests 一次性列清。
3. 若 ADR 选择 A，先定义 pending-selection 命令/phase 的最小 surface。
4. 再扩 `UiViewModelSchema` 与相关 room/UI payload。
5. 再扩 `packages/application` projection，让 board-facing 页面不再在页面层推导 viewer / status / selectable。
6. 最后再交给 Phase 2.5 / 3 / 4 的 renderer 与 visual work 消费。

### Write Scope 约束

- ADR 文档与 contract prep 可先独立提交，不应和真正的 schema/engine 改动绑死在同一提交。
- 一旦进入 contract 改动，`packages/contracts`、`docs/30-contracts/`、fixtures 与 regeneration 应同批提交。
- 若新增 phase / command surface，必须把：
    - `packages/contracts`
    - `packages/core-engine`
    - `packages/application`
    - 对应 docs / migration note
      放在同一条变更链上核对。
- `apps/web` 和 `packages/ui` 在 Phase 2 只允许消费新 contract，不得自行发明额外字段。

### 本 phase 非目标

- 不在本阶段创建 full-board primitives。
- 不在本阶段迁移 `gd-*` 样式。
- 不在本阶段切本地、AI、run 或 online 页面到新盘面。
- 不把本阶段文档准备误写为契约已完成或 UI 已可玩。

### Phase 2 治理完成定义

- 已存在明确 ADR 决策门，而不是把 A/B 两种路线继续并存到实现阶段。
- 已存在 `UiViewModel` 2.0 的 contract prep / migration inventory，可直接指导后续 contract PR。
- 已明确哪些页面级本地推导必须在 Phase 2 contract landed 后删除。

## EN

### Document Role

This document is the governance anchor for Phase 2 in `docs/10-architecture/full-board-ui-roadmap.md`. It defines the decision gate, migration order, write scopes, and non-goals for the multi-step interaction model and the `UiViewModel` 2.0 expansion so later implementation work does not slide back into page-local inference.

### Current Constraints and Why Phase 2 Exists

- `packages/contracts/src/ui.ts` currently limits `UiViewModelSchema` to:
    - `title`
    - `subtitle`
    - `snapshot`
    - `availableActions`
- `packages/application/src/index.ts` still relies on enumerative `buildActions()` output, which does not match the incremental click/highlight/confirm/cancel flow expected by a full board UI.
- `apps/web/app/rooms/[roomId]/room-live-client.tsx` still performs page-local derivation for:
    - `room.status`
    - `viewer`
    - binding/join/watch display state around the realtime room flow
- Step 06 froze shared-shell `availableActions`, but it did not freeze the board-facing presentation contract needed for the full board UI.

### Phase 2 Invariants

- Do not change runtime behavior in `packages/contracts`, `packages/core-engine`, or `packages/application` until the ADR gate is resolved.
- Do not smuggle phase legality, hidden-info reconstruction, or selectable-target inference into `apps/web`, `apps/desktop`, or `packages/ui`.
- Do not mix design tokens, shared CSS ownership, or the visual harness into this phase; those belong to Phase 2.5.
- Do not switch `/play/local` to the full-board renderer yet; that belongs to Phase 4.

### Entry Gate: Board Selection Model ADR

Before any contract PR begins, a short ADR must choose one of two interaction models:

- Option A: model multi-position selection as effect-prompt / pending-selection style atomic command sequences.
- Option B: allow client-side draft intent before a final commit back into the engine.

Option A is the default recommendation because it:

- aligns better with the Step 02.5-frozen `activeEffects / effectPrompts` semantics;
- is safer for online / spectator / replay synchronization of intermediate state;
- keeps “legal next step” logic concentrated in the engine plus projection instead of page code;
- maps more naturally onto existing prompt atoms such as `take_board_token`, `take_opponent_token`, and `gain_royal`.

If Option B is chosen, it must also:

- introduce explicit schema-backed `selectionHints` / `selectionDraft` style fields in `UiViewModel`;
- define cancel/reconnect/spectator/resync/replay semantics for client draft state;
- prove that pages do not become the new legality-inference center.

### ADR Evaluation Dimensions

The ADR must answer at least:

- whether the model can fully represent:
    - `USE_PRIVILEGE` taking 2 positions;
    - linked multi-token selection for `TAKE_TOKENS`;
    - reserve + gold coupling;
    - chained bonus-token / royal prompts after a buy;
- whether intermediate state can be expressed safely for replay / resync / spectators;
- whether `room-service` can remain a filtered-snapshot plus projected-action transport only;
- whether the UI can consume contract-facing selection state without inferring phase legality on its own;
- whether new command/phase surfaces require the combined `contract-change` + `add-phase-transition` workflow.

### `UiViewModel` 2.0 Goal

The Phase 2 contract goal is not to encode a React component tree into the schema. It is to supply the minimum sufficient, viewer-aware, room-aware presentation contract for board-facing renderers.

At minimum, this phase must cover:

- viewer / seat:
    - `viewerRole`
    - `seat`
- session / room status:
    - `sessionStatus`
    - completion / waiting / resyncing / disconnected semantics
- board presentation:
    - `boardCells[]`
    - per-cell token / selectable / selected / disabled-reason state
- market / reserve / player-zone presentation:
    - `marketSlots[]`
    - `reserveSlots[]`
    - `playerZones[]`
- chained prompt / selection state:
    - `promptStack[]`
    - `selectionDraft?`
- mode-specific sidecars:
    - `runPanel?`
    - future AI/replay state should remain sidecar-facing rather than reopening a second main-board contract

### Recommended Migration Order

1. Finish the ADR and freeze the multi-step interaction model.
2. Write the contract-prep / migration inventory so new fields, affected payloads, fixtures, and tests are listed in one place.
3. If Option A wins, define the minimum pending-selection command/phase surface first.
4. Expand `UiViewModelSchema` and related room/UI payloads next.
5. Expand the `packages/application` projection so board-facing pages stop deriving viewer/status/selectable state locally.
6. Only then hand off to Phase 2.5 / 3 / 4 renderer and visual work.

### Write-Scope Constraints

- The ADR and contract-prep docs may land first as governance-only commits and should not be tightly coupled to the later schema/engine change.
- Once contract work starts, `packages/contracts`, `docs/30-contracts/`, fixtures, and regeneration should land together.
- If new phase/command surface is introduced, the following must be reviewed as one change chain:
    - `packages/contracts`
    - `packages/core-engine`
    - `packages/application`
    - matching docs / migration notes
- `apps/web` and `packages/ui` may only consume the new contract in Phase 2 and may not invent extra fields of their own.

### Phase 2 Non-Goals

- Do not build full-board primitives here.
- Do not migrate `gd-*` styling here.
- Do not switch local, AI, run, or online routes to the new board here.
- Do not treat governance prep as equivalent to completed contracts or playable UI.

### Governance Definition of Done

- A real ADR decision gate exists instead of carrying both interaction models into implementation.
- A `UiViewModel` 2.0 contract prep / migration inventory exists and can guide the later contract PR directly.
- The page-local derivations that must disappear after the Phase 2 contract lands are explicitly identified.
