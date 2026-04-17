# Engineering Standards

## ZH

### 核心原则

- 先文档/契约，后跨层实现。
- 任何实现都必须服从状态机、确定性、契约优先、边界隔离与信息集过滤。
- legacy 代码只允许参考，不允许 import，不允许原样照抄。
- 机械可验证的规则应优先落到工具与 CI；无法机械验证的细节放到 `docs/`，只在 `AGENTS.md` 保留摘要。
- 缓存与构建产物（如 `dist/`、`.turbo/`、`.next/`、局部 `.vite` 结果）不得作为仓库真相源提交；唯一例外是 Step 02 冻结后的契约生成产物 `packages/contracts/generated/**`，它们必须随 schema 一起入库并参与 drift 校验。

### 冻结依赖矩阵

- `packages/domain`：不得依赖任何 workspace 包。
- `packages/contracts`：只允许依赖 `packages/domain`。
- `packages/core-engine`：只允许依赖 `packages/contracts` 与 `packages/domain`。
- `packages/adapters`：只允许依赖 `packages/contracts`、`packages/domain`、`packages/core-engine`。
- `packages/application`：允许依赖 `packages/contracts`、`packages/domain`、`packages/core-engine`，以及仅用于 session/bootstrap 组装的 `packages/adapters`。
- `packages/ui`：只允许依赖 `packages/contracts` 与 React。
- `apps/web`、`apps/desktop`：只允许依赖 `packages/application`、`packages/contracts`、`packages/ui`。
- `apps/room-service`：只允许依赖 `packages/application`、`packages/contracts`、`packages/adapters`。
- 该矩阵由 `dependency-cruiser` 与 `eslint-plugin-boundaries` 共同阻断；文档、代码与 CI 以此为准。

### Legacy 历史规则

- live legacy source tree 已在 `Step 08` 删除；legacy 参考入口固定为 `docs/99-legacy/` 与 git 历史。
- 新架构代码不得重新引入 pre-rebuild history 的 import 或逐字复制。
- 若需要借鉴 legacy 行为，必须先提炼成新的领域模型、契约或应用层接口，再进入现行目录。

### 步骤、日志与提交

- 一步一提交，提交粒度默认与 `docs/00-refactor/rebuild-execution-tracker.md` 中的步骤边界一致。
- 每个步骤都必须维护对应日志；步骤状态变化必须与日志和提交同一批收口。
- 不允许只更新代码不更新 tracker，也不允许只改 tracker 不写日志。
- 提交信息应清楚表达步骤目标，避免把多个步骤混在同一个提交里。

### Git 与发布策略

- 在 tracker 标记 `Step 08` 完成前，禁止创建或更新 git tag。
- 允许 Push 和 Merge，但不得把 tag 用作阶段性里程碑或版本发布信号。
- Step 08 完成后，仓库进入 release-ready 状态，允许后续 tag-based release flow，但 Step 08 本身不创建 tag。

### 工作树卫生与漂移产物

- 任何编辑、提交、开 PR、push 或 merge 之前，先运行 `git status --short` 审查当前工作树。
- 发现未提交改动时，必须先分类：
    - intended work：本次范围内的真实改动，应继续整理、验证并提交。
    - drift artifact：由 dev server、build、codegen、缓存、编辑器或平台行为带来的非真相源改动，应恢复、删除、ignore 或迁移到临时目录。
- 若某个生成步骤会稳定产生非真相源文件，优先处理顺序为：
    - 把输出改到已 ignore 的路径；
    - 或改到仓库 `tmp/` / 系统临时目录；
    - 并在使用后及时删除这些临时产物。
- 若某类漂移产物无法避免且路径固定，应同步更新 `.gitignore` 或工具输出位置，而不是把漂移留到提交边界再人工兜底。
- tracked 文件若被工具改写但不属于本次真相面，必须在提交前 `restore` 回仓库状态。
- 提交边界要求干净工作树：创建 commit 或 PR 时，不允许留下未提交、未解释、未分类的残留改动。
- 当前 `pnpm check-commit` + `.husky/pre-push` 已覆盖至少两项：
    - commit / PR 前除 staged set 外不得有额外未提交残留，push 前工作树必须完全 clean；
    - 已知 drift-prone 生成步骤不得把非真相源文件写回受跟踪路径。
- 后续可继续扩展 `pnpm check-commit`，例如覆盖更多 drift-prone tracked files 或按包分层的生成产物约束。

### 文档与命名规范

- 核心治理文档默认双语维护，硬约束优先使用英文在前、中文在后。
- 术语、标识符、接口名、schema 字段、错误码、事件名与 commit 规范使用英文原名。
- 任何目录、依赖方向、公共接口或执行策略变化，都必须先更新对应文档或 ADR。
- 根 `AGENTS.md` 保持短小，子目录 `AGENTS.md` 只补本地特有约束，避免重复和规则噪音。
- `packages/contracts/generated/openapi/openapi.json`、`packages/contracts/generated/asyncapi/asyncapi.yaml` 与 `packages/contracts/src/__fixtures__/` 里的 expected artifacts 一起构成 Step 02 的契约真相面。

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

- 依赖边界由 `dependency-cruiser` 与 `eslint-plugin-boundaries` 双重约束。
- core-engine/domain 的纯度由 ESLint restricted rules 落地，必要时补 `Semgrep`。
- 契约层由 `zod`、OpenAPI 3.1、AsyncAPI 3.0、generated drift checks 与 fixture tests 收紧。
- replay 与确定性计划以 namespaced RNG、`MessagePack`、golden replays 与性质测试收紧。

