# Visual V1 - Theme Foundation and Style Registry

Date: 2026-04-18

## ZH

### 范围

- 重写 `packages/ui/src/styles/tokens.css` 与 `packages/ui/src/styles/shell.css`，把 shared shell 从浅色 validation/debug 基调切到 dark tactical tokens。
- 落地 `dark` / `light` / `system` 三态主题基础，并把 `system` 收敛到 `prefers-color-scheme`。
- 新增 style registry stub，只内建 `default-tactical`，但为 card silhouette、dashboard backdrop 与 chrome density 预留受治理挂点。
- 在不改 `BoardScene` 结构编排的前提下，对受影响 visual baselines 做一次受控 rebaseline，并重新跑 `check-visual` / `check-a11y`。

### 落地结果

- `packages/ui/src/styles/tokens.css` 现已分成 theme-aware semantic tokens：
    - 默认以 dark tactical 为主基调；
    - `light` 主题保留同一套层级与对比度语义；
    - typography、spacing、radii、shadow、gem palette 都已改为产品化 token。
- `packages/ui/src/styles/style-registry.ts` 新增 `default-tactical` style registry stub，并提供稳定 fallback。
- `packages/ui/src/styles/shell-presentation.ts` 与 `apps/web/app/components/shell-presentation-sync.tsx` 新增 shared-shell presentation foundation：
    - query / storage / default 三层解析；
    - `theme=dark|light|system`；
    - `style=default-tactical`；
    - `system` 通过 `matchMedia('(prefers-color-scheme: dark)')` 解析真实主题。
- `apps/web/app/layout.tsx` 现将 theme/style data attributes 固定在 shared shell 根节点，并用 `Suspense` 包裹 client sync，避免 Next prerender 退化。
- `apps/web/tests/visual/theme-foundation.spec.ts` 新增 smoke gate，覆盖：
    - playground 默认 dark tactical；
    - product entrypoint 的 light override 与跨入口保持；
    - `system` 跟随 `prefers-color-scheme`；
    - unknown style fallback 到 `default-tactical`。

### 未覆盖项

- 本波没有暴露最终用户可操作的 Theme / Style picker；V5 再决定 selector 入口与持久化 UX。
- 本波没有重排 `BoardScene` layout slot；V2 再处理三区 shell 骨架。
- 本波没有追加 Desktop 专项 smoke；当前 theme foundation 通过 shared web shell 为 Desktop 后续验证打底。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v1-theme-foundation-and-style-registry.md`
- `apps/web/app/components/shell-presentation-sync.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell-presentation.ts`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/styles/style-registry.ts`
- `packages/ui/src/styles/tokens.css`
- `packages/ui/src/views/board-scene.tsx`

### Baseline 变更面

- 受控 rebaseline 仅覆盖 `apps/web/tests/visual/**` 下当前受 V1 token/shell 改动影响的 committed baselines：
    - playground 四张 scene baseline；
    - local board 一张 baseline；
    - replay desktop/mobile 两张 baseline。
- 没有新增 visual suite 之外的 committed screenshots。

### 执行命令与结果

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`
- `node ./tools/check-a11y.mjs`
- `corepack pnpm test`
- `corepack pnpm build`

结果：以上命令在本分支收口时全部通过；`check-a11y` 保持 serious / critical = 0，`check-visual` 在 rebaseline 后可无更新参数通过。

## EN

### Scope

- Rewrite `packages/ui/src/styles/tokens.css` and `packages/ui/src/styles/shell.css` so the shared shell moves from the light validation/debug tone to dark tactical tokens.
- Land the `dark` / `light` / `system` theme foundation, with `system` resolved from `prefers-color-scheme`.
- Add a style-registry stub that only ships `default-tactical` while reserving governed hooks for card silhouette, dashboard backdrop, and chrome density.
- Perform one controlled rebaseline for the impacted visual baselines, then rerun `check-visual` and `check-a11y` without changing `BoardScene` layout composition.

### Landed Results

- `packages/ui/src/styles/tokens.css` now exposes theme-aware semantic tokens:
    - dark tactical is the default shell baseline;
    - the light theme keeps the same hierarchy and contrast semantics;
    - typography, spacing, radii, shadow, and gem-palette tokens are now productized.
- `packages/ui/src/styles/style-registry.ts` adds the governed `default-tactical` registry stub plus a stable fallback path.
- `packages/ui/src/styles/shell-presentation.ts` and `apps/web/app/components/shell-presentation-sync.tsx` add the shared-shell presentation foundation:
    - query / storage / default resolution;
    - `theme=dark|light|system`;
    - `style=default-tactical`;
    - `system` resolved through `matchMedia('(prefers-color-scheme: dark)')`.
- `apps/web/app/layout.tsx` now pins theme/style data attributes on the shared-shell root and wraps the client sync in `Suspense`, keeping Next prerender intact.
- `apps/web/tests/visual/theme-foundation.spec.ts` adds a smoke gate for:
    - the default dark-tactical playground shell;
    - a light override that persists across product entrypoints;
    - `system` following `prefers-color-scheme`;
    - unknown style fallback to `default-tactical`.

### Not Covered

- This wave does not expose an end-user Theme / Style picker yet; V5 will decide the selector entrypoint and persistence UX.
- This wave does not re-layout `BoardScene` slots; V2 will handle the three-zone shell skeleton.
- This wave does not add a Desktop-specific smoke run; the shared web shell now carries the presentation foundation that Desktop will consume later.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/visual-productization-plan.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v1-theme-foundation-and-style-registry.md`
- `apps/web/app/components/shell-presentation-sync.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `packages/ui/src/index.tsx`
- `packages/ui/src/styles/shell-presentation.ts`
- `packages/ui/src/styles/shell.css`
- `packages/ui/src/styles/style-registry.ts`
- `packages/ui/src/styles/tokens.css`
- `packages/ui/src/views/board-scene.tsx`

### Baseline Change Surface

- The controlled rebaseline only touched committed baselines under `apps/web/tests/visual/**` that were directly affected by the V1 token/shell rewrite:
    - four playground scene baselines;
    - one local-board baseline;
    - two replay desktop/mobile baselines.
- No committed screenshots outside the visual suite were added or refreshed.

### Commands and Outcomes

- `corepack pnpm typecheck`
- `corepack pnpm lint`
- `node ./tools/check-visual.mjs --update-snapshots`
- `node ./tools/check-visual.mjs`
- `node ./tools/check-a11y.mjs`
- `corepack pnpm test`
- `corepack pnpm build`

Outcome: all commands above passed on this branch. `check-a11y` stays at 0 serious / critical findings, and `check-visual` passes without snapshot updates after the controlled rebaseline.
