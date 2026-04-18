# Phase 4 Player Path Acceptance Matrix

## ZH

### 文档定位

本文冻结并记录 Phase 4 `/play/local` 关闭前必须自动化覆盖的 8 条 classic-local 玩家路径。每一条路径都绑定同一组三元组：

- `seed`
- `starting snapshot / fixture source`
- `expected finalStateHash`

本矩阵最初是 Gate 2 preflight 的正式产物；截至 2026-04-18，Gate 4 已关闭，8 条路径现都由 `apps/web/tests/phase4/local-player-paths.spec.ts` 自动化覆盖。本文继续作为 authoritative triad 与 Phase 4 完成证明的索引入口。

### 范围与约束

- 只覆盖 **classic local** 默认入口；不把 `/play/ai`、`/play/run`、`/rooms/[roomId]` 纳入本矩阵。
- authoritative source 仍是 `apps/web/app/play/local/scenarios.ts` 中冻结的 scenario definitions。
- Gate 2 的 `check-phase4` 先验证“每条路径都能 deterministic bootstrap 到正确起点”；Gate 4 已把它升级为完整玩家交互闭环。
- 若后续实现发现 contract / schema 缺口，不得在页面层补推导，必须暂停并回到 Phase 2 governance。

### 当前已落地 surface

- 默认 classic-local 路由：`/play/local`
- debug fallback：`/play/local?shell=debug`
- deterministic scenario bootstrap：`/play/local?scenario=<row-id>`
- 默认 renderer：product-facing `BoardScene`
- repo-level automation entrypoint：`pnpm check-phase4`
- 当前 automation 面：
    - `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
    - `apps/web/tests/phase4/local-player-paths.spec.ts`
    - `tools/check-phase4.mjs`
- 当前 bootstrap assertions：
    - `phase4-scenario-id`
    - `phase4-expected-hash`
    - fixture source 文案可见
    - terminal scenario 暴露无动作只读态
    - debug fallback 暴露 `phase4-shell-mode`
- 当前交互级 assertions：
    - 8 条路径均以真实 UI affordance 完成点击链；
    - 每条路径都断言 `current-final-state-hash` 等于冻结值；
    - `/play/local` 默认使用 `BoardScene`；
    - `/play/local?shell=debug` 继续保留 legacy `MatchView` fallback。

### Acceptance Matrix

| Row | Scenario ID               | Player Path                  | Seed   | Starting snapshot / fixture source                                                              | Expected finalStateHash | Expected UI assertions                                                 | Gate 2 status | Gate 4 automation |
| --- | ------------------------- | ---------------------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- | ------------- | ----------------- |
| 1   | `take-three-linked-gems`  | 首回合取 3 枚连线宝石        | `2101` | `Phase 4 local scenario fixture: classic local gem-selection start`                             | `fnv1a-32b1c890`        | 棋盘点选 3 个连线格；`selectionDraft` 记录选择；暴露 confirm           | 已冻结        | Playwright 已通过 |
| 2   | `buy-first-pyramid-card`  | 购买第一张 pyramid 卡        | `2102` | `Phase 4 local scenario fixture: buying-phase zero-cost pyramid slot`                           | `fnv1a-b9ab87ac`        | 第一层第一槽 primary affordance 直接购买；购买后 market 状态推进       | 已冻结        | Playwright 已通过 |
| 3   | `use-privilege-two-cells` | 使用 privilege 取 2 格       | `2103` | `Phase 4 local scenario fixture: privilege phase with one privilege available`                  | `fnv1a-7399f1e6`        | 两次 board click 形成 privilege draft；confirm 完成                    | 已冻结        | Playwright 已通过 |
| 4   | `reserve-blind-tier3`     | 保留第三层盲卡并拿 gold      | `2104` | `Phase 4 local scenario fixture: reserving phase with a unique gold cell and live level-3 deck` | `fnv1a-7944f696`        | 明确 reserve affordance 指向 level-3 blind deck；gold 消耗到唯一合法格 | 已冻结        | Playwright 已通过 |
| 5   | `resolve-bonus-token`     | 解决 take-bonus-token prompt | `2105` | `Phase 4 local scenario fixture: running take_board_token effect prompt`                        | `fnv1a-8a7ecb89`        | Prompt banner 暴露 effect；高亮格点击后清 prompt                       | 已冻结        | Playwright 已通过 |
| 6   | `resolve-gain-royal`      | 解决 gain-royal prompt       | `2106` | `Phase 4 local scenario fixture: running gain_royal effect prompt`                              | `fnv1a-7abbfb1c`        | Royal court 仅暴露合法 royal offers；点击后完成奖励                    | 已冻结        | Playwright 已通过 |
| 7   | `terminal-victory`        | 终局胜利 overlay             | `2107` | `Phase 4 local scenario fixture: completed classic-local terminal snapshot`                     | `fnv1a-ffa5d769`        | completed local match 暴露 terminal state；不再提供动作                | 已冻结        | Playwright 已通过 |
| 8   | `debug-shell-fallback`    | debug shell 回退             | `2101` | `Phase 4 local scenario fixture: debug-shell copy of take-three-linked-gems`                    | `fnv1a-32b1c890`        | `shell=debug` 继续渲染 legacy `MatchView`；仍可完成 deterministic 路径 | 已冻结        | Playwright 已通过 |

### Gate 2 Acceptance Commands

每条路径都继续保留冻结的 authoritative command stream，并在 `apps/web/app/play/local/scenarios.ts` 中作为 `acceptanceCommands` 记录。Gate 2 的目的不是让 UI 直接执行这些命令，而是：

- 先证明每条 scenario 起点 deterministic；
- 先证明每条路径的期望 hash 已可由 authoritative command stream 重放得到；
- 为 Gate 4 的 Playwright 交互脚本提供不可漂移的 `finalStateHash` 基线。

### Gate 4 Closure Evidence

截至 2026-04-18，Phase 4 的 Gate 4 已满足以下条件：

- 8 条路径全部从 bootstrap coverage 升级为玩家交互自动化；
- 每条路径都断言真实 UI affordance 可见、可用且唯一；
- 每条路径都断言完成后的 `finalStateHash` 与本矩阵冻结值一致；
- `/play/local` 默认入口使用 product-facing `BoardScene`；
- `/play/local?shell=debug` 继续保留 legacy shell；
- `pnpm check-phase4` 现默认执行整个 `apps/web/tests/phase4/` 目录，而不是仅跑 bootstrap spec。

### Validation Evidence

- Scenario bootstrap tests：`apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- Player-path interaction tests：`apps/web/tests/phase4/local-player-paths.spec.ts`
- Automation entrypoint：`tools/check-phase4.mjs`
- Repo command：`pnpm check-phase4`
- 当前通过标准：
    - 8 条 scenario route 均可 deterministic bootstrap；
    - 8 条玩家路径均可通过真实 UI 交互完成；
    - 每条路径完成后的 `current-final-state-hash` 与冻结值一致；
    - debug fallback 与 terminal read-only 分支仍可区分。

