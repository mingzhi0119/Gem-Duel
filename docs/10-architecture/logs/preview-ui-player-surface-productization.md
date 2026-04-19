# Preview UI Player-Surface Productization

Date: 2026-04-18

Superseded note:

- 2026-04-18 later in the day, the active-match parts of this landing were superseded by [`preview-ui-single-screen-arena-refactor.md`](./preview-ui-single-screen-arena-refactor.md), which moved in-match surfaces to a pure single-screen Arena shell and allowed a limited display-only contract expansion for `UiMarketSlot` / `UiRoyalOffer`.

## ZH

### 范围

- 将默认玩家入口从 validation shell 改成 preview-style 的 title screen / hub / online arena。
- 新增 `/play/classic` 与 `/play/roguelike`，并让 `/play/run` 通过 `mode=local|ai` 承接 roguelike hub 分流。
- 把 run starter draft / offer 改成 full-screen 玩家场景，而不是普通 debug section。
- 在 active-match、room live 与 replay 路由上补产品化 topbar / back link；该部分随后被 single-screen Arena wave 覆盖为更纯净的对局壳。
- 补齐首页、hub、大厅、run draft 的 phase4-8、a11y 与 visual evidence。

### 落地结果

- 根布局去掉了常驻工程导航，首页现在是 dark tactical title screen，提供 `Classic`、`Roguelike`、`Online Duel` 三个主入口。
- `/play/classic` 与 `/play/roguelike` 已作为新的对局分流 hub 落地，并保留 `lang` query 透传。
- `/rooms` 现在是 host / join 双栏 online arena；host 可创建房间并跳转，join 面板支持直接输入 room id。
- `RunPlayground` 的 starter draft / offer 已改成 full-screen `DraftChoiceScene`；进入 active match 后仍回到 shared `BoardScene`。
- `/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]` 最初补了产品化 topbar / back link；随后 single-screen Arena wave 移除了默认常驻 topbar / rail 压盘面的做法，并以 display-only additive contract fields 完成 richer card presentation。
- 新的 player-facing scenes、copy 与 baselines 已收进 shared UI / i18n / visual harness，而不是散落在页面层。

### 主要变更文件

- 路由与 shell：
    - `apps/web/app/layout.tsx`
    - `apps/web/app/page.tsx`
    - `apps/web/app/play/classic/page.tsx`
    - `apps/web/app/play/roguelike/page.tsx`
    - `apps/web/app/play/run/page.tsx`
    - `apps/web/app/rooms/page.tsx`
    - `apps/web/app/rooms/[roomId]/page.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/play/components/match-playground.tsx`
    - `apps/web/app/play/components/run-playground.tsx`
    - `apps/web/app/play/components/session-board-shell.tsx`
- 新增展示 primitives：
    - `packages/ui/src/views/player-entry-scene.tsx`
    - `packages/ui/src/views/online-lobby-scene.tsx`
    - `packages/ui/src/views/draft-choice-scene.tsx`
    - `apps/web/app/components/product-entry-link-card.tsx`
    - `apps/web/app/components/product-back-link.tsx`
- 样式与文案：
    - `packages/ui/src/styles/shell.css`
    - `packages/ui/src/i18n/messages.ts`
    - `apps/web/app/globals.css`
- 验收与基线：
    - `apps/web/tests/phase4/player-entry-paths.spec.ts`
    - `apps/web/tests/phase5/ai-run-parity.spec.ts`
    - `apps/web/tests/phase6/room-lobby.spec.ts`
    - `apps/web/tests/phase7/replay-boardscene.spec.ts`
    - `apps/web/tests/phase8/desktop-shell.spec.ts`
    - `apps/web/tests/a11y/product-surfaces.spec.ts`
    - `apps/web/tests/visual/player-entry.spec.ts`
    - `apps/web/tests/visual/player-entry.spec.ts-snapshots/*`

### 验证

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

### 剩余注意项

