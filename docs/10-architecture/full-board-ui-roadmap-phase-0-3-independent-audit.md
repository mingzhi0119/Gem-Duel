# Full-Board UI Roadmap Phase 0-3 Independent Audit

## ZH

### 文档定位

本文用于把最新一轮 Phase 0-3 独立审计正式落入 `docs/`。它不是原始审计文本的逐字归档，而是一次 **repo-verified disposition** 落库：

- 保留审计结论与治理价值；
- 对照当前仓库事实确认哪些 finding 被接受、哪些需要按事实调整、哪些已被代码证伪；
- 把每条 finding 映射到具体的文档动作与后续治理步骤。

### 执行摘要

- 路线图本身依然成立，Phase 2 / 2.5 / 3 的 contract、runtime、primitives、playground 与 `check-visual` 管线都是可验证产物。
- 当前最主要的治理偏差不是“路线图错误”，而是 **路线图状态与实际落地顺序脱节**：
    - `packages/ui` 结构拆分已通过 Phase 2.5 / 3 间接落地；
    - `packages/application/src/index.ts` 仍是单文件，且当前实测为 **1470 行**；
    - 这意味着原本应在 Phase 2 前完成的 Phase 1，已经变成 Phase 4 前的 blocking cleanup gate。
- 文档治理必须同时做到两件事：
    - 纠正 Phase 1 / 2 / 3 的状态口径；
    - 把这轮审计中仍然成立的高价值治理动作，明确收敛成可执行 backlog。
- 例外说明：`UiSessionStatus = 'replay'` **已有 producer**，因此不再作为本轮 remediation item，只作为“上一轮审计结论已过时”的归档案例。

### Repo-Verified Disposition

| Audit Finding | Original Claim                                                                 | Disposition                     | Repo Evidence                                                                                                                                                                                                                                                     | Docs Action                                                                                         | Follow-up Governance Action                                                                                                     |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| F-A           | Phase 1 被实质跳过，`packages/application/src/index.ts` 从 949 增长到 1470 行  | `Accepted`                      | `packages/application/src/index.ts` 当前实测为 1470 行；`docs/10-architecture/logs/phase-1-application-ui-structure-kickoff.md` 仍写“尚未开始实际文件拆分”                                                                                                        | 将 Phase 1 改为 `Delayed / At Risk`，明确写出 `packages/ui` 已间接落地但 `application` split 未完成 | 新增 `Phase 1a - Application Emergency Split` 作为 Phase 4 前置门；并写明新增 projection 代码不得继续回写 `index.ts`            |
| F-B           | Phase 3 的 visual evidence 近似“先重录再比对”的自验恒等式                      | `Accepted`                      | `docs/10-architecture/logs/phase-3-shared-board-primitives-completion.md` 当前同时记录 `pnpm check-visual -- --update-snapshots` 与 `pnpm check-visual`；`apps/web/tests/visual/playground.spec.ts-snapshots` 仅有 `*-win32.png`                                  | 在 Phase 3 completion log 加入 `Evidence Caveat` 与分离后的 validation 结构                         | 在 visual-governance backlog 中规划：CI 禁止 `--update-snapshots`；baseline 平台固定为单一策略；screenshot 更新附 diff 审核说明 |
| F-C           | Phase 2 实际已完成 contract/runtime 目标，但状态仍写 `In Progress`             | `Accepted`                      | `docs/90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`、`docs/30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`、`packages/contracts/src/ui.ts`、`packages/application/src/index.ts`、`packages/core-engine/src/classic-transitions.ts` | 将 Phase 2 改为 `Closed (contract/runtime); UI consumer migration deferred to Phase 6`              | 在 roadmap 中补“冻结点说明”：`UiViewModel v2`、`pendingSelection`、`roomStatus` additive contract                               |
| F-D           | `BoardSceneScaffold` 含 developer-facing 调试文案，未来可能泄漏到玩家视图      | `Accepted`                      | `packages/ui/src/board/board-scaffold.tsx` 仍包含 “Board Scaffold” 与 “Phase 3 shared primitives…” 文案                                                                                                                                                           | 作为 Phase 3 completion 后的 leakage backlog 记录，不伪装成已修复                                   | 进入 small leakage fixes backlog：将调试文案外移为 prop，由 playground host 注入                                                |
| F-E           | playground fixtures 手造 `UiViewModel`，未走 schema 校验                       | `Accepted`                      | `apps/web/app/playground/scene-fixtures.tsx` 存在 `createViewModel()`，当前未调用 `UiViewModelSchema.parse()`                                                                                                                                                     | 在独立审计文档与 roadmap backlog 中记录为 hardening 项                                              | 进入 small leakage fixes backlog：在 fixture builder 或页面层增加 schema parse                                                  |
| F-F           | `UiSessionStatus = 'replay'` 当前无 producer                                   | `Disproven as remediation item` | `packages/application/src/index.ts` 已在 `snapshot.context.phase === 'replay'                                                                                                                                                                                     |                                                                                                     | snapshot.replayCursor !== null`时返回`'replay'`；`packages/contracts/src/ui.ts` 已声明该枚举值                                  | 在 docs 中明确此 finding 已过时，不进入 remediation backlog | 无；仅保留为审计 delta 归档案例，避免未来再把它当未解决问题重复记账 |
| F-G           | style ownership 需要机械化确认，而不仅依赖 playground 在 `apps/web` 下渲染成功 | `Accepted as hardening backlog` | `packages/ui/src/board/*` 与 `packages/ui/src/playground/*` 持续使用 `gd-*` class；当前尚无“class 使用必须在 `packages/ui/src/styles` 定义”的机械化检查                                                                                                           | 在 docs 中写入 style-ownership hardening 计划，而不宣称已有 breakage 被证明                         | 进入 small leakage fixes backlog：新增 regex/lint 风格 ownership 校验                                                           |
| F-H           | Phase 4 player-path matrix 还没有脚本化三元组定义                              | `Accepted`                      | `docs/10-architecture/full-board-ui-roadmap.md` 当前列出玩家路径，但未冻结 `seed / starting snapshot / expected finalStateHash`                                                                                                                                   | 在 roadmap 的 Phase 4 输出中补上三元组冻结要求                                                      | 将 player-path matrix 前置到 Phase 4 preflight，E2E 与人工验收共享同一组三元组                                                  |

