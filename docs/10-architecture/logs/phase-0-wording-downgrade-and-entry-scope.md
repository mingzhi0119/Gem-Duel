# Phase 0 Log - Wording Downgrade, Release Scope, and Entry-Surface Clarification

## ZH

- 日期：2026-04-17
- Phase：Phase 0
- 状态：已完成
- 范围：落实 `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 0，完成工程收口 vs 产品完成的口径降级、step-log 验收证据规则、以及首页默认入口的验证壳文案收口。
- 完成结果：
    - 已在 tracker、release-prep、Step 06/08 log 与 architecture docs 中明确 `Step 00-08 = engineering closure`，并把产品完成与 Desktop offline 分发移交给 full-board roadmap 后续 phases。
    - 已在 `docs/00-refactor/logs/README.md` 写入 acceptance evidence 规则。
    - 已将 `apps/web/app/page.tsx` 的 hero / CTA / metadata 文案降级为 deterministic validation shell 口径，并补上 full-board roadmap 入口链接。
    - 已建立 `docs/10-architecture/logs/` 作为 roadmap phase log 目录，并将 Phase 0 状态回写到 roadmap。
- 涉及文件：
    - `apps/web/app/page.tsx`
    - `docs/10-architecture/full-board-ui-roadmap.md`
    - `docs/10-architecture/logs/README.md`
    - `docs/10-architecture/logs/phase-0-wording-downgrade-and-entry-scope.md`
    - 以及此前已完成的 tracker / release / step-log / architecture wording 文档
- 剩余风险 / 后续：
    - Phase 0 只做口径纠偏，不解决完整盘面 UI、玩家路径验收、spectator visibility gate 或 Desktop offline packaging。
    - 首页仍保留 validation metadata 面板；更彻底的玩家入口收口继续由 Phase 4 处理。
- 验证：
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`

## EN

- Date: 2026-04-17
- Phase: Phase 0
- Status: Completed
- Scope: land Phase 0 from `docs/10-architecture/full-board-ui-roadmap.md` by downgrading wording around engineering closure vs product completion, formalizing the step-log evidence rule, and narrowing the homepage validation-shell messaging.
- Landed results:
    - The tracker, release-prep doc, Step 06/08 logs, and architecture docs now state clearly that `Step 00-08 = engineering closure`, while product completion and Desktop offline distribution are deferred into later full-board phases.
    - `docs/00-refactor/logs/README.md` now carries the acceptance-evidence rule.
    - `apps/web/app/page.tsx` now uses deterministic-validation-shell wording for the hero, CTA labels, and metadata panel, and includes a direct link to the full-board roadmap.
    - `docs/10-architecture/logs/` now exists as the roadmap-phase log location, and the roadmap itself has been updated with the Phase 0 completion marker.
- Touched files:
    - `apps/web/app/page.tsx`
    - `docs/10-architecture/full-board-ui-roadmap.md`
    - `docs/10-architecture/logs/README.md`
    - `docs/10-architecture/logs/phase-0-wording-downgrade-and-entry-scope.md`
    - plus the tracker / release / step-log / architecture wording docs landed earlier in the same audit follow-up
- Remaining risks / next work:
    - Phase 0 fixes wording only; it does not solve the full-board UI, player-path acceptance, spectator-visibility gates, or Desktop offline packaging.
    - The homepage still keeps a validation-metadata panel; stricter player-entry cleanup continues in Phase 4.
- Validation:
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
