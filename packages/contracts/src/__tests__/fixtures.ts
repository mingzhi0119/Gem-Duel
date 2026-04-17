import {
    createEmptyBoard,
    createHiddenState,
    createPlayerState,
    createTurnState,
} from '@gem-duel/domain';
import { ENGINE_VERSION, SCHEMA_VERSION } from '../shared/enums';
import type { AuthoritativeSnapshot } from '../snapshots';
import type { ReplayBundle } from '../replay';

const createEmptyPyramid = () => [
    {
        level: 1 as const,
        slots: Array.from({ length: 5 }, (_, index) => ({
            level: 1 as const,
            slot: index + 1,
            card: null,
        })),
    },
    {
        level: 2 as const,
        slots: Array.from({ length: 4 }, (_, index) => ({
            level: 2 as const,
            slot: index + 1,
            card: null,
        })),
    },
    {
        level: 3 as const,
        slots: Array.from({ length: 3 }, (_, index) => ({
            level: 3 as const,
            slot: index + 1,
            card: null,
        })),
    },
];

export const createAuthoritativeSnapshotFixture = (): AuthoritativeSnapshot => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: '2026.1',
    engineVersion: ENGINE_VERSION,
    visibility: 'authoritative',
    context: {
        matchId: 'match-1',
        schemaVersion: SCHEMA_VERSION,
        rulesetVersion: '2026.1',
        seed: 7,
        mode: 'local',
        phase: 'turnIdle',
        step: 0,
        currentPlayer: 'p1',
        winner: null,
        victoryReason: null,
        flags: {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        },
        turn: createTurnState(),
    },
    board: createEmptyBoard(),
    pyramid: createEmptyPyramid(),
    royalSupply: [],
    privilegeSupply: 3,
    players: {
        p1: createPlayerState('p1'),
        p2: {
            ...createPlayerState('p2'),
            privileges: 1,
        },
    },
    eventLog: [],
    replayCursor: null,
    sequence: 0,
    activeEffects: [],
    effectPrompts: [],
    hiddenState: createHiddenState(),
});

export const createReplayBundleFixture = (): ReplayBundle => ({
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: '2026.1',
    engineVersion: ENGINE_VERSION,
    seed: 7,
    initialSnapshot: createAuthoritativeSnapshotFixture(),
    commands: [
        {
            clientCommandId: 'cmd-1',
            expectedSeq: 0,
            issuedBy: 'p1',
            command: {
                type: 'BEGIN_GEM_SELECTION',
            },
        },
    ],
    events: [],
    finalStateHash: 'hash-1',
    resultSummary: {
        winner: null,
        reason: null,
        turns: 0,
        finalSeq: 0,
    },
});