- 这轮没有引入 app-wide locale routing；`lang` 仍只作为轻量 query surface 传递。
- 这轮没有新增 Save / Load；active-match 的后续 Arena wave 允许了 display-only additive contract fields，但仍未改变 authority / replay / command boundary。
- 主盘面仍受 shared `BoardScene` 与现有 `UiViewModel` 字段约束，因此不会伪造 preview-only 数据。

## EN

### Scope

- Replace the validation-shell entry experience with preview-style title-screen, hub, and online-arena surfaces.
- Add `/play/classic` and `/play/roguelike`, and let `/play/run` consume the roguelike hub via `mode=local|ai`.
- Replace the run starter draft / offer debug section with a full-screen player-facing scene.
- Add product topbars / back links to the active-match, room-live, and replay routes; the active-match portion was later superseded by the single-screen Arena wave.
- Add phase4-8, a11y, and visual evidence for the homepage, hubs, lobby, and run draft.

### Result

- The root layout no longer shows the always-visible engineering navigation; the homepage is now a dark tactical title screen with `Classic`, `Roguelike`, and `Online Duel` as the three primary entrypoints.
- `/play/classic` and `/play/roguelike` now exist as routing hubs, and both preserve the lightweight `lang` query passthrough.
- `/rooms` is now a split host / join online arena; hosts can create rooms and jump into them, while the join panel accepts a room id directly.
- `RunPlayground` now renders the starter draft / offer as a full-screen `DraftChoiceScene`, then returns to the shared `BoardScene` when an active match begins.
- `/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, and `/replays/[replayId]` initially gained product-style topbars / back links; the later single-screen Arena wave removed the always-visible chrome and added display-only additive contract fields for richer market / royal presentation without changing authority / replay / session semantics.
- The new player-facing scenes, copy, and baselines now live in shared UI / i18n / visual-harness layers instead of being scattered across page-level code.

### Major Changed Files

- Routes and shell:
    - `apps/web/app/layout.tsx`
    - `apps/web/app/page.tsx`
    - `apps/web/app/play/classic/page.tsx`
    - `apps/web/app/play/roguelike/page.tsx`
    - `apps/web/app/play/run/page.tsx`
    - `apps/web/app/rooms/page.tsx`
    - `apps/web/app/rooms/[roomId]/page.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/play/components/match-playground.tsx`
    - `apps/web/app/play/components/run-playground.tsx`
    - `apps/web/app/play/components/session-board-shell.tsx`
- New presentation primitives:
    - `packages/ui/src/views/player-entry-scene.tsx`
    - `packages/ui/src/views/online-lobby-scene.tsx`
    - `packages/ui/src/views/draft-choice-scene.tsx`
    - `apps/web/app/components/product-entry-link-card.tsx`
    - `apps/web/app/components/product-back-link.tsx`
- Styles and copy:
    - `packages/ui/src/styles/shell.css`
    - `packages/ui/src/i18n/messages.ts`
    - `apps/web/app/globals.css`
- Acceptance and baselines:
    - `apps/web/tests/phase4/player-entry-paths.spec.ts`
    - `apps/web/tests/phase5/ai-run-parity.spec.ts`
    - `apps/web/tests/phase6/room-lobby.spec.ts`
    - `apps/web/tests/phase7/replay-boardscene.spec.ts`
    - `apps/web/tests/phase8/desktop-shell.spec.ts`
    - `apps/web/tests/a11y/product-surfaces.spec.ts`
    - `apps/web/tests/visual/player-entry.spec.ts`
    - `apps/web/tests/visual/player-entry.spec.ts-snapshots/*`

### Validation

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

### Remaining Notes

- This wave does not introduce app-wide locale routing; `lang` remains a lightweight query-surface concern.
- This wave does not add Save / Load. A later Arena wave does allow display-only additive contract fields, but still does not alter the authority / replay / command boundary.
- The active-match surface is still constrained by the shared `BoardScene` and the existing `UiViewModel`, so no preview-only data was fabricated.
