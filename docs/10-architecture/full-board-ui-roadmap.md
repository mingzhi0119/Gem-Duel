# Full Board UI Audit and Roadmap

## ZH

### 文档定位

本文是 Opus 4.7 严格审计后的 full-board UI 整改主文档，用来统一记录：

- 当前“工程收口”与“产品完成”的边界；
- 审计发现与风险归属；
- 按 Phase 排序的整改路线图、前置门与完成标准；
- 后续需要进入 code / contract / test 实施的具体落点。

### 审计结论

- Step 00-08 在工程边界上属于“强达成”：分层、contracts、determinism、room-service authority、replay 与 release gate 已经闭环。
- 当前产品完成度已从“弱达成”推进到“部分达成”：默认 classic-local 玩家入口已是 product-facing board，但 AI / run / online parity、replay/a11y/mobile 与 Desktop offline 仍未完成。
- 后续整改必须把“工程收口”与“玩家可用产品”分开治理；本路线图就是产品侧和 presentation/projection 侧的正式 backlog。

### 当前基线

- `packages/ui` 仍同时暴露 `MatchView` 与 `BoardScene` 两类 surface；`MatchView` 继续承担 debug / fallback shell 职责。
- `/play/local` 当前默认使用 product-facing `BoardScene`，而 `/play/ai`、`/play/run`、`/rooms/[roomId]` 仍保留验证壳。
- 当前壳适合：
    - 校验 command legality；
    - 验证 replay / hash / event sequencing；
    - 调试 local / AI / run / room session 的状态推进。
- 当前壳不适合：
    - 让未读规则书的玩家独立完成一局；
    - 作为 full-board product UI 的默认发布面；
    - 作为 Desktop offline 分发已验证的依据。

### 不变约束

- `packages/ui` 只负责展示和交互回调，不承载规则、计分、Buff 或 authority 逻辑。
- `packages/application` 继续作为 view-model projection 边界；若盘面 UI 缺字段，先扩 projection / contracts，再做 renderer。
- `apps/web` 与 `apps/desktop` 只做壳层、路由、transport 和页面状态，不重算隐藏信息。
- `apps/room-service` 继续只下发 viewer-filtered snapshot 与 application-projected actions。
- 不引入第二套 desktop-specific gameplay renderer。
- 不导回 legacy code；旧版只作为视觉/交互意图参考，来源限定为 `docs/99-legacy/` 与 git history。

### 审计发现与 Phase 归属

| Finding | 摘要                                                            | 严重度 | 主责 Phase | 次责 Phase |
| ------- | --------------------------------------------------------------- | ------ | ---------- | ---------- |
| F1      | `release-ready` 与“产品完成”口径混淆                            | 高     | Phase 0    | Phase 4    |
| F2      | Desktop shared shell 断言过满，offline bundle 未验证            | 高     | Phase 0    | Phase 8    |
| F3      | 枚举式 `UiActionDescriptor` 不适合多阶段盘面交互                | 高     | Phase 2    | Phase 4    |
| F4      | `UiViewModel` 缺少盘面 presentation / viewer / session 状态字段 | 高     | Phase 2    | Phase 6    |
| F5      | step log / tracker 缺 acceptance evidence，治理可信度不足       | 中高   | Phase 0    | 持续治理   |
| F6      | `packages/application/src/index.ts` 巨文件阻碍扩展              | 中高   | Phase 1    | Phase 2    |
| F7      | `packages/ui` 缺 layout、design tokens 与 visual harness        | 中     | Phase 2.5  | Phase 3    |
| F8      | spectator / resync / out-of-turn 一致性缺测试门禁               | 中     | Phase 6    | Phase 2    |
| F9      | 缺 classic local first 的玩家路径验收矩阵                       | 中     | Phase 4    | Phase 7    |
| F10     | AI 策略与本地 session 绑定过紧，缺 parity/golden 约束           | 中低   | Phase 5    | Phase 1    |
| F11     | 玩家首页仍暴露治理/调试口径与 schema 信息                       | 低     | Phase 0    | Phase 4    |

### 按 Phase 排序的整改路线图

#### Phase 0 - 口径降级、发布边界与审计证据

状态：`Completed`（2026-04-17）。日志：[`logs/phase-0-wording-downgrade-and-entry-scope.md`](./logs/phase-0-wording-downgrade-and-entry-scope.md)

目标：先修正认知风险，确保任何入口都不会把 Step 08 误读为产品 GA。

覆盖发现：F1、F2、F5、F11。

本阶段输出：

- 在 tracker、release-prep、Step 06/08 log 与架构文档中明确：
    - Step 00-08 = engineering closure；
    - full-board product completion 另行追踪；
    - Desktop offline 分发尚未验收；
    - 当时 `v1.0.0+` 语义版本需等待 Phase 4；截至当前状态，local-player gate 已关闭，Desktop offline 仍需等待 Phase 8。
- 在 step-log 规范中新增 acceptance evidence 要求：commit SHA、CI run id、golden replay hash 摘要或 validation-output 摘要。
- 已将 `apps/web/app/page.tsx` 的 hero / marketing copy 降级为“deterministic validation shell + roadmap link”口径，并把 CTA 从产品完成话术收口为 validation surface 话术。

完成标准：

- 从 tracker、release-prep、Step 06/08 和 architecture 入口都能读到一致口径。
- 审计读者不会再把 Step 08 视作产品发布完成。
- 后续 step log 模板具备 acceptance evidence 字段，且默认首页已不再把 engineering closure 表述为完整产品完成。

