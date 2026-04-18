import type {
    UiActionDescriptor,
    UiPlayerZone,
    UiRoyalOffer,
    VisibleSnapshot,
} from '@gem-duel/contracts';

export const buildPlayerZones = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[]
): UiPlayerZone[] =>
    (['p1', 'p2'] as const).map((playerId) => {
        const player = snapshot.players[playerId];
        const isViewer = snapshot.visibility === 'player' && snapshot.viewer === playerId;
        return {
            playerId,
            isViewer,
            isCurrentPlayer: snapshot.context.currentPlayer === playerId,
            actionableSeat: isViewer && availableActions.length > 0,
            score: player.score,
            crowns: player.crowns,
            privileges: player.privileges,
            inventory: structuredClone(player.inventory),
            reserveSlots: structuredClone(player.reserveSlots),
            tableauCount: player.tableau.length,
            royalCount: player.royals.length,
        };
    });

export const buildRoyalOffers = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[]
): UiRoyalOffer[] => {
    const selectableRoyalIds = new Set(
        availableActions.flatMap((action) =>
            action.command.type === 'SELECT_ROYAL' ? [action.command.royalId] : []
        )
    );

    return snapshot.royalSupply.map((royal) => ({
        royalId: royal.royalId,
        label: royal.label,
        selectable: selectableRoyalIds.has(royal.royalId),
        reason: null,
    }));
};
