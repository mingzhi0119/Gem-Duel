export const stealOnBuy = {
    id: 'steal-on-buy',
    rarity: 'rare',
    scope: 'self',
    hookPoint: 'AFTER_BUY_CARD',
    effectAtoms: ['take_opponent_token'],
    stacking: 'registry-order',
    note: 'Triggered Buff that emits a standard effect atom after a committed buy event.',
} as const;