#### Phase 1 - Application / UI 仓库结构清理

状态：`Completed`（2026-04-18）。日志：[`logs/phase-1-application-ui-structure-kickoff.md`](./logs/phase-1-application-ui-structure-kickoff.md)、[`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)

目标：在不改契约的前提下，先清出 projection 与 UI 扩展空间；这条结构清理线已经通过 Phase 1a emergency split 闭环。

覆盖发现：F6、F10。

本阶段输出：

- `packages/application` 与 `packages/ui` 的目标目录、write-scope、迁移顺序与非目标治理说明见 [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md)。
- `packages/application` 的无语义拆分已经落地，`src/index.ts` 现为 barrel / export surface。
- `packages/ui` 的目录与 barrel 目标已通过后续的 Phase 2.5 / 3 间接落地。
- 该 phase 已关闭 Gate 1 的 blocking cleanup 风险，不再依赖单个 god file 继续承接 projection 扩展。
- 不改 behavior，不改 cross-boundary contract，只做 layout / ownership 清理。

本阶段明确非目标：

- 不提前处理 design tokens / shared CSS ownership；该项留给 Phase 2.5。
- 不提前扩 `UiViewModel` 契约或处理多阶段交互范式；该项留给 Phase 2。
- 不把目录整理误写成 full-board UI 已落地或产品完成。

完成标准：

- 无 contract drift。
- `check-deps`、`check-boundaries`、`test`、`build` 仍通过。
- 后续 Phase 2-6 的 PR 不再强依赖单个巨文件扩展。
- 在 Phase 1a 完成前，新增 projection / helper 逻辑不得继续回写 `packages/application/src/index.ts`。

#### Phase 1a - Application Emergency Split

状态：`Completed / Blocking gate closed`（2026-04-18）。日志：[`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)

目标：只拆 `packages/application/src/index.ts`，不改契约、不改行为，把 Phase 1 的核心治理债前置补齐。

本阶段输出：

- `shared/types.ts`
- `replay/inspector.ts`
- `ai/heuristic.ts`
- `view-model/{metadata,actions,board,market,player-zones,prompts,selection,run-panel,index}.ts`
- `sessions/{match,run}.ts`
- `index.ts` 最终仅保留 orchestration + barrel，目标收敛到 **300 行以内**。

完成标准：

- 对外 export surface 保持兼容；
- contract、runtime、replay 行为不发生语义变化；
- `packages/application/src/index.ts` 不再承担新增 projection/helper 的默认落点；
- 本阶段完成后，Phase 4 可以继续按后续 gate 推进，不再被这个 cleanup gate 阻塞。

#### Phase 2 - 交互范式 ADR + `UiViewModel` 2.0 契约扩展

状态：`Closed (contract/runtime); UI consumer migration deferred to Phase 6`（2026-04-17）。日志：

- [`logs/phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./logs/phase-2-interaction-adr-and-uiviewmodel-kickoff.md)
- [`logs/phase-2-adr-and-contract-wave-1.md`](./logs/phase-2-adr-and-contract-wave-1.md)
- [`logs/phase-2-pending-selection-wave-2.md`](./logs/phase-2-pending-selection-wave-2.md)
- [`logs/phase-2-contract-runtime-closure.md`](./logs/phase-2-contract-runtime-closure.md)

目标：先决定“多选盘面交互怎么表达”，再做 board-facing projection。

覆盖发现：F3、F4、F6。

治理主文档：

- [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md)
- [`../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md)
- 已落 ADR：[`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md)
- 已落 migration note：[`../30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`](../30-contracts/phase-2-uiviewmodel-2.0-migration-note.md)
- 本阶段进展日志：[`logs/phase-2-adr-and-contract-wave-1.md`](./logs/phase-2-adr-and-contract-wave-1.md)

本阶段前置门：

- 必须先写一份短 ADR，明确二选一：
    - A. 把多位置选择统一成 effect-prompt / pending-selection 风格的原子化命令；
    - B. 允许客户端维护 draft intent。
- 默认推荐 A，因为它更贴近 Step 02.5 已冻结的 `activeEffects / effectPrompts` 语义，也更适合 online / spectator / replay 同步中间状态。

本阶段输出：

- 若走 A：新增 pending-selection 风格 command / phase surface，并通过 `contract-change` + `add-phase-transition` 流程治理。
- `UiViewModelSchema` 至少补齐下列候选字段：
    - `viewerRole`
    - `seat`
    - `sessionStatus`
    - `boardCells[]`
    - `marketSlots[]`
    - `royalOffers[]`
    - `promptStack[]`
    - `selectionDraft?`
    - `runPanel?`
- `room-live-client` 等页面的最终 shared `BoardScene` consumer migration 移交给 Phase 6，但 contract/projection 已不再允许页面层自由拼接 `room.status` / viewer / selectable state。
- spectator / replay / room filtering 语义必须一起进入 projection contract，而不是延后到页面实现时再补。
- 当前已落第二波 Phase 2 结果：
    - `TAKE_TOKENS` / `USE_PRIVILEGE` 已开始切到引擎拥有的 pending-selection command surface，而不是页面枚举所有组合；
    - `pendingSelection` 已进入 snapshot / contract / replay-visible state；
    - `packages/application` 已改为从 `snapshot.pendingSelection` 投影 `selectionDraft` 与 board-cell selected/selectable 状态；
    - property / engine / view-model tests 已补覆盖 pending-selection 的确认与取消路径。

本阶段关闭范围 / 冻结点：

- `UiViewModel v2` 已作为后续 UI/fixture/projection 的 contract 基线；
- `pendingSelection` 已作为引擎拥有的多阶段交互 surface 落入 contract、runtime 与 replay-visible state；
- `roomStatus` additive contract 已落地，不再把 room 级状态口径留给页面层自由拼接；
- `UiSessionStatus = 'replay'` 当前已有 producer，不作为本轮待修 contract 问题；
- `room-live-client` 最终切到 shared `BoardScene` 的 consumer migration 移交给 Phase 6，不再作为 Phase 2 未完成项挂账。

完成标准：

- 所有 board-facing 页面都能从同一套 projection 获取完整盘面数据。
- UI renderer 不需要根据 phase 自己猜隐藏信息或合法交互。
- migration note、fixtures、contract regen 与 property tests 同步更新。
- 后续若仅剩 consumer migration / shared BoardScene 接入，不再据此把 Phase 2 回退成 `In Progress`。

#### Phase 2.5 - `packages/ui` 布局、Design Tokens 与 Visual Harness

状态：`Completed`（2026-04-17）。日志：

- [`logs/phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./logs/phase-2.5-ui-layout-and-visual-harness-kickoff.md)
- [`logs/phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./logs/phase-2.5-ui-layout-and-visual-harness-wave-1.md)
- [`logs/phase-2.5-visual-harness-completion.md`](./logs/phase-2.5-visual-harness-completion.md)

治理主文档：[`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)

