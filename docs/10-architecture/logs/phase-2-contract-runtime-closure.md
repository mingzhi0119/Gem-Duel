# Phase 2 Log - Contract/Runtime Closure

## ZH

- 日期：2026-04-17
- Phase：Phase 2
- 状态：Closed (contract/runtime)
- 范围：在不把 UI consumer migration 误记为本 phase 未完成项的前提下，正式关闭 Phase 2 的 contract/runtime 账面范围，并把余下 shared `BoardScene` 接入工作移交给 Phase 6。
- 关闭判断：
    - ADR-0006 已确定 board selection model 采用 engine-owned pending-selection 路径；
    - `UiViewModel v2` 已通过 `packages/contracts/src/ui.ts`、application projection 与 migration note 落地；
    - `pendingSelection` 已进入 contract、snapshot、core-engine runtime 与 replay-visible state；
    - `roomStatus` additive contract 已落地，不再把 room 级状态口径留给页面层自由拼接；
    - `UiSessionStatus = 'replay'` 当前已有 producer，因此不进入本轮 remediation backlog。
- 关闭范围 / 冻结点：
    - `UiViewModel v2`
    - `pendingSelection`
    - `roomStatus` additive contract
    - `UiSessionStatus = 'replay'` 已有 producer
- 证据锚点：
    - ADR：`docs/90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`
    - Migration note：`docs/30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`
    - Contract：`packages/contracts/src/ui.ts`、`packages/contracts/src/game.ts`、`packages/contracts/src/snapshots.ts`
    - Application projection：`packages/application/src/index.ts`
    - Runtime：`packages/core-engine/src/runtime.ts`、`packages/core-engine/src/classic-transitions.ts`
- 移交给后续 phase 的事项：
    - `room-live-client` 最终切换到 shared `BoardScene`；
    - online/spectator 入口与 shared board renderer 的最终 consumer migration；
    - spectator / resync / pendingSelection leakage 的 UI-level gate 与 property test 收口。
- 备注：
    - Phase 2 的 contract/runtime 关闭，不等于所有 board-facing 页面都已切换到 shared renderer；
    - 上述 consumer migration 统一移交给 Phase 6，避免用“还没切 UI”把已落地的 contract/runtime surface 长期标记为 `In Progress`。

## EN

- Date: 2026-04-17
- Phase: Phase 2
- Status: Closed (contract/runtime)
- Scope: formally close the contract/runtime scope of Phase 2 without misclassifying the remaining UI consumer migration as unfinished Phase 2 work, and hand the shared `BoardScene` adoption over to Phase 6.
- Closure judgment:
    - ADR-0006 has already chosen the engine-owned pending-selection path for the board-selection model;
    - `UiViewModel v2` has landed through `packages/contracts/src/ui.ts`, application projection, and the migration note;
    - `pendingSelection` now exists across contract, snapshot, core-engine runtime, and replay-visible state;
    - `roomStatus` has landed as an additive contract rather than a page-local convention;
    - `UiSessionStatus = 'replay'` already has a producer and is therefore excluded from this remediation backlog.
- Closure surface / freeze point:
    - `UiViewModel v2`
    - `pendingSelection`
    - `roomStatus` additive contract
    - `UiSessionStatus = 'replay'` already has a producer
- Evidence anchors:
    - ADR: `docs/90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`
    - Migration note: `docs/30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`
    - Contract: `packages/contracts/src/ui.ts`, `packages/contracts/src/game.ts`, `packages/contracts/src/snapshots.ts`
    - Application projection: `packages/application/src/index.ts`
    - Runtime: `packages/core-engine/src/runtime.ts`, `packages/core-engine/src/classic-transitions.ts`
- Deferred to later phases:
    - final `room-live-client` migration onto the shared `BoardScene`;
    - final online/spectator consumer migration onto the shared board renderer;
    - UI-level spectator / resync / pendingSelection leakage gates and property-test closure.
- Notes:
    - Closing Phase 2 at the contract/runtime level does not mean every board-facing page already runs on the shared renderer;
    - those consumer-migration items are explicitly moved to Phase 6 so the landed contract/runtime surface is not kept artificially `In Progress`.
