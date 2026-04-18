# Visual V7 - Release-Ready Closure

Date: 2026-04-18

## ZH

### 范围

- 集中收口 visual 基线，不再追加新的 `--update-snapshots`，而是验证 V1-V6 已提交 baseline 作为最终冻结面继续通过 `check-visual`。
- 复核 Desktop parity，确认 shared shell 在 `check-phase8` 的 classic-local smoke 下仍命中 frozen `finalStateHash = fnv1a-32b1c890`，且视觉主题入口不破坏该路径。
- 产出最终证据日志，把 `check-phase4` 到 `check-phase8`、`check-a11y`、`check-visual` 的一轮顺序验收结果收敛到单个 closeout 文档。

### 落地结果

- 本次没有再改运行时代码，也没有再刷新 screenshot baseline；V7 的目标是证明前六个 visual 子阶段留下的 UI、视觉快照与 Desktop shell 组合已经可以作为 release-ready 证据面稳定存在。
- `check-visual` 在不带 `--update-snapshots` 的前提下直接通过，说明当前 committed baselines 已经与实际渲染一致，V1-V6 的截图变更面可以冻结。
- `check-phase8` 继续通过 Desktop shared shell smoke：
    - Desktop 启动后仍加载 embedded standalone web runtime；
    - classic-local smoke path 继续命中 frozen `finalStateHash = fnv1a-32b1c890`；
    - session rail 的 `Light` 主题切换仍可在 Desktop 路径中工作，说明 visual shell 与 parity smoke 兼容。
- `check-phase4`、`check-phase5`、`check-phase6`、`check-phase7`、`check-phase8`、`check-a11y`、`check-visual` 已按顺序串行跑绿，满足本轨道 V7 的最终证据要求。
- `docs/40-operations/release-prep.md` §3 未被修改，视觉轨道没有借 V7 引入新的 release gate，只是证明现有 gate 已能覆盖 visual-productization 产物。

### Baseline 冻结面

- V7 关闭时认可并冻结的 committed visual baselines 为：
    - `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `theme-foundation.spec.ts` 属于 DOM/token smoke，不新增 screenshot baseline，但它与以上 7 张截图共同构成最终 visual evidence 面。

### 变更文件

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v7-release-ready-closure.md`
- `docs/10-architecture/visual-productization-plan.md`

### 执行命令与结果

- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

结果：以上命令在 `codex/visual-v7-release-ready-closure` 分支顺序串行通过。`check-phase4-7` 继续覆盖 local / ai / run / room / replay 的 shared shell 门禁，`check-phase8` 继续覆盖 Desktop startup + classic-local smoke + frozen hash，`check-a11y` 继续覆盖产品入口与 replay surface 的 serious / critical = 0，`check-visual` 在不刷新 baseline 的情况下稳定通过。构建产生的 `apps/web/next-env.d.ts` 漂移已在提交前恢复，不纳入本次边界。

### 剩余风险

- 当前 visual track 范围内无待关闭项。
- 后续若出现 baseline 漂移、Desktop smoke hash 变化或 release gate 需要新增命令，应走独立后续变更，不在 V7 closeout 内混入。

## EN

### Scope

- Close the visual-baseline story without adding any new `--update-snapshots` run, proving that the V1-V6 committed baselines now stand as the frozen visual evidence surface.
- Re-validate Desktop parity and confirm that the shared shell still reaches the frozen `finalStateHash = fnv1a-32b1c890` during the `check-phase8` classic-local smoke path, without breaking the visual theme controls.
- Produce one final evidence log that consolidates the sequential acceptance run for `check-phase4` through `check-phase8`, `check-a11y`, and `check-visual`.

### Landed Results

- This wave does not change runtime code and does not refresh any screenshot baseline; V7 exists to prove that the UI, snapshots, and Desktop shell produced by the first six visual sub-phases are stable enough to serve as release-ready evidence.
- `check-visual` now passes directly without `--update-snapshots`, which means the committed baselines already match the rendered product surface and may now be treated as frozen.
- `check-phase8` still proves Desktop shared-shell parity:
    - Desktop still boots the embedded standalone web runtime;
    - the classic-local smoke path still reaches the frozen `finalStateHash = fnv1a-32b1c890`;
    - the session-rail `Light` theme toggle still works inside the Desktop path, so the visual shell remains compatible with the parity smoke.
- `check-phase4`, `check-phase5`, `check-phase6`, `check-phase7`, `check-phase8`, `check-a11y`, and `check-visual` all passed sequentially, satisfying the final evidence requirements for this track.
- `docs/40-operations/release-prep.md` §3 remains untouched. V7 does not add a new release gate; it only proves that the existing release gates already cover the visual-productization output.

### Frozen Baseline Surface

- The committed visual baselines accepted and frozen at V7 closeout are:
    - `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/classic-selection.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/spectator-resync.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/run-sidecar.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/terminal-victory.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-desktop.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/replay-board-mobile.png`
- `theme-foundation.spec.ts` remains a DOM/token smoke rather than a screenshot baseline, but together with those 7 images it now forms the final visual evidence surface.

### Touched Files

- `docs/00-refactor/rebuild-execution-tracker.md`
- `docs/10-architecture/logs/README.md`
- `docs/10-architecture/logs/visual-v7-release-ready-closure.md`
- `docs/10-architecture/visual-productization-plan.md`

### Commands and Results

- `corepack pnpm check-phase4`
- `corepack pnpm check-phase5`
- `corepack pnpm check-phase6`
- `corepack pnpm check-phase7`
- `corepack pnpm check-phase8`
- `node ./tools/check-a11y.mjs`
- `node ./tools/check-visual.mjs`

Result: all commands passed sequentially on branch `codex/visual-v7-release-ready-closure`. `check-phase4-7` continue to cover the shared-shell gates across local / ai / run / room / replay, `check-phase8` continues to cover Desktop startup + the classic-local smoke + the frozen hash, `check-a11y` keeps the product entrypoints and replay surface at serious / critical = 0, and `check-visual` now passes without refreshing any baseline. The build-generated `apps/web/next-env.d.ts` drift was restored before commit and is not part of this boundary.

### Remaining Risk

- No open items remain inside the current visual track.
- Any future baseline drift, Desktop smoke-hash change, or release-gate expansion must land as a separate follow-up rather than being folded into the V7 closeout.
