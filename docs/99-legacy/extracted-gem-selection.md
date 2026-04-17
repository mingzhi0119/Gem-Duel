# Legacy Extract: gem-selection

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/validators.ts`, `old/legacy-vite-electron/src/logic/interactionManager.ts`, `old/legacy-vite-electron/src/logic/actions/boardActions.ts`, `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.test.ts`, and `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.edge.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/validators.ts`、`old/legacy-vite-electron/src/logic/interactionManager.ts`、`old/legacy-vite-electron/src/logic/actions/boardActions.ts`、`old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.test.ts` 与 `old/legacy-vite-electron/src/logic/actions/__tests__/boardActions.edge.test.ts`。

## Rule Summary / 规则摘要

The legacy gem-selection flow treated board clicks as a shape-validation problem before they became a turn action. A legal selection had to stay on one straight line, could include at most three gems, and the three-gem case had to be contiguous without gaps. Gold and empty cells were never selectable. Once a valid set was confirmed, the player gained the selected gems, the board cells became empty, and the turn finalized immediately.
旧版的选宝石流程本质上先做形状校验，再把结果转成回合动作。合法选择必须落在一条直线上，最多只能选三颗，而且三颗时必须连续不能有空隙。金色格和空格从来不能被选。确认合法组合后，玩家获得这些宝石、对应格子变为空位，然后回合会立刻结算。

Privilege side effects were part of the same resolution. Taking two or more gems of the same basic color, or taking two or more pearls, granted the opponent one privilege if the shared cap had room; otherwise the acting player could spend one of their own privileges to pass one along. This meant gem-taking was never just inventory movement; it also influenced the shared privilege economy.
特权副作用也属于同一次结算的一部分。若一次拿走两颗及以上同色基础宝石，或两颗及以上珍珠，就会在共享上限允许时给对手一张特权；如果已经到达共享上限，行动方就需要消耗自己的一张特权再传给对手。也就是说，拿宝石不只是库存变化，还会影响双方共享的特权池。

## Edge Cases / 边界情况

The UI allowed an intermediate two-gem gap selection state, but confirmation was still blocked until the line became contiguous. Duplicate coordinates were invalid, non-linear shapes were invalid, and any attempt to include gold or empty cells failed early. The old tests also show that a valid selection could still push the player into discard handling later if the inventory cap was exceeded after turn resolution.
UI 曾允许一种“中间态”的两颗宝石带空隙选择，但在真正确认前仍然会被拦住，直到它变成连续直线。重复坐标无效，非直线无效，包含金色格或空格的尝试会更早失败。旧测试还说明：即使选择本身合法，回合结算后如果库存超上限，玩家仍可能进入后续弃置流程。

## Replay / Scenario Parity Target

Preserve replay parity for these scenarios: one-gem take, two-gem line take, three-gem contiguous take, invalid L-shape rejection, gold-cell rejection, and privilege granting when the same-color or pearl thresholds are reached. A deterministic replay should reproduce the same selected cells, the same inventory deltas, and the same privilege transfer outcome from the same board seed and click order.
需要保持回放一致性的场景包括：单颗获取、两颗直线获取、三颗连续获取、L 形非法选择、金色格拒绝，以及命中同色/珍珠阈值后的特权发放。同一棋盘种子与同一点击顺序下，确定性回放必须复现相同的选格结果、库存变化和特权转移结果。

## Clean-Room Rebuild Notes / 重建提示

The rebuild should make line legality a domain rule, not a UI-only assumption, and should route the privilege side effect through replay-visible engine events. Do not carry over the legacy coordinate handling style; model the same behavior with clean state transitions and deterministic guards.
重建时应把直线合法性做成领域规则，而不是只留在 UI 假设里；特权副作用也要通过回放可见的引擎事件来表达。不要继承旧版的坐标处理写法，而要用干净的状态转换和确定性的守卫来重现相同行为。
