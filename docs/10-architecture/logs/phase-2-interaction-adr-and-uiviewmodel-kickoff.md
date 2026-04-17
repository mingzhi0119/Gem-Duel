# Phase 2 Log - Interaction ADR and UiViewModel 2.0 Kickoff

## ZH

- 日期：2026-04-17
- Phase：Phase 2
- 状态：进行中
- 范围：启动 `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 2，明确 board-selection-model ADR 前置门、`UiViewModel` 2.0 contract prep 清单，以及后续 contract / phase-transition work 的治理顺序。
- 本次启动结果：
    - 已确认 Phase 2 的第一前置门是 ADR，而不是直接开始 schema 或引擎改动。
    - 已补 `../phase-2-interaction-and-uiviewmodel-plan.md`，明确 A/B 两种交互范式、推荐路径、评估维度、迁移顺序与 write-scope。
    - 已补 `../../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`，整理 `UiViewModel` 2.0 的字段候选、受影响 payload、消费者与必备迁移产物。
    - 已重新确认 `apps/web/app/rooms/[roomId]/room-live-client.tsx` 仍存在页面层的 `room.status` / viewer 推导，因此 Phase 2 contract 落地后必须回收这类本地推导。
- 当前未完成项：
    - ADR 尚未正式写出，也尚未在 A / B 间做最终决策；
    - `packages/contracts`、`packages/core-engine`、`packages/application` 还没有任何 runtime surface 改动；
    - migration note、fixtures、contract regen、property tests 仍待后续 contract PR 一并完成。
- 下一步：
    - 先写 board-selection-model ADR；
    - 再按 contract prep 清单启动 `UiViewModel` 2.0 的 additive contract change。

## EN

- Date: 2026-04-17
- Phase: Phase 2
- Status: In Progress
- Scope: start Phase 2 from `docs/10-architecture/full-board-ui-roadmap.md` by formalizing the board-selection-model ADR gate, the `UiViewModel` 2.0 contract-prep inventory, and the governance order for the later contract / phase-transition work.
- Kickoff results:
    - Phase 2 now explicitly starts with an ADR gate rather than immediate schema or engine edits.
    - `../phase-2-interaction-and-uiviewmodel-plan.md` now defines the A/B interaction-model options, the recommended path, evaluation dimensions, migration order, and write scopes.
    - `../../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md` now lists the `UiViewModel` 2.0 candidate fields, affected payloads, consumers, and required migration artifacts.
    - `apps/web/app/rooms/[roomId]/room-live-client.tsx` was rechecked and still performs page-local `room.status` / viewer derivation, which Phase 2 must eliminate once the contract lands.
- Remaining work:
    - the ADR is not written yet and no final A/B choice has been made;
    - `packages/contracts`, `packages/core-engine`, and `packages/application` still have no runtime-surface changes;
    - migration notes, fixtures, contract regeneration, and property tests remain part of the later contract PR.
- Next step:
    - write the board-selection-model ADR first;
    - then start the additive `UiViewModel` 2.0 contract change using the contract-prep checklist.
