# Agent Tooling Rollout

## ZH

本文件记录 Agent 协作护栏的分波次落地顺序。当前步骤只做文档治理，不在本文件中直接接线工具。

项目本地 Skills 的规范、触发和步骤映射另见 [`skills-governance.md`](./skills-governance.md)。

## Wave 1

- `dependency-cruiser`：作为单向依赖 hard gate。
- `eslint-plugin-boundaries`：作为目录边界、legacy import 与 room-service 共享引擎规则的实时反馈。
- core-engine/domain 的 ESLint 禁令：封死随机、时钟、浏览器、Electron、Node IO 与隐藏随机源。
- 分层 `AGENTS.md`：把全局规则拆成最近目录优先的局部规则。
- `OpenAPI 3.1` + `AsyncAPI 3.0`：冻结对外契约描述目标版本。

## Wave 2

- 契约快照测试：`vitest` + schema fixture。
- 状态机调试：`@statelyai/inspect`
- namespaced RNG：记录为 `pure-rand`。
- 状态穷尽匹配：记录 `ts-pattern`。
- 不可变辅助：记录 `mutative`。
- replay 序列化：记录 `msgpackr`。
- golden replays：固定目录与 `finalStateHash` regression。
- 性质测试：`fast-check` + `@fast-check/vitest`
- 提交护栏：`husky` + `lint-staged` + `commitlint` + `commitizen`

## Wave 3

- `.codex/config.toml`：为 Agent 补充 tracker 和项目文档读取入口。
- MCP tools：`current_step()`、`validate_contract(schema_path)`、`check_layer(file_path)`。
- 评估 `Biome` 或 `oxlint` 以缩短反馈回路。
- 评估 `Semgrep` 以补强语义级边界检测。
- 评估 `arktype` / `@effect/schema` 作为未来契约复杂化后的潜在替代方案。

## `.codex/config.toml` 预留项

- `project_doc_max_bytes`
- `project_doc_fallback_filenames`
- fallback 至少包含：
    - `AGENTS.md`
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - `docs/10-architecture/agent-guardrails-matrix.md`

## EN

This document records the rollout order for agent-collaboration guardrails. The current step is documentation-only and does not wire the tools yet.

Project-local skill quality rules, triggers, and step mapping live in [`skills-governance.md`](./skills-governance.md).

## Wave 1

- `dependency-cruiser`: the hard gate for one-way dependencies.
- `eslint-plugin-boundaries`: the fast local signal for folder boundaries, legacy-import bans, and the shared-engine rule in room-service.
- ESLint pure-core restrictions for core-engine/domain: block randomness, clocks, browser APIs, Electron APIs, Node IO, and hidden random helpers.
- Layered `AGENTS.md`: split global rules into nearest-directory constraints.
- `OpenAPI 3.1` + `AsyncAPI 3.0`: freeze the outward protocol description targets.

## Wave 2

- Contract snapshot tests: `vitest` + schema fixtures.
- State-machine inspection: `@statelyai/inspect`
- Namespaced RNG streams: record `pure-rand`.
- Exhaustive phase matching: record `ts-pattern`.
- Immutable update helper: record `mutative`.
- Replay serialization: record `msgpackr`.
- Golden replays: fixed directory plus `finalStateHash` regression.
- Property testing: `fast-check` + `@fast-check/vitest`
- Commit guardrails: `husky` + `lint-staged` + `commitlint` + `commitizen`

## Wave 3

- `.codex/config.toml`: give the agent explicit tracker and project-doc entrypoints.
- MCP tools: `current_step()`, `validate_contract(schema_path)`, and `check_layer(file_path)`.
- Evaluate `Biome` or `oxlint` to shorten the feedback loop.
- Evaluate `Semgrep` to strengthen semantic boundary checks.
- Evaluate `arktype` / `@effect/schema` as future alternatives if contract complexity outgrows the current stack.

## `.codex/config.toml` Reserved Keys

- `project_doc_max_bytes`
- `project_doc_fallback_filenames`
- The fallback list should include at least:
    - `AGENTS.md`
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - `docs/10-architecture/agent-guardrails-matrix.md`
