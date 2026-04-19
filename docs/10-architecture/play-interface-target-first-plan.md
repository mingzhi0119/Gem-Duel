# Play Interface Target-First Plan

Date: 2026-04-19
Status: Active governance document; the first landscape/direct-trigger landing shipped on 2026-04-19.

## ZH

### 1. 目标与精神

- `TargetUI.png` 是桌面版对局界面的最高视觉准则，允许参考 `GemDuel-Dev/` 的布局/动效思路，但后者始终只是只读 preview reference。
- 活跃对局界面必须是 **横屏优先、桌面优先** 的 shared shell：常见 `16:9` 与 `16:10` 视口不允许再出现“中间一小块、左右大边框”的布局。
- 对局交互必须遵守 **zero-middle-state** 原则：不再要求玩家先点击 “Begin Gem Selection / Begin Buy / Begin Reserve / Begin Privilege” 一类模式按钮，再去点真正的热区。
- 交互精神不是“按钮先选模式”，而是“热区本身就是命令入口”：
    - 点宝石面板 = 直接开始/继续拿宝石；
    - 点可买卡 = 直接买牌；
    - 点可保留卡 = 直接保留；
    - 点 royal / privilege / effect prompt = 直接响应当前引擎 prompt。

### 2. 适用范围

统一覆盖以下活跃或近活跃 shared shell 路由：

- `/play/local`
- `/play/ai`
- `/play/run`
- 已绑定 viewer 的 `/rooms/[roomId]`
- `/replays/[replayId]`
- Desktop 对以上路由的同构消费

窄屏 / 移动端重构不属于本波次；当前只要求常见桌面横屏稳定成立。

### 3. 硬边界

- `packages/ui` 继续只承载展示 primitives 与回调，不引入规则、计分、Buff、authority 逻辑。
- 路由壳、动画、query state、浏览器态留在 `apps/web` / `apps/desktop`；规则真相继续来自 `packages/core-engine`，路由编排继续经 `packages/application`。
- `GemDuel-Dev/` 继续保持 gitignored、只读、不可 import、不可 verbatim copy。
- 本波允许 **breaking contract/replay change**，但必须同时更新：
    - `packages/contracts`
    - 对应 migration note
    - ADR
    - tracker 与 matching log
- `Save / Load` 继续不出现在产品壳里，直到真实 persistence / import-export contract 存在。
- `?shell=debug` 保留为显式 regression fallback，但不再主导产品交互。

### 4. 桌面壳层要求

- 活跃对局 route 的外层 width clamp 必须移除；桌面壳层改为 full-bleed landscape frame。
- shared shell 目标结构固定为：
    - 顶部 HUD
    - 中部三列 stage（Market / Board / Royal）
    - 底部双玩家 dashboard
    - 常驻右侧能力通过 drawer / rail 进入，而不是把主盘面压窄
- `16:9` 与 `16:10` 视口都必须满足：
    - 无大面积左右留白
    - 主盘面不需要页面级滚动
    - footer/dashboard 不被 market/board 内容顶出视口

### 5. 交互重写

#### 5.1 Mandatory phase

- `TAKE_TOKENS_ADD_POSITION` 从 `turnIdle` 直接开始；第一次点击 board token 即创建/推进 pending selection。
- `BUY_CARD` 从 `turnIdle` 直接执行；market / reserve tray 上可买卡直接是热区。
- `RESERVE_CARD` 从 `turnIdle` 直接执行；deck placeholder 与 face-up card 都直接响应 reserve affordance。

#### 5.2 Optional / prompt windows

- `USE_PRIVILEGE_ADD_POSITION` 从可用的 privilege window 直接开始，不再经过 mode-gated begin command。
- royal / effect prompt / replay prompt 继续由引擎 prompt 真相驱动；当 prompt 存在时，热区直接对应 prompt command，而不是页面本地模式。
- future scroll / replenish / similar prompt-style affordances 若要出现，也必须沿用相同 direct-trigger discipline。

#### 5.3 Confirm / cancel

- confirm / cancel 只保留给多步选择流程：
    - `TAKE_TOKENS_CONFIRM` / `TAKE_TOKENS_CANCEL`
    - `USE_PRIVILEGE_CONFIRM` / `USE_PRIVILEGE_CANCEL`
- 对 one-shot command，不允许再出现“先选模式，再确认进入模式”的中间态。

### 6. 契约与 replay 政策

- 从公开 `GameCommand` 移除：
    - `BEGIN_GEM_SELECTION`
    - `BEGIN_RESERVE`
    - `BEGIN_BUY`
    - `BEGIN_PRIVILEGE`
- 从公开 `GamePhase` 移除不再对外可观察的 mode-gated phases：
    - `reserving`
    - `buying`
- `commands[]` 里的旧 begin-command replay 只视为旧 schema/debug 语义，不承诺与新 command surface 向前兼容。
- `events[]` 继续是 replay 的 authority truth；`commands[]` 仍保留为 debug / review surface。
- 本波次将 `SCHEMA_VERSION` bump 到 `7.0.0`，并同步记录新的 `ENGINE_VERSION`，用来显式声明 command/replay compatibility break。

### 7. 技术实现约束

- Layout / shell composition: `Tailwind CSS`
- Motion / panel transitions / shell entrance: `Framer Motion`
- Transient shell-only interaction state: shared React Context
- 不在本波引入新的 Zustand store

### 8. 验收条

