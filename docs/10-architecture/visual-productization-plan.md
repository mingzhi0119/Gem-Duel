# Visual Productization Plan — Dark Tactical Board Shell

## ZH

### 1. 文档定位

本文是功能性收口完成（Step 00-08 + full-board roadmap Phase 0-8 + Hardening Wave 1 全部关闭，`v1.0.2` 已 tag）之后，为"视觉产品化壳层"建立的独立治理文档。

> V1–V7 已全部落地；独立审计结论与 Visual Hardening Wave 1 步骤见 [`./visual-productization-independent-audit.md`](./visual-productization-independent-audit.md)。本 plan 对 V1–V7 视为冻结。后续 2026-04-19 的 target-first landscape/direct-trigger active-match 波次已转入 [`./play-interface-target-first-plan.md`](./play-interface-target-first-plan.md) 独立治理。

它只解决一件事：把 `packages/ui` 的 shared `BoardScene` 与其承载的产品入口（`/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`、Desktop shared shell）从当前的 **白底 validation / debug 排版** 升级为 **dark tactical dashboard 产品壳层**。

本文与 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) 是同级平行文档，不回填 roadmap 的 phase 编号。

同时，本文补充两条产品化壳层能力：

- `Theme`：至少支持 `Dark`、`Light`、`System` 三种模式；
- `Style`：预留视觉风格切换层，供后续切换卡牌形态、背景 dashboard、装饰密度与材质语言，但不在本轨道中扩展业务契约。

### 2. 功能性收口验收（准入条件）

视觉产品化轨道允许启动的前提是以下已验证事实：

- Step 00-08 全部 `Completed`（见 [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md)）。
- Full-board roadmap Phase 0-8 + Hardening Wave 1 全部关闭（见 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)）。
- `v1.0.0` / `v1.0.1` / `v1.0.2` 三个 release tag 已上线，trunk CI gate 稳定。
- Remaining Hardening Backlog 仅剩 App-wide locale routing 与 Desktop packaging 两个**产品决策**，非工程阻塞。

本文所记录的工作**不**得绕开上述门禁；如视觉改动触发 `check-phase{4..8}`、`check-a11y`、`check-visual` 或 `check-contracts` 回归，必须原地修复再 merge，不得在本文档内软化验收。

### 3. 参照物