目标：在真正做 full board renderer 前，先建立 UI primitives 的载体与视觉基线。

覆盖发现：F7。

本阶段输出：

- `packages/ui/src/{primitives,board,hud,drawer,styles}/` 基础目录。
- `tokens.css` / theme layer，把 `gd-*` 样式从 app-scope 收回到 `packages/ui`。
- 静态渲染 playground 或 Storybook/Ladle 风格 visual harness。
- screenshot baseline 机制与 `check-visual` 类门禁草案。
- 当前已落第一波 Phase 2.5 结果：
    - `packages/ui` 已拆出 `board/`、`drawer/`、`hud/`、`primitives/`、`styles/`、`tables/`、`views/`；
    - shared shell / token 样式已从 `apps/web/app/globals.css` 收回到 `@gem-duel/ui/styles.css`；
    - `/playground` 静态 fixture 页面已落地，可在不启动 live session 的情况下渲染 package-owned scene scaffold。
- 本阶段现已补齐的收口结果：
    - `packages/ui` 现已通过 `PlaygroundSceneFrame` + 扩展后的 `BoardSceneScaffold` 承载 board / market / player-zone / prompt / run 数据的静态组合场景；
    - `/playground/*` 已扩成多 scene visual harness，而不是单页 fixture；
    - `pnpm check-visual` 已接线为 Playwright screenshot baseline guardrail，基线场景现覆盖 `classic-selection`、`spectator-resync`、`run-sidecar`、`terminal-victory`；
    - Playwright 临时运行输出已固定到已 ignore 的 `tmp/playwright/test-results`，不会把视觉校验漂移带入提交边界。

完成标准：

- `packages/ui` 可以脱离实际 engine session 渲染静态 full-board scene。
- 视觉 token 与 shared primitives 不再依赖 `apps/web` 的页面级样式偶然成立。
- 视觉回归基线从这里开始建立，而不是等到最后补。

#### Phase 3 - Shared Board Primitives

状态：`Completed`（2026-04-17）。日志：

- [`logs/phase-3-shared-board-primitives-wave-1.md`](./logs/phase-3-shared-board-primitives-wave-1.md)
- [`logs/phase-3-shared-board-primitives-completion.md`](./logs/phase-3-shared-board-primitives-completion.md)

目标：建立完整盘面 UI 需要的共享 primitives 与 sidecar 组合。

覆盖发现：F7。

本阶段输出：

- `BoardGrid`
- `TokenCell`
- `MarketStack`
- `CardSlot`
- `ReserveTray`
- `RoyalCourt`
- `PlayerZone`
- `TurnHud`
- `PromptBanner`
- `SelectionOverlay`
- `SidecarDrawer`
- `ReplayDrawer`
- `AiTraceDrawer`
- `RunPanel`

第一波落地范围：

- 先把 `BoardGrid`、`TokenCell`、`MarketStack`、`CardSlot`、`ReserveTray`、`PlayerZone`、`RoyalCourt`、`PromptBanner`、`SelectionOverlay`、`RunPanel` 从当前 scaffold 中正式抽成 `packages/ui` primitives；
- 先让 `/playground/*` 与 static scene host 消费这些 primitives，暂不切换 `/play/local` 默认主画面；
- `ReplayDrawer` / `AiTraceDrawer` 允许在后续波次补齐，不阻塞本 phase 启动。

本阶段现已收口的补充结果：

- `ReplayDrawer` 与 `AiTraceDrawer` 已落入 `packages/ui`，不再停留在 `apps/web` 的本地面板；
- `/play/local`、`/play/ai`、`/play/run` 与 `/replays/[replayId]` 已开始直接复用 shared drawers；
- `/playground/*` 的 visual harness 已覆盖 board primitives、ReplayDrawer 与 AiTraceDrawer，并完成新的 committed baseline。

Evidence Caveat：

- `pnpm check-visual -- --update-snapshots` 只能视为 rebaseline，不构成最终回归证明；
- 当前 committed screenshot baseline 仍为 `*-win32.png`，平台策略与 CI 禁止重录仍属于后续治理项；
- Phase 3 的“已完成”表示 shared primitives 已落地，不等于 visual-governance 已完全硬化。

