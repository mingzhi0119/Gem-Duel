# Legacy Extract: buff-draft-and-run-loop

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/actions/buffActions.ts`, `old/legacy-vite-electron/src/logic/gameReducer.ts`, `old/legacy-vite-electron/src/logic/initialState.ts`, `old/legacy-vite-electron/src/logic/__tests__/initializeGame.test.ts`, and `old/legacy-vite-electron/src/logic/__tests__/onlineIntegration.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/actions/buffActions.ts`、`old/legacy-vite-electron/src/logic/gameReducer.ts`、`old/legacy-vite-electron/src/logic/initialState.ts`、`old/legacy-vite-electron/src/logic/__tests__/initializeGame.test.ts` 与 `old/legacy-vite-electron/src/logic/__tests__/onlineIntegration.test.ts`。

## Rule Summary / 规则摘要

The legacy project treated Buff selection as a pre-match draft phase rather than a full roguelike run. A match could begin in `DRAFT_PHASE`, offer a constrained pool of Buff ids, apply buff-specific init effects, and then fall back into the normal match flow.
旧版项目把 Buff 选择建模成“开局 draft phase”，而不是完整的 Roguelike run。对局可以先进入 `DRAFT_PHASE`，提供受限的 Buff 选项池，应用对应的初始化效果，然后再回到正常对局流程。

The rebuilt Step 07 vertical slice therefore should preserve the useful shape of “offer -> choose -> apply serialized Buff state -> enter deterministic match”, while cleanly separating it from the old reducer-phase implementation.
因此，Step 07 的 clean-room vertical slice 更应保留“给出候选 -> 选择 -> 应用可序列化 Buff 状态 -> 进入确定性对局”这一结构，而不是复刻旧 reducer 里的 phase 细节。

## Edge Cases / 边界情况

The legacy setup mixed draft ordering, random init payloads, and direct state mutation. Some buffs injected extra gems, a crown, a privilege, or even a reserved card before the first turn. The old flow also allowed the second player to receive a separate pool.
旧版开局把 draft 顺序、随机初始化载荷和直接状态突变混在一起。有些 Buff 会在首回合前注入额外宝石、皇冠、特权，甚至直接给一张预订卡。旧流程还允许第二位玩家拿到独立的候选池。

That shape is too coupled for the rebuild. The valuable invariant is that Buff acquisition happens outside the normal command loop, remains replay-visible through resulting state/event changes, and must be deterministic from seed plus chosen Buff ids.
这种形态对新架构来说耦合过重。真正值得保留的不变量是：Buff 获取发生在普通命令循环之外，通过结果状态/事件保持 replay 可见，并且必须由 seed 与被选 Buff id 决定，不依赖隐藏 UI 时序。

## Replay / Scenario Parity Target

Preserve parity for the structural milestones: initial offer generation, chosen Buff persistence by id, init-effect application before the first real turn, and deterministic reward-offer regeneration after a win.
需要保持一致性的关键结构点包括：初始候选生成、按 id 持久化所选 Buff、首个真实回合前的初始化效果应用，以及胜利后的确定性奖励候选再生成。

## Clean-Room Rebuild Notes / 重建提示

The Step 07 vertical slice can safely normalize the legacy draft into a simpler run loop: one initial draft choice, deterministic reward offers after wins, and a serialized `RunState` / `MetaState` seam. Do not recreate `DRAFT_PHASE` as a new public match phase.
Step 07 的最小闭环可以安全地把旧 draft 归一化成更简单的 run loop：一次开局选择、胜利后的确定性奖励候选，以及可序列化的 `RunState` / `MetaState` seam。不要把 `DRAFT_PHASE` 作为新的公开 match phase 重新引入。