### 治理步骤与后续 Backlog

#### Milestone A - 锁定事实状态与 Phase 口径（docs-only）

- 落本独立审计文档，明确 `accepted / adjusted / disproven`。
- 将 Phase 1 改为 `Delayed / At Risk`。
- 将 Phase 2 改为 `Closed (contract/runtime); UI consumer migration deferred to Phase 6`。
- 将 Phase 3 保持 `Completed`，但增加 evidence caveat。
- 明确写出：F-F 不进入 remediation backlog；Phase 1a 是 Phase 4 的 blocking gate。

#### Milestone B - Phase 1a: Application Emergency Split（planned, not landed）

- 目标：只拆 `packages/application/src/index.ts`，不改合约、不改行为。
- 强制拆出的模块：
    - `sessions`
    - `view-model/projection`
    - `ai`
    - `replay-inspector`
    - `effect-prompt / selection helpers`
- `index.ts` 目标收敛到 **300 行以内**，仅保留 orchestration 与 barrel。
- 在 Phase 1a 完成前，任何新增 projection/helper 代码只能进入新模块，不得继续追加到 `index.ts`。

#### Milestone C - Phase 4 Preflight（planned, not landed）

- 在 roadmap 或专门文档中冻结 player-path matrix 的三元组：
    - `seed`
    - `starting snapshot / fixture`
    - `expected finalStateHash`
- E2E 与人工验收共享同一组三元组，避免两套标准。

#### Milestone D - Phase 6 Preflight（planned, not landed）

- 将 spectator invariants 明文化为待实现 property-test contract：
    - 不泄漏 `hiddenState`
    - 不泄漏 `deckOrder`
    - 不泄漏对手 reserve card face
    - 不泄漏对手 `pendingSelection`

#### Milestone E - Visual Governance Hardening（planned, not landed）

- `playwright.config.ts` 需要固定 snapshot 路径策略，避免平台后缀让门禁失效。
- `tools/check-visual.mjs` 需要在 CI 环境禁止 `--update-snapshots` 透传。
- screenshot baseline 更新必须附带 diff 审核说明。

#### Milestone F - Small Leakage Fixes（planned, not landed）

- 将 `BoardSceneScaffold` 的调试文案外移为 prop。
- 让 playground fixture 走 `UiViewModelSchema.parse()`。
- 为 `packages/ui` 增加 style-ownership 机械化校验。

### Planned Tool / Interface Changes（Not Landed）

