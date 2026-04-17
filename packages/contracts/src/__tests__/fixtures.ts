import { ENGINE_VERSION, SCHEMA_VERSION } from '../shared/enums';
import type { AuthoritativeSnapshot } from '../snapshots';
import type { ReplayBundle } from '../replay';

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
        flags: {
            roguelike: false,
            onlineAuthoritative: false,
            aiEnabled: false,
        },
    },
    gemBank: {
        blue: 4,
        white: 4,
        green: 4,
        black: 4,
        red: 4,
        pearl: 2,
        gold: 3,
    },
    players: {
        p1: {
            id: 'p1',
            score: 0,
            crowns: 0,
            privileges: 0,
            reservedCards: 0,
            tableauCards: 0,
            inventory: {
                blue: 0,
                white: 0,
                green: 0,
                black: 0,
                red: 0,
                pearl: 0,
                gold: 0,
            },
        },
        p2: {
            id: 'p2',
            score: 0,
            crowns: 0,
            privileges: 1,
            reservedCards: 0,
            tableauCards: 0,
            inventory: {
                blue: 0,
                white: 0,
                green: 0,
                black: 0,
                red: 0,
                pearl: 0,
                gold: 0,
            },
        },
    },
    eventLog: [],
    replayCursor: null,
    sequence: 0,
    pendingEffects: [],
    hiddenState: {
        bag: [],
        deckOrder: {
            level1: [],
            level2: [],
            level3: [],
        },
        extraTurns: {
            p1: 0,
            p2: 0,
        },
    },
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
        turns: 0,
        finalSeq: 0,
    },
});
