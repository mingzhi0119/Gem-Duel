import type { UiViewModel } from '@gem-duel/contracts';

const tokenClassByColor = {
    blue: 'is-blue',
    white: 'is-white',
    green: 'is-green',
    black: 'is-black',
    red: 'is-red',
    pearl: 'is-pearl',
    gold: 'is-gold',
} as const;

export const BoardSceneScaffold = ({ viewModel }: { viewModel: UiViewModel }) => (
    <section className="gd-board-scaffold" data-testid="board-scaffold">
        <div className="gd-board-header">
            <div>
                <strong>Board Scaffold</strong>
                <p className="gd-muted">
                    Phase 2.5 static scene fed only by `UiViewModel` fixture/projection data.
                </p>
            </div>
            <span className="gd-shell-badge">{viewModel.sessionStatus}</span>
        </div>
        <div className="gd-scaffold-stack">
            <section className="gd-scaffold-region">
                <div className="gd-section-header">
                    <h3>Market</h3>
                    <span className="gd-muted">{viewModel.marketSlots.length} slots</span>
                </div>
                <div className="gd-market-grid">
                    {viewModel.marketSlots.length > 0 ? (
                        viewModel.marketSlots.map((slot) => {
                            const marketClass = slot.selectableAsBuy
                                ? 'gd-market-slot is-buyable'
                                : slot.selectableAsReserve
                                  ? 'gd-market-slot is-reservable'
                                  : 'gd-market-slot';
                            return (
                                <article key={slot.ref} className={marketClass}>
                                    <span className="gd-muted">{slot.zone}</span>
                                    <strong>{slot.cardId ?? 'hidden / empty'}</strong>
                                    <span>
                                        {slot.level ? `L${slot.level}` : 'no level'}
                                        {slot.slot ? ` • slot ${slot.slot}` : ''}
                                    </span>
                                </article>
                            );
                        })
                    ) : (
                        <p className="gd-muted">No market fixture slots in this scene.</p>
                    )}
                </div>
            </section>

            <section className="gd-scaffold-region">
                <div className="gd-section-header">
                    <h3>Board</h3>
                    <span className="gd-muted">{viewModel.boardCells.length} cells</span>
                </div>
                <div className="gd-board-grid" aria-label="Board scaffold">
                    {viewModel.boardCells.map((cell) => {
                        const tokenClass = cell.token ? tokenClassByColor[cell.token] : 'is-empty';
                        const stateClass = cell.selected
                            ? 'gd-board-cell is-selected'
                            : cell.selectable
                              ? 'gd-board-cell is-selectable'
                              : 'gd-board-cell';
                        return (
                            <div
                                key={cell.positionId}
                                className={`${stateClass} ${tokenClass}`}
                                data-position-id={cell.positionId}
                            >
                                <span className="gd-board-pos">{cell.positionId}</span>
                                <strong>{cell.token ?? 'empty'}</strong>
                                <span>{cell.selectionKind ?? 'idle'}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="gd-scaffold-region">
                <div className="gd-section-header">
                    <h3>Players</h3>
                    <span className="gd-muted">{viewModel.playerZones.length} zones</span>
                </div>
                <div className="gd-player-zone-grid">
                    {viewModel.playerZones.map((player) => (
                        <article
                            key={player.playerId}
                            className={
                                player.actionableSeat
                                    ? 'gd-player-zone is-actionable'
                                    : player.isViewer
                                      ? 'gd-player-zone is-viewer'
                                      : 'gd-player-zone'
                            }
                        >
                            <div className="gd-section-header">
                                <strong>{player.playerId}</strong>
                                <span className="gd-muted">
                                    {player.isCurrentPlayer ? 'current turn' : 'waiting'}
                                </span>
                            </div>
                            <div className="gd-player-metrics">
                                <span>Score {player.score}</span>
                                <span>Crowns {player.crowns}</span>
                                <span>Privileges {player.privileges}</span>
                                <span>
                                    Reserve{' '}
                                    {player.reserveSlots.filter((slot) => slot.occupied).length}/3
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {(viewModel.royalOffers.length > 0 ||
                viewModel.promptStack.length > 0 ||
                viewModel.selectionDraft !== null ||
                viewModel.runPanel !== null) && (
                <section className="gd-scaffold-region">
                    <div className="gd-section-header">
                        <h3>Prompt and Sidecar Data</h3>
                        <span className="gd-muted">Fixture-only scaffold</span>
                    </div>

                    {viewModel.royalOffers.length > 0 ? (
                        <div className="gd-royal-grid">
                            {viewModel.royalOffers.map((offer) => (
                                <article
                                    key={offer.royalId}
                                    className={
                                        offer.selectable
                                            ? 'gd-royal-offer is-selectable'
                                            : 'gd-royal-offer'
                                    }
                                >
                                    <strong>{offer.label}</strong>
                                    <span>{offer.royalId}</span>
                                </article>
                            ))}
                        </div>
                    ) : null}

                    {viewModel.promptStack.length > 0 ? (
                        <div className="gd-prompt-list">
                            {viewModel.promptStack.map((prompt) => (
                                <article key={prompt.effectId} className="gd-prompt-card">
                                    <strong>{prompt.label}</strong>
                                    <span>{prompt.atom}</span>
                                    <span>
                                        {prompt.remainingSelections !== null
                                            ? `${prompt.remainingSelections} remaining`
                                            : 'open-ended'}
                                    </span>
                                </article>
                            ))}
                        </div>
                    ) : null}

                    {viewModel.selectionDraft ? (
                        <div className="gd-selection-chip">
                            <strong>{viewModel.selectionDraft.commandType}</strong>
                            <span>
                                {viewModel.selectionDraft.selectedBoardPositions.length} selected
                                {viewModel.selectionDraft.remainingSelections !== null
                                    ? ` • ${viewModel.selectionDraft.remainingSelections} remaining`
                                    : ''}
                            </span>
                        </div>
                    ) : null}

                    {viewModel.runPanel ? (
                        <div className="gd-run-chip">
                            <strong>Run #{viewModel.runPanel.matchIndex}</strong>
                            <span>
                                {viewModel.runPanel.wins}W / {viewModel.runPanel.losses}L
                            </span>
                            <span>{viewModel.runPanel.activeBuffIds.join(', ')}</span>
                        </div>
                    ) : null}
                </section>
            )}
        </div>
    </section>
);
