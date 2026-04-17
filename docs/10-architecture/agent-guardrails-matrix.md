# Agent Guardrails Matrix

## ZH

本文件把 Agent 协作规则拆成三类：文档规则、机械化强制、可执行契约。只有三者同时存在时，边界约束才算真正落地。

## 三位一体原则

- 文档：解释意图、边界、术语、信息集与步骤顺序。
- 机械化强制：用 lint、dependency graph、commit gate、CI red light 阻止越界。
- 可执行契约：用 schema、snapshot、replay fixture、golden replay suite 与状态机测试把边界变成可验证产物。

## 分层 AGENTS 布局

- 根目录 `AGENTS.md`：全局纪律、禁止项、完成证明、命令入口。
- `docs/AGENTS.md`：文档双语、ADR、索引维护。
- `packages/contracts/AGENTS.md`：契约优先、三类 Snapshot、Replay 与 effect/hook 契约。
- `packages/domain/AGENTS.md`：纯领域模型、Run/Meta state 与 Buff 注册表。
- `packages/core-engine/AGENTS.md`：确定性状态推进、actor-based effect resolution 与 replay 纪律。
- `apps/room-service/AGENTS.md`：共享引擎、幂等、seq/resync、spectator 与信息过滤。
- `apps/web/app/api/AGENTS.md`：BFF-only，禁止规则结算。
- `docs/99-legacy/README.md`：legacy extracts 与 git-history 入口，只读参考，禁止 import 与照抄。

## 护栏矩阵

| 约束目标                               | 文档真相                                                                                          | 计划机械化手段                                                                                    | 计划落地步骤            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------- |
| 单向依赖                               | `AGENTS.md`、本文件、`docs/10-architecture/`                                                      | `dependency-cruiser` + `eslint-plugin-boundaries`（已接线）                                       | Step 02                 |
| 禁止隐藏随机源                         | `AGENTS.md`、`packages/core-engine/AGENTS.md`、`docs/20-domain/`                                  | ESLint `no-restricted-globals`、`no-restricted-syntax`、`no-restricted-imports`；后续补 `Semgrep` | Step 02-03              |
| namespaced RNG streams                 | `docs/20-domain/`、`docs/30-contracts/`                                                           | contract tests + determinism tests + replay regression                                            | Step 02-03              |
| actor-based effect resolution          | `docs/00-refactor/full-rebuild-plan.md`、`docs/20-domain/`                                        | state-machine tests + actor tests                                                                 | Step 02.5-03            |
| 先契约后实现                           | `docs/30-contracts/`、根 `AGENTS.md`                                                              | `zod` schema、contract fixtures、OpenAPI/AsyncAPI generation、drift verification                  | Step 02                 |
| Snapshot 信息过滤                      | `docs/30-contracts/`、`apps/room-service/AGENTS.md`                                               | contract tests + room-service protocol tests                                                      | Step 02, Step 05        |
| room-service 共享引擎                  | 根 `AGENTS.md`、`apps/room-service/AGENTS.md`、`docs/00-refactor/full-rebuild-plan.md`            | dependency rules + architectural review + golden replay parity                                    | Step 05                 |
| Replay 权威格式与回归                  | `docs/20-domain/`、`docs/30-contracts/`                                                           | replay wire-shape fixtures + `finalStateHash` regression suite                                    | Step 02-04              |
| seq / resync / idempotency / spectator | `docs/30-contracts/`、`docs/40-operations/`                                                       | HTTP/WS contract tests + session integration tests                                                | Step 05                 |
| visual harness 与截图基线              | `docs/10-architecture/full-board-ui-roadmap.md`、`phase-2.5-ui-layout-and-visual-harness-plan.md` | `pnpm check-visual` + Playwright screenshot baseline against `/playground/*`                      | Phase 2.5               |
| 步骤与提交对齐                         | `docs/00-refactor/`、`docs/10-architecture/engineering-standards.md`                              | tracker + per-step logs now；`commitlint` + `commitizen` 留待后续 wave                            | Step 01, later wave     |
| 工作树清洁与漂移产物隔离               | 根 `AGENTS.md`、`docs/10-architecture/engineering-standards.md`                                   | `git status --short` 审查 + `.gitignore` / `tmp/` 输出约束 + `pnpm check-commit` + pre-push gate  | 2026-04 governance wave |
| Agent 读取当前步骤                     | `docs/00-refactor/rebuild-execution-tracker.md`                                                   | `.codex/config.toml` + MCP `current_step()`                                                       | Step 02-03              |

