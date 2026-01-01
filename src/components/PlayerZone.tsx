import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scroll, Swords, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GEM_TYPES, BONUS_COLORS, BUFFS } from '../constants';
import { GemIcon } from './GemIcon';
import { Card } from './Card';
import { FloatingText, FloatingGem } from './VisualFeedback';
import { BUFF_STYLES } from '../styles/buffs';
import { cn } from '../utils';
import {
    PlayerKey,
    GemInventory,
    Card as CardType,
    RoyalCard,
    Buff,
    GemColor,
    GemTypeObject,
} from '../types';

interface PlayerZoneProps {
    player: PlayerKey;
    inventory: GemInventory;
    cards: CardType[];
    reserved: CardType[];
    royals?: RoyalCard[];
    privileges: number;
    extraPrivileges?: number;
    isActive: boolean;
    lastFeedback: {
        uid: string;
        items: Array<{ player: PlayerKey; type: string; diff: number }>;
    } | null;
    onBuyReserved: (card: CardType, execute?: boolean) => boolean;
    onDiscardReserved: (cardId: string) => void;
    onUsePrivilege: () => void;
    isPrivilegeMode: boolean;
    onGemClick: (color: string) => void;
    isStealMode: boolean;
    isDiscardMode: boolean;
    buff: Buff;
    theme: 'light' | 'dark';
    score: number;
    crowns: number;
}

interface StackOverlayProps {
    isOpen: boolean;
    color: string;
    cards: CardType[];
    onClose: () => void;
    theme: 'light' | 'dark';
}

