# Visual V6 - Dark Tactical Drawers

Date: 2026-04-18

## ZH

### 范围

- 把 `Replay`、`AiTrace`、`Run` 与 `Terminal` 从默认展开的 sidecar / overlay 面板收敛为 dark tactical drawer。
- 继续保持 shared shell 边界：不扩 `packages/contracts`、不改 replay / run / ai 数据源，只重写表现层容器、默认态、交互路径与 a11y。
- 明确保留静态 panel 与 drawer 的边界：session rail、prompt、selection draft、scenario fixture 仍为主盘面右侧静态 panel；需要大量辅助信息的 Replay / AI / Run / Terminal 改为默认收起的 overlay drawer。

### 落地结果

- `SidecarDrawer` 现已扩成双模式 shell：
    - `panel` 继续服务 session rail、prompt、selection draft 等常驻内容；
    - `drawer` 以统一的 trigger + backdrop + slide-in dialog + close path + focus-trap 服务 overlay 信息面。
- `ReplayDrawer`、`AiTraceDrawer`、`BoardScene` 内的 `RunPanel`、`RunPlayground` 的 run status / buff draft sidecars，以及 `TerminalOverlay` 都已切到 `drawer` 模式：
    - 默认收起；
    - 打开后从右侧覆盖，不再把主盘面进一步压窄；
    - ESC、Tab 循环与关闭按钮都可用；
    - rail / floating trigger 在关闭态仍保留可发现入口。
- `TerminalOverlay` 不再默认整块遮住主盘面，而是变成 completed / terminal snapshot 上的浮动 drawer trigger；打开后才显示终局信息卡。
- `/play/ai` 与 `/play/run` 上的 AI trace 现在即使 trace 为空也保留 drawer 入口，并在打开后明确展示 deterministic empty-state 文案，避免 AI surface 因“还没有决策”而失去 affordance。
- `check-phase4`、`check-phase5`、`check-phase7` 新增了“打开 drawer 后主 stage 宽度不变”的断言，确保这波 overlay 只覆盖不挤压。

### 决策说明

- 这波没有把所有右 rail 内容都抽成 drawer。session rail、prompt、selection draft 仍然保持常驻，因为它们属于当前行动面本身，不是厚信息 sidecar。
- `Run` 维持多入口但统一样式：`RunPanel`、run status、buff draft 都使用同一 drawer shell；这保证 `/play/run` 仍有明确入口，同时不把 run metadata 挤回主盘面。
- `Replay` keyboard stepping 继续保留在页面级别；timeline 详细导航则放进 replay drawer，因此 Phase 7 仍然可以在不依赖展开态的前提下用键盘跳步。

### 未覆盖项

- 本波不改 session rail 的结构与决策。
- 本波不改 prompt / selection overlay 的布局与语义。
- 本波不引入新的 replay / run / ai command surface，也不扩 `UiViewModel`。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v6-dark-tactical-drawers.md`
- `packages/ui/src/drawer/sidecar-drawer.tsx`
- `packages/ui/src/drawer/replay-drawer.tsx`
- `packages/ui/src/drawer/ai-trace-drawer.tsx`
- `packages/ui/src/views/board-scene.tsx`
- `packages/ui/src/views/terminal-overlay.tsx`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/styles/shell.css`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/app/play/components/match-playground.tsx`
- `apps/web/app/play/components/run-playground.tsx`
- `apps/web/tests/a11y/product-surfaces.spec.ts`
- `apps/web/tests/a11y/replay-surface.spec.ts`
- `apps/web/tests/phase4/local-player-paths.spec.ts`
- `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- `apps/web/tests/phase5/ai-run-parity.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/visual/playground.spec.ts`
- `apps/web/tests/visual/replay-board.spec.ts`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline 变更面

- 本次受控 rebaseline 刷新的 committed baselines 为：
    - `playground/classic-selection`
    - `playground/run-sidecar`
    - `replay-board-desktop`
    - `replay-board-mobile`
- 这些截图现在都基于“打开后的 drawer overlay”状态拍摄，用来证明 dark tactical drawer 本体而不是旧的常驻 sidecar。

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

结果：以上命令在本分支通过。`check-phase4/5/7` 现覆盖 terminal / ai / replay drawer 的默认收起、打开与 stage-width 不变断言；`check-a11y` 在 `/play/ai`、`/play/run`、`/replays/[replayId]` 上显式展开 drawer 后仍保持 serious / critical = 0；`check-visual` 通过受控 rebaseline 记录新的 overlay 样式；`check-phase8` 继续证明 Desktop shared shell smoke 未回归。构建产生的 `apps/web/next-env.d.ts` 漂移已恢复，不属于本次边界。

