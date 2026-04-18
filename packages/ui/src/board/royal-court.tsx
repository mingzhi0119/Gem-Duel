import type { UiRoyalOffer } from '@gem-duel/contracts';

export const RoyalCourt = ({
    offers,
    onSelectOffer,
    isDisabled,
}: {
    offers: UiRoyalOffer[];
    onSelectOffer?: (offer: UiRoyalOffer) => void;
    isDisabled?: (offer: UiRoyalOffer) => boolean;
}) =>
    offers.length > 0 ? (
        <div className="gd-royal-grid" aria-label="Royal court">
            {offers.map((offer) =>
                onSelectOffer ? (
                    <button
                        key={offer.royalId}
                        type="button"
                        className={
                            offer.selectable ? 'gd-royal-offer is-selectable' : 'gd-royal-offer'
                        }
                        data-testid={`royal-offer-${offer.royalId}`}
                        disabled={isDisabled?.(offer) ?? !offer.selectable}
                        onClick={() => onSelectOffer(offer)}
                    >
                        <strong>{offer.label}</strong>
                        <span>{offer.royalId}</span>
                        {offer.reason ? <span className="gd-muted">{offer.reason}</span> : null}
                    </button>
                ) : (
                    <article
                        key={offer.royalId}
                        className={
                            offer.selectable ? 'gd-royal-offer is-selectable' : 'gd-royal-offer'
                        }
                        data-testid={`royal-offer-${offer.royalId}`}
                    >
                        <strong>{offer.label}</strong>
                        <span>{offer.royalId}</span>
                        {offer.reason ? <span className="gd-muted">{offer.reason}</span> : null}
                    </article>
                )
            )}
        </div>
    ) : (
        <p className="gd-muted">No royal offers in this scene.</p>
    );
