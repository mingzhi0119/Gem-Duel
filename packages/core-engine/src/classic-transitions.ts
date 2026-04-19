import { createEffectLifecycleActor, completeEffect } from './effect-lifecycle';
import {
    createDomainError,
    type BoardPositionId,
    type BonusColor,
    type DomainError,
} from '@gem-duel/domain';
import type { GameCommand, GameSnapshot, TypedResult } from '@gem-duel/contracts';
import {
    applyTurnState,
    type EnginePorts,
    findFirstEmptyReserveSlot,
    getBoardCell,
    getCurrentPlayerState,
    getPyramidSlot,
    getReserveSlot,
    getReserveSourceCard,
    lookupCard,
    nextPlayer,
    pushEvent,
    refillPyramidSlot,
    returnTokensToBag,
    setBoardToken,
    setPhase,
    collectBoardTokens,
    recomputePlayerTotals,
} from './classic-helpers';
import {
    calculateBuyPayment,
    getGemLimit,
    getPrivilegePositionCap,
    getPrivilegeSpendCount,
} from './buff-state';
import {
    awardPrivilegeWithEffect,
    continueTurnFlow,
    getCurrentPrompt,
    getPromptByAtom,
    removeEffectPrompt,
    resolveCardAbility,
    startBonusColorEffect,
} from './classic-effects';

const hasBoardGold = (snapshot: GameSnapshot) =>
    snapshot.board.some((cell) => cell.token === 'gold');

const canUsePrivilege = (snapshot: GameSnapshot) => {
    const player = getCurrentPlayerState(snapshot);
    return (
        player.privileges > 0 &&
        snapshot.board.some((cell) => cell.token !== null && cell.token !== 'gold')
    );
};

const canReplenishBoard = (snapshot: GameSnapshot) => snapshot.hiddenState.bag.length > 0;

const canTakeTokens = (snapshot: GameSnapshot) =>
    snapshot.board.some((cell) => cell.token !== null && cell.token !== 'gold');

const canReserveCard = (snapshot: GameSnapshot) => {
    const player = getCurrentPlayerState(snapshot);
    return (
        hasBoardGold(snapshot) &&
        findFirstEmptyReserveSlot(player) !== null &&
        (snapshot.pyramid.some((row) => row.slots.some((slot) => slot.card !== null)) ||
            (['level1', 'level2', 'level3'] as const).some(
                (deckKey) => snapshot.hiddenState.deckOrder[deckKey].length > 0
            ))
    );
};

const canBuyCard = (snapshot: GameSnapshot) => {
    const sources = [
        ...snapshot.pyramid.flatMap((row) =>
            row.slots
                .filter((slot) => slot.card !== null)
                .map((slot) => ({ kind: 'pyramid' as const, level: row.level, slot: slot.slot }))
        ),
        ...getCurrentPlayerState(snapshot)
            .reserveSlots.filter((slot) => slot.card !== null)
            .map((slot) => ({ kind: 'reserve' as const, slotId: slot.slotId })),
    ];
    return sources.some((source) => calculateBuyPayment(snapshot, source)?.payment.affordable);
};

const createPhaseGuardError = (snapshot: GameSnapshot, command: GameCommand): DomainError =>
    createDomainError(
        'ENGINE_PHASE_GUARD',
        'rules',
        `Command ${command.type} is not allowed during ${snapshot.context.phase}.`,
        {
            phase: snapshot.context.phase,
            command: command.type,
            activeEffects: snapshot.activeEffects.map((effect) => ({
                effectId: effect.effectId,
                atom: effect.atom,
                stage: effect.stage,
            })),
            turn: snapshot.context.turn,
        }
    );

const createRuleGuardError = (
    code: string,
    message: string,
    details?: Record<string, unknown>
): DomainError => createDomainError(code, 'rules', message, details);

