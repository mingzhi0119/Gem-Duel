# Visual Productization Track — Independent Audit (V1–V7)

## ZH

### 审计元数据

- 审计日期: 2026-04-18
- 审计对象: `docs/10-architecture/visual-productization-plan.md` 的 V1–V7 全部子阶段
- 审计输入:
    - 仓库 HEAD 分支 `codex/visual-v7-release-ready-closure`
    - 合入落地的单个 squash commit `ab04e2c feat(ui): land visual productization track v1-v7`
    - 七份子阶段日志 `docs/10-architecture/logs/visual-v{1..7}-*.md`
    - 变更范围：`packages/ui/*`、`apps/web/*`、`docs/*`（见下）
- 审计方法:
    - 逐项比对 plan §7 Done Criteria、§8 Non-Goals、§9 Risks、§10 Evidence；
    - 对每条 invariant 用 `git diff --stat` 跑一轮反证：若声明"不动 X"，则 X 的改动行数必须为 0；
    - 对每条 decision（特别是 V5 Save/Load）到源码确认实际选型；
    - 对每条 gate（`check-phase{4..8}` / `check-a11y` / `check-visual`）确认 V7 日志与 `release-prep.md` §3 的一致性。

### 审计结论（总）

- V1–V7 已按 plan 顺序落地，所有 plan 主体 invariant（contract 不扩、`UiViewModel` 不改、`release-prep.md` §3 不新增 gate、`MatchView` debug fallback 保留、Desktop frozen hash 保持 `fnv1a-32b1c890`）**完整守住**。
- V5 的 Save/Load 硬决策选择 **A**（不渲染无 contract 背书的按钮），是本次视觉产品化最关键的工程纪律点。审计通过。
- 本次审计**不阻塞发布**，但识别出三类需要后续处理的遗留点，建议作为 Visual Hardening Wave 1 单独收口，不回刷 V-track。

### 受控范围（实测）

| 维度                                      | 实测值                                                                                                                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 单 squash commit                          | `ab04e2c`（56 files, +5195 / -542）                                                                                                                                                                                                         |
| `packages/contracts` 改动                 | 0 lines                                                                                                                                                                                                                                     |
| `packages/domain` 改动                    | 0 lines                                                                                                                                                                                                                                     |
| `packages/core-engine` 改动               | 0 lines                                                                                                                                                                                                                                     |
| `packages/adapters` 改动                  | 0 lines                                                                                                                                                                                                                                     |
| `packages/application` 改动               | 0 lines                                                                                                                                                                                                                                     |
| `apps/room-service` 改动                  | 0 lines                                                                                                                                                                                                                                     |
| `apps/desktop` 改动                       | 0 lines（Desktop 复用 web standalone runtime，通过 `check-phase8` classic-local smoke 命中 `fnv1a-32b1c890`）                                                                                                                               |
| `docs/40-operations/release-prep.md` 改动 | 0 lines                                                                                                                                                                                                                                     |
| `packages/ui` 核心改动                    | `views/board-scene.tsx` 498 lines、`styles/shell.css` 1475 lines、`styles/tokens.css` 183 lines、`hud/turn-hud.tsx`、`board/*`、`drawer/*`、新 `styles/style-registry.ts`、新 `styles/shell-presentation.ts`、新 `i18n/messages.ts` +108 行 |
| `apps/web` 新增组件                       | `apps/web/app/components/session-rail.tsx`、`apps/web/app/components/shell-presentation-sync.tsx`                                                                                                                                           |
| Visual 基线刷新                           | 7 张 PNG：1×local-board、4×playground、2×replay；总计 ~12.2 MB（刷新前 ~3.5 MB）                                                                                                                                                            |
| 新增 spec                                 | `apps/web/tests/visual/theme-foundation.spec.ts`（5 个 DOM token smoke）、`apps/web/tests/phase4/session-rail-controls.spec.ts`                                                                                                             |

### 逐项 invariant 核对

