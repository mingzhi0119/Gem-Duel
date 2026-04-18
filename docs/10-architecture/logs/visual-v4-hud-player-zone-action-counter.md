# Visual V4 - HUD, Player Zones, Action Counter

Date: 2026-04-18

## ZH

### 范围

- 重做 `TurnHud`、`PlayerZone`、`ReserveTray` 与 `BoardScene` 默认 header/footer 组合，把顶栏 HUD 与底部玩家区提升到目标图的产品化形态。
- 严格保持展示层边界：不扩 `packages/contracts`、不改 props / 事件、不断开 shared `BoardScene`，也不影响 `?shell=debug` fallback。
- 保持 spectator/read-only、回放键盘门禁、Desktop shared shell smoke 与 visual/a11y gate 全绿。

### 落地结果

- `TurnHud` 现已重做为左右对称的 P1 / P2 计分面板 + 中央 turn pill，并统一通过现有 `UiViewModel.playerZones`、`snapshot.context.turn`、`viewerRole` 投影：
    - 顶栏左右两侧显示 seat avatar、VP、crowns、token 总数；
    - 中央 turn pill 显示当前行动 seat、phase、segment 与 turn number；
    - 底部 `ACTION N / N` 胶囊只从现有 `actionableSeat`、turn metadata 与 selection/prompt remaining 字段做保守呈现，不新增任何 contract 语义。
- `PlayerZone` 现已改为底部资产槽布局：头像头部、VP/crown/privilege 摘要、token bank 点阵、reserve tray，以及 royal / tableau / seat 三块 summary 卡。
- `ReserveTray` 现已从扁平 occupied/empty 标签改为三槽 reserve cards，占位文案继续明确说明共享壳层不会泄露 hidden reserve card 细节。
- `BoardScene` 默认 header 不再把 HUD 包进 drawer，而是直接挂载新的 `gd-turn-hud-panel`；toolbar actions 与 replay read-only note 继续保留在 HUD 下方，因此现有按钮名字、键盘路径与 onSelect wiring 不变。
- Phase 4/5/6/7/8 的 Playwright gate 已补上 `turn-hud`、`turn-hud-action-counter`、`player-zone-p1/p2` 的挂载断言，确保 local / ai / run / room / replay / desktop 都命中同一套 HUD + 玩家区组合。

### 决策说明

- `ACTION N / N` 本波明确不表示新的引擎 budget，也不试图编码所有 optional-step 细节；它只是 shared shell 对“当前 viewer 是否仍有可行动作面”的受控可视化。
- 当存在 `selectionDraft.remainingSelections` 或 prompt remaining 时，胶囊附带剩余选择说明；当 viewer 只读、等待对手或 turn 已 settled 时，则明确显示只读/等待/settled 文案。
- 该决策保证 V4 不突破 contract ceiling，同时为 V5/V6 的 rail / drawer 产品化保留真实 action surface 的边界。

### 未覆盖项

