import React from 'react';
import {
    Sparkles,
    Crown,
    Shield,
    Swords,
    ArrowRight,
    Coins,
    Tag,
    Zap,
    Eye,
    Trophy,
    RefreshCw,
    Layers,
} from 'lucide-react';
import { BUFF_STYLES } from '../styles/buffs';
import { BUFFS } from '../constants'; // Import for reconstruction
import { Buff, PlayerKey } from '../types';

interface DraftScreenProps {
    draftPool: string[]; // IDs only
    p2DraftPool?: string[]; // IDs only
    buffLevel: number;
    activePlayer: PlayerKey;
    onSelectBuff: (buffId: string) => void;
    onReroll?: (level?: number) => void;
    theme: 'light' | 'dark';
    localPlayer?: PlayerKey;
    isOnline?: boolean;
    isPvE?: boolean;
}

export const DraftScreen: React.FC<DraftScreenProps> = ({
    draftPool,
    p2DraftPool = [],
    buffLevel,
    activePlayer,
    onSelectBuff,
    onReroll,
    theme,
    localPlayer,
    isOnline = false,
    isPvE = false,
}) => {
    const rawPool = (activePlayer === 'p1' ? draftPool : p2DraftPool) || [];
    console.log('[UI-DRAFT-SCREEN] Raw Pool IDs from State:', rawPool);

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

    const getDraftTitle = (level: number) => {
        switch (level) {
            case 1:
                return 'Minor Tactic Draft';
            case 2:
                return 'Tactical Shift Draft';
            case 3:
                return 'Expert Game-Changer Draft';
            default:
                return `Level ${level} Buff Selection`;
        }
    };

    // RECONSTRUCTION: Map basic sync data (IDs) back to full local constants
    const currentPool: Buff[] = rawPool.map((id) => {
        const fullData = Object.values(BUFFS).find((b) => b.id === id);
        return (fullData as Buff) || (BUFFS.NONE as Buff);
    });

    const canInteract = !isOnline || activePlayer === localPlayer;

    return (
        <div
            className={`h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500
            ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
        `}
        >
            {/* Background Ambience */}
            <div
                className={`absolute inset-0 pointer-events-none opacity-20
                ${theme === 'dark'
                        ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950'
                        : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-200/40 via-slate-100 to-slate-100'
                    }
            `}
            />

            {/* PVE Customize Panel (PVE P1 Only) */}
            {isPvE && activePlayer === 'p1' && onReroll && (
                <div className="absolute top-8 right-8 z-[100] flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 mb-1">
                        <Layers size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500/80">
                            PVE CUSTOMIZE
                        </span>
                    </div>
                    <div
                        className={`flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-xl shadow-2xl transition-colors
                        ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-white/60 border border-slate-200'}`}
                    >
                        <button
                            onClick={() => onReroll()}
                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 group"
                        >
                            <RefreshCw
                                size={14}
                                className="transition-transform group-active:rotate-180 duration-500"
                            />
                            Refresh Pool
                        </button>
                        <div
                            className={`h-6 w-px mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`}
                        />
                        <div
                            className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}
                        >
                            {[1, 2, 3].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => onReroll(lvl)}
                                    className={`
                                        text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-95
                                        ${buffLevel === lvl
                                            ? 'bg-amber-400 text-amber-950 shadow-inner'
                                            : theme === 'dark'
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                        }
                                    `}
                                >
                                    L{lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="z-10 text-center mb-6 animate-in slide-in-from-top-10 duration-700">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Sparkles className="text-amber-400" size={32} />
                    <h1 className="text-4xl font-black uppercase tracking-wider">
                        Roguelike Draft
                    </h1>
                    <Sparkles className="text-amber-400" size={32} />
                </div>
                <p className={`text-lg font-black uppercase tracking-widest opacity-60`}>
                    {getDraftTitle(buffLevel)}
                </p>
            </div>

            {/* Active Player Indicator */}
            <div
                className={`z-10 mb-8 flex items-center gap-3 px-6 py-3 rounded-full border shadow-lg
                ${activePlayer === 'p1'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500'
                        : 'bg-blue-600/20 border-blue-500 text-blue-500'
                    }
            `}
            >
                {activePlayer === 'p1' ? <Shield size={24} /> : <Swords size={24} />}
                <span className="text-xl font-bold uppercase">
                    {activePlayer === 'p1' ? 'Player 1: Pick 1 from 3' : 'Player 2: Pick 1 from 4'}
                </span>
            </div>

            {/* Buff Cards */}
            <div className="z-10 flex flex-wrap justify-center gap-6 max-w-7xl px-4">
                {currentPool.map((buff, idx) => {
                    const { Icon, color: iconColor } = getBuffIcon(buff.category);
                    const isP1ChoiceSlot = activePlayer === 'p2' && idx === 0;

                    return (
                        <button
                            key={buff.id}
                            id={`buff-select-${buff.id}`}
                            name="buff-selection"
                            disabled={!canInteract}
                            onClick={() => canInteract && onSelectBuff(buff.id)}
                            className={`group relative flex flex-col w-64 h-80 p-5 rounded-2xl border-2 text-left transition-all duration-300 
                                ${canInteract ? 'hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer' : 'opacity-50 cursor-default'}
                                ${theme === 'dark' ? BUFF_STYLES[buff.level] : 'bg-white border-slate-200 shadow-xl'}
                                ${theme === 'dark' ? 'hover:shadow-purple-900/50' : 'hover:shadow-purple-200/50'}
                                ${isP1ChoiceSlot ? 'border-amber-400 ring-2 ring-amber-400/50' : ''}
                            `}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`p-2 rounded-xl backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}
                                >
                                    <Icon size={22} className={iconColor} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border 
                                        ${theme === 'dark' ? 'border-white/20 opacity-60' : 'border-slate-300 opacity-100 text-slate-600'}`}
                                    >
                                        Lvl {buff.level}
                                    </span>
                                    {buff.category && (
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-tighter px-2 
                                            ${theme === 'dark' ? 'opacity-40' : 'text-slate-400 opacity-100'}`}
                                        >
                                            {buff.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* P1 Choice Badge */}
                            {isP1ChoiceSlot && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 text-[8px] font-black uppercase px-3 py-1 rounded-full shadow-lg z-20">
                                    Player 1's Choice
                                </div>
                            )}

                            {/* Title */}
                            <h3
                                className={`text-xl font-black mb-3 leading-tight transition-colors 
                                ${theme === 'dark' ? 'group-hover:text-white' : 'text-slate-900 group-hover:text-amber-600'}`}
                            >
                                {buff.label}
                            </h3>

                            {/* Description */}
                            <p
                                className={`text-xs font-medium leading-relaxed mb-4 flex-grow 
                                ${theme === 'dark' ? 'opacity-80' : 'text-slate-600'}`}
                            >
                                {buff.desc}
                            </p>

                            {/* Win Condition Changes (if any) */}
                            {buff.effects?.winCondition &&
                                (buff.effects.winCondition.points ||
                                    buff.effects.winCondition.crowns ||
                                    buff.effects.winCondition.singleColor) && (
                                    <div
                                        className={`mt-auto pt-3 border-t text-[10px] space-y-1 opacity-90 
                                        ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}
                                    >
                                        <p
                                            className={`font-bold uppercase mb-1 ${theme === 'dark' ? 'opacity-60' : 'text-slate-400'}`}
                                        >
                                            Goal Adjustment:
                                        </p>
                                        {buff.effects.winCondition.points && (
                                            <div className="flex justify-between">
                                                <span
                                                    className={
                                                        theme === 'dark' ? '' : 'text-slate-700'
                                                    }
                                                >
                                                    Points:
                                                </span>
                                                <span
                                                    className={`font-mono font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}
                                                >
                                                    {buff.effects.winCondition.points}
                                                </span>
                                            </div>
                                        )}
                                        {buff.effects.winCondition.crowns && (
                                            <div className="flex justify-between">
                                                <span
                                                    className={
                                                        theme === 'dark' ? '' : 'text-slate-700'
                                                    }
                                                >
                                                    Crowns:
                                                </span>
                                                <span
                                                    className={`font-mono font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}
                                                >
                                                    {buff.effects.winCondition.crowns}
                                                </span>
                                            </div>
                                        )}
                                        {buff.effects.winCondition.singleColor && (
                                            <div className="flex justify-between">
                                                <span
                                                    className={
                                                        theme === 'dark' ? '' : 'text-slate-700'
                                                    }
                                                >
                                                    Points (1 Color):
                                                </span>
                                                <span
                                                    className={`font-mono font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}
                                                >
                                                    {buff.effects.winCondition.singleColor}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Select Action */}
                            <div
                                className={`absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]
                                ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
                            `}
                            >
                                Select <ArrowRight size={14} />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="absolute bottom-8 text-[10px] uppercase font-black tracking-tighter opacity-30 z-10 flex gap-12">
                <span>P1 takes initiative but has fewer options</span>
                <span>P2 acts in response with a larger pool</span>
            </div>
        </div>
    );
};
