import type { ReactNode } from 'react';
import type {
    PlayerSnapshot,
    SpectatorSnapshot,
    UiMarketSlot,
    UiPrompt,
    UiRoyalOffer,
    UiRunPanel,
    UiSelectionDraft,
    UiViewModel,
} from '@gem-duel/contracts';
import { ENGINE_VERSION, SCHEMA_VERSION } from '@gem-duel/contracts';
import { Section } from '@gem-duel/ui';

type VisibleFixtureSnapshot = PlayerSnapshot | SpectatorSnapshot;
type GemColor = NonNullable<PlayerSnapshot['board'][number]['token']>;

const PLAYGROUND_BOARD_POSITION_IDS = [
    'r0c0',
    'r0c1',
    'r0c2',
    'r0c3',
    'r0c4',
    'r1c0',
    'r1c1',
    'r1c2',
    'r1c3',
    'r1c4',
    'r2c0',
    'r2c1',
    'r2c2',
    'r2c3',
    'r2c4',
    'r3c0',
    'r3c1',
    'r3c2',
    'r3c3',
    'r3c4',
    'r4c0',
    'r4c1',
    'r4c2',
    'r4c3',
    'r4c4',
] as const;

type BoardPositionId = (typeof PLAYGROUND_BOARD_POSITION_IDS)[number];

export interface PlaygroundSceneDefinition {
    id: string;
    shortLabel: string;
    eyebrow: string;
    title: string;
    summary: string;
    viewModel: UiViewModel;
    note?: ReactNode;
    sidecarTitle?: string;
    sidecar?: ReactNode;
    extraPanels?: ReactNode;
}

const tokenMap = {
    r0c0: 'blue',
    r0c1: 'white',
    r0c2: 'green',
    r0c3: 'black',
    r0c4: 'red',
    r1c0: 'pearl',
    r1c1: 'gold',
    r1c2: 'blue',
    r1c3: 'green',
    r1c4: 'red',
    r2c0: 'white',
    r2c1: 'gold',
    r2c2: 'blue',
    r2c3: 'green',
    r2c4: 'black',
    r3c0: 'red',
    r3c1: 'pearl',
    r3c2: 'white',
    r3c3: 'red',
    r3c4: 'green',
    r4c0: 'blue',
    r4c1: 'white',
    r4c2: 'gold',
    r4c3: 'black',
    r4c4: 'pearl',
} satisfies Partial<Record<BoardPositionId, GemColor>>;

const selectionMarketSlots: UiMarketSlot[] = [
    {
        ref: 'pyramid-l1-s1',
        zone: 'pyramid',
        owner: null,
        level: 1,
        slot: 1,
        slotId: null,
        occupied: true,
        cardId: 'l1-ruby-merchant',
        selectableAsBuy: true,
        selectableAsReserve: true,
        reason: null,
    },
    {
        ref: 'pyramid-l1-s2',
        zone: 'pyramid',
        owner: null,
        level: 1,
        slot: 2,
        slotId: null,
        occupied: true,
        cardId: 'l1-pearl-carver',
        selectableAsBuy: false,
        selectableAsReserve: true,
        reason: null,
    },
    {
        ref: 'pyramid-l2-s1',
        zone: 'pyramid',
        owner: null,
        level: 2,
        slot: 1,
        slotId: null,
        occupied: true,
        cardId: 'l2-royal-envoy',
        selectableAsBuy: false,
        selectableAsReserve: false,
        reason: 'Need more gems',
    },
    {
        ref: 'reserve-p2-1',
        zone: 'reserve',
        owner: 'p2',
        level: null,
        slot: null,
        slotId: 'reserve-1',
        occupied: true,
        cardId: null,
        selectableAsBuy: false,
        selectableAsReserve: false,
        reason: 'Opponent reserve remains hidden to this viewer',
    },
];

const runMarketSlots: UiMarketSlot[] = [
    ...selectionMarketSlots,
    {
        ref: 'deck-l3',
        zone: 'deck',
        owner: null,
        level: 3,
        slot: null,
        slotId: null,
        occupied: true,
        cardId: 'deck-top-hidden',
        selectableAsBuy: false,
        selectableAsReserve: true,
        reason: null,
    },
];