## 工具选型决议

- 依赖边界：采用 `dependency-cruiser` 作为 CI hard gate，`eslint-plugin-boundaries` 作为本地快速反馈；Step 02 已完成首次接线。
- 纯核心约束：保留 ESLint 作为第一阶段执行器，必要时在后续补 `Semgrep` 做语义级禁令。
- 状态机与连锁效果：采用 `XState v5 actor model` 作为唯一主方案，开发期可配合 `@statelyai/inspect` 可视化。
- 契约：继续采用 `zod` 作为当前 schema 真相源，通过 OpenAPI 3.1 与 AsyncAPI 3.0 输出对外描述。
- 确定性与辅助实现：记录 `pure-rand`、`ts-pattern`、`mutative`、`msgpackr` 为首选实现辅助库。
- 视觉基线：Phase 2.5 采用 Playwright + `/playground/*` 静态场景作为 `pnpm check-visual` 的第一轮 screenshot gate，临时输出进入 `tmp/`。
- 文档策略：根 `AGENTS.md` 只保留短规则；不能机械校验的细节统一沉到 `docs/`。
- 工作树卫生：提交前先做人类可读的 worktree 审查；对可预测的漂移产物，优先把输出导向已 ignore 的路径或 `tmp/`；当前已由 `check-commit` / pre-push gate 做第一轮机械化。

## 元规则

若某条规则无法在 CI 或本地检查中机械化验证，它可以先写入 `docs/` 作为治理说明，但不应在根 `AGENTS.md` 中占据过多篇幅。

## EN

This document splits agent governance into three layers: written rules, mechanical enforcement, and executable contracts. A boundary is only considered real when all three are present.

## Three-Part Model

- Documentation explains intent, boundaries, terms, information sets, and step order.
- Mechanical enforcement blocks violations with lint, dependency rules, commit gates, and CI failures.
- Executable contracts turn boundaries into artifacts such as schemas, snapshots, replay fixtures, golden replay suites, and state-machine tests.

## Layered AGENTS Layout

- Root `AGENTS.md`: global discipline, forbidden actions, proof of done, and command entrypoints.
- `docs/AGENTS.md`: bilingual docs, ADR flow, and index maintenance.
- `packages/contracts/AGENTS.md`: contract-first rules plus snapshot tiers, replay envelopes, and effect/hook contracts.
- `packages/domain/AGENTS.md`: pure domain modeling, Run/Meta state, and Buff registries.
- `packages/core-engine/AGENTS.md`: deterministic state progression, actor-based effect resolution, and replay discipline.
- `apps/room-service/AGENTS.md`: shared engine rules, idempotency, seq/resync, spectator flow, and information filtering.
- `apps/web/app/api/AGENTS.md`: BFF only, no rule resolution.
- `docs/99-legacy/README.md`: legacy extracts plus git-history entrypoint, read-only reference, no imports, no verbatim copying.

## Guardrail Matrix