## EN

### Document Role

This document freezes and records the 8 classic-local player paths that had to be automated before Phase 4 `/play/local` could close. Every row is bound to the same authoritative triad:

- `seed`
- `starting snapshot / fixture source`
- `expected finalStateHash`

This matrix started as the formal Gate 2 preflight artifact. As of 2026-04-18, Gate 4 is now closed and all 8 rows are automated by `apps/web/tests/phase4/local-player-paths.spec.ts`. The document remains the authoritative index for the frozen triads and for Phase 4 completion evidence.

### Scope and Constraints

- This matrix covers the **classic local** default entry only. `/play/ai`, `/play/run`, and `/rooms/[roomId]` are excluded.
- The authoritative source remains the frozen scenario definition set in `apps/web/app/play/local/scenarios.ts`.
- Gate 2 `check-phase4` first validated that every row could bootstrap deterministically into the right starting state. Gate 4 has now upgraded that into full player-path interaction closure.
- If later implementation exposes a real contract/schema gap, the work must stop and return to Phase 2 governance instead of adding page-local inference.

### Current Landed Surface

- default classic-local route: `/play/local`
- debug fallback: `/play/local?shell=debug`
- deterministic scenario bootstrap: `/play/local?scenario=<row-id>`
- default renderer: product-facing `BoardScene`
- repo-level automation entrypoint: `pnpm check-phase4`
- current automation surface:
    - `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
    - `apps/web/tests/phase4/local-player-paths.spec.ts`
    - `tools/check-phase4.mjs`
- current bootstrap assertions:
    - `phase4-scenario-id`
    - `phase4-expected-hash`
    - visible fixture-source copy
    - terminal scenario exposes the read-only no-actions state
    - the debug fallback exposes `phase4-shell-mode`
- current interaction assertions:
    - all 8 rows complete through real UI affordances;
    - every row asserts the frozen `current-final-state-hash`;
    - `/play/local` defaults to `BoardScene`;
    - `/play/local?shell=debug` still preserves the legacy `MatchView` fallback.

### Acceptance Matrix

| Row | Scenario ID               | Player Path                               | Seed   | Starting snapshot / fixture source                                                              | Expected finalStateHash | Expected UI assertions                                                                                   | Gate 2 status | Gate 4 automation    |
| --- | ------------------------- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------- | -------------------- |
| 1   | `take-three-linked-gems`  | first turn takes 3 linked gems            | `2101` | `Phase 4 local scenario fixture: classic local gem-selection start`                             | `fnv1a-32b1c890`        | board clicks stage 3 linked cells; `selectionDraft` tracks them; confirm becomes available               | Frozen        | Passed in Playwright |
| 2   | `buy-first-pyramid-card`  | buy the first pyramid card                | `2102` | `Phase 4 local scenario fixture: buying-phase zero-cost pyramid slot`                           | `fnv1a-b9ab87ac`        | the level-1 slot-1 primary affordance buys; market state advances afterward                              | Frozen        | Passed in Playwright |
| 3   | `use-privilege-two-cells` | use privilege on 2 cells                  | `2103` | `Phase 4 local scenario fixture: privilege phase with one privilege available`                  | `fnv1a-7399f1e6`        | two board clicks create the privilege draft; confirm completes it                                        | Frozen        | Passed in Playwright |
| 4   | `reserve-blind-tier3`     | reserve a blind tier-3 card and take gold | `2104` | `Phase 4 local scenario fixture: reserving phase with a unique gold cell and live level-3 deck` | `fnv1a-7944f696`        | an explicit reserve affordance targets the blind level-3 deck; gold is consumed from the only legal cell | Frozen        | Passed in Playwright |
| 5   | `resolve-bonus-token`     | resolve the take-bonus-token prompt       | `2105` | `Phase 4 local scenario fixture: running take_board_token effect prompt`                        | `fnv1a-8a7ecb89`        | the prompt banner exposes the effect; highlighted cells resolve and clear it                             | Frozen        | Passed in Playwright |
| 6   | `resolve-gain-royal`      | resolve the gain-royal prompt             | `2106` | `Phase 4 local scenario fixture: running gain_royal effect prompt`                              | `fnv1a-7abbfb1c`        | the royal court exposes only legal offers; clicking one resolves the reward                              | Frozen        | Passed in Playwright |
| 7   | `terminal-victory`        | terminal victory overlay                  | `2107` | `Phase 4 local scenario fixture: completed classic-local terminal snapshot`                     | `fnv1a-ffa5d769`        | the completed local match exposes a terminal state; no more actions are available                        | Frozen        | Passed in Playwright |
| 8   | `debug-shell-fallback`    | debug shell fallback                      | `2101` | `Phase 4 local scenario fixture: debug-shell copy of take-three-linked-gems`                    | `fnv1a-32b1c890`        | `shell=debug` keeps rendering the legacy `MatchView`; the deterministic path still exists                | Frozen        | Passed in Playwright |

### Gate 2 Acceptance Commands

Every row continues to preserve its frozen authoritative command stream as `acceptanceCommands` inside `apps/web/app/play/local/scenarios.ts`. Gate 2 did not require the UI to execute those commands directly. Instead it existed to:

- prove that every scenario start is deterministic;
- prove that each expected hash can already be reproduced from the authoritative command stream;
- give Gate 4 Playwright interaction scripts a non-drifting `finalStateHash` baseline.

### Gate 4 Closure Evidence

As of 2026-04-18, Gate 4 is now closed with the following evidence:

- all 8 rows were upgraded from bootstrap coverage to player-driven interaction automation;
- every row asserts that the expected affordance is visible, usable, and unique;
- every row asserts that the resulting `finalStateHash` matches the frozen value in this matrix;
- `/play/local` now uses the product-facing `BoardScene` by default;
- `/play/local?shell=debug` still preserves the legacy shell;
- `pnpm check-phase4` now runs the full `apps/web/tests/phase4/` directory rather than only the bootstrap spec.

### Validation Evidence

- scenario bootstrap tests: `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- player-path interaction tests: `apps/web/tests/phase4/local-player-paths.spec.ts`
- automation entrypoint: `tools/check-phase4.mjs`
- repo command: `pnpm check-phase4`
- current pass conditions:
    - all 8 scenario routes bootstrap deterministically;
    - all 8 player paths complete through real UI interaction;
    - every completed path matches the frozen `current-final-state-hash`;
    - the debug fallback and the terminal read-only branch remain distinguishable.
