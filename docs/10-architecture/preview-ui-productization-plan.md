# Preview UI Productization Plan

Date: 2026-04-18
Status: Active workstream; the initial player-surface landing and the single-screen arena refactor completed on 2026-04-18, and the later target-first landscape/direct-trigger active-match wave is governed separately by [`./play-interface-target-first-plan.md`](./play-interface-target-first-plan.md).

## ZH

### 1. 目标

本文件定义 preview UI workstream 的产品化边界：把当前 Web / Desktop 默认玩家表面，从 validation-shell 导向的入口与辅助排版，提升为更接近 `GemDuel-Dev/` 预览版完成度的玩家产品入口。

它覆盖：

- `/`
- `/play/classic`
- `/play/roguelike`
- `/rooms`
- `/play/local`
- `/play/ai`
- `/play/run`
- `/rooms/[roomId]`
- `/replays/[replayId]`
- Desktop shared shell 对上述入口的同构消费

本工作流与 [`./visual-productization-plan.md`](./visual-productization-plan.md) 互补：

- `visual-productization-plan.md` 负责 shared `BoardScene` / shell 的深色战术化产品壳；
- 本文件负责默认玩家入口、hub、大厅与 run draft / offer 过渡面的产品化改写与验收边界。

### 2. 硬边界

- `GemDuel-Dev/` 只作为本地 gitignored、只读 preview reference；允许浏览、截图、总结实现方式，但不允许修改、不允许 import、不允许逐字搬运。
- 允许 **display-only additive contract change**，但只限 shared `UiViewModel` projection 层所需的展示字段；禁止扩 `UiActionDescriptor`、禁止新增跨边界事件、禁止改变 authority / replay / command wire shape。
- `packages/ui` 仍只承载展示 primitives；路由与浏览器状态继续留在 `apps/web` / `apps/desktop`。
- 活跃对局主盘面继续复用 shared `BoardScene`、`SessionRail`、`SidecarDrawer`，不回退到页面级 rule-aware renderer。
- `lang` 继续使用轻量 query surface，不在本工作流中引入 app-wide locale routing。
- `?shell=debug` 只保留在真实主盘面路由，不扩散到首页、hub 与 online lobby。

### 3. 计划范围

#### 3.1 产品路由与外壳

- 根布局去除常驻工程 header / nav，仅保留产品级外壳与 theme/style sync。
- 首页改为 title screen，固定三张主入口卡片：`Classic`、`Roguelike`、`Online Duel`。
- 新增 `/play/classic` 与 `/play/roguelike` 两个 hub 页面，负责把用户分流到既有对局入口。
- `/rooms` 改为 host / join 双栏 online arena 大厅。
- `/replays/[replayId]` 与 `/rooms/[roomId]` 补产品化 topbar / back link，但不改变底层 session / authority 语义。

#### 3.2 Shared presentation primitives

- 新增纯展示的 player-facing scenes / primitives：
    - title hero / player entry scene
    - mode card
    - back link
    - online lobby split panels
    - full-screen draft / offer scene
- 所有新增玩家文案进入既有 bilingual message catalog。

#### 3.3 Run 过渡态

- `RunPlayground` 在无 `viewModel` 且存在 starter draft / reward offer 时，渲染 full-screen draft scene，而不是普通 `Section` debug panel。
- 一旦进入 active match，立即切回 shared `BoardScene`。

#### 3.4 验收与证据

- 为首页、classic hub、roguelike hub、online arena、run draft 新增 visual baselines。
- 扩大 a11y 覆盖到首页、hub、大厅与 run draft surface。
- Phase 4-8 gate 必须继续全绿，Desktop 额外补首页 parity 断言。

### 4. 首轮已落地内容

首轮玩家入口落地结果见 [`./logs/preview-ui-player-surface-productization.md`](./logs/preview-ui-player-surface-productization.md)，包括：

- 首页 / hub / online lobby 的产品化重写；
- `mode=local|ai` 驱动的 roguelike hub 分流；
- run draft full-screen scene；
- room / replay / active-match topbar 与 back-link 接线；
- 新入口的 phase4-8、a11y、visual 验收。

### 4.2 第二轮已落地内容：Single-Screen Arena

第二轮收口见 [`./logs/preview-ui-single-screen-arena-refactor.md`](./logs/preview-ui-single-screen-arena-refactor.md)，包括：

- `/play/local`、`/play/ai`、`/play/run`、已绑定 `/rooms/[roomId]` 与 `/replays/[replayId]` 统一切到单屏 `Arena` 壳；
- 顶部极小菜单 + 隐藏 controls overlay，取代默认常驻 rail / drawer；
- dark tactical 的直角工业风、三段式 grid、三列中台与对称底部 dashboard；
- `UiMarketSlot` / `UiRoyalOffer` 的 display-only additive contract fields；
- 重新跑绿的 phase4-8、a11y 与 visual rebaseline。

### 4.3 后续活跃对局波次：Target-First Landscape + Direct Trigger

2026-04-19 之后，active-match surface 的后续波次不再继续挂在本文件的 display-only/product-entry 边界之下，而是转入单独治理文档 [`./play-interface-target-first-plan.md`](./play-interface-target-first-plan.md)。原因是该波次：

- 继续沿用本文件的 desktop player-facing 视觉目标；
- 但已经超出“只做 additive presentation/product-entry 收口”的边界；
- 会显式改动 command/replay compatibility（移除 `BEGIN_*`，改为 direct-trigger command surface）。