完成标准：

- `packages/ui` 能独立渲染静态完整盘面。
- shared UI 只依赖 contract-facing display model。
- visual harness 与 screenshot baseline 可覆盖关键盘面 scene。

#### Phase 4 - `/play/local` Full Board + Player Path Acceptance

状态：`Completed`（2026-04-18）。治理文档：[`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md)。日志：

- [`logs/phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./logs/phase-4-preflight-acceptance-matrix-and-scenario-harness.md)
- [`logs/phase-4-boardscene-local-default-wave-1.md`](./logs/phase-4-boardscene-local-default-wave-1.md)
- [`logs/phase-4-local-board-and-player-path-automation-completion.md`](./logs/phase-4-local-board-and-player-path-automation-completion.md)

目标：先把 classic local board 做成真正可玩的默认入口。

覆盖发现：F1、F3、F9、F11。

本阶段输出：

- Gate 2 preflight 已落：
    - `/play/local` 明确收口为 classic-local 默认入口；
    - `/play/local?shell=debug` 保留 legacy `MatchView` fallback；
    - `/play/local?scenario=<row-id>` 已支持 deterministic scenario bootstrap；
    - Player Path Acceptance Matrix 已冻结 8 条路径的 `seed + starting fixture + expected finalStateHash` 三元组。
- Gate 3 已落默认入口产品化第一波：
    - `/play/local` 默认 renderer 切到 shared `BoardScene`；
    - `?shell=debug` 继续保留 legacy `MatchView + ReplayDrawer` fallback；
    - `BoardSceneScaffold` 保持 playground/debug-only，不回流到产品入口；
    - board / market / royal affordance 只在 unique payload match 成立时才可交互；
    - `TerminalOverlay`、market buy/reserve affordance 与 stable `data-testid` hooks 已补齐。
- Gate 4 已收口：
    - `pnpm check-phase4` 现默认运行整个 `apps/web/tests/phase4/` 目录；
    - 8 条玩家路径均已由 `local-player-paths.spec.ts` 自动化覆盖；
    - 每条路径都断言真实 UI affordance 可见、可用且唯一；
    - 每条路径都断言完成后的 `current-final-state-hash` 与冻结值一致；
    - `/play/local?shell=debug` 保留 legacy shell 且仍可完成 deterministic 路径。
- `MatchPlayground` 已补 `phase4-interactive-ready` client marker，使 Gate 4 Playwright 等待 hydration 完成后再交互。
- `tools/check-phase4.mjs` 与 `tools/check-visual.mjs` 已改为使用能正确服务 client assets 的 web start 路径，避免 previous standalone startup 只渲染 SSR HTML 而不完成 hydration。
- `check-visual` 已新增 productized local-board scene 基线，并在 rebaseline 后通过不带 snapshot update 的最终回归运行。

完成标准：

- 玩家不读按钮列表也能完成 classic 核心流程。
- Player Path Acceptance Matrix 现已具备 Playwright 自动化闭环，而不再只是 bootstrap harness。
- `/play/local` 默认入口现已由 product-facing `BoardScene` 驱动。
- `/play/local?shell=debug` 仍保留 legacy shell fallback。
- Phase 4 local-player gate 已关闭；后续产品完成度仍继续由 Phase 5 / 6 / 7 / 8 决定。

#### Phase 5 - `/play/ai` 与 `/play/run` Parity

目标：让 AI 与 run 路径共享主盘面，只把辅助信息放进 sidecar。

覆盖发现：F10。

本阶段输出：

- `AiTraceDrawer` 与 `RunPanel` 接入 full-board scene。
- AI 策略从 session glue 中拆出，形成可测试的 `ai/` surface。
- 固定 seed 的 AI replay / finalStateHash 基线。

完成标准：

- local / AI / run 三条本地入口共享主盘面结构。
- AI / run 的差异只体现在 sidecar，而不是第二套主布局。

#### Phase 6 - `/rooms/[roomId]`、Spectator 与 Online 一致性门禁

目标：把 online player / spectator / resync / disconnected / waiting 状态收拢到同一盘面体系，并补齐泄漏防线。

覆盖发现：F4、F8。

本阶段输出：

- `room-live-client` 切换到 shared `BoardScene`。
- `viewerRole='spectator'` 自动禁用交互。
- property test：spectator DOM / serialized view model 不得泄漏 `hiddenState`、`deckOrder`、他方 reserve 牌面或对手 `pendingSelection` 草稿等信息。
- resync / seq-gap / out-of-turn seat 的 Playwright 或等价集成测试。

完成标准：

- local / AI / run / online player / spectator 全部收敛到同一套盘面体系。
- spectator visibility invariants 成为正式门禁，而不是人工约定。
- room-service 仍只负责 filtered data，不承担 renderer-specific branching。

#### Phase 7 - Replay、QA、A11y、Mobile 与 Product Finish

目标：补齐 replay 盘面化、视觉回归、无障碍和小屏策略，完成产品级打磨。

覆盖发现：F9。

本阶段输出：

- replay inspector 复用 full-board scene，支持 timeline、step forward/backward、hash badge。
- 正式视觉回归基线、a11y 检查、键盘路径与 loading skeleton。
- 小屏 / mobile 策略定稿。
- i18n / UI 字符串外化。

完成标准：

- full-board UI 可玩、可回放、可验证、可访问。
- 默认玩家入口不再暴露按钮列表壳。

#### Phase 8 - Desktop Offline Packaging Validation

目标：最后单列验证 Desktop 是否真的能消费 shared shell 并独立分发。