| 来源                                                                                                                                               | 作用                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [gem-duel-dev.vercel.app](https://gem-duel-dev.vercel.app/)                                                                                        | 交互完成度、micro-interaction、动效节奏的权威参考站                       |
| `GemDuel-Dev/`（本地 gitignored 目录）                                                                                                             | 只读预览参考；可浏览、截图、对照实现方式，但不允许修改、import 或逐字搬运 |
| 用户提供的 "现状" 截图                                                                                                                             | 当前白底 debug 排版的起点 baseline                                        |
| 用户提供的 "目标" 截图                                                                                                                             | 最小视觉完成度；任何 sub-phase 不得低于其呈现的版式与密度                 |
| [`./phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)                                             | `packages/ui` 布局、tokens 与 visual harness 既有规则                     |
| [`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md) | `UiViewModel v2` 字段与 pending-selection 投影决策                        |

### 4. 不变约束（硬边界）

- `packages/ui` 仍只做展示 + 回调，不承载规则 / 计分 / Buff / authority 逻辑。
- 不扩 contract、不扩 `UiViewModel`、不扩 `pendingSelection`、不扩 room-service 协议。**缺字段一律先回到契约层讨论，再做渲染。**
- `GemDuel-Dev/` 是本地 gitignored 的只读 preview reference；可以浏览、截图、总结实现方式，但**不允许**修改、import 或逐字搬运到现行架构。任何从它获得的想法都必须重新以当前 contracts / shared-shell seams 重写。
- 所有产品入口继续从 shared `BoardScene` 渲染；不允许再造页面级 rule-aware renderer。
- `apps/desktop` 不引入 desktop-specific gameplay renderer；新视觉必须同时在 Web 与 Desktop shared shell 下成立。
- 不回流 legacy code；旧版视觉仅作为 `docs/99-legacy/` 与 git-history 的参考。
- 新增/修改视觉不得破坏以下 gate：`check-phase4`、`check-phase5`、`check-phase6`、`check-phase7`、`check-phase8`、`check-a11y`、`check-visual`、`check-contracts`、`check-deps`、`check-boundaries`、`lint`、`typecheck`、`test`、`build`。
- `check-a11y` 的 serious / critical 违规必须保持为 0；dark theme 对比度压缩不允许破线。
- `Theme` 与 `Style` 只允许改变表现层 tokens、layout density、surface chrome、card skin、dashboard background 与 motion 节奏；不得改变 action 可用性、信息过滤、hidden-state redaction 或任何 authority 语义。
- `System` theme 必须以平台/浏览器的 `prefers-color-scheme` 为真相源，而不是在页面层自造第四套状态机。
- `Style` 在本轨道中只允许作为**可扩展接口与默认样式位**落地；除非后续单列 sub-phase，否则不得借机扩成多套未验证主题包。
- 不新增 command / effect / buff / session surface；如果目标图里出现的 affordance（如 Save / Load）在当前 contract 下无对应 action，必须在 sub-phase V5 之前单列"缺 action 决策"条目，**禁止**视觉壳层替代业务逻辑。

### 5. 当前 → 目标 差距分析

| 区域                              | 当前（第一张图）                                              | 目标（第二张图 + 参考站）                                                                                           | 主责文件                                                                                   |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Shell 基调                        | `--gd-background: #f5f2eb` 白底 + 灰文字                      | dark navy / slate 底 + 高对比亮字 + 柔性发光                                                                        | `packages/ui/src/styles/tokens.css`                                                        |
| 顶部 HUD                          | 单行 TURN HUD 卡片，含 `Viewer / Seat / Phase / Current` 文本 | 左右对称 P1 / P2 头像 + 王冠(VP) + 筹码(token)，中心 turn 胶囊                                                      | `packages/ui/src/hud/turn-hud.tsx`                                                         |
| 右侧功能栏                        | 无                                                            | 设置 rail：分辨率信息 + Save / Load / Restart / Rules + `Theme(Dark / Light / System)` + 预留 `Style` 入口          | **新增** `packages/ui/src/hud/session-rail.tsx`（或类似）                                  |
| Market                            | 线性"pyramid / reserve" 列表，每卡为 `LOCKED` 文本 pill       | 3 层金字塔（L3 窄 / L2 中 / L1 宽），左侧 deck 占位 + 右侧实体卡，卡面含等级色条、分值、宝石开销 icon               | `packages/ui/src/board/market-stack.tsx` + `card-slot.tsx`                                 |
| Board（宝石矩阵）                 | 未作为主视觉焦点                                              | 居中 5×5 圆形宝石 token 阵，空位以深色凹槽表示                                                                      | `packages/ui/src/board/board-grid.tsx` + `token-cell.tsx`                                  |
| Royal Court                       | 右侧纵向列表                                                  | 2×2 金色方卡，卡面含 VP 与图腾                                                                                      | `packages/ui/src/board/royal-court.tsx`                                                    |
| Action 计数器                     | 无可视 counter                                                | 底部居中 `ACTION 1 / 1` 两列胶囊                                                                                    | `packages/ui/src/hud/turn-hud.tsx` 或新 `action-counter.tsx`                               |
| Player zones                      | 堆叠 "Additional Actions" 空态文本                            | 左右对称玩家槽：头像 + 已持有 token 点阵 + 预留卡槽 + 贵族卡槽 + 空态文案靠边                                       | `packages/ui/src/board/player-zone.tsx` + `reserve-tray.tsx`                               |
| Prompt / Selection                | 横条 banner                                                   | 叠加在主 stage 上的半透明 overlay，不挤压 grid                                                                      | `packages/ui/src/board/prompt-banner.tsx` + `selection-overlay.tsx`                        |
| Sidecar（Replay / AiTrace / Run） | 右侧 drawer 静态展开                                          | 折叠式 drawer，默认收起，触发后从右滑入覆盖而不压缩主盘面                                                           | `packages/ui/src/drawer/*`                                                                 |
| Theme                             | 默认浅色 debug 底，仅 docs 提到 dark direction                | 产品内建 `Dark / Light / System` 三态，所有入口共用同一 theme truth                                                 | `packages/ui/src/styles/tokens.css` + `packages/ui/src/views/board-scene.tsx` + rail       |
| Style                             | 无                                                            | 预留 style registry，后续可切换 card shape、dashboard background、surface density，但当前仅 ship `default tactical` | `packages/ui/src/styles/*` + **新增** `packages/ui/src/styles/style-registry.ts`（或类似） |
| Playground fixtures               | 浅色 scaffold                                                 | 四个 scene（classic / spectator / run / terminal）全部切到 dark tokens，用同一主题呈现                              | `apps/web/app/playground/scene-fixtures.tsx`                                               |

### 6. 分阶段计划（Visual Sub-Phases）

所有 sub-phase 串行执行，每个 sub-phase 关闭前必须产出对应 log，结构对标 `docs/10-architecture/logs/phase-*.md`。命名统一为 `logs/visual-v{N}-<slug>.md`。

#### V1 — Design tokens, theme foundation, and style registry stub

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v1-theme-foundation-and-style-registry.md`](./logs/visual-v1-theme-foundation-and-style-registry.md)。

- 范围：重写 `packages/ui/src/styles/tokens.css` 为 dark tactical 基调；新增/调整 spacing、radii、shadow、typography scale、gem palette；同时建立 theme token 分层与 style registry stub。
- 输出：
    - 新 tokens + `styles/shell.css` 的颜色/阴影引用切换；
    - `Theme` 三态基础：`dark`、`light`、`system`；
    - `system` 跟随 `prefers-color-scheme`；
    - `Style` registry 的第一版接口，只内建 `default-tactical` 一套 style，但预留后续挂载：
        - card shape / card frame silhouette；
        - dashboard background / board-stage backdrop；
        - surface density / chrome ornament level。
- 不做：组件结构重排、layout 改动。
- 完成标准：
    - `check-visual` 四个 playground scene 全部完成一次受控 rebaseline；
    - `check-a11y` 保持 0 serious/critical；
    - 所有已有 BoardScene 产品入口在本 sub-phase 结束后仍可渲染，无 runtime 破损；
    - `Theme = dark / light / system` 至少在 playground 与一个产品入口上可被 smoke 验证；
    - `Style` 虽暂不暴露给最终用户，但 registry key 已存在，默认回退稳定。

#### V2 — Layout restructure（三区 shell 骨架）

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v2-layout-restructure.md`](./logs/visual-v2-layout-restructure.md)。

