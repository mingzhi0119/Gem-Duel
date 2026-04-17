# Legacy Extract: privilege-scrolls

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/initialState.ts`, `old/legacy-vite-electron/src/logic/actions/privilegeActions.ts`, `old/legacy-vite-electron/src/logic/actions/boardActions.ts`, `old/legacy-vite-electron/src/logic/actions/royalActions.ts`, `old/legacy-vite-electron/src/logic/actions/marketActions.ts`, and `old/legacy-vite-electron/src/logic/interactionManager.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/initialState.ts`、`old/legacy-vite-electron/src/logic/actions/privilegeActions.ts`、`old/legacy-vite-electron/src/logic/actions/boardActions.ts`、`old/legacy-vite-electron/src/logic/actions/royalActions.ts`、`old/legacy-vite-electron/src/logic/actions/marketActions.ts` 与 `old/legacy-vite-electron/src/logic/interactionManager.ts`。

## Rule Summary / 规则摘要

Legacy privilege scrolls represented a board-gain action that could be activated, used, and cancelled as its own mini-phase. Using privilege let the player take a non-gold gem from the board, and a buff could expand that into a two-gem selection. The system tracked a shared privilege cap, so gaining or transferring privilege had to respect the limit across both players.
旧版特权卷轴表示一种独立的小阶段动作，可以被激活、使用和取消。使用特权会让玩家从棋盘上拿走一颗非金色宝石，而某些 buff 还能把它扩展成两颗宝石的选择。系统维护一个共享的特权上限，所以无论发放还是转移特权，都必须遵守双方合计的限制。

The same privilege transfer pattern also appeared in board-taking, royal-card rewards, and market-card rewards. In each case the rules tried to spend an existing privilege before creating a new one if the shared cap was already full, so the economy stayed bounded and predictable.
同样的特权转移模式也出现在取板、皇家卡奖励和市场卡奖励里。每次规则都会尽量先消耗既有特权，再在共享上限已满时转移，而不是无条件新增，这样特权经济才能保持有界且可预测。

## Edge Cases / 边界情况

Gold and empty cells were never legal targets for privilege use. The Double Agent style buff required careful sequencing: the first gem consumed the privilege, the second gem was only allowed if a valid second target still existed, and the action had to reset cleanly once the second pick was complete or impossible. Cancelling privilege mode also had to clear the temporary counter so the next attempt started fresh.
金色格和空格从来不是特权的合法目标。Double Agent 风格的 buff 需要特别注意顺序：第一颗宝石会消耗特权，第二颗宝石只有在仍然存在合法目标时才允许继续，而一旦第二次选择完成或不再可能，动作就必须干净地重置。取消特权模式时也必须清空临时计数器，这样下一次尝试才能从零开始。

## Replay / Scenario Parity Target

Preserve replay parity for activating privilege mode, taking one gem, taking two gems under the Double Agent style buff, cancelling the mode, and receiving privilege transfers from board, royal, or market effects. The same board layout and privilege inventory should always yield the same target choice and the same cap-handling outcome.
需要保持回放一致性的场景包括：激活特权模式、拿一颗宝石、在 Double Agent 风格 buff 下拿两颗宝石、取消模式，以及从取板、王室或市场效果中收到特权转移。同样的棋盘布局和特权库存，必须总是导向相同的目标选择和相同的上限处理结果。

## Clean-Room Rebuild Notes / 重建提示

The clean-room model should treat privilege as a first-class optional effect rather than a side effect hidden inside gem-taking code. Keep the shared cap and transfer behavior in contracts and engine events so replay and authority boundaries remain explicit.
干净重建时，应把特权视为一级可选效果，而不是藏在取宝石代码里的副作用。共享上限和转移行为都应体现在契约与引擎事件中，这样回放与权威边界才会保持清晰。
