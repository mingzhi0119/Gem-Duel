import type { UiPlayerZone as UiPlayerZoneModel } from '@gem-duel/contracts';
import { ReserveTray } from './reserve-tray';

const inventoryOrder = ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'] as const;
const inventoryLabels = {
    blue: 'Blue',
    white: 'White',
    green: 'Green',
    black: 'Black',
    red: 'Red',
    pearl: 'Pearl',
    gold: 'Gold',
} as const;

export const PlayerZone = ({ zone }: { zone: UiPlayerZoneModel }) => (
    <article
        className={
            zone.actionableSeat
                ? 'gd-player-zone is-actionable'
                : zone.isViewer
                  ? 'gd-player-zone is-viewer'
                  : 'gd-player-zone'
        }
        data-testid={`player-zone-${zone.playerId}`}
    >
        <div className="gd-player-zone-topline">
            <div className="gd-player-zone-identity">
                <div className="gd-seat-avatar" aria-hidden="true">
                    {zone.playerId.toUpperCase()}
                </div>

                <div className="gd-player-zone-title-block">
                    <div className="gd-player-zone-header">
                        <strong>{zone.playerId.toUpperCase()}</strong>
                        {zone.actionableSeat ? (
                            <span className="gd-shell-badge">actionable</span>
                        ) : null}
                    </div>
                    <p className="gd-muted">
                        {zone.isCurrentPlayer ? 'current turn' : 'waiting'}
                        {zone.isViewer ? ' • viewer seat' : ''}
                    </p>
                </div>
            </div>

            <div
                className="gd-player-zone-score-strip"
                aria-label={`${zone.playerId} score summary`}
            >
                <div className="gd-player-zone-score-pill">
                    <span className="gd-player-zone-score-label">VP</span>
                    <strong>{zone.score}</strong>
                </div>
                <div className="gd-player-zone-score-pill">
                    <span className="gd-player-zone-score-label">Crowns</span>
                    <strong>{zone.crowns}</strong>
                </div>
                <div className="gd-player-zone-score-pill">
                    <span className="gd-player-zone-score-label">Privileges</span>
                    <strong>{zone.privileges}</strong>
                </div>
            </div>
        </div>

        <div className="gd-player-zone-stage">
            <section className="gd-player-zone-bank">
                <div className="gd-player-zone-subhead">
                    <strong>Token bank</strong>
                    <span className="gd-muted">7 colors tracked</span>
                </div>

                <div className="gd-player-token-bank" aria-label={`${zone.playerId} inventory`}>
                    {inventoryOrder.map((color) => (
                        <div key={color} className={`gd-player-token-chip is-${color}`}>
                            <div className="gd-player-token-chip-top">
                                <span className="gd-player-token-swatch" aria-hidden="true" />
                                <strong className="gd-player-token-value">
                                    {zone.inventory[color]}
                                </strong>
                            </div>
                            <span className="gd-player-token-label">{inventoryLabels[color]}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="gd-player-zone-assets">
                <ReserveTray reserveSlots={zone.reserveSlots} />

                <div className="gd-player-zone-asset-grid">
                    <div className="gd-player-zone-asset-card">
                        <span className="gd-player-zone-asset-label">Royals</span>
                        <strong className="gd-player-zone-asset-value">{zone.royalCount}</strong>
                        <span className="gd-muted">court cards held</span>
                    </div>
                    <div className="gd-player-zone-asset-card">
                        <span className="gd-player-zone-asset-label">Tableau</span>
                        <strong className="gd-player-zone-asset-value">{zone.tableauCount}</strong>
                        <span className="gd-muted">purchased cards</span>
                    </div>
                    <div className="gd-player-zone-asset-card">
                        <span className="gd-player-zone-asset-label">Seat</span>
                        <strong className="gd-player-zone-asset-value">
                            {zone.playerId.toUpperCase()}
                        </strong>
                        <span className="gd-muted">
                            {zone.isViewer ? 'viewer-controlled' : 'shared table'}
                        </span>
                    </div>
                </div>
            </section>
        </div>
    </article>
);
