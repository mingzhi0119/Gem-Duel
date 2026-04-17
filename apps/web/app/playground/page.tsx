import type { PlayerSnapshot, UiViewModel } from '@gem-duel/contracts';
import { ENGINE_VERSION, SCHEMA_VERSION } from '@gem-duel/contracts';
import { BoardSceneScaffold, MatchView, SidecarDrawer, TurnHud } from '@gem-duel/ui';

const fixtureSnapshot: PlayerSnapshot = {
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: '2026.1',
    engineVersion: ENGINE_VERSION,
    visibility: 'player',
    viewer: 'p1',
    viewerReserveSlots: [
        { slotId: 'reserve-1', sourceLevel: 1, card: null },
        { slotId: 'reserve-2', sourceLevel: null, card: null },
        { slotId: 'reserve-3', sourceLevel: null, card: null },
    ],
    context: {
        matchId: 'fixture-match',
        schemaVersion: SCHEMA_VERSION,
        rulesetVersion: '2026.1',
        seed: 20260417,
        mode: 'local',
        phase: 'gemSelection',
        step: 12,
        currentPlayer: 'p1',
        winner: null,
        victoryReason: null,
        flags: {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        },
        turn: {
            turnNumber: 3,
            segment: 'mandatory',
            optionalStep: 'done',
            mandatoryActionTaken: false,
            pendingDiscardCount: 0,
        },
    },
    board: [
        { positionId: 'r2c2', row: 2, col: 2, token: 'blue' },
        { positionId: 'r2c3', row: 2, col: 3, token: 'green' },
        { positionId: 'r3c3', row: 3, col: 3, token: 'red' },
        { positionId: 'r3c2', row: 3, col: 2, token: 'white' },
        { positionId: 'r3c1', row: 3, col: 1, token: 'pearl' },
        { positionId: 'r2c1', row: 2, col: 1, token: 'gold' },
    ],
    pyramid: [
        { level: 1, slots: [] },
        { level: 2, slots: [] },
        { level: 3, slots: [] },
    ],
    royalSupply: [],
    privilegeSupply: 2,
    players: {
        p1: {
            id: 'p1',
            score: 6,
            crowns: 2,
            privileges: 1,
            inventory: {
                blue: 1,
                white: 0,
                green: 1,
                black: 0,
                red: 0,
                pearl: 0,
                gold: 0,
            },
            reserveSlots: [
                { slotId: 'reserve-1', occupied: false },
                { slotId: 'reserve-2', occupied: false },
                { slotId: 'reserve-3', occupied: false },
            ],
            tableau: [],
            royals: [],
        },
        p2: {
            id: 'p2',
            score: 4,
            crowns: 1,
            privileges: 0,
            inventory: {
                blue: 0,
                white: 1,
                green: 0,
                black: 1,
                red: 0,
                pearl: 0,
                gold: 0,
            },
            reserveSlots: [
                { slotId: 'reserve-1', occupied: true },
                { slotId: 'reserve-2', occupied: false },
                { slotId: 'reserve-3', occupied: false },
            ],
            tableau: [],
            royals: [],
        },
    },
    eventLog: [{ type: 'phase.changed', phase: 'gemSelection' }],
    replayCursor: null,
    sequence: 12,
    runContext: null,
    activeEffects: [],
    effectPrompts: [],
    pendingSelection: {
        action: 'TAKE_TOKENS',
        selectedPositions: ['r2c2'],
        maxSelections: 3,
    },
};

const fixtureViewModel: UiViewModel = {
    title: 'Gem Duel Static Playground',
    subtitle: 'Phase 2.5 fixture scene with package-owned styles and a static board scaffold.',
    viewerRole: 'player',
    seat: 'p1',
    sessionStatus: 'active',
    snapshot: fixtureSnapshot,
    boardCells: fixtureSnapshot.board.map((cell) => ({
        ...cell,
        selectable: ['r2c3', 'r3c3'].includes(cell.positionId),
        selected: cell.positionId === 'r2c2',
        selectionKind:
            cell.positionId === 'r2c2' || ['r2c3', 'r3c3'].includes(cell.positionId)
                ? 'mandatory'
                : null,
        reason: null,
    })),
    marketSlots: [],
    playerZones: [
        {
            playerId: 'p1',
            isViewer: true,
            isCurrentPlayer: true,
            actionableSeat: true,
            score: 6,
            crowns: 2,
            privileges: 1,
            inventory: fixtureSnapshot.players.p1.inventory,
            reserveSlots: fixtureSnapshot.players.p1.reserveSlots,
            tableauCount: 0,
            royalCount: 0,
        },
        {
            playerId: 'p2',
            isViewer: false,
            isCurrentPlayer: false,
            actionableSeat: false,
            score: 4,
            crowns: 1,
            privileges: 0,
            inventory: fixtureSnapshot.players.p2.inventory,
            reserveSlots: fixtureSnapshot.players.p2.reserveSlots,
            tableauCount: 0,
            royalCount: 0,
        },
    ],
    royalOffers: [],
    promptStack: [],
    selectionDraft: {
        model: 'pending-command',
        commandType: 'TAKE_TOKENS',
        effectId: null,
        selectedBoardPositions: ['r2c2'],
        goldPosition: null,
        remainingSelections: 2,
    },
    runPanel: null,
    availableActions: [
        {
            id: 'take-add-r2c3',
            label: 'Add green at r2c3',
            command: { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c3' },
        },
        {
            id: 'take-confirm',
            label: 'Confirm Token Selection',
            command: { type: 'TAKE_TOKENS_CONFIRM' },
        },
        {
            id: 'take-cancel',
            label: 'Cancel Token Selection',
            command: { type: 'TAKE_TOKENS_CANCEL' },
        },
    ],
};

export default function PlaygroundPage() {
    return (
        <>
            <MatchView
                viewModel={fixtureViewModel}
                emptyActionLabel="Static fixture scene"
                note={
                    <p className="gd-muted">
                        ZH: 该页面不启动 live engine session。 EN: This page renders a static
                        fixture scene without booting a live engine session.
                    </p>
                }
            />
            <SidecarDrawer title="Turn HUD">
                <TurnHud viewModel={fixtureViewModel} />
            </SidecarDrawer>
            <BoardSceneScaffold viewModel={fixtureViewModel} />
        </>
    );
}
