# Engineering Standards

## ZH

### 核心原则

- 先文档/契约，后跨层实现。
- 任何实现都必须服从状态机、确定性、契约优先、边界隔离与信息集过滤。
- legacy 代码只允许参考，不允许 import，不允许原样照抄。
- 机械可验证的规则应优先落到工具与 CI；无法机械验证的细节放到 `docs/`，只在 `AGENTS.md` 保留摘要。
- 生成产物与缓存（如 `dist/`、`.turbo/`、`.next/`、局部 `.vite` 结果）不得作为仓库真相源提交。

### Legacy 归档规则

- `old/legacy-vite-electron/` 是旧实现的唯一归档位置。
- `old/legacy-vite-electron/` 在 `Step 08` 完成前不得删除。
- 新架构代码不得引用 `old/legacy-vite-electron/**`。
- 若需要借鉴 legacy 实现，必须先重构成新的领域模型、契约或应用层接口，再进入新目录。

### 步骤、日志与提交

- 一步一提交，提交粒度默认与 `docs/00-refactor/rebuild-execution-tracker.md` 中的步骤边界一致。
- 每个步骤都必须维护对应日志；步骤状态变化必须与日志和提交同一批收口。
- 不允许只更新代码不更新 tracker，也不允许只改 tracker 不写日志。
- 提交信息应清楚表达步骤目标，避免把多个步骤混在同一个提交里。

### Git 与发布策略

- 重构完成前禁止创建或更新 git tag。
- 允许 Push 和 Merge，但不得把 tag 用作阶段性里程碑或版本发布信号。
- 只有 `Step 08` 完成后，才允许移除 `old/legacy-vite-electron/` 并进入正式发布准备。

### 文档与命名规范

- 核心治理文档默认双语维护，硬约束优先使用英文在前、中文在后。
- 术语、标识符、接口名、schema 字段、错误码、事件名与 commit 规范使用英文原名。
- 任何目录、依赖方向、公共接口或执行策略变化，都必须先更新对应文档或 ADR。
- 根 `AGENTS.md` 保持短小，子目录 `AGENTS.md` 只补本地特有约束，避免重复和规则噪音。

### 规则建模规范

- 对局主流程采用 `XState v5 actor model`；Royal、购卡能力、extra turn 与 Buff hook 均通过 effect actors / child actors 建模。
- 分域随机性采用 namespaced RNG streams；默认接口包含 `fork(namespace: string)`。
- `room-service` 不得重写一份服务端规则引擎，只能复用共享 `packages/core-engine`。
- 所有对外状态必须基于 `AuthoritativeSnapshot -> PlayerSnapshot / SpectatorSnapshot` 的信息过滤链路。

### 推荐基础库

- 契约层继续使用 `zod`，外发描述使用 OpenAPI 3.1 与 AsyncAPI 3.0。
- 确定性与回放优先使用 `pure-rand`、`msgpackr`、`fast-check`。
- 状态穷尽匹配优先使用 `ts-pattern`。
- 不可变状态更新优先记录 `mutative` 为首选辅助库。

### 计划中的机械化护栏

- 依赖边界计划由 `dependency-cruiser` 与 `eslint-plugin-boundaries` 双重约束。
- core-engine/domain 的纯度计划由 ESLint restricted rules 落地，必要时补 `Semgrep`。
- 契约层计划以 `zod`、OpenAPI 3.1、AsyncAPI 3.0 与 snapshot tests 收紧。
- replay 与确定性计划以 namespaced RNG、`MessagePack`、golden replays 与性质测试收紧。

## EN

### Core Principles

- Docs and contracts come before cross-layer implementation.
- Every implementation must obey state-machine rules, determinism, contract-first boundaries, layer isolation, and information-set filtering.
- Legacy code may be referenced, but it may not be imported or copied verbatim.
- Mechanically enforceable rules should move into tooling and CI first; details that cannot yet be enforced belong in `docs/`, with only a summary kept in `AGENTS.md`.
- Generated outputs and caches such as `dist/`, `.turbo/`, `.next/`, and local `.vite` results are not source-of-truth artifacts and must not be committed.

### Legacy Archive Policy

- `old/legacy-vite-electron/` is the only supported archive location for the legacy implementation.
- `old/legacy-vite-electron/` may not be deleted before `Step 08` is completed.
- New-architecture code may not reference `old/legacy-vite-electron/**`.
- If legacy behavior is used as input, it must first be refactored into new domain, contract, or application-layer structures before entering the active architecture.

### Steps, Logs, and Commits

- Default to one step per commit, aligned with the boundaries in `docs/00-refactor/rebuild-execution-tracker.md`.
- Every step must maintain a matching log; status changes must close together with the log and commit boundary.
- Code-only progress without tracker/log updates is not allowed, and tracker-only progress without a step log is not allowed either.
- Commit messages should clearly express the step intent and must not mix unrelated steps into the same commit.

### Git and Release Policy

- Do not create or update git tags before the rebuild is complete.
- Pushes and merges are allowed, but tags may not be used as interim milestone or release signals.
- Only after `Step 08` is complete may `old/legacy-vite-electron/` be removed and the project enter formal release preparation.

### Documentation and Naming Standards

- Core governance documents are bilingual by default, with hard constraints written English-first and Chinese-second.
- Terms, identifiers, interface names, schema fields, error codes, event names, and commit conventions stay in English.
- Any change to directories, dependency direction, public interfaces, or execution policy must update the matching docs or ADR first.
- Root `AGENTS.md` stays short, while subdirectory `AGENTS.md` files add only local constraints to reduce noise and repetition.

### Gameplay Modeling Standards

- The match flow uses `XState v5 actor model`; royal rewards, card abilities, extra turns, and Buff hooks are modeled with effect actors / child actors.
- Randomness uses namespaced RNG streams, with `fork(namespace: string)` as the standard interface.
- `room-service` may not grow its own server-side rule engine; it must reuse the shared `packages/core-engine`.
- Every outbound state must follow the `AuthoritativeSnapshot -> PlayerSnapshot / SpectatorSnapshot` information-filtering pipeline.

### Preferred Foundation Libraries

- Keep `zod` in the contract layer, with OpenAPI 3.1 and AsyncAPI 3.0 as outward description formats.
- Prefer `pure-rand`, `msgpackr`, and `fast-check` for determinism and replay work.
- Prefer `ts-pattern` for exhaustive phase matching.
- Record `mutative` as the preferred helper for immutable state updates.

### Planned Mechanical Guardrails

- Dependency boundaries are planned to be enforced by `dependency-cruiser` and `eslint-plugin-boundaries`.
- Pure core restrictions for core-engine/domain are planned through restricted ESLint rules, with `Semgrep` as a later extension if needed.
- Contract hardening is planned around `zod`, OpenAPI 3.1, AsyncAPI 3.0, and snapshot tests.
- Replay and determinism hardening is planned around namespaced RNG, `MessagePack`, golden replays, and property tests.
