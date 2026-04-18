# Architecture

## ZH

- 以 monorepo 为唯一组织方式，不再把应用、规则和桌面壳混放在单一 `src/`。
- Web、Desktop、Room Service 都通过 `application` 与 `contracts` 使用核心引擎。
- 任何新包都必须说明依赖方向和可见边界。
- 工程执行规范、legacy 归档规则与 Git 策略请参考 [`engineering-standards.md`](./engineering-standards.md)。
- Agent 边界、分层 `AGENTS.md` 与机械化护栏矩阵请参考 [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md)。
- Step 06 的 Web/Desktop 共享 application/ui 组合边界请参考 [`web-desktop-application-integration.md`](./web-desktop-application-integration.md)。
- 从当前最小验证壳演进到完整游戏盘面 UI 的审计结论、发现归属与按 Phase 排序整改路线图请参考 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)；该文现已同步重排 Phase 1/2/3 状态，并引入 `Phase 1a` 前置门。
- Phase 0-3 独立审计的 repo-verified disposition、状态重排依据与治理 backlog 请参考 [`full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md)。
- Phase 1 的 `application/ui` 结构清理目标目录、write-scope 与迁移顺序请参考 [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md)。
- Phase 2 的交互范式决策门、`UiViewModel` 2.0 迁移顺序与 write-scope 请参考 [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md)。
- Phase 2.5 的 `packages/ui` layout、design tokens 与 visual harness 顺序请参考 [`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)。
- Phase 4 的 classic-local 玩家路径冻结矩阵、8 条路径自动化状态与 `check-phase4` 入口请参考 [`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md)。
- full-board roadmap 的 phase 落地日志请参考 [`logs/README.md`](./logs/README.md)，其中已包含 Phase 1 delayed addendum、Phase 2 closure、Phase 3 evidence caveat、Phase 4 completion evidence、Phase 5 parity closure、Phase 6 room-board convergence closure 与 Phase 7 replay/product-finish closure。

## EN

- The monorepo is now the only supported code organization model.
- Web, Desktop, and Room Service all consume the core engine through `application` and `contracts`.
- Every new package must document its dependency direction and visibility boundary.
- See [`engineering-standards.md`](./engineering-standards.md) for execution rules, legacy archive policy, and Git workflow constraints.
- See [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md) for agent boundaries, layered `AGENTS.md`, and the mechanical guardrail matrix.
- See [`web-desktop-application-integration.md`](./web-desktop-application-integration.md) for the Step 06 shared Web/Desktop composition boundary through `application` and `ui`.
- See [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) for the audit-driven, phase-sorted remediation path from the current validation shell to a full playable board UI; it now rephases Phase 1/2/3 and introduces the `Phase 1a` blocking gate.
- See [`full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md) for the repo-verified disposition, status-rephase basis, and governance backlog from the independent Phase 0-3 audit.
- See [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md) for the target layout, write scopes, and migration order that govern the Phase 1 `application/ui` cleanup.
- See [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md) for the interaction-model decision gate, migration order, and write scopes that govern the Phase 2 contract expansion.
- See [`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md) for the layout, token, and visual-harness plan that governs Phase 2.5.
- See [`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md) for the frozen Phase 4 classic-local player-path triads, the 8 automated rows, and the `check-phase4` evidence surface.
- See [`logs/README.md`](./logs/README.md) for landing logs attached to roadmap phases, including the Phase 1 delayed addendum, Phase 2 closure, the Phase 3 evidence caveat, the Phase 4 completion evidence, the Phase 5 parity closure, the Phase 6 room-board convergence closure, and the Phase 7 replay/product-finish closure.
