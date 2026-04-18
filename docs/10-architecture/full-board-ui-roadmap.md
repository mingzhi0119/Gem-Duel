# Full Board UI Audit and Roadmap

## ZH

### 文档定位

本文是 Opus 4.7 严格审计后的 full-board UI 整改主文档，用来统一记录：

- 当前“工程收口”与“产品完成”的边界；
- 审计发现与风险归属；
- 按 Phase 排序的整改路线图、前置门与完成标准；
- 已关闭 phase 的 digest 与日志入口；
- 仍未闭合的 hardening backlog。

### 审计结论（2026-04-18）

- Step 00-08 在工程边界上属于“强达成”。
- full-board roadmap 的 Phase 0-8 全部已关闭，local / AI / run / online room / replay / Desktop offline 均已收敛到共享主盘面与共享 shell。
- 后续工作全部转入“Remaining Hardening Backlog”，不再以 roadmap phase 的形态管理；当前仍开放的 backlog 仅剩 locale routing 与 Desktop packaging 决策。

### 独立审计签收（2026-04-18，Opus 4.7）

本轮独立审计对比 repo 证据与本文档声明，结论如下：

- `packages/application/src/index.ts` 现为 22 行 barrel，核心逻辑已拆入 `shared/`、`replay/`、`ai/`、`view-model/`、`sessions/`；Phase 1 / Phase 1a 的 blocking gate 确认关闭。
- `packages/ui/src/{board,hud,drawer,primitives,views,playground}` 提供 Phase 3 罗列的 14 个 shared primitives / sidecar，全部存在。
- `package.json` + `tools/` 暴露 `check-phase4`、`check-phase5`、`check-phase6`、`check-phase7`、`check-phase8` 与 `check-visual`；每个 gate 均有对应 Playwright spec（`apps/web/tests/phase{4..8}/*.spec.ts`）。
- 所有产品入口（`/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`）通过 `@gem-duel/ui` 的 `BoardScene` 渲染；`MatchView` 仅作为 `?shell=debug` 的 fallback 保留在 `SessionBoardShell`。
- Spectator 泄漏与 room-service fanout 均已具备机械化测试（`spectator-visibility.test.ts`、`apps/room-service/src/app.test.ts` 的 redaction 集成用例、`phase6/room-boardscene.spec.ts`）。
- Desktop 已落 `apps/desktop/src/{main.ts,web-runtime.ts,preload.cts}` 与 `check-phase8`，验证 loopback HTTP、preload bridge、`/_next/static/**` 同步与 classic-local 主盘面 smoke。
- `apps/web/app/page.tsx` 已降级为 validation-shell hero；`docs/40-operations/release-prep.md` 与 `docs/00-refactor/rebuild-execution-tracker.md` 的 post-Phase-8 wording 保持一致。

签收结论：roadmap 自述与 repo 实现之间不存在重大漂移，可以按“已归档”处理；后续治理转由 “Remaining Hardening Backlog” 驱动，其中 tooling/room/a11y hardening 已形成独立收口波次。

### 当前基线

- `packages/ui` 同时暴露 `MatchView` 与 `BoardScene`；`BoardScene` 覆盖产品默认面，`MatchView` 退化为 `?shell=debug` fallback。
- `/play/local`、`/play/ai`、active-match `/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`、Desktop shared shell 复用同一 shared board/runtime 边界。
- 默认入口与 replay 入口不再依赖 detached shell-only 主舞台。

### 不变约束

- `packages/ui` 只负责展示和交互回调，不承载规则、计分、Buff 或 authority 逻辑。
- `packages/application` 继续作为 view-model projection 边界；若盘面 UI 缺字段，先扩 projection / contracts，再做 renderer。
- `apps/web` 与 `apps/desktop` 只做壳层、路由、transport 和页面状态，不重算隐藏信息。
- `apps/room-service` 继续只下发 viewer-filtered snapshot 与 application-projected actions。
- 不引入第二套 desktop-specific gameplay renderer。
- 不导回 legacy code；旧版只作为视觉/交互意图参考，来源限定为 `docs/99-legacy/` 与 git history。

