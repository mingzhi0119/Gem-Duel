# Visual Hardening Wave 1 - Audit Follow-Ups

Date: 2026-04-18

## ZH

### 范围

- 按 [`../visual-productization-independent-audit.md`](../visual-productization-independent-audit.md) 一次性关闭 F-1 至 F-6，不回刷 V1-V7 的阶段结论，也不修改 `release-prep.md` §3。
- 继续维持 visual track 的核心 invariant：不扩 contracts、不改 `UiViewModel`、不碰 `apps/desktop` / `apps/room-service` 权威边界，只处理 bilingual debt、Style 产品语义、visual harness 治理与架构纪律说明。
- 这次收口选择把审计建议的 6 个 follow-up 合并到一个 hardening wave log 中，而不是拆 6 个独立 PR；原因是它们都局限在 shared shell 表现层、visual harness 与 docs，且验证命令可以共享。

### 决策摘要

- F-3 选择审计建议 **b**：保留 Style section，但移除 “locked” 文案，把它降级成纯状态展示，不制造未实现/解锁系统的产品暗示。
- Play surface 新增的 `lang` query 仅用于把现有 bilingual catalog 透传到 `/play/local`、`/play/ai`、`/play/run`；这不是 app-wide locale routing，也不引入 locale middleware、路径前缀或全站切换器。
- F-5 选择“写入路径压缩通道”而不是手工裁图：`tools/check-visual.mjs` 只在 `--update-snapshots` 时对 baseline PNG 做一次 `sharp` 无损重编码，读路径与 diff 逻辑不变。

### 落地结果

- F-1：`packages/ui/src/i18n/messages.ts` 新增 `sessionRail.hashUnavailableLabel`，`apps/web/app/play/components/session-board-shell.tsx` 不再硬编码 `"Live hash unavailable"`。
- F-2：`BoardScene` 工具条的 `BEGIN_GEM_SELECTION / BEGIN_RESERVE / BEGIN_BUY / BEGIN_PRIVILEGE / REPLENISH_BOARD` 五个标签已迁入 `messages.boardScene.toolbar.*`，并在 `lang=zh` 的 play surface 中由浏览器自动验收。
- F-3：`SessionRail` 的 Style 卡片现在显示为 `Current / Default Tactical / default-tactical`（中文为 `当前 / 默认战术壳 / default-tactical`），已删除 `styleLockedNote`。
- F-4：`apps/web/tests/visual/theme-foundation.spec.ts` 新增 `classic-selection-light.png`，作为唯一的 light-theme screenshot sampling baseline。
- F-5：`tools/check-visual.mjs` 现在会在 `--update-snapshots` 写入成功后自动遍历 `apps/web/tests/visual/**` 下的 PNG baseline，并用 `sharp` 做一次压缩级别 9 的无损 PNG 重编码。此次受控 rebaseline 的写前体积约为 `13,941.3 KB`，写后约为 `13,377.6 KB`。
- F-6：`packages/ui/AGENTS.md` 与 [`../visual-productization-plan.md`](../visual-productization-plan.md) §9 Risks 已写明：rail / presentation-sync 之所以留在 `apps/web`，是因为依赖 Next/browser APIs；未来若出现新 shell，必须先重新抽层。

### 变更文件

- `apps/web/app/components/session-rail.tsx`
- `apps/web/app/play/ai/page.tsx`
- `apps/web/app/play/local/page.tsx`
- `apps/web/app/play/run/page.tsx`
- `apps/web/app/play/components/match-playground.tsx`
- `apps/web/app/play/components/run-playground.tsx`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/tests/phase4/session-rail-controls.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts-snapshots/classic-selection-light.png`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-hardening-wave-1-audit-followups.md`
- `docs/10-architecture/visual-productization-plan.md`
- `package.json`
- `packages/ui/AGENTS.md`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/views/board-scene.tsx`
- `pnpm-lock.yaml`
- `tools/check-visual.mjs`

### Baseline 变更面

- 新增：`apps/web/tests/visual/theme-foundation.spec.ts-snapshots/classic-selection-light.png`
- 受控重写并压缩：
    - `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- 本轮收口后，visual harness 下共有 8 张 committed PNG baseline，总体积约 `13,698,696` bytes（约 `13.06 MB`）。

### 执行命令与结果

- `corepack pnpm typecheck`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `node ./tools/check-visual.mjs --update-snapshots`
- `corepack pnpm lint`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

结果：以上命令在 `codex/visual-hardening-wave-1` 分支顺序通过。`check-phase4` 新增了 `lang=zh` play surface 的真实页面断言；`check-phase8` 继续命中 frozen `fnv1a-32b1c890`；`check-a11y` 维持 serious / critical = 0；`check-visual` 在新增 1 张 light baseline、重写 7 张既有 baseline 并经过压缩后保持只读通过。构建产生的 `apps/web/next-env.d.ts` 漂移需在提交前恢复，不纳入边界。

### 未覆盖项

- 本波没有把 room surface 也接入 `lang` query；审计 F-1/F-2 只要求修复 play surface 与 shared `BoardScene` 的双语 debt。
- 本波没有扩展更多 light-theme baseline；仍坚持“只加 1 张抽样图，不把全部 dark baseline 翻倍”。
- 本波没有移动 `SessionRail` / `ShellPresentationSync` 的文件位置，只补治理说明，避免在没有第二 shell 的前提下做过早抽象。

