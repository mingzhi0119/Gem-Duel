import type { UiRoyalOffer } from '@gem-duel/contracts';
import { CrownIcon } from '../primitives/arena-icons';

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
    locale = 'en',
}: {
    offers: UiRoyalOffer[];
    onSelectOffer?: (offer: UiRoyalOffer) => void;
    isDisabled?: (offer: UiRoyalOffer) => boolean;
    locale?: 'en' | 'zh';
}) =>
    offers.length > 0 ? (
        <div className="gd-royal-grid" aria-label="Royal court">
            {offers.map((offer) => {
                const content = (
                    <>
                        <div className="gd-royal-offer-topline">
                            <span className="gd-royal-offer-score">{offer.score}</span>
                            {offer.tagLabel ? (
                                <span className="gd-card-slot-status">
                                    {locale === 'zh'
                                        ? offer.tagLabel === 'royal'
                                            ? '皇家'
                                            : offer.tagLabel === 'again'
                                              ? '再临'
                                              : offer.tagLabel === 'scroll'
                                                ? '卷轴'
                                                : offer.tagLabel === 'steal'
                                                  ? '夺取'
                                                  : offer.tagLabel
                                        : offer.tagLabel}
                                </span>
                            ) : null}
                        </div>
                        <span className="gd-royal-offer-crest" aria-hidden="true">
                            {getRoyalCrest(offer.label)}
                        </span>
                        <strong className="gd-royal-offer-title">{offer.label}</strong>
                        <div className="gd-royal-offer-footer">
                            {offer.crowns ? (
                                <span className="gd-royal-offer-crowns">
                                    <CrownIcon className="gd-card-slot-crown-icon" />
                                    <strong>{offer.crowns}</strong>
                                </span>
                            ) : (
                                <span className="gd-royal-offer-note">{offer.royalId}</span>
                            )}
                            <span
                                className="gd-royal-offer-pattern"
                                data-gd-pattern={offer.patternKey ?? 'coins'}
                            />
                        </div>
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
                        data-gd-royal-accent={offer.accentKey ?? 'royal'}
                        data-gd-pattern={offer.patternKey ?? 'coins'}
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
                        data-gd-royal-accent={offer.accentKey ?? 'royal'}
                        data-gd-pattern={offer.patternKey ?? 'coins'}
                    >
                        {content}
                    </article>
                );
            })}
        </div>
    ) : (
        <p className="gd-muted">No royal offers in this scene.</p>
    );
