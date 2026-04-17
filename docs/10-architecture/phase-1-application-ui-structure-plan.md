# Phase 1 Application/UI Structure Plan

## ZH

### 文档定位

本文是 `docs/10-architecture/full-board-ui-roadmap.md` Phase 1 的治理落地件，定义 `packages/application` 与 `packages/ui` 的目标目录、write-scope、迁移顺序与非目标，用于约束后续“只做结构清理、不改契约与行为”的拆分工作。

### 现状压力点

- `packages/application/src/index.ts` 当前同时承载：
    - session surface 与 exported types；
    - effect-prompt 读取与 `availableActions` 枚举；
    - replay inspector model；
    - AI heuristic；
    - `UiViewModel` projection；
    - local / AI / run session factories。
- `packages/ui/src/index.tsx` 当前同时承载：
    - `Section` 等基础布局；
    - `SnapshotSummary` 与 `ActionList`；
    - `MatchView` 与 `RoomTable`。
- `apps/web/app/globals.css` 中的 `gd-*` 样式仍是当前 shared shell 的真实样式来源，但该样式迁移属于 Phase 2.5 的 design tokens / visual harness 范围，不在本 phase 内。

### Phase 1 不变边界

- 不修改 `packages/contracts`、`packages/domain`、`packages/core-engine` 的对外 surface。
- 不修改 `UiViewModelSchema`、room-service message shape、replay bundle shape 或任何 hash 语义。
- 不顺带引入 full-board primitives、design tokens、Storybook/Ladle、screenshot baseline；这些属于 Phase 2.5 / Phase 3。
- 不顺带修正 desktop offline packaging；该问题留给 Phase 8。
- 页面或壳层只允许做 import/barrel 路径对齐，不得借 Phase 1 在 `apps/web` / `apps/desktop` 中补规则推导。

### `packages/application` 目标布局

Phase 1 完成后，`packages/application` 应收敛到“barrel + 分职责目录”，而不是继续把所有逻辑堆在单个入口文件中。

目标布局：

```text
packages/application/src/
  index.ts
  shared/
    types.ts
  replay/
    inspector.ts
  ai/
    heuristic.ts
  view-model/
    prompts.ts
    actions.ts
    summary.ts
    index.ts
  sessions/
    match.ts
    run.ts
```

建议职责归属：

- `shared/types.ts`
    - `ViewerId`
    - `MatchSession*` / `RunSession*` 接口与输入类型
    - `AiDecision*`、`ReplayInspector*` 类型
- `replay/inspector.ts`
    - `buildReplayInspectorModel`
    - `createReplayCommand`
- `ai/heuristic.ts`
    - `scoreAiAction`
- `view-model/prompts.ts`
    - `getRoyalPrompt`
    - `getBoardTokenPrompt`
    - `getOpponentTokenPrompt`
    - `getBonusColorPrompt`
- `view-model/actions.ts`
    - `getNonGoldBoardCells`
    - `getGoldBoardCell`
    - `getReserveSources`
    - `getBuySources`
    - `buildPositionSelections`
    - `getBuyCardLabel`
    - `getReserveCardLabel`
    - `buildActions`
- `view-model/summary.ts`
    - `buildVisibleSnapshot`
    - `buildUiTitle`
    - `buildUiSubtitle`
- `view-model/index.ts`
    - `buildVisibleUiViewModel`
    - `buildRoomUiViewModel`
    - `buildUiViewModel`
- `sessions/match.ts`
    - `createMatchSession`
    - `createLocalMatchSession`
    - `createAiMatchSession`
- `sessions/run.ts`
    - `buildRunMatchFlags`
    - `createRunSession`

### `packages/ui` 目标布局

Phase 1 的 `packages/ui` 目标是建立目录和 ownership，不是一次性做视觉系统迁移。

目标布局：

```text
packages/ui/src/
  index.tsx
  primitives/
    Section.tsx
  summary/
    SnapshotSummary.tsx
  actions/
    ActionList.tsx
  views/
    MatchView.tsx
    RoomTable.tsx
```

治理要求：

