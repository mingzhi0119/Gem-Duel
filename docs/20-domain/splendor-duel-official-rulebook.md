# Splendor Duel Official Rulebook Digest

## ZH

本文件基于官方规则页与官方英文规则 PDF 整理，用作领域建模与重构对照笔记，不替代原始规则书。

## 来源

- 官方游戏页：<https://www.spacecowboys-games.com/game/splendor-duel/>
- 官方英文规则 PDF：<https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/11/SCSPL2P01EN_Rules_Planche_BD.pdf>
- 检索日期：2026-04-17

## 组件与开局

- 1 个 Victory tile
- 67 张 Jewel cards，分成 3 个等级牌堆
- 1 个 Bag
- 3 个 Privilege scrolls
- 25 枚 token：5 色宝石各 4、2 枚 Pearl、3 枚 Gold
- 1 块 Board
- 4 张 Royal cards

开局流程按规则书整理如下：

1. 三个 Jewel 牌堆分别洗牌并竖向摆放。
2. 翻开 3 张三级、4 张二级、5 张一级牌，组成金字塔。
3. 将 25 枚 token 随机放入公共棋盘，按中心开始的螺旋路径填充。
4. 将 3 个 Privilege 放在棋盘上方，4 张 Royal 放在棋盘下方。
5. 随机决定先手；后手获得 1 个 Privilege。

## 回合结构

玩家轮流进行回合，直到有人在自己回合结束时满足任一胜利条件。

每回合结构是：

1. 先按顺序执行可选动作：不做、做一个、或两个都做。
2. 然后必须执行 1 个强制动作。
3. 回合结束时若手中 token 总数超过 10，必须弃到 10。
4. 最后检查是否满足胜利条件；若满足，立即获胜。

## 可选动作

### 1. Use a Privilege

- 归还 1 个或多个 Privilege。
- 每归还 1 个，可从棋盘拿 1 枚 Gem 或 Pearl。
- 不能借此拿 Gold。

### 2. Replenish the Game Board

- 仅当袋中仍有 token 时可执行。
- 将袋中 token 混合后按中心开始的螺旋路径补到棋盘空位。
- 执行此动作后，对手获得 1 个 Privilege。
- 若公共区没有可拿的 Privilege，则从对手处拿；若自己已持有全部 3 个，则无事发生。

## 强制动作

### Take up to 3 tokens

- 从棋盘拿最多 3 枚相邻的 Gem/Pearl。
- 必须处于不被空位或 Gold 打断的横线、竖线或对角线。
- 可以拿 1 枚或 2 枚。
- 不能借此拿 Gold。
- 如果一次拿了 3 枚同色 token，或拿了 2 枚 Pearl，则对手获得 1 个 Privilege。

### Take 1 Gold token and reserve 1 Jewel card

- 仅当棋盘上还有 Gold，且自己保留牌少于 3 张时可执行。
- 先拿 1 枚 Gold。
- 然后从金字塔保留 1 张明牌，或者从任一等级牌堆顶盲抽 1 张。
- 保留牌对对手保密。
- 从金字塔保留后，若对应牌堆未空，立刻补牌。
- 这是获得 Gold 的唯一常规方式。

### Purchase 1 Jewel card

- 购买来源可以是金字塔中的明牌或自己的保留牌。
- 按牌面左下角 cost 支付 token。
- Gold 为万能 token，可代替任意 Gem 或 Pearl。
- 已花费 token 回到 bag。
- 购入后立即获得该牌的 bonus、Prestige、Crowns 和 ability。

## 卡牌能力与 Crown / Royal

规则书列出的 Jewel card 能力可整理为以下效果类别：

- 额外回合：当前回合结束后立刻再进行 1 回合。
- 叠放变色：将牌叠放到一张已有 bonus 的 Jewel card 上，使本牌 bonus 视为被覆盖牌的颜色。
- 从棋盘拿与本牌颜色一致的 1 枚 token；若无则忽略。
- 获得 1 个 Privilege；若公共区没有，则从对手处拿。
- 从对手处拿 1 枚 Gem 或 Pearl；不能拿 Gold；若对手没有对应 token 则忽略。

Crown / Royal 规则：

- 获得第 3 个 Crown 时，立刻拿 1 张可用 Royal card 并解析其能力。
- 获得第 6 个 Crown 时，再拿 1 张可用 Royal card 并解析其能力。
- 拿 Royal card 不算作一个 action。

## 胜利条件

在自己回合结束时满足以下任一条件即可立即获胜：

1. Prestige 至少 20。
2. Crowns 至少 10。
3. 同色牌上的 Prestige 至少 10。

## 适用于重构的领域建模结论

