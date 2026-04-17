import { describe, expect, it } from 'vitest';
import {
    ENGINE_VERSION,
    GameCommandSchema,
    MatchCommandEnvelopeSchema,
    PlayerSnapshotSchema,
    ReplayBundleSchema,
    SCHEMA_VERSION,
    toPlayerSnapshot,
} from '../index';

describe('contracts schemas', () => {
    it('accepts a valid deterministic command payload', () => {
        const command = GameCommandSchema.parse({
            type: 'TAKE_GEM',
            color: 'blue',
        });

        expect(command.type).toBe('TAKE_GEM');
        expect(SCHEMA_VERSION).toBe('2.0.0');
        expect(ENGINE_VERSION).toBe('2026.04-step2-prep');
    });

    it('projects authoritative snapshots into player-safe snapshots', () => {
        const playerSnapshot = toPlayerSnapshot(
            {
                schemaVersion: SCHEMA_VERSION,
                rulesetVersion: '2026.1',
                engineVersion: ENGINE_VERSION,
                visibility: 'authoritative',
                context: {
                    matchId: 'match-1',
                    schemaVersion: SCHEMA_VERSION,
                    rulesetVersion: '2026.1',
                    seed: 7,
                    mode: 'online',
                    phase: 'turnIdle',
                    step: 2,
                    currentPlayer: 'p1',
                    winner: null,
                    flags: {
                        roguelike: false,
                        onlineAuthoritative: true,
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
                sequence: 2,
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
            },
            'p1'
        );

        expect(PlayerSnapshotSchema.parse(playerSnapshot).visibility).toBe('player');
    });

    it('accepts enriched replay and realtime envelopes', () => {
        const envelope = MatchCommandEnvelopeSchema.parse({
            clientCommandId: 'cmd-1',
            expectedSeq: 4,
            issuedBy: 'p1',
            command: { type: 'BEGIN_GEM_SELECTION' },
        });

        const replay = ReplayBundleSchema.parse({
            schemaVersion: SCHEMA_VERSION,
            rulesetVersion: '2026.1',
            engineVersion: ENGINE_VERSION,
            seed: 7,
            initialSnapshot: {
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
            },
            commands: [envelope],
            events: [],
            finalStateHash: 'hash-1',
            resultSummary: {
                winner: null,
                turns: 0,
                finalSeq: 0,
            },
        });

        expect(replay.engineVersion).toBe(ENGINE_VERSION);
    });
});