| 来源               | 要求                                                           | 实测                                                                                                                                 | 结论 |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| plan §4 Invariants | 不改 `packages/contracts` / `UiViewModel` / `pendingSelection` | contracts/domain/engine/adapters/application/room-service diff 全为 0                                                                | ✅   |
| plan §4 Invariants | `MatchView` `?shell=debug` fallback 仍可用                     | `apps/web/app/play/components/session-board-shell.tsx` 仍根据 `shellMode === 'default' / 'debug'` 分支 BoardScene / MatchView        | ✅   |
| plan §4 / V7 log   | Desktop `check-phase8` 命中 frozen `fnv1a-32b1c890`            | V7 log §落地结果 / §Landed Results 两处均显式断言，且 `apps/desktop` diff = 0                                                        | ✅   |
| plan §4 / V5 log   | Save / Load 不渲染假按钮                                       | `apps/web/app/components/session-rail.tsx` 未出现 Save / Load 节；rail 只暴露 summary / Theme / Style / Rules + Restart 四个 section | ✅   |
| plan §4 Invariants | `check-a11y` 保持 serious/critical = 0                         | `apps/web/tests/a11y/axe.ts` 仍对 `critical` + `serious` 断言；V5/V6/V7 log 明示通过                                                 | ✅   |
| plan §4 Invariants | `release-prep.md` §3 门禁不扩                                  | `docs/40-operations/release-prep.md` diff = 0                                                                                        | ✅   |
| plan §8 Non-Goals  | 不引入 app-wide locale routing                                 | 仅 `packages/ui/src/i18n/messages.ts` 新增（行数 +108，均为 sessionRail 双语文案），无 app-level locale 路由                         | ✅   |
| plan §8 Non-Goals  | 不做 Desktop packaging / signing / store                       | `apps/desktop` 本轨道 diff = 0                                                                                                       | ✅   |
| plan §10 Evidence  | 每 V 一个 `logs/visual-v{N}-*.md` 日志                         | V1–V7 七份日志齐全，均列出范围 / 落地 / 变更文件 / 命令结果                                                                          | ✅   |
| plan §10 Evidence  | baseline 只在受控子阶段刷新                                    | V1 刷 playground 四张；V4/V5 各自刷自己的受影响基线；V6 再刷 `run-sidecar.png` 一张；V7 无刷图                                       | ✅   |

### 深入发现

以下是审计期间识别的、需要后续独立处理的**非阻塞**遗留点。它们不回刷 V-track，也不纳入 `release-prep.md` §3。

#### F-1（中）Play surface 的 `hashUnavailableLabel` 未走双语

- 现象：`apps/web/app/play/components/session-board-shell.tsx:59` 将 `hashUnavailableLabel` 硬编码为英文 `"Live hash unavailable"`，传给 `SessionRail`。
- 对照：`apps/web/app/rooms/[roomId]/room-live-client.tsx` 与 `apps/web/app/replays/[replayId]/replay-client.tsx` 均走 `messages.boardScene.replayHashUnavailableLabel` / 本地化 `messages`。
- 影响：`?locale=zh` 或未来 locale 路由启用后，Local / AI / Run 三个 play 路径会一直显示英文 fallback 文案，与 V5 日志"双语文案已接入 rail"承诺有轻微出入。
- 建议：在 `packages/ui/src/i18n/messages.ts` 的 `sessionRail` 分组下补 `hashUnavailableLabel`，然后让 `session-board-shell.tsx` 通过 `getUiMessages(locale)` 注入，而不是硬编码字符串。

#### F-2（中）`getToolbarLabel` 硬编码英文标签（**pre-existing**）

- 现象：`packages/ui/src/views/board-scene.tsx:99-114` 的 `getToolbarLabel` 对 `BEGIN_GEM_SELECTION / BEGIN_RESERVE / BEGIN_BUY / BEGIN_PRIVILEGE / REPLENISH_BOARD` 五个命令返回硬编码英文字符串（"Take gems" / "Reserve" / "Buy" / "Privilege" / "Replenish board"）。
- 追溯：`git show d1750ce:packages/ui/src/views/board-scene.tsx` 确认此函数在 V1 之前就已存在，V-track **未引入** 此问题，但也**未趁机修复**。
- 影响：`zh` locale 下 BoardScene 工具条会显示英文；由于 V2 把这些按钮放到了更显眼的顶部位置，这个老洞现在可见性更高。
- 建议：将这五个标签搬进 `messages.ts` 的 `boardScene.toolbar` 分组；这个改动不应打在 V-track，而应作为独立 bilingual hardening 落地。