const selectionRoyalOffers: UiRoyalOffer[] = [
    {
        royalId: 'royal-sapphire-court',
        label: 'Sapphire Court',
        selectable: true,
        reason: null,
    },
    {
        royalId: 'royal-ivory-audience',
        label: 'Ivory Audience',
        selectable: false,
        reason: 'Need one more crown',
    },
];

const runPromptStack: UiPrompt[] = [
    {
        effectId: 'effect-bonus-token',
        atom: 'take_board_token',
        label: 'Take one bonus token from the highlighted positions.',
        remainingSelections: 1,
        allowedBoardPositions: ['r1c1', 'r1c2', 'r1c3'],
        allowedColors: [],
        royalIds: [],
        targetPlayer: null,
        cardId: 'l2-royal-envoy',
    },
    {
        effectId: 'effect-royal-choice',
        atom: 'gain_royal',
        label: 'Choose one royal reward.',
        remainingSelections: 1,
        allowedBoardPositions: [],
        allowedColors: [],
        royalIds: ['royal-sapphire-court', 'royal-ivory-audience'],
        targetPlayer: null,
        cardId: null,
    },
];

const runPanel: UiRunPanel = {
    runId: 'run-20260417',
    matchIndex: 3,
    wins: 2,
    losses: 0,
    activeBuffIds: ['deep_pockets', 'double_agent'],
};

const parsePositionId = (positionId: BoardPositionId) => {
    const [, row, col] = /r(\d)c(\d)/.exec(positionId) ?? ['r0c0', '0', '0'];
    return {
        row: Number(row),
        col: Number(col),
    };
};

const createBoard = (): PlayerSnapshot['board'] =>
    PLAYGROUND_BOARD_POSITION_IDS.map((positionId) => ({
        positionId,
        ...parsePositionId(positionId),
        token: tokenMap[positionId] ?? null,
    }));

const basePlayers = {
    p1: {
        id: 'p1' as const,
        score: 8,
        crowns: 2,
        privileges: 1,
        inventory: {
            blue: 2,
            white: 1,
            green: 1,
            black: 0,
            red: 1,
            pearl: 0,
            gold: 0,
        },
        reserveSlots: [
            { slotId: 'reserve-1' as const, occupied: true },
            { slotId: 'reserve-2' as const, occupied: false },
            { slotId: 'reserve-3' as const, occupied: false },
        ],
        tableau: [],
        royals: [],
    },
    p2: {
        id: 'p2' as const,
        score: 6,
        crowns: 1,
        privileges: 0,
        inventory: {
            blue: 0,
            white: 2,
            green: 0,
            black: 2,
            red: 0,
            pearl: 1,
            gold: 0,
        },
        reserveSlots: [
            { slotId: 'reserve-1' as const, occupied: true },
            { slotId: 'reserve-2' as const, occupied: true },
            { slotId: 'reserve-3' as const, occupied: false },
        ],
        tableau: [],
        royals: [],
    },
};

const viewerReserveSlots: PlayerSnapshot['viewerReserveSlots'] = [
    { slotId: 'reserve-1' as const, sourceLevel: 2, card: null },
    { slotId: 'reserve-2' as const, sourceLevel: null, card: null },
    { slotId: 'reserve-3' as const, sourceLevel: null, card: null },
];

const createPlayerSnapshot = ({
    phase,
    currentPlayer,
    step,
    mode = 'local' as const,
    pendingSelection = null,
    runContext = null,
    winner = null,
    victoryReason = null,
}: {
    phase: PlayerSnapshot['context']['phase'];
    currentPlayer: PlayerSnapshot['context']['currentPlayer'];
    step: number;
    mode?: PlayerSnapshot['context']['mode'];
    pendingSelection?: PlayerSnapshot['pendingSelection'];
    runContext?: PlayerSnapshot['runContext'];
    winner?: PlayerSnapshot['context']['winner'];
    victoryReason?: PlayerSnapshot['context']['victoryReason'];
}): PlayerSnapshot => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: '2026.1',
    engineVersion: ENGINE_VERSION,
    visibility: 'player' as const,
    viewer: 'p1' as const,
    viewerReserveSlots,
    context: {
        matchId: 'fixture-match',
        schemaVersion: SCHEMA_VERSION,
        rulesetVersion: '2026.1',
        seed: 20260417,
        mode,
        phase,
        step,
        currentPlayer,
        winner,
        victoryReason,
        flags: {
            roguelike: runContext !== null,
            onlineAuthoritative: mode === 'online',
            aiEnabled: mode === 'ai',
        },
        turn: {
            turnNumber: 5,
            segment: 'mandatory',
            optionalStep: 'done',
            mandatoryActionTaken: false,
            pendingDiscardCount: 0,
        },
    },
    board: createBoard(),
    pyramid: [
        { level: 1 as const, slots: [] },
        { level: 2 as const, slots: [] },
        { level: 3 as const, slots: [] },
    ],
    royalSupply: [],
    privilegeSupply: 1,
    players: basePlayers,
    eventLog: [{ type: 'phase.changed' as const, phase }],
    replayCursor: null,
    sequence: step,
    runContext,
    activeEffects: [],
    effectPrompts: [],
    pendingSelection,
});