对应落地结果见 [`./logs/play-interface-target-first-landscape-refactor.md`](./logs/play-interface-target-first-landscape-refactor.md)。

### 5. 非目标

- 不引入 Save / Load。
- 不实现 app-wide locale routing。
- 不为 authority / replay / command wire shape 追赶预览版而扩 contract；若需要 richer shell，可通过 display-only additive projection 字段处理。
- 不为 Desktop 单独实现第二套 renderer。

## EN

### 1. Goal

This document defines the product boundary for the preview UI workstream: upgrade the default Web / Desktop player surfaces from validation-shell-oriented entrypoints and support layouts to player-facing product surfaces that are closer to the `GemDuel-Dev/` preview quality bar.

It covers:

- `/`
- `/play/classic`
- `/play/roguelike`
- `/rooms`
- `/play/local`
- `/play/ai`
- `/play/run`
- `/rooms/[roomId]`
- `/replays/[replayId]`
- Desktop shared-shell parity for the same routes

This workstream complements [`./visual-productization-plan.md`](./visual-productization-plan.md):

- `visual-productization-plan.md` governs the dark tactical shell for the shared `BoardScene`;
- this document governs the productization of the default player entrypoints, hubs, lobby, and run draft / offer transitional surfaces.

### 2. Hard Boundaries

- `GemDuel-Dev/` remains a local gitignored, read-only preview reference; it may be browsed, screenshotted, and studied for implementation ideas, but it must not be edited, imported, or copied verbatim.
- **Display-only additive contract changes are allowed**, but only for fields required by the shared `UiViewModel` presentation layer. `UiActionDescriptor`, cross-boundary events, authority semantics, replay shapes, and command wire shapes must not expand in this workstream.
- `packages/ui` still owns presentation primitives only; routing and browser state remain in `apps/web` / `apps/desktop`.
- Active-match surfaces must keep reusing the shared `BoardScene`, `SessionRail`, and `SidecarDrawer`; no page-level rule-aware renderer may be reintroduced.
- `lang` stays as a lightweight query-surface concern; this workstream does not introduce app-wide locale routing.
- `?shell=debug` remains available only on the real board routes and must not spread to the homepage, hubs, or online lobby.

### 3. Planned Scope

#### 3.1 Product routes and shell

- Remove the always-visible engineering header / nav from the root layout and keep only the product shell plus theme/style sync.
- Replace the homepage with a title screen that offers exactly three primary cards: `Classic`, `Roguelike`, and `Online Duel`.
- Add `/play/classic` and `/play/roguelike` hubs that fan users into the existing play routes.
- Rewrite `/rooms` as a host / join online-arena lobby.
- Add product-style topbars / back links to `/replays/[replayId]` and `/rooms/[roomId]` without altering session or authority semantics.

#### 3.2 Shared presentation primitives

- Add pure presentation scenes / primitives for:
    - the title hero / player entry scene
    - mode cards
    - back links
    - split online-lobby panels
    - a full-screen draft / offer scene
- All new player-facing copy must land in the existing bilingual message catalog.

#### 3.3 Run transitional state

- When `RunPlayground` has no `viewModel` but does have a starter draft / reward offer, render a full-screen draft scene instead of a plain debug `Section`.
- As soon as the run enters an active match, return to the shared `BoardScene`.

#### 3.4 Acceptance and evidence

- Add visual baselines for the homepage, classic hub, roguelike hub, online arena, and run draft.
- Extend a11y coverage to the homepage, hubs, lobby, and the run draft surface.
- Keep Phase 4-8 gates green, with an extra Desktop homepage parity assertion.

### 4. First Landing

The first player-entry landing is recorded in [`./logs/preview-ui-player-surface-productization.md`](./logs/preview-ui-player-surface-productization.md), including:

- productized homepage / hubs / online lobby;
- the `mode=local|ai` roguelike hub fanout;
- the full-screen run draft scene;
- room / replay / active-match topbar and back-link wiring;
- phase4-8, a11y, and visual acceptance for the new entrypoints.

### 4.2 Second Landing: Single-Screen Arena

The second landing is recorded in [`./logs/preview-ui-single-screen-arena-refactor.md`](./logs/preview-ui-single-screen-arena-refactor.md), including:

- the single-screen `Arena` shell for `/play/local`, `/play/ai`, `/play/run`, bound `/rooms/[roomId]`, and `/replays/[replayId]`;
- the tiny top-right menu plus hidden controls overlay replacing the default always-visible rails and drawers;
- the dark tactical hard-edged shell, three-row grid, three-column central arena, and symmetric bottom dashboard;
- display-only additive contract fields on `UiMarketSlot` and `UiRoyalOffer`;
- refreshed phase4-8, a11y, and controlled visual rebaseline evidence.

### 4.3 Later Active-Match Wave: Target-First Landscape + Direct Trigger

After 2026-04-19, further active-match work is no longer governed only by this preview/product-entry plan. It moves into the dedicated document [`./play-interface-target-first-plan.md`](./play-interface-target-first-plan.md) because that wave:

- continues the same desktop player-facing target;
- but goes beyond additive presentation/product-entry closure;
- and intentionally changes command/replay compatibility by removing `BEGIN_*` in favor of a direct-trigger command surface.

The landing itself is recorded in [`./logs/play-interface-target-first-landscape-refactor.md`](./logs/play-interface-target-first-landscape-refactor.md).

### 5. Non-goals

- No Save / Load.
- No app-wide locale routing.
- No authority / replay / command-wire contract expansion to chase preview-only data fields; richer shells must stay within display-only additive projection fields.
- No Desktop-specific second renderer.
