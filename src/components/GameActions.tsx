import React from 'react';
import { Check, RefreshCw, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamePhase, BagItem, Buff, GemCoord } from '../types';

interface GameActionsProps {
    handleReplenish: () => void;
    bag?: BagItem[];
    phase: GamePhase | string;
    handleConfirmTake: () => void;
    selectedGems?: GemCoord[];
    handleCancelReserve: () => void;
    handleCancelSelection: () => void;
    handleCancelPrivilege: () => void;
    theme: 'light' | 'dark';
    canInteract?: boolean;
}

export const GameActions: React.FC<GameActionsProps> = ({
    handleReplenish,
    bag = [],
    phase,
    handleConfirmTake,
    selectedGems = [],
    handleCancelReserve,
    handleCancelSelection,
    handleCancelPrivilege,
    theme,
    canInteract = true,
}) => {
    const bagCount = bag ? bag.length : 0;
    const selectedCount = selectedGems ? selectedGems.length : 0;

    return (
        <div
            className={`flex flex-col gap-4 items-center z-50 justify-start ${!canInteract ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <AnimatePresence mode="wait">
                {(phase === 'RESERVE_WAITING_GEM' || phase === 'PRIVILEGE_ACTION') && (
                    <motion.div
                        key="cancel-action"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={
                                phase === 'RESERVE_WAITING_GEM'
                                    ? handleCancelReserve
                                    : handleCancelPrivilege
                            }
                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-rose-900/20 transition-colors"
                        >
                            <X size={18} /> Cancel
                        </motion.button>
                    </motion.div>
                )}

                {phase === 'IDLE' && (
                    <motion.div
                        key="idle-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-wrap justify-center gap-2"
                    >
                        {/* Confirm Selection (Get Gem) */}
                        <AnimatePresence mode="popLayout">
                            {selectedCount > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleConfirmTake}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-emerald-900/20 transition-colors"
                                >
                                    <Check size={18} /> Confirm
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Replenish Board or Cancel Selection */}
                        {selectedCount > 0 ? (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancelSelection}
                                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg shadow-rose-900/20 transition-colors"
                            >
                                <X size={16} /> Cancel
                            </motion.button>
                        ) : (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileTap={
                                    selectedCount === 0 && bagCount > 0 ? { scale: 0.95 } : {}
                                }
                                onClick={handleReplenish}
                                disabled={bagCount === 0 || phase !== 'IDLE' || selectedCount > 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 border
                                ${bagCount > 0 && phase === 'IDLE' && selectedCount === 0
                                        ? theme === 'dark'
                                            ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                                            : 'bg-white border-stone-300 text-stone-800 shadow-sm hover:border-stone-400 active:bg-stone-100'
                                        : (theme === 'dark'
                                            ? 'bg-slate-900/20 border-slate-800/50 text-slate-700'
                                            : 'bg-stone-100/50 border-stone-200/50 text-stone-400') +
                                        ' cursor-default opacity-50'
                                    }`}
                            >
                                <RefreshCw size={16} />
                                Refill ({bagCount})
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
