# Gem Duel Docs

## ZH

本目录是 Gem Duel 全量重构后的唯一架构真相来源。所有目录规则、契约定义、运维策略、ADR 决策，以及 surviving legacy extracts / git-history pointers 都应在此维护。

### 文档索引

- [`00-refactor/full-rebuild-plan.md`](./00-refactor/full-rebuild-plan.md): 全量重构总方案
- [`00-refactor/rebuild-execution-tracker.md`](./00-refactor/rebuild-execution-tracker.md): 分步执行总表与状态追踪
- [`00-refactor/logs/README.md`](./00-refactor/logs/README.md): 分步日志规范与入口
- [`10-architecture/README.md`](./10-architecture/README.md): 分层与目录标准
- [`10-architecture/engineering-standards.md`](./10-architecture/engineering-standards.md): 工程规范与 Git 策略
- [`10-architecture/agent-guardrails-matrix.md`](./10-architecture/agent-guardrails-matrix.md): Agent 边界、机械化护栏与分层 AGENTS 设计
- [`10-architecture/logs/README.md`](./10-architecture/logs/README.md): full-board roadmap 各 Phase 的落地日志入口，现含 Phase 1 delayed addendum、Phase 2 closure、Phase 3 evidence caveat、Phase 4 completion evidence、Phase 5 parity closure 与 Phase 6 room-board convergence closure 索引
- [`10-architecture/web-desktop-application-integration.md`](./10-architecture/web-desktop-application-integration.md): Step 06 Web/Desktop 通过 application/ui 共享视图模型与交互边界
- [`10-architecture/full-board-ui-roadmap.md`](./10-architecture/full-board-ui-roadmap.md): Opus 4.7 审计后的 full-board UI 发现清单、整改归属与按 Phase 排序路线图，现已同步重排 Phase 1/2/3 状态与 Phase 1a 前置门
- [`10-architecture/full-board-ui-roadmap-phase-0-3-independent-audit.md`](./10-architecture/full-board-ui-roadmap-phase-0-3-independent-audit.md): Phase 0-3 独立审计的 repo-verified disposition、状态重排依据与治理 backlog
- [`10-architecture/phase-1-application-ui-structure-plan.md`](./10-architecture/phase-1-application-ui-structure-plan.md): Phase 1 的 `application/ui` 结构清理目标目录、write-scope、迁移顺序与非目标
- [`10-architecture/phase-2-interaction-and-uiviewmodel-plan.md`](./10-architecture/phase-2-interaction-and-uiviewmodel-plan.md): Phase 2 的交互范式决策门、迁移顺序、write-scope 与非目标
- [`10-architecture/phase-2.5-ui-layout-and-visual-harness-plan.md`](./10-architecture/phase-2.5-ui-layout-and-visual-harness-plan.md): Phase 2.5 的 `packages/ui` 布局、design tokens 与 visual harness 治理主文档
- [`10-architecture/phase-4-player-path-acceptance-matrix.md`](./10-architecture/phase-4-player-path-acceptance-matrix.md): Phase 4 classic-local 玩家路径冻结矩阵、8 条路径自动化状态与 `check-phase4` evidence 入口
- [`20-domain/README.md`](./20-domain/README.md): 领域模型、状态机与规则版本
- [`20-domain/determinism-and-replay-discipline.md`](./20-domain/determinism-and-replay-discipline.md): 确定性、回放与性质测试纪律
- [`20-domain/buff-hook-system.md`](./20-domain/buff-hook-system.md): Buff/Roguelike hook 原语、顺序与组合规则
- [`20-domain/splendor-duel-official-rulebook.md`](./20-domain/splendor-duel-official-rulebook.md): 官方规则书摘要与领域建模结论
- [`30-contracts/README.md`](./30-contracts/README.md): HTTP、WebSocket、Replay 契约
- [`30-contracts/contract-hardening-spec.md`](./30-contracts/contract-hardening-spec.md): 契约硬化、schema 真相源与生成策略
- [`30-contracts/step-03-phase-replay-migration-note.md`](./30-contracts/step-03-phase-replay-migration-note.md): Step 03 phase surface 与 replay/hash ownership 迁移说明
- [`30-contracts/step-04-classic-rules-migration-note.md`](./30-contracts/step-04-classic-rules-migration-note.md): Step 04 classic command/snapshot/victory 迁移说明
- [`30-contracts/step-05-room-service-authority-migration-note.md`](./30-contracts/step-05-room-service-authority-migration-note.md): Step 05 room-service authority、server-bound seat 与 room error 迁移说明
- [`30-contracts/step-06-shell-ui-migration-note.md`](./30-contracts/step-06-shell-ui-migration-note.md): Step 06 shared shell/UI integration 与 viewer-scoped `availableActions` 迁移说明
- [`30-contracts/step-07-run-buff-replay-migration-note.md`](./30-contracts/step-07-run-buff-replay-migration-note.md): Step 07 run/buff contract surface、snapshot `runContext` 与 replay inspector 迁移说明
- [`30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](./30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md): Phase 2 的 `UiViewModel` 2.0 字段清单、受影响 payload 与 contract PR checklist
- [`30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`](./30-contracts/phase-2-uiviewmodel-2.0-migration-note.md): Phase 2 的 `UiViewModel` 2.0 additive contract change 迁移说明
- [`40-operations/README.md`](./40-operations/README.md): 部署、观测、CI/CD 与运行策略
- [`40-operations/release-prep.md`](./40-operations/release-prep.md): Step 08 release-ready 定义、engineering release 与产品 GA 的边界、最终验收门禁与当前产物范围
- [`40-operations/room-service-authority-semantics.md`](./40-operations/room-service-authority-semantics.md): Step 05 room-service 权威语义、连接绑定、广播与 replay 存储触发
- [`40-operations/agent-tooling-rollout.md`](./40-operations/agent-tooling-rollout.md): Agent 工具、CI 护栏与 `.codex`/MCP 规划
- [`40-operations/skills-governance.md`](./40-operations/skills-governance.md): 项目本地 Skills 的质量标准、步骤映射与目录治理
- [`90-adr/ADR-0001-greenfield-monorepo.md`](./90-adr/ADR-0001-greenfield-monorepo.md): 首个架构决策记录
- [`90-adr/ADR-0002-mechanical-agent-guardrails.md`](./90-adr/ADR-0002-mechanical-agent-guardrails.md): Agent 机械化护栏决策
- [`90-adr/ADR-0003-actor-effects-and-information-sets.md`](./90-adr/ADR-0003-actor-effects-and-information-sets.md): 连锁效果、信息集与 replay 流设计决策
- [`90-adr/ADR-0004-step-02.5-effect-hook-freeze.md`](./90-adr/ADR-0004-step-02.5-effect-hook-freeze.md): Step 02.5 Effect/Hook 原语冻结决策
- [`90-adr/ADR-0005-step-03-phase-tightening-and-replay-authority.md`](./90-adr/ADR-0005-step-03-phase-tightening-and-replay-authority.md): Step 03 phase 收紧与 replay/hash 权责下沉决策
- [`90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](./90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md): Board selection model 与 `UiViewModel` 2.0 projection 的阶段性决策
- [`99-legacy/README.md`](./99-legacy/README.md): legacy 规则抽取笔记与 git-history 追溯入口

