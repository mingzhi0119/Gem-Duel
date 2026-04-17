# Gem Duel Agent Rules

## ZH

- 先契约后实现：任何跨边界接口改动必须先更新 `packages/contracts`、相关文档和错误码说明，再修改实现。
- 先文档后跨层：任何新增应用、包、目录或公共依赖方向之前，先更新 `docs/` 中对应的架构文档或 ADR。
- UI 不得承载规则：`apps/web`、`apps/desktop`、`packages/ui` 禁止新增任何游戏规则、胜负条件、Buff 结算或联机裁判逻辑。
- Next 路由不得承载领域逻辑：`apps/web/app/api/*` 只能做 BFF、代理、聚合和输入输出转换，不能直接计算对局状态。
- 核心引擎必须确定性：`packages/core-engine` 和 `packages/domain` 禁止 `Math.random()`、`Date.now()`、网络请求、数据库访问、浏览器 API、Electron API。
- 任何新规则必须附测试：新增 phase、command、event、Buff、回放字段时，必须补状态机测试、契约测试和至少一个回放样例。
- 任何跨包 import 必须遵守单向依赖：`contracts/domain -> core-engine -> application -> adapters -> apps/ui`，不得反向依赖。
- 禁止直接复用 legacy 实现：`old/legacy-vite-electron/` 只作为人工参考，不得被新代码 import，不得整段照抄，必须经过重构后才能进入新架构。
- `old/legacy-vite-electron/` 在 `Step 08` 完成前不得删除、不得挪作新实现目录。
- 每个重构步骤都必须同步维护步骤总表、对应日志和提交信息；状态变更不得脱离文档单独发生。
- 默认一小步一提交，提交粒度与 `docs/00-refactor/rebuild-execution-tracker.md` 中的步骤边界对齐。
- 重构完成前禁止创建或更新 git tag；允许 Push 和 Merge，但不得以 tag 作为阶段性交付标记。
- 默认小步提交：一次修改只覆盖一个明确子目标，文档、契约、代码、测试需要同步收口。
- 双语文档同步：新增或修改核心文档时，必须同时维护 ZH 与 EN 段落，术语保留英文原名。

## EN

- Contracts before implementation: any cross-boundary API change must update `packages/contracts`, docs, and error-code references before implementation code changes.
- Docs before cross-layer changes: any new app, package, folder, or shared dependency direction requires a matching architecture doc or ADR update first.
- UI may not own rules: `apps/web`, `apps/desktop`, and `packages/ui` must not contain game rules, victory conditions, buff resolution, or online authority logic.
- Next routes may not own domain logic: `apps/web/app/api/*` is limited to BFF, proxying, aggregation, and IO translation.
- The core engine must remain deterministic: `packages/core-engine` and `packages/domain` may not use `Math.random()`, `Date.now()`, network IO, database IO, browser APIs, or Electron APIs.
- Every new rule needs tests: any new phase, command, event, buff, or replay field requires state-machine tests, contract tests, and at least one replay example.
- Cross-package imports must stay one-way: `contracts/domain -> core-engine -> application -> adapters -> apps/ui`, never the reverse.
- Do not reuse legacy implementation directly: `old/legacy-vite-electron/` is read-only reference only, may not be imported, and may not be copied verbatim into the new architecture.
- `old/legacy-vite-electron/` may not be deleted before `Step 08` is completed.
- Every refactor step must update the execution tracker, the matching step log, and the commit boundary together.
- Default to one small step per commit, aligned with `docs/00-refactor/rebuild-execution-tracker.md`.
- Do not create or update git tags before the rebuild is complete; pushing and merging are allowed, but tags may not represent interim milestones.
- Prefer small, intention-revealing changes: each change should close on docs, contracts, implementation, and tests together.
- Keep core docs bilingual: when updating governance or architecture docs, update both ZH and EN sections in the same file.
