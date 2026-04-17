# Legacy Extract: scoring-and-win-conditions

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/turnManager.ts`, `old/legacy-vite-electron/src/logic/selectors.ts`, `old/legacy-vite-electron/src/logic/actions/marketActions.ts`, `old/legacy-vite-electron/src/logic/__tests__/turnManager.test.ts`, and `old/legacy-vite-electron/src/logic/__tests__/fullOnlineScenario.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/turnManager.ts`、`old/legacy-vite-electron/src/logic/selectors.ts`、`old/legacy-vite-electron/src/logic/actions/marketActions.ts`、`old/legacy-vite-electron/src/logic/__tests__/turnManager.test.ts` 与 `old/legacy-vite-electron/src/logic/__tests__/fullOnlineScenario.test.ts`。

## Rule Summary / 规则摘要

Legacy scoring combined tableau points, royal-card points, extra point adjustments, and buff-based point bonuses. Crown totals came from tableau plus royal cards plus any extra crown adjustments. Win conditions were checked at turn finalization, and the first player to satisfy points, crowns, or single-color dominance was declared the winner.
旧版计分会把 tableau 分数、皇家卡分数、额外分数修正以及基于 buff 的分数加成合并起来。皇冠总数则来自 tableau、皇家卡和任何额外皇冠修正。胜利条件会在回合结算时检查，只要有玩家先满足分数、皇冠或单色优势条件，就会直接判定为赢家。

Single-color victory counted points by bonus color in the tableau and ignored virtual or buff cards that should not count toward that threshold. The default goals were 20 points, 10 crowns, and 10 single-color points, but buffs could raise or suppress those thresholds. Market purchase code also tried to detect imminent wins before final color selection so it could auto-pick a favorable color and finish the transaction cleanly.
单色胜利只统计 tableau 中按 bonus color 归类的分数，不把不该计入阈值的虚拟卡或 buff 卡算进去。默认目标分别是 20 分、10 皇冠和 10 单色点数，但 buff 可以抬高或关闭这些阈值。市场购买代码还会在最终颜色选择前尝试检测即将发生的胜利，这样就能自动挑一个有利颜色并顺利完成交易。

## Edge Cases / 边界情况

The legacy logic checked the acting player first and only then the opponent, so the current turn could win before the turn handed off. Very large point values were expected to remain safe, and buff point bonuses were applied per card rather than per raw score. The 6-crown milestone and a direct win could overlap conceptually, but the win check still had to remain deterministic about which outcome closed the turn first.
旧版逻辑会先检查行动方，再检查对手，所以当前回合的玩家可以在换手前先获胜。很大的分数值也应当保持安全，而 buff 的分数加成是按卡牌数量计算，而不是按原始分数计算。6 皇冠里程碑和直接胜利在概念上可能重叠，但胜利检查仍必须确定性地决定谁先关闭回合。

## Replay / Scenario Parity Target

Preserve replay parity for the three victory paths separately: points, crowns, and single-color dominance. The same card order, buff state, and crown state should always produce the same winner, and the same near-win market purchase should always choose the same auto-selected color before the transaction resolves.
需要保持回放一致性的场景应分别覆盖三条胜利路径：分数、皇冠和单色优势。同样的卡牌顺序、buff 状态和皇冠状态，必须总是产生相同的赢家；同样的临界胜利市场购买，也必须在交易结算前总是自动选出同一个颜色。

## Clean-Room Rebuild Notes / 重建提示

The rebuild should centralize score and win evaluation in deterministic selectors so replay verification can compare a single authoritative result. Keep the win reason explicit in the engine output instead of inferring it from UI behavior or from a later state diff.
重建时应把计分与胜利判定集中到确定性的 selector 中，这样回放验证才能比较单一、权威的结果。胜利原因也要在引擎输出里显式给出，而不是靠 UI 行为或事后状态 diff 去倒推。
