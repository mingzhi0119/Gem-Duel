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
    UiViewModelSchema,
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
        const incremental = GameCommandSchema.parse({
            type: 'TAKE_TOKENS_ADD_POSITION',
            positionId: 'r2c2',
        });

        expect(command.type).toBe('TAKE_TOKENS');
        expect(incremental.type).toBe('TAKE_TOKENS_ADD_POSITION');
        expect(SCHEMA_VERSION).toBe('7.0.0');
        expect(ENGINE_VERSION).toBe('2026.04-step8');
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
        const selectionAdded = GameEventSchema.parse({
            type: 'selection.positionAdded',
            action: 'TAKE_TOKENS',
            player: 'p1',
            positionId: 'r2c2',
            positions: ['r2c2'],
        });

        expect(activeEffect.atom).toBe('take_board_token');
        expect(EffectSourceSchema.parse(activeEffect.source)).toBe('card_ability');
        expect(EffectExecutionScopeSchema.parse(activeEffect.scope)).toBe('active_player');
        expect(started).toMatchObject({ type: 'effect.started', stage: 'running' });
        expect(completed).toMatchObject({ type: 'effect.completed', outcome: 'resolved' });
        expect(selectionAdded.type).toBe('selection.positionAdded');
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
            command: { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c2' },
        });
        const snapshot = createAuthoritativeSnapshotFixture();
        const playerSnapshot = toPlayerSnapshot(snapshot, 'p1');
        const spectatorSnapshot = toSpectatorSnapshot(snapshot);
        const action = UiActionDescriptorSchema.parse({
            id: 'take-add-r2c2',
            label: 'Add red at r2c2',
            command: { type: 'TAKE_TOKENS_ADD_POSITION', positionId: 'r2c2' },
        });
        playerSnapshot.pendingSelection = {
            action: 'TAKE_TOKENS',
            selectedPositions: ['r2c2'],
            maxSelections: 3,
        };

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
            roomStatus: 'active',
            availableActions: [action],
        });
        const uiViewModel = UiViewModelSchema.parse({
            title: 'Gem Duel LOCAL Match',
            subtitle: 'Phase: turnIdle | Turn: p1 | Segment: optional',
            viewerRole: 'player',
            seat: 'p1',
            sessionStatus: 'active',
            snapshot: playerSnapshot,
            boardCells: playerSnapshot.board.map((cell) => ({
                positionId: cell.positionId,
                row: cell.row,
                col: cell.col,
                token: cell.token,
                selectable: false,
                selected: false,
                selectionKind: null,
                reason: null,
            })),
            marketSlots: [
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
                    score: 1,
                    crowns: 0,
                    bonusGem: 'red',
                    bonusCount: 1,
                    cost: {
                        blue: 1,
                        white: 0,
                        green: 1,
                        black: 0,
                        red: 1,
                        pearl: 0,
                        gold: 0,
                    },
                    accentColor: 'red',
                    patternKey: 'veins',
                },
            ],
            playerZones: [
                {
                    playerId: 'p1',
                    isViewer: true,
                    isCurrentPlayer: true,
                    actionableSeat: true,
                    score: playerSnapshot.players.p1.score,
                    crowns: playerSnapshot.players.p1.crowns,
                    privileges: playerSnapshot.players.p1.privileges,
                    inventory: playerSnapshot.players.p1.inventory,
                    reserveSlots: playerSnapshot.players.p1.reserveSlots,
                    tableauCount: playerSnapshot.players.p1.tableau.length,
                    royalCount: playerSnapshot.players.p1.royals.length,
                },
                {
                    playerId: 'p2',
                    isViewer: false,
                    isCurrentPlayer: false,
                    actionableSeat: false,
                    score: playerSnapshot.players.p2.score,
                    crowns: playerSnapshot.players.p2.crowns,
                    privileges: playerSnapshot.players.p2.privileges,
                    inventory: playerSnapshot.players.p2.inventory,
                    reserveSlots: playerSnapshot.players.p2.reserveSlots,
                    tableauCount: playerSnapshot.players.p2.tableau.length,
                    royalCount: playerSnapshot.players.p2.royals.length,
                },
            ],
            royalOffers: [
                {
                    royalId: 'royal-sapphire-court',
                    label: 'Sapphire Court',
                    selectable: true,
                    reason: null,
                    score: 3,
                    crowns: 1,
                    accentKey: 'sapphire',
                    patternKey: 'court-dots',
                    tagLabel: 'royal',
                },
            ],
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
            availableActions: [action],
        });

        expect(replay.engineVersion).toBe(ENGINE_VERSION);
        expect(roomDetail.availableActions).toEqual([]);
        expect(patch.availableActions[0]?.id).toBe('take-add-r2c2');
        expect(patch.roomStatus).toBe('active');
        expect(uiViewModel.viewerRole).toBe('player');
        expect(uiViewModel.snapshot.pendingSelection).toMatchObject({
            action: 'TAKE_TOKENS',
            selectedPositions: ['r2c2'],
        });
        expect(uiViewModel.marketSlots[0]).toMatchObject({
            score: 1,
            bonusGem: 'red',
            accentColor: 'red',
            patternKey: 'veins',
        });
        expect(uiViewModel.royalOffers[0]).toMatchObject({
            score: 3,
            crowns: 1,
            accentKey: 'sapphire',
            patternKey: 'court-dots',
        });
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
