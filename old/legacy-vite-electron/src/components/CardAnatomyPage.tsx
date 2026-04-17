import React from 'react';
import { RotateCcw, Hand, Plus, Scroll, Crown } from 'lucide-react';
import { Card as CardComponent } from './Card';
import { Card as CardType } from '../types';

// ==========================================
// Types & Interfaces
// ==========================================
interface CardAnatomyPageProps {
    theme: 'light' | 'dark';
    lang: 'en' | 'zh';
}

// ==========================================
// Mock Data Configuration
// ==========================================

/**
 * Sample Card Data
 * Used to display a standardized L2 card for anatomy explanation.
 * Features: Level 2, Blue Bonus, Special Ability, Crown, Moderate Cost.
 */
const SAMPLE_CARD: CardType = {
    id: 'anatomy-sample',
    level: 2,
    bonusColor: 'blue',
    bonusCount: 1,
    points: 2,
    crowns: 1,
    ability: 'again',
    cost: {
        blue: 0,
        white: 3,
        green: 2,
        black: 0,
        red: 0,
        pearl: 0,
        gold: 0,
    },
};

/**
 * Glossary Data
 * Defines the content for the grid section below the diagram.
 */
const ABILITIES = [
    {
        id: 'play_again',
        icon: RotateCcw,
        color: 'bg-amber-500',
        label: { en: 'Extra Turn', zh: '再次行动' },
        desc: {
            en: 'Immediately take another turn after this one.',
            zh: '立即获得额外的一个回合。',
        },
    },
    {
        id: 'bonus_gem',
        icon: Plus,
        color: 'bg-emerald-500',
        label: { en: 'Bonus Gem', zh: '奖励宝石' },
        desc: {
            en: "Take 1 Gem of the card's color from the board.",
            zh: '从版图上拿取 1 个与该卡牌颜色相同的宝石。',
        },
    },
    {
        id: 'steal',
        icon: Hand,
        color: 'bg-rose-500',
        label: { en: 'Capture / Steal', zh: '掠夺' },
        desc: {
            en: 'Steal 1 non-Gold Gem from your opponent.',
            zh: '从对手那里偷取 1 个非黄金宝石。',
        },
    },
    {
        id: 'scroll',
        icon: Scroll,
        color: 'bg-purple-500',
        label: { en: 'Privilege', zh: '特权' },
        desc: {
            en: 'Take 1 Privilege Scroll (or steal if supply is empty).',
            zh: '拿取 1 个特权卷轴（如果供应堆为空，则从对手处拿取）。',
        },
    },
];

// ==========================================
// Component Implementation
// ==========================================

