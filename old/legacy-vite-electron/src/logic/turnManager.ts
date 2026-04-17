/**
 * Turn Manager
 *
 * Handles turn transitions and end-of-turn checks.
 * Manages win conditions, royal card milestones, and gem capacity rules.
 */

import { BONUS_COLORS, GAME_PHASES } from '../constants';
import { GameState, PlayerKey, GemColor } from '../types';

// Helper to grant random basic gems (duplicate logic from marketActions, maybe move to utils? keeping for now)
const grantRandomBasicGems = (state: GameState, player: PlayerKey, count: number) => {
    const basics: GemColor[] = ['red', 'green', 'blue', 'white', 'black'];
    for (let i = 0; i < count; i++) {
        const randColor = basics[Math.floor(Math.random() * basics.length)];
        state.inventories[player][randColor]++;
        if (!state.extraAllocation) {
            state.extraAllocation = {
                p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
                p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
            };
        }
        state.extraAllocation[player][randColor]++;
        // addFeedback doesn't exist here, manually adding if possible or skip feedback
    }
};

/**
 * Finalize current player's turn and check for:
 * - Win conditions (points, crowns, single color)
 * - Royal card milestones
 * - Gem capacity violations
 *
 * Then transition to next player or game phase.
 *
 * @param state - Current game state (modified in place by Immer)
 * @param nextPlayer - Player ID for next turn
 * @param instantInv - Optional inventory to check (for gem count validation)
 */