## EN

### Scope

- Close F-1 through F-6 from [`../visual-productization-independent-audit.md`](../visual-productization-independent-audit.md) in one pass, without reopening any V1-V7 conclusion and without changing `release-prep.md` §3.
- Preserve the track's core invariants: no contract expansion, no `UiViewModel` changes, and no authority-boundary changes in `apps/desktop` or `apps/room-service`; this wave only addresses bilingual debt, Style product semantics, visual-harness governance, and architectural-discipline notes.
- The audit originally proposed six independent PRs, but this wave intentionally bundles them because they all stay inside the shared-shell presentation layer, the visual harness, and docs, and they share the same validation surface.

### Decision Summary

- F-3 chooses audit option **b**: keep the Style section visible, but remove the “locked” wording and downgrade it into a plain status display instead of suggesting an unimplemented/unlock system.
- The new play-surface `lang` query only forwards the existing bilingual catalog into `/play/local`, `/play/ai`, and `/play/run`; it is not app-wide locale routing and does not add locale middleware, route prefixes, or a site-wide switcher.
- F-5 chooses a write-path optimization pass instead of manual cropping: `tools/check-visual.mjs` now runs one `sharp` lossless PNG rewrite only when `--update-snapshots` is present, while the read-only diff path stays unchanged.

### Landed Results

- F-1: `packages/ui/src/i18n/messages.ts` now exposes `sessionRail.hashUnavailableLabel`, and `apps/web/app/play/components/session-board-shell.tsx` no longer hardcodes `"Live hash unavailable"`.
- F-2: the five `BoardScene` toolbar labels for `BEGIN_GEM_SELECTION / BEGIN_RESERVE / BEGIN_BUY / BEGIN_PRIVILEGE / REPLENISH_BOARD` now live under `messages.boardScene.toolbar.*`, and they are exercised on a real `lang=zh` play surface.
- F-3: the `SessionRail` Style card now renders as `Current / Default Tactical / default-tactical` (Chinese: `当前 / 默认战术壳 / default-tactical`) with no `styleLockedNote`.
- F-4: `apps/web/tests/visual/theme-foundation.spec.ts` now owns `classic-selection-light.png` as the single light-theme screenshot sampling baseline.
- F-5: `tools/check-visual.mjs` now traverses `apps/web/tests/visual/**` after a successful `--update-snapshots` run and applies one lossless `sharp` PNG rewrite at compression level 9. During this controlled rebaseline the write-path footprint dropped from about `13,941.3 KB` to about `13,377.6 KB`.
- F-6: `packages/ui/AGENTS.md` and [`../visual-productization-plan.md`](../visual-productization-plan.md) §9 Risks now explicitly state that rail / presentation-sync remain in `apps/web` because they depend on Next/browser APIs, and any future shell must re-extract them first.

### Touched Files

- `apps/web/app/components/session-rail.tsx`
- `apps/web/app/play/ai/page.tsx`
- `apps/web/app/play/local/page.tsx`
- `apps/web/app/play/run/page.tsx`
- `apps/web/app/play/components/match-playground.tsx`
- `apps/web/app/play/components/run-playground.tsx`
- `apps/web/app/play/components/session-board-shell.tsx`
- `apps/web/tests/phase4/session-rail-controls.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts`
- `apps/web/tests/visual/theme-foundation.spec.ts-snapshots/classic-selection-light.png`
- `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
- `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
- `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-hardening-wave-1-audit-followups.md`
- `docs/10-architecture/visual-productization-plan.md`
- `package.json`
- `packages/ui/AGENTS.md`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/views/board-scene.tsx`
- `pnpm-lock.yaml`
- `tools/check-visual.mjs`

### Baseline Surface

- Added: `apps/web/tests/visual/theme-foundation.spec.ts-snapshots/classic-selection-light.png`
- Rewritten and optimized in a controlled pass:
    - `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- After this wave, the visual harness owns 8 committed PNG baselines totaling about `13,698,696` bytes (`13.06 MB`).

### Commands and Results

- `corepack pnpm typecheck`
- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `node ./tools/check-visual.mjs --update-snapshots`
- `corepack pnpm lint`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

Result: all commands passed sequentially on branch `codex/visual-hardening-wave-1`. `check-phase4` now includes a real `lang=zh` play-surface assertion, `check-phase8` still reaches the frozen `fnv1a-32b1c890`, `check-a11y` remains at serious / critical = 0, and `check-visual` stays green after adding 1 light baseline, rewriting 7 existing baselines, and passing them through the new optimization path. The build-generated `apps/web/next-env.d.ts` drift still needs to be restored before commit and is not part of this boundary.

### Not Covered

- This wave does not add a `lang` query to the room surface; audit F-1/F-2 only required the play-surface and shared-`BoardScene` bilingual debt to be fixed.
- This wave does not multiply the light-theme screenshot matrix; it intentionally keeps the “one sampling shot only” rule.
- This wave does not move `SessionRail` / `ShellPresentationSync`; it only records the discipline note and avoids over-abstracting before a second shell actually exists.
