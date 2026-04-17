import type { GameSnapshot, PlayerSnapshot, SpectatorSnapshot } from '@gem-duel/contracts';

type SnapshotSummaryModel = GameSnapshot | PlayerSnapshot | SpectatorSnapshot;

export const SnapshotSummary = ({ snapshot }: { snapshot: SnapshotSummaryModel }) => (
    <div className="gd-grid">
        <div className="gd-card">
            <strong>Phase</strong>
            <span>{snapshot.context.phase}</span>
        </div>
        <div className="gd-card">
            <strong>Current Player</strong>
            <span>{snapshot.context.currentPlayer}</span>
        </div>
        <div className="gd-card">
            <strong>Seed</strong>
            <span>{snapshot.context.seed}</span>
        </div>
        <div className="gd-card">
            <strong>Winner</strong>
            <span>{snapshot.context.winner ?? 'pending'}</span>
        </div>
        <div className="gd-card">
            <strong>Run</strong>
            <span>
                {snapshot.runContext
                    ? `${snapshot.runContext.matchIndex} | ${snapshot.runContext.activeBuffs.length} buff(s)`
                    : 'classic'}
            </span>
        </div>
    </div>
);
