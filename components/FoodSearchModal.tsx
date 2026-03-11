'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toGrams, calcNutrientsForItem } from '@/lib/nutrition';
import type { Food, MealType, FoodGroup } from '@/lib/types';
import { GROUP_COLORS, GROUP_LABELS, MEAL_LABELS } from '@/lib/types';

interface FoodSearchModalProps {
    open: boolean;
    mealType: MealType;
    childId: string;
    onClose: () => void;
    onAdd: (food: Food, quantityDisplay: number, unit: string) => Promise<void>;
}

const UNITS = ['g', 'piece', 'cup', 'tbsp', 'tsp', 'ml'];

export default function FoodSearchModal({
    open,
    mealType,
    childId,
    onClose,
    onAdd,
}: FoodSearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[]>([]);
    const [recentFoods, setRecentFoods] = useState<Food[]>([]);
    const [selected, setSelected] = useState<Food | null>(null);
    const [quantity, setQuantity] = useState<string>('100');
    const [unit, setUnit] = useState('g');
    const [adding, setAdding] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Autofocus search input on open
    useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 100);
            fetchRecentFoods();
            setQuery('');
            setResults([]);
            setSelected(null);
            setQuantity('100');
            setUnit('g');
        }
    }, [open]);

    const fetchRecentFoods = async () => {
        try {
            const supabase = createClient();

            // Step 1: get daily_log IDs for this child
            const { data: logData } = await supabase
                .from('daily_logs')
                .select('id')
                .eq('child_id', childId)
                .order('log_date', { ascending: false })
                .limit(30);

            if (!logData || logData.length === 0) return;
            const logIds = logData.map((l: { id: string }) => l.id);

            // Step 2: get meal IDs
            const { data: mealData } = await supabase
                .from('meals')
                .select('id')
                .in('daily_log_id', logIds);

            if (!mealData || mealData.length === 0) return;
            const mealIds = mealData.map((m: { id: string }) => m.id);

            // Step 3: get recent meal items with food join
            const { data } = await supabase
                .from('meal_items')
                .select('food_id, food:foods(*), logged_at')
                .in('meal_id', mealIds)
                .order('logged_at', { ascending: false })
                .limit(20);

            if (data) {
                // Deduplicate by food_id, keep last 5
                const seen = new Set<string>();
                const unique: Food[] = [];
                for (const row of data) {
                    const rowTyped = row as unknown as { food_id: string; food: Food | null };
                    if (rowTyped.food && !seen.has(rowTyped.food_id)) {
                        seen.add(rowTyped.food_id);
                        unique.push(rowTyped.food);
                        if (unique.length >= 5) break;
                    }
                }
                setRecentFoods(unique);
            }
        } catch {
            // silently ignore
        }
    };

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 1) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('foods')
                .select('*')
                .ilike('name', `%${q.trim()}%`)
                .limit(8);
            setResults((data as Food[]) ?? []);
        } finally {
            setSearching(false);
        }
    }, []);

    // Debounced search
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 300);
    };

    const handleSelect = (food: Food) => {
        setSelected(food);
        setQuantity(food.grams_per_piece ? '1' : '100');
        setUnit(food.grams_per_piece ? 'piece' : 'g');
    };

    const qty = parseFloat(quantity) || 0;
    const grams = qty > 0 ? toGrams(qty, unit, selected?.grams_per_piece ?? undefined) : 0;
    const preview = selected && grams > 0 ? calcNutrientsForItem(selected, grams) : null;

    const handleAdd = async () => {
        if (!selected || qty <= 0) return;
        setAdding(true);
        try {
            await onAdd(selected, qty, unit);
            onClose();
        } finally {
            setAdding(false);
        }
    };

    const displayList: Food[] = query.trim().length > 0 ? results : recentFoods;
    const listLabel = query.trim().length > 0 ? 'Search Results' : 'Recent Foods';

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40"
                    />

                    {/* Sheet / Modal */}
                    <motion.div
                        key="modal"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed z-50 inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] flex flex-col rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'var(--gp-card)',
                            maxHeight: '88svh',
                        }}
                    >
                        {/* Handle (mobile) */}
                        <div className="flex justify-center pt-3 pb-1 md:hidden">
                            <div
                                className="w-10 h-1 rounded-full"
                                style={{ background: 'var(--gp-border)' }}
                            />
                        </div>

                        {/* Header */}
                        <div
                            className="flex items-center gap-3 px-5 py-4 border-b"
                            style={{ borderColor: 'var(--gp-border)' }}
                        >
                            <div className="flex-1">
                                <p className="font-black text-base" style={{ color: 'var(--gp-text)' }}>
                                    Add to {MEAL_LABELS[mealType]}
                                </p>
                                <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                    Search foods or choose from recent
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--gp-bg)' }}
                            >
                                <X size={16} style={{ color: 'var(--gp-muted)' }} />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 flex flex-col gap-4">
                            {/* Search input */}
                            <div
                                className="flex items-center gap-3 rounded-xl px-4 py-3"
                                style={{ background: 'var(--gp-bg)', border: '1.5px solid var(--gp-border)' }}
                            >
                                <Search size={16} style={{ color: 'var(--gp-muted)' }} />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Search for rice, dal, apple…"
                                    value={query}
                                    onChange={handleQueryChange}
                                    className="flex-1 bg-transparent font-bold text-sm outline-none placeholder:text-gray-400"
                                    style={{ color: 'var(--gp-text)' }}
                                />
                                {query && (
                                    <button onClick={() => { setQuery(''); setResults([]); }}>
                                        <X size={14} style={{ color: 'var(--gp-muted)' }} />
                                    </button>
                                )}
                            </div>

                            {/* Food list */}
                            {(displayList.length > 0 || searching) && !selected && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--gp-muted)' }}>
                                        {searching ? 'Searching…' : listLabel}
                                    </p>
                                    {searching ? (
                                        <div className="flex flex-col gap-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="skeleton h-16 rounded-xl" />
                                            ))}
                                        </div>
                                    ) : (
                                        displayList.map((food) => (
                                            <motion.button
                                                key={food.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelect(food)}
                                                className="w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all border"
                                                style={{
                                                    background: 'var(--gp-bg)',
                                                    borderColor: 'transparent',
                                                }}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                                                    style={{ background: GROUP_COLORS[food.food_group as FoodGroup] }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm" style={{ color: 'var(--gp-text)' }}>
                                                        {food.name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: 'var(--gp-muted)' }}>
                                                        per 100g · {food.calories_kcal} kcal · {food.protein_g}g protein
                                                    </p>
                                                </div>
                                                <span
                                                    className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                    style={{
                                                        background: GROUP_COLORS[food.food_group as FoodGroup] + '20',
                                                        color: GROUP_COLORS[food.food_group as FoodGroup],
                                                    }}
                                                >
                                                    {GROUP_LABELS[food.food_group as FoodGroup]}
                                                </span>
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Quantity selector — shown once food selected */}
                            <AnimatePresence>
                                {selected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 16 }}
                                        className="flex flex-col gap-4"
                                    >
                                        {/* Selected food header */}
                                        <div
                                            className="flex items-center gap-3 rounded-xl p-4 border"
                                            style={{ background: '#FFF3E8', borderColor: 'var(--gp-orange)' }}
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ background: GROUP_COLORS[selected.food_group as FoodGroup] }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-black text-sm" style={{ color: 'var(--gp-text)' }}>
                                                    {selected.name}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--gp-muted)' }}>
                                                    {GROUP_LABELS[selected.food_group as FoodGroup]}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelected(null)}
                                                className="text-xs font-bold underline"
                                                style={{ color: 'var(--gp-orange)' }}
                                            >
                                                Change
                                            </button>
                                        </div>

                                        {/* Quantity + unit */}
                                        <div className="flex gap-3 items-end">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <label className="text-xs font-black" style={{ color: 'var(--gp-muted)' }}>
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    className="rounded-xl px-4 py-3 font-black text-lg outline-none border-2 transition-all"
                                                    style={{
                                                        background: 'var(--gp-bg)',
                                                        borderColor: 'var(--gp-border)',
                                                        color: 'var(--gp-text)',
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-black" style={{ color: 'var(--gp-muted)' }}>
                                                    Unit
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={unit}
                                                        onChange={(e) => setUnit(e.target.value)}
                                                        className="appearance-none rounded-xl px-4 py-3 pr-8 font-bold outline-none border-2 cursor-pointer"
                                                        style={{
                                                            background: 'var(--gp-bg)',
                                                            borderColor: 'var(--gp-border)',
                                                            color: 'var(--gp-text)',
                                                        }}
                                                    >
                                                        {UNITS.map((u) => (
                                                            <option key={u} value={u}>{u}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown
                                                        size={14}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                        style={{ color: 'var(--gp-muted)' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live calorie preview */}
                                        {preview && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="grid grid-cols-4 gap-2 rounded-xl p-3"
                                                style={{ background: 'var(--gp-bg)' }}
                                            >
                                                {[
                                                    { label: 'Calories', value: preview.calories_kcal, unit: 'kcal' },
                                                    { label: 'Protein', value: preview.protein_g, unit: 'g' },
                                                    { label: 'Carbs', value: preview.carbs_g, unit: 'g' },
                                                    { label: 'Fat', value: preview.fat_g, unit: 'g' },
                                                ].map(({ label, value, unit: u }) => (
                                                    <div key={label} className="flex flex-col items-center gap-0.5">
                                                        <span className="text-base font-black" style={{ color: 'var(--gp-text)' }}>
                                                            {value}
                                                        </span>
                                                        <span className="text-xs" style={{ color: 'var(--gp-muted)' }}>
                                                            {u}
                                                        </span>
                                                        <span className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer CTA */}
                        {selected && (
                            <div
                                className="px-5 pb-safe pb-6 pt-3 border-t"
                                style={{ borderColor: 'var(--gp-border)' }}
                            >
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleAdd}
                                    disabled={adding || qty <= 0}
                                    className="w-full py-4 rounded-xl font-black text-base transition-all disabled:opacity-60"
                                    style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                                >
                                    {adding ? 'Adding…' : `Add to ${MEAL_LABELS[mealType]}`}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
