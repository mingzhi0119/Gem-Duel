# Phase 1 Log - Application/UI Structure Cleanup Kickoff

## ZH

- 日期：2026-04-17
- Phase：Phase 1
- 状态：进行中
- 范围：启动 `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 1，明确 `packages/application` 与 `packages/ui` 的结构清理目标、边界与未完成项，为后续无语义拆分做治理准备。
- 本次启动结果：
    - 已确认 Phase 1 仍属于 non-contract、non-behavioral cleanup，不得顺带修改 gameplay semantics、room authority 或 UI contract。
    - 已把 worktree hygiene 通过 `pnpm check-commit` 与 pre-push gate 机械化，降低后续文件搬移和 barrel 重组时把漂移产物带入提交边界的风险。
    - 已将 Phase 1 在 roadmap 中标记为 `In Progress`，并为后续结构清理建立 phase log 入口。
    - 已补 `../phase-1-application-ui-structure-plan.md`，明确目标目录、write-scope、迁移顺序与非目标，避免 Phase 1 在执行时滑向 Phase 2 / 2.5 的契约或视觉工作。
- 本 phase 预期目标：
    - `packages/application/src/index.ts` 按 sessions / view-model / ai / replay 等职责拆分；
    - `packages/ui` 建立基础目录与 barrel，而不是继续单文件堆叠；
    - 全程保持 contract surface 不变。
- 当前未完成项：
    - 尚未开始实际文件拆分；
    - 尚未验证拆分后对 `check-deps` / `check-boundaries` / `test` / `build` 的影响。
- 下一步：
    - 按 `phase-1-application-ui-structure-plan.md` 的迁移顺序进入实际 `application/ui` 结构调整；
    - 每一批拆分后都保持根导出 surface 稳定并复跑 Phase 1 验证门。

## EN

- Date: 2026-04-17
- Phase: Phase 1
- Status: In Progress
- Scope: start Phase 1 from `docs/10-architecture/full-board-ui-roadmap.md` by defining the structure-cleanup boundaries, intent, and remaining work for `packages/application` and `packages/ui`, ahead of the actual no-semantics split.
- Kickoff results:
    - Phase 1 has been reconfirmed as a non-contract, non-behavioral cleanup and may not smuggle in gameplay, authority, or UI-contract changes.
    - Worktree hygiene is now mechanically guarded by `pnpm check-commit` plus a pre-push gate, reducing the risk of drift artifacts polluting the later file-move and barrel-restructure commits.
    - The roadmap now marks Phase 1 as `In Progress`, and this phase-log entry establishes the log location for the structure-cleanup wave.
    - `../phase-1-application-ui-structure-plan.md` now captures the target layout, write scopes, migration order, and non-goals so Phase 1 execution does not slide into Phase 2 / 2.5 work.
- Expected phase targets:
    - split `packages/application/src/index.ts` by responsibilities such as sessions / view-model / ai / replay;
    - give `packages/ui` a baseline directory layout and barrel structure instead of continued single-file growth;
    - keep the contract surface unchanged throughout the phase.
- Remaining work:
    - no actual file split has landed yet;
    - the post-split impact on `check-deps` / `check-boundaries` / `test` / `build` has not been validated yet.
- Next step:
    - begin the actual `application/ui` structure cleanup according to `phase-1-application-ui-structure-plan.md`;
    - keep the root export surface stable and rerun the Phase 1 validation gate after each cleanup wave.
