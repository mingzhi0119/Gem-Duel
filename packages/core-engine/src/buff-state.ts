import type { GameSnapshot } from '@gem-duel/contracts';
import type { BuffId, PlayerId } from '@gem-duel/domain';
import type { BuySource } from './classic-helpers';
import { calculateCardPayment, getBuySourceCard, getCurrentPlayerState } from './classic-helpers';

export const getPlayerBuffs = (snapshot: GameSnapshot, playerId: PlayerId) =>
    snapshot.runContext?.activeBuffs.filter((buff) => buff.owner === playerId) ?? [];

const findPlayerBuff = (snapshot: GameSnapshot, playerId: PlayerId, buffId: BuffId) =>
    getPlayerBuffs(snapshot, playerId).find((buff) => buff.id === buffId) ?? null;

export const hasRunBuff = (snapshot: GameSnapshot, playerId: PlayerId, buffId: BuffId) =>
    findPlayerBuff(snapshot, playerId, buffId) !== null;

export const getGemLimit = (snapshot: GameSnapshot, playerId: PlayerId) => {
    let limit = 10;
    for (const buff of getPlayerBuffs(snapshot, playerId)) {
        if (buff.id === 'deep_pockets') {
            limit = 12;
        }
        if (buff.id === 'double_agent') {
            limit = 8;
        }
    }
    return limit;
};

export const getPrivilegePositionCap = (snapshot: GameSnapshot, playerId: PlayerId) =>
    hasRunBuff(snapshot, playerId, 'double_agent') ? 2 : 3;

export const getPrivilegeSpendCount = (
    snapshot: GameSnapshot,
    playerId: PlayerId,
    selectionCount: number
) => (hasRunBuff(snapshot, playerId, 'double_agent') && selectionCount > 0 ? 1 : selectionCount);

export const calculateBuyPayment = (snapshot: GameSnapshot, source: BuySource) => {
    const card = getBuySourceCard(snapshot, source);
    if (!card) {
        return null;
    }

    const player = getCurrentPlayerState(snapshot);
    const basicDiscount =
        source.kind === 'reserve' && hasRunBuff(snapshot, player.id, 'down_payment') ? 1 : 0;

    return {
        card,
        payment: calculateCardPayment(player, card, {
            basicDiscount,
        }),
    };
};