- `playwright.config.ts` 的 snapshot path policy 需要明确固定平台策略，但本次 docs pass 不修改配置。
- `tools/check-visual.mjs` 需要增加 CI guard，但本次 docs pass 不修改脚本。
- playground fixture 需要补 schema parse，但本次 docs pass 不改 `apps/web/app/playground/scene-fixtures.tsx`。
- 本次 docs/governance pass **不修改任何公共 API、schema、wire contract 或 TypeScript 类型**。

## EN

### Document Role

This document lands the latest independent Phase 0-3 audit into `docs/`. It is not a verbatim archive of the raw audit text; it is a **repo-verified disposition** pass that:

- keeps the audit conclusions and governance value;
- checks each finding against the current repository state to decide whether it is accepted, adjusted, or disproven;
- maps every finding to concrete documentation updates and follow-up governance work.

### Executive Summary

- The roadmap itself still holds up. The Phase 2 / 2.5 / 3 contract, runtime, primitive, playground, and `check-visual` surfaces are real landed artifacts.
- The main governance drift is no longer “the roadmap is wrong” but **the roadmap status now diverges from the actual landing order**:
    - the `packages/ui` structure cleanup has effectively landed indirectly through Phase 2.5 / 3;
    - `packages/application/src/index.ts` is still a single file and currently measures **1470 lines**;
    - the original Phase 1 expectation has therefore turned into a blocking cleanup gate before Phase 4 rather than a normal earlier milestone.
- The documentation pass must do two things at once:
    - correct the Phase 1 / 2 / 3 status wording;
    - convert the still-valid audit findings into a concrete governance backlog.
- Exception note: `UiSessionStatus = 'replay'` **already has a producer**, so it is no longer treated as a remediation item in this pass and is recorded only as an outdated prior-audit claim.

### Repo-Verified Disposition

| Audit Finding | Original Claim                                                                                                | Disposition                     | Repo Evidence                                                                                                                                                                                                                                                                                     | Docs Action                                                                                                                          | Follow-up Governance Action                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-A           | Phase 1 was effectively skipped and `packages/application/src/index.ts` grew from 949 to 1470 lines           | `Accepted`                      | `packages/application/src/index.ts` currently measures 1470 lines; `docs/10-architecture/logs/phase-1-application-ui-structure-kickoff.md` still says no real file split has landed                                                                                                               | Reword Phase 1 to `Delayed / At Risk`, making it explicit that `packages/ui` landed indirectly while the `application` split did not | Add `Phase 1a - Application Emergency Split` as a pre-Phase-4 gate; state that no new projection code may go back into `index.ts`                         |
| F-B           | Phase 3 visual evidence behaves like “re-record then compare” and therefore weakens regression proof          | `Accepted`                      | `docs/10-architecture/logs/phase-3-shared-board-primitives-completion.md` currently records both `pnpm check-visual -- --update-snapshots` and `pnpm check-visual`; `apps/web/tests/visual/playground.spec.ts-snapshots` contains only `*-win32.png`                                              | Add an `Evidence Caveat` and a split validation structure to the Phase 3 completion log                                              | Put visual-governance hardening into backlog: disallow `--update-snapshots` in CI, pin one baseline-platform policy, require screenshot-diff review notes |
| F-C           | Phase 2 is effectively complete for contract/runtime work, but still marked `In Progress`                     | `Accepted`                      | `docs/90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`, `docs/30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`, `packages/contracts/src/ui.ts`, `packages/application/src/index.ts`, and `packages/core-engine/src/classic-transitions.ts` all show the landed surface | Reword Phase 2 to `Closed (contract/runtime); UI consumer migration deferred to Phase 6`                                             | Add a freeze-point note covering `UiViewModel v2`, `pendingSelection`, and `roomStatus` additive contract                                                 |
| F-D           | `BoardSceneScaffold` still contains developer-facing text that could leak into player-facing reuse later      | `Accepted`                      | `packages/ui/src/board/board-scaffold.tsx` still renders “Board Scaffold” and “Phase 3 shared primitives…” copy                                                                                                                                                                                   | Record it as a post-Phase-3 leakage backlog item rather than pretending it is fixed                                                  | Put it into the small-leakage backlog: move debug wording behind a prop injected only by the playground host                                              |
| F-E           | The playground fixtures hand-build `UiViewModel` values without schema validation                             | `Accepted`                      | `apps/web/app/playground/scene-fixtures.tsx` has `createViewModel()` and currently does not call `UiViewModelSchema.parse()`                                                                                                                                                                      | Record it as a hardening item in the audit and roadmap backlog                                                                       | Put it into the small-leakage backlog: add schema parsing in the fixture builder or page host                                                             |
| F-F           | `UiSessionStatus = 'replay'` has no current producer                                                          | `Disproven as remediation item` | `packages/application/src/index.ts` already returns `'replay'` when `snapshot.context.phase === 'replay'` or `snapshot.replayCursor !== null`; `packages/contracts/src/ui.ts` already declares the enum value                                                                                     | Explicitly document that this finding is outdated and excluded from the remediation backlog                                          | None; keep it only as an audit-delta archive case so it is not re-filed as unresolved later                                                               |
| F-G           | Style ownership still needs mechanical verification instead of relying on `apps/web`-hosted rendering success | `Accepted as hardening backlog` | `packages/ui/src/board/*` and `packages/ui/src/playground/*` still rely on `gd-*` classes; there is no current guard proving every used class is defined inside `packages/ui/src/styles`                                                                                                          | Record the need for style-ownership hardening in docs without claiming proven breakage                                               | Put it into the small-leakage backlog: add regex/lint-based style-ownership verification                                                                  |
| F-H           | Phase 4 player-path matrix still lacks a scriptable triad definition                                          | `Accepted`                      | `docs/10-architecture/full-board-ui-roadmap.md` lists player paths but does not yet freeze `seed / starting snapshot / expected finalStateHash`                                                                                                                                                   | Add the triad-freeze requirement to the Phase 4 roadmap outputs                                                                      | Move the player-path matrix into a formal Phase 4 preflight so E2E and manual acceptance share one source of truth                                        |

