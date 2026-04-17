# Legacy Extract: market-buy-reserve

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/initialState.ts`, `old/legacy-vite-electron/src/logic/actions/marketActions.ts`, `old/legacy-vite-electron/src/logic/selectors.ts`, `old/legacy-vite-electron/src/utils.ts`, and `old/legacy-vite-electron/src/logic/interactionManager.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/initialState.ts`、`old/legacy-vite-electron/src/logic/actions/marketActions.ts`、`old/legacy-vite-electron/src/logic/selectors.ts`、`old/legacy-vite-electron/src/utils.ts` 与 `old/legacy-vite-electron/src/logic/interactionManager.ts`。

## Rule Summary / 规则摘要

The legacy market flow covered both reservation and purchase. Reserving a face-up market card or a blind deck card could optionally take the gold gem on the board, but the player could only hold up to three reserved cards. Reserving also had buff hooks for extra gold or a bonus gem, while reserve-from-deck and reserve-from-market followed the same overall limit and gold pickup rules.
旧版市场流程同时覆盖预订与购买。预订一张明牌市场卡或一张盲抽牌库卡时，可以顺手拿走棋盘上的金色宝石，但玩家最多只能持有三张预订卡。预订动作还会挂接 buff：例如额外金币或额外宝石；无论从市场预订还是从牌库预订，整体上都遵循同样的上限和金色宝石领取规则。

Buying a card paid with basic gems plus gold as wild currency, applied tableau discounts, and then pushed the card into the player tableau. Market buys refilled the empty market slot from the deck, while reserve buys removed the reserved card from hand. Purchases could also chain several legacy abilities, including repeat turn, steal, bonus gem pickup, and privilege transfer.
购买卡牌时会用基础宝石加上金色通配完成支付，同时应用棋盘上的折扣，然后把卡牌放入玩家的 tableau。市场购买会从对应牌库补回空位，而预订购买则会把预订手牌里的那张卡移除。购买后还能串联多种旧版能力，包括再行动、偷取、额外宝石拾取，以及特权转移。

## Edge Cases / 边界情况

The old code enforced a hard reserve limit of three cards, and a failed reserve should leave the state unchanged apart from feedback. Level-three market handling had special removal rules for extra cards near the bottom of the deck, so the exact deck position mattered. Buying a reserved card also had its own buff hooks, including a reserved-card recycle bonus and a crown-triggered gem bonus.
旧代码对预订数量设有三张硬上限，预订失败时除了反馈外不应改变状态。三级市场对牌库底部额外卡牌有特殊移除规则，因此具体牌库位置很重要。购买预订卡也有自己的 buff 挂钩，包括预订卡回收加成和由皇冠触发的额外宝石奖励。

## Replay / Scenario Parity Target

Preserve replay parity for these scenarios: reserve from market with gold pickup, reserve from deck with gold pickup, buy from market with refill, buy from reserve with removal from hand, and a chained purchase that leads into again/steal/bonus gem/privilege resolution. The same seed and action order should always produce the same market refill, reserve contents, and post-buy effect sequence.
需要保持回放一致性的场景包括：带金色宝石领取的市场预订、带金色宝石领取的牌库预订、带补位的市场购买、把预订手牌移除的预订购买，以及会继续触发再行动/偷取/额外宝石/特权结算的连锁购买。同样的种子与动作顺序必须总是得到相同的市场补位、预订内容和购后效果序列。

## Clean-Room Rebuild Notes / 重建提示

The new implementation should separate reserve source, purchase source, and chained ability resolution so replay logs stay readable and deterministic. Do not preserve the legacy habit of folding instant-win logic and card selection heuristics into UI-layer purchase code; keep those decisions in the shared engine and contracts.
新实现应把预订来源、购买来源和链式能力结算分开，这样回放日志才会保持清晰且确定。不要保留旧版把即时胜利逻辑和卡牌选择启发式塞进 UI 层购买代码的做法；这些决策应留在共享引擎与契约里处理。
