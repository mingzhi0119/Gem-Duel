import { completeEffect, spawnEffect, startEffect } from './effect-lifecycle';
import {
    BONUS_COLORS,
    type ActiveEffect,
    type BonusColor,
    type EffectAtom,
    type EffectPrompt,
    type JewelCardState,
    type PlayerId,
    type RoyalCardState,
} from '@gem-duel/domain';
import type { GameSnapshot } from '@gem-duel/contracts';
import {
    applyTurnState,
    type EnginePorts,
    getCurrentPlayerState,
    getTotalTokens,
    getVictoryReasonForPlayer,
    nextPlayer,
    pushEvent,
    setPhase,
} from './classic-helpers';
import { getGemLimit } from './buff-state';

const createEffectId = (snapshot: GameSnapshot, atom: EffectAtom) =>
    `${snapshot.context.matchId}-${atom}-${snapshot.sequence + 1}`;

const createEffectNamespace = (snapshot: GameSnapshot, atom: EffectAtom, effectId: string) =>
    `match/${snapshot.context.matchId}/effects/${atom}/${snapshot.sequence + 1}/${effectId}`;

const grantPrivilege = (snapshot: GameSnapshot, targetPlayer: PlayerId) => {
    const receiver = snapshot.players[targetPlayer];
    const opponent = snapshot.players[nextPlayer(targetPlayer)];
    if (snapshot.privilegeSupply > 0) {
        snapshot.privilegeSupply -= 1;
        receiver.privileges += 1;
        return true;
    }
    if (opponent.privileges > 0) {
        opponent.privileges -= 1;
        receiver.privileges += 1;
        return true;
    }
    return false;
};

export const getPendingRoyalMilestone = (
    snapshot: GameSnapshot,
    playerId: PlayerId
): 3 | 6 | null => {
    const player = snapshot.players[playerId];
    if (snapshot.royalSupply.length <= 0) {
        return null;
    }
    if (player.crowns >= 6 && player.royals.length < 2) {
        return 6;
    }
    if (player.crowns >= 3 && player.royals.length < 1) {
        return 3;
    }
    return null;
};

export const upsertEffectPrompt = (snapshot: GameSnapshot, prompt: EffectPrompt) => {
    const index = snapshot.effectPrompts.findIndex((entry) => entry.effectId === prompt.effectId);
    if (index >= 0) {
        snapshot.effectPrompts[index] = prompt;
        return;
    }
    snapshot.effectPrompts.push(prompt);
};

export const removeEffectPrompt = (snapshot: GameSnapshot, effectId: string) => {
    snapshot.effectPrompts = snapshot.effectPrompts.filter((entry) => entry.effectId !== effectId);
};

const startPromptedEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    effect: Omit<ActiveEffect, 'stage'>,
    prompt: EffectPrompt
) => {
    ports.rng.fork(effect.rngNamespace);
    const spawned = spawnEffect(snapshot, effect);
    const started = startEffect(spawned.snapshot, spawned.actor);
    upsertEffectPrompt(started.snapshot, prompt);
    return {
        snapshot: started.snapshot,
        effectId: effect.effectId,
        actor: spawned.actor,
    };
};

const runImmediateEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    effect: Omit<ActiveEffect, 'stage'>,
    apply: (draft: GameSnapshot) => void
) => {
    ports.rng.fork(effect.rngNamespace);
    const spawned = spawnEffect(snapshot, effect);
    const started = startEffect(spawned.snapshot, spawned.actor);
    apply(started.snapshot);
    return completeEffect(started.snapshot, spawned.actor, 'resolved').snapshot;
};

export const awardPrivilegeWithEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    targetPlayer: PlayerId,
    source: 'optional_action' | 'mandatory_action' | 'card_ability' | 'royal_reward' | 'buff_hook',
    hookPoint:
        | 'AFTER_MATCH_SETUP'
        | 'AFTER_REPLENISH_BOARD'
        | 'AFTER_TAKE_TOKENS'
        | 'AFTER_BUY_CARD'
        | 'AFTER_GAIN_ROYAL'
) => {
    const effectId = createEffectId(snapshot, 'grant_privilege');
    const rngNamespace = createEffectNamespace(snapshot, 'grant_privilege', effectId);
    return runImmediateEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'grant_privilege',
            hookPoint,
            source,
            scope:
                targetPlayer === snapshot.context.currentPlayer
                    ? 'active_player'
                    : 'opposing_player',
            owner: targetPlayer,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        (draft) => {
            if (grantPrivilege(draft, targetPlayer)) {
                pushEvent(draft, {
                    type: 'privilege.awarded',
                    player: targetPlayer,
                    source,
                });
            }
        }
    );
};