#### F-3（中）`SHELL_STYLE_REGISTRY` 目前只有一条记录但对用户可见

- 现象：`packages/ui/src/styles/style-registry.ts` 定义了唯一 `default-tactical` 条目；但 `SessionRail` §Style 把它以只读 pill + "styleLockedNote" 文案直接渲染给玩家（`session-rail.tsx:206-215`）。
- 影响：用户会看到一个只有一项、且明确标"locked"的"Style"板块，产品语义上接近"未实现提示"。V5 日志将此解释为"把 extension point 暴露出来"，是合理的工程解释，但从产品视角是**可见的 YAGNI 留口**。
- 建议（二选一）:
    - a) 在 registry 真正出现第二套风格前，`SessionRail` §Style 不渲染该 section（或改成工程调试开关 `?dev=1` 后才展示）；
    - b) 直接删除 `styleLockedNote` 文案，把 pill 降级为纯 status badge（"Current: Default Tactical"），避免"Locked"措辞让玩家误以为有付费/解锁系统。

#### F-4（低）Light 主题无 screenshot baseline

- 现象：`theme-foundation.spec.ts` 为 light 主题提供 DOM / token smoke，但全部 7 张截图基线都在 dark 主题下生成。
- 影响：若未来某次纯 CSS 改动破坏 light 主题（例如 chip border 在浅底上消失、royal crest 丢失对比度），`check-visual` 不会拦住。
- 建议：在 Visual Hardening Wave 1 单独增加 1 张 `playground/classic-selection?theme=light` baseline（**而不是**每张图 ×2），仅作为 light 主题的回归抽样点；新增后要在 `docs/40-operations/release-prep.md` 之外的 `check-visual` 内部记录该采样决策。

#### F-5（低）Visual baseline 仓库体积增长 ~3.5×

- 现象：7 张 PNG 基线从 ~3.5 MB 增长到 ~12.2 MB（local-board 从 495 KB → 1.83 MB；playground 四张各 ~1.8–2.0 MB）。
- 根因：dark 渐变 + 新增的 tactical-grid 叠层在 PNG 下压缩率显著低于原本的浅底单色；同时部分页面尺寸略涨。
- 影响：`git clone` / LFS（若未来启用）的带宽成本上升；单次 rebaseline 的 PR diff 可能触发 review 警觉。
- 建议：
    - 在 `apps/web/tests/visual/*.spec.ts` 里显式设置合适的 `clip` / `fullPage: false`，减少与测试语义无关的像素面；
    - 或在 `tools/check-visual.mjs` 入口加一次 `pngquant`/`oxipng` 压缩通道（**仅对 baseline 写入路径生效**，diff 比较仍用原始像素），可把单图缩回 300–500 KB 量级；
    - 不应现在临时手改基线，必须走一次完整 `--update-snapshots` + 独立 log。

#### F-6（低）`SessionRail` / `ShellPresentationSync` 栖身 `apps/web/app/components/`

- 现象：V5 把 session rail 与展示同步桥放到了 `apps/web/app/components/` 而非 `packages/ui/`。
- 合理性：两者都强依赖 `next/link` / `window.localStorage` / `window.matchMedia` / `document.documentElement`，确实不适合放到框架无关的 `packages/ui`。
- 影响：`apps/desktop` 通过 embedded web runtime 复用，不构成 duplication；但如果未来出现第二个 shell（例如 `apps/mobile` 或 `apps/native`），这两个组件需要被拉回一个框架无关的层，否则会出现"rail 语义只活在 web app 里"的退化。
- 建议：在 plan §9 Risks 表里追加一行"未来新 shell 时必须重新抽层"，并在 `packages/ui` 增加一份 README 段落说明"表现同步/rail 为何不放在 UI 包"；不立刻搬家。

### 风险与发布面

