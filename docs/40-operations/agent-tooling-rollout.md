# Agent Tooling Rollout

## ZH

本文件记录 Agent 协作护栏的分波次落地顺序。当前步骤只做文档治理，不在本文件中直接接线工具。

## Wave 1

- `dependency-cruiser`：作为单向依赖 hard gate。
- `eslint-plugin-boundaries`：作为目录边界和 legacy import 的实时反馈。
- core-engine/domain 的 ESLint 禁令：封死随机、时钟、浏览器、Electron、Node IO。
- 分层 `AGENTS.md`：把全局规则拆成最近目录优先的局部规则。

## Wave 2

- 契约快照测试：`vitest` + schema fixture。
- OpenAPI：`@asteasolutions/zod-to-openapi`
- AsyncAPI：WebSocket / event 协议文档。
- seeded PRNG：记录为 `pure-rand`。
- golden replays：固定目录与 state hash regression。
- 性质测试：`fast-check` + `@fast-check/vitest`
- 提交护栏：`husky` + `lint-staged` + `commitlint` + `commitizen`

## Wave 3

- `.codex/config.toml`：为 Agent 补充 tracker 和项目文档读取入口。
- MCP tools：`current_step()`、`validate_contract(schema_path)`、`check_layer(file_path)`。
- 评估 `Biome` 或 `oxlint` 以缩短反馈回路。
- 评估 `Semgrep` 以补强语义级边界检测。

## `.codex/config.toml` 预留项

- `project_doc_max_bytes`
- `project_doc_fallback_filenames`
- fallback 至少包含：
    - `AGENTS.md`
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - `docs/10-architecture/agent-guardrails-matrix.md`

## EN

This document records the rollout order for agent-collaboration guardrails. The current step is documentation-only and does not wire the tools yet.

## Wave 1

- `dependency-cruiser`: the hard gate for one-way dependencies.
- `eslint-plugin-boundaries`: the fast local signal for folder boundaries and legacy-import bans.
- ESLint pure-core restrictions for core-engine/domain: block randomness, clocks, browser APIs, Electron APIs, and Node IO.
- Layered `AGENTS.md`: split global rules into nearest-directory constraints.

## Wave 2

- Contract snapshot tests: `vitest` + schema fixtures.
- OpenAPI generation: `@asteasolutions/zod-to-openapi`
- AsyncAPI: WebSocket / event protocol documentation.
- Seeded PRNG: recorded choice is `pure-rand`.
- Golden replays: fixed directory plus state-hash regression.
- Property testing: `fast-check` + `@fast-check/vitest`
- Commit guardrails: `husky` + `lint-staged` + `commitlint` + `commitizen`

## Wave 3

- `.codex/config.toml`: give the agent explicit tracker and project-doc entrypoints.
- MCP tools: `current_step()`, `validate_contract(schema_path)`, and `check_layer(file_path)`.
- Evaluate `Biome` or `oxlint` to shorten the feedback loop.
- Evaluate `Semgrep` to strengthen semantic boundary checks.

## `.codex/config.toml` Reserved Keys

- `project_doc_max_bytes`
- `project_doc_fallback_filenames`
- The fallback list should include at least:
    - `AGENTS.md`
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - `docs/10-architecture/agent-guardrails-matrix.md`