export const grantExtraTurnWithEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    owner: PlayerId,
    source: 'card_ability' | 'royal_reward',
    hookPoint: 'AFTER_BUY_CARD' | 'AFTER_GAIN_ROYAL'
) => {
    const effectId = createEffectId(snapshot, 'take_extra_turn');
    const rngNamespace = createEffectNamespace(snapshot, 'take_extra_turn', effectId);
    return runImmediateEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'take_extra_turn',
            hookPoint,
            source,
            scope: 'active_player',
            owner,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        (draft) => {
            draft.hiddenState.extraTurns[owner] += 1;
        }
    );
};

export const startRoyalSelectionEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    owner: PlayerId,
    milestone: 3 | 6
) => {
    const effectId = createEffectId(snapshot, 'gain_royal');
    const rngNamespace = createEffectNamespace(snapshot, 'gain_royal', effectId);
    const started = startPromptedEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'gain_royal',
            hookPoint: 'BEFORE_GAIN_ROYAL',
            source: 'royal_reward',
            scope: 'active_player',
            owner,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        {
            effectId,
            atom: 'gain_royal',
            milestone,
            royalIds: snapshot.royalSupply.map((card) => card.royalId),
        }
    );
    pushEvent(started.snapshot, {
        type: 'royal.milestoneReached',
        player: owner,
        milestone,
    });
    return started.snapshot;
};

export const startBoardTokenEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    owner: PlayerId,
    allowedColors: BonusColor[]
) => {
    const presentColors = allowedColors.filter((color) =>
        snapshot.board.some((cell) => cell.token === color)
    );
    if (presentColors.length === 0) {
        return snapshot;
    }
    const effectId = createEffectId(snapshot, 'take_board_token');
    const rngNamespace = createEffectNamespace(snapshot, 'take_board_token', effectId);
    return startPromptedEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'take_board_token',
            hookPoint: 'AFTER_BUY_CARD',
            source: 'card_ability',
            scope: 'active_player',
            owner,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        {
            effectId,
            atom: 'take_board_token',
            allowedColors: presentColors,
            count: 1,
        }
    ).snapshot;
};

export const startOpponentTokenEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    owner: PlayerId,
    source: 'card_ability' | 'royal_reward' | 'buff_hook',
    hookPoint: 'AFTER_BUY_CARD' | 'AFTER_GAIN_ROYAL' | 'AFTER_REPLENISH_BOARD' = source ===
    'card_ability'
        ? 'AFTER_BUY_CARD'
        : source === 'royal_reward'
          ? 'AFTER_GAIN_ROYAL'
          : 'AFTER_REPLENISH_BOARD'
) => {
    const targetPlayer = nextPlayer(owner);
    const allowedColors = (['blue', 'white', 'green', 'black', 'red', 'pearl'] as const).filter(
        (color) => snapshot.players[targetPlayer].inventory[color] > 0
    );
    if (allowedColors.length === 0) {
        return snapshot;
    }
    const effectId = createEffectId(snapshot, 'take_opponent_token');
    const rngNamespace = createEffectNamespace(snapshot, 'take_opponent_token', effectId);
    return startPromptedEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'take_opponent_token',
            hookPoint,
            source,
            scope: 'opposing_player',
            owner,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        {
            effectId,
            atom: 'take_opponent_token',
            targetPlayer,
            allowedColors: [...allowedColors],
        }
    ).snapshot;
};

export const startBonusColorEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    cardId: string
) => {
    const effectId = createEffectId(snapshot, 'override_bonus_color');
    const rngNamespace = createEffectNamespace(snapshot, 'override_bonus_color', effectId);
    return startPromptedEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'override_bonus_color',
            hookPoint: 'AFTER_BUY_CARD',
            source: 'card_ability',
            scope: 'active_player',
            owner: snapshot.context.currentPlayer,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        {
            effectId,
            atom: 'override_bonus_color',
            cardId,
            allowedColors: [...BONUS_COLORS],
        }
    ).snapshot;
};

