import type { VisibleSnapshot } from '@gem-duel/contracts';

export const TerminalOverlay = ({
    snapshot,
    currentFinalStateHash,
}: {
    snapshot: VisibleSnapshot;
    currentFinalStateHash: string;
}) => (
    <div className="gd-terminal-overlay" data-testid="terminal-overlay">
        <div className="gd-terminal-overlay-card">
            <p className="gd-scene-eyebrow">Match Complete</p>
            <h2>Local match finished</h2>
            <p className="gd-muted">
                Winner: <strong>{snapshot.context.winner ?? 'unknown'}</strong>
                {' • '}
                Reason: <strong>{snapshot.context.victoryReason ?? 'none'}</strong>
            </p>
            <p className="gd-muted">
                Current finalStateHash:{' '}
                <code data-testid="terminal-final-state-hash">{currentFinalStateHash}</code>
            </p>
        </div>
    </div>
);
