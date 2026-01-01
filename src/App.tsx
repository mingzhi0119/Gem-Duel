import React, { useState, useEffect, Suspense } from 'react';
import { Download, Upload, RotateCcw, BookOpen, Moon, Sun, Users, ArrowLeft } from 'lucide-react';
import { DraftScreen } from './components/DraftScreen';
import { TopBar } from './components/TopBar';
import { GameBoard } from './components/GameBoard';
import { GameActions } from './components/GameActions';
import { PlayerZone } from './components/PlayerZone';
import { Market } from './components/Market';
import { RoyalCourt } from './components/RoyalCourt';
import { StatusBar } from './components/StatusBar';
import { ReplayControls } from './components/ReplayControls';
import { ResolutionSwitcher } from './components/ResolutionSwitcher';
import { WinnerModal } from './components/WinnerModal';
import { OnlineMenu } from './components/OnlineMenu';
import { GameConfigMenu } from './components/GameConfigMenu';
import { DebugPanel } from './components/DebugPanel';
import { UpdateNotification } from './components/UpdateNotification';
import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from './hooks/useSettings';
import { GEM_TYPES, BONUS_COLORS } from './constants';
import { GemColor, PlayerKey } from './types';

const Rulebook = React.lazy(() =>
    import('./components/Rulebook').then((m) => ({ default: m.Rulebook }))
);
const DeckPeekModal = React.lazy(() =>
    import('./components/DeckPeekModal').then((m) => ({ default: m.DeckPeekModal }))
);