覆盖发现：F2。

本阶段输出：

- Desktop runtime 与 Web shell 的真实装配方案定稿：`next start` child process、受限 export、或其他明确方案。
- Desktop 构建、启动、资源加载与主盘面 smoke/e2e。
- 对 release-prep 的 Desktop artifact 口径重新收口。

完成标准：

- Desktop 不再仅靠“理论上共享 Web routes”被视作完成。
- `apps/desktop` 在构建与启动层面具备可验证的 full-board runtime。

### 默认决策

- 默认继续复用 shared application/ui boundary，不新开 package，也不回退到页面内 rule-aware renderer。
- 默认视觉方向向 dark tactical dashboard 靠拢，而不是扩展当前白底调试布局。
- 默认先做 classic local board，再追 AI / run / online parity。
- 默认保留 debug / replay / trace，但把它们放到 sidecar / drawer，而不是主舞台。

### 立即可执行的高 ROI 顺序

1. Milestone E：推进 `/play/ai` 与 `/play/run` parity，把 AI trace / run panel 收敛到与 `/play/local` 相同的主盘面。
2. Milestone F：在进入 `/rooms/[roomId]` renderer migration 前，先把 spectator invariants 与 room-status 对账测试补成正式门禁。
3. Milestone G：在 replay / a11y / mobile 收尾前，继续强化 visual-governance 与 screenshot policy。
4. Milestone H：Desktop offline packaging 只在 shared-shell startup 路径被显式验证后再升格表述。

## EN

### Document Role

This document is the authoritative full-board UI remediation plan after the Opus 4.7 strict audit. It records:

- the boundary between engineering closure and product completion;
- the audit findings and their ownership;
- the phase-sorted roadmap, decision gates, and done criteria;
- the future code / contract / test landing areas required to finish the product-facing board experience.

### Audit Summary

- Step 00-08 is a strong success at the engineering-boundary level: layering, contracts, determinism, room-service authority, replay, and release gates are closed.
- Product completion has moved from weak to partial: the default classic-local player entrypoint is now a product-facing board, but AI / run / online parity, replay/a11y/mobile, and Desktop offline remain open.
- Follow-up work must treat engineering closure and player-facing product completion as different tracks. This roadmap is the formal backlog for the product/presentation/projection side.

### Current Baseline

- `packages/ui` now exposes both `MatchView` and `BoardScene`; `MatchView` remains the debug / fallback shell surface.
- `/play/local` now defaults to the product-facing `BoardScene`, while `/play/ai`, `/play/run`, and `/rooms/[roomId]` still keep the validation shell.
- The shell is good for:
    - command-legality validation;
    - replay / hash / event-sequencing verification;
    - debugging local / AI / run / room session progression.
- The shell is not good for:
    - allowing a new player to finish a match without a rulebook;
    - acting as the default full-board product surface;
    - serving as proof that Desktop offline distribution is validated.

### Invariants

- `packages/ui` remains presentation plus interaction callbacks only; it may not own rules, scoring, Buff, or authority logic.
- `packages/application` remains the view-model projection boundary; if the board UI is missing fields, projection/contracts must expand first and only then the renderer.
- `apps/web` and `apps/desktop` stay responsible for shell, routing, transport, and page state only; they may not reconstruct hidden information.
- `apps/room-service` continues to send viewer-filtered snapshots plus application-projected actions only.
- No separate desktop-specific gameplay renderer is introduced.
- No legacy code is imported back; the old product remains reference only through `docs/99-legacy/` plus git history.

### Findings and Phase Ownership

| Finding | Summary                                                                        | Severity    | Primary Phase | Secondary Phase    |
| ------- | ------------------------------------------------------------------------------ | ----------- | ------------- | ------------------ |
| F1      | `release-ready` is too easy to misread as product completion                   | High        | Phase 0       | Phase 4            |
| F2      | Desktop shared-shell claim is too strong; offline bundle is unverified         | High        | Phase 0       | Phase 8            |
| F3      | Enumerated `UiActionDescriptor` does not fit real multi-step board interaction | High        | Phase 2       | Phase 4            |
| F4      | `UiViewModel` lacks board-presentation / viewer / session-state fields         | High        | Phase 2       | Phase 6            |
| F5      | Step logs and tracker lack acceptance evidence anchors                         | Medium-high | Phase 0       | Ongoing governance |
| F6      | `packages/application/src/index.ts` is a growth-blocking god file              | Medium-high | Phase 1       | Phase 2            |
| F7      | `packages/ui` lacks layout, design tokens, and a visual harness                | Medium      | Phase 2.5     | Phase 3            |
| F8      | Spectator / resync / out-of-turn consistency is not test-gated                 | Medium      | Phase 6       | Phase 2            |
| F9      | No player-path acceptance matrix for classic local first                       | Medium      | Phase 4       | Phase 7            |
| F10     | AI strategy is too tightly coupled to local session glue                       | Medium-low  | Phase 5       | Phase 1            |
| F11     | Player homepage still exposes governance/debug/schema messaging                | Low         | Phase 0       | Phase 4            |

### Phase-Sorted Remediation Roadmap

#### Phase 0 - Wording Downgrade, Release Scope, and Audit Evidence

Status: `Completed` (2026-04-17). Log: [`logs/phase-0-wording-downgrade-and-entry-scope.md`](./logs/phase-0-wording-downgrade-and-entry-scope.md)

Goal: fix the interpretation risk first so no entrypoint can read Step 08 as product GA.

Covers: F1, F2, F5, F11.

Outputs:

