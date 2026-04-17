# Engineering Standards

## ZH

### 核心原则

- 先文档/契约，后跨层实现。
- 任何实现都必须服从状态机、确定性、契约优先和边界隔离。
- legacy 代码只允许参考，不允许 import，不允许原样照抄。

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

### 文档规范

- 核心治理文档默认双语维护。
- 术语、接口名、错误码、事件名保留英文原名。
- 任何目录、依赖方向、公共接口或执行策略变化，都必须先更新对应文档或 ADR。

## EN

### Core Principles

- Docs and contracts come before cross-layer implementation.
- Every implementation must obey the state-machine, determinism, contract-first, and boundary-isolation rules.
- Legacy code may be referenced, but it may not be imported or copied verbatim.

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

### Documentation Standards

- Core governance documents are bilingual by default.
- Terms, interface names, error codes, and event names keep their English identifiers.
- Any change to directories, dependency direction, public interfaces, or execution policy must update the matching docs or ADR first.
