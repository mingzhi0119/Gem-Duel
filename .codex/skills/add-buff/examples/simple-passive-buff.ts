export const extraGoldOnTake = {
    id: 'extra-gold-on-take',
    rarity: 'common',
    scope: 'self',
    hookPoint: 'AFTER_TAKE_TOKENS',
    effectAtoms: ['grant_privilege'],
    stacking: 'registry-order',
    note: 'Passive Buff that reacts after token-taking without introducing a new phase.',
} as const;