- Clarify in the tracker, release-prep doc, Step 06/08 logs, and architecture docs that:
    - Step 00-08 = engineering closure;
    - full-board product completion is tracked separately;
    - Desktop offline distribution is still unaccepted;
    - at that point `v1.0.0+` required Phase 4; in the current state the local-player gate is closed, while Desktop offline release still requires Phase 8.
- Add an acceptance-evidence rule to the step-log guide: commit SHA, CI run id, golden replay hash summary, or validation-output summary.
- `apps/web/app/page.tsx` now uses downgraded hero/marketing wording centered on a deterministic validation shell plus a roadmap link, and its CTA labels no longer imply a player-complete product.

Done criteria:

- Tracker, release-prep, Step 06/08, and architecture entrypoints all say the same thing.
- Audit readers can no longer treat Step 08 as product-release completion.
- The step-log template now has an acceptance-evidence field, and the default homepage no longer describes engineering closure as a player-complete product.

#### Phase 1 - Application / UI Repository Structure Cleanup

Status: `Completed` (2026-04-18). Logs: [`logs/phase-1-application-ui-structure-kickoff.md`](./logs/phase-1-application-ui-structure-kickoff.md), [`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)

Goal: create room for projection and UI growth without changing contracts yet; this cleanup line is now closed via the Phase 1a emergency split.

Covers: F6, F10.

Outputs:

- The target layout, write scopes, migration order, and non-goals for `packages/application` and `packages/ui` are documented in [`phase-1-application-ui-structure-plan.md`](./phase-1-application-ui-structure-plan.md).
- The `packages/ui` side of the cleanup has effectively landed indirectly through Phase 2.5 / 3.
- The no-semantics `packages/application` split has now landed, and `packages/application/src/index.ts` is barrel/export routing only.
- Keep the work non-behavioral and non-contractual.

Explicit non-goals:

- Do not move design tokens or shared CSS ownership yet; that belongs to Phase 2.5.
- Do not expand `UiViewModel` or resolve the multi-step interaction model yet; that belongs to Phase 2.
- Do not describe directory cleanup as full-board UI completion or product completion.

Done criteria:

- No contract drift.
- `check-deps`, `check-boundaries`, `test`, and `build` still pass.
- Later Phase 2-6 work no longer depends on a single god file.
- The blocking cleanup gate is now closed, and any later projection/helper logic must continue in the new modules instead of re-growing `packages/application/src/index.ts`.

#### Phase 1a - Application Emergency Split

Status: `Completed / Blocking gate closed` (2026-04-18). Log: [`logs/phase-1a-application-emergency-split-completion.md`](./logs/phase-1a-application-emergency-split-completion.md)

Goal: split only `packages/application/src/index.ts` without changing contracts or behavior, and close the core Phase 1 governance debt before the default-entry migration starts.

Outputs:

- `shared/types`
- `replay/inspector`
- `ai/heuristic`
- `view-model/{metadata,actions,board,market,player-zones,prompts,selection,run-panel,index}`
- `sessions/{match,run}`
- reduce `index.ts` to orchestration + barrel only, targeting **under 300 lines**.

Done criteria:

- The external export surface remains compatible.
- Contract, runtime, and replay behavior stay semantically unchanged.
- `packages/application/src/index.ts` is no longer the default sink for new projection/helper growth.
- Phase 4 may continue because this gate is now closed.

#### Phase 2 - Interaction ADR + `UiViewModel` 2.0 Contract Expansion

Status: `Closed (contract/runtime); UI consumer migration deferred to Phase 6` (2026-04-17). Logs:

- [`logs/phase-2-interaction-adr-and-uiviewmodel-kickoff.md`](./logs/phase-2-interaction-adr-and-uiviewmodel-kickoff.md)
- [`logs/phase-2-adr-and-contract-wave-1.md`](./logs/phase-2-adr-and-contract-wave-1.md)
- [`logs/phase-2-pending-selection-wave-2.md`](./logs/phase-2-pending-selection-wave-2.md)
- [`logs/phase-2-contract-runtime-closure.md`](./logs/phase-2-contract-runtime-closure.md)

Goal: decide how multi-step board interaction is represented before building the board-facing projection.

Covers: F3, F4, F6.

Governance docs:

- [`phase-2-interaction-and-uiviewmodel-plan.md`](./phase-2-interaction-and-uiviewmodel-plan.md)
- [`../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md)
- Landed ADR: [`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md)
- Landed migration note: [`../30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`](../30-contracts/phase-2-uiviewmodel-2.0-migration-note.md)
- Progress log for this contract wave: [`logs/phase-2-adr-and-contract-wave-1.md`](./logs/phase-2-adr-and-contract-wave-1.md)

Entry gate:

- Write a short ADR that chooses one of:
    - A. convert multi-position selection into effect-prompt / pending-selection style atomic commands;
    - B. allow client-side draft intent.
- A is the default recommendation because it aligns better with the Step 02.5-frozen `activeEffects / effectPrompts` semantics and with online / spectator / replay synchronization of intermediate state.

Outputs:

- If A is chosen, add pending-selection-style command / phase surface through the `contract-change` + `add-phase-transition` workflow.
- Expand `UiViewModelSchema` with at least:
    - `viewerRole`
    - `seat`
    - `sessionStatus`
    - `boardCells[]`
    - `marketSlots[]`
    - `royalOffers[]`
    - `promptStack[]`
    - `selectionDraft?`
    - `runPanel?`
- Final shared-`BoardScene` consumer migration for `room-live-client` and similar pages is deferred to Phase 6, but the contract/projection surface no longer permits page-local reconstruction of `room.status`, viewer role, or selectable state.
- Move spectator / replay / room filtering semantics into the projection contract instead of postponing them to page implementation.

Closure scope / freeze point:

- `UiViewModel v2` is now the contract baseline for later UI / fixture / projection work.
- `pendingSelection` is now the engine-owned multi-step interaction surface across contract, runtime, and replay-visible state.
- `roomStatus` is already landed as an additive contract rather than a page-local convention.
- `UiSessionStatus = 'replay'` already has a producer and is therefore not tracked as unresolved contract debt in this pass.
- Final consumer migration of `room-live-client` onto the shared `BoardScene` moves to Phase 6 instead of keeping Phase 2 artificially open.

Done criteria:

- All board-facing pages can consume the same projected board data.
- The UI renderer no longer has to infer hidden state or legal interaction on its own.
- Migration notes, fixtures, contract regeneration, and property tests are updated together.
- Consumer migration and shared-BoardScene adoption alone are no longer used to re-open Phase 2.

#### Phase 2.5 - `packages/ui` Layout, Design Tokens, and Visual Harness

Status: `Completed` (2026-04-17). Logs:

- [`logs/phase-2.5-ui-layout-and-visual-harness-kickoff.md`](./logs/phase-2.5-ui-layout-and-visual-harness-kickoff.md)
- [`logs/phase-2.5-ui-layout-and-visual-harness-wave-1.md`](./logs/phase-2.5-ui-layout-and-visual-harness-wave-1.md)
- [`logs/phase-2.5-visual-harness-completion.md`](./logs/phase-2.5-visual-harness-completion.md)

Governance doc: [`phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)