- 上述 F-1 至 F-6 **都不阻塞 `v1.0.x` 后续发布**。release-prep 的 §3 门禁全绿，V7 的日志已给出足够证据。
- F-1 / F-2 属于**双语产品化债务**，在启动 backlog 中"app-wide locale routing"之前，建议作为 Visual Hardening Wave 1 单独关闭；两者的修复加起来行数极小。
- F-3 是**产品语义决策**，不要等修 bug 的心情去改；建议等 V-track 走完一个迭代周期（例如第一批真实用户反馈回来）之后再定。
- F-4 / F-5 是**工具链治理**，适合和 `tools/check-visual.mjs` 的下一次升级一起做，不要拆成两个独立 PR。
- F-6 是**架构纪律记录**，暂不落代码。

### 建议的执行步骤（下一波 "Visual Hardening Wave 1"）

以下步骤按"独立 PR / 独立日志 / 不触碰 V-track 基线"的方式推进。每一步的 log 落地路径为 `docs/10-architecture/logs/visual-hardening-wave-1-<slug>.md`。

1. **Step 1 — 补 `hashUnavailableLabel` 双语（对应 F-1）**
    - 修改文件: `packages/ui/src/i18n/messages.ts`、`apps/web/app/play/components/session-board-shell.tsx`（可选：room / replay client 若有重复硬编码同步迁移）；
    - 验证: `corepack pnpm typecheck`、`corepack pnpm lint`、`corepack pnpm check-phase4`、`node ./tools/check-a11y.mjs`；
    - Baseline: 不刷；仅 DOM 文案变化，不应改动 committed snapshots。

2. **Step 2 — `BoardScene` 工具条标签双语（对应 F-2）**
    - 修改文件: `packages/ui/src/i18n/messages.ts`（新增 `boardScene.toolbar.*`）、`packages/ui/src/views/board-scene.tsx`（`getToolbarLabel` 改为读 `uiMessages.boardScene.toolbar`）；
    - 验证: `corepack pnpm typecheck`、`corepack pnpm check-phase4`、`check-phase5`、`check-phase6`、`check-phase7`；
    - Baseline: 由于五个按钮的英文宽度与中文宽度近似（"Take gems" vs "拿取宝石"），建议**先跑一次 diff-only `check-visual`**，若落在阈值以内则不刷；若超阈值再在同一 PR 做受控 `--update-snapshots`，并在日志里列出刷新的文件。

3. **Step 3 — `Style` 板块的产品语义二选一（对应 F-3）**
    - 先用 `AskQuestion` 或 review comment 定方案 a / b；
    - 实现方案仅动 `apps/web/app/components/session-rail.tsx` + `packages/ui/src/i18n/messages.ts`；
    - 验证: `check-phase4` + `check-a11y`；不需要刷基线（除非选方案 a 隐藏 section 导致 rail 排版收缩）。

4. **Step 4 — Light 主题 screenshot 抽样（对应 F-4）**
    - 新增 `apps/web/tests/visual/theme-foundation.spec.ts` 中的 1 条 `test('light classic selection', ...)`（或独立 spec），产出 **1 张** `playground.spec.ts-snapshots/classic-selection-light.png`；
    - 验证: 一次 `--update-snapshots` 只在此 spec 作用域，再跑一遍只读 `check-visual`；
    - 不影响既有 7 张 dark baseline。

5. **Step 5 — Baseline 体积治理（对应 F-5）**
    - 在 `tools/check-visual.mjs` 增加一次 `pngquant` / `oxipng`（可选 `lossless`）处理 **只发生在 `--update-snapshots` 写入分支**；
    - 重新走一次受控 `--update-snapshots`，一次性把 V-track 冻结的 7 张 + Step 4 新增的 1 张全部压缩；
    - 验证: 跑一遍只读 `check-visual`、`check-phase{4..8}`、`check-a11y` 确认未出 diff；
    - 在本 Step log 中记录压缩前后字节数与 baseline hash。

