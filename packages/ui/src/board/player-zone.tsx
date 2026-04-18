import type { UiPlayerZone as UiPlayerZoneModel } from '@gem-duel/contracts';
import { ReserveTray } from './reserve-tray';

const inventoryOrder = ['blue', 'white', 'green', 'black', 'red', 'pearl', 'gold'] as const;

export const PlayerZone = ({ zone }: { zone: UiPlayerZoneModel }) => (
    <article
        className={
            zone.actionableSeat
                ? 'gd-player-zone is-actionable'
                : zone.isViewer
                  ? 'gd-player-zone is-viewer'
                  : 'gd-player-zone'
        }
    >
        <div className="gd-player-zone-header">
            <div>
                <strong>{zone.playerId}</strong>
                <p className="gd-muted">
                    {zone.isCurrentPlayer ? 'current turn' : 'waiting'}
                    {zone.isViewer ? ' • viewer seat' : ''}
                </p>
            </div>
            {zone.actionableSeat ? <span className="gd-shell-badge">actionable</span> : null}
        </div>

        <div className="gd-player-metrics">
            <span>Score {zone.score}</span>
            <span>Crowns {zone.crowns}</span>
            <span>Privileges {zone.privileges}</span>
            <span>Royals {zone.royalCount}</span>
            <span>Tableau {zone.tableauCount}</span>
        </div>

        <div className="gd-inventory-grid" aria-label={`${zone.playerId} inventory`}>
            {inventoryOrder.map((color) => (
                <div key={color} className={`gd-token-pill is-${color}`}>
                    <strong>{color}</strong>
                    <span>{zone.inventory[color]}</span>
                </div>
            ))}
        </div>

        <ReserveTray reserveSlots={zone.reserveSlots} />
    </article>
);