export const CardAnatomyPage: React.FC<CardAnatomyPageProps> = ({ theme, lang }) => {
    const isDark = theme === 'dark';
    const containerRef = React.useRef<HTMLDivElement>(null);

    // State to track container size for responsive SVG drawing
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 400 });

    /**
     * Responsive Logic
     * Updates SVG coordinate system when the window resizes.
     */
    React.useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    /**
     * Coordinate Helper Functions
     * Converts percentage (0-100) to absolute pixels based on container size.
     * x(50) = center of width
     * y(50) = center of height
     */
    const x = (pct: number) => (dimensions.width * pct) / 100;
    const y = (pct: number) => (dimensions.height * pct) / 100;

    // Visual Constants
    const strokeColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(120, 113, 108, 0.5)';
    const anchorFill = isDark ? '#fbbf24' : '#d97706';

    // Text Style Constants (For consistency across labels)
    const labelTitleClass = `block text-xs font-bold`;
    const labelDescClass = `block text-[10px] leading-tight ${isDark ? 'text-slate-400' : 'text-stone-500'}`;

    return (
        <div className="flex flex-col gap-8">
            {/* ------------------------------------------------------------ */}
            {/* Section 1: Interactive Anatomy Diagram                       */}
            {/* Contains the scaled card, floating labels, and SVG connectors */}
            {/* ------------------------------------------------------------ */}
            <section>
                <h4
                    className={`text-lg font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-200' : 'text-stone-700'}`}
                >
                    {lang === 'en' ? 'Card Layout' : '卡牌结构'}
                </h4>

                <div
                    ref={containerRef}
                    className="relative w-full h-[400px] flex justify-center items-center select-none"
                >
                    {/* Layer 1: The Mock Card */}
                    {/* Centered automatically by flexbox. Scaled up 1.8x for visibility. */}
                    <div className="z-10 transform scale-[1.8] origin-center shadow-2xl rounded-lg">
                        <CardComponent
                            card={SAMPLE_CARD}
                            canBuy={false}
                            theme={theme}
                            size="default"
                            className="pointer-events-none"
                        />
                    </div>

                    {/* Layer 2: The Labels */}
                    {/* Positioned absolutely relative to the container. */}
                    {/* Note: Percentages here should align roughly with SVG start points. */}

                    {/* Top Left: Prestige */}
                    <div className="absolute top-12 left-[2%] md:left-[10%] text-right w-28">
                        <span
                            className={`${labelTitleClass} ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
                        >
                            {lang === 'en' ? 'Prestige Points' : '声望值'}
                        </span>
                        {/* FIX: Changed color from yellow to slate/stone for hierarchy */}
                        <span className={labelDescClass}>
                            {lang === 'en' ? '20 Total Points to Win!' : '20个总分数即可获胜！'}
                        </span>
                        <span className={labelDescClass}>
                            {lang === 'en'
                                ? '10 Single Color Points to Win!'
                                : '10个同色分数即可获胜！'}
                        </span>
                    </div>

                    {/* Top Right: Bonus */}
                    <div className="absolute top-12 right-[2%] md:right-[10%] text-left w-28">
                        <span
                            className={`${labelTitleClass} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                            {lang === 'en' ? 'Gem Bonus' : '宝石奖励'}
                        </span>
                        <span className={labelDescClass}>
                            {lang === 'en' ? 'Discount on future buys' : '未来购买折扣'}
                        </span>
                    </div>

                    {/* Left Center: Ability */}
                    <div className="absolute top-[160px] left-[0%] md:left-[5%] text-right w-32">
                        <span
                            className={`${labelTitleClass} ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                        >
                            {lang === 'en' ? 'Special Ability' : '特殊能力'}
                        </span>
                        <span className={labelDescClass}>
                            {lang === 'en' ? 'Icon triggers on buy' : '购买时触发效果'}
                        </span>
                    </div>

                    {/* Bottom Left: Cost */}
                    <div className="absolute bottom-12 left-[2%] md:left-[10%] text-right w-28">
                        <span
                            className={`${labelTitleClass} ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                        >
                            {lang === 'en' ? 'Gem Cost' : '宝石成本'}
                        </span>
                        <span className={labelDescClass}>
                            {lang === 'en' ? 'Price to purchase' : '购买价格'}
                        </span>
                    </div>

                    {/* Bottom Right: Crowns */}
                    <div className="absolute bottom-12 right-[2%] md:right-[10%] text-left w-28">
                        <div className="flex items-center gap-1">
                            <Crown
                                size={12}
                                className={isDark ? 'text-yellow-400' : 'text-yellow-500'}
                                fill="currentColor"
                            />
                            <span
                                className={`${labelTitleClass} ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
                            >
                                {lang === 'en' ? 'Crowns' : '皇冠'}
                            </span>
                        </div>
                        <span className={labelDescClass}>
                            {lang === 'en' ? 'Collect for Royals.' : '收集以解锁皇室卡。'}
                        </span>
                        {/* Highlights specific win condition in bold/yellow */}
                        <span
                            className={`block text-[10px] font-bold leading-tight ${isDark ? 'text-yellow-500' : 'text-yellow-700'}`}
                        >
                            {lang === 'en' ? '10 Crowns to Win!' : '10个即可获胜！'}
                        </span>
                    </div>

                    {/* Layer 3: SVG Connectors */}
                    {/* Overlays the entire area. Used to draw lines from Labels to Card Elements. */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                        <defs>
                            <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
                                <circle cx="3" cy="3" r="2" fill={anchorFill} />
                            </marker>
                        </defs>

                        {/* Guard clause: Wait for dimensions to stabilize before drawing */}
                        {dimensions.width > 0 && (
                            <>
                                {/* PATH LOGIC:
                                    M = Move to Start (Near Label)
                                    Q = Quadratic Bezier Curve Control Point
                                    Final Coords = End Point (On Card UI Element)
                                 */}

                                {/* 1. Prestige (Top Left) */}
                                <path
                                    d={`M ${x(30)} ${y(15)} Q ${x(30)} ${y(15)}, ${x(37)} ${y(27)}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                />
                                <circle
                                    cx={`${x(37)}`}
                                    cy={`${y(27)}`}
                                    r="3"
                                    fill={isDark ? '#fbbf24' : '#d97706'}
                                />

                                {/* 2. Gem Bonus (Top Right) */}
                                <path
                                    d={`M ${x(70)} ${y(15)} Q ${x(70)} ${y(15)}, ${x(63.5)} ${y(27)}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                />
                                <circle
                                    cx={`${x(63.5)}`}
                                    cy={`${y(27)}`}
                                    r="3"
                                    fill={isDark ? '#60a5fa' : '#2563eb'}
                                />

                                {/* 3. Ability (Top Center) */}
                                <path
                                    d={`M ${x(30)} ${y(42)} Q ${x(30)} ${y(42)}, ${x(43)} ${y(31)}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                />
                                <circle
                                    cx={`${x(43)}`}
                                    cy={`${y(31)}`}
                                    r="3"
                                    fill={isDark ? '#c084fc' : '#9333ea'}
                                />

                                {/* 4. Cost (Bottom Left) */}
                                <path
                                    d={`M ${x(30)} ${y(85)} Q ${x(30)} ${y(85)}, ${x(38)} ${y(67)}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                />
                                <circle
                                    cx={`${x(38)}`}
                                    cy={`${y(67)}`}
                                    r="3"
                                    fill={isDark ? '#34d399' : '#059669'}
                                />

                                {/* 5. Crowns (Bottom Right) */}
                                <path
                                    d={`M ${x(70)} ${y(85)} Q ${x(70)} ${y(85)}, ${x(63)} ${y(74)}`}
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                />
                                <circle
                                    cx={`${x(63)}`}
                                    cy={`${y(74)}`}
                                    r="3"
                                    fill={isDark ? '#facc15' : '#ca8a04'}
                                />
                            </>
                        )}
                    </svg>
                </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Section 2: Special Abilities Glossary                        */}
            {/* Grid layout explaining icons                                 */}
            {/* ------------------------------------------------------------ */}
            <section>
                <h4
                    className={`text-lg font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-200' : 'text-stone-700'}`}
                >
                    {lang === 'en' ? 'Special Abilities' : '特殊能力'}
                </h4>
                {/* ... existing glossary code ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ABILITIES.map((ability) => {
                        const Icon = ability.icon;
                        return (
                            <div
                                key={ability.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-stone-50 border-stone-200'}`}
                            >
                                <div
                                    className={`p-2 rounded-lg ${ability.color} shadow-md flex items-center justify-center shrink-0`}
                                >
                                    <Icon size={16} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span
                                        className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}
                                    >
                                        {ability.label[lang]}
                                    </span>
                                    <span
                                        className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}
                                    >
                                        {ability.desc[lang]}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};
