# Visual V3 - Center-Stage Primitives

Date: 2026-04-18

## ZH

### 范围

- 重做 `MarketStack`、`CardSlot`、`TokenCell`、`RoyalCourt` 与配套 `shell.css` / `tokens.css`，把中央主舞台从调试态列表提升为产品化中心舞台。
- 目标仅限展示层：保留现有 props、事件、`data-testid` 与入口接线，不扩 `UiViewModel`、contracts 或 action surface。
- 对受影响的 visual baselines 做一次受控刷新，并重新跑 phase / a11y / build 验收。

### 落地结果

- `MarketStack` 现已按 L3 / L2 / L1 三层输出金字塔，每层左侧保留 deck placeholder / blind-deck action 位，右侧为 widening tier cards；reserve 区则收敛为独立 reserve bank。
- `CardSlot` 现已改为卡面式布局，复用现有 slot 数据做 level stripe、zone badge、owner/status 文案与 reserve/buy affordance；没有改变任何 buy/reserve 回调或测试 ID。
- `TokenCell` 现已改为圆形宝石 + 深色凹槽盘面，保留现有 board-cell test ids、选择/已选/禁用语义与点击路径；V2 暴露过的 cell 溢出问题也继续被这套实现覆盖。
- `RoyalCourt` 现已改为 2×2 金色方卡，保留 `royal-offer-*` test ids 与 `selectable` gating，只新增了展示性的 crest/royal chrome。
- 本波严格保持 contract ceiling：当前 `UiMarketSlot` / `UiRoyalOffer` 没有 VP 或 gem-cost 字段，因此 V3 没有伪造目标图中的分值或 cost icon，只在现有字段上完成 cardified / tokenized shell。

### 未覆盖项

- 本波没有改 HUD、player zones、action counter；这些继续留给 V4。
- 本波没有给 rail 绑定规则、theme、restart 等真实 affordance；这些继续留给 V5。
- 本波没有改变 drawer / sidecar 的默认展开策略；这些继续留给 V6。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v3-center-stage-primitives.md`
- `packages/ui/src/board/card-slot.tsx`
- `packages/ui/src/board/market-stack.tsx`
- `packages/ui/src/board/royal-court.tsx`
- `packages/ui/src/board/token-cell.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/styles/tokens.css`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline 变更面

- 本次受控 rebaseline 继续只刷新受 V3 中央舞台重做直接影响的 committed baselines：
    - playground 四张；
    - local board 一张；
    - replay desktop/mobile 两张。
- `theme-foundation.spec.ts` 与 V1/V2 的 shell smoke gate 继续保留，但本波没有新增额外 committed screenshots。

### 执行命令与结果

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`
- `node ./tools/check-a11y.mjs`
- `corepack pnpm test`
- `corepack pnpm build`

结果：以上命令在本分支全部通过。五个产品入口继续复用 shared `BoardScene`，`?shell=debug` fallback 在 `check-phase4` 中继续通过；`check-a11y` 保持 serious / critical = 0，`check-visual` 在受控 rebaseline 后可无更新参数通过。构建产生的 `apps/web/next-env.d.ts` 漂移已恢复，不属于本次边界。

## EN

### Scope

- Rebuild `MarketStack`, `CardSlot`, `TokenCell`, `RoyalCourt`, and their `shell.css` / `tokens.css` styling so the center stage moves from debug-oriented lists into a productized centerpiece.
- Keep the change presentation-only: props, events, `data-testid`s, and entrypoint wiring stay unchanged; no `UiViewModel`, contract, or action-surface expansion.
- Refresh only the impacted visual baselines, then rerun the phase, a11y, and build gates.

### Landed Results

- `MarketStack` now renders the L3 / L2 / L1 pyramid tiers, with a left-side deck placeholder / blind-deck action slot for each tier and widening card rows on the right; reserve slots are regrouped into a separate reserve bank.
- `CardSlot` now uses a card-face layout that still consumes the existing slot data for the level stripe, zone badge, owner/status copy, and buy/reserve affordances; no buy/reserve callback or test id changed.
- `TokenCell` now renders round gems inside dark sockets while preserving the existing board-cell test ids, selected/selectable/disabled semantics, and click paths; the overflow fix introduced in V2 remains covered by this layout.
- `RoyalCourt` now renders as a 2x2 gold-card grid, keeping `royal-offer-*` test ids and `selectable` gating while adding decorative crest / royal chrome only.
- This wave explicitly stayed within the current contract ceiling: `UiMarketSlot` and `UiRoyalOffer` do not expose VP or gem-cost fields, so V3 does not fabricate score numbers or cost icons from the target image. The redesign only productizes the shell around the existing data.

### Not Covered

- This wave does not rebuild the HUD, player zones, or action counter; those remain in V4.
- This wave does not wire the rail to rules, theme, restart, or other real affordances; that remains in V5.
- This wave does not change drawer / sidecar default expansion behavior; that remains in V6.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v3-center-stage-primitives.md`
- `packages/ui/src/board/card-slot.tsx`
- `packages/ui/src/board/market-stack.tsx`
- `packages/ui/src/board/royal-court.tsx`
- `packages/ui/src/board/token-cell.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/styles/tokens.css`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline Change Surface

- The controlled rebaseline still refreshed only the committed baselines directly affected by the V3 center-stage rewrite:
    - four playground scenes;
    - one local-board scene;
    - two replay desktop/mobile scenes.
- `theme-foundation.spec.ts` and the V1/V2 shell smoke gates remain in place, but this wave did not add extra committed screenshots for them.

### Commands and Outcomes

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`
- `node ./tools/check-a11y.mjs`
- `corepack pnpm test`
- `corepack pnpm build`

Outcome: every command above passed on this branch. All five product entrypoints still flow through the shared `BoardScene`, the `?shell=debug` fallback remains green inside `check-phase4`, `check-a11y` stays at 0 serious / critical findings, and `check-visual` passes without snapshot updates after the controlled rebaseline. The build-only `apps/web/next-env.d.ts` drift was restored and is not part of this boundary.
