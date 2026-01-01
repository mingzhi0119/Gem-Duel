import React, { useCallback } from 'react';
import { Layers } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { withGameAnimation } from '../hoc/withGameAnimation';
import { calculateTransaction } from '../utils';
import {
    Card as CardType,
    GamePhase,
    PlayerKey,
    GemInventory,
    Buff,
    InitiateBuyJokerPayload,
} from '../types';

const AnimatedCard = withGameAnimation(Card);

interface MarketProps {
    market: Record<number, (CardType | null)[]>;
    decks: Record<number, CardType[]>;
    phase: GamePhase | string;
    turn: PlayerKey;
    inventories: Record<PlayerKey, GemInventory>;
    playerTableau: Record<PlayerKey, CardType[]>;
    playerBuffs: Record<PlayerKey, Buff>;
    handleReserveDeck: (level: number) => void;
    initiateBuy: (
        card: CardType,
        source: string,
        marketInfo?: InitiateBuyJokerPayload['marketInfo']
    ) => void;
    handleReserveCard: (card: CardType, level: number, idx: number) => void;
    onPeekDeck?: (level: number) => void;
    theme: 'light' | 'dark';
    isOnline?: boolean;
    localPlayer?: PlayerKey;
}

export const Market: React.FC<MarketProps> = React.memo(
    ({
        market,
        decks,
        phase,
        turn,
        inventories,
        playerTableau,
        playerBuffs,
        handleReserveDeck,
        initiateBuy,
        handleReserveCard,
        onPeekDeck,
        theme,
        isOnline,
        localPlayer,
    }) => {
        // Validation: Is it my turn and not in review/game over?
        const canInteract =
            (!isOnline || turn === localPlayer) && phase !== 'REVIEW' && phase !== 'GAME_OVER';
        const activeBuff = playerBuffs[turn];
        const hasIntelligence =
            activeBuff?.effects?.active === 'peek_deck' && phase === 'IDLE' && canInteract;

        // Optimization: Stable callback for buying cards
        const handleBuy = useCallback(
            (card: CardType, context?: Record<string, unknown>) => {
                if (canInteract && card && context) {
                    initiateBuy(card, 'market', context as InitiateBuyJokerPayload['marketInfo']);
                }
            },
            [initiateBuy, canInteract]
        );

        // Optimization: Stable callback for reserving cards
        const handleReserve = useCallback(
            (card: CardType, context?: Record<string, unknown>) => {
                if (canInteract && card && context) {
                    handleReserveCard(card, context.level as number, context.idx as number);
                }
            },
            [handleReserveCard, canInteract]
        );

        return (
            <div
                className={`flex flex-col gap-6 items-center shrink-0 p-8 rounded-[2.5rem] transition-all duration-500 backdrop-blur-sm
                ${theme === 'dark' ? 'bg-transparent border-none shadow-none' : 'bg-transparent'}
                ${!canInteract ? 'opacity-80' : ''}`}
            >
                <h2
                    className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-center 
                    ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                >
                    Market
                </h2>

                {/* Intelligence Network Floating Action (Positioned Left) */}
                {hasIntelligence && (
                    <div
                        className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-3 rounded-xl border animate-in slide-in-from-right-4 fade-in duration-500 z-50
                        ${theme === 'dark' ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50/50 border-purple-200'}
                    `}
                    >
                        <div className="text-purple-400 text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap">
                            Intelligence
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {[3, 2, 1].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => onPeekDeck && onPeekDeck(lvl)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
                                >
                                    Peek L{lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {[3, 2, 1].map((lvl) => {
                    // Visibility Logic
                    const visibilitySource = isOnline && localPlayer ? localPlayer : turn;
                    const visibilityBuffs = playerBuffs?.[visibilitySource]?.effects?.passive || {};

                    const revealL1 = lvl === 1 && visibilityBuffs.revealDeck1;
                    const revealL3 = lvl === 3 && visibilityBuffs.extraL3;

                    const deck = decks[lvl];
                    const topCard = deck.length > 0 ? deck[deck.length - 1] : null;

                    const extraL3Cards =
                        lvl === 3 && revealL3
                            ? [
                                  deck.length > 1 ? deck[deck.length - 2] : null,
                                  deck.length > 2 ? deck[deck.length - 3] : null,
                              ].filter(Boolean)
                            : [];

                    return (
                        <div key={lvl} className="flex gap-3 justify-center items-center relative">
                            {/* Deck Container */}
                            <div className="relative">
                                {/* Insight Buff (L1 Peek) - Positioned to the left of L1 Deck */}
                                {lvl === 1 && revealL1 && topCard && (
                                    <div className="absolute right-full mr-4 animate-in slide-in-from-right-4 fade-in duration-500">
                                        <div className="relative p-1 border-2 border-dashed border-purple-500/50 rounded-xl">
                                            <Card
                                                card={topCard}
                                                canBuy={false}
                                                theme={theme}
                                                isDeckPreview={true}
                                            />
                                            <div className="absolute inset-0 bg-black/20 rounded-lg pointer-events-none" />
                                        </div>
                                        <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest text-center mt-1">
                                            Insight
                                        </div>
                                    </div>
                                )}

                                {/* Extra Cards for All-Seeing Eye (Positioned absolutely to the left) */}
                                {lvl === 3 && extraL3Cards.length > 0 && (
                                    <div className="absolute right-full mr-4 flex gap-2 top-0">
                                        {extraL3Cards.map((card, idx) => (
                                            <div
                                                key={`extra-${idx}`}
                                                className="animate-in slide-in-from-right-4 fade-in duration-500"
                                            >
                                                <Card
                                                    card={card}
                                                    canBuy={
                                                        phase === 'IDLE' &&
                                                        canInteract &&
                                                        card !== null &&
                                                        calculateTransaction(
                                                            card,
                                                            inventories[turn],
                                                            playerTableau[turn],
                                                            playerBuffs[turn],
                                                            false
                                                        ).affordable
                                                    }
                                                    context={JSON.stringify({
                                                        level: 3,
                                                        isExtra: true,
                                                        extraIdx: idx + 1,
                                                    })}
                                                    onClick={handleBuy}
                                                    onReserve={
                                                        canInteract ? handleReserve : undefined
                                                    }
                                                    theme={theme}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div
                                    onClick={() => canInteract && handleReserveDeck(lvl)}
                                    className={`w-24 h-32 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden group
                            ${
                                phase === 'IDLE' && canInteract && decks[lvl].length > 0
                                    ? (theme === 'dark'
                                          ? 'border-slate-600 hover:border-emerald-400'
                                          : 'border-slate-400 hover:border-emerald-500') +
                                      ' cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0'
                                    : (theme === 'dark'
                                          ? 'border-slate-800 opacity-40'
                                          : 'border-slate-300 opacity-40') + ' cursor-default'
                            }
                        `}
                                >
                                    <div
                                        className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'}`}
                                    />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <Layers size={18} className="text-slate-500 mb-1" />
                                        <div className="text-slate-400 font-bold text-[10px]">
                                            Lvl {lvl}
                                        </div>
                                        <div className="text-slate-600 text-[9px] font-mono">
                                            {decks[lvl].length}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Cards */}
                            <div className="flex gap-3">
                                {market[lvl].map((card, i) => (
                                    <div
                                        key={`slot-${lvl}-${i}`}
                                        className="relative w-24 h-32 flex items-center justify-center"
                                    >
                                        <AnimatePresence mode="wait">
                                            {card && (
                                                <AnimatedCard
                                                    key={card.id} // Stable Card ID triggers exit/enter on change
                                                    card={card}
                                                    canBuy={
                                                        phase === 'IDLE' &&
                                                        canInteract &&
                                                        calculateTransaction(
                                                            card,
                                                            inventories[turn],
                                                            playerTableau[turn],
                                                            playerBuffs[turn],
                                                            false
                                                        ).affordable
                                                    }
                                                    context={JSON.stringify({ level: lvl, idx: i })}
                                                    onClick={handleBuy}
                                                    onReserve={
                                                        canInteract ? handleReserve : undefined
                                                    }
                                                    theme={theme}
                                                    animationConfig={{
                                                        mode:
                                                            card.bonusColor === 'null'
                                                                ? 'prestige'
                                                                : 'acquire',
                                                        layout: false,
                                                        // P1 is on the left, P2 is on the right.
                                                        // Market is also on the left.
                                                        targetX: turn === 'p1' ? 0 : 600,
                                                        targetY: 500,
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
);
