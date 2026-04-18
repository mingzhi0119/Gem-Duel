import type { UiActionDescriptor, UiMarketSlot, VisibleSnapshot } from '@gem-duel/contracts';

export const buildMarketSlots = (
    snapshot: VisibleSnapshot,
    availableActions: UiActionDescriptor[]
): UiMarketSlot[] => {
    const buyPyramidRefs = new Set<string>();
    const buyReserveRefs = new Set<string>();
    const reservePyramidRefs = new Set<string>();
    const reserveDeckRefs = new Set<string>();

    for (const action of availableActions) {
        if (action.command.type === 'BUY_CARD') {
            if (action.command.source.kind === 'pyramid') {
                buyPyramidRefs.add(
                    `pyramid-${action.command.source.level}-${action.command.source.slot}`
                );
            } else {
                buyReserveRefs.add(`reserve-${action.command.source.slotId}`);
            }
        }

        if (action.command.type === 'RESERVE_CARD') {
            if (action.command.source.kind === 'pyramid') {
                reservePyramidRefs.add(
                    `pyramid-${action.command.source.level}-${action.command.source.slot}`
                );
            } else {
                reserveDeckRefs.add(`deck-${action.command.source.level}`);
            }
        }
    }

    const slots: UiMarketSlot[] = snapshot.pyramid.flatMap((row) =>
        row.slots.map((slot) => ({
            ref: `pyramid-${row.level}-${slot.slot}`,
            zone: 'pyramid',
            owner: null,
            level: row.level,
            slot: slot.slot,
            slotId: null,
            occupied: slot.card !== null,
            cardId: slot.card?.cardId ?? null,
            selectableAsBuy: buyPyramidRefs.has(`pyramid-${row.level}-${slot.slot}`),
            selectableAsReserve: reservePyramidRefs.has(`pyramid-${row.level}-${slot.slot}`),
            reason: null,
        }))
    );

    for (const ref of [...reserveDeckRefs].sort()) {
        const levelText = ref.split('-')[1];
        const level = levelText ? Number(levelText) : NaN;
        if (level !== 1 && level !== 2 && level !== 3) {
            continue;
        }
        slots.push({
            ref,
            zone: 'deck',
            owner: null,
            level,
            slot: null,
            slotId: null,
            occupied: true,
            cardId: null,
            selectableAsBuy: false,
            selectableAsReserve: true,
            reason: null,
        });
    }

    const ownVisibleReserveSlots =
        snapshot.visibility === 'player'
            ? new Map(snapshot.viewerReserveSlots.map((slot) => [slot.slotId, slot]))
            : new Map();

    for (const playerId of ['p1', 'p2'] as const) {
        for (const reserveSlot of snapshot.players[playerId].reserveSlots) {
            const visibleReserve =
                snapshot.visibility === 'player' && snapshot.viewer === playerId
                    ? (ownVisibleReserveSlots.get(reserveSlot.slotId) ?? null)
                    : null;
            const ref = `reserve-${reserveSlot.slotId}`;
            slots.push({
                ref,
                zone: 'reserve',
                owner: playerId,
                level: visibleReserve?.sourceLevel ?? null,
                slot: null,
                slotId: reserveSlot.slotId,
                occupied: reserveSlot.occupied,
                cardId: visibleReserve?.card?.cardId ?? null,
                selectableAsBuy: buyReserveRefs.has(ref),
                selectableAsReserve: false,
                reason: null,
            });
        }
    }

    return slots;
};