- 回合不是单一平铺 phase，而是“可选动作 -> 强制动作 -> 回合结束结算 -> 胜利检查”的结构。
- Replenish Board 需要显式建模为会给对手发放 Privilege 的行为。
- Gold 只能通过保留动作取得，并且是唯一通用万能 token。
- 保留牌存在私有信息边界，因此服务端与客户端快照必须区分权威态和玩家态。
- 购卡能力、Royal 解析、额外回合会形成连锁，因此 effect actor / emitted event 模型比简单 phase 切换更贴近官方规则。
- “3 同色 token / 2 Pearl 让对手拿 Privilege” 是 token 选择动作里的特殊分支，不能只按数量建模。

## EN

This document is a rebuild-facing digest of the official game page and the official English rulebook PDF. It is a modeling aid, not a replacement for the original rulebook.

## Sources

- Official game page: <https://www.spacecowboys-games.com/game/splendor-duel/>
- Official English rulebook PDF: <https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/11/SCSPL2P01EN_Rules_Planche_BD.pdf>
- Checked on: 2026-04-17

## Components and Setup

- 1 Victory tile
- 67 Jewel cards across 3 decks
- 1 Bag
- 3 Privilege scrolls
- 25 tokens: 4 in each of the 5 gem colors, 2 Pearls, 3 Gold
- 1 Board
- 4 Royal cards

Setup in rulebook order:

1. Shuffle the three Jewel decks separately and stack them vertically.
2. Reveal 3 level-3, 4 level-2, and 5 level-1 cards to form the pyramid.
3. Randomly place the 25 tokens on the common board by filling the printed spiral from the center.
4. Place the 3 Privileges above the board and the 4 Royal cards below it.
5. Randomly choose the first player; the opponent takes 1 Privilege.

## Turn Structure

Players alternate turns until someone fulfills a victory condition at the end of their own turn.

Each turn is:

1. Perform none, one, or both optional actions in order.
2. Perform exactly 1 mandatory action.
3. Discard down to 10 tokens if needed.
4. Check victory conditions; if any are met, the game ends immediately.

## Optional Actions

### 1. Use a Privilege

- Return 1 or more Privileges.
- For each returned Privilege, take 1 Gem or Pearl from the board.
- Gold cannot be taken this way.

### 2. Replenish the Game Board

- Only available if the bag is not empty.
- Mix tokens in the bag and refill empty board spaces following the printed spiral from the center.
- After doing so, the opponent takes 1 Privilege.
- If no public Privilege remains, the player takes one from the opponent instead; if they already hold all 3, nothing happens.

## Mandatory Actions

### Take up to 3 tokens

- Take up to 3 adjacent Gem and/or Pearl tokens.
- The group must form an uninterrupted horizontal, vertical, or diagonal line.
- A single token or 2 adjacent tokens is also allowed.
- Gold cannot be taken this way.
- If the action takes 3 tokens of the same color or 2 Pearls, the opponent takes 1 Privilege.

### Take 1 Gold token and reserve 1 Jewel card

- Only available if a Gold token is on the board and the player has fewer than 3 reserved cards.
- First take 1 Gold.
- Then reserve either 1 face-up card from the pyramid or 1 blind top card from a deck.
- Reserved cards remain hidden from the opponent.
- If a face-up pyramid card is reserved and the source deck is not empty, refill it immediately.
- This is the only standard way to gain Gold.

### Purchase 1 Jewel card

- Buy a card from the pyramid or from your reserve.
- Pay the token cost shown on the card.
- Gold is wild and can replace any Gem or Pearl token.
- Spent tokens return to the bag.
- The purchased card immediately grants its bonus, Prestige, Crowns, and ability.

## Card Abilities and Crown / Royal Handling

The rulebook abilities group cleanly into these effect classes:

- Take another turn after the current one ends.
- Overlap this card onto a Jewel card with a bonus so its bonus changes color.
- Take 1 token from the board matching the card color; ignore if unavailable.
- Take 1 Privilege; if none remain in the supply, take one from the opponent.
- Take 1 Gem or Pearl from the opponent; Gold cannot be stolen; ignore if unavailable.

Crown / Royal handling:

- On gaining the 3rd Crown, immediately take 1 available Royal card and resolve it.
- On gaining the 6th Crown, do the same again.
- Taking a Royal card is not an action.

## Victory Conditions

At the end of your own turn, you win immediately if any of these are true:

1. 20 or more Prestige.
2. 10 or more Crowns.
3. 10 or more Prestige on cards of the same color.

## Modeling Conclusions for the Rebuild

- A turn is not a flat phase list; it is optional actions -> mandatory action -> end-of-turn cleanup -> victory check.
- Replenish Board must be modeled as an action that can award Privilege to the opponent.
- Gold is only obtained through the reserve action and must stay modeled as the unique wildcard token.
- Reserved cards create private information boundaries, so authoritative and player-facing snapshots must diverge.
- Purchase abilities, Royal resolution, and extra turns create chains, which fit an effect-actor / emitted-event model better than simple flat transitions.
- The “3 same-color tokens / 2 Pearls give opponent a Privilege” rule is a special branch inside token-taking and must not be reduced to a generic quantity rule.
