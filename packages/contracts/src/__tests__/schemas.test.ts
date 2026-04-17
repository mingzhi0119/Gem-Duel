import { describe, expect, it } from 'vitest';
import {
    ActiveEffectSchema,
    ENGINE_VERSION,
    EffectExecutionScopeSchema,
    EffectLifecycleStageSchema,
    EffectOutcomeSchema,
    EffectSourceSchema,
    GameEventSchema,
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
        expect(SCHEMA_VERSION).toBe('4.0.0');
        expect(ENGINE_VERSION).toBe('2026.04-step3');
    });

    it('projects authoritative snapshots into player-safe snapshots', () => {
        const playerSnapshot = toPlayerSnapshot(createAuthoritativeSnapshotFixture(), 'p1');

        expect(PlayerSnapshotSchema.parse(playerSnapshot).visibility).toBe('player');
    });

    it('parses frozen effect lifecycle contracts', () => {
        const activeEffect = ActiveEffectSchema.parse({
            effectId: 'effect-1',
            parentEffectId: null,
            atom: 'take_board_token',
            hookPoint: 'AFTER_BUY_CARD',
            source: 'card_ability',
            scope: 'active_player',
            owner: 'p1',
            sequence: 2,
            stage: 'scheduled',
            rngNamespace: 'match/turn-1/effect-1',
        });
        const started = GameEventSchema.parse({
            type: 'effect.started',
            effectId: 'effect-1',
            atom: 'take_board_token',
            sequence: 2,
            stage: 'running',
        });
        const completed = GameEventSchema.parse({
            type: 'effect.completed',
            effectId: 'effect-1',
            atom: 'take_board_token',
            sequence: 2,
            stage: 'completed',
            outcome: 'resolved',
        });

        expect(activeEffect.atom).toBe('take_board_token');
        expect(EffectSourceSchema.parse(activeEffect.source)).toBe('card_ability');
        expect(EffectExecutionScopeSchema.parse(activeEffect.scope)).toBe('active_player');
        expect(started).toMatchObject({ type: 'effect.started', stage: 'running' });
        expect(completed).toMatchObject({ type: 'effect.completed', outcome: 'resolved' });
        if (started.type === 'effect.started') {
            expect(EffectLifecycleStageSchema.parse(started.stage)).toBe('running');
        }
        if (completed.type === 'effect.completed') {
            expect(EffectOutcomeSchema.parse(completed.outcome)).toBe('resolved');
        }
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