## EN

### Core Principles

- Docs and contracts come before cross-layer implementation.
- Every implementation must obey state-machine rules, determinism, contract-first boundaries, layer isolation, and information-set filtering.
- Legacy code may be referenced, but it may not be imported or copied verbatim.
- Mechanically enforceable rules should move into tooling and CI first; details that cannot yet be enforced belong in `docs/`, with only a summary kept in `AGENTS.md`.
- Caches and build outputs such as `dist/`, `.turbo/`, `.next/`, and local `.vite` results are not source-of-truth artifacts and must not be committed. The only exception is the frozen contract output set under `packages/contracts/generated/**`, which must be committed and drift-checked together with schema changes.

### Frozen Dependency Matrix

- `packages/domain`: no workspace dependencies.
- `packages/contracts`: may depend only on `packages/domain`.
- `packages/core-engine`: may depend only on `packages/contracts` and `packages/domain`.
- `packages/adapters`: may depend only on `packages/contracts`, `packages/domain`, and `packages/core-engine`.
- `packages/application`: may depend on `packages/contracts`, `packages/domain`, `packages/core-engine`, plus `packages/adapters` only for session/bootstrap assembly.
- `packages/ui`: may depend only on `packages/contracts` and React.
- `apps/web` and `apps/desktop`: may depend only on `packages/application`, `packages/contracts`, and `packages/ui`.
- `apps/room-service`: may depend only on `packages/application`, `packages/contracts`, and `packages/adapters`.
- This matrix is enforced jointly by `dependency-cruiser` and `eslint-plugin-boundaries`; docs, code, and CI must all reflect it.

### Legacy History Policy

- The live legacy source tree was removed in `Step 08`; the surviving legacy reference entrypoints are `docs/99-legacy/` plus git history.
- New-architecture code may not reintroduce imports from, or verbatim copies of, pre-rebuild history.
- If legacy behavior is used as input, it must first be refactored into new domain, contract, or application-layer structures before entering the active architecture.

### Steps, Logs, and Commits

- Default to one step per commit, aligned with the boundaries in `docs/00-refactor/rebuild-execution-tracker.md`.
- Every step must maintain a matching log; status changes must close together with the log and commit boundary.
- Code-only progress without tracker/log updates is not allowed, and tracker-only progress without a step log is not allowed either.
- Commit messages should clearly express the step intent and must not mix unrelated steps into the same commit.

### Git and Release Policy

- Do not create or update git tags until `Step 08` is marked complete in the tracker.
- Pushes and merges are allowed, but tags may not be used as interim milestone or release signals.
- After `Step 08` closes, the repo is release-ready and future tag-based release flow is allowed, but Step 08 itself does not create tags.

### Worktree Hygiene and Drift Artifacts

- Before any edit, commit, PR, push, or merge, run `git status --short` and audit the current worktree.
- When uncommitted changes exist, classify them first:
    - intended work: real in-scope changes that should be validated and committed;
    - drift artifacts: non-source-of-truth changes caused by dev servers, builds, codegen, caches, editors, or platform behavior, which must be restored, deleted, ignored, or relocated to temp output.
- If a generator predictably emits non-source-of-truth files, the preferred order is:
    - redirect the output into an ignored path;
    - or emit into the repo `tmp/` directory or the system temp directory;
    - and delete those temporary artifacts after use.
- If a drift-prone output path is unavoidable and stable, update `.gitignore` or the generator destination instead of relying on manual cleanup at commit time.
- If a tracked file is rewritten by tooling but is not part of the intended truth surface for the change, it must be restored before commit.
- Commit boundaries require a clean worktree: no commit or PR may be created while leftover uncommitted, unexplained, or unclassified changes remain.
- The current `pnpm check-commit` + `.husky/pre-push` guardrail now covers at least:
    - no leftover uncommitted changes outside the staged set before commit / PR, and a fully clean worktree before push;
    - no known drift-prone generators writing non-source-of-truth output back into tracked paths.
- Later revisions can extend `pnpm check-commit` further, for example with more drift-prone tracked files or package-specific generator policies.

### Documentation and Naming Standards

- Core governance documents are bilingual by default, with hard constraints written English-first and Chinese-second.
- Terms, identifiers, interface names, schema fields, error codes, event names, and commit conventions stay in English.
- Any change to directories, dependency direction, public interfaces, or execution policy must update the matching docs or ADR first.
- Root `AGENTS.md` stays short, while subdirectory `AGENTS.md` files add only local constraints to reduce noise and repetition.
- `packages/contracts/generated/openapi/openapi.json`, `packages/contracts/generated/asyncapi/asyncapi.yaml`, and the expected artifacts under `packages/contracts/src/__fixtures__/` are part of the Step 02 contract truth surface.

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

- Dependency boundaries are enforced by `dependency-cruiser` and `eslint-plugin-boundaries`.
- Pure core restrictions for core-engine/domain are enforced through restricted ESLint rules, with `Semgrep` as a later extension if needed.
- Contract hardening is enforced around `zod`, OpenAPI 3.1, AsyncAPI 3.0, generated drift checks, and fixture tests.
- Replay and determinism hardening is planned around namespaced RNG, `MessagePack`, golden replays, and property tests.
