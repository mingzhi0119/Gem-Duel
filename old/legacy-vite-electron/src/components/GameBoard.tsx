import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withGameAnimation } from '../hoc/withGameAnimation';
import { SPIRAL_ORDER } from '../constants';
import { BoardCell, BagItem, GamePhase, GemCoord, GemTypeObject } from '../types';

interface GemButtonProps {
    r: number;
    c: number;
    gem: BoardCell;
    isSelectedGem: boolean;
    isTarget: boolean;
    shouldDim: boolean;
    isInteractive: boolean;
    isGold: boolean;
    selectionIndex: number;
    onGemClick: (r: number, c: number) => void;
}

const GemButton: React.FC<GemButtonProps> = React.memo(
    ({
        r,
        c,
        gem,
        isSelectedGem,
        isTarget,
        shouldDim,
        isInteractive,
        isGold,
        selectionIndex,
        onGemClick,
    }) => {
        const handleClick = React.useCallback(() => {
            onGemClick(r, c);
        }, [r, c, onGemClick]);

        return (
            <button
                onClick={handleClick}
                disabled={!isInteractive}
                className={`w-full h-full rounded-full flex items-center justify-center ${!isInteractive ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <div
                    className={`w-full h-full rounded-full shadow-inner bg-gradient-to-br ${gem.type.color} border ${gem.type.border} 
                    ${isSelectedGem ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_white]' : 'opacity-90'} 
                    ${isTarget ? 'ring-4 ring-white animate-pulse z-20' : ''}
                    ${shouldDim ? 'opacity-20 grayscale' : ''}
                `}
                >
                    {isGold && (
                        <div className="absolute inset-0 flex items-center justify-center text-yellow-900 font-bold text-xs opacity-50">
                            G
                        </div>
                    )}
                    {isSelectedGem && (
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-lg">
                            {selectionIndex + 1}
                        </div>
                    )}
                </div>
            </button>
        );
    }
);

const AnimatedGem = withGameAnimation(GemButton);

interface GameBoardProps {
    board: BoardCell[][];
    bag: BagItem[];
    handleGemClick: (r: number, c: number) => void;
    isSelected: (r: number, c: number) => boolean;
    selectedGems: GemCoord[];
    phase: GamePhase | string;
    bonusGemTarget: GemTypeObject | null;
    theme: 'light' | 'dark';
    canInteract?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = React.memo(
    ({
        board,
        bag,
        handleGemClick,
        isSelected,
        selectedGems,
        phase,
        bonusGemTarget,
        theme,
        canInteract = true,
    }) => {
        return (
            <div
                className={`p-4 rounded-[2rem] border transition-all duration-500 backdrop-blur-md
            ${
                theme === 'dark'
                    ? 'bg-slate-800/40 border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'bg-white border-stone-200/60'
            }
            ${phase === 'DISCARD_EXCESS_GEMS' ? 'border-red-500/50 ring-2 ring-red-500/10' : ''}
        `}
            >
                <div
                    className={`text-right text-[10px] mb-2 font-mono font-bold tracking-tighter ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                >
                    BAG: {bag.length}
                </div>
                <div
                    className={`grid grid-cols-5 grid-rows-5 gap-2 w-[300px] h-[300px] ${!canInteract ? 'pointer-events-none' : ''}`}
                >
                    {board.map((row, r) =>
                        row.map((gem, c) => {
                            const isSelectedGem = isSelected(r, c);
                            const isGold = gem?.type?.id === 'gold';
                            const isEmpty = !gem || gem.type.id === 'empty';

                            // Target Logic
                            let isTarget = false;
                            if (phase === 'RESERVE_WAITING_GEM') isTarget = isGold;
                            else if (phase === 'PRIVILEGE_ACTION') isTarget = !isGold && !isEmpty;
                            else if (phase === 'BONUS_ACTION')
                                isTarget = gem.type.id === bonusGemTarget?.id;

                            const isTargetSelectionMode = [
                                'RESERVE_WAITING_GEM',
                                'PRIVILEGE_ACTION',
                                'BONUS_ACTION',
                            ].includes(phase);
                            const shouldDim = isTargetSelectionMode && !isTarget && !isEmpty;

                            const isReviewOrOver = phase === 'REVIEW' || phase === 'GAME_OVER';
                            const isInteractive = !isEmpty && !isReviewOrOver;

                            // Find index in spiral order for sequential entry animation
                            const orderIndex = SPIRAL_ORDER.findIndex(
                                ([sr, sc]) => sr === r && sc === c
                            );

                            return (
                                <div
                                    key={`${r}-${c}`} // Stable Grid Key
                                    className="relative w-full h-full flex items-center justify-center"
                                >
                                    <AnimatePresence mode="wait">
                                        {!isEmpty ? (
                                            <AnimatedGem
                                                key={gem.uid} // Dynamic Gem Key triggers animation on change
                                                r={r}
                                                c={c}
                                                gem={gem}
                                                isSelectedGem={isSelectedGem}
                                                isTarget={isTarget}
                                                shouldDim={shouldDim}
                                                isInteractive={isInteractive}
                                                isGold={isGold}
                                                selectionIndex={selectedGems.findIndex(
                                                    (s) => s.r === r && s.c === c
                                                )}
                                                onGemClick={handleGemClick}
                                                animationConfig={{
                                                    mode: 'scale',
                                                    hoverScale: 1.1,
                                                    tapScale: 0.95,
                                                    layout: false,
                                                    className: 'w-full h-full',
                                                    delay: orderIndex * 0.05,
                                                }}
                                            />
                                        ) : (
                                            <motion.div
                                                key="empty" // Dynamic Empty Key
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-300/50'}`}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }
);
