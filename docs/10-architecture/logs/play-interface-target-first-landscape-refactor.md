# Play Interface Target-First Landscape Refactor

Date: 2026-04-19

## ZH

### 范围

- 以 `TargetUI.png` 为桌面主准则，重做 active match shared shell 的横屏布局。
- 把 `/play/local`、`/play/ai`、`/play/run`、已绑定 `/rooms/[roomId]`、`/replays/[replayId]` 收拢到同一套 target-first landscape shell。
- 将 mode-gated `BEGIN_*` 交互改写为 engine-owned direct-trigger command surface。
- 用 breaking contract/replay 文档同步这次 command surface rewrite。

### 落地结果

- `apps/web/app/globals.css` 已移除 active-match route 的 width clamp，桌面 `16:9` / `16:10` 视口不再出现大左右边框。
- `apps/web/app/components/active-match-shell.tsx` 新增 shared landscape shell frame：
    - 通过 `Tailwind CSS` 持有 full-height grid；
    - 通过 `Framer Motion` 提供 shell 进入与 route-topbar 动画；
    - 通过 shared React Context 提供轻量 `aria-live` action/error announce。
- `packages/ui/src/styles/shell.css` 增加了宽屏与低高度桌面压缩规则，使 market/footer 在 `16:9` / `16:10` 下不再互相挤压。
- `packages/contracts` / `packages/core-engine` / `packages/application` 已把 `BEGIN_GEM_SELECTION`、`BEGIN_RESERVE`、`BEGIN_BUY`、`BEGIN_PRIVILEGE` 从产品主交互面移除：
    - `TAKE_TOKENS_ADD_POSITION` 可从 `turnIdle` 直接开始；
    - `BUY_CARD` / `RESERVE_CARD` 从 `turnIdle` 直接执行；
    - `USE_PRIVILEGE_ADD_POSITION` 直接从 privilege window 启动；
    - `reserving` / `buying` 不再作为公开 `GamePhase` 暴露。
- Step 07 golden replay fixtures 已刷新到新的 direct-trigger command stream：
    - `double-agent-privilege-double.step07.json`
    - `deep-pockets-threshold.step07.json`
- Phase 5 AI / run deterministic baselines 已重新锁定到新的 hash / trace 长度。

### 主要变更文件

- 架构与壳层：
    - `apps/web/app/components/active-match-shell.tsx`
    - `apps/web/app/play/components/session-board-shell.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/rooms/[roomId]/room-live-client.tsx`
    - `apps/web/app/globals.css`
    - `packages/ui/src/styles/shell.css`
- 契约 / 引擎 / 应用：
    - `packages/contracts/src/game.ts`
    - `packages/contracts/src/shared/enums.ts`
    - `packages/domain/src/index.ts`
    - `packages/core-engine/src/classic-transitions.ts`
    - `packages/core-engine/src/runtime.ts`
    - `packages/application/src/view-model/actions.ts`
    - `packages/application/src/view-model/selection.ts`
    - `packages/application/src/ai/heuristic.ts`
- 基线与测试：
    - `packages/core-engine/__replays__/golden/*.step07.json`
    - `packages/core-engine/src/__tests__/golden-replay-scenarios.ts`
    - `packages/core-engine/src/__tests__/engine.test.ts`
    - `packages/application/src/ai/heuristic.test.ts`
    - `packages/application/src/sessions/run.test.ts`

### 视觉证据

- 手动桌面截图已在以下视口确认：
    - `1440x900` (`16:10`)
    - `1600x900` (`16:9`)
- 当前证据表明：
    - large side gutters 已消失；
    - active match shell 已按横屏铺满；
    - footer/dashboard 不再像上一轮那样被裁出视口底部。

### 验证

- `pnpm -C apps/web build`
- `pnpm -C apps/web test`
- `pnpm -C packages/contracts test`
- `pnpm -C packages/application test`
- `pnpm -C packages/core-engine test`

结果：以上命令在本次收口时通过。另补充了本地 Playwright 截图采样，用于 `16:9` / `16:10` 桌面横屏人工比对。

### 剩余风险

- 本波未重做窄屏 / 移动端布局；`max-width: 980px` 以下仍沿用后续待实现的 stacked fallback。
- 视觉上仍存在与 `TargetUI.png` 的像素级差距，但当前已先关闭“左右大边框 + footer 被压扁 + mode-gated 交互冗余”这三个最高优先级问题。
- 若后续需要继续逼近 target image，应在不再回改 contract semantics 的前提下，继续做纯 presentation 微调。