export default function GemDuelBoard() {
    const [showDebug, setShowDebug] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [showRulebook, setShowRulebook] = useState(false);
    const [onlineSetup, setOnlineSetup] = useState(false);
    const [isPeekingBoard, setIsPeekingBoard] = useState(false);
    const [persistentWinner, setPersistentWinner] = useState<GemColor | string | null>(null);
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [appVersion, setAppVersion] = useState<string>('5.2.11');

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                if (window.electron?.getAppVersion) {
                    const version = await window.electron.getAppVersion();
                    if (version) setAppVersion(version);
                }
            } catch (err) {
                console.error('Failed to fetch app version:', err);
            }
        };
        fetchVersion();
    }, []);

    const { resolution, setResolution, settings, RESOLUTION_SETTINGS, theme, setTheme } =
        useSettings();
    const { state, handlers, getters, historyControls, online } = useGameLogic(
        onlineSetup,
        undefined, // Cloud mode uses default ID generation
        isReviewing
    );

    const {
        board,
        bag,
        turn,
        selectedGems,
        errorMsg,
        winner,
        phase,
        bonusGemTarget,
        decks,
        market,
        inventories,
        privileges,
        playerTableau,
        playerReserved,
        playerTurnCounts = { p1: 0, p2: 0 },
        royalDeck,
        playerRoyals,
        lastFeedback,
        playerBuffs,
        draftPool,
        p2DraftPool,
        buffLevel,
        activeModal,
        extraPrivileges,
    } = state;

    // Track the winner persistently once detected
    useEffect(() => {
        if (winner && !persistentWinner) {
            setPersistentWinner(winner);
        }
    }, [winner, persistentWinner]);

    // Reset states when starting a new game
    useEffect(() => {
        if (historyControls.historyLength === 0) {
            setPersistentWinner(null);
            setIsReviewing(false);
        }
    }, [historyControls.historyLength]);

    const {
        handleSelfGemClick,
        handleGemClick,
        handleOpponentGemClick,
        handleConfirmTake,
        handleReplenish,
        handleReserveCard,
        handleReserveDeck,
        handleDiscardReserved,
        initiateBuy,
        handleSelectRoyal,
        handleCancelReserve,
        handleCancelSelection,
        handleCancelPrivilege,
        activatePrivilegeMode,
        checkAndInitiateBuyReserved,
        handleDebugAddCrowns,
        handleDebugAddPoints,
        handleDebugAddPrivilege,
        handleForceRoyal,
        handleSelectBonusColor,
        startGame,
        handleSelectBuff,
        handleCloseModal,
        handlePeekDeck,
        importHistory,
    } = handlers;

    const { getPlayerScore, isSelected, getCrownCount, isMyTurn } = getters;
    const effectiveGameMode = isReviewing ? 'REVIEW' : winner ? 'GAME_OVER' : phase;

    const handleRestart = () => {
        setOnlineSetup(false);
        importHistory([]);
        setShowRestartConfirm(false);
    };

    const handleDownloadReplay = () => {
        const data = {
            version: appVersion,
            timestamp: new Date().toISOString(),
            history: historyControls.history,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GemDuel_Replay_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUploadReplay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.history && Array.isArray(data.history)) {
                    importHistory(data.history);
                }
            } catch (err) {
                console.error('Failed to parse replay file', err);
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        if (
            state.mode !== 'ONLINE_MULTIPLAYER' &&
            online.connectionStatus === 'connected' &&
            !online.isHost &&
            historyControls.historyLength > 0
        ) {
            // Guest follows host setup via useOnlineManager
        }
    }, [state.mode, online.connectionStatus, online.isHost, historyControls.historyLength]);

    if (historyControls.historyLength === 0) {
        if (onlineSetup) {
            return (
                <OnlineMenu
                    onBack={() => setOnlineSetup(false)}
                    online={online}
                    startGame={startGame}
                    theme={theme}
                />
            );
        }

        return (
            <GameConfigMenu
                onOnlineSetup={() => setOnlineSetup(true)}
                onStartGame={startGame}
                theme={theme}
            />
        );
    }

    if (phase === 'DRAFT_PHASE') {
        return (
            <DraftScreen
                draftPool={draftPool}
                p2DraftPool={p2DraftPool}
                buffLevel={buffLevel}
                activePlayer={turn}
                onSelectBuff={handleSelectBuff}
                onReroll={handlers.handleRerollBuffs}
                theme={theme}
                localPlayer={online.isHost ? 'p1' : 'p2'}
                isOnline={state.mode === 'ONLINE_MULTIPLAYER'}
                isPvE={state.mode === 'PVE'}
            />
        );
    }

    return (
        <div
            className={`h-screen w-screen font-sans flex flex-col overflow-hidden transition-colors duration-500 pt-safe pb-safe pl-safe pr-safe 
            ${theme === 'dark' ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f111a] to-black text-slate-200' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#fffefc] via-[#f7f5f0] to-[#e6e2da] text-stone-800'}
        `}
        >
            <UpdateNotification />

            {/* Floating Version Watermark */}
            <div className="fixed bottom-2 right-3 z-[100] pointer-events-none select-none font-mono text-[10px] opacity-40 text-stone-500 whitespace-nowrap">
                v{appVersion}
            </div>

            <TopBar
                p1Score={getPlayerScore('p1')}
                p1Crowns={getCrownCount('p1')}
                p2Score={getPlayerScore('p2')}
                p2Crowns={getCrownCount('p2')}
                playerTurnCounts={playerTurnCounts}
                activePlayer={turn}
                playerBuffs={playerBuffs}
                theme={theme}
                localPlayer={online.isHost ? 'p1' : 'p2'}
                isOnline={state.mode === 'ONLINE_MULTIPLAYER'}
            />

            <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2">
                <ResolutionSwitcher
                    settings={settings}
                    resolution={resolution}
                    setResolution={setResolution}
                    RESOLUTION_SETTINGS={RESOLUTION_SETTINGS}
                    theme={theme}
                />

                <div className="flex flex-col gap-2 border-y border-stone-200/30 py-2 my-1">
                    <button
                        onClick={handleDownloadReplay}
                        className={`p-2 rounded-lg backdrop-blur-md border flex items-center gap-2 transition-all justify-center shadow-none 
                        ${theme === 'dark' ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20' : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'}`}
                        title="Download Replay"
                        aria-label="Download Replay"
                    >
                        <Download size={16} />
                        <span className="text-[10px] font-bold hidden md:inline">Save</span>
                    </button>

                    <label
                        className={`p-2 rounded-lg backdrop-blur-md border flex items-center gap-2 transition-all justify-center cursor-pointer shadow-none 
                        ${theme === 'dark' ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20' : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'}`}
                        title="Upload Replay"
                        aria-label="Upload Replay"
                    >
                        <Upload size={16} />
                        <span className="text-[10px] font-bold hidden md:inline">Load</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleUploadReplay}
                            className="hidden"
                        />
                    </label>
                </div>

                <button
                    onClick={() => setShowRestartConfirm(true)}
                    className={`p-2 rounded-lg backdrop-blur-md border flex items-center gap-2 transition-all justify-center shadow-none 
                    ${theme === 'dark' ? 'bg-red-950/20 hover:bg-red-900/40 text-red-400/80 hover:text-red-300 border-red-900/20 hover:border-red-800/40' : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200'}`}
                    aria-label="Restart Game"
                >
                    <RotateCcw size={16} />
                    <span className="text-xs font-bold hidden md:inline">Restart</span>
                </button>

                <button
                    onClick={() => setShowRulebook(true)}
                    className={`p-2 rounded-lg backdrop-blur-md border flex items-center gap-2 transition-all justify-center shadow-none 
                    ${theme === 'dark' ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20' : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'}`}
                    aria-label="Open Rules"
                >
                    <BookOpen size={16} />
                    <span className="text-xs font-bold hidden md:inline">Rules</span>
                </button>

                <button
                    onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                    className={`p-2 rounded-lg backdrop-blur-md border flex items-center gap-2 transition-all justify-center shadow-none 
                    ${theme === 'dark' ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20' : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'}`}
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="text-xs font-bold hidden md:inline">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                </button>
            </div>

            {(showDebug ||
                (state.mode !== 'ONLINE_MULTIPLAYER' &&
                    (state.mode === 'PVE' || historyControls.historyLength === 0))) && (
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className={`fixed top-24 left-4 z-[100] p-2 rounded border text-[10px] transition-colors shadow-none 
                    ${theme === 'dark' ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20' : 'bg-white/80 hover:bg-red-100 text-stone-600 border-stone-300'}`}
                    >
                        {showDebug ? 'CLOSE DEBUG' : 'OPEN DEBUG'}
                    </button>
                )}

            {showDebug && state.mode !== 'ONLINE_MULTIPLAYER' && (
                <div className="fixed left-4 top-36 z-[90] flex flex-col gap-4 animate-in slide-in-from-left duration-300">
                    <DebugPanel
                        player="p1"
                        onAddCrowns={() => handleDebugAddCrowns('p1')}
                        onAddPoints={() => handleDebugAddPoints('p1')}
                        onAddPrivilege={() => handleDebugAddPrivilege('p1')}
                        onForceRoyal={() => handleForceRoyal()}
                        theme={theme}
                    />
                    <DebugPanel
                        player="p2"
                        onAddCrowns={() => handleDebugAddCrowns('p2')}
                        onAddPoints={() => handleDebugAddPoints('p2')}
                        onAddPrivilege={() => handleDebugAddPrivilege('p2')}
                        onForceRoyal={() => handleForceRoyal()}
                        theme={theme}
                    />
                </div>
            )}

            <React.Suspense fallback={<div className="fixed inset-0 z-[200] bg-black/50" />}>
                {showRulebook && <Rulebook onClose={() => setShowRulebook(false)} theme={theme} />}

                {activeModal?.type === 'PEEK' &&
                    (state.mode !== 'ONLINE_MULTIPLAYER' ||
                        activeModal.data?.initiator === (online.isHost ? 'p1' : 'p2')) && (
                        <DeckPeekModal
                            isOpen={true}
                            cards={activeModal.data.cards}
                            onClose={handleCloseModal}
                            theme={theme}
                        />
                    )}
            </React.Suspense>

            {persistentWinner && !isReviewing && (
                <WinnerModal
                    winner={persistentWinner as PlayerKey}
                    onReview={() => setIsReviewing(true)}
                />
            )}

            {phase === 'SELECT_CARD_COLOR' && (
                <div
                    className={`fixed inset-0 z-[100] transition-all duration-500 flex flex-col items-center justify-center ${isPeekingBoard ? 'bg-black/20 pointer-events-none' : 'bg-black/80'}`}
                >
                    {!isPeekingBoard ? (
                        <>
                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest animate-in fade-in zoom-in">
                                Select Joker Color
                            </h2>
                            <div className="flex gap-4 p-8 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
                                {BONUS_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleSelectBonusColor(color)}
                                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${GEM_TYPES[color.toUpperCase() as keyof typeof GEM_TYPES].color} border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-95 transition-all`}
                                        aria-label={`Select ${color} color`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setIsPeekingBoard(true)}
                                className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold border border-slate-600 transition-all hover:scale-105 active:scale-95"
                            >
                                <Users size={18} /> View Board
                            </button>
                        </>
                    ) : (
                        <div className="absolute bottom-12 pointer-events-auto animate-in fade-in slide-in-from-bottom-8">
                            <button
                                onClick={() => setIsPeekingBoard(false)}
                                className="flex items-center gap-3 px-10 py-5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-wider shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-all hover:scale-110 active:scale-95"
                            >
                                <ArrowLeft size={24} /> Back to Color Selection
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isReviewing && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setIsReviewing(false)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-600 transition-all hover:scale-105"
                    >
                        <RotateCcw size={18} /> Return to Results
                    </button>
                </div>
            )}

            {/* 2. Middle Game Area (Centered) */}
            <div className="flex-1 flex items-center justify-center min-h-0 relative z-30 px-4 pt-16 lg:pt-20 pb-4 transition-all duration-500">
                <div
                    className={`flex flex-col lg:flex-row gap-4 lg:gap-8 xl:gap-16 items-center justify-center transform ${settings.boardScale} lg:scale-100 origin-center lg:origin-center transition-all duration-500`}
                >
                    <div
                        className={`flex flex-row lg:flex-col items-center gap-4 transform ${settings.deckScale} lg:scale-100 origin-center`}
                    >
                        <Market
                            market={market}
                            decks={decks}
                            phase={effectiveGameMode}
                            turn={turn}
                            inventories={inventories}
                            playerTableau={playerTableau}
                            playerBuffs={playerBuffs}
                            handleReserveDeck={handleReserveDeck}
                            initiateBuy={initiateBuy}
                            handleReserveCard={handleReserveCard}
                            onPeekDeck={handlePeekDeck}
                            theme={theme}
                            isOnline={state.mode === 'ONLINE_MULTIPLAYER'}
                            localPlayer={online.isHost ? 'p1' : 'p2'}
                        />
                    </div>

                    <div className="relative flex flex-col items-center shrink-0">
                        {/* Fixed height container for Status/Online info */}
                        <div className="h-12 w-full flex items-center justify-center">
                            <StatusBar
                                errorMsg={errorMsg}
                                isOnline={state.mode === 'ONLINE_MULTIPLAYER'}
                                connectionStatus={online.connectionStatus}
                            />
                        </div>

                        <GameBoard
                            board={board}
                            bag={bag}
                            handleGemClick={handleGemClick}
                            isSelected={isSelected}
                            selectedGems={selectedGems}
                            phase={effectiveGameMode}
                            bonusGemTarget={bonusGemTarget}
                            theme={theme}
                            canInteract={isMyTurn}
                        />

                        {/* Fixed height container for actions to prevent board jumping */}
                        <div className="h-24 w-full flex items-start justify-center pt-4">
                            <GameActions
                                handleReplenish={handleReplenish}
                                bag={bag}
                                phase={effectiveGameMode}
                                handleConfirmTake={handleConfirmTake}
                                selectedGems={selectedGems}
                                handleCancelReserve={handleCancelReserve}
                                handleCancelSelection={handleCancelSelection}
                                handleCancelPrivilege={handleCancelPrivilege}
                                theme={theme}
                                canInteract={isMyTurn}
                            />
                        </div>
                    </div>

                    <div
                        className={`flex flex-row lg:flex-col gap-4 items-center transform ${settings.deckScale} lg:scale-100 origin-center`}
                    >
                        <RoyalCourt
                            royalDeck={royalDeck}
                            phase={effectiveGameMode}
                            handleSelectRoyal={handleSelectRoyal}
                            theme={theme}
                            canInteract={isMyTurn}
                        />
                        <div
                            className={`flex flex-col gap-3 items-center p-2 lg:p-3 transition-all duration-500`}
                        >
                            <ReplayControls
                                undo={historyControls.undo}
                                redo={historyControls.redo}
                                canUndo={
                                    state.mode !== 'ONLINE_MULTIPLAYER' && historyControls.canUndo
                                }
                                canRedo={
                                    state.mode !== 'ONLINE_MULTIPLAYER' && historyControls.canRedo
                                }
                                currentIndex={historyControls.currentIndex}
                                historyLength={historyControls.historyLength}
                                theme={theme}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`${settings.zoneHeight} shrink-0 flex w-full backdrop-blur-xl relative z-20 transition-all duration-500 
                ${theme === 'dark' ? 'bg-black/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/80'}`}
            >
                <div
                    className={`flex-1 relative transition-all duration-500 border-2
                    ${theme === 'dark'
                            ? 'border-white/5 bg-emerald-900/10'
                            : turn === 'p1' && !winner
                                ? 'animate-breathe-emerald bg-emerald-50/30'
                                : 'border-emerald-50 bg-emerald-50/30'
                        }`}
                >
                    <div
                        className={`w-full h-full transform ${settings.zoneScale} origin-center lg:scale-100`}
                    >
                        <PlayerZone
                            player="p1"
                            inventory={inventories.p1}
                            cards={playerTableau.p1}
                            reserved={playerReserved.p1}
                            royals={playerRoyals.p1}
                            privileges={privileges.p1}
                            extraPrivileges={extraPrivileges?.p1}
                            score={getPlayerScore('p1')}
                            crowns={getCrownCount('p1')}
                            lastFeedback={lastFeedback}
                            isActive={turn === 'p1' && !isReviewing && !winner}
                            onBuyReserved={checkAndInitiateBuyReserved}
                            onDiscardReserved={handleDiscardReserved}
                            onUsePrivilege={activatePrivilegeMode}
                            isPrivilegeMode={effectiveGameMode === 'PRIVILEGE_ACTION'}
                            isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn !== 'p1'}
                            isDiscardMode={
                                effectiveGameMode === 'DISCARD_EXCESS_GEMS' && turn === 'p1'
                            }
                            onGemClick={turn === 'p1' ? handleSelfGemClick : handleOpponentGemClick}
                            buff={playerBuffs?.p1}
                            theme={theme}
                        />
                    </div>
                </div>

                <div
                    className={`flex-1 relative transition-all duration-500 border-2
                    ${theme === 'dark'
                            ? 'border-white/5 bg-blue-900/10'
                            : turn === 'p2' && !winner
                                ? 'animate-breathe-blue bg-slate-50/30'
                                : 'border-blue-50 bg-slate-50/30'
                        }`}
                >
                    <div
                        className={`w-full h-full transform ${settings.zoneScale} origin-center lg:scale-100`}
                    >
                        <PlayerZone
                            player="p2"
                            inventory={inventories.p2}
                            cards={playerTableau.p2}
                            reserved={playerReserved.p2}
                            royals={playerRoyals.p2}
                            privileges={privileges.p2}
                            extraPrivileges={extraPrivileges?.p2}
                            score={getPlayerScore('p2')}
                            crowns={getCrownCount('p2')}
                            lastFeedback={lastFeedback}
                            isActive={turn === 'p2' && !isReviewing && !winner}
                            onBuyReserved={checkAndInitiateBuyReserved}
                            onDiscardReserved={handleDiscardReserved}
                            onUsePrivilege={activatePrivilegeMode}
                            isPrivilegeMode={effectiveGameMode === 'PRIVILEGE_ACTION'}
                            isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn !== 'p2'}
                            isDiscardMode={
                                effectiveGameMode === 'DISCARD_EXCESS_GEMS' && turn === 'p2'
                            }
                            onGemClick={turn === 'p2' ? handleSelfGemClick : handleOpponentGemClick}
                            buff={playerBuffs?.p2}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>

            {showRestartConfirm && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Restart Game?</h3>
                        <p className="text-slate-400 mb-8">
                            Are you sure you want to return to the title screen? Current progress
                            will be lost.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setShowRestartConfirm(false)}
                                className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRestart}
                                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-900/20 transition-all hover:scale-105"
                            >
                                Confirm Restart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
