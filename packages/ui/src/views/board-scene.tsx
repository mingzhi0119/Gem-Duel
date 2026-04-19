import { useId, type ReactNode } from 'react';
import type {
    UiActionDescriptor,
    UiMarketSlot,
    UiRoyalOffer,
    UiViewModel,
} from '@gem-duel/contracts';
import { ActionList } from '../primitives/action-list';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    GemIcon,
    MenuIcon,
    RefreshIcon,
} from '../primitives/arena-icons';
import { BoardGrid } from '../board/board-grid';
import { MarketStack } from '../board/market-stack';
import { PlayerZone } from '../board/player-zone';
import { PromptBanner } from '../board/prompt-banner';
import { RoyalCourt } from '../board/royal-court';
import { RunPanel } from '../board/run-panel';
import { SelectionOverlay } from '../board/selection-overlay';
import { SidecarDrawer } from '../drawer/sidecar-drawer';
import { TurnHud, getArenaActionCounter } from '../hud/turn-hud';
import { getUiMessages, type UiLocale } from '../i18n/messages';

export interface BoardSceneScenarioMeta {
    id: string;
    startingFixtureSource: string;
    expectedFinalStateHash: string;
}

export interface BoardSceneSlots {
    header: ReactNode;
    primaryStage: ReactNode;
    secondaryStage: ReactNode;
    footer: ReactNode;
    rail: ReactNode;
}

type ArenaGemColor = Exclude<UiMarketSlot['accentColor'], null>;

const BOARD_STAT_ORDER: readonly ArenaGemColor[] = [
    'red',
    'green',
    'blue',
    'white',
    'black',
    'pearl',
    'gold',
];

const uniqueBy = <T,>(items: T[], keyOf: (item: T) => string | null) => {
    const unique = new Map<string, T>();
    const ambiguous = new Set<string>();

    for (const item of items) {
        const key = keyOf(item);
        if (!key || ambiguous.has(key)) {
            continue;
        }
        if (unique.has(key)) {
            unique.delete(key);
            ambiguous.add(key);
            continue;
        }
        unique.set(key, item);
    }

    return {
        get(key: string) {
            return unique.get(key) ?? null;
        },
        keys() {
            return [...unique.keys()];
        },
    };
};

const getMarketActionKey = (action: UiActionDescriptor): string | null => {
    switch (action.command.type) {
        case 'BUY_CARD':
            return action.command.source.kind === 'pyramid'
                ? `pyramid-${action.command.source.level}-${action.command.source.slot}`
                : `reserve-${action.command.source.slotId}`;
        case 'RESERVE_CARD':
            return action.command.source.kind === 'pyramid'
                ? `pyramid-${action.command.source.level}-${action.command.source.slot}`
                : `deck-${action.command.source.level}`;
        default:
            return null;
    }
};

const getBoardActionKey = (action: UiActionDescriptor): string | null => {
    switch (action.command.type) {
        case 'TAKE_TOKENS_ADD_POSITION':
        case 'USE_PRIVILEGE_ADD_POSITION':
        case 'TAKE_EFFECT_BOARD_TOKEN':
            return action.command.positionId;
        default:
            return null;
    }
};

const getRoyalActionKey = (action: UiActionDescriptor): string | null =>
    action.command.type === 'SELECT_ROYAL' ? action.command.royalId : null;

const getActionNote = (locale: UiLocale, counter: ReturnType<typeof getArenaActionCounter>) => {
    if (locale === 'zh') {
        switch (counter.noteKey) {
            case 'observer':
                return '只读观察中';
            case 'waiting':
                return '等待行动方';
            case 'selection':
                return `还需选择 ${counter.remaining ?? 0}`;
            case 'prompt':
                return `还需处理 ${counter.remaining ?? 0}`;
            case 'optional':
                return `可选窗口：${counter.optionalStep ?? 'done'}`;
            case 'available':
                return '主行动可用';
            case 'settled':
                return '回合已结算';
        }
    }

    switch (counter.noteKey) {
        case 'observer':
            return 'Read-only observer';
        case 'waiting':
            return 'Waiting for active seat';
        case 'selection':
            return `${counter.remaining ?? 0} picks left`;
        case 'prompt':
            return `${counter.remaining ?? 0} prompt choices left`;
        case 'optional':
            return `Optional ${counter.optionalStep ?? 'done'} window`;
        case 'available':
            return 'Main action available';
        case 'settled':
            return 'Turn settled';
    }
};