6. **Step 6 — 架构纪律 README（对应 F-6）**
    - 只改文档：`packages/ui/AGENTS.md` 或新增 `packages/ui/README.md` 中一个段落，说明"rail / presentation-sync 因依赖 browser/Next 栖身 apps/web，若引入新 shell 必须重新抽层"；
    - `docs/10-architecture/visual-productization-plan.md` §9 Risks 增加一行"新 shell 时需重新抽层"；
    - 不需要代码 / 基线变更，只跑 `corepack pnpm lint` 与 `corepack pnpm build` 确认 MD 不破坏 docs 校验。

### 审计签收

- 独立审计员意见: V1–V7 已具备合并 / 发版条件，不需要补跑额外的 gate。
- 后续动作: 建议把上面 Step 1–6 组合成 **Visual Hardening Wave 1**，独立 PR 与独立 log 落地；在未完成之前，`docs/10-architecture/visual-productization-plan.md` §7 Done Criteria 保持不变，不额外追加收尾项。
- 本审计不向 `docs/40-operations/release-prep.md` §3 追加任何命令。

---

## EN

### Audit Metadata

- Audit date: 2026-04-18
- Target: all V1–V7 sub-phases of `docs/10-architecture/visual-productization-plan.md`
- Inputs:
    - Repository HEAD branch `codex/visual-v7-release-ready-closure`;
    - The single squash commit `ab04e2c feat(ui): land visual productization track v1-v7`;
    - The seven sub-phase logs `docs/10-architecture/logs/visual-v{1..7}-*.md`;
    - Scope of changes: `packages/ui/*`, `apps/web/*`, `docs/*` (see below).
- Method:
    - Check each plan §7 Done Criteria, §8 Non-Goals, §9 Risks, and §10 Evidence item against the commit;
    - For every "don't touch X" invariant, run a `git diff --stat` counter-proof (diff must be 0 lines);
    - For every decision (especially V5 Save/Load) read the source and confirm the selected option;
    - For every gate (`check-phase{4..8}` / `check-a11y` / `check-visual`) cross-check the V7 log with `release-prep.md` §3.

### Overall Conclusion

