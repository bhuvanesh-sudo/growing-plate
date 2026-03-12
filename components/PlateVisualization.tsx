'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { FoodGroup } from '@/lib/types';
import { GROUP_LABELS, GROUP_COLORS } from '@/lib/types';
import type { FoodNutrients } from '@/lib/nutrition';

// ── Food emoji map ─────────────────────────────────────────────────────────────
const FOOD_EMOJIS: Record<string, string> = {
    'white rice': '🍚', 'rice': '🍚',
    'roti': '🫓', 'chapati': '🫓', 'bread': '🍞',
    'idli': '🫓', 'dosa': '🥞', 'oats': '🥣',
    'upma': '🍲', 'poha': '🍲',
    'egg': '🥚', 'boiled egg': '🥚',
    'chicken': '🍗', 'fish': '🐟',
    'toor dal': '🍛', 'dal': '🍛', 'rajma': '🫘',
    'chana': '🫘', 'sambar': '🍲', 'lentil': '🍛',
    'paneer': '🧀',
    'spinach': '🥬', 'carrot': '🥕', 'broccoli': '🥦',
    'tomato': '🍅', 'peas': '🫛',
    'banana': '🍌', 'apple': '🍎', 'mango': '🥭',
    'orange': '🍊', 'papaya': '🍈',
    'milk': '🥛', 'curd': '🫙', 'yogurt': '🫙',
    'cheese': '🧀', 'butter': '🧈',
    'peanut butter': '🥜', 'almonds': '🌰', 'almond': '🌰', 'ghee': '🫙',
};
const GROUP_FALLBACK: Record<FoodGroup, string> = {
    grains: '🌾', protein: '🥩', vegetables: '🥗',
    fruits: '🍓', dairy: '🥛', fats: '🥜', other: '🍽️',
};
function getEmoji(name: string, group: FoodGroup): string {
    const lower = name.toLowerCase();
    for (const [key, emoji] of Object.entries(FOOD_EMOJIS))
        if (lower.includes(key)) return emoji;
    return GROUP_FALLBACK[group] ?? '🍽️';
}

// Golden-angle spiral placement
function placeOnPlate(count: number, wellR: number): { x: number; y: number }[] {
    if (count === 0) return [];
    if (count === 1) return [{ x: 0, y: 0 }];
    const φ = Math.PI * (3 - Math.sqrt(5));
    const usable = wellR * 0.66;
    return Array.from({ length: count }, (_, i) => {
        const r = Math.sqrt((i + 0.5) / count) * usable;
        return { x: r * Math.cos(i * φ), y: r * Math.sin(i * φ) };
    });
}

const MACRO_COLORS = {
    protein: '#E8504A', carbs: '#F5C842', fat: '#B47FE8', fiber: '#4CAF7D',
};

const SIZES = [180, 210, 240, 270, 300] as const;

interface PlateItem {
    food_group: FoodGroup | string;
    food_name: string;
    calories_kcal: number;
}
interface PlateVisualizationProps {
    items: PlateItem[];
    totals?: FoodNutrients;
    size?: (typeof SIZES)[number];
    sizeIdx?: number;
    onSizeChange?: (idx: number) => void;
}

const ANIM = { duration: 0.24, ease: 'easeInOut' as const };

