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
import { createAuthoritativeSnapshotFixture, createReplayBundleFixture } from './fixtures';

describe('contracts schemas', () => {
    it('accepts a valid deterministic command payload', () => {
        const command = GameCommandSchema.parse({
            type: 'TAKE_GEM',
            color: 'blue',
        });

        expect(command.type).toBe('TAKE_GEM');
        expect(SCHEMA_VERSION).toBe('2.0.0');
        expect(ENGINE_VERSION).toBe('2026.04-step2');
    });

    it('projects authoritative snapshots into player-safe snapshots', () => {
        const playerSnapshot = toPlayerSnapshot(createAuthoritativeSnapshotFixture(), 'p1');

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
            ...createReplayBundleFixture(),
            commands: [envelope],
        });

        expect(replay.engineVersion).toBe(ENGINE_VERSION);
    });
});
