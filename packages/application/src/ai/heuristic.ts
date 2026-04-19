import type { GameCommand, GameSnapshot, UiActionDescriptor } from '@gem-duel/contracts';

import type { AiDecisionTrace } from '../shared/types';

const hashText = (value: string) => {
    let hash = 2166136261;
    for (const char of value) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const getBuyCardLabel = (
    snapshot: GameSnapshot,
    action: Extract<GameCommand, { type: 'BUY_CARD' }>
) => {
    const source = action.source;
    if (source.kind === 'pyramid') {
        return snapshot.pyramid
            .find((row) => row.level === source.level)
            ?.slots.find((slot) => slot.slot === source.slot)?.card;
    }

    return snapshot.players[snapshot.context.currentPlayer].reserveSlots.find(
        (slot) => slot.slotId === source.slotId
    )?.card;
};

const getReserveCardLabel = (
    snapshot: GameSnapshot,
    action: Extract<GameCommand, { type: 'RESERVE_CARD' }>
) => {
    const source = action.source;
    if (source.kind !== 'pyramid') {
        return null;
    }

    return snapshot.pyramid
        .find((row) => row.level === source.level)
        ?.slots.find((slot) => slot.slot === source.slot)?.card;
};

export const scoreAiAction = (
    snapshot: GameSnapshot,
    action: UiActionDescriptor,
    seed: number,
    decisionIndex: number
) => {
    const tieBreaker = (hashText(`${seed}:${decisionIndex}:${action.id}`) % 1000) / 1000;
    const command = action.command;
    switch (command.type) {
        case 'BUY_CARD': {
            const card = getBuyCardLabel(snapshot, command);
            const abilityBonus =
                card?.ability === 'again'
                    ? 30
                    : card?.ability === 'bonus_gem'
                      ? 20
                      : card?.ability === 'steal'
                        ? 18
                        : card?.ability === 'scroll'
                          ? 16
                          : 0;
            return (
                300 +
                (card?.points ?? 0) * 25 +
                (card?.crowns ?? 0) * 20 +
                abilityBonus +
                tieBreaker
            );
        }
        case 'SELECT_ROYAL': {
            const royal = snapshot.royalSupply.find((card) => card.royalId === command.royalId);
            return 280 + (royal?.points ?? 0) * 20 + (royal?.crowns ?? 0) * 16 + tieBreaker;
        }
        case 'TAKE_EFFECT_BOARD_TOKEN':
            return 250 + tieBreaker;
        case 'STEAL_OPPONENT_TOKEN':
            return 240 + tieBreaker;
        case 'SELECT_BONUS_COLOR':
            return 230 + tieBreaker;
        case 'USE_PRIVILEGE_ADD_POSITION':
            return (
                220 +
                (snapshot.pendingSelection?.action === 'USE_PRIVILEGE'
                    ? snapshot.pendingSelection.selectedPositions.length * 12
                    : 0) +
                tieBreaker
            );
        case 'USE_PRIVILEGE_CONFIRM':
            return (
                215 +
                (snapshot.pendingSelection?.action === 'USE_PRIVILEGE'
                    ? snapshot.pendingSelection.selectedPositions.length * 20
                    : 0) +
                tieBreaker
            );
        case 'USE_PRIVILEGE_CANCEL':
            return -20 + tieBreaker;
        case 'USE_PRIVILEGE':
            return 210 + command.positions.length * 20 + tieBreaker;
        case 'TAKE_TOKENS_ADD_POSITION':
            return (
                190 +
                (snapshot.pendingSelection?.action === 'TAKE_TOKENS'
                    ? snapshot.pendingSelection.selectedPositions.length * 10
                    : 0) +
                tieBreaker
            );
        case 'TAKE_TOKENS_CONFIRM':
            return (
                185 +
                (snapshot.pendingSelection?.action === 'TAKE_TOKENS'
                    ? snapshot.pendingSelection.selectedPositions.length * 18
                    : 0) +
                tieBreaker
            );
        case 'TAKE_TOKENS_CANCEL':
            return -10 + tieBreaker;
        case 'TAKE_TOKENS':
            return 180 + command.positions.length * 18 + tieBreaker;
        case 'RESERVE_CARD': {
            const card = getReserveCardLabel(snapshot, command);
            return 150 + (card?.level ?? command.source.level) * 12 + tieBreaker;
        }
        case 'REPLENISH_BOARD':
            return 40 + tieBreaker;
        case 'DISCARD_TOKEN':
            return (command.color === 'gold' ? 5 : 25) + tieBreaker;
        case 'ENTER_REPLAY':
        case 'EXIT_REPLAY':
            return -100 + tieBreaker;
        default:
            return tieBreaker;
    }
};

export const chooseAiAction = (
    snapshot: GameSnapshot,
    actions: UiActionDescriptor[],
    seed: number,
    decisionIndex: number
): { chosen: UiActionDescriptor; trace: AiDecisionTrace } | null => {
    if (actions.length === 0) {
        return null;
    }

    const ranked = [...actions]
        .map((action) => ({
            action,
            score: scoreAiAction(snapshot, action, seed, decisionIndex),
        }))
        .sort((left, right) => right.score - left.score);
    const [chosen] = ranked;
    if (!chosen) {
        return null;
    }

    return {
        chosen: chosen.action,
        trace: {
            decisionIndex,
            player: snapshot.context.currentPlayer,
            sequence: snapshot.sequence,
            chosenActionId: chosen.action.id,
            chosenCommandType: chosen.action.command.type,
            candidates: ranked.map((entry) => ({
                actionId: entry.action.id,
                label: entry.action.label,
                commandType: entry.action.command.type,
                score: Number(entry.score.toFixed(3)),
            })),
        },
    };
};
