export type RulebookLocale = 'en' | 'zh';

type LocalizedText = Record<RulebookLocale, string>;

export interface RulebookFact {
    label: LocalizedText;
    value: LocalizedText;
}

export interface RulebookSection {
    id: string;
    eyebrow: LocalizedText;
    title: LocalizedText;
    summary: LocalizedText;
    bullets: LocalizedText[];
    callout?: LocalizedText;
}

export interface RulebookSourceLink {
    href: string;
    label: LocalizedText;
    note: LocalizedText;
}

export const RULEBOOK_PAGE_COPY = {
    eyebrow: {
        en: 'Desktop Tactical Reference',
        zh: '桌面对局速查',
    },
    title: {
        en: 'Gem Duel Rulebook',
        zh: 'Gem Duel 规则书',
    },
    subtitle: {
        en: 'A player-facing summary of the rebuilt classic flow, with clear callouts for Run-mode extensions.',
        zh: '面向玩家的重构版经典流程摘要，并明确标注 Run 模式的扩展规则。',
    },
    description: {
        en: 'Use this route as the in-product quick reference. The official board-game wording still lives in the original source material.',
        zh: '把这个页面当作产品内速查表使用；官方桌游的原始措辞仍以原始资料为准。',
    },
    localeLabel: {
        en: 'Language',
        zh: '语言',
    },
    navLabel: {
        en: 'Jump To',
        zh: '快速跳转',
    },
    factsLabel: {
        en: 'Quick Read',
        zh: '速览',
    },
    sourcesLabel: {
        en: 'Sources',
        zh: '来源',
    },
    backLabel: {
        en: 'Back to hub',
        zh: '返回首页',
    },
    sourceNote: {
        en: 'Classic rules mirror the shipped rebuild. Run-mode notes describe Gem Duel product extensions rather than official tabletop text.',
        zh: '经典规则部分对齐当前已交付的重构实现；Run 模式说明描述的是 Gem Duel 的产品扩展，而不是官方桌游原文。',
    },
} as const satisfies Record<string, LocalizedText>;

export const RULEBOOK_FACTS: RulebookFact[] = [
    {
        label: {
            en: 'Win',
            zh: '胜利',
        },
        value: {
            en: '20 prestige, 10 crowns, or 10 prestige in one color.',
            zh: '20 点声望、10 个皇冠，或单一颜色 10 点声望。',
        },
    },
    {
        label: {
            en: 'Turn Shape',
            zh: '回合结构',
        },
        value: {
            en: 'Optional actions first, then exactly one mandatory action.',
            zh: '先处理可选动作，再执行恰好一个强制动作。',
        },
    },
    {
        label: {
            en: 'Reserve',
            zh: '保留',
        },
        value: {
            en: 'Take 1 gold and reserve 1 card. You may hold at most 3 reserved cards.',
            zh: '拿 1 金并保留 1 张牌；手里最多保留 3 张。',
        },
    },
    {
        label: {
            en: 'Token Limit',
            zh: '宝石上限',
        },
        value: {
            en: 'End your turn with at most 10 tokens unless a Run buff says otherwise.',
            zh: '除非 Run Buff 另有说明，否则回合结束时最多持有 10 枚宝石。',
        },
    },
];

