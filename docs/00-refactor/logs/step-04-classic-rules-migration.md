# Step 04 Log - Classic Rules Migration

## ZH

- 日期：2026-04-17
- 作者：Codex
- Step ID：Step 04
- 本步目标：在 Step 03 已封口的 actor/state-machine 骨架上，迁入 Splendor Duel 经典规则，包括 board、pyramid、reserve、royal、privilege、cleanup、victory 与 classic golden replay。
- 实施顺序：
    - 先补 tracker、Step log 与 `docs/99-legacy` 抽取笔记入口；
    - 再扩展 `packages/domain` / `packages/contracts` 的 classic state、command、event、snapshot surface；
    - 然后迁移 `packages/core-engine` 经典 setup、turn structure、effect handoff 与 replay regression；
    - 最后更新 `packages/application` 的最小接线并执行全量校验。
- 当前状态：已完成。
- 关键前置：
    - Step 03 已先以独立提交 `7bd70c6` 封口，避免与 Step 04 混入同一提交边界。
    - `docs/99-legacy/` 已补齐 classic rule intent 的 6 份双语抽取笔记，只作 clean-room 参考，不引入 legacy import。
- 风险/边界：
    - Step 04 只迁入 classic rules；Buff / Roguelike 仍留在 Step 07。
    - Royal handoff 继续经由 `activeEffects`，不回退到公开 `royalResolution` phase。
- 落地结果：
    - `packages/domain` / `packages/contracts` 已扩展为 classic board、pyramid、royal supply、privilege supply、reserve slots、turn metadata 与 `victoryReason` 的公开 surface，并移除 skeleton-only command。
    - `packages/core-engine` 已迁入 deterministic classic setup、source-aware command guards、token take / reserve / buy / privilege / cleanup / automatic victory rules，以及通过 `activeEffects` 暴露的 royal 与 chained abilities。
    - `packages/application` 与 `apps/web` 的最小接线已改为消费新的 visible snapshot 与 classic action builder，不再依赖 Step 03 占位命令。
    - `packages/core-engine/__replays__/golden/` 已新增 6 份 Step 04 classic golden replay，覆盖 take-three-discard、replenish-privilege-shift、reserve-face-up、reserve-blind、buy-chained-ability 与 royal-milestone-selection。
    - `docs/99-legacy/` 已补齐 6 份双语 clean-room 抽取笔记，仅保留规则意图，不引入 legacy import。
- 验收：
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm check-contracts`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
- 对应 Commit：Step 03 已保持独立提交 `7bd70c6`；Step 04 代码边界与日志已完成同步，未回混 Step 03 边界。

## EN

- Date: 2026-04-17
- Author: Codex
- Step ID: Step 04
- Goal: migrate the classic Splendor Duel rules onto the Step 03 actor/state-machine skeleton, including board, pyramid, reserve, royal, privilege, cleanup, victory handling, and classic golden replay coverage.
- Execution order:
    - first land the tracker, Step log, and `docs/99-legacy` extraction-note index updates;
    - then expand the `packages/domain` / `packages/contracts` classic state, command, event, and snapshot surface;
    - then migrate `packages/core-engine` setup, turn structure, effect handoff, and replay regression;
    - finally update the minimal `packages/application` wiring and run full validation.
- Current status: complete.
- Key preconditions:
    - Step 03 was sealed first as its own commit `7bd70c6` so Step 04 does not mix boundaries.
    - `docs/99-legacy/` now contains the six bilingual classic-rule extraction notes as clean-room reference only, with no legacy imports.
- Risks / boundaries:
    - Step 04 covers classic rules only; Buff / Roguelike migration remains in Step 07.
    - Royal handoff continues through `activeEffects` and does not reintroduce a public `royalResolution` phase.
- Landed results:
    - `packages/domain` / `packages/contracts` now expose the classic board, pyramid, royal supply, privilege supply, reserve slots, turn metadata, and `victoryReason` surface, while removing the remaining skeleton-only commands.
    - `packages/core-engine` now owns deterministic classic setup, source-aware command guards, token take / reserve / buy / privilege / cleanup / automatic victory rules, and the royal + chained-ability handoff through `activeEffects`.
    - `packages/application` and the minimal `apps/web` wiring now consume the new visible snapshot surface and classic action builder instead of the Step 03 placeholder command flow.
    - `packages/core-engine/__replays__/golden/` now includes 6 Step 04 classic golden replays covering take-three-discard, replenish-privilege-shift, reserve-face-up, reserve-blind, buy-chained-ability, and royal-milestone-selection.
    - `docs/99-legacy/` now contains the 6 bilingual clean-room extraction notes for classic rule intent, with no legacy imports.
- Validation:
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm check-contracts`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
- Commit reference: Step 03 remains sealed as its own commit `7bd70c6`; the Step 04 code boundary and logs are now synchronized without mixing the Step 03 boundary back in.
