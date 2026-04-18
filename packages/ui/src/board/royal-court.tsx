import type { UiRoyalOffer } from '@gem-duel/contracts';

const getRoyalCrest = (label: string) => {
    const letters = label
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => word.toLowerCase() !== 'the')
        .map((word) => word.slice(0, 1).toUpperCase())
        .join('');

    return letters.slice(0, 2) || label.slice(0, 2).toUpperCase();
};

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
            {offers.map((offer) => {
                const content = (
                    <>
                        <div className="gd-royal-offer-topline">
                            <span className="gd-royal-offer-crest" aria-hidden="true">
                                {getRoyalCrest(offer.label)}
                            </span>
                            <span className="gd-card-slot-status">royal</span>
                        </div>
                        <strong className="gd-royal-offer-title">{offer.label}</strong>
                        <span className="gd-royal-offer-id">{offer.royalId}</span>
                        {offer.reason ? (
                            <span className="gd-royal-offer-note">{offer.reason}</span>
                        ) : null}
                    </>
                );

                return onSelectOffer ? (
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
                        {content}
                    </button>
                ) : (
                    <article
                        key={offer.royalId}
                        className={
                            offer.selectable ? 'gd-royal-offer is-selectable' : 'gd-royal-offer'
                        }
                        data-testid={`royal-offer-${offer.royalId}`}
                    >
                        {content}
                    </article>
                );
            })}
        </div>
    ) : (
        <p className="gd-muted">No royal offers in this scene.</p>
    );
