# Phase 4 Player Path Acceptance Matrix

## ZH

### 文档定位

本文冻结 Phase 4 `/play/local` 关闭前必须自动化覆盖的 8 条 classic-local 玩家路径。每一条路径都绑定同一组三元组：

- `seed`
- `starting snapshot / fixture source`
- `expected finalStateHash`

本矩阵是 Gate 2 preflight 的正式产物，不等于 Phase 4 已完成。当前它先冻结 deterministic scenario harness、scenario route 与 `check-phase4` automation entrypoint，真正的 product-board 交互自动化在 Gate 4 关闭。

### 范围与约束

- 只覆盖 **classic local** 默认入口；不把 `/play/ai`、`/play/run`、`/rooms/[roomId]` 纳入本矩阵。
- 现阶段 authoritative source 是 `apps/web/app/play/local/scenarios.ts` 中冻结的 scenario definitions。
- Gate 2 的 `check-phase4` 先验证“每条路径都能 deterministic bootstrap 到正确起点”；Gate 4 再升级为完整玩家交互闭环。
- 若后续实现发现 contract / schema 缺口，不得在页面层补推导，必须暂停并回到 Phase 2 governance。

### 当前已落地的 preflight surface

- 默认 classic-local 路由：`/play/local`
- debug fallback：`/play/local?shell=debug`
- deterministic scenario bootstrap：`/play/local?scenario=<row-id>`
- repo-level automation entrypoint：`pnpm check-phase4`
- 当前 bootstrap assertions：
    - `phase4-scenario-id`
    - `phase4-expected-hash`
    - fixture source 文案可见
    - legacy shell 仍可渲染 `Available Actions`
    - terminal scenario 暴露无动作只读态
    - debug fallback 暴露 `phase4-shell-mode`

### Acceptance Matrix

| Row | Scenario ID               | Player Path                  | Seed   | Starting snapshot / fixture source                                                              | Expected finalStateHash | Expected UI assertions                                                 | Gate 2 status | Gate 4 target                                                         |
| --- | ------------------------- | ---------------------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| 1   | `take-three-linked-gems`  | 首回合取 3 枚连线宝石        | `2101` | `Phase 4 local scenario fixture: classic local gem-selection start`                             | `fnv1a-32b1c890`        | 棋盘点选 3 个连线格；`selectionDraft` 记录选择；暴露 confirm           | 已冻结        | BoardScene 默认入口中完成完整点击路径                                 |
| 2   | `buy-first-pyramid-card`  | 购买第一张 pyramid 卡        | `2102` | `Phase 4 local scenario fixture: buying-phase zero-cost pyramid slot`                           | `fnv1a-b9ab87ac`        | 第一层第一槽 primary affordance 直接购买；购买后 market 状态推进       | 已冻结        | BoardScene market slot primary click 购买闭环                         |
| 3   | `use-privilege-two-cells` | 使用 privilege 取 2 格       | `2103` | `Phase 4 local scenario fixture: privilege phase with one privilege available`                  | `fnv1a-7399f1e6`        | 两次 board click 形成 privilege draft；confirm 完成                    | 已冻结        | BoardScene 中的 pending-selection confirm/cancel 闭环                 |
| 4   | `reserve-blind-tier3`     | 保留第三层盲卡并拿 gold      | `2104` | `Phase 4 local scenario fixture: reserving phase with a unique gold cell and live level-3 deck` | `fnv1a-7944f696`        | 明确 reserve affordance 指向 level-3 blind deck；gold 消耗到唯一合法格 | 已冻结        | BoardScene market secondary affordance / reserve chip 闭环            |
| 5   | `resolve-bonus-token`     | 解决 take-bonus-token prompt | `2105` | `Phase 4 local scenario fixture: running take_board_token effect prompt`                        | `fnv1a-8a7ecb89`        | Prompt banner 暴露 effect；高亮格点击后清 prompt                       | 已冻结        | BoardScene prompt + highlighted board action 闭环                     |
| 6   | `resolve-gain-royal`      | 解决 gain-royal prompt       | `2106` | `Phase 4 local scenario fixture: running gain_royal effect prompt`                              | `fnv1a-7abbfb1c`        | Royal court 仅暴露合法 royal offers；点击后完成奖励                    | 已冻结        | BoardScene royal-offer click 闭环                                     |
| 7   | `terminal-victory`        | 终局胜利 overlay             | `2107` | `Phase 4 local scenario fixture: completed classic-local terminal snapshot`                     | `fnv1a-ffa5d769`        | completed local match 暴露 terminal state；不再提供动作                | 已冻结        | product-facing `TerminalOverlay` + final hash 断言                    |
| 8   | `debug-shell-fallback`    | debug shell 回退             | `2101` | `Phase 4 local scenario fixture: debug-shell copy of take-three-linked-gems`                    | `fnv1a-32b1c890`        | `shell=debug` 继续渲染 legacy `MatchView`；仍可完成 deterministic 路径 | 已冻结        | `/play/local?shell=debug` 保留 legacy shell，不被 BoardScene 切换破坏 |

