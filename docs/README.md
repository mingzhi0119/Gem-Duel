# Gem Duel Docs

## ZH

本目录是 Gem Duel 全量重构后的唯一架构真相来源。所有目录规则、契约定义、运维策略、ADR 决策和 legacy 归档都应在此维护。

### 文档索引

- [`00-refactor/full-rebuild-plan.md`](./00-refactor/full-rebuild-plan.md): 全量重构总方案
- [`00-refactor/rebuild-execution-tracker.md`](./00-refactor/rebuild-execution-tracker.md): 分步执行总表与状态追踪
- [`00-refactor/logs/README.md`](./00-refactor/logs/README.md): 分步日志规范与入口
- [`10-architecture/README.md`](./10-architecture/README.md): 分层与目录标准
- [`10-architecture/engineering-standards.md`](./10-architecture/engineering-standards.md): 工程规范与 Git 策略
- [`10-architecture/agent-guardrails-matrix.md`](./10-architecture/agent-guardrails-matrix.md): Agent 边界、机械化护栏与分层 AGENTS 设计
- [`20-domain/README.md`](./20-domain/README.md): 领域模型、状态机与规则版本
- [`20-domain/determinism-and-replay-discipline.md`](./20-domain/determinism-and-replay-discipline.md): 确定性、回放与性质测试纪律
- [`30-contracts/README.md`](./30-contracts/README.md): HTTP、WebSocket、Replay 契约
- [`30-contracts/contract-hardening-spec.md`](./30-contracts/contract-hardening-spec.md): 契约硬化、schema 真相源与生成策略
- [`40-operations/README.md`](./40-operations/README.md): 部署、观测、CI/CD 与运行策略
- [`40-operations/agent-tooling-rollout.md`](./40-operations/agent-tooling-rollout.md): Agent 工具、CI 护栏与 `.codex`/MCP 规划
- [`90-adr/ADR-0001-greenfield-monorepo.md`](./90-adr/ADR-0001-greenfield-monorepo.md): 首个架构决策记录
- [`90-adr/ADR-0002-mechanical-agent-guardrails.md`](./90-adr/ADR-0002-mechanical-agent-guardrails.md): Agent 机械化护栏决策
- [`99-legacy/README.md`](./99-legacy/README.md): 旧实现与旧文档归档入口

## EN

This directory is the single source of truth for the Gem Duel rebuild. All architecture rules, contracts, operations guidance, ADRs, and legacy archives must be maintained here.

### Documentation Index

- [`00-refactor/full-rebuild-plan.md`](./00-refactor/full-rebuild-plan.md): Full rebuild execution plan
- [`00-refactor/rebuild-execution-tracker.md`](./00-refactor/rebuild-execution-tracker.md): Step-by-step execution tracker
- [`00-refactor/logs/README.md`](./00-refactor/logs/README.md): Per-step log guide and index
- [`10-architecture/README.md`](./10-architecture/README.md): Layering and directory standards
- [`10-architecture/engineering-standards.md`](./10-architecture/engineering-standards.md): Engineering standards and Git policy
- [`10-architecture/agent-guardrails-matrix.md`](./10-architecture/agent-guardrails-matrix.md): Agent boundaries, mechanical guardrails, and layered AGENTS design
- [`20-domain/README.md`](./20-domain/README.md): Domain model, state machine, and ruleset versioning
- [`20-domain/determinism-and-replay-discipline.md`](./20-domain/determinism-and-replay-discipline.md): Determinism, replay, and property-testing discipline
- [`30-contracts/README.md`](./30-contracts/README.md): HTTP, WebSocket, and replay contracts
- [`30-contracts/contract-hardening-spec.md`](./30-contracts/contract-hardening-spec.md): Contract hardening, schema truth sources, and generation strategy
- [`40-operations/README.md`](./40-operations/README.md): Deployment, observability, CI/CD, and runtime strategy
- [`40-operations/agent-tooling-rollout.md`](./40-operations/agent-tooling-rollout.md): Agent tooling, CI guardrails, and `.codex`/MCP planning
- [`90-adr/ADR-0001-greenfield-monorepo.md`](./90-adr/ADR-0001-greenfield-monorepo.md): Initial architecture decision record
- [`90-adr/ADR-0002-mechanical-agent-guardrails.md`](./90-adr/ADR-0002-mechanical-agent-guardrails.md): Mechanical guardrails for agents
- [`99-legacy/README.md`](./99-legacy/README.md): Legacy implementation and document archive index
