import React, { useEffect, useState, useRef } from 'react';
import {
    Crown,
    Trophy,
    Sparkles,
    Coins,
    Tag,
    Zap,
    Eye,
    Search,
    Hand,
    ArrowDownCircle,
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { PlayerKey, Buff, BuffEffects } from '../types';
import { BUFFS } from '../constants';
import { BUFF_STYLES } from '../styles/buffs';

interface AnimatedScoreProps {
    value: number;
    className?: string;
    theme: 'light' | 'dark';
}

const AnimatedScore: React.FC<AnimatedScoreProps> = ({ value, className, theme }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isPulsing, setIsPulsing] = useState(false);
    const prevValue = useRef(value);

    // Define pulse colors based on theme
    const pulseColors =
        theme === 'dark'
            ? ['#ffffff', '#fbbf24', '#ffffff'] // White -> Amber -> White
            : ['#0f172a', '#ea580c', '#0f172a']; // Slate-900 -> Orange-600 -> Slate-900

    useEffect(() => {
        if (value !== prevValue.current) {
            const delta = Math.abs(value - prevValue.current);
            const stepDuration = 0.1; // 100ms per point

            // Animate the number rolling
            const controls = animate(prevValue.current, value, {
                duration: delta * stepDuration,
                ease: 'linear',
                onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
            });

            if (value > prevValue.current) {
                setIsPulsing(true);
                setTimeout(() => setIsPulsing(false), 600);
            }

            prevValue.current = value;
            return () => controls.stop();
        }
    }, [value]);

    return (
        <motion.span
            animate={isPulsing ? { scale: [1, 1.4, 1], color: pulseColors } : {}}
            className={className}
        >
            <motion.span>{displayValue}</motion.span>
        </motion.span>
    );
};

interface TopBarProps {
    p1Score: number;
    p1Crowns: number;
    p2Score: number;
    p2Crowns: number;
    playerTurnCounts: Record<PlayerKey, number>;
    activePlayer: PlayerKey;
    theme: 'light' | 'dark';
    playerBuffs?: Record<PlayerKey, Buff>;
    localPlayer?: PlayerKey;
    isOnline?: boolean;
}

