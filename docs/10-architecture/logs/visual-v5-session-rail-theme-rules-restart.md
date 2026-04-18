# Visual V5 - Session Rail, Theme, Rules, Restart

Date: 2026-04-18

## ZH

### 范围

- 落地 shared `BoardScene` 的右侧 session rail，并在发版前先把 `Save / Load`、`Style`、`Theme`、`Rules`、`Restart` 的真实语义定死。
- 保持展示层边界：不扩 `packages/contracts`、不改 `UiViewModel` / props / 事件、不伪造新的 session action surface。
- 保持双语文案、键盘可达、Web/Room/Replay/Desktop shared shell 一致主题真相，以及既有 spectator/read-only/replay keyboard 门禁全绿。

### 落地结果

- `SessionRail` 已通过 `BoardScene` 的 `railLead` 槽位接入五个产品入口：`/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`。
- rail 现包含四块真实受控内容：
    - session summary：展示 surface、viewer、session status 与当前可见 `finalStateHash` / fallback 文案；
    - `Theme`：正式支持 `Dark` / `Light` / `System` 三态单选，并将查询参数、localStorage 与 `document.documentElement` dataset 收敛到同一 shared-shell truth；
    - `Style`：展示只读 `default tactical` pill，表明 style registry 已就位，但本波不提供第二套视觉；
    - `Rules` + `Restart`：`Rules` 直达 `/rulebook`；`Restart` 在 `play` surface 上沿用整页 reload 以重启当前 session，在 `room` / `replay` surface 上改名为 `Reload View`，只重载当前视图，不伪造新命令。
- `Save / Load` 本波明确选择 V5.A：由于当前 contract 没有持久化 / 导入导出 action，产品 rail 中完全不渲染这两个按钮。
- `messages.ts` 新增 session-rail 双语文案；`Theme` radio、`Rules` link、`Restart/Reload` button 都具备可访问名称，且通过键盘 `ArrowRight` / 焦点路径验证。
- `ShellPresentationSync` 与 `shell-presentation` helper 现共享同一 query/storage/event 口径，使 rail 里的 theme 切换能够立即同步到 shared shell，并在跨入口导航与 Desktop shell 中保持一致。

### 决策说明

- `Save / Load`: 选择 **A**。没有 contract-backed persistence 之前，rail 不提供假按钮，也不把 replay 能力包装成“存档”。
- `Style`: 选择 **B** 的保守落地。向用户暴露 registry-backed 的 `default tactical` 只读 pill，以证明 style surface 已存在，但不承诺多套已验证 style。
- `Restart`: 保持表现层语义安全。`play` surface 的 reload 等价于现有本地 session restart；`room` / `replay` 只重载当前 route，因此文案显式降级为 `Reload View` / `重载视图`。
- locale 继续沿用现有页面级入口，不在本波引入新的 app-wide locale routing。

### 未覆盖项

