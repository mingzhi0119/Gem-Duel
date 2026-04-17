# Architecture Phase Logs

## ZH

本目录记录 `docs/10-architecture/full-board-ui-roadmap.md` 各 Phase 的落地日志。

- 每次完成一个 roadmap phase，必须补对应日志，并把 roadmap 状态同步改为 `Completed` 或等价完成标记。
- 日志应记录：日期、范围、落地结果、涉及文件、剩余风险与验证结果。
- 若 phase 只完成部分输出，必须明确列出未完成项，不得提前标记为完成。

### 当前日志

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 口径降级、发布边界与首页验证壳文案收口
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 启动日志，确认 `application/ui` 结构清理的目标边界与未完成项
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 启动日志，确认 ADR 前置门、`UiViewModel` 2.0 contract prep 与后续迁移顺序
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 第一轮 ADR + `UiViewModel` 2.0 contract/projection 落地日志
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 第二轮落地日志，记录引擎拥有的 pending-selection command/snapshot/projection surface
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 启动日志，确认 `packages/ui` layout、tokens 与 visual harness 的治理入口
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 第一轮落地日志，记录 `packages/ui` 目录拆分、shared-style ownership 与 `/playground` 基线
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 完成日志，记录多 scene playground、`pnpm check-visual` 与 committed screenshot baselines

## EN

This directory stores landing logs for phases tracked in `docs/10-architecture/full-board-ui-roadmap.md`.

- Whenever a roadmap phase is completed, the matching log must be written and the roadmap status must be updated to `Completed` or an equivalent completion marker.
- Logs should record the date, scope, landed results, touched files, remaining risks, and validation outcomes.
- If a phase lands only partially, the unfinished outputs must be listed explicitly and the phase must not be marked complete yet.

### Current Logs

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 wording downgrade, release-scope clarification, and homepage validation-shell wording closure
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 kickoff log for the pending `application/ui` structure cleanup and its remaining work
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 kickoff log for the ADR gate, `UiViewModel` 2.0 contract prep, and the later migration order
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 log for the first ADR + `UiViewModel` 2.0 contract/projection landing wave
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 second landing wave for the engine-owned pending-selection command/snapshot/projection surface
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 kickoff log for `packages/ui` layout, tokens, and the visual harness
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 first landing wave for the `packages/ui` layout split, shared-style ownership, and `/playground` baseline
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 completion log for the multi-scene playground, `pnpm check-visual`, and committed screenshot baselines
