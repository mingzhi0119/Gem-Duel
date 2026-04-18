import type { UiRoyalOffer } from '@gem-duel/contracts';

export const RoyalCourt = ({ offers }: { offers: UiRoyalOffer[] }) =>
    offers.length > 0 ? (
        <div className="gd-royal-grid" aria-label="Royal court">
            {offers.map((offer) => (
                <article
                    key={offer.royalId}
                    className={offer.selectable ? 'gd-royal-offer is-selectable' : 'gd-royal-offer'}
                >
                    <strong>{offer.label}</strong>
                    <span>{offer.royalId}</span>
                    {offer.reason ? <span className="gd-muted">{offer.reason}</span> : null}
                </article>
            ))}
        </div>
    ) : (
        <p className="gd-muted">No royal offers in this scene.</p>
    );