export const startDiscardEffect = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    remaining: number
) => {
    const effectId = createEffectId(snapshot, 'discard_to_limit');
    const rngNamespace = createEffectNamespace(snapshot, 'discard_to_limit', effectId);
    const started = startPromptedEffect(
        snapshot,
        ports,
        {
            effectId,
            parentEffectId: null,
            atom: 'discard_to_limit',
            hookPoint: 'BEFORE_DISCARD_TO_LIMIT',
            source: 'end_of_turn',
            scope: 'active_player',
            owner: snapshot.context.currentPlayer,
            sequence: snapshot.sequence + 1,
            rngNamespace,
        },
        {
            effectId,
            atom: 'discard_to_limit',
            remaining,
        }
    ).snapshot;
    applyTurnState(started, {
        segment: 'cleanup',
        optionalStep: 'done',
        pendingDiscardCount: remaining,
    });
    return started;
};

export const getCurrentPrompt = (snapshot: GameSnapshot) => snapshot.effectPrompts[0] ?? null;

export const getPromptByAtom = <T extends EffectPrompt['atom']>(
    snapshot: GameSnapshot,
    atom: T
): Extract<EffectPrompt, { atom: T }> | null => {
    const prompt = snapshot.effectPrompts.find(
        (entry): entry is Extract<EffectPrompt, { atom: T }> => entry.atom === atom
    );
    return prompt ?? null;
};

export const resolveCardAbility = (
    snapshot: GameSnapshot,
    ports: EnginePorts,
    card: JewelCardState | RoyalCardState,
    source: 'card_ability' | 'royal_reward'
) => {
    switch (card.ability) {
        case 'again':
            return grantExtraTurnWithEffect(
                snapshot,
                ports,
                snapshot.context.currentPlayer,
                source,
                source === 'card_ability' ? 'AFTER_BUY_CARD' : 'AFTER_GAIN_ROYAL'
            );
        case 'scroll':
            return awardPrivilegeWithEffect(
                snapshot,
                ports,
                snapshot.context.currentPlayer,
                source,
                source === 'card_ability' ? 'AFTER_BUY_CARD' : 'AFTER_GAIN_ROYAL'
            );
        case 'steal':
            return startOpponentTokenEffect(
                snapshot,
                ports,
                snapshot.context.currentPlayer,
                source
            );
        case 'bonus_gem':
            return 'bonusColor' in card && card.bonusColor
                ? startBoardTokenEffect(snapshot, ports, snapshot.context.currentPlayer, [
                      card.bonusColor,
                  ])
                : snapshot;
        case 'none':
            return snapshot;
    }
};

export const continueTurnFlow = (snapshot: GameSnapshot, ports: EnginePorts): GameSnapshot => {
    if (snapshot.context.phase !== 'turnIdle') {
        return snapshot;
    }
    if (snapshot.activeEffects.length > 0 || snapshot.effectPrompts.length > 0) {
        return snapshot;
    }
    if (!snapshot.context.turn.mandatoryActionTaken) {
        if (
            snapshot.context.turn.segment === 'optional' &&
            snapshot.context.turn.optionalStep === 'done'
        ) {
            applyTurnState(snapshot, {
                segment: 'mandatory',
                optionalStep: 'done',
            });
        }
        return snapshot;
    }

    const milestone = getPendingRoyalMilestone(snapshot, snapshot.context.currentPlayer);
    if (milestone !== null) {
        return startRoyalSelectionEffect(
            snapshot,
            ports,
            snapshot.context.currentPlayer,
            milestone
        );
    }

    const discardCount = Math.max(
        0,
        getTotalTokens(getCurrentPlayerState(snapshot)) -
            getGemLimit(snapshot, snapshot.context.currentPlayer)
    );
    if (discardCount > 0) {
        return startDiscardEffect(snapshot, ports, discardCount);
    }

    const victoryReason = getVictoryReasonForPlayer(snapshot, snapshot.context.currentPlayer);
    if (victoryReason) {
        snapshot.context.winner = snapshot.context.currentPlayer;
        snapshot.context.victoryReason = victoryReason;
        pushEvent(snapshot, {
            type: 'match.finished',
            winner: snapshot.context.currentPlayer,
            reason: victoryReason,
        });
        setPhase(snapshot, 'terminal');
        return snapshot;
    }

    const activePlayer = snapshot.context.currentPlayer;
    if (snapshot.hiddenState.extraTurns[activePlayer] > 0) {
        snapshot.hiddenState.extraTurns[activePlayer] -= 1;
    } else {
        snapshot.context.currentPlayer = nextPlayer(activePlayer);
    }

    snapshot.context.turn = {
        turnNumber: snapshot.context.turn.turnNumber + 1,
        segment: 'optional',
        optionalStep: 'privilege',
        mandatoryActionTaken: false,
        pendingDiscardCount: 0,
    };
    applyTurnState(snapshot, snapshot.context.turn);
    return snapshot;
};
