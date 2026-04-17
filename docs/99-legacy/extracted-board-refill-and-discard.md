# Legacy Extract: board-refill-and-discard

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/initialState.ts`, `old/legacy-vite-electron/src/logic/turnManager.ts`, `old/legacy-vite-electron/src/logic/actions/boardActions.ts`, `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.test.ts`, and `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.edge.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/initialState.ts`、`old/legacy-vite-electron/src/logic/turnManager.ts`、`old/legacy-vite-electron/src/logic/actions/boardActions.ts`、`old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.test.ts` 与 `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.edge.test.ts`。

## Rule Summary / 规则摘要

The legacy board-refill flow was an optional action that restored empty board cells in spiral order from the bag. It could still carry side effects even when no cells needed to be filled, because the old rule set used refill as a strategic tempo action and sometimes rewarded the opponent with a privilege. If a refill-triggered buff was active, the same action could also grant the acting player an extra gem or a steal-like effect.
旧版补板流程是一个可选动作，会按螺旋顺序从袋中补回空格。即使没有空格需要补，它仍然可能带有副作用，因为旧规则把补板当成一种节奏型动作，有时还会因此给对手发特权。如果相关的补板 buff 处于激活状态，同一个动作还可能给行动方额外宝石或类似偷取的效果。

Discard handling was a separate cleanup path that only became visible after turn-finalization logic detected an over-cap inventory. The player discarded one gem at a time back into the bag, and only when the total dropped to or below the cap did the turn actually advance. This meant board refill could happen without ending the turn, while discard was the gate that completed cleanup.
弃置流程是独立的清理路径，只有在回合结算逻辑发现库存超上限后才会出现。玩家一次丢一颗宝石回袋，直到总数降回上限以内，回合才真正推进。也就是说，补板可以发生但不会直接结束回合，而弃置才是完成清理的门槛。

## Edge Cases / 边界情况

The legacy code treated refill and discard differently with respect to turn advancement. Refill did not have to switch the turn, and a board that was already full could still produce privilege or buff side effects without moving any gems. Discard, by contrast, could leave the game in a still-active cleanup state if the player remained over cap after one discard. The old tests also show that the turn must not advance until the inventory is legal again.
旧代码对“补板”和“弃置”的回合推进处理并不相同。补板不一定会换手，棋盘即使已经满了，也仍可能触发特权或 buff 副作用而不会移动任何宝石。相比之下，弃置后如果玩家仍然超上限，游戏会继续停留在清理态。旧测试还表明，只有库存恢复合法后回合才允许前进。

## Replay / Scenario Parity Target

Preserve replay parity for a refill on a partially occupied board, a refill on an already full board, and a discard sequence that takes the player from over-cap back to legal inventory. The deterministic target is that the same bag order and spiral order always refill the same cells, and the same discard sequence always produces the same final inventory, bag contents, and next-player handoff.
需要保持回放一致性的场景包括：在部分占用棋盘上的补板、在已满棋盘上的补板，以及把玩家从超上限恢复到合法库存的弃置序列。确定性目标是：相同的袋子顺序和螺旋顺序总是补到相同格子，相同的弃置顺序总是得到相同的最终库存、袋内内容和下一位玩家交接结果。

## Clean-Room Rebuild Notes / 重建提示

The clean-room version should keep refill and discard as separate engine-visible steps so replay hashes can distinguish optional side effects from mandatory cleanup. Avoid coupling refill to UI timing; make it a deterministic transition that can be driven from the shared engine.
干净重建时，应把补板和弃置保留为两个独立、且引擎可见的步骤，这样回放哈希才能区分“可选副作用”和“强制清理”。不要把补板和 UI 时机绑死；它应当是一个可由共享引擎驱动的确定性转换。
