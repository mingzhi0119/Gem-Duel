# Architecture Phase Logs

## ZH

本目录记录 `docs/10-architecture/full-board-ui-roadmap.md` 各 Phase 的落地日志。

- 每次完成一个 roadmap phase，必须补对应日志，并把 roadmap 状态同步改为 `Completed` 或等价完成标记。
- 日志应记录：日期、范围、落地结果、涉及文件、剩余风险与验证结果。
- 若 phase 只完成部分输出，必须明确列出未完成项，不得提前标记为完成。

### 当前日志

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 口径降级、发布边界与首页验证壳文案收口
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 启动日志，现含独立审计后的 delayed/at-risk addendum、历史 god file 风险与临时增量规则
- [`phase-1a-application-emergency-split-completion.md`](./phase-1a-application-emergency-split-completion.md): Phase 1a 完成日志，记录 application emergency split 关闭与 barrel 化结果
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 启动日志，确认 ADR 前置门、`UiViewModel` 2.0 contract prep 与后续迁移顺序
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 第一轮 ADR + `UiViewModel` 2.0 contract/projection 落地日志
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 第二轮落地日志，记录引擎拥有的 pending-selection command/snapshot/projection surface
- [`phase-2-contract-runtime-closure.md`](./phase-2-contract-runtime-closure.md): Phase 2 关闭日志，确认 `UiViewModel v2`、`pendingSelection`、`roomStatus` additive contract 已关闭为 contract/runtime 基线，并把 shared BoardScene consumer migration 移交给 Phase 6
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 启动日志，确认 `packages/ui` layout、tokens 与 visual harness 的治理入口
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 第一轮落地日志，记录 `packages/ui` 目录拆分、shared-style ownership 与 `/playground` 基线
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 完成日志，记录多 scene playground、`pnpm check-visual` 与 committed screenshot baselines
- [`phase-3-shared-board-primitives-wave-1.md`](./phase-3-shared-board-primitives-wave-1.md): Phase 3 第一波日志，记录 shared board primitives 的落地结果、剩余缺口与 visual baseline 更新
- [`phase-3-shared-board-primitives-completion.md`](./phase-3-shared-board-primitives-completion.md): Phase 3 完成日志，现含 rebaseline vs final regression 的分离验证记录与 `*-win32.png` evidence caveat
- [`phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./phase-4-preflight-acceptance-matrix-and-scenario-harness.md): Phase 4 Gate 2 preflight 日志，记录 acceptance matrix、`/play/local?scenario=` 启动面与 `pnpm check-phase4`

## EN

This directory stores landing logs for phases tracked in `docs/10-architecture/full-board-ui-roadmap.md`.

- Whenever a roadmap phase is completed, the matching log must be written and the roadmap status must be updated to `Completed` or an equivalent completion marker.
- Logs should record the date, scope, landed results, touched files, remaining risks, and validation outcomes.
- If a phase lands only partially, the unfinished outputs must be listed explicitly and the phase must not be marked complete yet.

### Current Logs

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 wording downgrade, release-scope clarification, and homepage validation-shell wording closure
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 kickoff log, now including the independent-audit delayed/at-risk addendum, the historical god-file risk, and the temporary incremental rule
- [`phase-1a-application-emergency-split-completion.md`](./phase-1a-application-emergency-split-completion.md): Phase 1a completion log, recording the application emergency split closeout and barrelization result
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 kickoff log for the ADR gate, `UiViewModel` 2.0 contract prep, and the later migration order
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 log for the first ADR + `UiViewModel` 2.0 contract/projection landing wave
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 second landing wave for the engine-owned pending-selection command/snapshot/projection surface
- [`phase-2-contract-runtime-closure.md`](./phase-2-contract-runtime-closure.md): Phase 2 closure log for the `UiViewModel v2`, `pendingSelection`, and `roomStatus` additive contract freeze point, with shared `BoardScene` consumer migration deferred to Phase 6
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 kickoff log for `packages/ui` layout, tokens, and the visual harness
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 first landing wave for the `packages/ui` layout split, shared-style ownership, and `/playground` baseline
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 completion log for the multi-scene playground, `pnpm check-visual`, and committed screenshot baselines
- [`phase-3-shared-board-primitives-wave-1.md`](./phase-3-shared-board-primitives-wave-1.md): Phase 3 first-wave log for the landed shared board primitives, the remaining gaps, and the refreshed visual baseline
- [`phase-3-shared-board-primitives-completion.md`](./phase-3-shared-board-primitives-completion.md): Phase 3 completion log, now with split rebaseline/final-regression evidence and the `*-win32.png` platform caveat
- [`phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./phase-4-preflight-acceptance-matrix-and-scenario-harness.md): Phase 4 Gate 2 preflight log for the acceptance matrix, the `/play/local?scenario=` bootstrap surface, and `pnpm check-phase4`