## EN

This directory is the single source of truth for the Gem Duel rebuild. All architecture rules, contracts, operations guidance, ADRs, and the surviving legacy extracts / git-history pointers live here.

### Documentation Index

- [`00-refactor/full-rebuild-plan.md`](./00-refactor/full-rebuild-plan.md): Full rebuild execution plan
- [`00-refactor/rebuild-execution-tracker.md`](./00-refactor/rebuild-execution-tracker.md): Step-by-step execution tracker
- [`00-refactor/logs/README.md`](./00-refactor/logs/README.md): Per-step log guide and index
- [`10-architecture/README.md`](./10-architecture/README.md): Layering and directory standards
- [`10-architecture/engineering-standards.md`](./10-architecture/engineering-standards.md): Engineering standards and Git policy
- [`10-architecture/agent-guardrails-matrix.md`](./10-architecture/agent-guardrails-matrix.md): Agent boundaries, mechanical guardrails, and layered AGENTS design
- [`10-architecture/logs/README.md`](./10-architecture/logs/README.md): Entry point for landing logs tied to full-board roadmap phases, now including the Phase 1 delayed addendum, Phase 2 closure, the Phase 3 evidence caveat, the Phase 4 completion evidence, the Phase 5 parity closure, and the Phase 6 room-board convergence closure
- [`10-architecture/web-desktop-application-integration.md`](./10-architecture/web-desktop-application-integration.md): Step 06 Web/Desktop composition through shared application/ui boundaries
- [`10-architecture/full-board-ui-roadmap.md`](./10-architecture/full-board-ui-roadmap.md): Opus 4.7 audit findings, remediation ownership, and the phase-sorted roadmap from the current validation shell to a full playable board UI, now rephased to reflect the current Phase 1/2/3 repository reality
- [`10-architecture/full-board-ui-roadmap-phase-0-3-independent-audit.md`](./10-architecture/full-board-ui-roadmap-phase-0-3-independent-audit.md): Repo-verified disposition, status-rephase basis, and governance backlog for the independent Phase 0-3 audit
- [`10-architecture/phase-1-application-ui-structure-plan.md`](./10-architecture/phase-1-application-ui-structure-plan.md): Target layout, write scopes, migration order, and non-goals for the Phase 1 `application/ui` cleanup
- [`10-architecture/phase-2-interaction-and-uiviewmodel-plan.md`](./10-architecture/phase-2-interaction-and-uiviewmodel-plan.md): Interaction-model decision gate, migration order, write scopes, and non-goals for Phase 2
- [`10-architecture/phase-2.5-ui-layout-and-visual-harness-plan.md`](./10-architecture/phase-2.5-ui-layout-and-visual-harness-plan.md): Governance plan for `packages/ui` layout, design tokens, and the visual harness in Phase 2.5
- [`10-architecture/phase-4-player-path-acceptance-matrix.md`](./10-architecture/phase-4-player-path-acceptance-matrix.md): Frozen classic-local player-path matrix, the 8 automated rows, and the `check-phase4` evidence surface for Phase 4
- [`20-domain/README.md`](./20-domain/README.md): Domain model, state machine, and ruleset versioning
- [`20-domain/determinism-and-replay-discipline.md`](./20-domain/determinism-and-replay-discipline.md): Determinism, replay, and property-testing discipline
- [`20-domain/buff-hook-system.md`](./20-domain/buff-hook-system.md): Buff/Roguelike hook primitives, ordering, and composition rules
- [`20-domain/splendor-duel-official-rulebook.md`](./20-domain/splendor-duel-official-rulebook.md): Official rulebook digest and rebuild-facing modeling notes
- [`30-contracts/README.md`](./30-contracts/README.md): HTTP, WebSocket, and replay contracts
- [`30-contracts/contract-hardening-spec.md`](./30-contracts/contract-hardening-spec.md): Contract hardening, schema truth sources, and generation strategy
- [`30-contracts/step-03-phase-replay-migration-note.md`](./30-contracts/step-03-phase-replay-migration-note.md): Step 03 migration note for the phase surface and replay/hash ownership
- [`30-contracts/step-04-classic-rules-migration-note.md`](./30-contracts/step-04-classic-rules-migration-note.md): Step 04 migration note for classic commands, snapshot shape, and victory metadata
- [`30-contracts/step-05-room-service-authority-migration-note.md`](./30-contracts/step-05-room-service-authority-migration-note.md): Step 05 migration note for room-service authority, server-bound seats, and room errors
- [`30-contracts/step-06-shell-ui-migration-note.md`](./30-contracts/step-06-shell-ui-migration-note.md): Step 06 migration note for shared shell/UI integration and viewer-scoped `availableActions`
- [`30-contracts/step-07-run-buff-replay-migration-note.md`](./30-contracts/step-07-run-buff-replay-migration-note.md): Step 07 migration note for the run/buff contract surface, snapshot `runContext`, and the replay inspector
- [`30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](./30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md): Phase 2 `UiViewModel` 2.0 field inventory, affected payloads, and the contract-PR checklist
- [`30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`](./30-contracts/phase-2-uiviewmodel-2.0-migration-note.md): Migration note for the landed additive Phase 2 `UiViewModel` 2.0 contract change
- [`40-operations/README.md`](./40-operations/README.md): Deployment, observability, CI/CD, and runtime strategy
- [`40-operations/release-prep.md`](./40-operations/release-prep.md): Step 08 release-ready definition, the engineering-release vs product-GA boundary, final acceptance gates, and current artifact scope
- [`40-operations/room-service-authority-semantics.md`](./40-operations/room-service-authority-semantics.md): Step 05 room-service authority semantics, connection binding, broadcast rules, and replay persistence
- [`40-operations/agent-tooling-rollout.md`](./40-operations/agent-tooling-rollout.md): Agent tooling, CI guardrails, and `.codex`/MCP planning
- [`40-operations/skills-governance.md`](./40-operations/skills-governance.md): Quality bar, step mapping, and directory governance for project-local skills
- [`90-adr/ADR-0001-greenfield-monorepo.md`](./90-adr/ADR-0001-greenfield-monorepo.md): Initial architecture decision record
- [`90-adr/ADR-0002-mechanical-agent-guardrails.md`](./90-adr/ADR-0002-mechanical-agent-guardrails.md): Mechanical guardrails for agents
- [`90-adr/ADR-0003-actor-effects-and-information-sets.md`](./90-adr/ADR-0003-actor-effects-and-information-sets.md): Actor effects, information sets, and replay-stream design decision
- [`90-adr/ADR-0004-step-02.5-effect-hook-freeze.md`](./90-adr/ADR-0004-step-02.5-effect-hook-freeze.md): Step 02.5 decision for effect/hook primitive freeze
- [`90-adr/ADR-0005-step-03-phase-tightening-and-replay-authority.md`](./90-adr/ADR-0005-step-03-phase-tightening-and-replay-authority.md): Step 03 decision for phase tightening and replay/hash authority
- [`90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](./90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md): Decision for the board-selection model and the staged `UiViewModel` 2.0 projection rollout
- [`99-legacy/README.md`](./99-legacy/README.md): Legacy rule extracts and git-history entrypoint