const createSpectatorSnapshot = (base: PlayerSnapshot): SpectatorSnapshot => ({
    schemaVersion: base.schemaVersion,
    rulesetVersion: base.rulesetVersion,
    engineVersion: base.engineVersion,
    visibility: 'spectator',
    context: {
        ...base.context,
        mode: 'online',
    },
    board: base.board,
    pyramid: base.pyramid,
    royalSupply: base.royalSupply,
    privilegeSupply: base.privilegeSupply,
    players: base.players,
    eventLog: base.eventLog,
    replayCursor: base.replayCursor,
    sequence: base.sequence,
    runContext: base.runContext,
    activeEffects: base.activeEffects,
    effectPrompts: base.effectPrompts,
    pendingSelection: base.pendingSelection,
});

const createBoardCells = ({
    snapshot,
    selectablePositions = [],
    selectedPositions = [],
    selectionKind = 'mandatory' as const,
}: {
    snapshot: VisibleFixtureSnapshot;
    selectablePositions?: BoardPositionId[];
    selectedPositions?: BoardPositionId[];
    selectionKind?: UiViewModel['boardCells'][number]['selectionKind'];
}) =>
    snapshot.board.map((cell) => ({
        ...cell,
        selectable: selectablePositions.includes(cell.positionId),
        selected: selectedPositions.includes(cell.positionId),
        selectionKind:
            selectablePositions.includes(cell.positionId) ||
            selectedPositions.includes(cell.positionId)
                ? selectionKind
                : null,
        reason: null,
    }));

const createPlayerZones = ({
    snapshot,
    viewerRole,
    seat,
}: {
    snapshot: VisibleFixtureSnapshot;
    viewerRole: UiViewModel['viewerRole'];
    seat: UiViewModel['seat'];
}) =>
    (['p1', 'p2'] as const).map((playerId) => {
        const player = snapshot.players[playerId];
        return {
            playerId,
            isViewer: seat === playerId,
            isCurrentPlayer: snapshot.context.currentPlayer === playerId,
            actionableSeat:
                viewerRole === 'player' &&
                seat === playerId &&
                snapshot.context.currentPlayer === playerId &&
                snapshot.context.winner === null,
            score: player.score,
            crowns: player.crowns,
            privileges: player.privileges,
            inventory: player.inventory,
            reserveSlots: player.reserveSlots,
            tableauCount: player.tableau.length,
            royalCount: player.royals.length,
        };
    });

const createViewModel = ({
    title,
    subtitle,
    viewerRole,
    seat,
    sessionStatus,
    snapshot,
    selectablePositions = [],
    selectedPositions = [],
    selectionKind = 'mandatory' as const,
    marketSlots = selectionMarketSlots,
    royalOffers = [],
    promptStack = [],
    selectionDraft = null,
    runPanel = null,
    availableActions = [],
}: {
    title: string;
    subtitle: string;
    viewerRole: UiViewModel['viewerRole'];
    seat: UiViewModel['seat'];
    sessionStatus: UiViewModel['sessionStatus'];
    snapshot: VisibleFixtureSnapshot;
    selectablePositions?: BoardPositionId[];
    selectedPositions?: BoardPositionId[];
    selectionKind?: UiViewModel['boardCells'][number]['selectionKind'];
    marketSlots?: UiMarketSlot[];
    royalOffers?: UiRoyalOffer[];
    promptStack?: UiPrompt[];
    selectionDraft?: UiSelectionDraft | null;
    runPanel?: UiRunPanel | null;
    availableActions?: UiViewModel['availableActions'];
}): UiViewModel => ({
    title,
    subtitle,
    viewerRole,
    seat,
    sessionStatus,
    snapshot,
    boardCells: createBoardCells({
        snapshot,
        selectablePositions,
        selectedPositions,
        selectionKind,
    }),
    marketSlots,
    playerZones: createPlayerZones({ snapshot, viewerRole, seat }),
    royalOffers,
    promptStack,
    selectionDraft,
    runPanel,
    availableActions,
});