- 范围：把 `BoardScene` 与 `shell.css` 的主栅格重排为：顶部 HUD（P1 侧 / 中央 turn 胶囊 / P2 侧）+ 中央主 stage（Market · Board · Royal Court 三柱）+ 底部 player zones（左右对称）+ 右侧 rail slot（slot 本身先占位，不绑定 action）。
- 输出：`BoardScene` 接受新的 slot API（`header`, `primaryStage`, `secondaryStage`, `footer`, `rail`），但默认仍组合现有 primitives。
- 不做：primitives 内容改造；settings rail 的真实 affordance 绑定；多套 style 视觉分叉。
- 完成标准：
    - `/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]` 五个产品入口都已切到新 slot 组合；
    - `MatchView` fallback (`?shell=debug`) 不受影响；
    - `check-phase{4..8}` 全绿；`check-visual` baseline 受控刷新。

#### V3 — Center stage primitives（Market / Board / Royal Court）

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v3-center-stage-primitives.md`](./logs/visual-v3-center-stage-primitives.md)。

- 范围：按目标图重写 `MarketStack` 的 3 层金字塔视觉（L3 / L2 / L1 宽度递增、deck 占位、等级色条）；`BoardGrid` / `TokenCell` 改为圆形宝石 token + 凹槽；`RoyalCourt` 切到 2×2 金色方卡。
- 输出：保持现有 props / 事件不变，只换实现与样式。
- 不做：玩家区、HUD、drawer 视觉。
- 完成标准：
    - playground `classic-selection`、`spectator-resync`、`run-sidecar`、`terminal-victory` 四个 scene 的中央舞台视觉都切到新形态；
    - pending-selection 高亮、selectable、disabled 三态的 a11y 对比度通过 axe-core；
    - `check-visual` baseline 受控刷新。

#### V4 — HUD, player zones, action counter

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v4-hud-player-zone-action-counter.md`](./logs/visual-v4-hud-player-zone-action-counter.md)。

- 范围：`TurnHud` 改为左右对称 P1/P2 头像 + 王冠/筹码计数 + 中央 turn 胶囊；`PlayerZone` + `ReserveTray` 改为目标图的底部双槽布局（token 点阵 + reserved cards + royal cards）；新增底部 `ACTION N / N` 计数胶囊（复用 `turn-hud` 或 `hud/action-counter.tsx`，由 sub-phase V4 决定）。
- 输出：新 HUD / zone 布局，所有字段都从现有 `UiViewModel` 投影，**不**扩 contract。
- 不做：设置 rail 的真实 action 绑定；drawer 的视觉细节。
- 完成标准：
    - 所有产品入口都看到新 HUD + 玩家区；
    - Phase 6 spectator inertness、out-of-turn read-only、Phase 4 8 条玩家路径自动化仍绿；
    - Phase 7 replay keyboard 导航与 focus-visible 仍通过 `check-phase7` + `check-a11y`。