## EN

### Scope

- Move `Replay`, `AiTrace`, `Run`, and `Terminal` from always-expanded sidecars / overlays into dark tactical drawers.
- Keep the shared-shell boundary intact: no `packages/contracts` expansion and no replay / run / ai data-source changes; this wave only rewrites the presentation containers, default state, interaction path, and a11y.
- Keep the static-panel vs drawer boundary explicit: the session rail, prompts, selection draft, and scenario fixture remain resident right-rail panels, while the heavy-info Replay / AI / Run / Terminal surfaces become collapsed-by-default overlay drawers.

### Landed Results

- `SidecarDrawer` now supports two shell modes:
    - `panel` still serves resident surfaces such as the session rail, prompts, and selection draft;
    - `drawer` now serves overlay information surfaces through one shared trigger + backdrop + slide-in dialog + close path + focus-trap shell.
- `ReplayDrawer`, `AiTraceDrawer`, the `RunPanel` inside `BoardScene`, the run status / buff draft sidecars in `RunPlayground`, and `TerminalOverlay` now all use `drawer` mode:
    - collapsed by default;
    - opening from the right as an overlay rather than shrinking the board stage;
    - supporting ESC, Tab trapping, and an explicit close button;
    - keeping discoverable rail / floating triggers while closed.
- `TerminalOverlay` no longer blocks the stage by default; it now becomes a floating drawer trigger on completed / terminal snapshots and only reveals the final-state card when opened.
- `/play/ai` and `/play/run` now keep the AI trace drawer affordance even when the trace is empty, surfacing a deterministic empty-state message rather than disappearing from the shell.
- `check-phase4`, `check-phase5`, and `check-phase7` now assert that opening the drawer leaves the main stage width unchanged, so this wave explicitly proves “cover, don’t compress.”

### Decision Notes

- This wave does not convert every right-rail surface into a drawer. The session rail, prompts, and selection draft stay resident because they are part of the active action surface, not just auxiliary detail.
- `Run` keeps multiple affordances but one shell style: the `RunPanel`, run status, and buff draft all use the same drawer treatment so `/play/run` keeps clear entrypoints without pushing run metadata back into the main board.
- Replay keyboard stepping remains page-level; the detailed timeline navigation now lives inside the replay drawer, so Phase 7 keyboard stepping still works independently of the expanded state.

### Not Covered

- This wave does not reshape the session rail.
- This wave does not change the prompt / selection overlay layout or semantics.
- This wave does not introduce any new replay / run / ai command surface and does not expand `UiViewModel`.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v6-dark-tactical-drawers.md`
- `packages/ui/src/drawer/sidecar-drawer.tsx`
- `packages/ui/src/drawer/replay-drawer.tsx`
- `packages/ui/src/drawer/ai-trace-drawer.tsx`
- `packages/ui/src/views/board-scene.tsx`
- `packages/ui/src/views/terminal-overlay.tsx`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/styles/shell.css`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/app/play/components/match-playground.tsx`
- `apps/web/app/play/components/run-playground.tsx`
- `apps/web/tests/a11y/product-surfaces.spec.ts`
- `apps/web/tests/a11y/replay-surface.spec.ts`
- `apps/web/tests/phase4/local-player-paths.spec.ts`
- `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- `apps/web/tests/phase5/ai-run-parity.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/visual/playground.spec.ts`
- `apps/web/tests/visual/replay-board.spec.ts`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline Change Surface

- The controlled rebaseline refreshed these committed baselines:
    - `playground/classic-selection`
    - `playground/run-sidecar`
    - `replay-board-desktop`
    - `replay-board-mobile`
- Those screenshots are now captured with the drawer open, so they verify the dark tactical overlay shell itself rather than the legacy always-open sidecar.

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

Outcome: every command above passed on this branch. `check-phase4/5/7` now cover the default-collapsed, opened, and stage-width-stable paths for the terminal / ai / replay drawers; `check-a11y` explicitly opens drawers on `/play/ai`, `/play/run`, and `/replays/[replayId]` and still reports 0 serious / critical findings; `check-visual` records the new overlay styling through a controlled rebaseline; and `check-phase8` confirms the Desktop shared-shell smoke remains green. The build-only `apps/web/next-env.d.ts` drift was restored and is not part of this boundary.
