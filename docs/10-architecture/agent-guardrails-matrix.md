# Agent Guardrails Matrix

## ZH

本文件把 Agent 协作规则拆成三类：文档规则、机械化强制、可执行契约。只有三者同时存在时，边界约束才算真正落地。

## 三位一体原则

- 文档：解释意图、边界、术语和步骤顺序。
- 机械化强制：用 lint、dependency graph、commit gate、CI red light 阻止越界。
- 可执行契约：用 schema、snapshot、replay fixture 和状态机测试把边界变成可验证产物。

## 分层 AGENTS 布局

- 根目录 `AGENTS.md`：全局纪律、禁止项、完成证明、命令入口。
- `docs/AGENTS.md`：文档双语、ADR、索引维护。
- `packages/contracts/AGENTS.md`：契约优先、schema 与错误模型对齐。
- `packages/domain/AGENTS.md`：纯领域模型、无宿主依赖。
- `packages/core-engine/AGENTS.md`：确定性状态推进与 replay 纪律。
- `apps/web/app/api/AGENTS.md`：BFF-only，禁止规则结算。
- `old/legacy-vite-electron/AGENTS.md`：只读参考，禁止 import 与照抄。

## 护栏矩阵

| 约束目标                     | 文档真相                                                             | 计划机械化手段                                                                                    | 计划落地步骤 |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| 单向依赖                     | `AGENTS.md`、本文件、`docs/10-architecture/`                         | `dependency-cruiser` + `eslint-plugin-boundaries`                                                 | Step 02      |
| 核心纯度与确定性             | `AGENTS.md`、`docs/20-domain/`                                       | ESLint `no-restricted-globals`、`no-restricted-syntax`、`no-restricted-imports`；后续补 `Semgrep` | Step 02-03   |
| 禁止 legacy import           | 根 `AGENTS.md`、`old/legacy-vite-electron/AGENTS.md`                 | `dependency-cruiser`、`eslint-plugin-boundaries`、后续 `Semgrep`                                  | Step 02      |
| 先契约后实现                 | `docs/30-contracts/`、根 `AGENTS.md`                                 | `zod` schema、contract snapshot tests、doc generation                                             | Step 02      |
| HTTP 契约文档化              | `docs/30-contracts/`                                                 | `@asteasolutions/zod-to-openapi`                                                                  | Step 02      |
| WebSocket / event 契约文档化 | `docs/30-contracts/`                                                 | `AsyncAPI`                                                                                        | Step 02      |
| Replay 确定性                | `docs/20-domain/`                                                    | golden replay regression + state hash                                                             | Step 03      |
| 性质测试                     | `docs/20-domain/`                                                    | `fast-check` + `@fast-check/vitest`                                                               | Step 03      |
| 步骤与提交对齐               | `docs/00-refactor/`、`docs/10-architecture/engineering-standards.md` | `commitlint` + `commitizen` 自定义校验                                                            | Step 02      |
| Agent 读取当前步骤           | `docs/00-refactor/rebuild-execution-tracker.md`                      | `.codex/config.toml` + MCP `current_step()`                                                       | Step 02-03   |

## 工具选型决议

- 依赖边界：采用 `dependency-cruiser` 作为 CI hard gate，`eslint-plugin-boundaries` 作为本地快速反馈。
- 纯核心约束：保留 ESLint 作为第一阶段执行器，必要时在后续补 `Semgrep` 做语义级禁令。
- 格式化与静态检查：当前不在本步引入 `Biome` 或 `oxlint`，只在 `docs/40-operations/agent-tooling-rollout.md` 中记录为评估项。
- 文档策略：根 `AGENTS.md` 只保留短规则；不能机械校验的细节统一沉到 `docs/`。

## 元规则

若某条规则无法在 CI 或本地检查中机械化验证，它可以先写入 `docs/` 作为治理说明，但不应在根 `AGENTS.md` 中占据过多篇幅。

## EN

This document splits agent governance into three layers: written rules, mechanical enforcement, and executable contracts. A boundary is only considered real when all three are present.

## Three-Part Model

- Documentation explains intent, boundaries, terms, and step order.
- Mechanical enforcement blocks violations with lint, dependency rules, commit gates, and CI failures.
- Executable contracts turn boundaries into artifacts such as schemas, snapshots, replay fixtures, and state-machine tests.

## Layered AGENTS Layout

- Root `AGENTS.md`: global discipline, forbidden actions, proof of done, and command entrypoints.
- `docs/AGENTS.md`: bilingual docs, ADR flow, and index maintenance.
- `packages/contracts/AGENTS.md`: contract-first rules plus schema/error-model alignment.
- `packages/domain/AGENTS.md`: pure domain modeling with no host dependencies.
- `packages/core-engine/AGENTS.md`: deterministic state progression and replay discipline.
- `apps/web/app/api/AGENTS.md`: BFF only, no rule resolution.
- `old/legacy-vite-electron/AGENTS.md`: read-only archive, no imports, no verbatim copying.

## Guardrail Matrix

| Constraint                      | Documentation Source                                                 | Planned Mechanical Gate                                                                          | Planned Step |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------ |
| One-way dependencies            | `AGENTS.md`, this file, `docs/10-architecture/`                      | `dependency-cruiser` + `eslint-plugin-boundaries`                                                | Step 02      |
| Pure core and determinism       | `AGENTS.md`, `docs/20-domain/`                                       | ESLint `no-restricted-globals`, `no-restricted-syntax`, `no-restricted-imports`; later `Semgrep` | Step 02-03   |
| No legacy imports               | root `AGENTS.md`, `old/legacy-vite-electron/AGENTS.md`               | `dependency-cruiser`, `eslint-plugin-boundaries`, later `Semgrep`                                | Step 02      |
| Contracts before implementation | `docs/30-contracts/`, root `AGENTS.md`                               | `zod` schemas, contract snapshots, generated docs                                                | Step 02      |
| HTTP contract docs              | `docs/30-contracts/`                                                 | `@asteasolutions/zod-to-openapi`                                                                 | Step 02      |
| WebSocket / event contract docs | `docs/30-contracts/`                                                 | `AsyncAPI`                                                                                       | Step 02      |
| Replay determinism              | `docs/20-domain/`                                                    | golden replay regression + state hash                                                            | Step 03      |
| Property testing                | `docs/20-domain/`                                                    | `fast-check` + `@fast-check/vitest`                                                              | Step 03      |
| Step-to-commit alignment        | `docs/00-refactor/`, `docs/10-architecture/engineering-standards.md` | `commitlint` + `commitizen` custom checks                                                        | Step 02      |
| Agent awareness of current step | `docs/00-refactor/rebuild-execution-tracker.md`                      | `.codex/config.toml` + MCP `current_step()`                                                      | Step 02-03   |

## Tooling Decisions

- Dependency boundaries: use `dependency-cruiser` as the CI hard gate and `eslint-plugin-boundaries` for fast local feedback.
- Pure-core enforcement: keep ESLint as the phase-one executor and add `Semgrep` later if semantic restrictions need more coverage.
- Formatting and static checks: do not introduce `Biome` or `oxlint` in this step; keep them documented as later evaluation items.
- Documentation policy: root `AGENTS.md` stays short, while non-mechanical detail lives in `docs/`.

## Meta Rule

If a rule cannot yet be verified mechanically in CI or local checks, it may live in `docs/` as governance guidance, but it should not dominate the root `AGENTS.md`.