#### V5 — Session rail, theme switching, and affordance decisions

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v5-session-rail-theme-rules-restart.md`](./logs/visual-v5-session-rail-theme-rules-restart.md)。

- 范围：落地右侧 rail，并先把 rail affordance 的真实语义固定下来：
    - `Rules` → 链接到已有 `/rulebook`，无契约变动；
    - `Theme` → 客户端主题切换，正式支持 `Dark` / `Light` / `System`，并保持 theme truth 在 shared shell 范围内一致，不让 `/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]` 各自漂移；
    - `Restart` → `/play/*` surface 复用现有 session reload；`room` / `replay` surface 不伪造新 action，只以 `Reload View` 语义重载当前 route；
    - `Save` / `Load` → 当前 contract **未提供**持久化 action；V5 选择 **A**，先从产品 rail 中移除，待未来有真实 persistence / export-import contract 再增补；
    - `Style` → V5 选择 **B** 的保守形态：暴露只含 `default tactical` 的只读 style pill，明确 registry 已就位，但当前不提供第二套视觉；
    - 语言切换：本波不新增 app-wide locale routing，只复用现有 locale surface 输出双语 rail 文案与可访问名称。
- 输出：
    - `session-rail.tsx`（或等价组件）+ 对应 messages；
    - `BoardScene` 通过 shared rail slot 在五个产品入口挂载 session rail；
    - Theme selector 为正式产品能力；
    - Style selector 或 style placeholder 为预留能力，且当前落地为只读 `default tactical` pill。
- 不做：任何扩 `UiViewModel` / `pendingSelection` / action surface 的动作。
- 完成标准：
    - `check-phase4` 继续绿，主盘面可达 hash 冻结值；
    - 新按钮全部有 a11y name 与键盘可达；
    - rail 文案双语；
    - `Dark / Light / System` 至少在 Web 与 Desktop shared shell 下各完成一次 smoke 验证；
    - `Style` 的默认回退、持久化键名与未知值容错策略已写入 log。

#### V6 — Sidecar & drawer 视觉产品化

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v6-dark-tactical-drawers.md`](./logs/visual-v6-dark-tactical-drawers.md)。

- 范围：`SidecarDrawer`、`ReplayDrawer`、`AiTraceDrawer`、`RunPanel`、`TerminalOverlay` 的视觉切到 dark tactical，**收起为默认态**；drawer 打开时覆盖而不挤压主 stage。
- 输出：统一的 overlay drawer shell、motion、focus-trap 与 close path；`Run` / `Replay` / `AI Trace` / `Terminal` 都保留显式 badge/trigger 入口，其中 `/play/run` 继续保留 run 入口而不把 run 数据塞回主盘面。
- 不做：drawer 内部的结构重排或数据源改动。
- 完成标准：
    - `/replays/[replayId]` 键盘导航 + `check-phase7` + mobile baseline 全绿；
    - `/play/ai` AI trace drawer 视觉 / a11y 通过；
    - `/play/run` run panel 视觉 / a11y 通过。

#### V7 — Regression rebaseline, desktop parity, evidence

- 状态：已于 2026-04-18 完成，见 [`logs/visual-v7-release-ready-closure.md`](./logs/visual-v7-release-ready-closure.md)。

- 范围：在 `apps/web/tests/visual/**` 下集中更新 baseline；确认 Desktop shared shell 在 `check-phase8` 下的主盘面 smoke 仍命中 frozen `finalStateHash = fnv1a-32b1c890`；视觉日志 + 证据摘要。
- 输出：`logs/visual-v7-release-ready-closure.md`，含最终 `check-visual`、`check-a11y` 与 `check-phase{4..8}` 的验证命令列表与摘要。
- 完成标准：
    - `pnpm check-visual`（不带 `--update-snapshots`）一次性通过；
    - `pnpm check-a11y` 全绿；
    - `pnpm check-phase4` / `check-phase5` / `check-phase6` / `check-phase7` / `check-phase8` 全绿；
    - `release-prep.md` §3 全部门禁不变且继续通过，允许走新一轮 `v1.1.0` 语义版本（由人工在 trunk 上决定）。

### 7. 完成标准（整体）

整个视觉产品化轨道允许关闭的条件：

- `/play/local` 默认 renderer 的视觉 = 第二张目标图或更高完成度，不再有白底 debug 残留。
- `/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`、Desktop shared shell 的视觉基线与 `/play/local` 对齐，差异只存在于其各自 sidecar。
- `Theme` 的 `Dark / Light / System` 在上述所有产品入口中行为一致；`System` 跟随平台色彩偏好。
- `Style` 至少具备一个受治理的默认值与一个可扩展 registry，不要求在本轨道内一次性 shipping 多套 style。
- `packages/ui` 所有 primitives 的 props / 事件 API 保持兼容；**未**引入新 contract 字段。
- `MatchView` fallback (`?shell=debug`) 仍可用于回归定位。
- `check-phase{4..8}` / `check-a11y` / `check-visual` 全部继续绿。
- `release-prep.md` §3 acceptance gate 未被修改；`v1.0.x` tag 语义保留，新的视觉 major 走独立 semver 决策。

### 8. 非目标

- 不引入 app-wide locale routing（仍在 roadmap backlog）。
- 不做 Desktop packaging（签名 / 商店 / 独立分发；仍在 roadmap backlog）。
- 不扩 `UiViewModel` / `pendingSelection` / room-service protocol / replay schema。
- 不在本轨道内承诺一口气 shipping 多套 style pack；Style 先作为扩展点而不是内容爆炸点。
- 不新增 command / effect / Buff / ruleset；如视觉需要某个 affordance 但无对应 action，按 V5.A 剔除或 V5.B 明确语义转换，不得在视觉层伪造业务。
- 不改 `apps/room-service` 权威语义与 fanout 行为。
- 不回填 `full-board-ui-roadmap.md` 的 phase 编号；本文与 roadmap 并列，不纳入 roadmap 编号序列。

### 9. 风险与缓解

| 风险                                                                             | 缓解                                                                                                      |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 视觉 churn 导致 `check-visual` 频繁 rebaseline，混入非视觉回归                   | 每个 sub-phase 只在其限定的目录下允许 `--update-snapshots`，并要求 log 文件显式列出 baseline 变更面与证据 |
| dark theme 压缩对比度，`check-a11y` 漂红                                         | V1 的 tokens 先与 axe-core 对拍；对比度 < 4.5:1 的 token 组合不得进入 trunk                               |
| 目标图里存在当前 contract 未覆盖的 affordance（Save / Load / 语言）              | V5 决策门硬卡：未决策前，UI 上不得出现这些按钮                                                            |
| `Theme` / `Style` 状态在 Web 与 Desktop shared shell 下不一致                    | theme/style truth 必须收敛到 shared shell 层；V5 与 V7 都要在 Web + Desktop smoke 中验证                  |
| Style 预留能力过早变成多套半成品皮肤，拖垮 baseline                              | V1 只落 registry，V5 只落入口/placeholder；新增第二套 style 必须另开 visual log，不得夹带上线             |
| Desktop shared shell 在新视觉下资源加载漂移                                      | V7 的 Desktop parity check 必须覆盖 `check-phase8` 的 classic-local smoke path + frozen hash              |
| 本地 `GemDuel-Dev/` 误被当成活动源码                                             | 根 `.gitignore`、`AGENTS.md` 与 `eslint.config.mjs` 的 import ban 共同阻断；docs 只能引用其预览思路       |
| 未来新增 shell（如 mobile/native）时，rail / presentation-sync 只活在 web app 层 | 当前放置是刻意选择，因为两者依赖 Next/browser APIs；一旦新增 shell，必须先重抽这两条 seam，再共享视觉语义 |
| 本文与 `full-board-ui-roadmap.md` 并行造成"phase 编号再开"错觉                   | 本文明确标注"平行文档 + 非 roadmap phase"，所有 log 使用 `visual-v{N}-*` 前缀                             |

### 10. 证据与 gate 策略

每个 sub-phase 关闭时必须产出：

- 一个 `docs/10-architecture/logs/visual-v{N}-<slug>.md`，包含：
    - 范围 / 输出 / 未覆盖项；
    - 变更的 `packages/ui` / `apps/web` / `apps/desktop` 文件清单；
    - 执行命令与摘要（`check-visual`、`check-a11y`、`check-phase{4..8}`、`lint`、`typecheck`、`test`、`build`）；
    - baseline 变更面与变更原因；
    - 若触及 Desktop，需附 `check-phase8` 的 Electron smoke 摘要。

V7 关闭时，向 `docs/40-operations/release-prep.md` §3 acceptance gate 之外**不**添加新命令；如确需新增一条视觉专用门禁，走 [`./engineering-standards.md`](./engineering-standards.md) 的 gate 提案流程单独评审，不在本文件内决定。

### 11. 参考

- [`./full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)
- [`./full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md)
- [`./visual-productization-independent-audit.md`](./visual-productization-independent-audit.md)
- [`./phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)
- [`../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md)
- [`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md)
- [`../40-operations/release-prep.md`](../40-operations/release-prep.md)
- [`./preview-ui-productization-plan.md`](./preview-ui-productization-plan.md)
- `GemDuel-Dev/`（本地 gitignored preview reference）
- [gem-duel-dev.vercel.app](https://gem-duel-dev.vercel.app/)

## EN

### 1. Document Role

This is the standalone governance doc for the **visual productization shell**, launched after functional closure completed (Step 00-08 + full-board roadmap Phase 0-8 + Hardening Wave 1 all closed, `v1.0.2` tagged).

> V1–V7 have all landed. The independent-audit verdict and the Visual Hardening Wave 1 follow-up steps are captured in [`./visual-productization-independent-audit.md`](./visual-productization-independent-audit.md). This plan stays frozen for V1–V7. The later 2026-04-19 target-first landscape/direct-trigger active-match wave is now governed separately in [`./play-interface-target-first-plan.md`](./play-interface-target-first-plan.md).

It only addresses one goal: upgrade the shared `BoardScene` in `packages/ui` and the product entrypoints it feeds (`/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]`, Desktop shared shell) from the current **light-theme validation / debug layout** to a **dark tactical dashboard product shell**.

This doc is a peer to [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) and does not reopen roadmap phase numbering.

This track also adds two shell-level productization capabilities:

- `Theme`: at least `Dark`, `Light`, and `System`;
- `Style`: a reserved visual-style layer for future card-shape, dashboard-background, and chrome-language switching without expanding gameplay contracts in this track.

### 2. Functional-Closure Admission

This track is only allowed to start because the following are already true:

- Step 00-08 are all `Completed` (see [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md)).
- Full-board roadmap Phase 0-8 and Hardening Wave 1 are all closed (see [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)).
- `v1.0.0` / `v1.0.1` / `v1.0.2` release tags are live; trunk CI gates are stable.
- The Remaining Hardening Backlog only holds App-wide locale routing and Desktop packaging, both of which are **product decisions** rather than engineering blockers.

Work described here **must not** bypass these gates. If visual changes break `check-phase{4..8}`, `check-a11y`, `check-visual`, or `check-contracts`, fix them on the same branch — this doc does not soften acceptance.

### 3. Reference Material

| Source                                                                                                                                             | Role                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [gem-duel-dev.vercel.app](https://gem-duel-dev.vercel.app/)                                                                                        | Authoritative site for interaction finish, micro-interactions, and motion cadence                                                                        |
| `GemDuel-Dev/` (local gitignored directory)                                                                                                        | Read-only preview reference; may be browsed, screenshotted, and studied for implementation shape, but must not be modified, imported, or copied verbatim |
| User-provided "current state" screenshot                                                                                                           | Starting baseline for the light debug layout                                                                                                             |
| User-provided "target" screenshot                                                                                                                  | Minimum visual bar; no sub-phase may ship below this density                                                                                             |
| [`./phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)                                             | Existing rules for `packages/ui` layout, tokens, and visual harness                                                                                      |
| [`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md) | `UiViewModel v2` field and pending-selection projection decisions                                                                                        |

### 4. Invariants (hard boundary)

- `packages/ui` remains presentation plus callbacks only; it may not own rules, scoring, Buff, or authority logic.
- Do not expand contracts, `UiViewModel`, `pendingSelection`, or the room-service protocol. **Missing fields go to the contract layer first, not the renderer.**
- `GemDuel-Dev/` is a gitignored, read-only local preview reference. It may be browsed, screenshotted, and mined for interaction / layout / motion ideas, but it must never be edited, imported, or copied verbatim into the active architecture. Any borrowed idea must be re-authored against the current contracts and shared-shell seams.
- All product entrypoints keep rendering through the shared `BoardScene`; page-local rule-aware renderers are forbidden.
- `apps/desktop` does not get a desktop-specific gameplay renderer; the new visuals must hold for both Web and Desktop shared shells.
- No legacy code is imported back; the legacy visual only exists as a reference in `docs/99-legacy/` and git history.
- Visual changes must never break: `check-phase4`, `check-phase5`, `check-phase6`, `check-phase7`, `check-phase8`, `check-a11y`, `check-visual`, `check-contracts`, `check-deps`, `check-boundaries`, `lint`, `typecheck`, `test`, `build`.
- `check-a11y` serious / critical violations must stay at 0; dark-theme contrast may not cross the line.
- `Theme` and `Style` may only affect presentation tokens, layout density, shell chrome, card skins, dashboard backgrounds, and motion rhythm; they may not alter action availability, filtering, hidden-state redaction, or authority semantics.
- `System` theme must treat `prefers-color-scheme` as the source of truth rather than inventing a fourth page-local mode.
- `Style` is only allowed to land here as an extension surface plus a default slot; unless a later sub-phase says otherwise, this track does not silently ship multiple unverified style packs.
- No new command / effect / Buff / session surface. If the target image shows an affordance that has no current action (Save / Load, etc.), the decision must land in sub-phase V5 before any rail button appears. The visual shell must never fake business logic.

### 5. Current → Target Gap Analysis

| Area                | Current (image 1)                                          | Target (image 2 + reference site)                                                                                                               | Primary file                                                                                    |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Shell tone          | `--gd-background: #f5f2eb` light + gray text               | Dark navy / slate base + high-contrast typography + soft glow                                                                                   | `packages/ui/src/styles/tokens.css`                                                             |
| Top HUD             | Single `Viewer / Seat / Phase / Current` row               | Symmetric P1 / P2 avatars + crown (VP) + chip (tokens) + central turn pill                                                                      | `packages/ui/src/hud/turn-hud.tsx`                                                              |
| Right session rail  | Absent                                                     | Resolution info + Save / Load / Restart / Rules + `Theme (Dark / Light / System)` + reserved `Style` entry                                      | **New** `packages/ui/src/hud/session-rail.tsx` (or equivalent)                                  |
| Market              | Linear "pyramid / reserve" list, `LOCKED` text pills       | Three tiers (L3 narrow / L2 medium / L1 wide), deck placeholder left + face-up card with level stripe, point number, gem-cost icons             | `packages/ui/src/board/market-stack.tsx` + `card-slot.tsx`                                      |
| Board (gem grid)    | Not visually centered                                      | 5×5 round gem tokens with dark sockets for empty cells, centered as main stage                                                                  | `packages/ui/src/board/board-grid.tsx` + `token-cell.tsx`                                       |
| Royal Court         | Vertical list                                              | 2×2 gold cards with VP numbers and crests                                                                                                       | `packages/ui/src/board/royal-court.tsx`                                                         |
| Action counter      | None                                                       | `ACTION N / N` bottom capsule                                                                                                                   | `packages/ui/src/hud/turn-hud.tsx` or a new `action-counter.tsx`                                |
| Player zones        | Stacked "Additional Actions" empty text                    | Symmetric player slots: avatar + token chip row + reserved-card slot + royal-card slot with empty-state copy on the edge                        | `packages/ui/src/board/player-zone.tsx` + `reserve-tray.tsx`                                    |
| Prompt / Selection  | Horizontal banner                                          | Semi-transparent overlay on top of the stage; does not compress the grid                                                                        | `packages/ui/src/board/prompt-banner.tsx` + `selection-overlay.tsx`                             |
| Sidecar drawers     | Always-expanded right panel                                | Collapsed by default; opens as an overlay from the right instead of squeezing the stage                                                         | `packages/ui/src/drawer/*`                                                                      |
| Theme               | Light debug baseline only, dark intent exists only in docs | Built-in `Dark / Light / System` with one shared truth across all entrypoints                                                                   | `packages/ui/src/styles/tokens.css` + `packages/ui/src/views/board-scene.tsx` + rail            |
| Style               | None                                                       | Reserved style registry for future card-shape / dashboard-background / shell-density switching, but only `default tactical` ships in this track | `packages/ui/src/styles/*` + **new** `packages/ui/src/styles/style-registry.ts` (or equivalent) |
| Playground fixtures | Light scaffolding                                          | All four scenes (classic / spectator / run / terminal) share the new dark tokens                                                                | `apps/web/app/playground/scene-fixtures.tsx`                                                    |

### 6. Visual Sub-Phases

Sub-phases run serially; each must produce a log under `docs/10-architecture/logs/visual-v{N}-<slug>.md` before the next one begins.

#### V1 — Design tokens, theme foundation, and style-registry stub

- Status: completed on 2026-04-18. See [`logs/visual-v1-theme-foundation-and-style-registry.md`](./logs/visual-v1-theme-foundation-and-style-registry.md).

- Scope: rewrite `packages/ui/src/styles/tokens.css` into the dark tactical palette; add / adjust spacing, radii, shadow, typography scale, and gem palette; also establish theme-token layering and a style-registry stub.
- Output:
    - new tokens plus the `styles/shell.css` color / shadow references;
    - a three-state `Theme` foundation: `dark`, `light`, `system`;
    - `system` follows `prefers-color-scheme`;
    - a first-pass `Style` registry API that only ships `default-tactical`, but reserves hooks for:
        - card shape / card-frame silhouette;
        - dashboard background / board-stage backdrop;
        - surface density / chrome ornament level.
- Not in scope: component restructuring or layout changes.
- Done criteria:
    - A controlled rebaseline of all four playground scenes in `check-visual`;
    - `check-a11y` stays at 0 serious / critical;
    - All existing `BoardScene` product entrypoints still render without runtime breakage;
    - `Theme = dark / light / system` is smoke-verified in playground plus at least one product entrypoint;
    - `Style` does not surface to end users yet, but its registry key and default fallback are stable.

#### V2 — Layout restructure (three-zone shell)

- Status: completed on 2026-04-18. See [`logs/visual-v2-layout-restructure.md`](./logs/visual-v2-layout-restructure.md).

- Scope: re-lay `BoardScene` and `shell.css` into: top HUD (P1 side / central turn pill / P2 side) + center stage (Market · Board · Royal Court as three columns) + bottom player zones (symmetric) + right rail slot (slot only, no action wiring yet).
- Output: `BoardScene` accepts the new slot API (`header`, `primaryStage`, `secondaryStage`, `footer`, `rail`) but keeps composing the existing primitives by default.
- Not in scope: primitive internals; real affordance wiring on the rail.
- Done criteria:
    - `/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]` all switched to the new slot composition;
    - `MatchView` fallback (`?shell=debug`) untouched;
    - `check-phase{4..8}` all green; `check-visual` baseline refreshed in a controlled scope.

#### V3 — Center-stage primitives (Market / Board / Royal Court)

- Status: completed on 2026-04-18. See [`logs/visual-v3-center-stage-primitives.md`](./logs/visual-v3-center-stage-primitives.md).

- Scope: rebuild `MarketStack` as the three-tier pyramid (L3 / L2 / L1 widening, deck placeholder, level-color stripe); `BoardGrid` / `TokenCell` become round gem tokens + sockets; `RoyalCourt` becomes the 2×2 gold card grid.
- Output: props / events unchanged; only implementation and styling change.
- Not in scope: player zones, HUD, drawers.
- Done criteria:
    - All four playground scenes render the new center stage;
    - axe-core clears the contrast for the three-state cell (selectable / selected / disabled);
    - `check-visual` baseline refreshed in a controlled scope.

#### V4 — HUD, player zones, action counter

- Status: completed on 2026-04-18. See [`logs/visual-v4-hud-player-zone-action-counter.md`](./logs/visual-v4-hud-player-zone-action-counter.md).

- Scope: `TurnHud` becomes the symmetric P1 / P2 layout with avatars + crown / chip counts + central turn pill; `PlayerZone` + `ReserveTray` become the bottom dual-slot layout (token chip row + reserved cards + royal cards); add the `ACTION N / N` bottom capsule (inside `turn-hud` or a new `hud/action-counter.tsx`, decided in V4).
- Output: new HUD / zone layout; every field projected from the current `UiViewModel` — **no** contract expansion.
- Not in scope: rail wiring; drawer polish.
- Done criteria:
    - All product entrypoints show the new HUD + player zones;
    - Phase 6 spectator inertness and Phase 4 8-path automation still green;
    - Phase 7 replay keyboard navigation and focus-visible still pass `check-phase7` + `check-a11y`.

#### V5 — Session rail, theme switching, and affordance decisions

- Status: completed on 2026-04-18. See [`logs/visual-v5-session-rail-theme-rules-restart.md`](./logs/visual-v5-session-rail-theme-rules-restart.md).

- Scope: land the right rail and close the affordance semantics before the UI ships:
    - `Rules` → link to the existing `/rulebook`, no contract change;
    - `Theme` → client-side `Dark` / `Light` / `System` switching with one shared-shell truth across `/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, and `/replays/[replayId]`;
    - `Restart` → reuse the existing session reload behavior on `/play/*`; on `room` / `replay` surfaces the rail keeps the action presentation-only as `Reload View` and reloads the current route rather than inventing a new command;
    - `Save` / `Load` → the contract **does not** provide persistence today; V5 chooses **A** and removes those buttons from the product rail until a real persistence / export-import contract exists;
    - `Style` → V5 chooses the conservative form of **B**: expose a read-only `default tactical` style pill so the registry is visible, while explicitly not shipping a second validated style;
    - Locale routing is still out of scope; this wave only lands bilingual rail copy and accessible names on top of the current locale surfaces.
- Output:
    - `session-rail.tsx` (or equivalent) + messages;
    - `BoardScene` mounts the session rail across the five product entrypoints through the shared rail slot;
    - Theme selector becomes a real product feature;
    - Style selector or placeholder becomes a reserved feature surface, currently represented by a read-only `default tactical` pill.
- Not in scope: any `UiViewModel` / `pendingSelection` / action-surface expansion.
- Done criteria:
    - `check-phase4` still green with the frozen hash;
    - All new buttons have a11y names and keyboard paths;
    - Rail copy is bilingual;
    - `Dark / Light / System` is smoke-verified in both Web and Desktop shared shells;
    - the `Style` default fallback, persistence key, and unknown-value recovery policy are documented in the log.

#### V6 — Sidecar & drawer visual productization

- Status: completed on 2026-04-18. See [`logs/visual-v6-dark-tactical-drawers.md`](./logs/visual-v6-dark-tactical-drawers.md).

- Scope: bring `SidecarDrawer`, `ReplayDrawer`, `AiTraceDrawer`, `RunPanel`, `TerminalOverlay` into dark tactical styling; **default to collapsed**; drawers open as an overlay rather than compressing the stage.
- Output: one overlay drawer shell with shared motion, focus-trap, and close path; `Run`, `Replay`, `AI Trace`, and `Terminal` all keep explicit badge/trigger affordances, and `/play/run` keeps its run entrypoint without pushing run metadata back into the board stage.
- Not in scope: internal drawer restructuring or data-source changes.
- Done criteria:
    - `/replays/[replayId]` keyboard navigation + `check-phase7` + mobile baseline all green;
    - `/play/ai` AI trace drawer passes visual / a11y gates;
    - `/play/run` run panel passes visual / a11y gates.

#### V7 — Regression rebaseline, Desktop parity, evidence

- Status: completed on 2026-04-18. See [`logs/visual-v7-release-ready-closure.md`](./logs/visual-v7-release-ready-closure.md).

- Scope: refresh the baselines under `apps/web/tests/visual/**`; confirm the Desktop shared shell still hits the frozen `finalStateHash = fnv1a-32b1c890` in `check-phase8`; record evidence.
- Output: `logs/visual-v7-release-ready-closure.md` with the full command list and summary for `check-visual`, `check-a11y`, and `check-phase{4..8}`.
- Done criteria:
    - `pnpm check-visual` (without `--update-snapshots`) passes in one go;
    - `pnpm check-a11y` is fully green;
    - `pnpm check-phase4` / `check-phase5` / `check-phase6` / `check-phase7` / `check-phase8` are all green;
    - `release-prep.md` §3 gates remain unchanged and still green, so a `v1.1.0` semantic bump is allowed (decided manually on trunk).

### 7. Overall Done Criteria

The visual productization track may close when:

- `/play/local` default renderer matches or exceeds the target screenshot, with no light-theme debug residue.
- `/play/ai`, `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]`, and the Desktop shared shell share the same visual baseline as `/play/local`; differences only live inside their respective sidecars.
- `Theme` behaves consistently across all those entrypoints for `Dark / Light / System`; `System` follows the platform preference.
- `Style` has at least one governed default value and one extensible registry surface, even if this track only ships a single style.
- Every primitive in `packages/ui` keeps its props / events API; **no** new contract fields are introduced.
- `MatchView` fallback (`?shell=debug`) is still usable for regression triage.
- `check-phase{4..8}` / `check-a11y` / `check-visual` all remain green.
- `release-prep.md` §3 acceptance gate is untouched; `v1.0.x` tag semantics stand, and any new visual-major release is decided under its own semver bump.

### 8. Non-Goals

- No app-wide locale routing (still on the roadmap backlog).
- No Desktop packaging (signing / store / separate distribution; still on the roadmap backlog).
- No expansion of `UiViewModel` / `pendingSelection` / room-service protocol / replay schema.
- No promise to ship multiple style packs in one pass; Style lands here as an extension point first, not as an explosion of half-finished skins.
- No new commands / effects / Buffs / rulesets. If the visual requires an affordance without a matching action, V5 must either drop it (option A) or reshape it (option B); no fake business logic in the visual shell.
- No changes to `apps/room-service` authority semantics or fanout behavior.
- No rebackfill of `full-board-ui-roadmap.md` phase numbering; this document sits alongside the roadmap and never enters its phase sequence.

### 9. Risks and Mitigations

| Risk                                                                                                    | Mitigation                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visual churn triggers frequent `check-visual` rebaselines that hide non-visual regressions              | Each sub-phase may only run `--update-snapshots` on a scoped directory, and its log must list every baseline it changed and why                        |
| Dark theme compresses contrast and trips `check-a11y`                                                   | V1 token set is validated against axe-core ahead of merge; any token pair below 4.5:1 is rejected                                                      |
| The target image contains affordances not backed by the current contract (Save / Load / locale)         | V5 is a hard decision gate; without a decision, the rail must not show those buttons                                                                   |
| `Theme` / `Style` state drifts between Web and Desktop shared shells                                    | Theme/style truth must collapse to the shared shell layer; both V5 and V7 validate Web + Desktop smoke                                                 |
| The reserved Style surface mutates into multiple half-finished skins too early                          | V1 only lands the registry; V5 only lands the selector/placeholder; any second style requires its own visual log and may not be smuggled in            |
| Desktop shared shell drifts on asset loading after the restyle                                          | V7 Desktop-parity check is mandatory via `check-phase8`'s classic-local smoke path + frozen hash                                                       |
| Local `GemDuel-Dev/` is mistaken for active source                                                      | The root `.gitignore`, `AGENTS.md`, and `eslint.config.mjs` import ban jointly block it; docs may only cite its preview ideas                          |
| A future shell (for example mobile/native) leaves rail / presentation-sync trapped in the web app layer | The current placement is intentional because both seams depend on Next/browser APIs; any new shell must re-extract them before sharing shell semantics |
| This doc running alongside `full-board-ui-roadmap.md` could be misread as a "new phase"                 | The doc explicitly declares itself as a peer track with `visual-v{N}-*` log prefixes                                                                   |

### 10. Evidence and Gate Strategy

Each sub-phase, when closed, must produce:

- A `docs/10-architecture/logs/visual-v{N}-<slug>.md` log containing:
    - Scope / outputs / out-of-scope items;
    - The list of touched files across `packages/ui`, `apps/web`, and `apps/desktop`;
    - Executed commands and summary (`check-visual`, `check-a11y`, `check-phase{4..8}`, `lint`, `typecheck`, `test`, `build`);
    - Which baselines were changed and why;
    - If Desktop is touched, a summary of the `check-phase8` Electron smoke run.

When V7 closes, no new command is added to `docs/40-operations/release-prep.md` §3 acceptance gate. Any new visual-specific gate must go through the gate-proposal process in [`./engineering-standards.md`](./engineering-standards.md) and is not decided inside this document.

### 11. References

- [`./full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)
- [`./full-board-ui-roadmap-phase-0-3-independent-audit.md`](./full-board-ui-roadmap-phase-0-3-independent-audit.md)
- [`./visual-productization-independent-audit.md`](./visual-productization-independent-audit.md)
- [`./phase-2.5-ui-layout-and-visual-harness-plan.md`](./phase-2.5-ui-layout-and-visual-harness-plan.md)
- [`../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md`](../30-contracts/phase-2-uiviewmodel-2.0-contract-prep.md)
- [`../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md`](../90-adr/ADR-0006-board-selection-model-and-uiviewmodel-projection.md)
- [`../40-operations/release-prep.md`](../40-operations/release-prep.md)
- [`./preview-ui-productization-plan.md`](./preview-ui-productization-plan.md)
- `GemDuel-Dev/` (local gitignored preview reference)
- [gem-duel-dev.vercel.app](https://gem-duel-dev.vercel.app/)