const validateTokenLine = (snapshot: GameSnapshot, positions: BoardPositionId[]) => {
    if (new Set(positions).size !== positions.length) {
        return createRuleGuardError('ENGINE_RULE_GUARD', 'Token selections must be unique.');
    }
    for (const positionId of positions) {
        const cell = getBoardCell(snapshot, positionId);
        if (cell.token === null || cell.token === 'gold') {
            return createRuleGuardError(
                'ENGINE_RULE_GUARD',
                'Token selections must target occupied non-gold board cells.'
            );
        }
    }
    if (positions.length <= 1) {
        return null;
    }

    const points = positions.map((positionId) => {
        const cell = getBoardCell(snapshot, positionId);
        return { row: cell.row, col: cell.col };
    });
    const sorted = [...points].sort((left, right) =>
        left.row === right.row ? left.col - right.col : left.row - right.row
    );
    const first = sorted[0];
    const second = sorted[1];
    if (!first || !second) {
        return null;
    }
    const rowStep = Math.sign(second.row - first.row);
    const colStep = Math.sign(second.col - first.col);
    if (rowStep === 0 && colStep === 0) {
        return createRuleGuardError(
            'ENGINE_RULE_GUARD',
            'Token selections must form a straight line.'
        );
    }
    for (let index = 1; index < sorted.length; index += 1) {
        const previous = sorted[index - 1];
        const current = sorted[index];
        if (!previous || !current) {
            return createRuleGuardError(
                'ENGINE_RULE_GUARD',
                'Token selections must form an uninterrupted straight line.'
            );
        }
        if (current.row - previous.row !== rowStep || current.col - previous.col !== colStep) {
            return createRuleGuardError(
                'ENGINE_RULE_GUARD',
                'Token selections must form an uninterrupted straight line.'
            );
        }
    }
    return null;
};

const getTakeTokensPendingSelection = (snapshot: GameSnapshot) =>
    snapshot.pendingSelection?.action === 'TAKE_TOKENS' ? snapshot.pendingSelection : null;

const getUsePrivilegePendingSelection = (snapshot: GameSnapshot) =>
    snapshot.pendingSelection?.action === 'USE_PRIVILEGE' ? snapshot.pendingSelection : null;

const createPendingSelectionError = (command: GameCommand['type']) =>
    createRuleGuardError(
        'ENGINE_RULE_GUARD',
        `Command ${command} requires an active pending selection in the current phase.`
    );

const validateUsePrivilegePositions = (snapshot: GameSnapshot, positions: BoardPositionId[]) => {
    const player = getCurrentPlayerState(snapshot);
    const spendCount = getPrivilegeSpendCount(snapshot, player.id, positions.length);
    if (positions.length > getPrivilegePositionCap(snapshot, player.id)) {
        return createRuleGuardError(
            'ENGINE_RULE_GUARD',
            'Privilege selections exceed the current per-use cap.'
        );
    }
    if (spendCount > player.privileges) {
        return createRuleGuardError(
            'ENGINE_RULE_GUARD',
            'Cannot spend more privilege scrolls than the player owns.'
        );
    }
    if (new Set(positions).size !== positions.length) {
        return createRuleGuardError('ENGINE_RULE_GUARD', 'Privilege selections must be unique.');
    }
    for (const positionId of positions) {
        const cell = getBoardCell(snapshot, positionId);
        if (cell.token === null || cell.token === 'gold') {
            return createRuleGuardError(
                'ENGINE_RULE_GUARD',
                'Privilege picks must target occupied non-gold board cells.'
            );
        }
    }
    return null;
};

const appendPendingSelectionPosition = (
    snapshot: GameSnapshot,
    action: 'TAKE_TOKENS' | 'USE_PRIVILEGE',
    positionId: BoardPositionId
) => {
    const pendingSelection = snapshot.pendingSelection;
    if (!pendingSelection || pendingSelection.action !== action) {
        throw new Error(`Missing pending selection for ${action}.`);
    }

    pendingSelection.selectedPositions = [...pendingSelection.selectedPositions, positionId];
    pushEvent(snapshot, {
        type: 'selection.positionAdded',
        action,
        player: snapshot.context.currentPlayer,
        positionId,
        positions: [...pendingSelection.selectedPositions],
    });
};

