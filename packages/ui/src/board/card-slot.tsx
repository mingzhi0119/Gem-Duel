import type { UiMarketSlot } from '@gem-duel/contracts';

export const CardSlot = ({ slot }: { slot: UiMarketSlot }) => {
    const className = slot.selectableAsBuy
        ? 'gd-market-slot is-buyable'
        : slot.selectableAsReserve
          ? 'gd-market-slot is-reservable'
          : 'gd-market-slot';

    return (
        <article className={className}>
            <div className="gd-card-slot-meta">
                <span className="gd-muted">{slot.zone}</span>
                <span className="gd-card-slot-status">
                    {slot.selectableAsBuy ? 'buy' : slot.selectableAsReserve ? 'reserve' : 'locked'}
                </span>
            </div>
            <strong>{slot.cardId ?? 'hidden / empty'}</strong>
            <span>
                {slot.level ? `L${slot.level}` : 'no level'}
                {slot.slot ? ` • slot ${slot.slot}` : ''}
                {slot.slotId ? ` • ${slot.slotId}` : ''}
            </span>
            {slot.owner ? <span className="gd-muted">owner: {slot.owner}</span> : null}
            {slot.reason ? <span className="gd-muted">{slot.reason}</span> : null}
        </article>
    );
};
