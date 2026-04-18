# Phase 1a Log - Application Emergency Split Completion

## ZH

- 日期：2026-04-18
- Phase：Phase 1a
- 状态：Completed / Blocking gate closed
- 范围：记录 `packages/application` emergency split 的已落地形态，并把 Phase 1 的 blocking cleanup gate 正式收口。
- 本次完成结果：
    - `packages/application/src/index.ts` 已退化为 barrel / export surface。
    - `packages/application/src/` 已按职责拆分为：
        - `shared/types.ts`
        - `replay/inspector.ts`
        - `ai/heuristic.ts`
        - `view-model/{metadata,actions,board,market,player-zones,prompts,selection,run-panel,index}.ts`
        - `sessions/{match,run}.ts`
    - `packages/application` 的测试与职责目录保持同向归属，当前树中可见的测试包括 `view-model/view-model.test.ts`、`replay/inspector.test.ts`、`ai/heuristic.test.ts` 与 `sessions/run.test.ts`。
    - 本次 Gate 1 只做结构清理，没有引入 contract、runtime、replay 或行为变化。
- 验证：
    - `pnpm --filter @gem-duel/application typecheck`
    - `pnpm --filter @gem-duel/application test`
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm check-contracts`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
    - `git diff --check -- packages/application`
- 剩余说明：
    - 后续 Phase 4 / 更高层次的 board UI 工作可以继续推进，但不应再把新的 projection/helper 逻辑塞回 `packages/application/src/index.ts`。
    - `Phase 1a` 作为 blocking gate 已关闭；后续若需要新增 projection 逻辑，应落到新模块而不是重新膨胀入口文件。

## EN

- Date: 2026-04-18
- Phase: Phase 1a
- Status: Completed / Blocking gate closed
- Scope: record the landed `packages/application` emergency split and formally close the Phase 1 blocking cleanup gate.
- Landed results:
    - `packages/application/src/index.ts` has been reduced to a barrel / export surface.
    - `packages/application/src/` is now split by responsibility into:
        - `shared/types.ts`
        - `replay/inspector.ts`
        - `ai/heuristic.ts`
        - `view-model/{metadata,actions,board,market,player-zones,prompts,selection,run-panel,index}.ts`
        - `sessions/{match,run}.ts`
    - The repository now shows tests moving with the split where present, including `view-model/view-model.test.ts`, `replay/inspector.test.ts`, `ai/heuristic.test.ts`, and `sessions/run.test.ts`.
    - This Gate 1 work was structural only; it did not introduce contract, runtime, replay, or gameplay behavior changes.
- Validation:
    - `pnpm --filter @gem-duel/application typecheck`
    - `pnpm --filter @gem-duel/application test`
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm check-contracts`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
    - `git diff --check -- packages/application`
- Remaining note:
    - Later Phase 4 / board-UI work may continue, but new projection/helper logic should not be pushed back into `packages/application/src/index.ts`.
    - Phase 1a is now a closed blocking gate; follow-on projection work should stay in new modules instead of re-growing the entry file.