Goal: establish the host for UI primitives and visual baselines before building the real board renderer.

Covers: F7.

Outputs:

- Baseline directories such as `packages/ui/src/{primitives,board,hud,drawer,styles}/`.
- A token/theme layer such as `tokens.css`, moving `gd-*` styling out of app scope and back into `packages/ui`.
- A static rendering playground or Storybook/Ladle-style harness.
- A screenshot-baseline plan and a future `check-visual` guardrail.

Done criteria:

- `packages/ui` can render static full-board scenes without a live engine session.
- Visual tokens and shared primitives no longer depend on `apps/web` page-local styling by accident.
- Visual-regression baselines begin here instead of being delayed until the end.

#### Phase 3 - Shared Board Primitives

Status: `Completed` (2026-04-17). Logs:

- [`logs/phase-3-shared-board-primitives-wave-1.md`](./logs/phase-3-shared-board-primitives-wave-1.md)
- [`logs/phase-3-shared-board-primitives-completion.md`](./logs/phase-3-shared-board-primitives-completion.md)

Goal: build the shared primitives and sidecar surfaces required for the full board UI.

Covers: F7.

Outputs:

- `BoardGrid`
- `TokenCell`
- `MarketStack`
- `CardSlot`
- `ReserveTray`
- `RoyalCourt`
- `PlayerZone`
- `TurnHud`
- `PromptBanner`
- `SelectionOverlay`
- `SidecarDrawer`
- `ReplayDrawer`
- `AiTraceDrawer`
- `RunPanel`

First-wave scope:

- extract `BoardGrid`, `TokenCell`, `MarketStack`, `CardSlot`, `ReserveTray`, `PlayerZone`, `RoyalCourt`, `PromptBanner`, `SelectionOverlay`, and `RunPanel` into first-class `packages/ui` primitives;
- make `/playground/*` and the static scene host consume those primitives before switching the `/play/local` default surface;
- allow `ReplayDrawer` / `AiTraceDrawer` to land in later waves without blocking Phase 3 startup.

Closure results for the phase:

- `ReplayDrawer` and `AiTraceDrawer` now live in `packages/ui` rather than staying as `apps/web`-local panels;
- `/play/local`, `/play/ai`, `/play/run`, and `/replays/[replayId]` now reuse the shared drawers directly;
- the `/playground/*` visual harness now covers the board primitives together with `ReplayDrawer` and `AiTraceDrawer`, with refreshed committed baselines.

Evidence Caveat:

- `pnpm check-visual -- --update-snapshots` counts only as rebaselining, not as final regression proof.
- The currently committed screenshot baseline is still `*-win32.png`, so platform policy and CI-side snapshot-update blocking remain follow-up governance work.
- Phase 3 being `Completed` means the shared primitives landed; it does not mean visual governance is already fully hardened.

Done criteria:

- `packages/ui` can render a static full board on its own.
- Shared UI depends only on contract-facing display models.
- The visual harness and screenshot baseline cover key board scenes.

#### Phase 4 - `/play/local` Full Board + Player Path Acceptance

Status: `Completed` (2026-04-18). Governance doc: [`phase-4-player-path-acceptance-matrix.md`](./phase-4-player-path-acceptance-matrix.md). Logs:

- [`logs/phase-4-preflight-acceptance-matrix-and-scenario-harness.md`](./logs/phase-4-preflight-acceptance-matrix-and-scenario-harness.md)
- [`logs/phase-4-boardscene-local-default-wave-1.md`](./logs/phase-4-boardscene-local-default-wave-1.md)
- [`logs/phase-4-local-board-and-player-path-automation-completion.md`](./logs/phase-4-local-board-and-player-path-automation-completion.md)

Goal: make classic local board the first genuinely playable default entrypoint.

Covers: F1, F3, F9, F11.

Outputs:

- Gate 2 preflight is landed:
    - `/play/local` is explicitly the classic-local default route;
    - `/play/local?shell=debug` preserves the legacy `MatchView` fallback;
    - `/play/local?scenario=<row-id>` supports deterministic scenario bootstrap;
    - the Player Path Acceptance Matrix freezes the `seed + starting fixture + expected finalStateHash` triad for all 8 rows.
- Gate 3 productization is landed:
    - the default `/play/local` renderer now uses the shared `BoardScene`;
    - `?shell=debug` still preserves the legacy `MatchView + ReplayDrawer` fallback;
    - `BoardSceneScaffold` remains playground/debug-only and does not flow back into the product entrypoint;
    - board / market / royal affordances become interactive only when a unique payload match exists;
    - `TerminalOverlay`, market buy/reserve affordances, and stable `data-testid` hooks are now in place.
- Gate 4 is now closed:
    - `pnpm check-phase4` now runs the full `apps/web/tests/phase4/` directory;
    - all 8 player paths are automated by `local-player-paths.spec.ts`;
    - every row asserts visible, usable, unique UI affordances;
    - every row asserts the frozen `current-final-state-hash`;
    - `/play/local?shell=debug` still preserves the legacy shell while completing the deterministic path.
- `MatchPlayground` now exposes a `phase4-interactive-ready` client marker so Gate 4 Playwright runs wait for hydration before interacting.
- `tools/check-phase4.mjs` and `tools/check-visual.mjs` now use a web-start path that correctly serves client assets, avoiding the earlier standalone startup path that rendered SSR HTML without completing hydration.
- `check-visual` now includes a productized local-board scene baseline and passes a final regression run after rebaseline.

Done criteria:

- Players can finish the classic core flow without reading raw action buttons.
- The Player Path Acceptance Matrix now has Playwright interaction closure rather than bootstrap-only coverage.
- `/play/local` is now driven by the product-facing `BoardScene`.
- `/play/local?shell=debug` still preserves the legacy shell fallback.
- The Phase 4 local-player gate is now closed; later product scope is still governed by Phase 5 / 6 / 7 / 8.

#### Phase 5 - `/play/ai` and `/play/run` Parity

Goal: move AI and run flows onto the same main board, with auxiliary state in sidecars only.

Covers: F10.

Outputs:

- Hook `AiTraceDrawer` and `RunPanel` into the shared full-board scene.
- Split AI strategy into a more testable `ai/` surface rather than burying it inside session glue.
- Add fixed-seed AI replay / `finalStateHash` baselines.

Done criteria:

- Local / AI / run all share the same main board structure.
- AI / run differences are isolated to sidecars, not separate main layouts.

#### Phase 6 - `/rooms/[roomId]`, Spectator, and Online Consistency Gates

Goal: converge online player / spectator / resync / disconnected / waiting states into one board system and add leak-prevention gates.

Covers: F4, F8.

Outputs:

- Move `room-live-client` onto the shared `BoardScene`.
- Make `viewerRole='spectator'` disable interaction automatically.
- Add property tests ensuring spectator DOM / serialized view models do not leak `hiddenState`, `deckOrder`, opponent reserve-card faces, or opponent `pendingSelection` drafts.
- Add Playwright or equivalent integration tests for resync, seq-gap, and out-of-turn seats.

Done criteria:

- Local / AI / run / online player / spectator all converge on the same board system.
- Spectator-visibility invariants become a real gate rather than a manual promise.
- `room-service` still sends filtered data only and does not take on renderer-specific branching.

#### Phase 7 - Replay, QA, A11y, Mobile, and Product Finish

Goal: complete replay-on-board, visual regression, accessibility, and small-screen polish.

Covers: F9.

Outputs:

- Reuse the full-board scene for replay inspection with timeline, step forward/backward, and hash badge.
- Formal visual-regression baselines, accessibility checks, keyboard paths, and loading skeletons.
- A finalized small-screen / mobile strategy.
- i18n / externalized UI strings.

Done criteria:

- The full-board UI is playable, debuggable, replay-aware, and accessible.
- The default player entrypoint no longer exposes the text-summary + button-list shell.

#### Phase 8 - Desktop Offline Packaging Validation

Goal: validate Desktop as an actual shared-shell distribution target instead of a theoretical one.

Covers: F2.

Outputs:

- Finalize a real Desktop runtime assembly plan with the Web shell: `next start` child process, constrained export, or another explicit supported strategy.
- Desktop build, launch, asset-loading, and full-board smoke/e2e coverage.
- Re-close the Desktop artifact wording in release-prep once validated.

Done criteria:

- Desktop is no longer treated as complete merely because it theoretically reuses Web routes.
- `apps/desktop` has a verifiable full-board runtime at the build/startup layer.

### Default Decisions

- Continue reusing the shared application/ui boundary; do not add a new package or return to page-local rule-aware renderers.
- Default the visual direction toward a dark tactical dashboard rather than extending the current white debug layout.
- Deliver classic local board first, then AI / run / online parity.
- Keep debug / replay / trace tooling, but move it into sidecar / drawer surfaces instead of the main stage.

### Immediate High-ROI Order

1. Milestone E: move `/play/ai` and `/play/run` toward parity so AI trace and run sidecars live on the same main board as `/play/local`.
2. Milestone F: formalize spectator invariants and room-status reconciliation tests before `/rooms/[roomId]` renderer migration begins.
3. Milestone G: continue hardening visual governance and screenshot policy before replay / a11y / mobile finish work.
4. Milestone H: do not upgrade Desktop offline wording until the shared-shell startup path is explicitly validated.