- V1–V7 were landed in plan order; **all primary invariants hold** (no contract expansion, no `UiViewModel` change, no new gate in `release-prep.md` §3, `MatchView` debug fallback preserved, Desktop frozen hash still `fnv1a-32b1c890`).
- The V5 Save / Load hard decision chose **Option A** (do not render buttons that aren't contract-backed). That is the most important engineering-discipline data point in this track, and it passes audit.
- The audit **does not block release**; however it identifies three classes of follow-ups that should land as a separate Visual Hardening Wave 1 rather than reopening any V-track log.

### Measured Scope

| Dimension                                    | Measured value                                                                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Single squash commit                         | `ab04e2c` (56 files, +5195 / -542)                                                                                                                                                                                                               |
| Diff in `packages/contracts`                 | 0 lines                                                                                                                                                                                                                                          |
| Diff in `packages/domain`                    | 0 lines                                                                                                                                                                                                                                          |
| Diff in `packages/core-engine`               | 0 lines                                                                                                                                                                                                                                          |
| Diff in `packages/adapters`                  | 0 lines                                                                                                                                                                                                                                          |
| Diff in `packages/application`               | 0 lines                                                                                                                                                                                                                                          |
| Diff in `apps/room-service`                  | 0 lines                                                                                                                                                                                                                                          |
| Diff in `apps/desktop`                       | 0 lines (Desktop reuses the embedded web standalone runtime; `check-phase8` classic-local smoke still reaches `fnv1a-32b1c890`)                                                                                                                  |
| Diff in `docs/40-operations/release-prep.md` | 0 lines                                                                                                                                                                                                                                          |
| Core `packages/ui` diff                      | `views/board-scene.tsx` 498 lines, `styles/shell.css` 1475 lines, `styles/tokens.css` 183 lines, `hud/turn-hud.tsx`, `board/*`, `drawer/*`, new `styles/style-registry.ts`, new `styles/shell-presentation.ts`, +108 lines in `i18n/messages.ts` |
| New `apps/web` components                    | `apps/web/app/components/session-rail.tsx`, `apps/web/app/components/shell-presentation-sync.tsx`                                                                                                                                                |
| Visual baseline refresh                      | 7 PNGs: 1× local-board, 4× playground, 2× replay; ~12.2 MB total (was ~3.5 MB)                                                                                                                                                                   |
| New specs                                    | `apps/web/tests/visual/theme-foundation.spec.ts` (5 DOM / token smoke tests), `apps/web/tests/phase4/session-rail-controls.spec.ts`                                                                                                              |

### Invariant-by-Invariant Check

| Source             | Requirement                                                             | Observation                                                                                                                                    | Verdict |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| plan §4 Invariants | No changes to `packages/contracts` / `UiViewModel` / `pendingSelection` | Combined diff across contracts/domain/engine/adapters/application/room-service is 0                                                            | ✅      |
| plan §4 Invariants | `MatchView` `?shell=debug` fallback still usable                        | `apps/web/app/play/components/session-board-shell.tsx` still branches on `shellMode === 'default' / 'debug'` into BoardScene / MatchView       | ✅      |
| plan §4 / V7 log   | Desktop `check-phase8` still reaches frozen `fnv1a-32b1c890`            | V7 log asserts this in both ZH and EN sections; `apps/desktop` diff = 0                                                                        | ✅      |
| plan §4 / V5 log   | No fake Save / Load buttons rendered                                    | `apps/web/app/components/session-rail.tsx` ships only summary / Theme / Style / Rules + Restart sections; no Save or Load                      | ✅      |
| plan §4 Invariants | `check-a11y` remains at 0 serious / critical                            | `apps/web/tests/a11y/axe.ts` still filters on `critical` + `serious`; V5/V6/V7 logs confirm clean runs                                         | ✅      |
| plan §4 Invariants | No new commands in `release-prep.md` §3                                 | `docs/40-operations/release-prep.md` diff = 0                                                                                                  | ✅      |
| plan §8 Non-Goals  | No app-wide locale routing                                              | Only the bilingual `sessionRail` catalog grew (`+108` lines); no locale routing layer was added                                                | ✅      |
| plan §8 Non-Goals  | No Desktop packaging / signing / store                                  | `apps/desktop` diff = 0                                                                                                                        | ✅      |
| plan §10 Evidence  | One `logs/visual-v{N}-*.md` log per sub-phase                           | Seven logs exist, each with scope / landed results / touched files / command results                                                           | ✅      |
| plan §10 Evidence  | Baselines refresh only in scoped sub-phases                             | V1 refreshed four playground shots; V4 / V5 each refreshed their directly-affected shots; V6 refreshed `run-sidecar.png`; V7 refreshed nothing | ✅      |

### Deeper Findings

These are **non-blocking** follow-ups identified during audit. They should land as a separate Visual Hardening Wave 1 rather than amending any V-track log or the V-track squash commit; and they do not enter `release-prep.md` §3.

#### F-1 (Medium) Play surface hardcodes the English `hashUnavailableLabel`

- Observation: `apps/web/app/play/components/session-board-shell.tsx:59` passes the literal English string `"Live hash unavailable"` into `SessionRail`.
- Contrast: `apps/web/app/rooms/[roomId]/room-live-client.tsx` and `apps/web/app/replays/[replayId]/replay-client.tsx` both wire the same label through `messages.boardScene.replayHashUnavailableLabel` and are therefore bilingual.
- Impact: Under `?locale=zh` (or once app-wide locale routing ships), the Local / AI / Run play surfaces will keep rendering an English fallback, weakening the V5 claim that the rail is fully bilingual.
- Recommendation: Add a `hashUnavailableLabel` entry under `sessionRail` in `packages/ui/src/i18n/messages.ts`, and inject it through `getUiMessages(locale)` from `session-board-shell.tsx` instead of hardcoding a string.

#### F-2 (Medium) `getToolbarLabel` hardcodes five English strings (pre-existing)

- Observation: `packages/ui/src/views/board-scene.tsx:99-114` returns hardcoded English for `BEGIN_GEM_SELECTION / BEGIN_RESERVE / BEGIN_BUY / BEGIN_PRIVILEGE / REPLENISH_BOARD`.
- History: `git show d1750ce:packages/ui/src/views/board-scene.tsx` shows the function existed before V1. The V-track **did not introduce** the hole, but also **did not fix** it while it was restyling the surrounding HUD.
- Impact: In zh locale the top toolbar stays English. Because V2 moved those buttons into a more prominent position, the pre-existing hole is now more visible.
- Recommendation: Move the five labels into `messages.boardScene.toolbar.*` and read from them. Land this outside the V-track, as part of a bilingual hardening wave.

#### F-3 (Medium) `SHELL_STYLE_REGISTRY` is a one-entry, user-visible surface

- Observation: `packages/ui/src/styles/style-registry.ts` defines the single `default-tactical` entry; yet `SessionRail` §Style exposes it to the player as a read-only pill plus a "styleLockedNote" message (`session-rail.tsx:206-215`).
- Impact: Players see a one-item "Style" section explicitly labeled "locked", which reads as "unimplemented notice" from the product side. V5 explained this as "making the extension point visible", which is a fair engineering rationale, but it remains a **visible YAGNI surface**.
- Recommendation (pick one):
    - a) Do not render the §Style section until a second registered style exists (or gate it behind a `?dev=1` flag);
    - b) Drop the "Locked" wording and downgrade the pill into a plain status badge ("Current: Default Tactical") to avoid suggesting a paid / unlock system.