- 本波不新增 persistence contract、replay upload/download action、或任何跨边界 command。
- 本波不把 style registry 扩成多套皮肤，也不新增 style picker 写入路径。
- 本波不重做 sidecar / drawer motion；这些仍留给 V6。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v5-session-rail-theme-rules-restart.md`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell-presentation.ts`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`
- `apps/web/app/components/session-rail.tsx`
- `apps/web/app/components/shell-presentation-sync.tsx`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/app/replays/[replayId]/replay-client.tsx`
- `apps/web/app/rooms/[roomId]/room-live-client.tsx`
- `apps/web/tests/phase4/session-rail-controls.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/phase8/desktop-shell.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline 变更面

- 本次受控 rebaseline 只刷新 rail 接入后直接受影响的 committed baselines：
    - local board 一张；
    - replay desktop/mobile 两张。
- rail 的 theme 切换持久化与 style fallback 通过 `theme-foundation.spec.ts` 做 smoke 验证，不新增额外 screenshot 文件。

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

结果：以上命令在本分支通过。`check-phase4` 新增 rail 键盘/重启断言；`check-phase7` 覆盖 replay 中文文案与可访问名称；`check-phase8` 现在验证 Desktop shared shell 中的 `Light` theme 切换；`check-a11y` 保持 serious / critical = 0；`check-visual` 在受控 rebaseline 后可无更新参数通过。构建产生的 `apps/web/next-env.d.ts` 漂移已恢复，不属于本次边界。

## EN

### Scope

- Land the shared `BoardScene` session rail and close the real semantics of `Save / Load`, `Style`, `Theme`, `Rules`, and `Restart` before the UI ships.
- Keep the work presentation-only: no `packages/contracts` expansion, no `UiViewModel` / props / event changes, and no fake session action surface.
- Keep bilingual copy, keyboard reachability, Web/Room/Replay/Desktop shared-shell theme truth, and the spectator/read-only/replay-keyboard gates green.

### Landed Results

- `SessionRail` now plugs into the `BoardScene` `railLead` slot across all five product entrypoints: `/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, and `/replays/[replayId]`.
- The rail now ships four controlled sections:
    - a session summary for surface, viewer, session status, and the visible `finalStateHash` or fallback copy;
    - a real `Theme` selector for `Dark` / `Light` / `System`, with query params, localStorage, and `document.documentElement` dataset all collapsed into one shared-shell truth;
    - a read-only `Style` pill for `default tactical`, making the style registry visible without shipping a second skin;
    - `Rules` + `Restart`, where `Rules` links to `/rulebook` and `Restart` uses a full-page reload for `play` surfaces while the `room` / `replay` surfaces deliberately downgrade the label to `Reload View`.
- `Save / Load` explicitly choose V5.A in this wave: because there is no persistence / import-export action in the current contract, those buttons do not render in the product rail at all.
- `messages.ts` now carries bilingual session-rail copy; the theme radios, rules link, and restart/reload button all expose accessible names and pass keyboard-path checks.
- `ShellPresentationSync` and the `shell-presentation` helper now share one query/storage/event contract so rail-driven theme changes update the shared shell immediately and stay consistent across navigation and Desktop.

### Decision Notes

- `Save / Load`: choose **A**. Until persistence is backed by a real contract, the rail does not ship fake buttons or rebrand replay flows as save-state.
- `Style`: choose the conservative form of **B**. The user sees a registry-backed read-only `default tactical` pill, proving the style surface exists without promising multiple validated packs.
- `Restart`: keep the semantics presentation-safe. On `play` surfaces reload matches the existing local-session restart path; on `room` / `replay` it only reloads the current route, so the copy is explicitly downgraded to `Reload View`.
- Locale routing remains unchanged; this wave only reuses the current page-level locale surfaces.

### Not Covered

- No new persistence contract, replay upload/download action, or cross-boundary command lands in this wave.
- The style registry is not expanded into multiple skins and no writable style picker is introduced.
- Sidecar / drawer motion is still deferred to V6.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v5-session-rail-theme-rules-restart.md`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell-presentation.ts`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/views/board-scene.tsx`
- `apps/web/app/components/session-rail.tsx`
- `apps/web/app/components/shell-presentation-sync.tsx`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/app/replays/[replayId]/replay-client.tsx`
- `apps/web/app/rooms/[roomId]/room-live-client.tsx`
- `apps/web/tests/phase4/session-rail-controls.spec.ts`
- `apps/web/tests/phase7/replay-boardscene.spec.ts`
- `apps/web/tests/phase8/desktop-shell.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`

### Baseline Change Surface

- The controlled rebaseline refreshed only the committed baselines directly affected by rail landing:
    - one local-board screenshot;
    - two replay desktop/mobile screenshots.
- Theme persistence and style fallback are smoke-verified in `theme-foundation.spec.ts` without adding extra screenshot files.

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

Outcome: every command above passed on this branch. `check-phase4` now covers rail keyboard/restart assertions; `check-phase7` covers the replay zh copy and accessible names; `check-phase8` now verifies `Light` theme switching inside the Desktop shared shell; `check-a11y` remains at 0 serious / critical findings; and `check-visual` passes without snapshot updates after the controlled rebaseline. The build-only `apps/web/next-env.d.ts` drift was restored and is not part of this boundary.
