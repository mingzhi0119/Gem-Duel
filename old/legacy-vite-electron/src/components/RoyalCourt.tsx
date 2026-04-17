import React from 'react';
import { Crown } from 'lucide-react';
import { Card } from './Card';
import { RoyalCard, GamePhase, Card as CardType } from '../types';

interface RoyalCourtProps {
    royalDeck: RoyalCard[];
    phase: GamePhase | string;
    handleSelectRoyal: (card: RoyalCard) => void;
    theme: 'light' | 'dark';
    canInteract?: boolean;
}

export const RoyalCourt: React.FC<RoyalCourtProps> = ({
    royalDeck,
    phase,
    handleSelectRoyal,
    theme,
    canInteract = true,
}) => {
    return (
        <div
            className={`flex flex-col gap-4 items-center p-5 rounded-[2rem] border backdrop-blur-md shrink-0 w-fit transition-all duration-500
            ${
                theme === 'dark'
                    ? 'bg-slate-800/40 border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'bg-white border-stone-200/60'
            }
            ${!canInteract ? 'opacity-70 pointer-events-none' : ''}
        `}
        >
            <h2
                className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-2
                ${theme === 'dark' ? 'text-yellow-500/70' : 'text-amber-700/80'}`}
            >
                <Crown size={14} /> Royal Court
            </h2>
            <div className="grid grid-cols-2 gap-3">
                {royalDeck.length > 0 ? (
                    royalDeck.map((card) => (
                        <div
                            key={card.id}
                            className={`relative transition-all duration-300 ${phase === 'SELECT_ROYAL' && canInteract ? 'cursor-pointer hover:scale-110 hover:rotate-1 z-50 ring-4 ring-yellow-400/50 rounded-lg shadow-xl' : 'opacity-80 grayscale-[0.2]'}`}
                            onClick={() =>
                                canInteract && phase === 'SELECT_ROYAL' && handleSelectRoyal(card)
                            }
                        >
                            <Card card={card as unknown as CardType} isRoyal={true} />
                            {phase === 'SELECT_ROYAL' && canInteract && (
                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-lg">
                                    PICK!
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div
                        className={`col-span-2 h-64 flex items-center justify-center italic text-xs 
                        ${theme === 'dark' ? 'text-slate-700' : 'text-stone-400'}`}
                    >
                        Court is Empty
                    </div>
                )}
            </div>
        </div>
    );
};
