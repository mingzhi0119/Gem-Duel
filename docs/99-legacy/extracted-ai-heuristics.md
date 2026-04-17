# Legacy Extract: ai-heuristics

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/ai/aiPlayer.ts`, `old/legacy-vite-electron/src/hooks/useAIController.ts`, `old/legacy-vite-electron/src/hooks/useGameLogic.ts`, and `old/legacy-vite-electron/src/logic/__tests__/monkeyTest.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/ai/aiPlayer.ts`、`old/legacy-vite-electron/src/hooks/useAIController.ts`、`old/legacy-vite-electron/src/hooks/useGameLogic.ts` 与 `old/legacy-vite-electron/src/logic/__tests__/monkeyTest.test.ts`。

## Rule Summary / 规则摘要

The legacy AI was a deterministic-looking priority stack wrapped in a timer-driven hook. It always resolved forced sub-phases first, preferred buying affordable high-value cards, replenished only when the board was extremely empty, then looked for long gem lines, and finally reserved higher-level cards when no better action existed.
旧版 AI 本质上是一个包在定时器 hook 里的优先级决策栈。它总是先处理强制子阶段，再优先购买可负担且价值更高的卡牌；只有当棋盘非常空时才会主动补板；之后尝试寻找更长的取宝石直线；若都不理想，才会转去预订更高等级卡牌。

The old implementation mixed heuristics with hidden random fallbacks, direct phase checks, and UI timing. That behavior is useful as intent reference, but it is not a clean fit for the rebuilt deterministic application boundary.
旧实现里还混入了带随机兜底的启发式、直接 phase 判断和 UI 定时节奏。这些行为适合作为“策略意图”参考，但并不适合直接搬进新架构的确定性应用层边界。

## Edge Cases / 边界情况

The legacy AI handled royal selection, discard, steal, bonus gem, and joker-color selection as special-case branches before it ever considered normal turn actions. It also tried to avoid discard by preferring gem lines that fit within the current gem cap.
旧版 AI 会在进入正常回合动作前，先专门处理王室选择、弃牌、偷取、奖励宝石和 Joker 颜色选择等分支。它还会尝试通过优先选择“不会爆手牌上限”的取宝石路径来规避后续弃牌。

Because the implementation used hidden randomness for some draft and refill follow-ups, exact action parity is not a good rebuild target. The stable target is deterministic ranking over currently legal actions.
由于旧实现会在 draft 和部分补板后续动作里使用隐藏随机，精确动作逐条复刻并不是好目标。更可靠的重建目标应该是：对当前合法动作进行确定性的候选排序。

## Replay / Scenario Parity Target

Preserve parity at the intent level rather than the literal action sequence: forced-effect handling first, affordable-buy preference over low-value reserve, discard-avoidance when multiple legal gem actions exist, and deterministic tie-breaking for equal candidates.
回放层面的目标应放在“策略意图”而不是“逐条动作完全一致”：先处理强制效果、可买牌优先于低价值预订、多条合法取宝石动作并存时优先避开弃牌，以及对同分候选做确定性的平局打破。

## Clean-Room Rebuild Notes / 重建提示

The rebuilt AI should score only currently legal `availableActions`, keep all ranking deterministic, and expose the candidate list plus chosen action as dev-only trace output. Do not copy the old timer hook or the old random fallbacks into the new application layer.
重建后的 AI 应只对当前合法的 `availableActions` 打分，保持所有排序完全确定性，并把候选列表与最终选择以 dev-only trace 输出出来。不要把旧版的定时器 hook 或随机兜底搬进新的 application layer。