### Gate 2 Acceptance Commands

当前每条路径都已经有冻结的 authoritative command stream，并在 `apps/web/app/play/local/scenarios.ts` 中作为 `acceptanceCommands` 保留。Gate 2 的目的不是让 UI 直接执行这些命令，而是：

- 先证明每条 scenario 起点 deterministic；
- 先证明每条路径的期望 hash 已可由 authoritative command stream 重放得到；
- 为 Gate 4 的 Playwright 交互脚本提供不可漂移的 `finalStateHash` 基线。

### Gate 2 Validation Evidence

- Scenario bootstrap tests：`apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- Automation entrypoint：`tools/check-phase4.mjs`
- Repo command：`pnpm check-phase4`
- 当前 bootstrap 通过标准：
    - 8 条 scenario route 均可启动；
    - scenario metadata 与 `expectedFinalStateHash` 可见；
    - debug fallback 与 terminal read-only 状态可区分。

### Gate 4 Closure Requirements

Phase 4 真正关闭前，每一行都必须从 bootstrap 升级为玩家交互自动化，并且至少断言：

- 预期 affordance 可见且唯一；
- 交互链条能够由真实 UI 完成；
- 完成后的 `finalStateHash` 与本矩阵冻结值一致；
- `/play/local` 默认入口使用 product-facing `BoardScene`；
- `/play/local?shell=debug` 继续保留 legacy shell。

## EN

### Document Role

This document freezes the 8 classic-local player paths that must be automated before Phase 4 `/play/local` can close. Every row is bound to the same authoritative triad:

- `seed`
- `starting snapshot / fixture source`
- `expected finalStateHash`

This matrix is the formal Gate 2 preflight artifact. It does not mean Phase 4 is complete yet. At this stage it freezes the deterministic scenario harness, the scenario route, and the `check-phase4` automation entrypoint; product-board interaction automation closes later in Gate 4.

### Scope and Constraints

- This matrix covers the **classic local** default entry only. `/play/ai`, `/play/run`, and `/rooms/[roomId]` are excluded.
- The authoritative source at this stage is the frozen scenario definition set in `apps/web/app/play/local/scenarios.ts`.
- Gate 2 `check-phase4` validates that every row can bootstrap deterministically into the right starting state. Gate 4 upgrades that into full player-path interaction closure.
- If later implementation exposes a real contract/schema gap, the work must stop and return to Phase 2 governance instead of adding page-local inference.

### Landed Preflight Surface

- default classic-local route: `/play/local`
- debug fallback: `/play/local?shell=debug`
- deterministic scenario bootstrap: `/play/local?scenario=<row-id>`
- repo-level automation entrypoint: `pnpm check-phase4`
- current bootstrap assertions:
    - `phase4-scenario-id`
    - `phase4-expected-hash`
    - visible fixture-source copy
    - legacy shell still renders `Available Actions`
    - terminal scenario exposes the no-actions read-only state
    - debug fallback exposes `phase4-shell-mode`

### Acceptance Matrix

| Row | Scenario ID               | Player Path                               | Seed   | Starting snapshot / fixture source                                                              | Expected finalStateHash | Expected UI assertions                                                                                   | Gate 2 status | Gate 4 target                                                                       |
| --- | ------------------------- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------- |
| 1   | `take-three-linked-gems`  | first turn takes 3 linked gems            | `2101` | `Phase 4 local scenario fixture: classic local gem-selection start`                             | `fnv1a-32b1c890`        | board clicks stage 3 linked cells; `selectionDraft` tracks them; confirm becomes available               | Frozen        | complete the path through the default BoardScene                                    |
| 2   | `buy-first-pyramid-card`  | buy the first pyramid card                | `2102` | `Phase 4 local scenario fixture: buying-phase zero-cost pyramid slot`                           | `fnv1a-b9ab87ac`        | the level-1 slot-1 primary affordance buys; market state advances afterward                              | Frozen        | close the purchase path through the BoardScene market primary click                 |
| 3   | `use-privilege-two-cells` | use privilege on 2 cells                  | `2103` | `Phase 4 local scenario fixture: privilege phase with one privilege available`                  | `fnv1a-7399f1e6`        | two board clicks create the privilege draft; confirm completes it                                        | Frozen        | close the pending-selection confirm/cancel path in BoardScene                       |
| 4   | `reserve-blind-tier3`     | reserve a blind tier-3 card and take gold | `2104` | `Phase 4 local scenario fixture: reserving phase with a unique gold cell and live level-3 deck` | `fnv1a-7944f696`        | an explicit reserve affordance targets the blind level-3 deck; gold is consumed from the only legal cell | Frozen        | close the reserve-chip / secondary-affordance path in BoardScene                    |
| 5   | `resolve-bonus-token`     | resolve the take-bonus-token prompt       | `2105` | `Phase 4 local scenario fixture: running take_board_token effect prompt`                        | `fnv1a-8a7ecb89`        | the prompt banner exposes the effect; highlighted cells resolve and clear it                             | Frozen        | close the prompt + highlighted-board path in BoardScene                             |
| 6   | `resolve-gain-royal`      | resolve the gain-royal prompt             | `2106` | `Phase 4 local scenario fixture: running gain_royal effect prompt`                              | `fnv1a-7abbfb1c`        | the royal court exposes only legal offers; clicking one resolves the reward                              | Frozen        | close the royal-offer click path in BoardScene                                      |
| 7   | `terminal-victory`        | terminal victory overlay                  | `2107` | `Phase 4 local scenario fixture: completed classic-local terminal snapshot`                     | `fnv1a-ffa5d769`        | the completed local match exposes a terminal state; no more actions are available                        | Frozen        | assert the product-facing `TerminalOverlay` and final hash                          |
| 8   | `debug-shell-fallback`    | debug shell fallback                      | `2101` | `Phase 4 local scenario fixture: debug-shell copy of take-three-linked-gems`                    | `fnv1a-32b1c890`        | `shell=debug` keeps rendering the legacy `MatchView`; the deterministic path still exists                | Frozen        | keep `/play/local?shell=debug` alive after the default entry switches to BoardScene |

### Gate 2 Acceptance Commands

Every row already has a frozen authoritative command stream preserved as `acceptanceCommands` inside `apps/web/app/play/local/scenarios.ts`. Gate 2 does not require the UI to execute those commands directly. Instead it exists to:

- prove that every scenario start is deterministic;
- prove that each expected hash can already be reproduced from the authoritative command stream;
- give Gate 4 Playwright interaction scripts a non-drifting `finalStateHash` baseline.

### Gate 2 Validation Evidence

- scenario bootstrap tests: `apps/web/tests/phase4/local-scenario-bootstrap.spec.ts`
- automation entrypoint: `tools/check-phase4.mjs`
- repo command: `pnpm check-phase4`
- current bootstrap pass conditions:
    - all 8 scenario routes start successfully;
    - scenario metadata and `expectedFinalStateHash` are visible;
    - the debug fallback and the terminal read-only state are distinguishable.

### Gate 4 Closure Requirements

Before Phase 4 can actually close, every row must be upgraded from bootstrap coverage to player-driven interaction automation and must assert at least:

- the expected affordance is visible and unique;
- the real UI can complete the interaction chain;
- the resulting `finalStateHash` matches the frozen value in this matrix;
- `/play/local` uses the product-facing `BoardScene` by default;
- `/play/local?shell=debug` still preserves the legacy shell.
