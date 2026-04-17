import { Globe, Users, User } from 'lucide-react';
import { useState } from 'react';
import { GameMode } from '../types';

interface GameConfigMenuProps {
    onOnlineSetup: () => void;
    onStartGame: (mode: GameMode, config: { useBuffs: boolean }) => void;
    theme: string;
}

export function GameConfigMenu({ onOnlineSetup, onStartGame, theme }: GameConfigMenuProps) {
    const [gameConfig, setGameConfig] = useState<{ useBuffs: boolean } | null>(null);

    if (!gameConfig) {
        return (
            <div
                className={`h-screen w-screen flex flex-col items-center justify-center gap-8 transition-colors duration-500
                  ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
              `}
            >
                <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
                        GEM DUEL
                    </h1>
                    <span className="text-sm uppercase tracking-widest opacity-60">
                        Tactical Reimagined
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mt-8">
                    <button
                        onClick={() => setGameConfig({ useBuffs: false })}
                        className="group relative w-64 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden
                              border-slate-300 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-2xl font-bold">Classic</span>
                        <span className="text-xs opacity-70 max-w-[80%] text-center">
                            Standard rules. Pure strategy.
                        </span>
                    </button>

                    <button
                        onClick={() => setGameConfig({ useBuffs: true })}
                        className="group relative w-64 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden
                              border-slate-300 hover:border-purple-500 bg-white/5 hover:bg-purple-500/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">Roguelike</span>
                            <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                NEW
                            </span>
                        </div>
                        <span className="text-xs opacity-70 max-w-[80%] text-center">
                            Random starting buffs & distinct playstyles.
                        </span>
                    </button>
                </div>

                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="h-px w-64 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
                    <button
                        onClick={onOnlineSetup}
                        className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 transition-all hover:scale-105 active:scale-95"
                    >
                        <Globe className="text-blue-400 group-hover:rotate-12 transition-transform" />
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold">Online Duel</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-widest font-black">
                                Remote Multiplayer
                            </span>
                        </div>
                    </button>
                </div>

                <div className="absolute bottom-8 text-xs opacity-30">Select a mode to begin</div>
            </div>
        );
    }

    return (
        <div
            className={`h-screen w-screen flex flex-col items-center justify-center gap-8 transition-colors duration-500
              ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
          `}
        >
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold uppercase tracking-widest opacity-80">
                    Select Opponent
                </h2>
                <span className="text-xs opacity-50">
                    {gameConfig.useBuffs ? 'Roguelike Mode' : 'Classic Mode'}
                </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-4">
                <button
                    onClick={() => onStartGame('LOCAL_PVP', { useBuffs: gameConfig.useBuffs })}
                    className="group relative w-64 h-40 rounded-2xl border-2 border-slate-300 hover:border-emerald-500 bg-white/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <Users size={40} className="text-emerald-500" />
                    <span className="text-xl font-bold">Local PvP</span>
                    <span className="text-[10px] opacity-60">Play with a friend locally</span>
                </button>

                <button
                    onClick={() => onStartGame('PVE', { useBuffs: gameConfig.useBuffs })}
                    className="group relative w-64 h-40 rounded-2xl border-2 border-slate-300 hover:border-amber-500 bg-white/5 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <User size={40} className="text-amber-500" />
                    <span className="text-xl font-bold">vs AI (Solo)</span>
                    <span className="text-[10px] opacity-60">Challenge the Gem Bot</span>
                </button>
            </div>

            <button
                onClick={() => setGameConfig(null)}
                className="text-xs underline opacity-40 hover:opacity-100 transition-opacity mt-4"
            >
                Back to Mode Selection
            </button>
        </div>
    );
}