export const finalizeTurn = (
    state: GameState,
    nextPlayer: PlayerKey,
    instantInv?: Record<GemColor | 'gold' | 'pearl', number>
): void => {
    // ========== TRACK PLAYER TURN COUNTS INITIALIZATION ==========
    if (!state.playerTurnCounts) {
        state.playerTurnCounts = { p1: 0, p2: 0 };
    }

    // Helper: Calculate player's total points
    const getPoints = (pid: PlayerKey): number => {
        const cardPointsCorrect = state.playerTableau[pid].reduce((a, c) => a + c.points, 0);
        const royalPointsCorrect = state.playerRoyals[pid].reduce((a, c) => a + c.points, 0);
        const extra = state.extraPoints ? state.extraPoints[pid] : 0;
        const buffBonus =
            state.playerBuffs && state.playerBuffs[pid].effects?.passive?.pointBonus
                ? (state.playerTableau[pid].length + state.playerRoyals[pid].length) *
                  state.playerBuffs[pid].effects.passive.pointBonus
                : 0;
        return cardPointsCorrect + royalPointsCorrect + extra + buffBonus;
    };
    // Helper: Calculate player's total crowns
    const getCrowns = (pid: PlayerKey): number => {
        const cardCrowns = [...state.playerTableau[pid], ...state.playerRoyals[pid]].reduce(
            (a, c) => a + (c.crowns || 0),
            0
        );
        const extra = state.extraCrowns ? state.extraCrowns[pid] : 0;
        return cardCrowns + extra;
    };

    // Helper: Get points from a specific color in tableau
    const getColorPoints = (pid: PlayerKey, color: GemColor): number => {
        return state.playerTableau[pid]
            .filter((c) => c.bonusColor === color && !c.isBuff) // ✅ 排除虚拟卡
            .reduce((a, c) => a + c.points, 0);
    };

    const isWinning = (pid: PlayerKey): boolean => {
        const winFX = state.playerBuffs?.[pid]?.effects?.winCondition || {};
        const pPoints = getPoints(pid);
        const pCrowns = getCrowns(pid);

        // Standard goal is 20, but Collector needs 22
        const pPointsGoal = winFX.points || 20;
        const pCrownsGoal = winFX.crowns || 10;
        const pSingleColorGoal = winFX.singleColor || 10;
        const pDisableSingleColor = winFX.disableSingleColor || false;

        if (pPoints >= pPointsGoal) return true;
        if (pCrowns >= pCrownsGoal) return true;

        if (!pDisableSingleColor) {
            for (const color of BONUS_COLORS) {
                if (getColorPoints(pid, color) >= pSingleColorGoal) return true;
            }
        }
        return false;
    };

    // Check both players (current first, then opponent)
    if (isWinning(state.turn)) {
        state.winner = state.turn;
        state.phase = GAME_PHASES.IDLE; // Close any open pickers
        return;
    }
    const opponent: PlayerKey = state.turn === 'p1' ? 'p2' : 'p1';
    if (isWinning(opponent)) {
        state.winner = opponent;
        state.phase = GAME_PHASES.IDLE; // Close any open pickers
        return;
    }

    // ========== BUFF EFFECTS: Hoarder ==========
    const nextBuffEffect = state.playerBuffs?.[nextPlayer]?.effects?.passive;
    if (nextBuffEffect?.hoarderBonus && state.playerReserved[nextPlayer].length === 3) {
        grantRandomBasicGems(state, nextPlayer, 1);
        state.toastMessage = `Hoarder: +1 Gem for ${nextPlayer === 'p1' ? 'Player 1' : 'Player 2'}!`;
    }

    // ========== BUFF EFFECTS: Royal Envoy ==========
    // Trigger royal card selection on the 5th major action of the player
    const currentBuffObj = state.playerBuffs?.[state.turn];
    // Check for 4 because we haven't incremented yet (it's the end of their 5th turn)
    if (currentBuffObj?.id === 'royal_envoy' && state.playerTurnCounts[state.turn] === 4) {
        if (state.royalDeck.length > 0) {
            state.phase = GAME_PHASES.SELECT_ROYAL;
            state.nextPlayerAfterRoyal = nextPlayer;
            state.toastMessage = 'Royal Envoy: Pick a Royal Card!';
            // Ensure we don't trigger this again if they enter discard phase later?
            // Actually playerTurnCounts will still be 4.
            // We should probably mark this buff as used.
            if (!currentBuffObj.state) currentBuffObj.state = {};
            if (!currentBuffObj.state.envoyTriggered) {
                currentBuffObj.state.envoyTriggered = true;
                return;
            }
        }
    }

    // ========== ROYAL MILESTONE CHECKS ==========
    const crowns = getCrowns(state.turn);
    const milestones = state.royalMilestones[state.turn];

    // Check if player reached 3 or 6 crowns milestone
    if ((crowns >= 3 && !milestones[3]) || (crowns >= 6 && !milestones[6])) {
        if (state.royalDeck.length > 0) {
            const milestoneHit = crowns >= 6 && !milestones[6] ? 6 : 3;
            state.royalMilestones[state.turn][milestoneHit] = true;
            state.phase = GAME_PHASES.SELECT_ROYAL;
            state.nextPlayerAfterRoyal = nextPlayer;
            return;
        }
    }

    // ========== GEM CAPACITY CHECK ==========
    const invToCheck = instantInv || state.inventories[state.turn];
    const totalGems = Object.values(invToCheck).reduce((a, b) => a + b, 0);

    // Dynamic gem cap (some buffs increase it to 11 or 12)
    const gemCap = state.playerBuffs?.[state.turn]?.effects?.passive?.gemCap || 10;

    if (totalGems > gemCap) {
        // Enter discard phase, don't switch turn yet
        state.phase = GAME_PHASES.DISCARD_EXCESS_GEMS;
        if (!state.nextPlayerAfterRoyal) {
            state.nextPlayerAfterRoyal = nextPlayer;
        }
        return;
    }

    // ========== BUFF EFFECTS: Desperate Gamble (Periodic Privilege) ==========
    const nextBuffObj = state.playerBuffs?.[nextPlayer];
    if (nextBuffObj?.id === 'desperate_gamble') {
        const nextTurnNumber = state.playerTurnCounts[nextPlayer] + 1;
        if (nextTurnNumber % 2 === 0) {
            if (!state.extraPrivileges) state.extraPrivileges = { p1: 0, p2: 0 };
            if (state.extraPrivileges[nextPlayer] < 1) {
                state.extraPrivileges[nextPlayer] = 1;
                state.toastMessage = `Desperate Gamble: Gained Special Privilege for Turn ${nextTurnNumber}!`;
            }
        }
    }

    // ========== NORMAL TURN TRANSITION ==========
    state.playerTurnCounts[state.turn]++; // Increment completed turn count
    state.turn = nextPlayer;
    state.phase = GAME_PHASES.IDLE;
    state.nextPlayerAfterRoyal = null;
};
