# Phase 2 UiViewModel 2.0 Contract Prep

## ZH

### 文档定位

本文是 Phase 2 的 contract prep 清单，用于在真正修改 `packages/contracts` 之前，先冻结 `UiViewModel` 2.0 预期扩展面、受影响 payload、消费者与验证产物。

### 当前契约基线

- `UiViewModelSchema` 当前只暴露：
    - `title`
    - `subtitle`
    - `snapshot`
    - `availableActions`
- 这套 surface 适合 Step 06 的 validation shell，但不足以支撑：
    - board cell 逐格可点击状态；
    - market / reserve / player-zone 的展示模型；
    - room waiting / resync / disconnected / completed overlay；
    - chained prompt / pending selection 的中间态；
    - spectator / player / out-of-turn viewer 的统一 presentation contract。

### 预期新增字段族

以下字段族视为 Phase 2 的最小候选集合，具体字段名以后续 schema PR 为准，但语义不得缺席：

- viewer identity
    - `viewerRole`
    - `seat`
- session / room status
    - `sessionStatus`
    - `statusReason?`
- board presentation
    - `boardCells[]`
    - 每格的 `positionId`、token、可见数量、`selectable`、`selected`、`reason?`
- market presentation
    - `marketSlots[]`
    - `selectableAsBuy`
    - `selectableAsReserve`
- reserve / player presentation
    - `reserveSlots[]`
    - `playerZones[]`
- royal / prompt presentation
    - `royalOffers[]`
    - `promptStack[]`
- selection progress
    - `selectionDraft?`
    - 若 ADR 选择客户端 draft intent，则需要额外 `selectionHints[]`
- mode-specific sidecar
    - `runPanel?`

### 与 ADR 的耦合点

若 Board Selection Model ADR 选择 A（推荐）：

- 预计需要新增 pending-selection 风格 command / phase surface；
- `promptStack` / `selectionDraft` 可以直接表达引擎已进入的中间阶段；
- page / ui 不需要重新计算“下一步哪些格子可选”。

若 ADR 选择 B：

- `UiViewModel` 必须承担更多 selection hint 职责；
- room resync / spectator / replay 需要额外解释 client-side draft state 的可见性与恢复方式；
- 这条路线默认视为更高风险，除非 ADR 明确证明收益。

### 受影响契约面

Phase 2 contract PR 启动时，至少要审查下列文件与产物：

- `packages/contracts/src/ui.ts`
- `packages/contracts/src/game.ts`
- `packages/contracts/src/snapshots.ts`
- room / observe / resync 相关 payload schema
- `packages/contracts/generated/openapi/openapi.json`
- `packages/contracts/generated/asyncapi/asyncapi.yaml`
- `packages/contracts/src/__fixtures__/openapi.expected.json`
- `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`

### 受影响消费者

- `packages/application`
    - `buildVisibleUiViewModel`
    - `buildRoomUiViewModel`
    - board-facing projection helpers
- `apps/web`
    - `/play/local`
    - `/play/ai`
    - `/play/run`
    - `/rooms/[roomId]`
- `packages/ui`
    - `MatchView` 当前的 text-summary shell
    - 后续 board primitives / sidecars
- `apps/room-service`
    - 仅限 payload schema 跟随，不得接管 renderer-specific 推导
- `apps/desktop`
    - 继续消费 shared shell contract，不新增 desktop-only projection

### 必备迁移产物

真正进入 contract 修改时，本 phase 至少需要同时产出：

- 一份 ADR：决定 A / B 路线；
- 一份 migration note：说明 Step 06 shell surface 如何扩到 `UiViewModel` 2.0；
- schema 变更；
- OpenAPI / AsyncAPI 再生成；
- contract fixtures 更新；
- 至少一组 property tests / schema parse tests；
- 对 room / spectator / replay 兼容性的明确说明。

### Guardrails

- 默认按 additive contract change 处理，直到出现 replay / snapshot-tier / ws payload breaking evidence。
- 不允许页面层继续用 `room.status`、viewer 推导或 selectable 推导来替代 schema 字段。
- spectator 与非当前行动玩家仍不得因为字段扩展而获得隐藏信息或可执行权限。
- 若 phase / command surface 改动会改变 replay 语义，必须追加 replay note 与 golden verification 计划。

### 本文的用途

