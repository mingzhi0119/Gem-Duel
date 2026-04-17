# Legacy Extract: royal-milestones

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/logic/initialState.ts`, `old/legacy-vite-electron/src/logic/turnManager.ts`, `old/legacy-vite-electron/src/logic/actions/royalActions.ts`, and `old/legacy-vite-electron/src/logic/selectors.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/logic/initialState.ts`、`old/legacy-vite-electron/src/logic/turnManager.ts`、`old/legacy-vite-electron/src/logic/actions/royalActions.ts` 与 `old/legacy-vite-electron/src/logic/selectors.ts`。

## Rule Summary / 规则摘要

The legacy royal-milestone rule fired when a player reached the crown thresholds of 3 or 6. Hitting a milestone forced a royal selection from the shared royal deck, recorded that the milestone had been claimed, and stored the next player so turn flow could return correctly after the royal pick resolved. Royal cards then joined the player’s royal collection and could contribute points, crowns, and abilities.
旧版王室里程碑规则会在玩家达到 3 枚或 6 枚皇冠阈值时触发。命中里程碑后，玩家必须从共享王室牌库里挑选一张皇家卡，同时记录该里程碑已经被领取，并保存下一位玩家，确保王室选择结束后能够正确恢复回合流转。随后皇家卡会进入玩家的皇家收藏，并继续贡献分数、皇冠与能力。

The same flow also supported a separate Royal Envoy style trigger in which a buff could force royal selection after a specific turn count. That path reused the same selection surface, which means the milestone system and the envoy-style system were different triggers that converged on one royal-resolution behavior.
同一流程里还存在一个独立的 Royal Envoy 触发方式，某些 buff 会在特定回合数后强制进入王室选择。这个路径复用了同一套选择界面，因此里程碑系统和 envoy 风格系统虽然触发方式不同，但最终都会汇入同一个王室结算行为。

## Edge Cases / 边界情况

The old implementation preferred the higher milestone when both 3 and 6 could apply, and it would not fire a selection if the royal deck was empty. Royal selection was also allowed to chain into again, bonus gem, steal, or scroll abilities, which means the milestone itself was not the end of the decision tree. The next-player handoff mattered because the royal pick could still yield an extra turn.
旧实现里，如果 3 和 6 同时都能命中，会优先处理更高的里程碑；如果皇家牌库为空，则不会触发选择。王室选择还可以继续串联再行动、额外宝石、偷取或特权能力，因此里程碑本身并不是决策树的终点。下一位玩家的交接也很重要，因为皇家卡仍可能带来额外回合。

## Replay / Scenario Parity Target

Preserve replay parity for reaching 3 crowns, reaching 6 crowns, and the envoy-style forced royal selection path. The same crown totals, deck order, and stored next-player value should always lead to the same forced royal choice, the same milestone flags, and the same post-royal turn restoration.
需要保持回放一致性的场景包括：达到 3 皇冠、达到 6 皇冠，以及 envoy 风格的强制王室选择路径。同样的皇冠总数、牌库顺序和已保存的下一位玩家值，必须总是导向相同的强制皇家选择、相同的里程碑标记和相同的王室后回合恢复结果。

## Clean-Room Rebuild Notes / 重建提示

The rebuilt system should model milestone triggers as replay-visible engine events rather than hidden turn-manager side effects. Keep royal selection deterministic and data-driven so that milestone entry, resolution, and return-to-turn all remain hash-stable.
重建后的系统应把里程碑触发建模为回放可见的引擎事件，而不是隐藏在 turn-manager 里的副作用。要让王室选择保持确定性和数据驱动，这样里程碑进入、结算与回到回合的过程才能稳定地产生相同哈希。
