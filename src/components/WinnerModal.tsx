import React, { useEffect } from 'react';
import { Trophy, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerKey } from '../types';

interface WinnerModalProps {
    winner: PlayerKey | null;
    onReview: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onReview }) => {
    useEffect(() => {
        if (winner) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#34d399', '#ffbbf24', '#f472b6'],
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#34d399', '#ffbbf24', '#f472b6'],
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [winner]);

    if (!winner) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <Trophy
                size={80}
                className="text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce"
            />
            <h1 className="text-5xl font-black text-white mb-2">
                {winner === 'p1' ? 'Player 1' : 'Player 2'} Wins!
            </h1>
            <p className="text-slate-400 text-lg mb-8">Congratulations!</p>
            <div className="flex gap-4">
                <button
                    onClick={onReview}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105"
                >
                    <Eye size={20} /> Review Board
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};
