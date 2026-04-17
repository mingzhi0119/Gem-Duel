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
    MatchPatchMessageSchema,
    MetaStateSchema,
    PlayerSnapshotSchema,
    ReplayBundleSchema,
    RunContextSchema,
    RunStateSchema,
    RoomDetailSchema,
    SCHEMA_VERSION,
    UiActionDescriptorSchema,
    toPlayerSnapshot,
    toSpectatorSnapshot,
} from '../index';
import { createAuthoritativeSnapshotFixture, createReplayBundleFixture } from './fixtures';

describe('contracts schemas', () => {
    it('accepts a valid deterministic command payload', () => {
        const command = GameCommandSchema.parse({
            type: 'TAKE_TOKENS',
            positions: ['r2c2'],
        });

        expect(command.type).toBe('TAKE_TOKENS');
        expect(SCHEMA_VERSION).toBe('6.0.0');
        expect(ENGINE_VERSION).toBe('2026.04-step7');
    });

    it('projects authoritative snapshots into player-safe snapshots', () => {
        const playerSnapshot = toPlayerSnapshot(createAuthoritativeSnapshotFixture(), 'p1');

        expect(PlayerSnapshotSchema.parse(playerSnapshot).visibility).toBe('player');
        expect(playerSnapshot.viewerReserveSlots).toHaveLength(3);
        expect(playerSnapshot.players.p1.reserveSlots[0]).toMatchObject({
            slotId: 'reserve-1',
            occupied: false,
        });
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
        const snapshot = createAuthoritativeSnapshotFixture();
        const playerSnapshot = toPlayerSnapshot(snapshot, 'p1');
        const spectatorSnapshot = toSpectatorSnapshot(snapshot);
        const action = UiActionDescriptorSchema.parse({
            id: 'begin-gem-selection',
            label: 'Begin Gem Selection',
            command: { type: 'BEGIN_GEM_SELECTION' },
        });

        const replay = ReplayBundleSchema.parse({
            ...createReplayBundleFixture(),
            commands: [envelope],
        });
        const roomDetail = RoomDetailSchema.parse({
            roomId: 'room-1',
            hostPlayer: 'p1',
            playerCount: 1,
            status: 'waiting',
            mode: 'online',
            createdAt: '2026-04-17T17:00:00.000Z',
            snapshot: spectatorSnapshot,
            availableActions: [],
            canJoin: true,
            wsUrl: 'ws://127.0.0.1:8787/ws/rooms/room-1',
        });
        const patch = MatchPatchMessageSchema.parse({
            type: 'match.patch',
            seq: playerSnapshot.sequence,
            snapshot: playerSnapshot,
            availableActions: [action],
        });

        expect(replay.engineVersion).toBe(ENGINE_VERSION);
        expect(roomDetail.availableActions).toEqual([]);
        expect(patch.availableActions[0]?.id).toBe('begin-gem-selection');
    });

    it('parses run and buff contract surfaces', () => {
        const runContext = RunContextSchema.parse({
            runId: 'run-1',
            matchIndex: 1,
            wins: 0,
            losses: 0,
            activeBuffs: [
                {
                    id: 'extortion',
                    owner: 'p1',
                    source: 'starter',
                    acquiredAtMatchIndex: 1,
                    state: {
                        replenishCount: 1,
                    },
                },
            ],
        });
        const runState = RunStateSchema.parse({
            runId: 'run-1',
            seed: 11,
            mode: 'ai',
            matchIndex: 1,
            activeMatchId: 'match-1',
            ownedBuffs: runContext.activeBuffs,
            wins: 0,
            losses: 0,
            status: 'active',
            currentOffer: {
                offerId: 'run-1-starter',
                source: 'starter',
                options: ['extortion', 'down_payment', 'deep_pockets'],
            },
        });
        const metaState = MetaStateSchema.parse({
            profileId: 'local-profile',
            unlockedBuffIds: [
                'privilege_favor',
                'deep_pockets',
                'down_payment',
                'extortion',
                'double_agent',
            ],
            unlockedDifficultyIds: [],
            completedRunIds: [],
            totalRuns: 0,
            lastUpdatedAt: null,
        });

        expect(runState.currentOffer?.options).toHaveLength(3);
        expect(runContext.activeBuffs[0]?.state.replenishCount).toBe(1);
        expect(metaState.unlockedBuffIds).toContain('double_agent');
    });
});