- `src/index.tsx` 在 Phase 1 结束后只作为 barrel / export surface，不再继续堆叠实现。
- 组件拆分只改变文件归属，不改变 props contract。
- `gd-*` CSS 继续暂存于 `apps/web/app/globals.css`，直到 Phase 2.5 再迁回 shared UI styles/tokens。

### 推荐迁移顺序

1. 先抽 `packages/application/src/shared/types.ts`，确保 public export surface 有稳定承接点。
2. 再抽 `replay/inspector.ts` 与 `ai/heuristic.ts`，优先削减与 session glue 弱耦合的中段逻辑。
3. 再抽 `view-model/{prompts,actions,summary,index}.ts`，把 projection 相关逻辑从 session factory 中分离。
4. 最后拆 `sessions/{match,run}.ts`，并让根 `index.ts` 退化为 barrel。
5. `packages/ui` 采取同样顺序：先 primitive/summary/action，再 views，最后让 `src/index.tsx` 只保留 re-export。
6. 消费侧只做 import path 对齐，不混入额外行为改动。

### Write Scope 约束

- 若拆分 `packages/application`，单个提交最好只覆盖一个职责目录，避免一次横跨 replay、ai、view-model、session 全部迁移。
- 若拆分 `packages/ui`，单个提交最好只覆盖一类组件归属，避免 JSX 文件移动与样式/语义修改混在一起。
- 若某一步需要同步更新测试导入路径，应视为该职责目录拆分的一部分，而不是额外 phase。
- 任一提交若触发 import 面变化，必须确保根导出 surface 在同一提交内保持兼容。

### Phase 1 非目标

- 不解决 F3 的多阶段交互范式问题。
- 不解决 F4 的 `UiViewModel` 2.0 schema 缺口。
- 不解决 F7 的 design tokens / visual harness / screenshot baseline。
- 不把 `/play/local` 切到 full-board renderer。
- 不把 Phase 1 错写成“产品完成”或“board UI 已落地”。

### 完成定义

- `packages/application/src/index.ts` 不再承载全部逻辑，只保留 barrel / export routing。
- `packages/ui/src/index.tsx` 不再承载完整实现，只保留 barrel / export routing。
- `check-deps`、`check-boundaries`、`test`、`build` 在结构清理后仍通过。
- 对外 contract surface、页面行为与 replay/hash 结果保持不变。

## EN

### Document Role

This document is the governance landing artifact for Phase 1 in `docs/10-architecture/full-board-ui-roadmap.md`. It defines the target layout, write scopes, migration order, and non-goals for the `packages/application` and `packages/ui` cleanup so the later split remains structural only, without smuggling in contract or behavior changes.

### Current Pressure Points

- `packages/application/src/index.ts` currently owns all of the following at once:
    - session surface and exported types;
    - effect-prompt readers plus `availableActions` enumeration;
    - replay inspector modeling;
    - AI heuristic logic;
    - `UiViewModel` projection;
    - local / AI / run session factories.
- `packages/ui/src/index.tsx` currently combines:
    - basic layout such as `Section`;
    - `SnapshotSummary` and `ActionList`;
    - `MatchView` and `RoomTable`.
- The `gd-*` styling in `apps/web/app/globals.css` remains the current shared-shell style source, but moving it is part of the Phase 2.5 design-token / visual-harness scope, not Phase 1.

### Phase 1 Invariants

- Do not modify the outward surface of `packages/contracts`, `packages/domain`, or `packages/core-engine`.
- Do not change `UiViewModelSchema`, room-service message shapes, replay bundle shapes, or any replay/hash semantics.
- Do not smuggle in full-board primitives, design tokens, Storybook/Ladle, or screenshot baselines; those belong to Phase 2.5 / Phase 3.
- Do not use this phase to solve desktop offline packaging; that remains Phase 8 work.
- Shell/page layers may only absorb import/barrel path changes; they may not add new rule inference in `apps/web` or `apps/desktop`.

### Target Layout for `packages/application`

By the end of Phase 1, `packages/application` should be a barrel plus responsibility-based folders rather than a single god file.

Target layout:

