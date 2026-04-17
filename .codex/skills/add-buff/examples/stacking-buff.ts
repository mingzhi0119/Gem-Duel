export const stackedPrivileges = {
    id: 'stacked-privileges',
    rarity: 'boss',
    scope: 'self',
    hookPoint: 'BEFORE_USE_PRIVILEGE',
    effectAtoms: ['grant_privilege'],
    stacking: 'acquisition-order',
    note: 'Stacking Buff example where repeated instances resolve in acquisition order.',
} as const;