const validateCommandPayload = (
    snapshot: GameSnapshot,
    command: GameCommand
): DomainError | null => {
    switch (command.type) {
        case 'REPLENISH_BOARD':
            return canReplenishBoard(snapshot)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The bag is empty and the board cannot be replenished.'
                  );
        case 'TAKE_TOKENS_ADD_POSITION': {
            const pendingSelection = getTakeTokensPendingSelection(snapshot);
            if (!pendingSelection) {
                return snapshot.context.phase === 'turnIdle'
                    ? validateTokenLine(snapshot, [command.positionId])
                    : createPendingSelectionError(command.type);
            }
            if (pendingSelection.selectedPositions.includes(command.positionId)) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Token selections must be unique.'
                );
            }
            if (pendingSelection.selectedPositions.length >= pendingSelection.maxSelections) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Token selections cannot exceed the current pending-selection cap.'
                );
            }
            return validateTokenLine(snapshot, [
                ...pendingSelection.selectedPositions,
                command.positionId,
            ]);
        }
        case 'TAKE_TOKENS_CONFIRM': {
            const pendingSelection = getTakeTokensPendingSelection(snapshot);
            if (!pendingSelection) {
                return createPendingSelectionError(command.type);
            }
            return pendingSelection.selectedPositions.length > 0
                ? validateTokenLine(snapshot, pendingSelection.selectedPositions)
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'Token selection cannot be confirmed without at least one board position.'
                  );
        }
        case 'TAKE_TOKENS_CANCEL':
            return getTakeTokensPendingSelection(snapshot)
                ? null
                : createPendingSelectionError(command.type);
        case 'TAKE_TOKENS':
            return validateTokenLine(snapshot, command.positions);
        case 'USE_PRIVILEGE_ADD_POSITION': {
            const pendingSelection = getUsePrivilegePendingSelection(snapshot);
            if (!pendingSelection) {
                return snapshot.context.phase === 'turnIdle'
                    ? validateUsePrivilegePositions(snapshot, [command.positionId])
                    : createPendingSelectionError(command.type);
            }
            if (pendingSelection.selectedPositions.includes(command.positionId)) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Privilege selections must be unique.'
                );
            }
            if (pendingSelection.selectedPositions.length >= pendingSelection.maxSelections) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Privilege selections exceed the current pending-selection cap.'
                );
            }
            return validateUsePrivilegePositions(snapshot, [
                ...pendingSelection.selectedPositions,
                command.positionId,
            ]);
        }
        case 'USE_PRIVILEGE_CONFIRM': {
            const pendingSelection = getUsePrivilegePendingSelection(snapshot);
            if (!pendingSelection) {
                return createPendingSelectionError(command.type);
            }
            return pendingSelection.selectedPositions.length > 0
                ? validateUsePrivilegePositions(snapshot, pendingSelection.selectedPositions)
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'Privilege cannot be confirmed without at least one selected position.'
                  );
        }
        case 'USE_PRIVILEGE_CANCEL':
            return getUsePrivilegePendingSelection(snapshot)
                ? null
                : createPendingSelectionError(command.type);
        case 'USE_PRIVILEGE': {
            return validateUsePrivilegePositions(snapshot, command.positions);
        }
        case 'RESERVE_CARD': {
            if (!hasBoardGold(snapshot)) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Reserve requires a gold token to be present on the board.'
                );
            }
            if (!findFirstEmptyReserveSlot(getCurrentPlayerState(snapshot))) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'A player may not reserve more than three cards.'
                );
            }
            if (getBoardCell(snapshot, command.goldPosition).token !== 'gold') {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'Reserve must name a board position that currently holds gold.'
                );
            }
            return getReserveSourceCard(snapshot, command.source)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The requested reserve source is empty.'
                  );
        }
        case 'BUY_CARD': {
            const priced = calculateBuyPayment(snapshot, command.source);
            if (!priced) {
                return createRuleGuardError(
                    'ENGINE_RULE_GUARD',
                    'The requested buy source does not contain a card.'
                );
            }
            return priced.payment.affordable
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The active player cannot afford the requested card.'
                  );
        }
        case 'SELECT_ROYAL': {
            const prompt = getPromptByAtom(snapshot, 'gain_royal');
            return prompt && prompt.royalIds.includes(command.royalId)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The requested royal card is not available for selection.'
                  );
        }
        case 'TAKE_EFFECT_BOARD_TOKEN': {
            const prompt = getPromptByAtom(snapshot, 'take_board_token');
            const cell = getBoardCell(snapshot, command.positionId);
            return prompt &&
                prompt.effectId === command.effectId &&
                cell.token !== null &&
                prompt.allowedColors.includes(cell.token as BonusColor)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The selected board token is not legal for the active effect.'
                  );
        }
        case 'STEAL_OPPONENT_TOKEN': {
            const prompt = getPromptByAtom(snapshot, 'take_opponent_token');
            return prompt &&
                prompt.effectId === command.effectId &&
                prompt.allowedColors.includes(command.color)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The selected steal color is not legal for the active effect.'
                  );
        }
        case 'SELECT_BONUS_COLOR': {
            const prompt = getPromptByAtom(snapshot, 'override_bonus_color');
            return prompt &&
                prompt.effectId === command.effectId &&
                prompt.allowedColors.includes(command.color)
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The selected bonus color is not legal for the active effect.'
                  );
        }
        case 'DISCARD_TOKEN':
            return getPromptByAtom(snapshot, 'discard_to_limit') &&
                getCurrentPlayerState(snapshot).inventory[command.color] > 0
                ? null
                : createRuleGuardError(
                      'ENGINE_RULE_GUARD',
                      'The active player cannot discard the requested token.'
                  );
        default:
            return null;
    }
};

