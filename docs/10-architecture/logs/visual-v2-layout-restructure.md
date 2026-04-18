# Visual V2 - Layout Restructure

Date: 2026-04-18

## ZH

### 范围

- 把 `packages/ui/src/views/board-scene.tsx` 与 `packages/ui/src/styles/shell.css` 重排为顶栏、中央主 stage、底部玩家区、右 rail 四区骨架。
- 为 `BoardScene` 落地新的 slot API：`header`、`primaryStage`、`secondaryStage`、`footer`、`rail`，同时保持默认组合继续复用现有 primitives。
- 让 `/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]` 五个入口都命中新壳层，并保留 `?shell=debug` 的 `MatchView` fallback。
- 在不扩 contract / `UiViewModel` 的前提下，完成 phase gate、a11y、visual rebaseline 与全量构建验收。

### 落地结果

- `packages/ui/src/views/board-scene.tsx` 现已导出 `BoardSceneSlots`，并接受 `slots?: Partial<BoardSceneSlots>`：
    - `header` 负责 summary、badges、Turn HUD、scenario fixture；
    - `primaryStage` 负责 Market + Board；
    - `secondaryStage` 负责 Royal Court；
    - `footer` 负责 player zones；
    - `rail` 负责 prompts、selection draft、run panel、额外 sidecar 与 fallback actions。
- 默认 `BoardScene` 结构现已固定为：
    - 顶栏 `boardscene-header`
    - 中台 `boardscene-stage`
    - 主区 `boardscene-primary-stage`
    - 次区 `boardscene-secondary-stage`
    - 右 rail `boardscene-rail`
    - 底区 `boardscene-footer`
- `/play/local`、`/play/ai`、`/play/run` 继续通过 `SessionBoardShell` 共享默认 slot 组合；`/rooms/[roomId]` 与 `/replays/[replayId]` 也复用同一壳层，其中 room surface 现显式传入 `surface="room"`。
- Phase 4-8 的浏览器/Electron gate 已全部补上新区域断言，因此五个入口的 slot-composed shell 都有自动化覆盖；`?shell=debug` 路径继续停留在旧 `MatchView`，并在 Phase 4 保持单独回归。
- V2 重排后，board cell 在更紧的中台宽度下出现了文本越界拦截相邻点击的问题；本波已通过 `shell.css` 的内容裁切修正将交互恢复，同时不改变规则/动作语义。

### 未覆盖项

- 本波没有改写 Market / Board / Royal Court / Player Zone 的 primitive 内部视觉形态；这些仍留给 V3 / V4。
- 本波没有为 rail 绑定真实 settings / theme / rules affordance；V5 再决定。
- 本波没有新增第二套 style，也没有暴露 end-user style picker。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v2-layout-restructure.md`
- `apps/web/app/rooms/[roomId]/room-live-client.tsx`
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
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`

### Baseline 变更面

- 本次受控 rebaseline 只刷新了当前受 V2 壳层重排影响的 committed baselines：
    - `local-board` 一张；
    - playground 四张；
    - replay desktop/mobile 两张。
- `theme-foundation.spec.ts` 继续作为 V1 smoke gate 存在，但本波没有为它新增 committed screenshot。

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

结果：以上命令在本分支全部通过。`check-phase4` 明确继续覆盖 `?shell=debug` fallback；`check-a11y` 保持 serious / critical = 0；`check-visual` 在受控 rebaseline 后可无更新参数通过。构建产生的 `apps/web/next-env.d.ts` 格式漂移已恢复，不作为本次边界的一部分。

## EN

### Scope

- Re-lay `packages/ui/src/views/board-scene.tsx` and `packages/ui/src/styles/shell.css` into a four-zone shell: top bar, center stage, bottom player area, and right rail.
- Land the new `BoardScene` slot API: `header`, `primaryStage`, `secondaryStage`, `footer`, and `rail`, while keeping the default composition on the existing primitives.
- Move all five product entrypoints onto that shell while preserving the `MatchView` fallback behind `?shell=debug`.
- Close the phase gates, a11y pass, controlled visual rebaseline, and full build validation without expanding contracts or `UiViewModel`.

### Landed Results

- `packages/ui/src/views/board-scene.tsx` now exports `BoardSceneSlots` and accepts `slots?: Partial<BoardSceneSlots>`:
    - `header` owns the summary, badges, Turn HUD, and scenario fixture;
    - `primaryStage` owns Market + Board;
    - `secondaryStage` owns Royal Court;
    - `footer` owns the player zones;
    - `rail` owns prompts, selection draft, the run panel, extra sidecars, and fallback actions.
- The default `BoardScene` shell is now pinned to:
    - top bar `boardscene-header`
    - center stage `boardscene-stage`
    - primary stage `boardscene-primary-stage`
    - secondary stage `boardscene-secondary-stage`
    - right rail `boardscene-rail`
    - footer `boardscene-footer`
- `/play/local`, `/play/ai`, and `/play/run` keep flowing through the shared `SessionBoardShell` default slot composition; `/rooms/[roomId]` and `/replays/[replayId]` now reuse the same shell too, with the room surface explicitly passing `surface="room"`.
- The Phase 4-8 browser/Electron gates now assert the new layout regions, so all five entrypoints are covered by automation; the `?shell=debug` path stays on the legacy `MatchView` and remains independently exercised in Phase 4.
- The narrower V2 stage exposed a board-cell overflow issue where text could intercept adjacent clicks; this wave fixes it in `shell.css` by clipping cell content without changing gameplay or action semantics.

### Not Covered

- This wave does not restyle the Market / Board / Royal Court / Player Zone primitive internals; that remains in V3 / V4.
- This wave does not wire real rail affordances for settings / theme / rules; V5 will decide that surface.
- This wave does not ship a second style or expose an end-user style picker.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v2-layout-restructure.md`
- `apps/web/app/rooms/[roomId]/room-live-client.tsx`
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
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`

### Baseline Change Surface

- The controlled rebaseline only refreshed committed baselines directly impacted by the V2 shell restructure:
    - one `local-board` baseline;
    - four playground baselines;
    - two replay desktop/mobile baselines.
- `theme-foundation.spec.ts` remains the V1 smoke gate, but this wave did not add committed screenshots for it.

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

Outcome: every command above passed on this branch. `check-phase4` explicitly still covers the `?shell=debug` fallback; `check-a11y` stays at 0 serious / critical findings; `check-visual` passes without snapshot updates after the controlled rebaseline. The build-only formatting drift in `apps/web/next-env.d.ts` was restored and is not part of this boundary.
