import type { UiRunPanel as UiRunPanelModel } from '@gem-duel/contracts';

export const RunPanel = ({ runPanel }: { runPanel: UiRunPanelModel | null }) =>
    runPanel ? (
        <section className="gd-run-panel">
            <div className="gd-section-header">
                <div>
                    <strong>Run #{runPanel.matchIndex}</strong>
                    <p className="gd-muted">{runPanel.runId}</p>
                </div>
                <span className="gd-shell-badge">
                    {runPanel.wins}W / {runPanel.losses}L
                </span>
            </div>

            <div className="gd-chip-row" aria-label="Active buffs">
                {runPanel.activeBuffIds.map((buffId) => (
                    <span key={buffId} className="gd-chip">
                        {buffId}
                    </span>
                ))}
            </div>
        </section>
    ) : (
        <p className="gd-muted">No run metadata in this scene.</p>
    );