| Constraint                             | Documentation Source                                                                              | Planned Mechanical Gate                                                                               | Planned Step            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| One-way dependencies                   | `AGENTS.md`, this file, `docs/10-architecture/`                                                   | `dependency-cruiser` + `eslint-plugin-boundaries` (wired in Step 02)                                  | Step 02                 |
| No hidden random sources               | `AGENTS.md`, `packages/core-engine/AGENTS.md`, `docs/20-domain/`                                  | ESLint `no-restricted-globals`, `no-restricted-syntax`, `no-restricted-imports`; later `Semgrep`      | Step 02-03              |
| Namespaced RNG streams                 | `docs/20-domain/`, `docs/30-contracts/`                                                           | contract tests + determinism tests + replay regression                                                | Step 02-03              |
| Actor-based effect resolution          | `docs/00-refactor/full-rebuild-plan.md`, `docs/20-domain/`                                        | state-machine tests + actor tests                                                                     | Step 02.5-03            |
| Contracts before implementation        | `docs/30-contracts/`, root `AGENTS.md`                                                            | `zod` schemas, contract fixtures, generated docs, and drift verification                              | Step 02                 |
| Snapshot information filtering         | `docs/30-contracts/`, `apps/room-service/AGENTS.md`                                               | contract tests + room-service protocol tests                                                          | Step 02, Step 05        |
| Shared engine in room-service          | root `AGENTS.md`, `apps/room-service/AGENTS.md`, `docs/00-refactor/full-rebuild-plan.md`          | dependency rules + architecture review + golden replay parity                                         | Step 05                 |
| Replay authority and regression        | `docs/20-domain/`, `docs/30-contracts/`                                                           | replay wire-shape fixtures + `finalStateHash` regression suite                                        | Step 02-04              |
| seq / resync / idempotency / spectator | `docs/30-contracts/`, `docs/40-operations/`                                                       | HTTP/WS contract tests + session integration tests                                                    | Step 05                 |
| Visual harness and screenshot baseline | `docs/10-architecture/full-board-ui-roadmap.md`, `phase-2.5-ui-layout-and-visual-harness-plan.md` | `pnpm check-visual` + Playwright screenshot baseline against `/playground/*`                          | Phase 2.5               |
| Step-to-commit alignment               | `docs/00-refactor/`, `docs/10-architecture/engineering-standards.md`                              | tracker + per-step logs now; `commitlint` + `commitizen` later                                        | Step 01, later wave     |
| Worktree hygiene and drift isolation   | root `AGENTS.md`, `docs/10-architecture/engineering-standards.md`                                 | `git status --short` audit + `.gitignore` / `tmp/` output rules + `pnpm check-commit` + pre-push gate | 2026-04 governance wave |
| Agent awareness of current step        | `docs/00-refactor/rebuild-execution-tracker.md`                                                   | `.codex/config.toml` + MCP `current_step()`                                                           | Step 02-03              |

## Tooling Decisions

- Dependency boundaries: use `dependency-cruiser` as the CI hard gate and `eslint-plugin-boundaries` for fast local feedback; Step 02 lands the first working wiring.
- Pure-core enforcement: keep ESLint as the phase-one executor and add `Semgrep` later if semantic restrictions need more coverage.
- State machine and chained effects: use `XState v5 actor model` as the single primary approach, with `@statelyai/inspect` available in dev workflows.
- Contracts: keep `zod` as the current schema truth source and generate outward descriptions with OpenAPI 3.1 plus AsyncAPI 3.0.
- Determinism helpers: record `pure-rand`, `ts-pattern`, `mutative`, and `msgpackr` as the preferred supporting libraries.
- Visual baselines: Phase 2.5 now uses Playwright plus static `/playground/*` scenes for the first `pnpm check-visual` screenshot gate, with temporary run output redirected into `tmp/`.
- Documentation policy: root `AGENTS.md` stays short, while non-mechanical detail lives in `docs/`.
- Worktree hygiene: perform a readable worktree audit before commit, keep predictable drift outputs in ignored paths or `tmp/`, and use the landed `check-commit` / pre-push gates as the first mechanical enforcement layer.

## Meta Rule

If a rule cannot yet be verified mechanically in CI or local checks, it may live in `docs/` as governance guidance, but it should not dominate the root `AGENTS.md`.