### Governance Steps and Backlog

#### Milestone A - Lock the factual state and phase wording (docs-only)

- Land this independent audit document with explicit `accepted / adjusted / disproven` disposition.
- Reword Phase 1 to `Delayed / At Risk`.
- Reword Phase 2 to `Closed (contract/runtime); UI consumer migration deferred to Phase 6`.
- Keep Phase 3 as `Completed` while adding an evidence caveat.
- State clearly that F-F is not a remediation item and that Phase 1a is a blocking gate for Phase 4.

#### Milestone B - Phase 1a: Application Emergency Split (planned, not landed)

- Goal: split only `packages/application/src/index.ts` without changing contracts or behavior.
- Mandatory target modules:
    - `sessions`
    - `view-model/projection`
    - `ai`
    - `replay-inspector`
    - `effect-prompt / selection helpers`
- Target `index.ts` size: **under 300 lines**, limited to orchestration and barrel exports.
- Until Phase 1a lands, any new projection/helper code must go into new modules rather than back into `index.ts`.

#### Milestone C - Phase 4 Preflight (planned, not landed)

- Freeze the player-path matrix triad in the roadmap or a dedicated doc:
    - `seed`
    - `starting snapshot / fixture`
    - `expected finalStateHash`
- E2E and manual acceptance must share the same triad set.

#### Milestone D - Phase 6 Preflight (planned, not landed)

- Write the spectator invariants as an explicit future property-test contract:
    - no `hiddenState` leakage
    - no `deckOrder` leakage
    - no opponent reserve-card face leakage
    - no opponent `pendingSelection` leakage

#### Milestone E - Visual Governance Hardening (planned, not landed)

- `playwright.config.ts` needs an explicit snapshot-path strategy so platform suffixes do not silently weaken the gate.
- `tools/check-visual.mjs` needs a CI guard against `--update-snapshots`.
- Screenshot-baseline updates must carry reviewed diff notes.

#### Milestone F - Small Leakage Fixes (planned, not landed)

- Move `BoardSceneScaffold` debug wording behind a prop.
- Add `UiViewModelSchema.parse()` to the playground fixture path.
- Add a mechanical style-ownership check for `packages/ui`.

### Planned Tool / Interface Changes (Not Landed)

- The snapshot-path policy in `playwright.config.ts` needs tightening, but this docs pass does not edit config.
- `tools/check-visual.mjs` needs a CI guard, but this docs pass does not edit the script.
- The playground fixture path needs schema parsing, but this docs pass does not edit `apps/web/app/playground/scene-fixtures.tsx`.
- This docs/governance pass **does not modify any public API, schema, wire contract, or TypeScript type**.