- 本波没有给右 rail 绑定 settings / theme / rules / restart 等 affordance；这些仍留给 V5。
- 本波没有改 drawer / sidecar 的默认收起与 overlay 动效；这些仍留给 V6。
- 本波没有新增 locale routing 或 extra session surface。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v4-hud-player-zone-action-counter.md`
- `packages/ui/src/board/player-zone.tsx`
- `packages/ui/src/board/reserve-tray.tsx`
- `packages/ui/src/hud/turn-hud.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`
- `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- `apps/web/tests/phase5/ai-run-parity.spec.ts`
- `apps/web/tests/phase6/room-boardscene.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/phase8/desktop-shell.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline 变更面

- 本次受控 rebaseline 继续只刷新受 HUD / player-zone 重做直接影响的 committed baselines：
    - playground 四张；
    - local board 一张；
    - replay desktop/mobile 两张。
- `theme-foundation.spec.ts` 继续作为 V1 smoke gate 存在，但本波没有新增额外 committed screenshot 文件。

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

结果：以上命令在本分支全部通过。`check-phase4` 继续覆盖 `?shell=debug` fallback；`check-phase6` 继续证明 spectator inertness 与 out-of-turn read-only 没有回归；`check-phase7` 的 replay keyboard / locale gate 继续通过；`check-a11y` 保持 serious / critical = 0；`check-visual` 在受控 rebaseline 后可无更新参数通过。构建产生的 `apps/web/next-env.d.ts` 漂移已恢复，不属于本次边界。

## EN

### Scope

- Rebuild `TurnHud`, `PlayerZone`, `ReserveTray`, and the default `BoardScene` header/footer composition so the top HUD and bottom player areas match the productized shell direction.
- Keep the change strictly presentation-only: no `packages/contracts` expansion, no props / event changes, no break in the shared `BoardScene`, and no impact on the `?shell=debug` fallback.
- Keep the spectator/read-only gates, replay keyboard path, Desktop shared-shell smoke, and visual/a11y checks green.

### Landed Results

- `TurnHud` now renders as a symmetric P1 / P2 score shell plus a central turn pill, entirely projected from the existing `UiViewModel.playerZones`, `snapshot.context.turn`, and `viewerRole`:
    - the left/right panes show the seat avatar, VP, crowns, and total token count;
    - the center pill shows the active seat, phase, segment, and turn number;
    - the `ACTION N / N` capsule is derived only from the existing `actionableSeat`, turn metadata, and selection/prompt remaining counts, with no new contract semantics.
- `PlayerZone` now uses a bottom asset-tray layout with the avatar header, VP/crown/privilege summary, token-bank grid, reserve tray, and three summary cards for royals, tableau, and seat context.
- `ReserveTray` now renders as three reserve cards rather than flat occupied/empty pills, while still making it explicit that the shared shell does not reveal hidden reserve-card details.
- The default `BoardScene` header no longer wraps the HUD in a drawer; it mounts the new `gd-turn-hud-panel` directly, while toolbar actions and the replay read-only note remain below it so button names, keyboard paths, and `onSelect` wiring stay unchanged.
- The Phase 4/5/6/7/8 Playwright gates now assert `turn-hud`, `turn-hud-action-counter`, and `player-zone-p1/p2`, ensuring local / ai / run / room / replay / desktop all mount the same HUD + player-zone composition.

### Decision Notes

- `ACTION N / N` is explicitly not a new engine budget and does not attempt to encode every optional-step nuance; it is a controlled shell-level visualization of whether the current viewer still has an action surface.
- When `selectionDraft.remainingSelections` or prompt remaining counts are available, the capsule surfaces that detail; otherwise it falls back to explicit read-only / waiting / settled copy.
- This keeps V4 within the contract ceiling while preserving a clean boundary for the real action surface decisions that remain in V5/V6.

### Not Covered

- This wave does not wire the right rail to settings / theme / rules / restart affordances; that remains in V5.
- This wave does not change drawer / sidecar default collapse or overlay motion; that remains in V6.
- This wave does not add locale routing or any extra session surface.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v4-hud-player-zone-action-counter.md`
- `packages/ui/src/board/player-zone.tsx`
- `packages/ui/src/board/reserve-tray.tsx`
- `packages/ui/src/hud/turn-hud.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`
- `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- `apps/web/tests/phase5/ai-run-parity.spec.ts`
- `apps/web/tests/phase6/room-boardscene.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/phase8/desktop-shell.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline Change Surface

- The controlled rebaseline still refreshed only the committed baselines directly affected by the HUD / player-zone rewrite:
    - four playground scenes;
    - one local-board scene;
    - two replay desktop/mobile scenes.
- `theme-foundation.spec.ts` remains the V1 smoke gate, but this wave did not add extra committed screenshot files for it.

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

Outcome: every command above passed on this branch. `check-phase4` still covers the `?shell=debug` fallback; `check-phase6` keeps spectator inertness and out-of-turn read-only green; `check-phase7` keeps the replay keyboard / locale gate green; `check-a11y` stays at 0 serious / critical findings; and `check-visual` passes without snapshot updates after the controlled rebaseline. The build-only `apps/web/next-env.d.ts` drift was restored and is not part of this boundary.
