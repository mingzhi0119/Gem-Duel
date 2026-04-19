# Preview UI Single-Screen Arena Refactor

Date: 2026-04-18

Superseded note:

- 2026-04-19 later active-match work moved into [`play-interface-target-first-landscape-refactor.md`](./play-interface-target-first-landscape-refactor.md), which widened the shell for `16:9` / `16:10` desktop use and removed the public `BEGIN_*` interaction gate in favor of the direct-trigger command surface.

## ZH

### 范围

- 将所有已进入对局状态的产品表面统一收敛到单屏 `Arena` 壳：
    - `/play/local`
    - `/play/ai`
    - `/play/run`
    - `/rooms/[roomId]` 的已绑定 player / spectator 视图
    - `/replays/[replayId]`
    - Desktop 对上述路径的同构消费
- 视觉上改成 dark tactical 的硬核直角工业风，并移除默认常驻 rail / drawer / topbar 对主盘面的挤压。
- 通过 additive contract change 为 `UiMarketSlot` / `UiRoyalOffer` 增加 display-only 字段，支撑 richer market / royal card face，但不改 command、authority、replay 或跨边界事件。

### 关键落地

- `BoardScene` 改为固定三段式单屏 shell：`64px` 顶栏、弹性中台、`176px` 底部 dashboard；根容器以 `100dvh` + `overflow: hidden` 保证 16:9 桌面视口无页面滚动。
- 顶部只保留对局核心信息：左右镜像的 P1 / P2 计分区、中央 turn box，以及一个右上角极小菜单按钮。
- 中台重排为三列：
    - 左列：市场列，保留牌堆 placeholder 与 pyramid / reserve affordance；
    - 中列：5×5 board + gem stock stats + refresh；
    - 右列：2×2 royal court + action counter。
- 底部改为对称玩家 dashboard，集中承载宝石库存、reserve cards 与 royal cards summary。
- 旧的 `SessionRail` / replay / AI trace / run status 默认不再常驻；这些控制项全部进入顶部小菜单中的紧凑 overlay。
- room route 现在保留“未绑定大厅 / 已绑定 Arena”两段：未绑定时显示 join/watch lobby，绑定后立即切入纯对局壳。
- replay route 把 locale switch、back link、timeline drawer 一起移入顶部 controls overlay，主盘面不再被辅助 UI 挤压。

### 契约与治理

- `packages/contracts/src/ui.ts` 新增：
    - `UiMarketSlot.score`
    - `UiMarketSlot.crowns`
    - `UiMarketSlot.bonusGem`
    - `UiMarketSlot.bonusCount`
    - `UiMarketSlot.cost`
    - `UiMarketSlot.accentColor`
    - `UiMarketSlot.patternKey`
    - `UiRoyalOffer.score`
    - `UiRoyalOffer.crowns`
    - `UiRoyalOffer.accentKey`
    - `UiRoyalOffer.patternKey`
    - `UiRoyalOffer.tagLabel`
- 这些字段只服务 presentation，不改变 replay bundle、snapshot tiers、room-service authority 或 command/event wire shape，因此仍属于 additive contract change。
- `packages/application` 已集中投影这些字段；`packages/ui` 只消费投影结果，不在页面层伪造 preview-only 数据。
- 本波因此不再沿用“preview UI workstream 永不扩 contracts”的旧口径；正确口径是“允许 display-only additive contract change，禁止 authority / replay / command boundary 扩展”。

### 主要变更文件

- 契约与 projection：
    - `packages/contracts/src/ui.ts`
    - `packages/contracts/src/__tests__/schemas.test.ts`
    - `packages/application/src/view-model/market.ts`
    - `packages/application/src/view-model/player-zones.ts`
- 共享 UI：
    - `packages/ui/src/views/board-scene.tsx`
    - `packages/ui/src/hud/turn-hud.tsx`
    - `packages/ui/src/board/card-slot.tsx`
    - `packages/ui/src/board/market-stack.tsx`
    - `packages/ui/src/board/royal-court.tsx`
    - `packages/ui/src/board/player-zone.tsx`
    - `packages/ui/src/board/token-cell.tsx`
    - `packages/ui/src/drawer/sidecar-drawer.tsx`
    - `packages/ui/src/primitives/arena-icons.tsx`
    - `packages/ui/src/styles/shell.css`
    - `packages/ui/src/i18n/messages.ts`
- 宿主接线：
    - `apps/web/app/play/components/session-board-shell.tsx`
    - `apps/web/app/rooms/[roomId]/room-live-client.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/components/session-rail.tsx`
    - `apps/web/app/playground/scene-fixtures.tsx`
- 验收：
    - `apps/web/tests/phase4/*`
    - `apps/web/tests/phase5/ai-run-parity.spec.ts`
    - `apps/web/tests/phase6/room-boardscene.spec.ts`
    - `apps/web/tests/phase7/replay-boardscene.spec.ts`
    - `apps/web/tests/phase8/desktop-shell.spec.ts`
    - `apps/web/tests/a11y/*`
    - `apps/web/tests/visual/*`

### 验证