export const RULEBOOK_SECTIONS: RulebookSection[] = [
    {
        id: 'overview',
        eyebrow: {
            en: '1. Duel Snapshot',
            zh: '1. 对局概览',
        },
        title: {
            en: 'What Sits on the Table',
            zh: '桌面上有什么',
        },
        summary: {
            en: 'Gem Duel is a shared-board race between two players. The pyramid, the token board, and the royal court all matter every turn.',
            zh: 'Gem Duel 是一个双人共享棋盘的竞速对局。金字塔牌阵、公共宝石盘和皇家卡区都会在每个回合里发生作用。',
        },
        bullets: [
            {
                en: 'Setup reveals 3 level-3 cards, 4 level-2 cards, and 5 level-1 cards into the market pyramid.',
                zh: '开局会翻开 3 张三级牌、4 张二级牌和 5 张一级牌，组成市场金字塔。',
            },
            {
                en: 'The 5x5 board is filled along the printed spiral with five gem colors, pearls, and gold.',
                zh: '5x5 棋盘沿印刷好的螺旋路径放入五色宝石、珍珠与黄金。',
            },
            {
                en: 'Three Privilege scrolls sit above the board; four Royal cards sit below it.',
                zh: '棋盘上方放 3 个特权卷轴，下方放 4 张皇家卡。',
            },
            {
                en: 'Player two begins with 1 Privilege, which softens the first-player tempo edge.',
                zh: '后手起始持有 1 个特权卷轴，用来平衡先手节奏优势。',
            },
        ],
    },
    {
        id: 'victory',
        eyebrow: {
            en: '2. Win Conditions',
            zh: '2. 胜利条件',
        },
        title: {
            en: 'Three Ways to End the Duel',
            zh: '三种结束比赛的方式',
        },
        summary: {
            en: 'Victory is checked at the end of your own turn. You only need one of the three targets.',
            zh: '胜利只在你自己的回合结束时检查，满足任意一个目标即可获胜。',
        },
        bullets: [
            {
                en: 'Reach 20 or more prestige in total.',
                zh: '总声望达到或超过 20。',
            },
            {
                en: 'Collect 10 or more crowns across your tableau and Royal cards.',
                zh: '你的场上与皇家卡合计收集到 10 个或以上的皇冠。',
            },
            {
                en: 'Reach 10 or more prestige on cards of a single bonus color.',
                zh: '单一奖励颜色上的声望达到或超过 10。',
            },
        ],
        callout: {
            en: 'The duel does not stop mid-action. Resolve chains first, clean up, then check the win.',
            zh: '对局不会在动作中途打断。先把连锁效果和收尾处理完，再检查胜利。',
        },
    },
    {
        id: 'turn-flow',
        eyebrow: {
            en: '3. Turn Flow',
            zh: '3. 回合流程',
        },
        title: {
            en: 'Optional First, Mandatory Second',
            zh: '先可选，后强制',
        },
        summary: {
            en: 'A turn is not just one click. The legal order matters, especially for Privileges and board replenishment.',
            zh: '一个回合并不只是一次点击。动作顺序本身很重要，尤其是特权卷轴与补板动作。',
        },
        bullets: [
            {
                en: 'You may perform none, one, or both optional actions before the main action.',
                zh: '在主行动之前，你可以不做、做一个，或者把两个可选动作都做掉。',
            },
            {
                en: 'You must then perform exactly one mandatory action: take tokens, reserve with gold, or buy a card.',
                zh: '之后必须执行恰好一个强制动作：拿宝石、带金保留，或购买卡牌。',
            },
            {
                en: 'If you finish the turn above the token cap, discard back down before victory is checked.',
                zh: '如果回合结束时你的宝石超过上限，要先弃到上限以内，再进行胜利检查。',
            },
            {
                en: 'Triggered abilities, royal pickups, and extra turns resolve inside the turn before the next player acts.',
                zh: '触发能力、皇家卡获取和额外回合都会在当前回合内部完成结算，然后才轮到下一位玩家。',
            },
        ],
        callout: {
            en: 'The rebuilt UI mirrors this order with direct triggers, but the game logic is still the same sequence.',
            zh: '重构后的 UI 会把这些步骤做成直触发交互，但底层规则顺序没有改变。',
        },
    },
    {
        id: 'optional-actions',
        eyebrow: {
            en: '4. Optional Actions',
            zh: '4. 可选动作',
        },
        title: {
            en: 'Use Privileges or Refill the Board',
            zh: '使用卷轴或补满棋盘',
        },
        summary: {
            en: 'Optional actions are where tempo swings happen. They can reshape the board before your main decision.',
            zh: '可选动作往往决定节奏变化，因为它们会在主行动前重塑棋盘局势。',
        },
        bullets: [
            {
                en: 'Spend 1 Privilege to take 1 gem or pearl directly from the board. Gold is never legal here.',
                zh: '花费 1 个特权卷轴，可以直接从棋盘拿 1 枚宝石或珍珠；黄金永远不能这样拿。',
            },
            {
                en: 'You may spend multiple Privileges in the same turn before your main action.',
                zh: '在主行动前，你可以连续使用多个特权卷轴。',
            },
            {
                en: 'Replenish the board only if the bag still has tokens. The refill follows the printed spiral order.',
                zh: '只有袋中仍有宝石时才能补板；补板会沿印刷的螺旋顺序填充空位。',
            },
            {
                en: 'After replenishing, your opponent gains 1 Privilege from the supply, or from you if the public supply is empty.',
                zh: '完成补板后，对手会获得 1 个特权卷轴；如果公共供应为空，则改从你这里拿。',
            },
        ],
    },
    {
        id: 'mandatory-actions',
        eyebrow: {
            en: '5. Mandatory Actions',
            zh: '5. 强制动作',
        },
        title: {
            en: 'Choose One Main Action',
            zh: '三选一主行动',
        },
        summary: {
            en: 'Every turn ends with exactly one main action. These are the three actions the board is built around.',
            zh: '每个回合最终都要落到一个主行动上，而整个棋盘就是围绕这三种动作设计的。',
        },
        bullets: [
            {
                en: 'Take up to 3 adjacent gems and/or pearls in one straight line. The group cannot be broken by gaps or gold.',
                zh: '沿一条直线拿最多 3 枚相邻的宝石和/或珍珠；中间不能被空格或黄金打断。',
            },
            {
                en: 'If that take grabs 3 tokens of the same color, or both pearls, your opponent gains 1 Privilege.',
                zh: '如果这次拿取包含 3 枚同色宝石，或把 2 枚珍珠都拿走，对手会获得 1 个特权卷轴。',
            },
            {
                en: 'Reserve takes 1 gold from the board and 1 card from the pyramid or deck. If your reserve is already full at 3, the action is illegal.',
                zh: '保留动作会从棋盘拿 1 金，再从金字塔或牌堆顶保留 1 张牌；如果你的保留区已经满 3 张，就不能执行。',
            },
            {
                en: 'Buying works from either the market or your own reserve. Pay the printed cost, using gold as wild if needed.',
                zh: '购买可以从市场明牌或自己的保留区进行；按印刷成本支付，不足时可以用黄金代替。',
            },
        ],
    },
    {
        id: 'cards-and-abilities',
        eyebrow: {
            en: '6. Cards and Abilities',
            zh: '6. 卡牌与能力',
        },
        title: {
            en: 'Read Cost, Bonus, Crowns, and Effects',
            zh: '看懂费用、奖励、皇冠和能力',
        },
        summary: {
            en: 'Purchased cards do more than score. They build discounts, trigger effects, and unlock Royal timing.',
            zh: '购入的卡牌不只是计分，它们还会提供折扣、触发能力，并改变皇家卡的节奏。',
        },
        bullets: [
            {
                en: 'A card cost is paid with tokens. Gold can cover any missing color, including pearl requirements.',
                zh: '卡牌费用用宝石支付；黄金可以替代任何缺失的颜色，也可以替代珍珠需求。',
            },
            {
                en: 'Bonus discounts only apply to the five basic gem colors. Pearl costs still require real pearls or gold.',
                zh: '奖励折扣只作用于五种基础颜色；珍珠费用仍然需要真实珍珠或黄金来支付。',
            },
            {
                en: 'Classic abilities cluster into extra turn, board pickup, privilege gain, theft, and bonus-color manipulation.',
                zh: '经典能力大致可以归类为额外回合、从棋盘拿宝石、获得卷轴、偷取资源，以及奖励颜色变化。',
            },
            {
                en: 'Triggered effects resolve immediately after the purchase that caused them, not later in the round.',
                zh: '触发能力会在导致它触发的购买动作之后立刻结算，而不是拖到回合后面。',
            },
        ],
    },
    {
        id: 'royal-court',
        eyebrow: {
            en: '7. Crowns and Royals',
            zh: '7. 皇冠与皇家卡',
        },
        title: {
            en: 'The Court Rewards Crown Tempo',
            zh: '皇室会奖励皇冠节奏',
        },
        summary: {
            en: 'Royal cards are free rewards, but they still matter for score, crowns, and chained resolution.',
            zh: '皇家卡是免费奖励，但它们同样会影响分数、皇冠数量与连锁结算。',
        },
        bullets: [
            {
                en: 'As soon as you gain your 3rd crown, you immediately choose and resolve 1 available Royal card.',
                zh: '当你拿到第 3 个皇冠时，要立刻选择并结算 1 张可用皇家卡。',
            },
            {
                en: 'The same happens again when you gain your 6th crown.',
                zh: '拿到第 6 个皇冠时会再重复一次。',
            },
            {
                en: 'Taking a Royal card is not your main action for the turn; it rides on top of the action that earned the crown.',
                zh: '拿皇家卡不算你的主行动，它是附着在获得皇冠的那次动作之上的奖励解析。',
            },
            {
                en: 'Royal cards contribute prestige and crowns, but they do not build a color-discount engine the way jewel cards do.',
                zh: '皇家卡会提供声望和皇冠，但不会像宝石卡那样构成颜色折扣引擎。',
            },
        ],
    },
    {
        id: 'limits',
        eyebrow: {
            en: '8. Limits and Reminders',
            zh: '8. 限制与易错点',
        },
        title: {
            en: 'What Players Forget Most Often',
            zh: '最容易忘的限制',
        },
        summary: {
            en: 'These are the rules that cause the most illegal clicks in live play.',
            zh: '这些通常是实战中最容易导致非法操作的地方。',
        },
        bullets: [
            {
                en: 'Gold cannot be taken through Privileges or regular token-taking. Reserve is the standard way to gain it.',
                zh: '黄金不能通过卷轴动作或普通拿宝石动作取得；保留是常规拿金方式。',
            },
            {
                en: 'You cannot reserve above 3 cards, even if gold is available.',
                zh: '即使棋盘上还有黄金，也不能把保留牌数量提升到 3 张以上。',
            },
            {
                en: 'Reserved cards are private information. Opponents can infer timing, not identity.',
                zh: '保留牌属于私有信息；对手可以看见你保留了牌，但不能知道具体是哪张。',
            },
            {
                en: 'If an effect tells you to take a Privilege and the supply is empty, the token comes from the opponent whenever possible.',
                zh: '如果一个效果要求你获得卷轴而公共供应为空，那么卷轴会优先改从对手处转移。',
            },
        ],
    },
    {
        id: 'run-mode',
        eyebrow: {
            en: '9. Run Mode Extension',
            zh: '9. Run 模式扩展',
        },
        title: {
            en: 'What Changes in Roguelike Play',
            zh: '肉鸽模式里会改变什么',
        },
        summary: {
            en: 'Run mode keeps the classic duel skeleton, then layers starter buffs and extended resource semantics on top.',
            zh: 'Run 模式保留经典对局骨架，再在其上叠加起始 Buff 与扩展资源语义。',
        },
        bullets: [
            {
                en: 'Players draft starter buffs before the duel begins. Those buffs change openings, caps, or special abilities.',
                zh: '开局前玩家会先选起始 Buff，它们会改变起手资源、上限或特殊能力。',
            },
            {
                en: 'Extra gems granted by buffs are product-specific resources. When spent, they disappear instead of returning to the bag.',
                zh: 'Buff 给予的额外宝石属于产品扩展资源；它们被花掉后会直接消失，而不是回到袋中。',
            },
            {
                en: 'Protected or special Privileges are also product extensions. They follow their own steal and spend rules.',
                zh: '受保护或特殊卷轴同样属于产品扩展，并拥有独立的被偷取与消耗规则。',
            },
            {
                en: 'When a Run buff changes a limit or a victory target, the buff text overrides the classic baseline for that match.',
                zh: '如果某个 Run Buff 修改了上限或胜利条件，那么该局会以 Buff 文本覆盖经典基线。',
            },
        ],
        callout: {
            en: 'Run-mode notes are Gem Duel product rules, not part of the original Splendor Duel board-game rulebook.',
            zh: 'Run 模式说明属于 Gem Duel 的产品规则扩展，并不来自原版 Splendor Duel 官方桌游规则书。',
        },
    },
];

export const RULEBOOK_SOURCES: RulebookSourceLink[] = [
    {
        href: 'https://www.spacecowboys-games.com/game/splendor-duel/',
        label: {
            en: 'Official game page',
            zh: '官方游戏页',
        },
        note: {
            en: 'Publisher overview, components, and official product framing.',
            zh: '发行方提供的概览、组件说明与官方产品介绍。',
        },
    },
    {
        href: 'https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/11/SCSPL2P01EN_Rules_Planche_BD.pdf',
        label: {
            en: 'Official English rulebook PDF',
            zh: '官方英文规则 PDF',
        },
        note: {
            en: 'Primary source for classic tabletop wording and timing.',
            zh: '经典桌游措辞与时序的主要来源。',
        },
    },
];
