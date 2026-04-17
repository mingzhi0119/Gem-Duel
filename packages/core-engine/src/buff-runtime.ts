import type { GameSnapshot } from '@gem-duel/contracts';
import type { BuffId, BuffInstance, PlayerId } from '@gem-duel/domain';
import { awardPrivilegeWithEffect, startOpponentTokenEffect } from './classic-effects';
import { getPlayerBuffs } from './buff-state';
import type { EnginePorts } from './runtime';

const updateBuffInstance = (
    snapshot: GameSnapshot,
    buffId: BuffId,
    owner: PlayerId,
    update: (buff: BuffInstance) => BuffInstance
) => {
    if (!snapshot.runContext) {
        return;
    }

    const index = snapshot.runContext.activeBuffs.findIndex(
        (buff) => buff.owner === owner && buff.id === buffId
    );
    if (index < 0) {
        return;
    }

    const current = snapshot.runContext.activeBuffs[index];
    if (!current) {
        return;
    }
    snapshot.runContext.activeBuffs[index] = update(current);
};

export const applyAfterMatchSetupBuffs = (snapshot: GameSnapshot, ports: EnginePorts) => {
    let updated = snapshot;

    for (const buff of snapshot.runContext?.activeBuffs ?? []) {
        if (buff.id === 'privilege_favor') {
            updated = awardPrivilegeWithEffect(
                updated,
                ports,
                buff.owner,
                'buff_hook',
                'AFTER_MATCH_SETUP'
            );
        }
    }

    return updated;
};

export const applyAfterReplenishBoardBuffs = (snapshot: GameSnapshot, ports: EnginePorts) => {
    if (!snapshot.runContext) {
        return snapshot;
    }

    const owner = snapshot.context.currentPlayer;
    let updated = snapshot;

    for (const buff of getPlayerBuffs(updated, owner)) {
        if (buff.id !== 'extortion') {
            continue;
        }

        const replenishCount = Number(buff.state.replenishCount ?? 0) + 1;
        updateBuffInstance(updated, buff.id, owner, (current) => ({
            ...current,
            state: {
                ...current.state,
                replenishCount,
            },
        }));

        if (replenishCount % 2 === 0) {
            updated = startOpponentTokenEffect(
                updated,
                ports,
                owner,
                'buff_hook',
                'AFTER_REPLENISH_BOARD'
            );
        }
    }

    return updated;
};
