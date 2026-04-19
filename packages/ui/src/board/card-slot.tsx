import type { UiMarketSlot } from '@gem-duel/contracts';
import { CrownIcon, GemIcon } from '../primitives/arena-icons';

type ArenaGemColor = Exclude<UiMarketSlot['accentColor'], null>;

const COST_ORDER: readonly ArenaGemColor[] = [
    'red',
    'green',
    'blue',
    'white',
    'black',
    'pearl',
    'gold',
];

const getSlotStatusLabel = (slot: UiMarketSlot, locale: 'en' | 'zh') => {
    if (slot.selectableAsBuy) {
        return locale === 'zh' ? '购买' : 'buy';
    }
    if (slot.selectableAsReserve) {
        return locale === 'zh' ? '预留' : 'reserve';
    }
    return locale === 'zh' ? '锁定' : 'locked';
};

const getPlaceholderLabel = (slot: UiMarketSlot, locale: 'en' | 'zh') => {
    if (slot.zone === 'deck') {
        return locale === 'zh' ? '牌堆' : 'DECK';
    }

    if (slot.zone === 'reserve') {
        if (slot.occupied) {
            return locale === 'zh' ? '已预留' : 'RESERVED';
        }
        return locale === 'zh' ? '空位' : 'EMPTY';
    }

    return locale === 'zh' ? '封存' : 'SEALED';
};

const renderCostColumn = (slot: UiMarketSlot) => {
    if (!slot.cost) {
        return null;
    }

    const entries = COST_ORDER.filter((color) => slot.cost?.[color] && slot.cost[color] > 0);
    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="gd-card-slot-cost-column" aria-label="Card cost">
            {entries.map((color) => (
                <span key={color} className="gd-card-slot-cost-chip">
                    <GemIcon color={color} className="gd-card-slot-cost-icon" />
                    <strong>{slot.cost?.[color] ?? 0}</strong>
                </span>
            ))}
        </div>
    );
};

const renderSlotBody = (slot: UiMarketSlot, locale: 'en' | 'zh') => {
    const placeholder = !slot.cardId;
    const bonusColor = slot.bonusGem === null ? 'gold' : slot.bonusGem;

    return (
        <div className={placeholder ? 'gd-card-slot-frame is-placeholder' : 'gd-card-slot-frame'}>
            {renderCostColumn(slot)}

            <div className="gd-card-slot-surface">
                <div className="gd-card-slot-head">
                    <div className="gd-card-slot-scoreline">
                        <strong className="gd-card-slot-score">{slot.score ?? 0}</strong>
                        {slot.crowns ? (
                            <span className="gd-card-slot-crowns">
                                <CrownIcon className="gd-card-slot-crown-icon" />
                                <strong>{slot.crowns}</strong>
                            </span>
                        ) : null}
                    </div>
                    <span className="gd-card-slot-bonus">
                        <GemIcon color={bonusColor} className="gd-card-slot-bonus-icon" />
                        <small>{slot.bonusCount ?? 0}</small>
                    </span>
                </div>

                <div className="gd-card-slot-copy">
                    <span className="gd-card-slot-level">
                        {slot.level ? `L${slot.level}` : 'AUX'}
                    </span>
                    <strong className="gd-card-slot-title">
                        {placeholder ? getPlaceholderLabel(slot, locale) : slot.cardId}
                    </strong>
                    <span className="gd-card-slot-subtitle">
                        {slot.zone === 'reserve' && slot.owner
                            ? locale === 'zh'
                                ? `${slot.owner.toUpperCase()} 预留`
                                : `${slot.owner.toUpperCase()} RESERVE`
                            : locale === 'zh'
                              ? slot.zone === 'deck'
                                  ? '牌堆'
                                  : '市场'
                              : slot.zone.toUpperCase()}
                    </span>
                </div>

                <div className="gd-card-slot-foot">
                    <span
                        className="gd-card-slot-pattern"
                        data-gd-pattern={slot.patternKey ?? 'none'}
                    />
                    <span className="gd-card-slot-status">{getSlotStatusLabel(slot, locale)}</span>
                </div>
            </div>
        </div>
    );
};

export const CardSlot = ({
    slot,
    onBuy,
    onReserve,
    buyDisabled = false,
    reserveDisabled = false,
    testId,
    locale = 'en',
}: {
    slot: UiMarketSlot;
    onBuy?: (slot: UiMarketSlot) => void;
    onReserve?: (slot: UiMarketSlot) => void;
    buyDisabled?: boolean;
    reserveDisabled?: boolean;
    testId?: string;
    locale?: 'en' | 'zh';
}) => {
    const className = [
        'gd-market-slot',
        slot.selectableAsBuy ? 'is-buyable' : '',
        slot.selectableAsReserve ? 'is-reservable' : '',
    ]
        .filter(Boolean)
        .join(' ');
    const primaryLabel =
        slot.zone === 'reserve'
            ? locale === 'zh'
                ? '购买预留卡'
                : 'Buy reserved card'
            : slot.zone === 'pyramid'
              ? locale === 'zh'
                  ? '购买卡牌'
                  : 'Buy card'
              : null;
    const reserveLabel =
        slot.zone === 'deck'
            ? locale === 'zh'
                ? `预留暗牌 L${slot.level}`
                : `Reserve blind L${slot.level}`
            : locale === 'zh'
              ? '预留'
              : 'Reserve';
    const slotTestId = testId ?? `market-slot-${slot.ref}`;
    const slotTitle = [slot.cardId, slot.reason].filter(Boolean).join(' | ') || undefined;

    return (
        <article
            className={className}
            data-testid={slotTestId}
            data-gd-market-zone={slot.zone}
            data-gd-market-level={slot.level ?? 'aux'}
            data-gd-occupied={slot.occupied}
            data-gd-accent={slot.accentColor ?? 'none'}
            data-gd-pattern={slot.patternKey ?? 'none'}
        >
            {onBuy ? (
                <button
                    type="button"
                    className="gd-card-slot-primary"
                    data-testid={`${slotTestId}-buy`}
                    disabled={buyDisabled}
                    title={slotTitle}
                    onClick={() => onBuy(slot)}
                >
                    {renderSlotBody(slot, locale)}
                    {primaryLabel ? (
                        <span className="gd-card-slot-action-hint">{primaryLabel}</span>
                    ) : null}
                </button>
            ) : (
                <div className="gd-card-slot-primary is-static" title={slotTitle}>
                    {renderSlotBody(slot, locale)}
                </div>
            )}
            {onReserve ? (
                <div className="gd-card-slot-actions">
                    <button
                        type="button"
                        className="gd-chip-button"
                        data-testid={`${slotTestId}-reserve`}
                        disabled={reserveDisabled}
                        onClick={() => onReserve(slot)}
                    >
                        {reserveLabel}
                    </button>
                </div>
            ) : null}
        </article>
    );
};
