import type { UiViewModel } from '@gem-duel/contracts';
import { BoardGrid } from './board-grid';
import { MarketStack } from './market-stack';
import { PlayerZone } from './player-zone';
import { PromptBanner } from './prompt-banner';
import { RoyalCourt } from './royal-court';
import { RunPanel } from './run-panel';
import { SelectionOverlay } from './selection-overlay';

export const BoardSceneScaffold = ({ viewModel }: { viewModel: UiViewModel }) => (
    <section className="gd-board-scaffold" data-testid="board-scaffold">
        <div className="gd-board-header">
            <div>
                <strong>Board Scaffold</strong>
                <p className="gd-muted">
                    Phase 3 shared primitives fed only by `UiViewModel` fixture/projection data.
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
                <MarketStack slots={viewModel.marketSlots} />
            </section>

            <section className="gd-scaffold-region">
                <div className="gd-section-header">
                    <h3>Board</h3>
                    <span className="gd-muted">{viewModel.boardCells.length} cells</span>
                </div>
                <BoardGrid cells={viewModel.boardCells} label="Board scaffold" />
            </section>

            <section className="gd-scaffold-region">
                <div className="gd-section-header">
                    <h3>Players</h3>
                    <span className="gd-muted">{viewModel.playerZones.length} zones</span>
                </div>
                <div className="gd-player-zone-grid">
                    {viewModel.playerZones.map((player) => (
                        <PlayerZone key={player.playerId} zone={player} />
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
                    <div className="gd-sidecar-stack">
                        {viewModel.royalOffers.length > 0 ? (
                            <RoyalCourt offers={viewModel.royalOffers} />
                        ) : null}
                        {viewModel.promptStack.length > 0 ? (
                            <PromptBanner prompts={viewModel.promptStack} />
                        ) : null}
                        {viewModel.selectionDraft ? (
                            <SelectionOverlay selectionDraft={viewModel.selectionDraft} />
                        ) : null}
                        {viewModel.runPanel ? <RunPanel runPanel={viewModel.runPanel} /> : null}
                    </div>
                </section>
            )}
        </div>
    </section>
);