#### F-4 (Low) No screenshot baseline for the light theme

- Observation: `theme-foundation.spec.ts` provides DOM / token smoke for light, but all seven PNG baselines were captured under the dark theme.
- Impact: A future pure-CSS change that silently degrades the light theme (e.g. missing chip border on light backgrounds, royal crest losing contrast) would not be caught by `check-visual`.
- Recommendation: In Visual Hardening Wave 1, add a **single** `playground/classic-selection?theme=light` baseline (**not** every shot doubled); treat it as a light-theme sampling point. The decision must be logged inside `check-visual`'s tooling log, not in `release-prep.md`.

#### F-5 (Low) Visual baselines grew ~3.5× in repo size

- Observation: The 7 committed PNG baselines grew from ~3.5 MB to ~12.2 MB (local-board 495 KB → 1.83 MB; playground shots each 1.8–2.0 MB).
- Root cause: Dark gradients plus the new tactical-grid overlay compress far worse under PNG than the original light flat surfaces; a few shots also expanded slightly in dimensions.
- Impact: Higher `git clone` / LFS (if ever introduced) bandwidth cost, and larger diffs under rebaseline PRs.
- Recommendation:
    - Tighten each `apps/web/tests/visual/*.spec.ts` with `clip` or `fullPage: false` to remove pixel area that does not contribute to the test assertion;
    - Or add an `pngquant` / `oxipng` pass inside `tools/check-visual.mjs`, but **only on the `--update-snapshots` write path**, keeping raw pixels for diff comparison. That should bring individual baselines back to ~300–500 KB;
    - Do not hand-edit baselines; any size change must land through a full controlled `--update-snapshots` plus its own log.

#### F-6 (Low) `SessionRail` / `ShellPresentationSync` live under `apps/web/app/components/`

- Observation: V5 placed the session rail and the presentation-sync bridge under `apps/web/app/components/` instead of `packages/ui/`.
- Rationale: Both rely on `next/link` / `window.localStorage` / `window.matchMedia` / `document.documentElement`, which are genuinely not portable to a framework-agnostic UI package.
- Impact: `apps/desktop` reuses the embedded web runtime today, so this is not duplication. However, if a future shell (e.g. `apps/mobile` or `apps/native`) appears, both components will need to be re-extracted, or "rail semantics that only live in the web app" will become a structural regression.
- Recommendation: Add a line to plan §9 Risks noting "a new shell surface requires re-extracting rail / presentation-sync", and add a paragraph in `packages/ui`'s README explaining why rail / presentation-sync do not live inside the UI package. Do not relocate files right now.

### Risk and Release Posture

