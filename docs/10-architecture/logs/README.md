# Architecture Phase Logs

## ZH

本目录记录 `docs/10-architecture/full-board-ui-roadmap.md` 的各 Phase 落地日志、Phase 关闭后的 hardening wave 收口日志、并行 visual productization 轨道的 `visual-v*` 日志，以及后续 target-first play-interface 波次的独立落地日志。

- 每次完成一个 roadmap phase，必须补对应日志，并把 roadmap 状态同步改为 `Completed` 或等价完成标记。
- 日志应记录：日期、范围、落地结果、涉及文件、剩余风险与验证结果。
- 若 phase 只完成部分输出，必须明确列出未完成项，不得提前标记为完成。

### 当前日志

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 口径降级、发布边界与首页验证壳文案收口
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 启动日志，现含独立审计后的 delayed/at-risk addendum、历史 god file 风险与临时增量规则
- [`phase-1a-application-emergency-split-completion.md`](./phase-1a-application-emergency-split-completion.md): Phase 1a 完成日志，记录 application emergency split 关闭与 barrel 化结果
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 启动日志，确认 ADR 前置门、`UiViewModel` 2.0 contract prep 与后续迁移顺序
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 第一轮 ADR + `UiViewModel` 2.0 contract/projection 落地日志
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 第二轮落地日志，记录引擎拥有的 pending-selection command/snapshot/projection surface
- [`phase-2-contract-runtime-closure.md`](./phase-2-contract-runtime-closure.md): Phase 2 关闭日志，确认 `UiViewModel v2`、`pendingSelection`、`roomStatus` additive contract 已关闭为 contract/runtime 基线，并把 shared BoardScene consumer migration 移交给 Phase 6
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 启动日志，确认 `packages/ui` layout、tokens 与 visual harness 的治理入口
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 第一轮落地日志，记录 `packages/ui` 目录拆分、shared-style ownership 与 `/playground` 基线
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 完成日志，记录多 scene playground、`pnpm check-visual` 与 committed screenshot baselines
- [`phase-3-shared-board-primitives-wave-1.md`](./phase-3-shared-board-primitives-wave-1.md): Phase 3 第一波日志，记录 shared board primitives 的落地结果、剩余缺口与 visual baseline 更新
- [`phase-3-shared-board-primitives-completion.md`](./phase-3-shared-board-primitives-completion.md): Phase 3 完成日志，现含 rebaseline vs final regression 的分离验证记录与 `*-win32.png` evidence caveat
- [`phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./phase-4-preflight-acceptance-matrix-and-scenario-harness.md): Phase 4 Gate 2 preflight 日志，记录 acceptance matrix、`/play/local?scenario=` 启动面与 `pnpm check-phase4`
- [`phase-4-boardscene-local-default-wave-1.md`](./phase-4-boardscene-local-default-wave-1.md): Phase 4 Gate 3 日志，记录 `/play/local` 切到 `BoardScene`、debug fallback 保留与 unique-action affordance 映射
- [`phase-4-local-board-and-player-path-automation-completion.md`](./phase-4-local-board-and-player-path-automation-completion.md): Phase 4 完成日志，记录 8 条玩家路径自动化闭环、local board baseline 与 final regression evidence
- [`phase-5-ai-run-parity-wave-1.md`](./phase-5-ai-run-parity-wave-1.md): Phase 5 第一波日志，记录 `/play/ai` 与 `/play/run` 收敛到 shared `BoardScene` 主盘面，以及 `pnpm check-phase5` parity gate
- [`phase-5-ai-run-parity-wave-2.md`](./phase-5-ai-run-parity-wave-2.md): Phase 5 第二波日志，记录 AI turn resolver 抽离、固定 seed / `finalStateHash` 基线与 application seam 的 deterministic gate
- [`phase-5-ai-run-parity-completion.md`](./phase-5-ai-run-parity-completion.md): Phase 5 完成日志，记录 AI/run 主盘面 parity 收口、固定 seed/hash 基线冻结与 Phase 4 回归继续通过
- [`phase-6-room-boardscene-and-spectator-gates-completion.md`](./phase-6-room-boardscene-and-spectator-gates-completion.md): Phase 6 完成日志，记录 `/rooms/[roomId]` 切到 shared `BoardScene`、spectator pending-selection redaction、`check-phase6` 与 resync/越权门禁
- [`phase-7-replay-boardscene-and-product-finish-completion.md`](./phase-7-replay-boardscene-and-product-finish-completion.md): Phase 7 完成日志，记录 `/replays/[replayId]` 复用 shared `BoardScene`、timeline/hash/keyboard/i18n 收口与 replay desktop/mobile visual baselines
- [`phase-8-desktop-offline-packaging-validation.md`](./phase-8-desktop-offline-packaging-validation.md): Phase 8 完成日志，记录 Desktop 通过 embedded standalone web runtime、static asset sync、`preload.cjs` bridge 与 `check-phase8` 关闭 offline runtime gate
- [`hardening-wave-1-standalone-room-visual-a11y.md`](./hardening-wave-1-standalone-room-visual-a11y.md): Hardening Wave 1 收口日志，记录 standalone browser gates、room-status cosmetic fanout、平台无关 visual baseline 与 `check-a11y`
- [`visual-v1-theme-foundation-and-style-registry.md`](./visual-v1-theme-foundation-and-style-registry.md): Visual V1 日志，记录 dark tactical token 重写、`dark/light/system` shared-shell foundation、style registry stub 与受控 rebaseline
- [`visual-v2-layout-restructure.md`](./visual-v2-layout-restructure.md): Visual V2 日志，记录 `BoardScene` slot API、顶栏/中台/底区/右 rail 重排、`?shell=debug` 保留与受控 rebaseline
- [`visual-v3-center-stage-primitives.md`](./visual-v3-center-stage-primitives.md): Visual V3 日志，记录 Market 金字塔、圆形宝石 Board、2×2 Royal Court 与受控 visual rebaseline
- [`visual-v4-hud-player-zone-action-counter.md`](./visual-v4-hud-player-zone-action-counter.md): Visual V4 日志，记录对称 HUD、玩家区资产槽、保守投影的 `ACTION N / N` 胶囊、spectator/replay 门禁与受控 visual rebaseline
- [`visual-v5-session-rail-theme-rules-restart.md`](./visual-v5-session-rail-theme-rules-restart.md): Visual V5 日志，记录 session rail 的 Save/Load 决策、只读 style pill、`Dark/Light/System` 主题切换、Rules/Restart 语义与双语/键盘验收
- [`visual-v6-dark-tactical-drawers.md`](./visual-v6-dark-tactical-drawers.md): Visual V6 日志，记录 collapsed-by-default dark tactical drawers、统一 overlay/focus-trap shell、terminal 浮动入口与受控 visual rebaseline
- [`visual-v7-release-ready-closure.md`](./visual-v7-release-ready-closure.md): Visual V7 日志，记录 visual baseline 冻结、Desktop parity 证据、顺序跑绿 `check-phase4-8` / `check-a11y` / `check-visual` 与最终收口摘要
- [`../visual-productization-independent-audit.md`](../visual-productization-independent-audit.md): Visual V1–V7 独立审计签收日志，记录 invariant 反证、F-1 至 F-6 遗留发现与 Visual Hardening Wave 1 的 6 步执行建议
- [`visual-hardening-wave-1-audit-followups.md`](./visual-hardening-wave-1-audit-followups.md): Visual Hardening Wave 1 收口日志，记录一次性关闭 F-1 至 F-6、light 主题抽样 baseline、PNG 压缩写入通道与 shell 抽层纪律说明
- [`preview-ui-readonly-reference-guardrails.md`](./preview-ui-readonly-reference-guardrails.md): preview UI 只读参考治理日志，记录 `GemDuel-Dev/` 忽略、import-ban 与 tracker / plan / log 的同步收口
- [`preview-ui-player-surface-productization.md`](./preview-ui-player-surface-productization.md): preview UI 玩家表面产品化日志，记录首页 / hub / online arena / run draft 的落地、shared shell 接线与 phase4-8 / a11y / visual 验收
- [`preview-ui-single-screen-arena-refactor.md`](./preview-ui-single-screen-arena-refactor.md): preview UI 单屏 Arena 收口日志，记录 active-match/room/replay 的单屏壳、隐藏 controls overlay、display-only contract 扩展与受控 rebaseline
- [`play-interface-target-first-landscape-refactor.md`](./play-interface-target-first-landscape-refactor.md): target-first play-interface 日志，记录横屏 full-bleed 壳、direct-trigger command surface、Step 07 golden replay 刷新与 `16:9` / `16:10` 视觉证据

## EN

This directory stores landing logs for phases tracked in `docs/10-architecture/full-board-ui-roadmap.md`, post-phase hardening-wave closeout logs, the parallel visual-productization `visual-v*` logs, and later standalone target-first play-interface waves.

- Whenever a roadmap phase is completed, the matching log must be written and the roadmap status must be updated to `Completed` or an equivalent completion marker.
- Logs should record the date, scope, landed results, touched files, remaining risks, and validation outcomes.
- If a phase lands only partially, the unfinished outputs must be listed explicitly and the phase must not be marked complete yet.

### Current Logs

- [`phase-0-wording-downgrade-and-entry-scope.md`](./phase-0-wording-downgrade-and-entry-scope.md): Phase 0 wording downgrade, release-scope clarification, and homepage validation-shell wording closure
- [`phase-1-application-ui-structure-kickoff.md`](./phase-1-application-ui-structure-kickoff.md): Phase 1 kickoff log, now including the independent-audit delayed/at-risk addendum, the historical god-file risk, and the temporary incremental rule
- [`phase-1a-application-emergency-split-completion.md`](./phase-1a-application-emergency-split-completion.md): Phase 1a completion log, recording the application emergency split closeout and barrelization result
- [`phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./phase-2-interaction-adr-and-uiviewmodel-kickoff.md): Phase 2 kickoff log for the ADR gate, `UiViewModel` 2.0 contract prep, and the later migration order
- [`phase-2-adr-and-contract-wave-1.md`](./phase-2-adr-and-contract-wave-1.md): Phase 2 log for the first ADR + `UiViewModel` 2.0 contract/projection landing wave
- [`phase-2-pending-selection-wave-2.md`](./phase-2-pending-selection-wave-2.md): Phase 2 second landing wave for the engine-owned pending-selection command/snapshot/projection surface
- [`phase-2-contract-runtime-closure.md`](./phase-2-contract-runtime-closure.md): Phase 2 closure log for the `UiViewModel v2`, `pendingSelection`, and `roomStatus` additive contract freeze point, with shared `BoardScene` consumer migration deferred to Phase 6
- [`phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./phase-2.5-ui-layout-and-visual-harness-kickoff.md): Phase 2.5 kickoff log for `packages/ui` layout, tokens, and the visual harness
- [`phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./phase-2.5-ui-layout-and-visual-harness-wave-1.md): Phase 2.5 first landing wave for the `packages/ui` layout split, shared-style ownership, and `/playground` baseline
- [`phase-2.5-visual-harness-completion.md`](./phase-2.5-visual-harness-completion.md): Phase 2.5 completion log for the multi-scene playground, `pnpm check-visual`, and committed screenshot baselines
- [`phase-3-shared-board-primitives-wave-1.md`](./phase-3-shared-board-primitives-wave-1.md): Phase 3 first-wave log for the landed shared board primitives, the remaining gaps, and the refreshed visual baseline
- [`phase-3-shared-board-primitives-completion.md`](./phase-3-shared-board-primitives-completion.md): Phase 3 completion log, now with split rebaseline/final-regression evidence and the `*-win32.png` platform caveat
- [`phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./phase-4-preflight-acceptance-matrix-and-scenario-harness.md): Phase 4 Gate 2 preflight log for the acceptance matrix, the `/play/local?scenario=` bootstrap surface, and `pnpm check-phase4`
- [`phase-4-boardscene-local-default-wave-1.md`](./phase-4-boardscene-local-default-wave-1.md): Phase 4 Gate 3 log for the `/play/local` switch to `BoardScene`, the preserved debug fallback, and unique-action affordance mapping
- [`phase-4-local-board-and-player-path-automation-completion.md`](./phase-4-local-board-and-player-path-automation-completion.md): Phase 4 completion log for the 8 automated player paths, the local-board baseline, and final regression evidence
- [`phase-5-ai-run-parity-wave-1.md`](./phase-5-ai-run-parity-wave-1.md): Phase 5 first-wave log for converging `/play/ai` and `/play/run` onto the shared `BoardScene` surface and for introducing the `pnpm check-phase5` parity gate
- [`phase-5-ai-run-parity-wave-2.md`](./phase-5-ai-run-parity-wave-2.md): Phase 5 second-wave log for extracting the AI turn resolver, freezing seed / `finalStateHash` baselines, and adding an application-level deterministic gate
- [`phase-5-ai-run-parity-completion.md`](./phase-5-ai-run-parity-completion.md): Phase 5 completion log for closing AI/run main-board parity, freezing the seed/hash baselines, and keeping the Phase 4 regression green
- [`phase-6-room-boardscene-and-spectator-gates-completion.md`](./phase-6-room-boardscene-and-spectator-gates-completion.md): Phase 6 completion log for moving `/rooms/[roomId]` onto the shared `BoardScene`, redacting spectator pending-selection state, and landing the `check-phase6` browser/integration gate
- [`phase-7-replay-boardscene-and-product-finish-completion.md`](./phase-7-replay-boardscene-and-product-finish-completion.md): Phase 7 completion log for moving `/replays/[replayId]` onto the shared `BoardScene`, closing timeline/hash/keyboard/i18n on the replay surface, and adding replay desktop/mobile visual baselines
- [`phase-8-desktop-offline-packaging-validation.md`](./phase-8-desktop-offline-packaging-validation.md): Phase 8 completion log for closing Desktop offline runtime validation through the embedded standalone web runtime, static-asset sync, the `preload.cjs` bridge, and `check-phase8`
- [`hardening-wave-1-standalone-room-visual-a11y.md`](./hardening-wave-1-standalone-room-visual-a11y.md): Hardening Wave 1 closeout for standalone browser gates, room-status cosmetic fanout, platform-agnostic visual baselines, and `check-a11y`
- [`visual-v1-theme-foundation-and-style-registry.md`](./visual-v1-theme-foundation-and-style-registry.md): Visual V1 log for the dark-tactical token rewrite, the shared-shell `dark/light/system` foundation, the style-registry stub, and the controlled rebaseline
- [`visual-v2-layout-restructure.md`](./visual-v2-layout-restructure.md): Visual V2 log for the `BoardScene` slot API, the top/stage/footer/right-rail restructure, preserved `?shell=debug`, and the controlled rebaseline
- [`visual-v3-center-stage-primitives.md`](./visual-v3-center-stage-primitives.md): Visual V3 log for the Market pyramid, round-gem Board, 2x2 Royal Court, and the controlled visual rebaseline
- [`visual-v4-hud-player-zone-action-counter.md`](./visual-v4-hud-player-zone-action-counter.md): Visual V4 log for the symmetric HUD, player-zone asset trays, the conservatively derived `ACTION N / N` capsule, spectator/replay gates, and the controlled visual rebaseline
- [`visual-v5-session-rail-theme-rules-restart.md`](./visual-v5-session-rail-theme-rules-restart.md): Visual V5 log for the session-rail Save/Load decision, the read-only style pill, `Dark/Light/System` theme switching, Rules/Restart semantics, and bilingual keyboard-accessible acceptance
- [`visual-v6-dark-tactical-drawers.md`](./visual-v6-dark-tactical-drawers.md): Visual V6 log for the collapsed-by-default dark tactical drawers, the shared overlay/focus-trap shell, the floating terminal trigger, and the controlled visual rebaseline
- [`visual-v7-release-ready-closure.md`](./visual-v7-release-ready-closure.md): Visual V7 log for the frozen visual baselines, Desktop parity evidence, the sequential green sweep of `check-phase4-8` / `check-a11y` / `check-visual`, and the final closeout summary
- [`../visual-productization-independent-audit.md`](../visual-productization-independent-audit.md): Independent audit sign-off for V1–V7, capturing the invariant counter-proofs, findings F-1 through F-6, and the six-step Visual Hardening Wave 1 execution plan
- [`visual-hardening-wave-1-audit-followups.md`](./visual-hardening-wave-1-audit-followups.md): Visual Hardening Wave 1 closeout log for the one-shot closure of F-1 through F-6, the light-theme sampling baseline, the PNG optimization write path, and the shell re-extraction discipline note
- [`preview-ui-readonly-reference-guardrails.md`](./preview-ui-readonly-reference-guardrails.md): Governance log for the `GemDuel-Dev/` read-only preview reference, the ignore / import-ban guardrails, and the synchronized tracker / plan / log references
- [`preview-ui-player-surface-productization.md`](./preview-ui-player-surface-productization.md): Closeout log for the preview UI player-surface productization across the homepage, hubs, online arena, run draft, shared-shell wiring, and phase4-8 / a11y / visual acceptance
- [`preview-ui-single-screen-arena-refactor.md`](./preview-ui-single-screen-arena-refactor.md): Closeout log for the preview UI single-screen Arena wave across active-match / room / replay surfaces, the hidden controls overlay, the display-only contract expansion, and the controlled rebaseline
- [`play-interface-target-first-landscape-refactor.md`](./play-interface-target-first-landscape-refactor.md): Closeout log for the target-first play-interface wave across the landscape full-bleed shell, the direct-trigger command surface, the Step 07 golden replay refresh, and the `16:9` / `16:10` desktop evidence