```text
packages/application/src/
  index.ts
  shared/
    types.ts
  replay/
    inspector.ts
  ai/
    heuristic.ts
  view-model/
    prompts.ts
    actions.ts
    summary.ts
    index.ts
  sessions/
    match.ts
    run.ts
```

Suggested ownership:

- `shared/types.ts`
    - `ViewerId`
    - `MatchSession*` / `RunSession*` interfaces and input types
    - `AiDecision*`, `ReplayInspector*` types
- `replay/inspector.ts`
    - `buildReplayInspectorModel`
    - `createReplayCommand`
- `ai/heuristic.ts`
    - `scoreAiAction`
- `view-model/prompts.ts`
    - `getRoyalPrompt`
    - `getBoardTokenPrompt`
    - `getOpponentTokenPrompt`
    - `getBonusColorPrompt`
- `view-model/actions.ts`
    - board/reserve/buy source readers
    - `buildPositionSelections`
    - buy/reserve labels
    - `buildActions`
- `view-model/summary.ts`
    - `buildVisibleSnapshot`
    - `buildUiTitle`
    - `buildUiSubtitle`
- `view-model/index.ts`
    - `buildVisibleUiViewModel`
    - `buildRoomUiViewModel`
    - `buildUiViewModel`
- `sessions/match.ts`
    - `createMatchSession`
    - `createLocalMatchSession`
    - `createAiMatchSession`
- `sessions/run.ts`
    - `buildRunMatchFlags`
    - `createRunSession`

### Target Layout for `packages/ui`

The Phase 1 goal for `packages/ui` is ownership and directory shape, not a one-shot visual-system migration.

Target layout:

```text
packages/ui/src/
  index.tsx
  primitives/
    Section.tsx
  summary/
    SnapshotSummary.tsx
  actions/
    ActionList.tsx
  views/
    MatchView.tsx
    RoomTable.tsx
```

Governance rules:

- By the end of Phase 1, `src/index.tsx` should be barrel/export surface only instead of containing the whole implementation.
- Component splits may change file ownership only; they may not change props contracts.
- `gd-*` CSS remains in `apps/web/app/globals.css` until Phase 2.5 migrates style ownership back into shared UI styles/tokens.

### Recommended Migration Order

1. Extract `packages/application/src/shared/types.ts` first so the public export surface has a stable anchor.
2. Extract `replay/inspector.ts` and `ai/heuristic.ts` next, because they reduce mid-file density without touching the contract surface.
3. Extract `view-model/{prompts,actions,summary,index}.ts` next so projection logic stops living beside session factories.
4. Split `sessions/{match,run}.ts` last and let root `index.ts` collapse into a barrel.
5. Apply the same sequence to `packages/ui`: primitive/summary/action first, then views, then make `src/index.tsx` a re-export surface only.
6. Consumers should absorb import-path alignment only, not unrelated behavior changes.

### Write-Scope Constraints

- When splitting `packages/application`, keep each commit scoped to one responsibility area when possible instead of migrating replay, ai, view-model, and sessions all at once.
- When splitting `packages/ui`, keep each commit scoped to one component category instead of mixing JSX file moves with styling or behavior changes.
- If tests need import-path updates, treat them as part of the same responsibility split instead of opening a separate phase.
- Any commit that moves exports must keep the root export surface compatible within that same commit.

### Phase 1 Non-Goals

- Do not solve the F3 multi-step interaction-model decision here.
- Do not solve the F4 `UiViewModel` 2.0 schema gap here.
- Do not solve the F7 design-token / visual-harness / screenshot-baseline work here.
- Do not switch `/play/local` to a full-board renderer here.
- Do not rewrite Phase 1 as product completion or board-UI completion.

### Definition of Done

- `packages/application/src/index.ts` no longer contains the full implementation and becomes a barrel/export router.
- `packages/ui/src/index.tsx` no longer contains the full implementation and becomes a barrel/export router.
- `check-deps`, `check-boundaries`, `test`, and `build` still pass after the cleanup.
- Outward contract surface, page behavior, and replay/hash results stay unchanged.
