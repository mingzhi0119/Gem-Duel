import { GameState } from '../types';

/**
 * Generates a simple checksum (hash) for the game state.
 * This is used to detect desynchronization between clients in online mode.
 */
export const generateGameStateHash = (state: GameState | null): string => {
    if (!state) return 'null';

    // Extract only critical sync-relevant fields to avoid noise from UI state
    // We sort keys to ensure deterministic stringification
    const criticalState = {
        board: state.board.map((row) => row.map((cell) => cell.type.id)), // Only check gem types, not UIDs if they differ
        turn: state.turn,
        phase: state.phase,
        mode: state.mode,
        inventories: state.inventories,
        privileges: state.privileges,
        playerTableau: {
            p1: state.playerTableau.p1.map((c) => c.id).sort(),
            p2: state.playerTableau.p2.map((c) => c.id).sort(),
        },
        playerReserved: {
            p1: state.playerReserved.p1.map((c) => c.id).sort(),
            p2: state.playerReserved.p2.map((c) => c.id).sort(),
        },
        market: {
            1: state.market[1].map((c) => c?.id || 'null'),
            2: state.market[2].map((c) => c?.id || 'null'),
            3: state.market[3].map((c) => c?.id || 'null'),
        },
        royalMilestones: state.royalMilestones,
        extraPoints: state.extraPoints,
        extraCrowns: state.extraCrowns,
        playerBuffs: {
            p1: state.playerBuffs.p1?.id,
            p2: state.playerBuffs.p2?.id,
        },
        playerTurnCounts: state.playerTurnCounts,
    };

    const jsonString = JSON.stringify(criticalState);

    // Simple DJB2 hash
    let hash = 5381;
    for (let i = 0; i < jsonString.length; i++) {
        hash = (hash * 33) ^ jsonString.charCodeAt(i);
    }

    return (hash >>> 0).toString(16); // Convert to unsigned hex
};