## EN

### Scope

- Rebuild the active match shared shell around `TargetUI.png` as the desktop source of truth.
- Converge `/play/local`, `/play/ai`, `/play/run`, bound `/rooms/[roomId]`, and `/replays/[replayId]` onto one target-first landscape shell.
- Rewrite the mode-gated `BEGIN_*` interaction into an engine-owned direct-trigger command surface.
- Synchronize the breaking command-surface rewrite with contract/replay governance docs.

### Landed Result

- `apps/web/app/globals.css` now removes the active-match width clamp, so common `16:9` / `16:10` desktop viewports no longer render large left/right gutters.
- `apps/web/app/components/active-match-shell.tsx` now provides a shared landscape-shell frame:
    - `Tailwind CSS` owns the full-height grid shell;
    - `Framer Motion` owns shell and route-topbar motion;
    - a shared React Context provides lightweight `aria-live` action/error announcements.
- `packages/ui/src/styles/shell.css` now includes wide-screen and low-height desktop compression rules so the market/footer stop colliding at `16:9` / `16:10`.
- `packages/contracts`, `packages/core-engine`, and `packages/application` now remove `BEGIN_GEM_SELECTION`, `BEGIN_RESERVE`, `BEGIN_BUY`, and `BEGIN_PRIVILEGE` from the product-facing interaction flow:
    - `TAKE_TOKENS_ADD_POSITION` starts directly from `turnIdle`;
    - `BUY_CARD` / `RESERVE_CARD` execute directly from `turnIdle`;
    - `USE_PRIVILEGE_ADD_POSITION` starts directly from the privilege window;
    - `reserving` / `buying` are no longer exposed as public `GamePhase` values.
- Step 07 golden replay fixtures were refreshed onto the new direct-trigger command stream:
    - `double-agent-privilege-double.step07.json`
    - `deep-pockets-threshold.step07.json`
- The Phase 5 AI/run deterministic baselines were re-locked to the new hash and trace lengths.

### Major Changed Files

- Shell and host wiring:
    - `apps/web/app/components/active-match-shell.tsx`
    - `apps/web/app/play/components/session-board-shell.tsx`
    - `apps/web/app/replays/[replayId]/replay-client.tsx`
    - `apps/web/app/rooms/[roomId]/room-live-client.tsx`
    - `apps/web/app/globals.css`
    - `packages/ui/src/styles/shell.css`
- Contracts / engine / application:
    - `packages/contracts/src/game.ts`
    - `packages/contracts/src/shared/enums.ts`
    - `packages/domain/src/index.ts`
    - `packages/core-engine/src/classic-transitions.ts`
    - `packages/core-engine/src/runtime.ts`
    - `packages/application/src/view-model/actions.ts`
    - `packages/application/src/view-model/selection.ts`
    - `packages/application/src/ai/heuristic.ts`
- Baselines and tests:
    - `packages/core-engine/__replays__/golden/*.step07.json`
    - `packages/core-engine/src/__tests__/golden-replay-scenarios.ts`
    - `packages/core-engine/src/__tests__/engine.test.ts`
    - `packages/application/src/ai/heuristic.test.ts`
    - `packages/application/src/sessions/run.test.ts`

### Visual Evidence

- Manual desktop screenshots were captured at:
    - `1440x900` (`16:10`)
    - `1600x900` (`16:9`)
- The current evidence shows:
    - the large side-gutter problem is gone;
    - the active-match shell now fills the landscape viewport;
    - the footer/dashboard is no longer crushed below the viewport as in the previous wave.

### Validation

- `pnpm -C apps/web build`
- `pnpm -C apps/web test`
- `pnpm -C packages/contracts test`
- `pnpm -C packages/application test`
- `pnpm -C packages/core-engine test`

Result: all commands above passed during this landing. Manual Playwright screenshot sampling was also used for `16:9` / `16:10` desktop comparison.

### Remaining Risk

- Narrow/mobile layout is still deferred; below `max-width: 980px` the stacked fallback remains a follow-up concern.
- The shell is still not pixel-identical to `TargetUI.png`, but this wave closes the three highest-priority problems first: oversized side gutters, footer crushing, and mode-gated interaction redundancy.
- Any later fidelity pass should continue as a presentation-only follow-up rather than reopening command-surface semantics again.