export const getAllowedCommands = (snapshot: GameSnapshot): GameCommand['type'][] => {
    switch (snapshot.context.phase) {
        case 'initialization':
            return ['SELECT_MODE'];
        case 'modeSelection':
            return ['START_MATCH'];
        case 'gemSelection': {
            const pendingSelection = getTakeTokensPendingSelection(snapshot);
            return [
                'TAKE_TOKENS_ADD_POSITION',
                ...(pendingSelection && pendingSelection.selectedPositions.length > 0
                    ? (['TAKE_TOKENS_CONFIRM'] as const)
                    : []),
                'TAKE_TOKENS_CANCEL',
            ];
        }
        case 'privilege': {
            const pendingSelection = getUsePrivilegePendingSelection(snapshot);
            return [
                'USE_PRIVILEGE_ADD_POSITION',
                ...(pendingSelection && pendingSelection.selectedPositions.length > 0
                    ? (['USE_PRIVILEGE_CONFIRM'] as const)
                    : []),
                'USE_PRIVILEGE_CANCEL',
            ];
        }
        case 'replay':
            return ['EXIT_REPLAY'];
        case 'terminal':
            return [];
        case 'turnIdle': {
            const prompt = getCurrentPrompt(snapshot);
            if (prompt) {
                switch (prompt.atom) {
                    case 'gain_royal':
                        return ['SELECT_ROYAL'];
                    case 'take_board_token':
                        return ['TAKE_EFFECT_BOARD_TOKEN'];
                    case 'take_opponent_token':
                        return ['STEAL_OPPONENT_TOKEN'];
                    case 'override_bonus_color':
                        return ['SELECT_BONUS_COLOR'];
                    case 'discard_to_limit':
                        return ['DISCARD_TOKEN'];
                }
            }

            const commands: GameCommand['type'][] = ['ENTER_REPLAY'];
            const { segment, optionalStep, mandatoryActionTaken } = snapshot.context.turn;
            if (mandatoryActionTaken) {
                return commands;
            }
            if (
                segment === 'optional' &&
                optionalStep === 'privilege' &&
                canUsePrivilege(snapshot)
            ) {
                commands.unshift('USE_PRIVILEGE_ADD_POSITION');
            }
            if (
                segment === 'optional' &&
                (optionalStep === 'privilege' || optionalStep === 'replenish') &&
                canReplenishBoard(snapshot)
            ) {
                commands.unshift('REPLENISH_BOARD');
            }
            if (
                (segment === 'mandatory' ||
                    (segment === 'optional' &&
                        (optionalStep !== 'privilege' || !canUsePrivilege(snapshot)))) &&
                canTakeTokens(snapshot)
            ) {
                commands.unshift('TAKE_TOKENS_ADD_POSITION');
            }
            if ((segment === 'optional' || segment === 'mandatory') && canReserveCard(snapshot)) {
                commands.unshift('RESERVE_CARD');
            }
            if ((segment === 'optional' || segment === 'mandatory') && canBuyCard(snapshot)) {
                commands.unshift('BUY_CARD');
            }
            return [...new Set(commands)];
        }
    }
};

export const canDispatchCommand = (snapshot: GameSnapshot, command: GameCommand) =>
    getAllowedCommands(snapshot).includes(command.type) ||
    (snapshot.context.phase === 'gemSelection' && command.type === 'TAKE_TOKENS') ||
    (snapshot.context.phase === 'privilege' && command.type === 'USE_PRIVILEGE');

const startPendingSelection = (snapshot: GameSnapshot, phase: 'gemSelection' | 'privilege') => {
    applyTurnState(snapshot, {
        segment: phase === 'privilege' ? 'optional' : 'mandatory',
        optionalStep: phase === 'privilege' ? 'privilege' : 'done',
    });
    setPhase(snapshot, phase);
};

const removeReserveSourceCard = (
    snapshot: GameSnapshot,
    source: Extract<GameCommand, { type: 'RESERVE_CARD' }>['source']
) => {
    if (source.kind === 'pyramid') {
        const slot = getPyramidSlot(snapshot, source);
        const card = slot.card;
        if (!card) {
            throw new Error('Attempted to reserve from an empty pyramid slot.');
        }
        slot.card = null;
        return card;
    }
    const deckKey = source.level === 1 ? 'level1' : source.level === 2 ? 'level2' : 'level3';
    const cardId = snapshot.hiddenState.deckOrder[deckKey].shift();
    if (!cardId) {
        throw new Error('Attempted to reserve from an empty deck.');
    }
    return lookupCard(cardId);
};

