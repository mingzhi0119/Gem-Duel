import type { ReactNode } from 'react';
import type { UiPlayerZone, UiViewModel } from '@gem-duel/contracts';
import { CrownIcon, ShieldIcon, TrophyIcon } from '../primitives/arena-icons';

const SCORE_GOAL = 20;
const CROWN_GOAL = 10;

const formatSeatName = (playerId: UiPlayerZone['playerId']) => playerId.toUpperCase();

export interface ArenaActionCounter {
    current: number;
    total: number;
    noteKey: 'observer' | 'waiting' | 'selection' | 'prompt' | 'optional' | 'available' | 'settled';
    remaining: number | null;
    optionalStep: UiViewModel['snapshot']['context']['turn']['optionalStep'] | null;
}

export const getArenaActionCounter = (viewModel: UiViewModel): ArenaActionCounter => {
    const viewerZone = viewModel.playerZones.find((zone) => zone.isViewer) ?? null;
    const current = viewerZone?.actionableSeat ? 1 : 0;

    if (
        viewModel.viewerRole === 'spectator' ||
        viewModel.sessionStatus === 'replay' ||
        !viewerZone
    ) {
        return {
            current,
            total: 1,
            noteKey: 'observer',
            remaining: null,
            optionalStep: null,
        };
    }

    if (!viewerZone.isCurrentPlayer) {
        return {
            current,
            total: 1,
            noteKey: 'waiting',
            remaining: null,
            optionalStep: null,
        };
    }

    if (viewModel.selectionDraft?.remainingSelections != null) {
        return {
            current,
            total: 1,
            noteKey: 'selection',
            remaining: viewModel.selectionDraft.remainingSelections,
            optionalStep: null,
        };
    }

    if (viewModel.promptStack[0]?.remainingSelections != null) {
        return {
            current,
            total: 1,
            noteKey: 'prompt',
            remaining: viewModel.promptStack[0].remainingSelections,
            optionalStep: null,
        };
    }

    if (!viewModel.snapshot.context.turn.mandatoryActionTaken) {
        return {
            current,
            total: 1,
            noteKey: 'available',
            remaining: null,
            optionalStep: null,
        };
    }

    if (viewModel.snapshot.context.turn.optionalStep !== 'done') {
        return {
            current,
            total: 1,
            noteKey: 'optional',
            remaining: null,
            optionalStep: viewModel.snapshot.context.turn.optionalStep,
        };
    }

    return {
        current,
        total: 1,
        noteKey: 'settled',
        remaining: null,
        optionalStep: null,
    };
};

const StatusMetric = ({
    icon,
    value,
    goal,
    testId,
}: {
    icon: ReactNode;
    value: number;
    goal: number;
    testId: string;
}) => (
    <span className="gd-arena-status-metric" data-testid={testId}>
        {icon}
        <strong>{value}</strong>
        <small>/{goal}</small>
    </span>
);

const TurnSeat = ({ zone, mirrored = false }: { zone: UiPlayerZone; mirrored?: boolean }) => (
    <div
        className={mirrored ? 'gd-arena-seat is-mirrored' : 'gd-arena-seat'}
        data-testid={`turn-seat-${zone.playerId}`}
    >
        {mirrored ? (
            <>
                <StatusMetric
                    icon={<CrownIcon className="gd-arena-status-icon is-gold" />}
                    value={zone.crowns}
                    goal={CROWN_GOAL}
                    testId={`turn-seat-${zone.playerId}-crowns`}
                />
                <StatusMetric
                    icon={<TrophyIcon className="gd-arena-status-icon" />}
                    value={zone.score}
                    goal={SCORE_GOAL}
                    testId={`turn-seat-${zone.playerId}-score`}
                />
            </>
        ) : null}

        <span className="gd-arena-seat-id">
            <ShieldIcon className="gd-arena-seat-icon" />
            <strong>{formatSeatName(zone.playerId)}</strong>
        </span>

        {!mirrored ? (
            <>
                <StatusMetric
                    icon={<TrophyIcon className="gd-arena-status-icon" />}
                    value={zone.score}
                    goal={SCORE_GOAL}
                    testId={`turn-seat-${zone.playerId}-score`}
                />
                <StatusMetric
                    icon={<CrownIcon className="gd-arena-status-icon is-gold" />}
                    value={zone.crowns}
                    goal={CROWN_GOAL}
                    testId={`turn-seat-${zone.playerId}-crowns`}
                />
            </>
        ) : null}
    </div>
);

export const TurnHud = ({ viewModel }: { viewModel: UiViewModel }) => {
    const zones = viewModel.playerZones;
    const leftSeat = zones[0] ?? null;
    const rightSeat = zones[1] ?? null;
    const currentSeat = formatSeatName(viewModel.snapshot.context.currentPlayer);
    const currentPrompt = viewModel.promptStack[0]?.label ?? null;

    return (
        <div className="gd-turn-hud" data-testid="turn-hud">
            {leftSeat ? <TurnSeat zone={leftSeat} /> : <span aria-hidden="true" />}

            <div className="gd-arena-turn-box">
                <span className="gd-arena-turn-value">
                    TURN {viewModel.snapshot.context.turn.turnNumber}
                </span>
                <span className="gd-arena-turn-meta">
                    {currentPrompt ?? `${currentSeat} • ${viewModel.snapshot.context.phase}`}
                </span>
            </div>

            {rightSeat ? <TurnSeat zone={rightSeat} mirrored /> : <span aria-hidden="true" />}
        </div>
    );
};