const selectionSnapshot = createPlayerSnapshot({
    phase: 'gemSelection',
    currentPlayer: 'p1',
    step: 12,
    pendingSelection: {
        action: 'TAKE_TOKENS',
        selectedPositions: ['r2c2'],
        maxSelections: 3,
    },
});

const spectatorSnapshot = createSpectatorSnapshot(
    createPlayerSnapshot({
        phase: 'turnIdle',
        currentPlayer: 'p2',
        step: 27,
        mode: 'online',
    })
);

const runSnapshot = createPlayerSnapshot({
    phase: 'buying',
    currentPlayer: 'p1',
    step: 41,
    mode: 'local',
    runContext: {
        runId: 'run-20260417',
        matchIndex: 3,
        wins: 2,
        losses: 0,
        activeBuffs: [
            {
                id: 'deep_pockets',
                owner: 'p1',
                source: 'starter',
                acquiredAtMatchIndex: 1,
                state: {},
            },
            {
                id: 'double_agent',
                owner: 'p1',
                source: 'reward',
                acquiredAtMatchIndex: 2,
                state: {},
            },
        ],
    },
});

const terminalSnapshot = createPlayerSnapshot({
    phase: 'terminal',
    currentPlayer: 'p1',
    step: 63,
    winner: 'p1',
    victoryReason: 'points',
});

