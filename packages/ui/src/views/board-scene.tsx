import { useId, type ReactNode } from 'react';
import type {
    UiActionDescriptor,
    UiMarketSlot,
    UiRoyalOffer,
    UiViewModel,
} from '@gem-duel/contracts';
import { ActionList } from '../primitives/action-list';
import { BoardGrid } from '../board/board-grid';
import { MarketStack } from '../board/market-stack';
import { PlayerZone } from '../board/player-zone';
import { PromptBanner } from '../board/prompt-banner';
import { RoyalCourt } from '../board/royal-court';
import { RunPanel } from '../board/run-panel';
import { SelectionOverlay } from '../board/selection-overlay';
import { SidecarDrawer } from '../drawer/sidecar-drawer';
import { TurnHud } from '../hud/turn-hud';
import { getUiMessages, type UiLocale } from '../i18n/messages';
import { TerminalOverlay } from './terminal-overlay';

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

const TOOLBAR_COMMANDS = new Set([
    'BEGIN_GEM_SELECTION',
    'BEGIN_RESERVE',
    'BEGIN_BUY',
    'BEGIN_PRIVILEGE',
    'REPLENISH_BOARD',
]);

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

const getToolbarLabel = (action: UiActionDescriptor) => {
    switch (action.command.type) {
        case 'BEGIN_GEM_SELECTION':
            return 'Take gems';
        case 'BEGIN_RESERVE':
            return 'Reserve';
        case 'BEGIN_BUY':
            return 'Buy';
        case 'BEGIN_PRIVILEGE':
            return 'Privilege';
        case 'REPLENISH_BOARD':
            return 'Replenish board';
        default:
            return action.label;
    }
};