const StackOverlay: React.FC<StackOverlayProps> = ({ isOpen, color, cards, onClose, theme }) => {
    if (!isOpen) return null;
    const type = GEM_TYPES[color.toUpperCase() as keyof typeof GEM_TYPES] || GEM_TYPES.NULL;

    const colorMap: Record<string, string> = {
        blue: '#60a5fa', // blue-400
        white: '#f1f5f9', // slate-100
        green: '#34d399', // emerald-400
        black: '#94a3b8', // slate-400
        red: '#f87171', // red-400
        pearl: '#f472b6', // pink-400
        gold: '#fbbf24', // amber-400
    };

    const textColor = colorMap[type.id] || '#94a3b8';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-[600] rounded-2xl flex flex-col overflow-hidden shadow-inner ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'}`}
        >
            {/* Color Label */}
            <div className="absolute top-3 left-4 z-[610] flex items-center gap-2">
                <span
                    className="text-sm font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm"
                    style={{ color: textColor }}
                >
                    Color: {type.label}
                </span>
            </div>

            <div className="absolute top-2 right-2 z-[610]">
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                    <Shield size={16} className="rotate-45" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-wrap items-center justify-center gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.id || i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                        <Card card={card} canBuy={false} theme={theme} size="default" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export const PlayerZone: React.FC<PlayerZoneProps> = ({
    player,
    inventory,
    cards,
    reserved,
    royals = [],
    privileges,
    extraPrivileges = 0,
    isActive,
    lastFeedback,
    onBuyReserved,
    onDiscardReserved,
    onUsePrivilege,
    isPrivilegeMode,
    onGemClick,
    isStealMode,
    isDiscardMode,
    buff,
    theme,
}) => {
    const safeCards = Array.isArray(cards) ? cards : [];
    const [selectedStack, setSelectedStack] = useState<{ color: string; cards: CardType[] } | null>(
        null
    );

    const hasPuppetMaster =
        buff?.effects?.active === 'discard_reserved' || buff?.id === 'puppet_master';

    // --- Visual Feedback Logic ---
    interface FeedbackItem {
        id: number;
        quantity: string;
        label: string;
        type: string;
    }
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isExtortionEffect, setIsExtortionEffect] = useState(false);
    const lastSeenFeedbackUid = useRef<string | null>(null);

    // Only display stacks for valid gem colors.
    // Pure point cards (gray) are direct score contributions and not stacked visually.
    const displayColors = [...BONUS_COLORS];

    useEffect(() => {
        if (lastFeedback && lastFeedback.uid !== lastSeenFeedbackUid.current) {
            lastSeenFeedbackUid.current = lastFeedback.uid;
            const myItems = lastFeedback.items.filter(
                (item: { player: PlayerKey; type: string; diff: number }) => item.player === player
            );

            if (myItems.some((i: { type: string }) => i.type === 'extortion')) {
                setIsExtortionEffect(true);
                setTimeout(() => setIsExtortionEffect(false), 1000);
            }

            myItems.forEach((item: { type: string; diff: number }) => {
                const id = Date.now() + Math.random();
                const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);
                const quantity = item.diff > 0 ? `+${item.diff}` : `${item.diff}`;
                setFeedbacks((prev) => [...prev, { id, quantity, label, type: item.type }]);
                setTimeout(() => setFeedbacks((prev) => prev.filter((f) => f.id !== id)), 1500);
            });
        }
    }, [lastFeedback, player]);

    const colorStats = displayColors.reduce(
        (acc: Record<string, { cards: CardType[]; bonusCount: number; points: number }>, color) => {
            const colorCards = safeCards.filter((c) => c.bonusColor === color);
            acc[color] = {
                cards: colorCards,
                bonusCount: colorCards.reduce((sum, c) => sum + (c.bonusCount ?? 1), 0),
                points: colorCards.reduce((sum, c) => sum + c.points, 0),
            };
            return acc;
        },
        {}
    );

    return (
        <div
            className={`flex w-full h-full flex-row items-center p-4 transition-all duration-500 gap-4
        ${
            isActive
                ? theme === 'dark'
                    ? 'bg-slate-900/80'
                    : 'bg-white/80'
                : theme === 'dark'
                  ? 'bg-slate-950/40 opacity-90'
                  : 'bg-slate-100/40 opacity-90'
        }
        ${isActive ? `ring-1 ${player === 'p1' ? 'ring-emerald-500/30' : 'ring-blue-500/30'}` : ''} 
        ${isStealMode ? 'ring-2 ring-rose-500 animate-pulse' : ''}
        ${isDiscardMode && isActive ? 'ring-2 ring-red-500 animate-pulse' : ''}
        ${isExtortionEffect ? 'ring-4 ring-purple-500 bg-purple-500/10 animate-pulse' : ''}
    `}
        >
            <AnimatePresence>
                {selectedStack && (
                    <StackOverlay
                        isOpen={true}
                        color={selectedStack.color}
                        cards={selectedStack.cards}
                        onClose={() => setSelectedStack(null)}
                        theme={theme}
                    />
                )}
            </AnimatePresence>

            {/* Module 1: Identity & Privileges */}
            <div
                className={`flex flex-col gap-4 min-w-[100px] shrink-0 items-center justify-start pt-2 border-r pr-4 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800' : 'border-stone-200'}
      `}
            >
                <div className="flex flex-col items-center gap-1">
                    <div
                        className={`p-2 rounded-full ${isActive ? (player === 'p1' ? 'bg-emerald-600' : 'bg-blue-600') : theme === 'dark' ? 'bg-slate-700' : 'bg-stone-300'}`}
                    >
                        {player === 'p1' ? (
                            <Shield
                                size={20}
                                className={
                                    theme === 'dark' || isActive ? 'text-white' : 'text-stone-600'
                                }
                            />
                        ) : (
                            <Swords
                                size={20}
                                className={
                                    theme === 'dark' || isActive ? 'text-white' : 'text-stone-600'
                                }
                            />
                        )}
                    </div>
                    <h3
                        className={`font-black text-[10px] whitespace-nowrap uppercase tracking-[0.2em] ${isActive ? (player === 'p1' ? 'text-emerald-600' : 'text-blue-600') : 'text-stone-400'}`}
                    >
                        {player === 'p1' ? 'Player 1' : 'Player 2'}
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 justify-items-start h-[48px] items-start">
                    {(() => {
                        const total = privileges + extraPrivileges;
                        const items = [];
                        let currentIndex = 0;

                        // Collect standard scrolls
                        for (let i = 0; i < Math.max(0, privileges); i++) {
                            const idx = currentIndex++;
                            items.push(
                                <button
                                    key={`std-${i}`}
                                    disabled={!isActive || isPrivilegeMode}
                                    onClick={onUsePrivilege}
                                    className={cn(
                                        'transition-all',
                                        isActive && !isPrivilegeMode
                                            ? 'hover:scale-110 hover:text-amber-100 cursor-pointer animate-pulse'
                                            : 'opacity-80 cursor-default',
                                        (total === 1 || (total === 3 && idx === 2)) &&
                                            'col-span-2 justify-self-center'
                                    )}
                                >
                                    <Scroll
                                        size={20}
                                        fill="#fcd34d"
                                        className={
                                            theme === 'dark' ? 'text-amber-200' : 'text-amber-500'
                                        }
                                    />
                                </button>
                            );
                        }

                        // Collect extra scrolls
                        for (let i = 0; i < Math.max(0, extraPrivileges); i++) {
                            const idx = currentIndex++;
                            items.push(
                                <button
                                    key={`extra-${i}`}
                                    disabled={!isActive || isPrivilegeMode}
                                    onClick={onUsePrivilege}
                                    className={cn(
                                        'transition-all',
                                        isActive && !isPrivilegeMode
                                            ? 'hover:scale-110 hover:text-yellow-200 cursor-pointer animate-pulse'
                                            : 'opacity-80 cursor-default',
                                        (total === 1 || (total === 3 && idx === 2)) &&
                                            'col-span-2 justify-self-center'
                                    )}
                                    title="Special Privilege (Protected)"
                                >
                                    <Scroll size={20} fill="#fbbf24" className="text-yellow-500" />
                                </button>
                            );
                        }

                        if (items.length === 0) {
                            return (
                                <div className="col-span-2 justify-self-center">
                                    <Scroll
                                        size={20}
                                        className={
                                            theme === 'dark' ? 'text-slate-800' : 'text-stone-200'
                                        }
                                    />
                                </div>
                            );
                        }

                        return items;
                    })()}
                </div>
            </div>

            {/* Module 2: Resources (Inventory & Stacks) */}
            <div className="flex flex-col gap-3 shrink-0 justify-center" style={{ flex: 65 }}>
                {/* Gems Row */}
                <div className="flex gap-3 justify-center">
                    {(Object.values(GEM_TYPES) as GemTypeObject[])
                        .filter((g) => g.id !== 'empty') // Neutral is for card bg only
                        .map((gem) => {
                            const count = inventory[gem.id as GemColor] || 0;
                            const isClickable =
                                (isStealMode && count > 0 && gem.id !== 'gold') ||
                                (isDiscardMode && count > 0);

                            return (
                                <div
                                    key={gem.id}
                                    onClick={() => isClickable && onGemClick && onGemClick(gem.id)}
                                    className={`relative transition-all group ${isClickable ? 'cursor-pointer hover:scale-110 active:scale-95 ring-2 ring-rose-500 rounded-full' : ''}`}
                                >
                                    <AnimatePresence>
                                        {feedbacks
                                            .filter((f) => f.type === gem.id)
                                            .map((f) =>
                                                // If the label is a Gem Color (e.g. 'Blue'), show FloatingGem
                                                // Otherwise show FloatingText (e.g. for text-based feedback if any, though mostly colors now)
                                                // Actually, let's prefer FloatingGem for valid gem types
                                                Object.keys(GEM_TYPES)
                                                    .map((k) => k.toLowerCase())
                                                    .includes(f.type) ? (
                                                    <FloatingGem
                                                        key={f.id}
                                                        type={f.type}
                                                        count={parseInt(f.quantity)}
                                                        theme={theme}
                                                    />
                                                ) : (
                                                    <FloatingText
                                                        key={f.id}
                                                        quantity={f.quantity}
                                                        label={f.label}
                                                    />
                                                )
                                            )}
                                    </AnimatePresence>
                                    <GemIcon
                                        type={gem}
                                        size="w-10 h-10"
                                        count={count}
                                        theme={theme}
                                        className={
                                            count === 0 ? 'grayscale opacity-30' : 'shadow-lg'
                                        }
                                    />
                                </div>
                            );
                        })}
                </div>

                {/* Card Stacks & Bonuses */}
                <div className="flex gap-3 items-start justify-center mt-1">
                    {displayColors.map((color) => {
                        const stats = colorStats[color];
                        const type = GEM_TYPES[color.toUpperCase() as keyof typeof GEM_TYPES];

                        return (
                            <div
                                key={color}
                                className="flex flex-col items-center gap-1 min-w-[32px]"
                                onClick={() =>
                                    stats.cards.length > 0 &&
                                    setSelectedStack({ color, cards: stats.cards })
                                }
                            >
                                <motion.div
                                    animate={stats.cards.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                                    key={stats.cards.length}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="relative w-[72px] h-[96px] group/stack cursor-pointer transition-transform hover:scale-105 active:scale-95"
                                >
                                    {stats.cards.length > 0 ? (
                                        stats.cards.map((card: CardType, idx: number) => (
                                            <div
                                                key={idx}
                                                className="absolute inset-0 z-10"
                                                style={{
                                                    top: `${idx * -2}px`,
                                                    left: `${idx * 1}px`,
                                                }}
                                            >
                                                {/* Only the top card is fully rendered, but we keep the structure for stacking */}
                                                {idx === stats.cards.length - 1 ? (
                                                    <Card
                                                        card={card}
                                                        canBuy={false}
                                                        size="small"
                                                        theme={theme}
                                                        className="shadow-md"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-[72px] h-[96px] rounded border ${type.border} bg-gradient-to-br ${type.color} shadow-sm transition-all duration-200 opacity-40`}
                                                    />
                                                )}

                                                {/* Global Score Indicator (Center of the top card) */}
                                                {idx === stats.cards.length - 1 &&
                                                    stats.points > 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                                            <motion.div
                                                                animate={
                                                                    stats.points >= 7
                                                                        ? {
                                                                              scale: [1, 1.1, 1],
                                                                              filter: [
                                                                                  'drop-shadow(0 0 2px #fbbf24)',
                                                                                  'drop-shadow(0 0 8px #f59e0b)',
                                                                                  'drop-shadow(0 0 2px #fbbf24)',
                                                                              ],
                                                                          }
                                                                        : {}
                                                                }
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                    ease: 'easeInOut',
                                                                }}
                                                                className={cn(
                                                                    'px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-[2px] border shadow-xl transition-colors',
                                                                    stats.points >= 7
                                                                        ? 'border-amber-400 shadow-amber-500/20'
                                                                        : 'border-white/20'
                                                                )}
                                                            >
                                                                <span
                                                                    className={cn(
                                                                        'text-sm font-black drop-shadow-md',
                                                                        stats.points >= 7
                                                                            ? 'text-amber-400'
                                                                            : 'text-amber-200/90'
                                                                    )}
                                                                >
                                                                    {stats.points}
                                                                </span>
                                                            </motion.div>
                                                        </div>
                                                    )}

                                                {/* Global Bonus Indicator (Bottom Right of the top card) */}
                                                {idx === stats.cards.length - 1 &&
                                                    stats.bonusCount > 0 && (
                                                        <div className="absolute -bottom-2 -right-2 z-40">
                                                            <div
                                                                className={`px-1.5 py-0.5 rounded-full border shadow-lg flex gap-0.5 items-center ${theme === 'dark' ? 'bg-slate-950 text-white border-slate-700' : 'bg-white text-stone-800 border-stone-300'}`}
                                                            >
                                                                <span className="text-[10px] font-black">
                                                                    {stats.bonusCount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            className={`w-[72px] h-[96px] rounded border border-dashed flex items-center justify-center ${theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-stone-200 bg-stone-100/50'}`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-gradient-to-br ${type.color} opacity-20`}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Module 3: Reserved & Royals (Compact) */}
            <div
                className={`flex flex-col justify-center gap-2 border-l pl-4 min-w-0 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800' : 'border-stone-200'}
      `}
                style={{ flex: 35 }}
            >
                {/* Reserved Section - No Stacking */}
                <div className="w-full flex items-center justify-start gap-2 overflow-x-auto py-1">
                    {reserved.length === 0 && (
                        <span
                            className={`text-[10px] italic w-full text-center ${theme === 'dark' ? 'text-slate-700' : 'text-stone-400'}`}
                        >
                            No Reserved Cards
                        </span>
                    )}
                    {reserved.map((card, i) => (
                        <div
                            key={i}
                            className="transition-transform duration-200 ease-in-out shrink-0 relative group/card"
                        >
                            <Card
                                card={card}
                                canBuy={isActive && onBuyReserved(card)}
                                onClick={() =>
                                    isActive && onBuyReserved(card) && onBuyReserved(card, true)
                                }
                                isReservedView={true}
                                size="small"
                                theme={theme}
                            />
                            {hasPuppetMaster && isActive && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDiscardReserved(card.id);
                                    }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg border border-white/20 opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-rose-500 z-50"
                                    title="Discard Card (Puppet Master)"
                                >
                                    <span className="text-[10px] font-black">X</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Royal Section - No Stacking */}
                <div className="w-full flex items-center justify-start gap-2 overflow-x-auto py-1">
                    {royals.length === 0 && (
                        <span
                            className={`text-[10px] italic w-full text-center ${theme === 'dark' ? 'text-slate-700' : 'text-stone-400'}`}
                        >
                            No Royal Cards
                        </span>
                    )}
                    {royals.map((card, i) => (
                        <div
                            key={i}
                            className="transition-transform duration-200 ease-in-out shrink-0"
                        >
                            <Card
                                card={card as unknown as CardType}
                                isRoyal={true}
                                size="small"
                                theme={theme}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
