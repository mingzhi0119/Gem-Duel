# Gem Duel Agent Rules

## MUST / 必须

- Update `packages/contracts` and the matching docs before changing any cross-boundary behavior. 修改任何跨边界行为前，先更新 `packages/contracts` 与对应文档。
- Update `docs/` or an ADR before adding a new package, layer, dependency direction, or governance rule. 新增包、分层、依赖方向或治理规则前，先更新 `docs/` 或 ADR。
- Audit any pre-existing uncommitted changes before editing, committing, or opening a PR; classify them as intended work or drift artifacts, then restore, ignore, or relocate the drift before continuing. 在编辑、提交或开 PR 前，必须先审查现有未提交改动；将其区分为有效工作或漂移产物，并在继续前恢复、ignore 或迁移漂移。
- Keep imports within the frozen Step 02 matrix. 严格遵守 Step 02 冻结后的依赖矩阵。
  `domain` -> no workspace dependencies
  `contracts` -> `domain`
  `core-engine` -> `contracts`, `domain`
  `adapters` -> `contracts`, `domain`, `core-engine`
  `application` -> `contracts`, `domain`, `core-engine`, `adapters` (session/bootstrap only)
  `ui` -> `contracts`
  `apps/web` and `apps/desktop` -> `application`, `contracts`, `ui`
  `apps/room-service` -> `application`, `contracts`, `adapters`
- Keep `packages/core-engine` and `packages/domain` deterministic and driven only by explicit inputs, ports, and namespaced RNG streams. `packages/core-engine` 与 `packages/domain` 必须保持确定性，只能依赖显式输入、ports 和分域 RNG。
- Keep `apps/web`, `apps/desktop`, and `packages/ui` free of game-rule, scoring, Buff, and authority logic. `apps/web`、`apps/desktop` 与 `packages/ui` 不得承载规则、计分、Buff 或权威裁判逻辑。
- Keep `apps/web/app/api/*` limited to BFF, translation, aggregation, and orchestration; never place match resolution there. `apps/web/app/api/*` 只做 BFF、转换、聚合与编排，不得放对局裁决。
- Keep online authority in `apps/room-service`, but match truth must still come from the shared `packages/core-engine`. 在线权威放在 `apps/room-service`，但对局真相仍必须来自共享的 `packages/core-engine`。
- Treat legacy implementation history as read-only reference only through `docs/99-legacy/` and git history: never import it, never copy it verbatim, never promote it into active architecture. 仅可通过 `docs/99-legacy/` 与 git 历史把旧实现当作只读参考：禁止 import、禁止整段照抄、禁止直接升级为现行实现。
- Keep hard constraints bilingual with English first, while identifiers, schema fields, error codes, event names, and commit conventions stay English-only. 硬约束保持双语且英文在前；标识符、schema 字段、错误码、事件名与 commit 规范只用英文。
- Update the tracker, the matching step log, and the change boundary together whenever a rebuild step meaningfully changes. 任一重构步骤发生实质变化时，必须同步更新 tracker、对应 step log 与提交边界。

## SHOULD / 应当

- Prefer one small, intention-revealing change per step boundary. 每个步骤边界内优先做小而明确的变更。
- Add tests, replay samples, and contract examples together with new rules or protocol changes. 新规则或协议变化应同时补测试、replay 样例与契约示例。
- Prefer ignored paths or temporary directories for drift-prone generated outputs, and delete those temporary artifacts after use. 容易漂移的生成产物应优先写入已 ignore 的路径或临时目录，并在使用后及时删除。
- Put detailed process rules in `docs/` when they are not yet mechanically enforceable in CI. 尚未能在 CI 机械校验的细节规则，应沉到 `docs/`。
- Prefer the closest directory `AGENTS.md` for local constraints and keep root rules short. 本地约束优先写在最近目录的 `AGENTS.md`，根规则保持简洁。
- Prefer the matching project-local skill under `.codex/skills/` when a task fits an established workflow such as contract changes, phase transitions, legacy extraction, Buff additions, or replay golden maintenance. 当任务符合既有流程时，优先使用 `.codex/skills/` 中对应的项目本地 Skill，例如契约修改、phase 迁移、legacy 考古、Buff 新增或 golden replay 维护。