- All of F-1 through F-6 are **non-blocking** for any future `v1.0.x` release. `release-prep.md` §3 is fully green and V7's log carries sufficient evidence.
- F-1 / F-2 are **bilingual product debt**. They should close as Visual Hardening Wave 1 before any work on "app-wide locale routing" actually starts; their combined code diff is tiny.
- F-3 is a **product decision**; do not patch it on a debugging impulse. Decide after the first user-feedback cycle on the V-track shell lands.
- F-4 / F-5 are **tooling governance**; bundle them into the next `tools/check-visual.mjs` upgrade rather than shipping two separate PRs.
- F-6 is a **doc-only architectural note**.

### Recommended Execution Plan — "Visual Hardening Wave 1"

Each step should land as an independent PR with its own log under `docs/10-architecture/logs/visual-hardening-wave-1-<slug>.md`, and must not reopen any V-track log or baseline.

1. **Step 1 — Bilingual `hashUnavailableLabel` (addresses F-1)**
    - Files: `packages/ui/src/i18n/messages.ts`, `apps/web/app/play/components/session-board-shell.tsx`, and any room / replay client duplication surfaced during review;
    - Gates: `corepack pnpm typecheck`, `corepack pnpm lint`, `corepack pnpm check-phase4`, `node ./tools/check-a11y.mjs`;
    - Baselines: no refresh; DOM copy change only.

2. **Step 2 — Bilingual BoardScene toolbar (addresses F-2)**
    - Files: `packages/ui/src/i18n/messages.ts` (add `boardScene.toolbar.*`), `packages/ui/src/views/board-scene.tsx` (`getToolbarLabel` reads from `uiMessages.boardScene.toolbar`);
    - Gates: `corepack pnpm typecheck`, `check-phase4`, `check-phase5`, `check-phase6`, `check-phase7`;
    - Baselines: because EN width and zh width roughly match for these five labels, first run a diff-only `check-visual`; if within threshold, do not refresh; if over threshold, do a controlled `--update-snapshots` in the same PR and list every refreshed file in the log.

3. **Step 3 — Product-semantic decision for the Style section (addresses F-3)**
    - Decide between options (a) hide the section, and (b) downgrade the wording, via `AskQuestion` or review comments;
    - Implementation touches only `apps/web/app/components/session-rail.tsx` + `packages/ui/src/i18n/messages.ts`;
    - Gates: `check-phase4` + `check-a11y`; no baseline refresh unless option (a) causes the rail layout to reflow.

4. **Step 4 — Light-theme sampling baseline (addresses F-4)**
    - Add a single new test case, e.g. `test('light classic selection', ...)`, producing **one** new `playground.spec.ts-snapshots/classic-selection-light.png`;
    - Gates: one `--update-snapshots` scoped to this spec, followed by a read-only `check-visual`;
    - Does not touch the seven existing dark baselines.

5. **Step 5 — Baseline footprint governance (addresses F-5)**
    - Add a `pngquant` / `oxipng` (optionally lossless) step inside `tools/check-visual.mjs`, **running only on the `--update-snapshots` write path**;
    - Run one controlled `--update-snapshots` to compress the seven V-track baselines plus the new Step 4 baseline in one sweep;
    - Gates: one read-only `check-visual`, `check-phase{4..8}`, `check-a11y` to confirm no diff;
    - Log must record byte sizes before and after, plus the new baseline hashes.

6. **Step 6 — Architectural discipline note (addresses F-6)**
    - Docs-only: add a paragraph in `packages/ui/AGENTS.md` (or a new `packages/ui/README.md`) explaining why rail / presentation-sync live in `apps/web`; add a row in `docs/10-architecture/visual-productization-plan.md` §9 Risks noting that any new shell must re-extract these modules;
    - No code or baseline changes; run `corepack pnpm lint` and `corepack pnpm build` to confirm the docs pipeline is green.

### Sign-Off

- Independent auditor verdict: V1–V7 is merge-ready and release-ready; no additional gate needs to run beyond what V7 already proved.
- Next action: Bundle Steps 1–6 above as **Visual Hardening Wave 1**, landing through independent PRs and logs. Until that wave closes, `docs/10-architecture/visual-productization-plan.md` §7 Done Criteria stays unchanged — no extra closure items are appended.
- This audit adds **no** commands to `docs/40-operations/release-prep.md` §3.