export const BoardScene = ({
    eyebrow = 'Classic Local',
    viewModel,
    currentFinalStateHash,
    hashUnavailableLabel = 'Live hash unavailable',
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
    const toolbarActions = viewModel.availableActions.filter((action) =>
        TOOLBAR_COMMANDS.has(action.command.type)
    );
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

    const mappedActionIds = new Set(toolbarActions.map((action) => action.id));
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
    const showTerminalOverlay =
        viewModel.sessionStatus === 'completed' || viewModel.snapshot.context.phase === 'terminal';

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
        <div className="gd-board-scene-header-layout">
            <div className="gd-panel gd-board-scene-summary">
                <div className="gd-board-scene-summary-top">
                    <div className="gd-board-scene-summary-copy">
                        <p className="gd-scene-eyebrow">{eyebrow}</p>
                        <h1 id={headingId}>{viewModel.title}</h1>
                    </div>
                    <div className="gd-board-scene-badges">
                        <span className="gd-shell-badge" data-testid="boardscene-session-status">
                            {viewModel.sessionStatus}
                        </span>
                        <span className="gd-shell-badge" data-testid="boardscene-viewer-role">
                            {viewModel.viewerRole}
                        </span>
                        {currentFinalStateHash ? (
                            <span className="gd-hash-badge">
                                {messages.hashLabel}{' '}
                                <code data-testid="current-final-state-hash">
                                    {currentFinalStateHash}
                                </code>
                            </span>
                        ) : (
                            <span
                                className="gd-shell-badge"
                                data-testid="current-final-state-hash-unavailable"
                            >
                                {hashUnavailableLabel}
                            </span>
                        )}
                    </div>
                </div>
                <p className="gd-muted">{viewModel.subtitle}</p>
                {note}
                {error ? <p className="gd-error">{error}</p> : null}
            </div>

            <div className="gd-board-scene-header-stack">
                <section className="gd-panel gd-turn-hud-panel">
                    <TurnHud viewModel={viewModel} />
                    {toolbarActions.length > 0 ? (
                        <div className="gd-toolbar-actions" data-testid="boardscene-toolbar">
                            {toolbarActions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    className="gd-button"
                                    disabled={!onSelect}
                                    onClick={() => onSelect?.(action)}
                                >
                                    {getToolbarLabel(action)}
                                </button>
                            ))}
                        </div>
                    ) : surface === 'replay' ? (
                        <p className="gd-muted">{messages.replayReadOnlyNote}</p>
                    ) : null}
                </section>

                {scenarioMeta ? (
                    <SidecarDrawer title={messages.scenarioFixtureTitle}>
                        <div className="gd-scenario-meta">
                            <p>
                                {messages.scenarioLabel}:{' '}
                                <strong data-testid="phase4-scenario-id">{scenarioMeta.id}</strong>
                            </p>
                            <p>{scenarioMeta.startingFixtureSource}</p>
                            <p>
                                {messages.expectedHashLabel}:{' '}
                                <span data-testid="phase4-expected-hash">
                                    {scenarioMeta.expectedFinalStateHash}
                                </span>
                            </p>
                        </div>
                    </SidecarDrawer>
                ) : null}
            </div>
        </div>
    );

    const defaultPrimaryStage = (
        <div className="gd-board-scene-primary-grid">
            <section className="gd-panel gd-board-scene-stage-panel">
                <div className="gd-section-header">
                    <h2>{messages.marketTitle}</h2>
                    <span className="gd-muted">
                        {viewModel.marketSlots.length} {messages.marketSlotsLabel}
                    </span>
                </div>
                <MarketStack
                    slots={viewModel.marketSlots}
                    onBuySlot={onSelect ? handleBuy : undefined}
                    onReserveSlot={onSelect ? handleReserve : undefined}
                    isBuyDisabled={(slot) => buyActions.get(slot.ref) === null}
                    isReserveDisabled={(slot) => reserveActions.get(slot.ref) === null}
                />
            </section>

            <section className="gd-panel gd-board-scene-stage-panel">
                <div className="gd-section-header">
                    <h2>{messages.boardTitle}</h2>
                    <span className="gd-muted">
                        {viewModel.boardCells.length} {messages.boardCellsLabel}
                    </span>
                </div>
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
            </section>
        </div>
    );

    const defaultSecondaryStage = (
        <section className="gd-panel gd-board-scene-stage-panel gd-board-scene-stage-secondary">
            <div className="gd-section-header">
                <h2>{messages.royalCourtTitle}</h2>
                <span className="gd-muted">{viewModel.royalOffers.length}</span>
            </div>
            <RoyalCourt
                offers={viewModel.royalOffers}
                onSelectOffer={onSelect ? handleRoyalSelect : undefined}
                isDisabled={(offer) => royalActions.get(offer.royalId) === null}
            />
        </section>
    );

    const defaultFooter = (
        <section className="gd-panel gd-board-scene-footer-panel">
            <div className="gd-section-header">
                <h2>{messages.playersTitle}</h2>
                <span className="gd-muted">
                    {viewModel.playerZones.length} {messages.playerZonesLabel}
                </span>
            </div>
            <div className="gd-player-zone-grid">
                {viewModel.playerZones.map((player) => (
                    <PlayerZone key={player.playerId} zone={player} />
                ))}
            </div>
        </section>
    );

    const defaultRail = (
        <>
            {railLead}

            {viewModel.promptStack.length > 0 ? (
                <SidecarDrawer title={messages.promptsTitle}>
                    <PromptBanner prompts={viewModel.promptStack} />
                </SidecarDrawer>
            ) : null}

            {viewModel.selectionDraft ? (
                <SidecarDrawer title={messages.selectionDraftTitle}>
                    <SelectionOverlay selectionDraft={viewModel.selectionDraft} />
                    <div className="gd-selection-controls">
                        {confirmAction ? (
                            <button
                                type="button"
                                className="gd-button"
                                data-testid="selection-confirm"
                                disabled={!onSelect}
                                onClick={() => onSelect?.(confirmAction)}
                            >
                                {confirmAction.label}
                            </button>
                        ) : null}
                        {cancelAction ? (
                            <button
                                type="button"
                                className="gd-button gd-button-muted"
                                data-testid="selection-cancel"
                                disabled={!onSelect}
                                onClick={() => onSelect?.(cancelAction)}
                            >
                                {cancelAction.label}
                            </button>
                        ) : null}
                    </div>
                </SidecarDrawer>
            ) : null}

            {viewModel.runPanel ? (
                <SidecarDrawer
                    title={messages.runSidecarTitle}
                    mode="drawer"
                    triggerSummary={`Run #${viewModel.runPanel.matchIndex}`}
                    triggerBadge={
                        <span className="gd-shell-badge">
                            {viewModel.runPanel.wins}W / {viewModel.runPanel.losses}L
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

            {extraSidecars}

            {fallbackActions.length > 0 && onSelect ? (
                <SidecarDrawer title={messages.additionalActionsTitle}>
                    <p className="gd-muted">{messages.additionalActionsNote}</p>
                    <ActionList actions={fallbackActions} onSelect={onSelect} />
                </SidecarDrawer>
            ) : null}
        </>
    );

    const resolvedSlots: BoardSceneSlots = {
        header: slots?.header ?? defaultHeader,
        primaryStage: slots?.primaryStage ?? defaultPrimaryStage,
        secondaryStage: slots?.secondaryStage ?? defaultSecondaryStage,
        footer: slots?.footer ?? defaultFooter,
        rail: slots?.rail ?? defaultRail,
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

                <div className="gd-board-scene-center-layout">
                    <div className="gd-terminal-overlay-host">
                        {showTerminalOverlay ? (
                            <TerminalOverlay
                                snapshot={viewModel.snapshot}
                                currentFinalStateHash={
                                    currentFinalStateHash ?? hashUnavailableLabel
                                }
                                locale={locale}
                                surface={surface}
                            />
                        ) : null}

                        <div className="gd-board-scene-stage" data-testid="boardscene-stage">
                            <div
                                className="gd-board-scene-slot gd-board-scene-slot-primary"
                                data-testid="boardscene-primary-stage"
                            >
                                {resolvedSlots.primaryStage}
                            </div>
                            <aside
                                className="gd-board-scene-slot gd-board-scene-slot-secondary"
                                data-testid="boardscene-secondary-stage"
                            >
                                {resolvedSlots.secondaryStage}
                            </aside>
                        </div>
                    </div>

                    <aside
                        className="gd-board-scene-slot gd-board-scene-slot-rail"
                        data-testid="boardscene-rail"
                    >
                        {resolvedSlots.rail}
                    </aside>
                </div>

                <footer
                    className="gd-board-scene-slot gd-board-scene-slot-footer"
                    data-testid="boardscene-footer"
                >
                    {resolvedSlots.footer}
                </footer>
            </div>
        </section>
    );
};