- 作为 Phase 2 contract PR 的 checklist。
- 作为 ADR 完成前的字段 inventory。
- 作为后续 `docs/30-contracts/` migration note 的输入，而不是其替代品。

## EN

### Document Role

This document is the Phase 2 contract-prep inventory. It freezes the expected `UiViewModel` 2.0 expansion surface, affected payloads, consumers, and validation artifacts before any actual schema work begins in `packages/contracts`.

### Current Contract Baseline

- `UiViewModelSchema` currently exposes only:
    - `title`
    - `subtitle`
    - `snapshot`
    - `availableActions`
- That surface is sufficient for the Step 06 validation shell, but not for:
    - per-cell board interactivity;
    - market / reserve / player-zone presentation;
    - room waiting / resync / disconnected / completed overlays;
    - chained prompt / pending-selection intermediate state;
    - a unified spectator / player / out-of-turn viewer presentation contract.

### Expected New Field Families

The following field families are the minimum candidate set for Phase 2. Final names belong to the later schema PR, but the semantics should not disappear:

- viewer identity
    - `viewerRole`
    - `seat`
- session / room status
    - `sessionStatus`
    - `statusReason?`
- board presentation
    - `boardCells[]`
    - per-cell `positionId`, token, visible quantity, `selectable`, `selected`, and optional `reason`
- market presentation
    - `marketSlots[]`
    - `selectableAsBuy`
    - `selectableAsReserve`
- reserve / player presentation
    - `reserveSlots[]`
    - `playerZones[]`
- royal / prompt presentation
    - `royalOffers[]`
    - `promptStack[]`
- selection progress
    - `selectionDraft?`
    - if the ADR chooses client draft intent, extra `selectionHints[]` are expected
- mode-specific sidecar
    - `runPanel?`

### Coupling to the ADR

If the Board Selection Model ADR chooses Option A (recommended):

- a pending-selection command/phase surface is likely required;
- `promptStack` / `selectionDraft` can directly reflect engine-owned intermediate state;
- page/ui layers do not need to recalculate legal next cells.

If the ADR chooses Option B:

- `UiViewModel` must carry more selection-hint responsibility;
- room resync / spectator / replay flows must additionally explain client-draft visibility and restoration semantics;
- this path should be treated as higher risk unless the ADR proves otherwise.

### Affected Contract Surface

When the actual Phase 2 contract PR starts, at minimum review:

- `packages/contracts/src/ui.ts`
- `packages/contracts/src/game.ts`
- `packages/contracts/src/snapshots.ts`
- room / observe / resync payload schemas
- `packages/contracts/generated/openapi/openapi.json`
- `packages/contracts/generated/asyncapi/asyncapi.yaml`
- `packages/contracts/src/__fixtures__/openapi.expected.json`
- `packages/contracts/src/__fixtures__/asyncapi.expected.yaml`

### Affected Consumers

- `packages/application`
    - `buildVisibleUiViewModel`
    - `buildRoomUiViewModel`
    - board-facing projection helpers
- `apps/web`
    - `/play/local`
    - `/play/ai`
    - `/play/run`
    - `/rooms/[roomId]`
- `packages/ui`
    - the current `MatchView` text-summary shell
    - later board primitives / sidecars
- `apps/room-service`
    - payload-schema follow-up only; it may not take over renderer-specific derivation
- `apps/desktop`
    - continues to consume the shared shell contract without desktop-only projection

### Required Migration Outputs

Once contract work begins, this phase should land at least:

- an ADR deciding between A / B;
- a migration note explaining how the Step 06 shell surface expands into `UiViewModel` 2.0;
- schema changes;
- regenerated OpenAPI / AsyncAPI artifacts;
- updated contract fixtures;
- at least one property-test / schema-parse-test wave;
- explicit notes for room / spectator / replay compatibility.

### Guardrails

- Treat the work as an additive contract change until replay / snapshot-tier / ws-payload evidence proves otherwise.
- Do not keep page-local `room.status`, viewer, or selectable derivation as a substitute for schema fields.
- Spectators and non-active players must not gain hidden information or actionable authority because of the expansion.
- If the phase/command surface changes replay semantics, add a replay note and a golden-verification plan.

### Why This Document Exists

- It is the checklist for the later Phase 2 contract PR.
- It is the field inventory before the ADR is finalized.
- It is an input to the later `docs/30-contracts/` migration note rather than a replacement for it.
