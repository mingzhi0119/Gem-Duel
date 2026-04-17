import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GemIcon } from './GemIcon';
import { GEM_TYPES } from '../constants';
import { GemColor, GemTypeObject } from '../types';

interface FloatingTextProps {
    quantity: string;
    label: string;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ quantity, label }) => {
    const colorClass =
        label.toLowerCase() === 'gold'
            ? 'text-yellow-400'
            : label.toLowerCase() === 'pearl'
              ? 'text-pink-400'
              : label.toLowerCase() === 'privilege'
                ? 'text-amber-400'
                : 'text-emerald-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1.1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-1"
        >
            <span
                className={`font-black text-lg ${quantity.startsWith('+') ? 'text-white' : 'text-red-400'}`}
            >
                {quantity}
            </span>
            <span className={`${colorClass} font-bold text-sm uppercase tracking-wider`}>
                {label}
            </span>
        </motion.div>
    );
};

export const FloatingGem: React.FC<{ type: string; count: number; theme?: 'light' | 'dark' }> = ({
    type,
    count,
    theme = 'dark',
}) => {
    // Determine GemTypeObject based on type string (e.g. 'blue', 'gold')
    const gemKey = type.toUpperCase() as keyof typeof GEM_TYPES;
    const gemType = GEM_TYPES[gemKey] || GEM_TYPES.EMPTY;

    return (
        <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1.2 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-1"
        >
            <span className="font-black text-white text-xl drop-shadow-md">+{count}</span>
            <GemIcon type={gemType} size="w-8 h-8" theme={theme} className="shadow-lg" />
        </motion.div>
    );
};

export const CrownFlash: React.FC = () => {
    return (
        <>
            <style>
                {`
                    @keyframes flashExpand {
                        0% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
                        100% { opacity: 0; transform: scale(2.5); box-shadow: 0 0 30px 30px rgba(250, 204, 21, 0); }
                    }
                    .animate-flash-expand {
                        animation: flashExpand 0.8s ease-out forwards;
                    }
                `}
            </style>
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-flash-expand pointer-events-none z-0"></div>
        </>
    );
};
