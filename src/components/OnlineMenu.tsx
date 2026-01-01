import { ArrowLeft, Globe, Copy, CheckCircle2, Play, Users, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { GameMode } from '../types';

interface OnlineMenuProps {
    onBack: () => void;
    online: {
        peerId: string | null;
        connectionStatus: string;
        isHost: boolean;
        connectToPeer: (id: string) => void;
    };
    startGame: (mode: GameMode, config: { useBuffs: boolean; isHost?: boolean }) => void;
    theme: string;
}

export function OnlineMenu({ onBack, online, startGame, theme }: OnlineMenuProps) {
    const [roomInput, setRoomInput] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const isConnected = online.connectionStatus === 'connected';

    return (
        <div
            className={`h-screen w-screen flex flex-col items-center justify-center gap-8 transition-colors duration-500 overflow-hidden
                  ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-bold uppercase tracking-wider text-xs"
                >
                    <ArrowLeft size={18} /> Return to Title
                </button>
            </div>

            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <Globe size={64} className="text-blue-500 animate-pulse-slow" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                </div>
                <div className="text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-1">
                        Online Arena
                    </h2>
                    <p className="text-sm font-medium opacity-50 tracking-widest uppercase">
                        Global Peer-to-Peer Network
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl px-8 h-[500px]">
                {/* HOST CARD */}
                <div
                    className={`flex-1 p-8 rounded-3xl border-2 transition-all relative overflow-hidden group
                        ${
                            theme === 'dark'
                                ? 'bg-slate-900/50 border-slate-800'
                                : 'bg-white border-slate-200 shadow-xl'
                        }
                        ${!online.isHost && isConnected ? 'opacity-30 pointer-events-none grayscale' : ''}
                    `}
                >
                    <div className="relative z-10 flex flex-col h-full gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-tight">
                                    Host Game
                                </h3>
                                <p className="text-xs opacity-60">Wait for a challenger</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold opacity-50 uppercase tracking-wider">
                                    Your Match ID
                                </label>
                                <div
                                    className={`w-full p-4 rounded-xl flex items-center justify-between gap-4 border transition-colors
                                        ${theme === 'dark' ? 'bg-black/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                                >
                                    {online.peerId ? (
                                        <code className="text-lg font-mono font-bold text-blue-500 truncate">
                                            {online.peerId}
                                        </code>
                                    ) : (
                                        <span className="text-sm italic opacity-50">
                                            Connecting to cloud...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (online.peerId) {
                                                navigator.clipboard.writeText(online.peerId);
                                                setCopySuccess(true);
                                                setTimeout(() => setCopySuccess(false), 2000);
                                            }
                                        }}
                                        disabled={!online.peerId}
                                        className={`p-2 rounded-lg transition-colors ${copySuccess ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                    >
                                        {copySuccess ? (
                                            <CheckCircle2 size={20} />
                                        ) : (
                                            <Copy size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status / Start Controls */}
                        <div className="mt-auto">
                            {!isConnected ? (
                                <div className="flex items-center justify-center gap-3 py-4 opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                    <span className="text-xs font-bold uppercase tracking-widest">
                                        Waiting for Opponent...
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4">
                                    <div className="text-emerald-500 flex items-center justify-center gap-2 text-sm font-bold uppercase mb-2">
                                        <CheckCircle2 size={16} /> Opponent Connected
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() =>
                                                startGame('ONLINE_MULTIPLAYER', {
                                                    useBuffs: false,
                                                    isHost: true,
                                                })
                                            }
                                            className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs transition-transform active:scale-95 shadow-lg shadow-blue-900/20 flex flex-col items-center gap-1"
                                        >
                                            <Play size={16} />
                                            Classic Duel
                                        </button>
                                        <button
                                            onClick={() =>
                                                startGame('ONLINE_MULTIPLAYER', {
                                                    useBuffs: true,
                                                    isHost: true,
                                                })
                                            }
                                            className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs transition-transform active:scale-95 shadow-lg shadow-purple-900/20 flex flex-col items-center gap-1"
                                        >
                                            <Sparkles size={16} />
                                            Roguelike
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* JOIN CARD */}
                <div
                    className={`flex-1 p-8 rounded-3xl border-2 transition-all relative overflow-hidden group
                        ${
                            theme === 'dark'
                                ? 'bg-slate-900/50 border-slate-800'
                                : 'bg-white border-slate-200 shadow-xl'
                        }
                    `}
                >
                    <div className="relative z-10 flex flex-col h-full gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                                <Play size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-tight">
                                    Join Game
                                </h3>
                                <p className="text-xs opacity-60">Enter an ID to duel</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold opacity-50 uppercase tracking-wider">
                                    Opponent's Match ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Paste ID here (e.g. 5f3d-2a1c...)"
                                    value={roomInput}
                                    onChange={(e) => setRoomInput(e.target.value)}
                                    disabled={isConnected}
                                    className={`w-full p-4 rounded-xl font-mono text-lg outline-none border-2 transition-all
                                        ${
                                            theme === 'dark'
                                                ? 'bg-black/40 border-slate-800 focus:border-amber-500 placeholder:text-slate-700'
                                                : 'bg-slate-100 border-slate-200 focus:border-amber-500 placeholder:text-slate-400'
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                />
                            </div>
                        </div>

                        <div className="mt-auto">
                            {!isConnected ? (
                                <button
                                    onClick={() => online.connectToPeer(roomInput)}
                                    disabled={
                                        !roomInput || online.connectionStatus === 'connecting'
                                    }
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-wider text-sm transition-all
                                        ${
                                            roomInput && online.connectionStatus !== 'connecting'
                                                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-xl shadow-amber-900/20 hover:scale-[1.02] active:scale-95'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {online.connectionStatus === 'connecting' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3 h-3 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                                            Connecting...
                                        </span>
                                    ) : (
                                        'Connect '
                                    )}
                                </button>
                            ) : (
                                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center gap-2 animate-in zoom-in">
                                    <CheckCircle2 size={32} />
                                    <div className="font-bold text-center">
                                        <div>Connected Successfully!</div>
                                        <div className="text-xs opacity-60 font-medium mt-1">
                                            Waiting for host to start...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div
                className={`fixed bottom-0 w-full py-2 text-center text-[10px] font-mono opacity-30 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
                STATUS: {online.connectionStatus.toUpperCase()} • SERVER: CLOUD (SECURE)
            </div>
        </div>
    );
}
