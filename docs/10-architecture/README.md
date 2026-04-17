# Architecture

## ZH

- 以 monorepo 为唯一组织方式，不再把应用、规则和桌面壳混放在单一 `src/`。
- Web、Desktop、Room Service 都通过 `application` 与 `contracts` 使用核心引擎。
- 任何新包都必须说明依赖方向和可见边界。
- 工程执行规范、legacy 归档规则与 Git 策略请参考 [`engineering-standards.md`](./engineering-standards.md)。
- Agent 边界、分层 `AGENTS.md` 与机械化护栏矩阵请参考 [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md)。
- Step 06 的 Web/Desktop 共享 application/ui 组合边界请参考 [`web-desktop-application-integration.md`](./web-desktop-application-integration.md)。
- 从当前最小验证壳演进到完整游戏盘面 UI 的审计结论、发现归属与按 Phase 排序整改路线图请参考 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)。
- Phase 1 的 `application/ui` 结构清理目标目录、write-scope 与迁移顺序请参考 [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md)。
- Phase 2 的交互范式决策门、`UiViewModel` 2.0 迁移顺序与 write-scope 请参考 [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md)。
- Phase 2.5 的 `packages/ui` layout、design tokens 与 visual harness 顺序请参考 [`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)。
- full-board roadmap 的 phase 落地日志请参考 [`logs/README.md`](./logs/README.md)。

## EN

- The monorepo is now the only supported code organization model.
- Web, Desktop, and Room Service all consume the core engine through `application` and `contracts`.
- Every new package must document its dependency direction and visibility boundary.
- See [`engineering-standards.md`](./engineering-standards.md) for execution rules, legacy archive policy, and Git workflow constraints.
- See [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md) for agent boundaries, layered `AGENTS.md`, and the mechanical guardrail matrix.
- See [`web-desktop-application-integration.md`](./web-desktop-application-integration.md) for the Step 06 shared Web/Desktop composition boundary through `application` and `ui`.
- See [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) for the audit-driven, phase-sorted remediation path from the current validation shell to a full playable board UI.
- See [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md) for the target layout, write scopes, and migration order that govern the Phase 1 `application/ui` cleanup.
- See [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md) for the interaction-model decision gate, migration order, and write scopes that govern the Phase 2 contract expansion.
- See [`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md) for the layout, token, and visual-harness plan that governs Phase 2.5.
- See [`logs/README.md`](./logs/README.md) for landing logs attached to roadmap phases.