### 审计发现归属（全部关闭）

| Finding | 摘要                                                      | 关闭 Phase              |
| ------- | --------------------------------------------------------- | ----------------------- |
| F1      | `release-ready` 与“产品完成”口径混淆                      | Phase 0 + Phase 4       |
| F2      | Desktop shared shell 断言过满，offline bundle 未验证      | Phase 0 + Phase 8       |
| F3      | 枚举式 `UiActionDescriptor` 不适合多阶段盘面交互          | Phase 2 + Phase 4       |
| F4      | `UiViewModel` 缺盘面 presentation / viewer / session 字段 | Phase 2 + Phase 6       |
| F5      | step log / tracker 缺 acceptance evidence                 | Phase 0（持续治理继承） |
| F6      | `packages/application/src/index.ts` 巨文件                | Phase 1 + Phase 1a      |
| F7      | `packages/ui` 缺 layout / design tokens / visual harness  | Phase 2.5 + Phase 3     |
| F8      | spectator / resync / out-of-turn 一致性缺测试门禁         | Phase 6                 |
| F9      | 缺 classic local first 的玩家路径验收矩阵                 | Phase 4 + Phase 7       |
| F10     | AI 策略与本地 session 绑定过紧                            | Phase 1 + Phase 5       |
| F11     | 玩家首页仍暴露治理/调试口径                               | Phase 0 + Phase 4       |

### 已关闭 Phase 汇总（digest，详情见对应 log）

