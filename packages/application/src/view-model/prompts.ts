import type { GameSnapshot, UiPrompt, VisibleSnapshot } from '@gem-duel/contracts';

type PromptSnapshot = GameSnapshot | VisibleSnapshot;

export const getRoyalPrompt = (snapshot: PromptSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<(typeof snapshot.effectPrompts)[number], { atom: 'gain_royal' }> =>
            prompt.atom === 'gain_royal'
    ) ?? null;

export const getBoardTokenPrompt = (snapshot: PromptSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'take_board_token' }
        > => prompt.atom === 'take_board_token'
    ) ?? null;

export const getOpponentTokenPrompt = (snapshot: PromptSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'take_opponent_token' }
        > => prompt.atom === 'take_opponent_token'
    ) ?? null;

export const getBonusColorPrompt = (snapshot: PromptSnapshot) =>
    snapshot.effectPrompts.find(
        (
            prompt
        ): prompt is Extract<
            (typeof snapshot.effectPrompts)[number],
            { atom: 'override_bonus_color' }
        > => prompt.atom === 'override_bonus_color'
    ) ?? null;

export const buildPromptStack = (snapshot: VisibleSnapshot): UiPrompt[] =>
    snapshot.effectPrompts.map((prompt) => {
        switch (prompt.atom) {
            case 'gain_royal':
                return {
                    effectId: prompt.effectId,
                    atom: prompt.atom,
                    label: 'Select a royal reward',
                    remainingSelections: 1,
                    allowedBoardPositions: [],
                    allowedColors: [],
                    royalIds: [...prompt.royalIds],
                    targetPlayer: null,
                    cardId: null,
                };
            case 'take_board_token':
                return {
                    effectId: prompt.effectId,
                    atom: prompt.atom,
                    label: 'Take a bonus board token',
                    remainingSelections: prompt.count,
                    allowedBoardPositions: snapshot.board
                        .filter(
                            (cell) =>
                                cell.token !== null &&
                                prompt.allowedColors.includes(
                                    cell.token as (typeof prompt.allowedColors)[number]
                                )
                        )
                        .map((cell) => cell.positionId),
                    allowedColors: [...prompt.allowedColors],
                    royalIds: [],
                    targetPlayer: null,
                    cardId: null,
                };
            case 'take_opponent_token':
                return {
                    effectId: prompt.effectId,
                    atom: prompt.atom,
                    label: 'Steal an opponent token',
                    remainingSelections: 1,
                    allowedBoardPositions: [],
                    allowedColors: [...prompt.allowedColors],
                    royalIds: [],
                    targetPlayer: prompt.targetPlayer,
                    cardId: null,
                };
            case 'override_bonus_color':
                return {
                    effectId: prompt.effectId,
                    atom: prompt.atom,
                    label: 'Select a bonus color',
                    remainingSelections: 1,
                    allowedBoardPositions: [],
                    allowedColors: [...prompt.allowedColors],
                    royalIds: [],
                    targetPlayer: null,
                    cardId: prompt.cardId,
                };
            case 'discard_to_limit':
                return {
                    effectId: prompt.effectId,
                    atom: prompt.atom,
                    label: 'Discard down to the gem limit',
                    remainingSelections: prompt.remaining,
                    allowedBoardPositions: [],
                    allowedColors: [],
                    royalIds: [],
                    targetPlayer: null,
                    cardId: null,
                };
        }
    });
