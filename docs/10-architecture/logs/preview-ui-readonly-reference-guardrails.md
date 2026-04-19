# Preview UI Read-Only Reference Guardrails

Date: 2026-04-18

## ZH

### 范围

- 将根目录 `GemDuel-Dev/` 明确写成 preview UI workstream 的只读参考源：可以浏览、截图、对照实现方式，但不允许修改、不允许 import、不允许逐字搬运。
- 把这条纪律同步写入 root `AGENTS.md`、`.gitignore`、`eslint.config.mjs`、`docs/10-architecture/visual-productization-plan.md`、`docs/00-refactor/rebuild-execution-tracker.md` 和本日志目录入口。
- 这次只改治理 / 文档 / 配置文件，不触碰 `apps/`、`packages/` 源码、测试或 snapshot 产物。

### 落地结果

- `GemDuel-Dev/` 已加入根 `.gitignore`，并在 `eslint.config.mjs` 中增加了 import ban 与 ignore 规则，防止其被误当成活动源码。
- root `AGENTS.md` 现在同时约束 legacy 参考与 `GemDuel-Dev/` preview 参考：前者仅可通过 `docs/99-legacy/` 与 git 历史读取，后者仅可作为本地 preview 实现参考。
- `visual-productization-plan.md` 的参照物、硬边界、风险和参考列表已同步补上本地 preview reference 说明，明确“只读参考、不可修改、不可 import、不可 verbatim copy”。
- `rebuild-execution-tracker.md` 与 `logs/README.md` 已补上这次治理收口的引用，确保 tracker / log / plan 的边界描述一致。

### 变更文件

- `AGENTS.md`
- `.gitignore`
- `eslint.config.mjs`
- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/preview-ui-readonly-reference-guardrails.md`

## EN

### Scope

- Mark the root `GemDuel-Dev/` folder as the preview UI workstream's read-only reference source: it may be browsed, screenshotted, and used to study implementation shape, but it must not be modified, imported, or copied verbatim.
- Write that discipline into root `AGENTS.md`, `.gitignore`, `eslint.config.mjs`, `docs/10-architecture/visual-productization-plan.md`, `docs/00-refactor/rebuild-execution-tracker.md`, and this log index.
- This change only touches governance, docs, and config files; it does not touch `apps/`, `packages/` source, tests, or snapshots.

### Result

- `GemDuel-Dev/` is now ignored at the repo root, and `eslint.config.mjs` includes both an ignore rule and an import ban so it cannot be treated as active source.
- Root `AGENTS.md` now covers both legacy references and the `GemDuel-Dev/` preview reference: the former only through `docs/99-legacy/` and git history, the latter only as a local preview implementation reference.
- `visual-productization-plan.md` now states the local preview reference in the reference material, hard-boundary rules, risk table, and references list, making the read-only / no-import / no-verbatim-copy policy explicit.
- `rebuild-execution-tracker.md` and `logs/README.md` now point at this governance closeout so the tracker, log, and plan all describe the same boundary.

### Changed Files

- `AGENTS.md`
- `.gitignore`
- `eslint.config.mjs`
- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/preview-ui-readonly-reference-guardrails.md`