- shared shell 在 `16:10` 与 `16:9` 桌面视口都有截图证据，且不再出现大左右边框。
- `packages/contracts`、`packages/application`、`packages/core-engine` 的 deterministic tests 通过。
- 相关 golden replay fixtures 已刷新并记录 hash 变化原因。
- `docs/30-contracts/*`、`docs/90-adr/*`、tracker、matching log 已同步。
- Web/Desktop 继续共用同一套主盘面 renderer；未为 Desktop fork 第二套 gameplay shell。

## EN

### 1. Goal and Spirit

- `TargetUI.png` is the highest-fidelity desktop reference for the active play surface. `GemDuel-Dev/` may inform layout and motion, but it remains a read-only preview reference.
- The active match surface must be **landscape-first and desktop-first**: common `16:9` and `16:10` viewports may no longer render a tiny centered arena with large side gutters.
- Match interaction must follow the **zero-middle-state** rule. Players should not have to click a “Begin Gem Selection / Begin Buy / Begin Reserve / Begin Privilege” button before clicking the real hotspot.
- The interaction model becomes “the hotspot is the command”:
    - click a board token to start/continue token-taking;
    - click a buyable card to buy;
    - click a reservable card/deck to reserve;
    - click a royal / privilege / effect prompt affordance to answer that engine-owned prompt directly.

### 2. Route Scope

This shared-shell wave covers:

- `/play/local`
- `/play/ai`
- `/play/run`
- bound viewers on `/rooms/[roomId]`
- `/replays/[replayId]`
- Desktop parity for those same surfaces

Narrow/mobile redesign is explicitly out of scope for this wave.

### 3. Hard Boundaries

- `packages/ui` remains presentation-only and does not absorb gameplay rules, scoring, Buff, or authority logic.
- Routing shell, animation, query state, and browser orchestration stay in `apps/web` / `apps/desktop`; engine truth remains in `packages/core-engine`, and route orchestration still flows through `packages/application`.
- `GemDuel-Dev/` stays gitignored, read-only, non-importable, and may not be copied verbatim.
- This wave allows a **breaking contract/replay change**, but only if the contracts, migration note, ADR, tracker, and matching log all move together.
- `Save / Load` remain absent from the product shell until a real persistence/import-export contract exists.
- `?shell=debug` remains as an explicit regression fallback, not as the primary product interaction surface.

### 4. Desktop Shell Requirements

- The active-match route width clamp must be removed so the desktop shell becomes a full-bleed landscape frame.
- The shared-shell target layout is:
    - persistent top HUD
    - three-column center stage (Market / Board / Royal)
    - two-player bottom dashboard
    - auxiliary capabilities moved behind a drawer / rail rather than shrinking the arena
- Both `16:9` and `16:10` desktop viewports must satisfy:
    - no oversized left/right gutters
    - no page-level scrolling for the main arena
    - no market/board overflow that crushes the footer/dashboard

### 5. Interaction Rewrite

#### 5.1 Mandatory phase

- `TAKE_TOKENS_ADD_POSITION` begins directly from `turnIdle`; the first board-token click creates or advances the pending selection.
- `BUY_CARD` executes directly from `turnIdle`; buyable market cards and reserve trays are direct hotspots.
- `RESERVE_CARD` executes directly from `turnIdle`; both deck placeholders and face-up cards expose reserve affordances directly.

#### 5.2 Optional/prompt windows

- `USE_PRIVILEGE_ADD_POSITION` begins directly from the privilege window rather than through a begin command.
- royal/effect/replay prompts remain engine-owned and prompt-driven; when a prompt exists, the hotspot maps directly to the prompt command rather than a page-local mode.
- Future scroll/replenish/prompt-style affordances must follow the same direct-trigger discipline if they surface later.

#### 5.3 Confirm/cancel

- confirm/cancel remain only for multi-step selections:
    - `TAKE_TOKENS_CONFIRM` / `TAKE_TOKENS_CANCEL`
    - `USE_PRIVILEGE_CONFIRM` / `USE_PRIVILEGE_CANCEL`
- One-shot commands may not reintroduce a “select mode first” middle step.

### 6. Contract and Replay Policy

- Remove these public `GameCommand` entries:
    - `BEGIN_GEM_SELECTION`
    - `BEGIN_RESERVE`
    - `BEGIN_BUY`
    - `BEGIN_PRIVILEGE`
- Remove the no-longer-observable mode-gated `GamePhase` values:
    - `reserving`
    - `buying`
- Old begin-command replays inside `commands[]` are treated as old-schema/debug semantics and are not guaranteed to remain forward-compatible with the new product shell.
- `events[]` remain the authoritative replay truth; `commands[]` remain a debug/review surface.
- This wave bumps `SCHEMA_VERSION` to `7.0.0` and records a new `ENGINE_VERSION` to declare the command/replay compatibility break explicitly.

### 7. Technical Constraints

- Layout and shell composition: `Tailwind CSS`
- Motion, panel transitions, and shell entrance: `Framer Motion`
- Transient shell-only interaction state: shared React Context
- No new Zustand store in this wave

### 8. Acceptance Bar

- The shared shell has screenshot evidence at both `16:10` and `16:9` desktop breakpoints, with the large side-gutter problem removed.
- Deterministic tests pass across `packages/contracts`, `packages/application`, and `packages/core-engine`.
- Golden replay fixtures are refreshed and the hash changes are documented.
- `docs/30-contracts/*`, `docs/90-adr/*`, the tracker, and the matching log are all synchronized.
- Web and Desktop continue to consume the same main-board renderer; no Desktop-specific gameplay shell is introduced.