| Phase | 产出口径（1 行）                                                                                                                                                    | 关闭日期   | 主要日志                                                                                                                                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | 主页 / tracker / release-prep wording 降级到 validation shell，acceptance evidence 字段落地                                                                         | 2026-04-17 | [`logs/phase-0-wording-downgrade-and-entry-scope.md`](./logs/phase-0-wording-downgrade-and-entry-scope.md)                                                                                                                                        |
| 1     | `packages/application` 的仓库结构清理方向固定，barrel-only target 通过 Phase 1a 实现                                                                                | 2026-04-18 | [`logs/phase-1-application-ui-structure-kickoff.md`](./logs/phase-1-application-ui-structure-kickoff.md)                                                                                                                                          |
| 1a    | `packages/application/src/index.ts` 拆成 `shared/` + `replay/` + `ai/` + `view-model/` + `sessions/`，`index.ts` 回到 barrel（当前 22 行）                          | 2026-04-18 | [`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)                                                                                                                            |
| 2     | `UiViewModel v2` + engine-owned `pendingSelection` + `roomStatus` 作为 contract 基线；消费迁移留给 Phase 6                                                          | 2026-04-17 | [`logs/phase-2-contract-runtime-closure.md`](./logs/phase-2-contract-runtime-closure.md)（含 wave-1/2 + kickoff）                                                                                                                                 |
| 2.5   | `packages/ui` 拆出 board / drawer / hud / primitives / styles / tables / views，`tokens.css` 回收、`/playground` visual harness 落地，`check-visual` 接线           | 2026-04-17 | [`logs/phase-2.5-visual-harness-completion.md`](./logs/phase-2.5-visual-harness-completion.md)                                                                                                                                                    |
| 3     | 14 个 shared board primitives + `ReplayDrawer`、`AiTraceDrawer` 在 `packages/ui` 落地，`/playground/*` 覆盖 board/replay/ai-trace 视觉基线                          | 2026-04-17 | [`logs/phase-3-shared-board-primitives-completion.md`](./logs/phase-3-shared-board-primitives-completion.md)                                                                                                                                      |
| 4     | `/play/local` 切到 product-facing `BoardScene`、保留 `?shell=debug` fallback、8 条玩家路径 Playwright 自动化、`check-phase4` 成为 gate                              | 2026-04-18 | [`logs/phase-4-local-board-and-player-path-automation-completion.md`](./logs/phase-4-local-board-and-player-path-automation-completion.md)（见治理文档 [`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md)） |
| 5     | AI 策略拆成 `ai/heuristic` + `ai/turn-resolver`，`/play/ai` / `/play/run` 共享主盘面与固定 seed finalStateHash 基线，`check-phase5` 成为 gate                       | 2026-04-18 | [`logs/phase-5-ai-run-parity-completion.md`](./logs/phase-5-ai-run-parity-completion.md)                                                                                                                                                          |
| 6     | `/rooms/[roomId]` 迁到 shared `BoardScene`、spectator pending-selection redaction 为正式不变量、`check-phase6` 覆盖 room/spectator/out-of-turn 浏览器 gate          | 2026-04-18 | [`logs/phase-6-room-boardscene-and-spectator-gates-completion.md`](./logs/phase-6-room-boardscene-and-spectator-gates-completion.md)                                                                                                              |
| 7     | `/replays/[replayId]` 迁到 shared `BoardScene`、timeline/hash/键盘步进、bilingual 文案 catalog、replay desktop/mobile visual baseline                               | 2026-04-18 | [`logs/phase-7-replay-boardscene-and-product-finish-completion.md`](./logs/phase-7-replay-boardscene-and-product-finish-completion.md)                                                                                                            |
| 8     | Desktop 自动拉起 co-located Next standalone + 同步 `.next/static/**` + `preload.cjs`/`sandbox:false`，`check-phase8` 验证 Electron 启动、bridge、资源、主盘面 smoke | 2026-04-18 | [`logs/phase-8-desktop-offline-packaging-validation.md`](./logs/phase-8-desktop-offline-packaging-validation.md)                                                                                                                                  |

详细收口范围、冻结点、done criteria 以日志为准，本文不再重复抄录。

### 已关闭的 Hardening Wave（2026-04-18）

- Hardening Wave 1 已关闭以下 backlog 项，详见 [`logs/hardening-wave-1-standalone-room-visual-a11y.md`](./logs/hardening-wave-1-standalone-room-visual-a11y.md)：
    - Milestone K：visual baseline 改为平台无关 snapshot 命名，`check-visual` 在 CI 下禁止 `--update-snapshots`。
    - room-status cosmetic fanout 强一致：第二位玩家加入 / 离开后，剩余 bound player 的 badge 通过强一致广播立即更新。
    - `next start` 与 standalone warning：`check-phase4`、`check-phase5`、`check-phase6`、`check-phase7` 与 `check-visual` 已统一改走 standalone server。
    - axe-core / 全站 a11y harness：新增 `pnpm check-a11y`，覆盖 `/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]` 的 serious/critical 级别门禁。

### Remaining Hardening Backlog

以下为 Phase 0-8 关闭后仍需继续治理、但不再作为 roadmap phase 的事项：

1. **App-wide locale routing**
    - 现状：Phase 7 只把 replay/board-scene 文案外化成 bilingual catalog，仓库尚无 app-wide locale routing。
    - 期望：后续产品打磨时再决定是否升级到 locale-aware routing。
2. **Desktop packaging（签名 / 商店分发）**
    - 现状：Phase 8 只关闭“shared-shell offline runtime artifact”；未做签名、安装器或商店分发。
    - 期望：如未来需要独立分发，重新规划 packaging 工作，不要在 roadmap 之外私自扩大 Desktop 口径。

### 默认决策（历史保留）

- 默认继续复用 shared application/ui boundary，不新开 package，也不回退到页面内 rule-aware renderer。
- 默认视觉方向向 dark tactical dashboard 靠拢，而不是扩展当前白底调试布局。
- 默认保留 debug / replay / trace，但把它们放到 sidecar / drawer，而不是主舞台。

### 文档归档说明

- 本文自 2026-04-18 起作为“已关闭 roadmap 的 digest + remaining backlog”维护；不再回填 Phase-level `In Progress` 状态。
- 如需查阅当时具体的 plan / ADR / wave log，以 `docs/10-architecture/phase-*.md`、`docs/30-contracts/phase-2-uiviewmodel-2.0-*.md`、`docs/90-adr/ADR-0006-*.md` 与 `docs/10-architecture/logs/phase-*.md` 为权威来源。
- Phase 0-3 的独立审计见 [`full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md)。

## EN

### Document Role

This is the Opus 4.7-audited full-board UI remediation doc. After the 2026-04-18 sign-off it is maintained as a digest of closed phases plus a remaining-hardening backlog, not as an active phase backlog.

### Audit Summary (2026-04-18)

- Step 00-08 is a strong engineering closure.
- Full-board roadmap Phase 0-8 are all closed; local / AI / run / online room / replay / Desktop offline converge on the shared board surface and shared shell.
- Further work lives in “Remaining Hardening Backlog” rather than as roadmap phases; the only open backlog items are locale routing and Desktop packaging decisions.

### Independent Audit Sign-Off (2026-04-18, Opus 4.7)

Repo evidence cross-checked against this document:

- `packages/application/src/index.ts` is now a 22-line barrel; semantics live in `shared/`, `replay/`, `ai/`, `view-model/`, and `sessions/`. The Phase 1 / 1a blocking gate is confirmed closed.
- `packages/ui/src/{board,hud,drawer,primitives,views,playground}` provides all 14 shared primitives / sidecars listed in Phase 3.
- `package.json` + `tools/` expose `check-phase4`, `check-phase5`, `check-phase6`, `check-phase7`, `check-phase8`, and `check-visual`; each has matching Playwright specs under `apps/web/tests/phase{4..8}/*.spec.ts`.
- All product entrypoints (`/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]`) render through `@gem-duel/ui`'s `BoardScene`. `MatchView` only survives as the `?shell=debug` fallback inside `SessionBoardShell`.
- Spectator-leakage and room-service fanout are mechanically gated (`spectator-visibility.test.ts`, the redaction integration case in `apps/room-service/src/app.test.ts`, and `phase6/room-boardscene.spec.ts`).
- Desktop ships `apps/desktop/src/{main.ts,web-runtime.ts,preload.cts}` and `check-phase8` validates loopback HTTP, preload bridge, `/_next/static/**` sync, and a classic-local smoke path.
- `apps/web/app/page.tsx` is the downgraded validation-shell hero; `docs/40-operations/release-prep.md` and `docs/00-refactor/rebuild-execution-tracker.md` carry the matching post-Phase-8 wording.

Conclusion: there is no material drift between the doc and the repo. The roadmap is treated as archived; follow-up governance moves into the Remaining Hardening Backlog, with tooling/room/a11y hardening already closed as a separate wave.

### Current Baseline

- `packages/ui` still exposes both `MatchView` and `BoardScene`; `BoardScene` is the product-default surface and `MatchView` is only the `?shell=debug` fallback.
- `/play/local`, `/play/ai`, active-match `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]`, and the Desktop shared shell all reuse the same shared board/runtime boundary.
- The default player and replay entrypoints no longer rely on a detached shell-only stage.

### Invariants

- `packages/ui` remains presentation plus interaction callbacks only; it may not own rules, scoring, Buff, or authority logic.
- `packages/application` remains the view-model projection boundary; if the board UI is missing fields, projection/contracts must expand first and only then the renderer.
- `apps/web` and `apps/desktop` stay responsible for shell, routing, transport, and page state only; they may not reconstruct hidden information.
- `apps/room-service` continues to send viewer-filtered snapshots plus application-projected actions only.
- No separate desktop-specific gameplay renderer is introduced.
- No legacy code is imported back; the old product remains reference only through `docs/99-legacy/` plus git history.

### Findings Ownership (all closed)

| Finding | Summary                                                                 | Closing Phase             |
| ------- | ----------------------------------------------------------------------- | ------------------------- |
| F1      | `release-ready` is too easy to misread as product completion            | Phase 0 + Phase 4         |
| F2      | Desktop shared-shell claim is too strong; offline bundle unverified     | Phase 0 + Phase 8         |
| F3      | Enumerated `UiActionDescriptor` cannot fit multi-step board interaction | Phase 2 + Phase 4         |
| F4      | `UiViewModel` lacks board-presentation / viewer / session fields        | Phase 2 + Phase 6         |
| F5      | Step logs / tracker lacked acceptance-evidence anchors                  | Phase 0 (carried as rule) |
| F6      | `packages/application/src/index.ts` is a growth-blocking god file       | Phase 1 + Phase 1a        |
| F7      | `packages/ui` lacks layout / design tokens / visual harness             | Phase 2.5 + Phase 3       |
| F8      | Spectator / resync / out-of-turn consistency was not test-gated         | Phase 6                   |
| F9      | No classic-local player-path acceptance matrix                          | Phase 4 + Phase 7         |
| F10     | AI strategy was too tightly coupled to local session glue               | Phase 1 + Phase 5         |
| F11     | Player homepage still exposed governance/debug wording                  | Phase 0 + Phase 4         |

### Closed Phases Digest (see logs for detail)

| Phase | One-line result                                                                                                                                                                                                                                    | Closed     | Main Log                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 0     | Homepage / tracker / release-prep downgraded to validation-shell wording, acceptance-evidence fields landed                                                                                                                                        | 2026-04-17 | [`logs/phase-0-wording-downgrade-and-entry-scope.md`](./logs/phase-0-wording-downgrade-and-entry-scope.md)                                 |
| 1     | `packages/application` cleanup direction frozen, barrel-only goal delivered via Phase 1a                                                                                                                                                           | 2026-04-18 | [`logs/phase-1-application-ui-structure-kickoff.md`](./logs/phase-1-application-ui-structure-kickoff.md)                                   |
| 1a    | `packages/application/src/index.ts` split into `shared/` + `replay/` + `ai/` + `view-model/` + `sessions/`, `index.ts` now 22 lines                                                                                                                | 2026-04-18 | [`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)                     |
| 2     | `UiViewModel v2` + engine-owned `pendingSelection` + `roomStatus` frozen as the contract baseline; consumer migration deferred to Phase 6                                                                                                          | 2026-04-17 | [`logs/phase-2-contract-runtime-closure.md`](./logs/phase-2-contract-runtime-closure.md) (plus kickoff / wave-1 / wave-2 logs)             |
| 2.5   | `packages/ui` split into board / drawer / hud / primitives / styles / tables / views, `tokens.css` pulled back, `/playground` visual harness live, `check-visual` wired                                                                            | 2026-04-17 | [`logs/phase-2.5-visual-harness-completion.md`](./logs/phase-2.5-visual-harness-completion.md)                                             |
| 3     | 14 shared board primitives + `ReplayDrawer` / `AiTraceDrawer` land in `packages/ui`; `/playground/*` covers board/replay/ai-trace visual baselines                                                                                                 | 2026-04-17 | [`logs/phase-3-shared-board-primitives-completion.md`](./logs/phase-3-shared-board-primitives-completion.md)                               |
| 4     | `/play/local` on product-facing `BoardScene`, `?shell=debug` fallback retained, 8-path Playwright automation, `check-phase4` as gate (see governance doc [`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md)) | 2026-04-18 | [`logs/phase-4-local-board-and-player-path-automation-completion.md`](./logs/phase-4-local-board-and-player-path-automation-completion.md) |
| 5     | AI strategy split into `ai/heuristic` + `ai/turn-resolver`; `/play/ai` / `/play/run` share the main board with fixed-seed `finalStateHash` baselines; `check-phase5` gate                                                                          | 2026-04-18 | [`logs/phase-5-ai-run-parity-completion.md`](./logs/phase-5-ai-run-parity-completion.md)                                                   |
| 6     | `/rooms/[roomId]` on shared `BoardScene`; spectator pending-selection redaction is a formal invariant; `check-phase6` covers room/spectator/out-of-turn browser gate                                                                               | 2026-04-18 | [`logs/phase-6-room-boardscene-and-spectator-gates-completion.md`](./logs/phase-6-room-boardscene-and-spectator-gates-completion.md)       |
| 7     | `/replays/[replayId]` on shared `BoardScene`; controlled timeline + hash + keyboard stepping + bilingual catalog + replay desktop/mobile visual baselines                                                                                          | 2026-04-18 | [`logs/phase-7-replay-boardscene-and-product-finish-completion.md`](./logs/phase-7-replay-boardscene-and-product-finish-completion.md)     |
| 8     | Desktop auto-starts co-located Next standalone + syncs `.next/static/**` + `preload.cjs` / `sandbox:false`; `check-phase8` validates Electron startup, bridge, assets, and main-board smoke                                                        | 2026-04-18 | [`logs/phase-8-desktop-offline-packaging-validation.md`](./logs/phase-8-desktop-offline-packaging-validation.md)                           |

Closure scope, freeze points, and done criteria stay authoritative in each log. They are not re-copied here.

### Closed Hardening Wave (2026-04-18)

- Hardening Wave 1 closes the following backlog items; see [`logs/hardening-wave-1-standalone-room-visual-a11y.md`](./logs/hardening-wave-1-standalone-room-visual-a11y.md):
    - Milestone K: visual baselines now use platform-agnostic snapshot names, and `check-visual` blocks `--update-snapshots` in CI.
    - Room-status cosmetic fanout consistency: when the second player joins or leaves, the remaining bound player’s badge now updates through a strongly consistent broadcast.
    - `next start` versus standalone warnings: `check-phase4`, `check-phase5`, `check-phase6`, `check-phase7`, and `check-visual` now boot through the standalone server path.
    - axe-core / repo-wide a11y harness: `pnpm check-a11y` now gates serious/critical violations across `/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, and `/replays/[replayId]`.

### Remaining Hardening Backlog

After Phase 0-8 closure the following items still need follow-up but are no longer roadmap phases:

1. **App-wide locale routing**
    - Current: Phase 7 externalized only replay/board-scene copy into a bilingual catalog; the repo has no app-wide locale routing yet.
    - Target: decide whether the next product polish pass upgrades to locale-aware routing.
2. **Desktop packaging (signing / store distribution)**
    - Current: Phase 8 closes only the shared-shell offline runtime artifact; no signed installer or store package exists.
    - Target: plan a dedicated packaging workstream if distribution is ever required, and do not expand Desktop claims outside this roadmap without it.

### Default Decisions (historical)

- Continue reusing the shared application/ui boundary; do not add a new package or return to page-local rule-aware renderers.
- Default the visual direction toward a dark tactical dashboard rather than extending the current white debug layout.
- Keep debug / replay / trace tooling, but move it into sidecar / drawer surfaces instead of the main stage.

### Archive Notice

- From 2026-04-18 onward this document is maintained as a digest of closed phases plus a remaining-hardening backlog; it is no longer reopened to `In Progress` at the phase level.
- For the original plans / ADRs / wave logs, treat `docs/10-architecture/phase-*.md`, `docs/30-contracts/phase-2-uiviewmodel-2.0-*.md`, `docs/90-adr/ADR-0006-*.md`, and `docs/10-architecture/logs/phase-*.md` as authoritative.
- The independent Phase 0-3 audit lives in [`full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md).
