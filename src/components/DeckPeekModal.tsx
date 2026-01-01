import React from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Card as CardType } from '../types';

interface DeckPeekModalProps {
    isOpen: boolean;
    cards: CardType[] | null;
    onClose: () => void;
    theme: 'light' | 'dark';
}

export const DeckPeekModal: React.FC<DeckPeekModalProps> = ({ isOpen, cards, onClose, theme }) => {
    if (!isOpen || !cards) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-4xl max-h-[80vh] rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300
                ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'}
            `}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-5 border-b
                    ${theme === 'dark' ? 'border-slate-800' : 'border-stone-100'}
                `}
                >
                    <h2
                        className={`text-xl font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-stone-800'}`}
                    >
                        Deck Intelligence
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close Modal"
                        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-400'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-wrap justify-center gap-6">
                    {cards.length > 0 ? (
                        cards.map((card, i) => (
                            <div
                                key={card.id || i}
                                className="animate-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <Card card={card} canBuy={false} theme={theme} />
                            </div>
                        ))
                    ) : (
                        <div
                            className={`h-48 flex items-center justify-center italic ${theme === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}
                        >
                            No cards left in this deck.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className={`p-4 border-t flex justify-end
                    ${theme === 'dark' ? 'border-slate-800 bg-slate-950/30' : 'border-stone-100 bg-[#fdfbf7]'}`}
                >
                    <button
                        onClick={onClose}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-purple-900/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
