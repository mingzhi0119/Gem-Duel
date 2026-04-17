# Legacy Extract: buff-catalog-step07

## Legacy Files Consulted

Consulted legacy sources: `old/legacy-vite-electron/src/constants.ts`, `old/legacy-vite-electron/src/types.ts`, `old/legacy-vite-electron/src/logic/actions/buffActions.ts`, and `old/legacy-vite-electron/src/logic/__tests__/buffs_comprehensive.test.ts`.
已查阅的旧版来源包括：`old/legacy-vite-electron/src/constants.ts`、`old/legacy-vite-electron/src/types.ts`、`old/legacy-vite-electron/src/logic/actions/buffActions.ts` 与 `old/legacy-vite-electron/src/logic/__tests__/buffs_comprehensive.test.ts`。

## Rule Summary / 规则摘要

The legacy catalog contained many buff ideas, but only a subset maps cleanly onto the Step 02.5-frozen hook/effect vocabulary without inventing new atoms, hidden channels, or UI-only actions. The clean Step 07 starter set is:
旧版 Buff 目录里有很多想法，但只有一部分能够在不新增 atom、隐藏通道或 UI-only 动作的前提下，干净映射到 Step 02.5 冻结的 hook/effect vocabulary。适合作为 Step 07 starter set 的是：

- `privilege_favor`
- `deep_pockets`
- `down_payment`
- `extortion`
- `double_agent`

These five cover setup effects, gem-cap modifiers, buy-cost modifiers, after-replenish triggered stealing, and privilege-expansion behavior while still fitting the current effect atoms and deterministic replay model.
这五个 Buff 可以覆盖 setup 效果、手牌上限修正、购卡费用修正、补板后触发偷取，以及特权扩展行为，同时仍然适配当前 effect atoms 与确定性 replay 模型。

## Edge Cases / 边界情况

Many legacy buffs depended on hidden random gem grants, deck peeks, special protected privileges, opponent reserved-card theft, or alternate victory thresholds. Those mechanics are useful future reference, but they would expand Step 07 far beyond the current vertical slice and often need more than the frozen atom set.
很多旧 Buff 依赖隐藏随机赠宝石、牌库窥视、特殊保护特权、偷取对手预订卡，或改写胜利阈值。这些机制适合作为未来参考，但会把 Step 07 明显拉出当前 vertical slice，而且很多都需要超出现有 frozen atom set 的支撑。

## Replay / Scenario Parity Target

Keep parity around the starter set only: privilege-at-setup, gem-cap changes affecting discard timing, reserved-buy discount application, second-replenish steal behavior, and double-privilege selection sequencing.
回放一致性在 Step 07 只需锁定 starter set：setup 发特权、手牌上限影响弃牌时机、预订购卡折扣、第二次补板触发偷取，以及双特权选择的顺序。

## Clean-Room Rebuild Notes / 重建提示

Treat the legacy catalog as a design pool, not as a parity checklist. Step 07 should ship a small starter registry with clear metadata, deterministic instance context, unit tests, and golden replay coverage, then leave the larger catalog for later steps.
把旧目录视为设计池，而不是 parity 清单。Step 07 应交付的是一个小而清晰的 starter registry，具备明确元数据、确定性实例上下文、单元测试和 golden replay 覆盖；更大的 Buff 目录留给后续步骤。