const removeBuySourceCard = (
    snapshot: GameSnapshot,
    source: Extract<GameCommand, { type: 'BUY_CARD' }>['source']
) => {
    if (source.kind === 'pyramid') {
        const slot = getPyramidSlot(snapshot, source);
        const card = slot.card;
        if (!card) {
            throw new Error('Attempted to buy from an empty pyramid slot.');
        }
        slot.card = null;
        return card;
    }
    const reserveSlot = getReserveSlot(getCurrentPlayerState(snapshot), source.slotId);
    const card = reserveSlot.card;
    if (!card) {
        throw new Error('Attempted to buy from an empty reserve slot.');
    }
    reserveSlot.card = null;
    reserveSlot.sourceLevel = null;
    return card;
};

const handleCommand = (snapshot: GameSnapshot, command: GameCommand, ports: EnginePorts) => {
    switch (command.type) {
        case 'SELECT_MODE':
            snapshot.context.mode = command.mode;
            snapshot.context.flags = command.flags;
            pushEvent(snapshot, { type: 'match.modeSelected', mode: command.mode });
            setPhase(snapshot, 'modeSelection');
            return snapshot;
        case 'START_MATCH':
            throw new Error('START_MATCH is handled by runtime bootstrap.');
        case 'TAKE_TOKENS_ADD_POSITION':
            if (!getTakeTokensPendingSelection(snapshot)) {
                startPendingSelection(snapshot, 'gemSelection');
                snapshot.pendingSelection = {
                    action: 'TAKE_TOKENS',
                    selectedPositions: [],
                    maxSelections: 3,
                };
            }
            appendPendingSelectionPosition(snapshot, 'TAKE_TOKENS', command.positionId);
            return snapshot;
        case 'TAKE_TOKENS_CONFIRM': {
            const pendingSelection = getTakeTokensPendingSelection(snapshot);
            if (!pendingSelection) {
                throw new Error('Token selection confirmation requires pending selection state.');
            }
            const positions = [...pendingSelection.selectedPositions];
            snapshot.pendingSelection = null;
            const player = getCurrentPlayerState(snapshot);
            const taken = collectBoardTokens(snapshot, positions);
            for (const entry of taken) {
                player.inventory[entry.token] += 1;
                setBoardToken(snapshot, entry.positionId, null);
            }
            pushEvent(snapshot, {
                type: 'tokens.taken',
                player: snapshot.context.currentPlayer,
                source: 'mandatory',
                positions,
                colors: taken.map((entry) => entry.token),
            });
            const sameColorTake =
                taken.length === 3 && new Set(taken.map((entry) => entry.token)).size === 1;
            const pearlTake = taken.length === 2 && taken.every((entry) => entry.token === 'pearl');
            let updated = snapshot;
            if (sameColorTake || pearlTake) {
                updated = awardPrivilegeWithEffect(
                    updated,
                    ports,
                    nextPlayer(updated.context.currentPlayer),
                    'mandatory_action',
                    'AFTER_TAKE_TOKENS'
                );
            }
            setPhase(updated, 'turnIdle');
            applyTurnState(updated, {
                segment: 'cleanup',
                optionalStep: 'done',
                mandatoryActionTaken: true,
            });
            return continueTurnFlow(updated, ports);
        }
        case 'TAKE_TOKENS_CANCEL':
            snapshot.pendingSelection = null;
            setPhase(snapshot, 'turnIdle');
            return snapshot;
        case 'TAKE_TOKENS': {
            snapshot.pendingSelection = null;
            const player = getCurrentPlayerState(snapshot);
            const taken = collectBoardTokens(snapshot, command.positions);
            for (const entry of taken) {
                player.inventory[entry.token] += 1;
                setBoardToken(snapshot, entry.positionId, null);
            }
            pushEvent(snapshot, {
                type: 'tokens.taken',
                player: snapshot.context.currentPlayer,
                source: 'mandatory',
                positions: command.positions,
                colors: taken.map((entry) => entry.token),
            });
            const sameColorTake =
                taken.length === 3 && new Set(taken.map((entry) => entry.token)).size === 1;
            const pearlTake = taken.length === 2 && taken.every((entry) => entry.token === 'pearl');
            let updated = snapshot;
            if (sameColorTake || pearlTake) {
                updated = awardPrivilegeWithEffect(
                    updated,
                    ports,
                    nextPlayer(updated.context.currentPlayer),
                    'mandatory_action',
                    'AFTER_TAKE_TOKENS'
                );
            }
            setPhase(updated, 'turnIdle');
            applyTurnState(updated, {
                segment: 'cleanup',
                optionalStep: 'done',
                mandatoryActionTaken: true,
            });
            return continueTurnFlow(updated, ports);
        }
        case 'RESERVE_CARD': {
            const player = getCurrentPlayerState(snapshot);
            const reservedCard = removeReserveSourceCard(snapshot, command.source);
            const targetSlot = findFirstEmptyReserveSlot(player);
            if (!targetSlot) {
                throw new Error('Attempted to reserve without an empty reserve slot.');
            }
            targetSlot.card = structuredClone(reservedCard);
            targetSlot.sourceLevel = command.source.level;
            player.inventory.gold += 1;
            setBoardToken(snapshot, command.goldPosition, null);
            pushEvent(snapshot, {
                type: 'card.reserved',
                player: snapshot.context.currentPlayer,
                source: command.source,
                cardId: reservedCard.cardId,
                goldPosition: command.goldPosition,
            });
            if (command.source.kind === 'pyramid') {
                refillPyramidSlot(snapshot, command.source.level, command.source.slot);
            }
            setPhase(snapshot, 'turnIdle');
            applyTurnState(snapshot, {
                segment: 'cleanup',
                optionalStep: 'done',
                mandatoryActionTaken: true,
            });
            return continueTurnFlow(snapshot, ports);
        }
        case 'BUY_CARD': {
            const player = getCurrentPlayerState(snapshot);
            const priced = calculateBuyPayment(snapshot, command.source);
            if (!priced) {
                throw new Error('Attempted to buy from an empty source.');
            }
            const purchasedCard = removeBuySourceCard(snapshot, command.source);
            const payment = priced.payment;
            for (const color of ['blue', 'white', 'green', 'black', 'red', 'pearl'] as const) {
                player.inventory[color] -= payment.paid[color];
            }
            player.inventory.gold -= payment.goldSpent;
            returnTokensToBag(snapshot, payment.paid, payment.goldSpent);
            player.tableau.push(structuredClone(purchasedCard));
            recomputePlayerTotals(player);
            pushEvent(snapshot, {
                type: 'card.bought',
                player: snapshot.context.currentPlayer,
                source: command.source,
                cardId: purchasedCard.cardId,
                bonusColor: purchasedCard.bonusColor,
                goldSpent: payment.goldSpent,
            });
            if (command.source.kind === 'pyramid') {
                refillPyramidSlot(snapshot, command.source.level, command.source.slot);
            }
            setPhase(snapshot, 'turnIdle');
            applyTurnState(snapshot, {
                segment: 'cleanup',
                optionalStep: 'done',
                mandatoryActionTaken: true,
            });
            if (purchasedCard.printedBonusColor === 'gold') {
                return startBonusColorEffect(snapshot, ports, purchasedCard.cardId);
            }
            return continueTurnFlow(
                resolveCardAbility(snapshot, ports, purchasedCard, 'card_ability'),
                ports
            );
        }
        case 'USE_PRIVILEGE_ADD_POSITION':
            if (!getUsePrivilegePendingSelection(snapshot)) {
                startPendingSelection(snapshot, 'privilege');
                snapshot.pendingSelection = {
                    action: 'USE_PRIVILEGE',
                    selectedPositions: [],
                    maxSelections: getPrivilegePositionCap(
                        snapshot,
                        snapshot.context.currentPlayer
                    ),
                };
            }
            appendPendingSelectionPosition(snapshot, 'USE_PRIVILEGE', command.positionId);
            return snapshot;
        case 'USE_PRIVILEGE_CONFIRM': {
            const pendingSelection = getUsePrivilegePendingSelection(snapshot);
            if (!pendingSelection) {
                throw new Error('Privilege confirmation requires pending selection state.');
            }
            const positions = [...pendingSelection.selectedPositions];
            snapshot.pendingSelection = null;
            const player = getCurrentPlayerState(snapshot);
            const taken = collectBoardTokens(snapshot, positions);
            for (const entry of taken) {
                player.inventory[entry.token] += 1;
                setBoardToken(snapshot, entry.positionId, null);
            }
            player.privileges -= getPrivilegeSpendCount(snapshot, player.id, positions.length);
            pushEvent(snapshot, {
                type: 'privilege.used',
                player: snapshot.context.currentPlayer,
                positions,
                spent: getPrivilegeSpendCount(snapshot, player.id, positions.length),
            });
            pushEvent(snapshot, {
                type: 'tokens.taken',
                player: snapshot.context.currentPlayer,
                source: 'privilege',
                positions,
                colors: taken.map((entry) => entry.token),
            });
            setPhase(snapshot, 'turnIdle');
            applyTurnState(snapshot, {
                segment: 'optional',
                optionalStep: 'replenish',
            });
            return snapshot;
        }
        case 'USE_PRIVILEGE_CANCEL':
            snapshot.pendingSelection = null;
            setPhase(snapshot, 'turnIdle');
            return snapshot;
        case 'USE_PRIVILEGE': {
            snapshot.pendingSelection = null;
            const player = getCurrentPlayerState(snapshot);
            const taken = collectBoardTokens(snapshot, command.positions);
            for (const entry of taken) {
                player.inventory[entry.token] += 1;
                setBoardToken(snapshot, entry.positionId, null);
            }
            player.privileges -= getPrivilegeSpendCount(
                snapshot,
                player.id,
                command.positions.length
            );
            pushEvent(snapshot, {
                type: 'privilege.used',
                player: snapshot.context.currentPlayer,
                positions: command.positions,
                spent: getPrivilegeSpendCount(snapshot, player.id, command.positions.length),
            });
            pushEvent(snapshot, {
                type: 'tokens.taken',
                player: snapshot.context.currentPlayer,
                source: 'privilege',
                positions: command.positions,
                colors: taken.map((entry) => entry.token),
            });
            setPhase(snapshot, 'turnIdle');
            applyTurnState(snapshot, {
                segment: 'optional',
                optionalStep: 'replenish',
            });
            return snapshot;
        }
        case 'REPLENISH_BOARD':
            throw new Error('REPLENISH_BOARD is handled by runtime.');
        case 'SELECT_ROYAL': {
            const prompt = getPromptByAtom(snapshot, 'gain_royal');
            const activeEffect = snapshot.activeEffects.find(
                (effect) => effect.atom === 'gain_royal'
            );
            if (!prompt || !activeEffect) {
                throw new Error('Royal selection was invoked without a matching prompt/effect.');
            }
            const selectedIndex = snapshot.royalSupply.findIndex(
                (card) => card.royalId === command.royalId
            );
            if (selectedIndex < 0) {
                throw new Error(`Could not find royal ${command.royalId}.`);
            }
            const [royalCard] = snapshot.royalSupply.splice(selectedIndex, 1);
            if (!royalCard) {
                throw new Error(`Could not splice royal ${command.royalId}.`);
            }
            const player = getCurrentPlayerState(snapshot);
            player.royals.push(structuredClone(royalCard));
            recomputePlayerTotals(player);
            pushEvent(snapshot, {
                type: 'royal.selected',
                player: snapshot.context.currentPlayer,
                royalId: royalCard.royalId,
            });
            removeEffectPrompt(snapshot, prompt.effectId);
            const lifecycleActor = createEffectLifecycleActor(activeEffect);
            const completed = completeEffect(snapshot, lifecycleActor, 'resolved').snapshot;
            return continueTurnFlow(
                resolveCardAbility(completed, ports, royalCard, 'royal_reward'),
                ports
            );
        }
        case 'TAKE_EFFECT_BOARD_TOKEN': {
            const prompt = getPromptByAtom(snapshot, 'take_board_token');
            const activeEffect = snapshot.activeEffects.find(
                (effect) => effect.effectId === command.effectId
            );
            if (!prompt || !activeEffect) {
                throw new Error('Board-token effect was invoked without a matching prompt/effect.');
            }
            const cell = getBoardCell(snapshot, command.positionId);
            if (!cell.token) {
                throw new Error(`Board position ${command.positionId} is empty.`);
            }
            getCurrentPlayerState(snapshot).inventory[cell.token] += 1;
            setBoardToken(snapshot, command.positionId, null);
            pushEvent(snapshot, {
                type: 'tokens.taken',
                player: snapshot.context.currentPlayer,
                source: 'effect',
                positions: [command.positionId],
                colors: [cell.token],
            });
            removeEffectPrompt(snapshot, prompt.effectId);
            const lifecycleActor = createEffectLifecycleActor(activeEffect);
            return continueTurnFlow(
                completeEffect(snapshot, lifecycleActor, 'resolved').snapshot,
                ports
            );
        }
        case 'STEAL_OPPONENT_TOKEN': {
            const prompt = getPromptByAtom(snapshot, 'take_opponent_token');
            const activeEffect = snapshot.activeEffects.find(
                (effect) => effect.effectId === command.effectId
            );
            if (!prompt || !activeEffect) {
                throw new Error('Steal effect was invoked without a matching prompt/effect.');
            }
            snapshot.players[prompt.targetPlayer].inventory[command.color] -= 1;
            getCurrentPlayerState(snapshot).inventory[command.color] += 1;
            pushEvent(snapshot, {
                type: 'tokens.stolen',
                player: snapshot.context.currentPlayer,
                fromPlayer: prompt.targetPlayer,
                color: command.color,
            });
            removeEffectPrompt(snapshot, prompt.effectId);
            const lifecycleActor = createEffectLifecycleActor(activeEffect);
            return continueTurnFlow(
                completeEffect(snapshot, lifecycleActor, 'resolved').snapshot,
                ports
            );
        }
        case 'SELECT_BONUS_COLOR': {
            const prompt = getPromptByAtom(snapshot, 'override_bonus_color');
            const activeEffect = snapshot.activeEffects.find(
                (effect) => effect.effectId === command.effectId
            );
            if (!prompt || !activeEffect) {
                throw new Error('Bonus-color effect was invoked without a matching prompt/effect.');
            }
            const player = getCurrentPlayerState(snapshot);
            const card = player.tableau.find((entry) => entry.cardId === prompt.cardId);
            if (!card) {
                throw new Error(`Could not find tableau card ${prompt.cardId}.`);
            }
            card.bonusColor = command.color;
            recomputePlayerTotals(player);
            pushEvent(snapshot, {
                type: 'card.bonusColorSelected',
                player: snapshot.context.currentPlayer,
                cardId: prompt.cardId,
                color: command.color,
            });
            removeEffectPrompt(snapshot, prompt.effectId);
            const lifecycleActor = createEffectLifecycleActor(activeEffect);
            const completed = completeEffect(snapshot, lifecycleActor, 'resolved').snapshot;
            const completedPlayer = getCurrentPlayerState(completed);
            const completedCard = completedPlayer.tableau.find(
                (entry) => entry.cardId === prompt.cardId
            );
            if (!completedCard) {
                throw new Error(`Could not rehydrate tableau card ${prompt.cardId}.`);
            }
            return continueTurnFlow(
                resolveCardAbility(completed, ports, completedCard, 'card_ability'),
                ports
            );
        }
        case 'DISCARD_TOKEN': {
            const prompt = getPromptByAtom(snapshot, 'discard_to_limit');
            const activeEffect = snapshot.activeEffects.find(
                (effect) => effect.atom === 'discard_to_limit'
            );
            if (!prompt || !activeEffect) {
                throw new Error('Discard effect was invoked without a matching prompt/effect.');
            }
            const player = getCurrentPlayerState(snapshot);
            player.inventory[command.color] -= 1;
            snapshot.hiddenState.bag.push(command.color);
            pushEvent(snapshot, {
                type: 'tokens.discarded',
                player: snapshot.context.currentPlayer,
                color: command.color,
            });
            const remaining = Math.max(
                0,
                ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'].reduce(
                    (sum, color) => sum + player.inventory[color as keyof typeof player.inventory],
                    0
                ) - getGemLimit(snapshot, player.id)
            );
            if (remaining > 0) {
                removeEffectPrompt(snapshot, prompt.effectId);
                snapshot.effectPrompts.unshift({
                    effectId: prompt.effectId,
                    atom: 'discard_to_limit',
                    remaining,
                });
                applyTurnState(snapshot, {
                    segment: 'cleanup',
                    optionalStep: 'done',
                    pendingDiscardCount: remaining,
                });
                return snapshot;
            }
            removeEffectPrompt(snapshot, prompt.effectId);
            applyTurnState(snapshot, {
                segment: 'cleanup',
                optionalStep: 'done',
                pendingDiscardCount: 0,
            });
            const lifecycleActor = createEffectLifecycleActor(activeEffect);
            return continueTurnFlow(
                completeEffect(snapshot, lifecycleActor, 'resolved').snapshot,
                ports
            );
        }
        case 'ENTER_REPLAY':
            snapshot.replayCursor = snapshot.eventLog.length;
            pushEvent(snapshot, { type: 'replay.entered' });
            setPhase(snapshot, 'replay');
            return snapshot;
        case 'EXIT_REPLAY':
            snapshot.replayCursor = null;
            pushEvent(snapshot, { type: 'replay.exited' });
            setPhase(snapshot, 'turnIdle');
            return snapshot;
    }
};

export const executeCommand = (
    snapshot: GameSnapshot,
    command: GameCommand,
    ports: EnginePorts,
    handlers: {
        setupClassicMatch: (snapshot: GameSnapshot, ports: EnginePorts) => GameSnapshot;
        replenishBoard: (snapshot: GameSnapshot, ports: EnginePorts) => GameSnapshot;
    }
) => {
    if (command.type === 'START_MATCH') {
        return handlers.setupClassicMatch(snapshot, ports);
    }
    if (command.type === 'REPLENISH_BOARD') {
        return handlers.replenishBoard(snapshot, ports);
    }
    return handleCommand(snapshot, command, ports);
};

export const validateDispatch = (
    snapshot: GameSnapshot,
    command: GameCommand
): TypedResult<null> => {
    if (!canDispatchCommand(snapshot, command)) {
        return {
            ok: false,
            error: createPhaseGuardError(snapshot, command),
        };
    }
    const payloadError = validateCommandPayload(snapshot, command);
    if (payloadError) {
        return {
            ok: false,
            error: payloadError,
        };
    }
    return {
        ok: true,
        value: null,
    };
};