export const PLAYGROUND_SCENES: PlaygroundSceneDefinition[] = [
    {
        id: 'classic-selection',
        shortLabel: 'Selection',
        eyebrow: 'Classic Local',
        title: 'Pending Selection Surface',
        summary:
            'Engine-owned pending selection drives board highlights, actions, and sidecar notes without page-local draft state.',
        viewModel: createViewModel({
            title: 'Classic Turn - Pending Token Selection',
            subtitle:
                'Static player-turn scene for Phase 2 pending-selection projection and early board-region scaffolding.',
            viewerRole: 'player',
            seat: 'p1',
            sessionStatus: 'active',
            snapshot: selectionSnapshot,
            selectablePositions: ['r2c3', 'r3c3'],
            selectedPositions: ['r2c2'],
            selectionKind: 'mandatory',
            royalOffers: selectionRoyalOffers,
            selectionDraft: {
                model: 'pending-command',
                commandType: 'TAKE_TOKENS',
                effectId: null,
                selectedBoardPositions: ['r2c2'],
                goldPosition: null,
                remainingSelections: 2,
            },
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
        }),
        note: (
            <p className="gd-muted">
                ZH: 用来校验 pending-selection command surface。 EN: Used to verify the
                pending-selection command surface.
            </p>
        ),
        sidecarTitle: 'Selection Notes',
        sidecar: (
            <p className="gd-muted">
                Highlighted cells, available actions, and the selection draft all come from the
                projected `UiViewModel`, not from page-local interaction state.
            </p>
        ),
    },
    {
        id: 'spectator-resync',
        shortLabel: 'Spectator',
        eyebrow: 'Online Spectator',
        title: 'Spectator and Resync Placeholder',
        summary:
            'Static spectator-facing scene used to keep Phase 2.5 honest about non-player shells before Phase 6 lands.',
        viewModel: createViewModel({
            title: 'Room Spectator - Resyncing',
            subtitle:
                'Spectator fixture with zero actions and hidden-opponent reserve semantics preserved in the market scaffold.',
            viewerRole: 'spectator',
            seat: null,
            sessionStatus: 'resyncing',
            snapshot: spectatorSnapshot,
            marketSlots: selectionMarketSlots,
        }),
        note: (
            <p className="gd-muted">
                ZH: spectator 场景先在 visual harness 中占位。 EN: The spectator shape already has a
                visual-harness placeholder before the online board lands.
            </p>
        ),
        sidecarTitle: 'Resync Notes',
        sidecar: (
            <p className="gd-muted">
                This scene intentionally leaves `availableActions` empty and keeps opponent reserve
                `cardId` hidden in the fixture market slots.
            </p>
        ),
        extraPanels: (
            <Section title="Visibility Reminder">
                <p className="gd-muted">
                    Phase 6 will attach property tests on top of this viewer shape. Phase 2.5 only
                    gives it a stable visual host.
                </p>
            </Section>
        ),
    },
    {
        id: 'run-sidecar',
        shortLabel: 'Run',
        eyebrow: 'Roguelike Run',
        title: 'Run Sidecar and Prompt Stack',
        summary:
            'Static run-flavored scene with buff metadata, prompt stack scaffolding, and richer market fixtures for future Phase 3 primitives.',
        viewModel: createViewModel({
            title: 'Run Match - Prompt Heavy Midgame',
            subtitle:
                'Static run fixture combining run panel data, prompt stack projection, and a richer market/deck surface.',
            viewerRole: 'player',
            seat: 'p1',
            sessionStatus: 'active',
            snapshot: runSnapshot,
            selectablePositions: ['r1c1', 'r1c2', 'r1c3'],
            selectedPositions: ['r1c2'],
            selectionKind: 'effect',
            marketSlots: runMarketSlots,
            royalOffers: selectionRoyalOffers,
            promptStack: runPromptStack,
            selectionDraft: {
                model: 'engine-prompt',
                commandType: 'TAKE_EFFECT_BOARD_TOKEN',
                effectId: 'effect-bonus-token',
                selectedBoardPositions: ['r1c2'],
                goldPosition: null,
                remainingSelections: 1,
            },
            runPanel,
            availableActions: [
                {
                    id: 'effect-board-r1c3',
                    label: 'Take bonus token at r1c3',
                    command: {
                        type: 'TAKE_EFFECT_BOARD_TOKEN',
                        effectId: 'effect-bonus-token',
                        positionId: 'r1c3',
                    },
                },
            ],
        }),
        note: (
            <p className="gd-muted">
                ZH: 该场景专门给 Phase 3 的 PromptBanner / RunPanel / MarketStack 提供静态 组合面。
                EN: This scene gives PromptBanner / RunPanel / MarketStack work a static combined
                host.
            </p>
        ),
        sidecarTitle: 'Run Notes',
        sidecar: (
            <div className="gd-scene-stack">
                <p className="gd-muted">
                    Active buffs are fixture data only here, but the shape matches the additive
                    Phase 2 `UiRunPanel` contract.
                </p>
                <div className="gd-run-chip">
                    <strong>Buff Focus</strong>
                    <span>deep_pockets</span>
                    <span>double_agent</span>
                </div>
            </div>
        ),
    },
    {
        id: 'terminal-victory',
        shortLabel: 'Terminal',
        eyebrow: 'Terminal State',
        title: 'Completed Match Overlay Host',
        summary:
            'Completed-state fixture that keeps Phase 4/6 overlay work grounded before the real terminal board exists.',
        viewModel: createViewModel({
            title: 'Classic Match - Victory Snapshot',
            subtitle:
                'Terminal fixture scene for completed-match overlay and readonly board composition work.',
            viewerRole: 'player',
            seat: 'p1',
            sessionStatus: 'completed',
            snapshot: terminalSnapshot,
            marketSlots: selectionMarketSlots.map((slot) => ({
                ...slot,
                selectableAsBuy: false,
                selectableAsReserve: false,
            })),
        }),
        note: (
            <p className="gd-muted">
                ZH: terminal 场景为后续 overlay 提供视觉基线。 EN: This terminal scene gives later
                overlay work a visual baseline.
            </p>
        ),
        sidecarTitle: 'Outcome Notes',
        sidecar: (
            <div className="gd-scene-stack">
                <p className="gd-muted">
                    Winner: {terminalSnapshot.context.winner} by{' '}
                    {terminalSnapshot.context.victoryReason}.
                </p>
                <div className="gd-selection-chip">
                    <strong>Readonly</strong>
                    <span>No further actions are exposed in the completed fixture.</span>
                </div>
            </div>
        ),
    },
];

export const getPlaygroundScene = (sceneId: string) =>
    PLAYGROUND_SCENES.find((scene) => scene.id === sceneId) ?? null;
