import type { UiMarketSlot, UiPlayerZone as UiPlayerZoneModel } from '@gem-duel/contracts';
import { CrownIcon, GemIcon, ShieldIcon } from '../primitives/arena-icons';

const inventoryOrder = ['red', 'green', 'blue', 'white', 'black', 'pearl', 'gold'] as const;

const ReserveSlot = ({
    slot,
    onBuy,
    disabled = false,
    locale = 'en',
}: {
    slot: UiMarketSlot;
    onBuy?: (slot: UiMarketSlot) => void;
    disabled?: boolean;
    locale?: 'en' | 'zh';
}) => {
    const content = (
        <>
            <span className="gd-arena-dashboard-slot-label">
                {slot.cardId
                    ? `L${slot.level ?? '?'}`
                    : slot.occupied
                      ? locale === 'zh'
                          ? '已持有'
                          : 'held'
                      : locale === 'zh'
                        ? '空位'
                        : 'empty'}
            </span>
            <strong className="gd-arena-dashboard-slot-value">
                {slot.cardId
                    ? slot.cardId
                    : slot.occupied
                      ? locale === 'zh'
                          ? '预留'
                          : 'Reserved'
                      : locale === 'zh'
                        ? '开放'
                        : 'Open'}
            </strong>
        </>
    );

    return onBuy ? (
        <button
            type="button"
            className="gd-arena-dashboard-slot"
            data-testid={`player-zone-reserve-${slot.ref}`}
            disabled={disabled}
            onClick={() => onBuy(slot)}
        >
            {content}
        </button>
    ) : (
        <div className="gd-arena-dashboard-slot" data-testid={`player-zone-reserve-${slot.ref}`}>
            {content}
        </div>
    );
};

export const PlayerZone = ({
    zone,
    reserveMarketSlots = [],
    onBuyReserveSlot,
    isReserveBuyDisabled,
    locale = 'en',
}: {
    zone: UiPlayerZoneModel;
    reserveMarketSlots?: UiMarketSlot[];
    onBuyReserveSlot?: (slot: UiMarketSlot) => void;
    isReserveBuyDisabled?: (slot: UiMarketSlot) => boolean;
    locale?: 'en' | 'zh';
}) => {
    const orderedReserveSlots =
        reserveMarketSlots.length > 0
            ? reserveMarketSlots
            : zone.reserveSlots.map((slot) => ({
                  ref: `${zone.playerId}-${slot.slotId}`,
                  zone: 'reserve' as const,
                  owner: zone.playerId,
                  level: null,
                  slot: null,
                  slotId: slot.slotId,
                  occupied: slot.occupied,
                  cardId: null,
                  selectableAsBuy: false,
                  selectableAsReserve: false,
                  reason: null,
                  score: null,
                  crowns: null,
                  bonusGem: null,
                  bonusCount: null,
                  cost: null,
                  accentColor: null,
                  patternKey: null,
              }));

    return (
        <article
            className="gd-player-zone"
            data-testid={`player-zone-${zone.playerId}`}
            data-gd-player={zone.playerId}
        >
            <div className="gd-arena-dashboard-head">
                <div className="gd-arena-dashboard-id">
                    <span className="gd-seat-avatar" aria-hidden="true">
                        <ShieldIcon className="gd-arena-seat-icon" />
                    </span>
                    <div className="gd-arena-dashboard-id-copy">
                        <strong>{zone.playerId.toUpperCase()}</strong>
                        <span className="gd-muted">
                            {zone.isCurrentPlayer
                                ? locale === 'zh'
                                    ? '当前行动位'
                                    : 'active seat'
                                : locale === 'zh'
                                  ? '等待中'
                                  : 'waiting seat'}
                            {zone.isViewer ? (locale === 'zh' ? ' • 视角座位' : ' • viewer') : ''}
                        </span>
                    </div>
                </div>
                <div className="gd-arena-dashboard-meta">
                    <span className="gd-arena-dashboard-meta-item">
                        <CrownIcon className="gd-arena-status-icon is-gold" />
                        <strong>{zone.royalCount}</strong>
                    </span>
                    <span className="gd-arena-dashboard-meta-item">
                        <strong>{zone.tableauCount}</strong>
                        <small>tableau</small>
                    </span>
                </div>
            </div>

            <div className="gd-arena-dashboard-body">
                <div className="gd-arena-dashboard-gems" aria-label={`${zone.playerId} inventory`}>
                    {inventoryOrder.map((color) => (
                        <span key={color} className={`gd-arena-dashboard-gem is-${color}`}>
                            <GemIcon color={color} className="gd-arena-dashboard-gem-icon" />
                            <strong>{zone.inventory[color]}</strong>
                        </span>
                    ))}
                </div>

                <div className="gd-arena-dashboard-sections">
                    <section className="gd-arena-dashboard-panel">
                        <span className="gd-arena-dashboard-panel-label">
                            {locale === 'zh' ? '预留卡' : 'Reserve Cards'}
                        </span>
                        <div className="gd-arena-dashboard-slot-grid">
                            {orderedReserveSlots.map((slot) => (
                                <ReserveSlot
                                    key={slot.ref}
                                    slot={slot}
                                    locale={locale}
                                    onBuy={
                                        onBuyReserveSlot && slot.selectableAsBuy
                                            ? onBuyReserveSlot
                                            : undefined
                                    }
                                    disabled={isReserveBuyDisabled?.(slot) ?? false}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="gd-arena-dashboard-panel">
                        <span className="gd-arena-dashboard-panel-label">
                            {locale === 'zh' ? '皇家卡' : 'Royal Cards'}
                        </span>
                        <div className="gd-arena-dashboard-summary-grid">
                            <div className="gd-arena-dashboard-summary-card">
                                <strong>{zone.royalCount}</strong>
                                <span>{locale === 'zh' ? '已持有' : 'held'}</span>
                            </div>
                            <div className="gd-arena-dashboard-summary-card">
                                <strong>{zone.privileges}</strong>
                                <span>{locale === 'zh' ? '特权' : 'privilege'}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </article>
    );
};