const TopBarBuff = ({
    buff: rawBuff,
    playerKey,
    theme,
}: {
    buff: Buff;
    playerKey: PlayerKey;
    theme: 'light' | 'dark';
}) => {
    if (!rawBuff || rawBuff.id === 'none') return null;

    const buff = (Object.values(BUFFS).find((b) => b.id === rawBuff.id) as Buff) || rawBuff;

    const getBuffIcon = (category?: string) => {
        switch (category) {
            case 'economy':
                return { Icon: Coins, color: 'text-amber-400' };
            case 'discount':
                return { Icon: Tag, color: 'text-blue-400' };
            case 'control':
                return { Icon: Zap, color: 'text-red-500' };
            case 'intel':
                return { Icon: Eye, color: 'text-cyan-400' };
            case 'victory':
                return { Icon: Trophy, color: 'text-orange-500' };
            default:
                return { Icon: Sparkles, color: 'text-purple-400' };
        }
    };

    const { Icon, color: iconColor } = getBuffIcon(buff.category);

    // Theme-aware level styles
    const levelStyles: Record<number, string> = {
        1:
            theme === 'dark'
                ? 'border-blue-400 bg-blue-900/30 text-blue-200'
                : 'border-blue-500 bg-blue-50 text-blue-700',
        2:
            theme === 'dark'
                ? 'border-purple-400 bg-purple-900/30 text-purple-200'
                : 'border-purple-500 bg-purple-50 text-purple-700',
        3:
            theme === 'dark'
                ? 'border-amber-400 bg-amber-900/30 text-amber-200'
                : 'border-amber-500 bg-amber-50 text-amber-700',
    };

    const levelStyle =
        levelStyles[buff.level] ||
        (theme === 'dark'
            ? 'border-slate-500 bg-slate-500/20 text-slate-300'
            : 'border-slate-400 bg-slate-50 text-slate-600');

    return (
        <div className="relative group flex flex-col items-center">
            <div
                className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest cursor-help transition-all hover:scale-105 shadow-md
                ${levelStyle}
            `}
            >
                <Icon size={12} className={iconColor} />
                <span>{buff.label}</span>
            </div>

            {/* Tooltip */}
            <div
                className={`
                absolute top-full mt-3 w-56 p-3 rounded-xl border shadow-2xl backdrop-blur-md z-[500] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform -translate-x-1/2 left-1/2 scale-95 group-hover:scale-100
                ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}
            `}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${playerKey === 'p1' ? 'text-emerald-400' : 'text-blue-400'}`}
                    >
                        {buff.label}
                    </span>
                    <span className="text-[8px] opacity-50 font-mono">LVL {buff.level}</span>
                </div>
                <p className="text-[10px] leading-relaxed opacity-90">{buff.desc}</p>
                {buff.category && (
                    <div className="flex justify-end mt-1.5 pt-1.5 border-t border-white/5">
                        <span
                            className={`text-[8px] font-black uppercase tracking-widest ${iconColor}`}
                        >
                            {buff.category}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TopBar: React.FC<TopBarProps> = ({
    p1Score,
    p1Crowns,
    p2Score,
    p2Crowns,
    playerTurnCounts = { p1: 0, p2: 0 },
    activePlayer,
    theme,
    playerBuffs = {} as Record<PlayerKey, Buff>,
    localPlayer,
    isOnline,
}) => {
    const getVictoryGoals = (pid: PlayerKey) => {
        const rawBuff = playerBuffs[pid];
        // Reconstruct to get effects
        const buff = (Object.values(BUFFS).find((b) => b.id === rawBuff?.id) as Buff) || rawBuff;
        const winCondition = (buff?.effects as BuffEffects)?.winCondition || {};

        return {
            points: winCondition.points || 20,
            crowns: winCondition.crowns || 10,
        };
    };

    const p1Goals = getVictoryGoals('p1');
    const p2Goals = getVictoryGoals('p2');

    const isP1Winning = p1Score >= p1Goals.points * 0.75 || p1Crowns >= p1Goals.crowns * 0.7;
    const isP2Winning = p2Score >= p2Goals.points * 0.75 || p2Crowns >= p2Goals.crowns * 0.7;

    const isMyTurn = isOnline && localPlayer === activePlayer;

    // Helper for winning text color
    const getWinningClass = (isWinning: boolean) => {
        if (!isWinning) return theme === 'dark' ? 'text-white' : 'text-slate-900';
        return theme === 'dark' ? 'animate-pulse text-yellow-400' : 'animate-pulse text-orange-600';
    };

    return (
        <div
            className={`fixed top-0 left-0 w-full h-16 lg:h-20 backdrop-blur-md border-b z-[60] flex items-center justify-between px-2 lg:px-8 transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-[#fffefc]/90 border-stone-200/60'}
        `}
        >
            {/* 1/4 and 3/4 Positioned Buffs (Absolute) */}
            <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                <TopBarBuff buff={playerBuffs['p1']} playerKey="p1" theme={theme} />
            </div>
            <div className="absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                <TopBarBuff buff={playerBuffs['p2']} playerKey="p2" theme={theme} />
            </div>

            {/* Turn Indicator (Online Only) */}
            <AnimatePresence>
                {isOnline && isMyTurn && (
                    <motion.div
                        initial={{ y: -50, opacity: 0, x: '-50%' }}
                        animate={{ y: 0, opacity: 1, x: '-50%' }}
                        exit={{ y: -50, opacity: 0, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute top-full left-1/2 -mt-3 px-6 py-1.5 rounded-b-xl shadow-lg border-x border-b bg-emerald-500 border-emerald-600 z-50 flex items-center gap-2"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                            Your Turn
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Player 1 Overview (Left) */}
            <div
                className={`flex items-center gap-2 lg:gap-8 transition-all duration-500 ${activePlayer === 'p1' ? 'opacity-100 scale-105' : 'opacity-100'}`}
            >
                <span className="text-xs lg:text-lg font-black text-emerald-500 uppercase tracking-widest drop-shadow-md hidden sm:inline">
                    P1
                </span>
                <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2 lg:gap-6">
                        <div
                            className={`flex items-center gap-1 lg:gap-2 ${getWinningClass(isP1Winning)}`}
                        >
                            <Trophy className="w-4 h-4 lg:w-6 lg:h-6" />
                            <AnimatedScore
                                value={p1Score}
                                theme={theme}
                                className="text-xl lg:text-4xl font-black drop-shadow-lg"
                            />
                            <span
                                className={`text-[10px] font-bold mt-1 lg:mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                            >
                                /{p1Goals.points}
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-1 lg:gap-2 ${p1Crowns >= p1Goals.crowns - 3 ? 'animate-pulse text-yellow-400' : 'text-yellow-500'}`}
                        >
                            <Crown className="w-4 h-4 lg:w-6 lg:h-6" fill="currentColor" />
                            <span className="text-xl lg:text-4xl font-black drop-shadow-lg">
                                {p1Crowns}
                            </span>
                            <span
                                className={`text-[10px] font-bold mt-1 lg:mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                            >
                                /{p1Goals.crowns}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Info */}
            <div className="flex flex-col items-center justify-center">
                <div
                    className={`flex items-center gap-4 px-6 lg:px-10 py-2 lg:py-3 rounded-2xl transition-all duration-500
                    ${
                        theme === 'dark'
                            ? 'bg-slate-800/40 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                            : 'bg-white border-2 border-stone-200 shadow-none'
                    }
                `}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-[10px] lg:text-base font-black transition-colors ${activePlayer === 'p1' ? 'text-emerald-500' : theme === 'dark' ? 'text-slate-500' : 'text-stone-800'}`}
                        >
                            {playerTurnCounts.p1}
                        </span>
                        <span
                            className={`text-[8px] lg:text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'opacity-40' : 'text-stone-400'}`}
                        >
                            turn
                        </span>
                    </div>
                    <div className="h-4 w-px bg-stone-200/50" />
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-[10px] lg:text-base font-black transition-colors ${activePlayer === 'p2' ? 'text-blue-500' : theme === 'dark' ? 'text-slate-500' : 'text-stone-800'}`}
                        >
                            {playerTurnCounts.p2}
                        </span>
                        <span
                            className={`text-[8px] lg:text-[10px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'opacity-40' : 'text-stone-400'}`}
                        >
                            turn
                        </span>
                    </div>
                </div>
            </div>

            {/* Player 2 Overview (Right) */}
            <div
                className={`flex items-center gap-2 lg:gap-8 transition-all duration-500 flex-row-reverse ${activePlayer === 'p2' ? 'opacity-100 scale-105' : 'opacity-100'}`}
            >
                <span className="text-xs lg:text-lg font-black text-blue-500 uppercase tracking-widest drop-shadow-md hidden sm:inline">
                    P2
                </span>
                <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-2 lg:gap-6 flex-row-reverse">
                        <div
                            className={`flex items-center gap-1 lg:gap-2 ${getWinningClass(isP2Winning)}`}
                        >
                            <Trophy className="w-4 h-4 lg:w-6 lg:h-6" />
                            <AnimatedScore
                                value={p2Score}
                                theme={theme}
                                className="text-xl lg:text-4xl font-black drop-shadow-lg"
                            />
                            <span
                                className={`text-[10px] font-bold mt-1 lg:mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                            >
                                /{p2Goals.points}
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-1 lg:gap-2 ${p2Crowns >= p2Goals.crowns - 3 ? 'animate-pulse text-yellow-400' : 'text-yellow-500'}`}
                        >
                            <Crown className="w-4 h-4 lg:w-6 lg:h-6" fill="currentColor" />
                            <span className="text-xl lg:text-4xl font-black drop-shadow-lg">
                                {p2Crowns}
                            </span>
                            <span
                                className={`text-[10px] font-bold mt-1 lg:mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                            >
                                /{p2Goals.crowns}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