- `corepack pnpm typecheck`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`

### 剩余注意项

- `Begin Gem Selection` / `Begin Reserve` / `Begin Buy` 等 command label 仍沿用当前 projection 文案；若后续要做更强的产品化动作命名，需要单独处理 action label 的 i18n / projection，而不是在页面层硬改。
- 市场仍保持真实可见 card slot 数量，不为了草图视觉去隐藏现有规则可见牌位。

## EN

### Scope

- Converge every in-match surface onto one single-screen `Arena` shell:
    - `/play/local`
    - `/play/ai`
    - `/play/run`
    - the bound player / spectator states of `/rooms/[roomId]`
    - `/replays/[replayId]`
    - Desktop parity for those same routes
- Shift the visual language to a dark tactical, hard-edged industrial presentation and remove the always-visible rail / drawer / topbar pressure from the main board.
- Add display-only contract fields to `UiMarketSlot` / `UiRoyalOffer` so richer market / royal card faces can be rendered without changing commands, authority, replay, or other cross-boundary events.

### Key Landing

- `BoardScene` is now a fixed three-row single-screen shell: a `64px` top bar, a flexible central arena, and a `176px` bottom dashboard. The root uses `100dvh` plus `overflow: hidden` so 16:9 desktop surfaces do not scroll.
- The top bar now carries only core match information: mirrored P1 / P2 score blocks, a central turn box, and one tiny top-right menu button.
- The central arena is now a three-column composition:
    - left: market column with deck placeholders plus pyramid / reserve affordances;
    - center: the 5x5 board, gem-stock stats, and refresh affordance;
    - right: a 2x2 royal court and the action counter.
- The bottom area is now a symmetric player dashboard for gem inventory plus reserve / royal summaries.
- `SessionRail`, replay controls, AI trace, and run status are no longer always visible; they all move behind the top-right compact controls overlay.
- The room route now has a clean split between the unbound lobby and the bound Arena: join/watch stays outside the match shell until the viewer is actually bound.
- The replay route moves the locale switch, back link, and timeline drawer into the same controls overlay so the main board no longer gets squeezed by auxiliary chrome.

### Contracts And Governance

- `packages/contracts/src/ui.ts` now adds:
    - `UiMarketSlot.score`
    - `UiMarketSlot.crowns`
    - `UiMarketSlot.bonusGem`
    - `UiMarketSlot.bonusCount`
    - `UiMarketSlot.cost`
    - `UiMarketSlot.accentColor`
    - `UiMarketSlot.patternKey`
    - `UiRoyalOffer.score`
    - `UiRoyalOffer.crowns`
    - `UiRoyalOffer.accentKey`
    - `UiRoyalOffer.patternKey`
    - `UiRoyalOffer.tagLabel`
- These fields are presentation-only. They do not alter replay bundles, snapshot tiers, room-service authority, or command/event wire shapes, so the change remains additive rather than breaking.
- `packages/application` now projects those fields centrally, and `packages/ui` consumes the projection instead of fabricating preview-only values in page code.
- As a result, the old preview-UI claim of “never expand contracts” is no longer the correct invariant. The new invariant is: display-only additive contract changes are allowed; authority / replay / command boundary changes are still out of scope.

### Major Changed Files

- Contracts and projection:
    - `packages/contracts/src/ui.ts`
    - `packages/contracts/src/__tests__/schemas.test.ts`
    - `packages/application/src/view-model/market.ts`
    - `packages/application/src/view-model/player-zones.ts`
- Shared UI:
    - `packages/ui/src/views/board-scene.tsx`
    - `packages/ui/src/hud/turn-hud.tsx`
    - `packages/ui/src/board/card-slot.tsx`
    - `packages/ui/src/board/market-stack.tsx`
    - `packages/ui/src/board/royal-court.tsx`
    - `packages/ui/src/board/player-zone.tsx`
    - `packages/ui/src/board/token-cell.tsx`
    - `packages/ui/src/drawer/sidecar-drawer.tsx`
    - `packages/ui/src/primitives/arena-icons.tsx`
    - `packages/ui/src/styles/shell.css`
    - `packages/ui/src/i18n/messages.ts`
- Host wiring:
    - `apps/web/app/play/components/session-board-shell.tsx`
    - `apps/web/app/rooms/[roomId]/room-live-client.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/components/session-rail.tsx`
    - `apps/web/app/playground/scene-fixtures.tsx`
- Acceptance:
    - `apps/web/tests/phase4/*`
    - `apps/web/tests/phase5/ai-run-parity.spec.ts`
    - `apps/web/tests/phase6/room-boardscene.spec.ts`
    - `apps/web/tests/phase7/replay-boardscene.spec.ts`
    - `apps/web/tests/phase8/desktop-shell.spec.ts`
    - `apps/web/tests/a11y/*`
    - `apps/web/tests/visual/*`

### Validation

- `corepack pnpm typecheck`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`

### Remaining Notes

- Action labels such as `Begin Gem Selection`, `Begin Reserve`, and `Begin Buy` still come from the current projection layer. If later work wants a more productized naming system, that should be handled as an explicit action-label i18n / projection task rather than a page-local override.
- The market still preserves the real visible slot count; the shell does not hide rule-visible cards just to match the reference sketch more literally.

### 2026-04-18 Contrast Follow-Up / 对比度补强

- ZH：Arena 的 dark tactical 配色已做第二轮对比度补强，重点提升了 muted label、panel divider、slot chrome、board 坐标、dashboard summary 与 hidden controls overlay 的亮度与边界强度；改动严格收敛在 `packages/ui/src/styles/shell.css` 的 Arena 作用域内，没有改变单屏布局、直角约束或任何规则 / 事件边界。
- EN: The Arena dark tactical palette received a second contrast pass. Muted labels, panel dividers, slot chrome, board coordinates, dashboard summaries, and the hidden controls overlay now use brighter arena-scoped values. The follow-up stays fully inside `packages/ui/src/styles/shell.css` and does not change the single-screen layout, hard-edge constraint, or any rules / event boundaries.
