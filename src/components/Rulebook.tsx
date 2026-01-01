import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { RULEBOOK_CONTENT } from './RulebookContent';
import { CardAnatomyPage } from './CardAnatomyPage';

interface RulebookProps {
    onClose: () => void;
    theme: 'light' | 'dark';
}

export const Rulebook: React.FC<RulebookProps> = ({ onClose, theme }) => {
    const [page, setPage] = useState(0);
    const [lang, setLang] = useState<'en' | 'zh'>('zh');

    const content = RULEBOOK_CONTENT[page];
    const totalPages = RULEBOOK_CONTENT.length;

    // Render custom component pages
    const renderContent = () => {
        if (!content) return null;

        if (content.isCustom === 'card_anatomy') {
            return <CardAnatomyPage theme={theme} lang={lang} />;
        }

        // Default text-based page
        return (
            <>
                <h3
                    className={`text-2xl font-black uppercase tracking-tight mb-6 pb-3 border-b transition-colors duration-500 ${theme === 'dark' ? 'text-white border-slate-800' : 'text-stone-800 border-stone-100'}`}
                >
                    {content.title?.[lang] || 'Untitled'}
                </h3>
                <div
                    className={`leading-relaxed whitespace-pre-wrap text-sm md:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-stone-600 font-medium'}`}
                >
                    {content.body?.[lang] || 'No content available.'}
                </div>
            </>
        );
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`rounded-[2rem] w-[90%] max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden transition-all duration-500
                ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-stone-200'}`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-5 border-b transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-stone-100 bg-[#fdfbf7]'}`}
                >
                    <div className="flex items-center gap-2 text-emerald-600">
                        <BookOpen size={20} />
                        <h2 className="font-black uppercase tracking-wider text-sm">
                            {lang === 'en' ? 'Rulebook' : '游戏说明书'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
                            className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase transition-colors
                                ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-stone-300 text-stone-600 hover:border-stone-400 shadow-sm'}`}
                        >
                            {lang === 'en' ? '中文' : 'EN'}
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Close Rules"
                            className={`${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-stone-400 hover:text-stone-800'} transition-colors`}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10">
                    {content && (
                        <>
                            {/* Title for custom pages */}
                            {content.isCustom && (
                                <h3
                                    className={`text-2xl font-black uppercase tracking-tight mb-6 pb-3 border-b transition-colors duration-500 ${theme === 'dark' ? 'text-white border-slate-800' : 'text-stone-800 border-stone-100'}`}
                                >
                                    {content.title?.[lang] || 'Untitled'}
                                </h3>
                            )}
                            {renderContent()}
                        </>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div
                    className={`p-5 border-t flex items-center justify-between transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-stone-100 bg-[#fdfbf7]'}`}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest
                            ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white border border-stone-300 text-stone-700 hover:border-stone-400 shadow-sm active:bg-stone-100'}`}
                    >
                        <ChevronLeft size={14} />
                        {lang === 'en' ? 'Prev' : '上一页'}
                    </button>

                    <span className="text-stone-400 font-mono font-bold text-[10px] tracking-widest">
                        PAGE {page + 1} / {totalPages}
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest
                            ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white border border-stone-300 text-stone-700 hover:border-stone-400 shadow-sm active:bg-stone-100'}`}
                    >
                        {lang === 'en' ? 'Next' : '下一页'}
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