## INFO / 说明

- `AGENTS.md` is the short operational summary. Mechanically enforceable policy belongs in tooling and CI; longer rationale belongs in `docs/`. `AGENTS.md` 只保留操作摘要；可机械化规则应进入工具与 CI，详细理由放进 `docs/`。
- Subdirectory `AGENTS.md` files may tighten local constraints but must not weaken the root rules. 子目录 `AGENTS.md` 可以收紧本地约束，但不能削弱根规则。
- The live legacy source tree was removed in `Step 08`; surviving legacy reference now lives in `docs/99-legacy/` and git history. live legacy source tree 已在 `Step 08` 删除；现存 legacy 参考以 `docs/99-legacy/` 与 git 历史为准。

## COMMANDS / 命令

- Current validation: `pnpm lint`
- Current validation: `pnpm typecheck`
- Current validation: `pnpm test`
- Current validation: `pnpm build`
- Current validation: `pnpm check-deps`
- Current validation: `pnpm check-boundaries`
- Current validation: `pnpm check-commit`
- Current validation: `pnpm check-contracts`
- Current validation: `pnpm check-visual`
- Current generation: `pnpm contracts:generate`
- Current verification: `pnpm contracts:verify`
- Current docs reference: `docs/00-refactor/rebuild-execution-tracker.md`
- Planned guardrails for later steps: `pnpm check-replays`

## NEVER DO / 禁止

- Never reintroduce imports or verbatim code copy from pre-rebuild history into the active architecture. 禁止把重构前历史中的 import 或逐字代码复制重新带回现行架构。
- Never add hidden random sources such as `Math.random()`, `Date.now()`, `new Date()`, `performance.now()`, `lodash.shuffle`, `lodash.sample`, `lodash.sampleSize`, `array-shuffle`, `crypto.randomBytes`, or `Array.prototype.sort(() => Math.random() - 0.5)`. 禁止引入任何隐藏随机源，包括 `Math.random()`、`Date.now()`、`new Date()`、`performance.now()`、`lodash.shuffle`、`lodash.sample`、`lodash.sampleSize`、`array-shuffle`、`crypto.randomBytes` 与 `Array.prototype.sort(() => Math.random() - 0.5)`。
- Never add game-rule logic to `apps/web/app/api/*`. 禁止在 `apps/web/app/api/*` 中加入游戏规则逻辑。
- Never fork or reimplement `packages/core-engine` inside `apps/room-service`; only add authentication, persistence, broadcasting, idempotency, and rate limiting there. 禁止在 `apps/room-service` 中 fork 或重写 `packages/core-engine`；这里只允许增加认证、持久化、广播、幂等与限流。
- Never modify contracts without updating schema docs, error-code references, and the contract governance docs. 修改契约时，禁止跳过 schema 文档、错误码引用与契约治理文档。
- Never create or update git tags until final acceptance is closed in `docs/00-refactor/rebuild-execution-tracker.md`. 在 `docs/00-refactor/rebuild-execution-tracker.md` 标记最终验收完成前，禁止创建或更新 git tag。
- Never create a commit or PR while unrelated, unexplained, or drift-only changes remain uncommitted in the worktree. 禁止在工作树中仍有无关、未说明或仅属漂移的未提交改动时创建 commit 或 PR。

## PROOF OF DONE / 完成证明

- The relevant tracker row and step log reflect the change. 对应 tracker 行与 step log 已同步变化。
- The nearest `AGENTS.md` and the matching governance docs stay consistent. 最近目录的 `AGENTS.md` 与对应治理文档保持一致。
- Step 02 contract changes also pass `pnpm check-deps`, `pnpm check-boundaries`, and `pnpm check-contracts`. Step 02 的契约与边界改动还必须通过 `pnpm check-deps`、`pnpm check-boundaries` 与 `pnpm check-contracts`。
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass when the change requires validation. 需要校验时，`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 通过。
- Any planned mechanical guardrail affected by the change is documented in `docs/` even if the tool wiring lands later. 即使工具接线尚未落地，受影响的机械化护栏也已写入 `docs/`。