const getBoardCounts = (viewModel: UiViewModel) =>
    BOARD_STAT_ORDER.map((color) => ({
        color,
        count: viewModel.boardCells.filter((cell) => cell.token === color).length,
    }));

export const BoardScene = ({
    eyebrow = 'Classic Local',
    viewModel,
    currentFinalStateHash,
    hashUnavailableLabel,
    scenarioMeta = null,
    onSelect,
    error,
    note,
    extraSidecars = null,
    locale = 'en',
    surface = 'play',
    railLead = null,
    slots,
}: {
    eyebrow?: string;
    viewModel: UiViewModel;
    currentFinalStateHash?: string | null;
    hashUnavailableLabel?: string;
    scenarioMeta?: BoardSceneScenarioMeta | null;
    onSelect?: (action: UiActionDescriptor) => void;
    error?: string | null;
    note?: ReactNode;
    extraSidecars?: ReactNode;
    locale?: UiLocale;
    surface?: 'play' | 'replay' | 'room';
    railLead?: ReactNode;
    slots?: Partial<BoardSceneSlots>;
}) => {
    const headingId = useId();
    const uiMessages = getUiMessages(locale);
    const messages = uiMessages.boardScene;
    const resolvedHashUnavailableLabel =
        hashUnavailableLabel ?? uiMessages.sessionRail.hashUnavailableLabel;
    const replenishAction =
        viewModel.availableActions.find((action) => action.command.type === 'REPLENISH_BOARD') ??
        null;
    const boardActions = uniqueBy(
        viewModel.availableActions.filter((action) => getBoardActionKey(action) !== null),
        getBoardActionKey
    );
    const buyActions = uniqueBy(
        viewModel.availableActions.filter((action) => action.command.type === 'BUY_CARD'),
        getMarketActionKey
    );
    const reserveActions = uniqueBy(
        viewModel.availableActions.filter((action) => action.command.type === 'RESERVE_CARD'),
        getMarketActionKey
    );
    const royalActions = uniqueBy(
        viewModel.availableActions.filter((action) => action.command.type === 'SELECT_ROYAL'),
        getRoyalActionKey
    );
    const confirmAction =
        viewModel.availableActions.find(
            (action) =>
                action.command.type === 'TAKE_TOKENS_CONFIRM' ||
                action.command.type === 'USE_PRIVILEGE_CONFIRM'
        ) ?? null;
    const cancelAction =
        viewModel.availableActions.find(
            (action) =>
                action.command.type === 'TAKE_TOKENS_CANCEL' ||
                action.command.type === 'USE_PRIVILEGE_CANCEL'
        ) ?? null;

    const mappedActionIds = new Set<string>();
    if (replenishAction) {
        mappedActionIds.add(replenishAction.id);
    }
    for (const key of boardActions.keys()) {
        const action = boardActions.get(key);
        if (action) {
            mappedActionIds.add(action.id);
        }
    }
    for (const slot of viewModel.marketSlots) {
        const buyAction = buyActions.get(slot.ref);
        const reserveAction = reserveActions.get(slot.ref);
        if (buyAction) {
            mappedActionIds.add(buyAction.id);
        }
        if (reserveAction) {
            mappedActionIds.add(reserveAction.id);
        }
    }
    for (const offer of viewModel.royalOffers) {
        const action = royalActions.get(offer.royalId);
        if (action) {
            mappedActionIds.add(action.id);
        }
    }
    if (confirmAction) {
        mappedActionIds.add(confirmAction.id);
    }
    if (cancelAction) {
        mappedActionIds.add(cancelAction.id);
    }

    const fallbackActions = viewModel.availableActions.filter(
        (action) => !mappedActionIds.has(action.id)
    );
    const boardCounts = getBoardCounts(viewModel);
    const reserveSlotsByPlayer = {
        p1: viewModel.marketSlots.filter((slot) => slot.zone === 'reserve' && slot.owner === 'p1'),
        p2: viewModel.marketSlots.filter((slot) => slot.zone === 'reserve' && slot.owner === 'p2'),
    };
    const actionCounter = getArenaActionCounter(viewModel);

    const handleBoardCellSelect = (positionId: string) => {
        const action = boardActions.get(positionId);
        if (action && onSelect) {
            onSelect(action);
        }
    };

    const handleBuy = (slot: UiMarketSlot) => {
        const action = buyActions.get(slot.ref);
        if (action && onSelect) {
            onSelect(action);
        }
    };

    const handleReserve = (slot: UiMarketSlot) => {
        const action = reserveActions.get(slot.ref);
        if (action && onSelect) {
            onSelect(action);
        }
    };

    const handleRoyalSelect = (offer: UiRoyalOffer) => {
        const action = royalActions.get(offer.royalId);
        if (action && onSelect) {
            onSelect(action);
        }
    };

    const defaultHeader = (
        <div className="gd-arena-topbar">
            <div className="gd-arena-topbar-copy">
                <span className="gd-scene-eyebrow">{eyebrow}</span>
                <h1 id={headingId}>{viewModel.title}</h1>
            </div>
            <TurnHud viewModel={viewModel} />
            <div className="gd-board-scene-controls-host" data-testid="boardscene-rail">
                <SidecarDrawer
                    title={messages.controlsTitle}
                    triggerLabel={messages.controlsTitle}
                    mode="drawer"
                    size="wide"
                    triggerVariant="icon"
                    triggerTestId="boardscene-controls-trigger"
                    panelTestId="boardscene-controls-panel"
                    openLabel={uiMessages.drawer.openLabel}
                    closeLabel={uiMessages.drawer.closeLabel}
                    triggerBadge={<MenuIcon className="gd-arena-menu-icon" />}
                >
                    {slots?.rail ?? (
                        <div className="gd-arena-controls-stack">
                            {railLead}

                            {note ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.notesTitle}</h2>
                                    </div>
                                    <div>{note}</div>
                                </section>
                            ) : null}

                            {error ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.errorTitle}</h2>
                                    </div>
                                    <p className="gd-error">{error}</p>
                                </section>
                            ) : null}

                            {scenarioMeta ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.scenarioFixtureTitle}</h2>
                                    </div>
                                    <div className="gd-scenario-meta">
                                        <p>
                                            {messages.scenarioLabel}:{' '}
                                            <strong data-testid="phase4-scenario-id">
                                                {scenarioMeta.id}
                                            </strong>
                                        </p>
                                        <p>{scenarioMeta.startingFixtureSource}</p>
                                        <p>
                                            {messages.expectedHashLabel}:{' '}
                                            <span data-testid="phase4-expected-hash">
                                                {scenarioMeta.expectedFinalStateHash}
                                            </span>
                                        </p>
                                    </div>
                                </section>
                            ) : null}

                            {viewModel.promptStack.length > 0 ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.promptsTitle}</h2>
                                    </div>
                                    <PromptBanner prompts={viewModel.promptStack} />
                                </section>
                            ) : null}

                            {viewModel.selectionDraft ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.selectionDraftTitle}</h2>
                                    </div>
                                    <SelectionOverlay selectionDraft={viewModel.selectionDraft} />
                                </section>
                            ) : null}

                            {viewModel.runPanel ? (
                                <SidecarDrawer
                                    title={messages.runSidecarTitle}
                                    mode="drawer"
                                    triggerSummary={`Run #${viewModel.runPanel.matchIndex}`}
                                    triggerBadge={
                                        <span className="gd-shell-badge">
                                            {viewModel.runPanel.wins}W / {viewModel.runPanel.losses}
                                            L
                                        </span>
                                    }
                                    triggerTestId="run-sidecar-trigger"
                                    panelTestId="run-sidecar-drawer"
                                    openLabel={uiMessages.drawer.openLabel}
                                    closeLabel={uiMessages.drawer.closeLabel}
                                >
                                    <RunPanel runPanel={viewModel.runPanel} />
                                </SidecarDrawer>
                            ) : null}

                            {viewModel.sessionStatus === 'completed' ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{uiMessages.terminalOverlay.eyebrow}</h2>
                                    </div>
                                    <div className="gd-terminal-overlay-card">
                                        <p className="gd-muted">
                                            {uiMessages.terminalOverlay.winnerLabel}:{' '}
                                            <strong>
                                                {viewModel.snapshot.context.winner ??
                                                    uiMessages.terminalOverlay.unknownWinner}
                                            </strong>
                                        </p>
                                        <p className="gd-muted">
                                            {uiMessages.terminalOverlay.reasonLabel}:{' '}
                                            <strong>
                                                {viewModel.snapshot.context.victoryReason ??
                                                    uiMessages.terminalOverlay.noReason}
                                            </strong>
                                        </p>
                                        <p className="gd-muted">
                                            {uiMessages.terminalOverlay.hashLabel}:{' '}
                                            <code data-testid="terminal-final-state-hash">
                                                {currentFinalStateHash ??
                                                    resolvedHashUnavailableLabel}
                                            </code>
                                        </p>
                                    </div>
                                </section>
                            ) : null}

                            {extraSidecars}

                            {fallbackActions.length > 0 && onSelect ? (
                                <section className="gd-sidecar-drawer">
                                    <div className="gd-section-header">
                                        <h2>{messages.additionalActionsTitle}</h2>
                                    </div>
                                    <p className="gd-muted">{messages.additionalActionsNote}</p>
                                    <ActionList actions={fallbackActions} onSelect={onSelect} />
                                </section>
                            ) : null}
                        </div>
                    )}
                </SidecarDrawer>
            </div>
        </div>
    );

    const defaultPrimaryStage = (
        <section className="gd-arena-panel gd-arena-panel-market">
            <div className="gd-arena-panel-header">
                <h2>{messages.marketTitle}</h2>
            </div>
            <MarketStack
                slots={viewModel.marketSlots}
                locale={locale}
                onBuySlot={onSelect ? handleBuy : undefined}
                onReserveSlot={onSelect ? handleReserve : undefined}
                isBuyDisabled={(slot) => buyActions.get(slot.ref) === null}
                isReserveDisabled={(slot) => reserveActions.get(slot.ref) === null}
            />
        </section>
    );

    const centerBoardStage = (
        <section className="gd-arena-panel gd-arena-panel-board">
            <div className="gd-arena-panel-header">
                <h2>{messages.boardTitle}</h2>
            </div>
            <div className="gd-arena-board-layout">
                <BoardGrid
                    cells={viewModel.boardCells}
                    label="Local board"
                    onSelectCell={
                        onSelect ? (cell) => handleBoardCellSelect(cell.positionId) : undefined
                    }
                    isCellDisabled={(cell) =>
                        !cell.selectable || boardActions.get(cell.positionId) === null
                    }
                />
                <div className="gd-arena-board-stats">
                    <span className="gd-arena-board-stats-title">{messages.boardStatsTitle}</span>
                    <div className="gd-arena-board-stats-list">
                        {boardCounts.map((entry) => (
                            <span key={entry.color} className="gd-arena-board-stat">
                                <GemIcon color={entry.color} className="gd-arena-board-stat-icon" />
                                <strong>{entry.count}</strong>
                            </span>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="gd-button gd-button-muted gd-arena-refresh-button"
                        data-testid="arena-refresh-button"
                        disabled={!replenishAction || !onSelect}
                        onClick={() => replenishAction && onSelect?.(replenishAction)}
                    >
                        <RefreshIcon className="gd-arena-inline-icon" />
                        {messages.refreshLabel}
                    </button>
                </div>
            </div>
        </section>
    );

    const defaultSecondaryStage = (
        <section className="gd-arena-panel gd-arena-panel-royal">
            <div className="gd-arena-panel-header is-centered">
                <h2>{messages.royalCourtTitle}</h2>
            </div>
            <RoyalCourt
                offers={viewModel.royalOffers}
                locale={locale}
                onSelectOffer={onSelect ? handleRoyalSelect : undefined}
                isDisabled={(offer) => royalActions.get(offer.royalId) === null}
            />
            <div className="gd-arena-action-box" data-testid="turn-hud-action-counter">
                <button
                    type="button"
                    className="gd-arena-action-arrow"
                    data-testid="selection-cancel"
                    aria-label={messages.actionCancelLabel}
                    title={messages.actionCancelLabel}
                    disabled={!cancelAction || !onSelect}
                    onClick={() => cancelAction && onSelect?.(cancelAction)}
                >
                    <ArrowLeftIcon className="gd-arena-inline-icon" />
                </button>
                <div className="gd-arena-action-box-copy">
                    <span className="gd-arena-action-label">{messages.actionCounterLabel}</span>
                    <strong>
                        {actionCounter.current} / {actionCounter.total}
                    </strong>
                    <span className="gd-muted">{getActionNote(locale, actionCounter)}</span>
                </div>
                <button
                    type="button"
                    className="gd-arena-action-arrow"
                    data-testid="selection-confirm"
                    aria-label={messages.actionConfirmLabel}
                    title={messages.actionConfirmLabel}
                    disabled={!confirmAction || !onSelect}
                    onClick={() => confirmAction && onSelect?.(confirmAction)}
                >
                    <ArrowRightIcon className="gd-arena-inline-icon" />
                </button>
            </div>
        </section>
    );

    const defaultFooter = (
        <div className="gd-arena-dashboard">
            {viewModel.playerZones.map((player) => (
                <PlayerZone
                    key={player.playerId}
                    zone={player}
                    locale={locale}
                    reserveMarketSlots={reserveSlotsByPlayer[player.playerId]}
                    onBuyReserveSlot={onSelect ? handleBuy : undefined}
                    isReserveBuyDisabled={(slot) => buyActions.get(slot.ref) === null}
                />
            ))}
        </div>
    );

    const resolvedSlots: BoardSceneSlots = {
        header: slots?.header ?? defaultHeader,
        primaryStage: slots?.primaryStage ?? defaultPrimaryStage,
        secondaryStage: slots?.secondaryStage ?? defaultSecondaryStage,
        footer: slots?.footer ?? defaultFooter,
        rail: slots?.rail ?? null,
    };

    return (
        <section
            className="gd-board-scene"
            data-testid="board-scene"
            data-gd-surface={surface}
            lang={locale}
            aria-labelledby={slots?.header ? undefined : headingId}
            aria-label={slots?.header ? viewModel.title : undefined}
        >
            <div className="gd-board-scene-shell">
                <header
                    className="gd-board-scene-slot gd-board-scene-slot-header"
                    data-testid="boardscene-header"
                >
                    {resolvedSlots.header}
                </header>

                <div className="gd-board-scene-stage" data-testid="boardscene-stage">
                    <div className="gd-board-scene-slot gd-board-scene-slot-primary">
                        {resolvedSlots.primaryStage}
                    </div>
                    <div className="gd-board-scene-slot gd-board-scene-slot-center">
                        {centerBoardStage}
                    </div>
                    <aside className="gd-board-scene-slot gd-board-scene-slot-secondary">
                        {resolvedSlots.secondaryStage}
                    </aside>
                </div>

                <footer
                    className="gd-board-scene-slot gd-board-scene-slot-footer"
                    data-testid="boardscene-footer"
                >
                    {resolvedSlots.footer}
                </footer>

                <div className="gd-visibility-probe" aria-hidden="true">
                    <span className="gd-visually-hidden" data-testid="boardscene-session-status">
                        {viewModel.sessionStatus}
                    </span>
                    <span className="gd-visually-hidden" data-testid="boardscene-viewer-role">
                        {viewModel.viewerRole}
                    </span>
                    {currentFinalStateHash ? (
                        <code className="gd-visually-hidden" data-testid="current-final-state-hash">
                            {currentFinalStateHash}
                        </code>
                    ) : (
                        <span
                            className="gd-visually-hidden"
                            data-testid="current-final-state-hash-unavailable"
                        >
                            {resolvedHashUnavailableLabel}
                        </span>
                    )}
                    {scenarioMeta ? (
                        <>
                            <span className="gd-visually-hidden" data-testid="phase4-scenario-id">
                                {scenarioMeta.id}
                            </span>
                            <span className="gd-visually-hidden" data-testid="phase4-expected-hash">
                                {scenarioMeta.expectedFinalStateHash}
                            </span>
                        </>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