export default function PlateVisualization({
    items,
    totals,
    size: initSize = 240,
    sizeIdx: controlledIdx,
    onSizeChange,
}: PlateVisualizationProps) {
    const [internalIdx, setInternalIdx] = useState<number>(
        SIZES.indexOf(initSize) === -1 ? 2 : SIZES.indexOf(initSize)
    );
    const [flipped, setFlipped] = useState(false);

    // Use controlled state if parent provides it, otherwise internal
    const sizeIdx    = controlledIdx ?? internalIdx;
    const setSizeIdx = (idx: number) => (onSizeChange ?? setInternalIdx)(idx);
    const size       = SIZES[Math.max(0, Math.min(SIZES.length - 1, sizeIdx))];
    const canShrink  = sizeIdx > 0;
    const canGrow    = sizeIdx < SIZES.length - 1;

    const totalCal = Math.round(items.reduce((s, i) => s + i.calories_kcal, 0));
    const isEmpty  = items.length === 0;

    // Plate geometry
    const rimW      = Math.round(size * 0.072);
    const innerSize = size - rimW * 2;
    const wellR     = innerSize / 2;
    const emojiSz   = Math.max(16, Math.min(32,
        wellR / (items.length <= 5 ? 2.0 : items.length <= 10 ? 2.6 : 3.2)
    ));

    const displayItems = items.slice(0, 18).map((item) => {
        const g = item.food_group as FoodGroup;
        return { emoji: getEmoji(item.food_name, g), label: item.food_name, color: GROUP_COLORS[g] ?? '#A0A0A0', group: g };
    });

    const positions    = placeOnPlate(displayItems.length, wellR);
    const legendGroups = Array.from(new Map(displayItems.map((d) => [d.group, d])).values());

    const macroData = totals ? [
        { name: 'Protein', value: Math.round(totals.protein_g * 10) / 10, color: MACRO_COLORS.protein, unit: 'g' },
        { name: 'Carbs',   value: Math.round(totals.carbs_g  * 10) / 10, color: MACRO_COLORS.carbs,   unit: 'g' },
        { name: 'Fat',     value: Math.round(totals.fat_g    * 10) / 10, color: MACRO_COLORS.fat,     unit: 'g' },
        { name: 'Fiber',   value: Math.round(totals.fiber_g  * 10) / 10, color: MACRO_COLORS.fiber,   unit: 'g' },
    ].filter((d) => d.value > 0) : [];

    return (
        <div className="flex flex-col items-center gap-4" style={{ width: size }}>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full justify-center">
                <SizeBtn onClick={() => setSizeIdx(Math.max(0, sizeIdx - 1))}          disabled={!canShrink} label="−" aria="Shrink plate" />
                {!isEmpty && (
                    <button onClick={() => setFlipped((f) => !f)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-xs font-black border transition-all"
                        style={{ background: 'var(--gp-bg)', borderColor: 'var(--gp-border)', color: 'var(--gp-muted)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: flipped ? 'scaleX(-1)' : 'none', transition: 'transform 0.35s' }}>
                            <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </svg>
                        {flipped ? 'Show plate' : 'Show macros'}
                    </button>
                )}
                <SizeBtn onClick={() => setSizeIdx(Math.min(SIZES.length - 1, sizeIdx + 1))} disabled={!canGrow}   label="+" aria="Grow plate" />
            </div>

            {/* Flip card */}
            <div style={{ width: size }}>
                <AnimatePresence mode="wait" initial={false}>

                    {/* FRONT — emoji plate */}
                    {!flipped && (
                        <motion.div key="front"
                            initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1, transition: ANIM }}
                            exit={{   rotateY:  90, opacity: 0, transition: ANIM }}
                            className="flex flex-col items-center gap-3">

                            {/* CSS plate */}
                            <div style={{
                                width: size, height: size, borderRadius: '50%',
                                background: 'linear-gradient(145deg, #EDE8E2, #DDD6CE)',
                                boxShadow: '0 8px 28px rgba(0,0,0,0.10), inset 0 1px 2px rgba(255,255,255,0.6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {/* Separator ring */}
                                <div style={{
                                    width: innerSize + rimW * 0.55, height: innerSize + rimW * 0.55, borderRadius: '50%',
                                    background: 'linear-gradient(145deg, #F0EBE4, #E8E1D9)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {/* Well */}
                                    <div style={{
                                        width: innerSize, height: innerSize, borderRadius: '50%',
                                        background: '#FDFAF7', border: '1px solid rgba(0,0,0,0.04)',
                                        position: 'relative', overflow: 'hidden',
                                    }}>
                                        {isEmpty ? (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: emojiSz * 1.8, opacity: 0.4 }}>🍽️</span>
                                            </div>
                                        ) : (
                                            displayItems.map((item, i) => {
                                                const p = positions[i];
                                                if (!p) return null;
                                                return (
                                                    <motion.div key={`${item.label}-${i}`}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 18 }}
                                                        style={{
                                                            position: 'absolute',
                                                            left: wellR + p.x - emojiSz / 2,
                                                            top:  wellR + p.y - emojiSz / 2,
                                                            width: emojiSz, height: emojiSz,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                        {/* Halo */}
                                                        <div style={{
                                                            position: 'absolute', inset: -emojiSz * 0.22, borderRadius: '50%',
                                                            background: item.color, opacity: 0.18,
                                                        }} />
                                                        <span style={{ fontSize: emojiSz * 0.9, lineHeight: 1, position: 'relative', userSelect: 'none' }}>
                                                            {item.emoji}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Calorie badge */}
                            {!isEmpty && (
                                <div className="px-4 py-1 rounded-full text-xs font-black border shadow-sm"
                                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)', color: 'var(--gp-text)', whiteSpace: 'nowrap' }}>
                                    {totalCal} kcal today
                                </div>
                            )}

                            {/* Legend */}
                            {!isEmpty && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full px-1">
                                    {legendGroups.map((d) => (
                                        <div key={d.group} className="flex items-center gap-1.5">
                                            <span style={{ fontSize: 14, lineHeight: 1 }}>{d.emoji}</span>
                                            <span className="text-xs font-bold truncate" style={{ color: 'var(--gp-text)' }}>{GROUP_LABELS[d.group]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isEmpty && <p className="text-xs font-bold text-center" style={{ color: 'var(--gp-muted)' }}>Start logging meals to see today&apos;s plate</p>}
                        </motion.div>
                    )}

                    {/* BACK — macro pie */}
                    {flipped && (
                        <motion.div key="back"
                            initial={{ rotateY:  90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1, transition: ANIM }}
                            exit={{   rotateY: -90, opacity: 0, transition: ANIM }}
                            className="flex flex-col items-center gap-3">
                            {macroData.length === 0 ? (
                                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                                    <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>No data yet</p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative" style={{ width: size, height: size }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={macroData} cx="50%" cy="50%"
                                                    innerRadius={size * 0.24} outerRadius={size * 0.40}
                                                    paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={450}>
                                                    {macroData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(val, _n, props) => [`${val}${(props.payload as { unit: string }).unit}`, _n]}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontWeight: 700, fontSize: 12 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="font-black" style={{ fontSize: size * 0.12, color: 'var(--gp-text)' }}>{totalCal}</span>
                                            <span className="font-bold" style={{ fontSize: size * 0.046, color: 'var(--gp-muted)' }}>kcal total</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full px-1">
                                        {macroData.map((d) => (
                                            <div key={d.name} className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                                <span className="text-xs font-bold" style={{ color: 'var(--gp-text)' }}>{d.name}</span>
                                                <span className="text-xs ml-auto" style={{ color: 'var(--gp-muted)' }}>{d.value}{d.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function SizeBtn({ onClick, disabled, label, aria }: { onClick: () => void; disabled: boolean; label: string; aria: string }) {
    return (
        <button onClick={onClick} disabled={disabled} aria-label={aria}
            className="w-7 h-7 rounded-full flex items-center justify-center font-black border transition-all disabled:opacity-30 text-sm flex-shrink-0"
            style={{ background: 'var(--gp-bg)', borderColor: 'var(--gp-border)', color: 'var(--gp-text)' }}>
            {label}
        </button>
    );
}
