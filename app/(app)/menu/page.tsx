'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useFoodMenu } from '@/hooks/useFoodMenu';
import { GROUP_COLORS, GROUP_LABELS } from '@/lib/types';
import type { FoodGroup } from '@/lib/types';
import PageBackground from '@/components/PageBackground';

const ALL_GROUPS: { value: FoodGroup | 'all'; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'grains',     label: 'Grains' },
    { value: 'protein',    label: 'Protein' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits',     label: 'Fruits' },
    { value: 'dairy',      label: 'Dairy' },
    { value: 'fats',       label: 'Fats' },
    { value: 'other',      label: 'Other' },
];

type SortField = 'name' | 'calories_kcal' | 'protein_g' | 'carbs_g' | 'fat_g';
const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: 'name',         label: 'Name' },
    { value: 'calories_kcal',label: 'Calories' },
    { value: 'protein_g',    label: 'Protein' },
    { value: 'carbs_g',      label: 'Carbs' },
    { value: 'fat_g',        label: 'Fat' },
];

export default function FoodMenuPage() {
    const [search, setSearch]     = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [group, setGroup]       = useState<FoodGroup | 'all'>('all');
    const [sortBy, setSortBy]     = useState<SortField>('name');
    const [sortAsc, setSortAsc]   = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    const { foods, loading, error } = useFoodMenu({ search: debouncedSearch, group, sortBy });

    // Client-side sort direction (hook always sorts ascending)
    const displayed = sortAsc ? foods : [...foods].reverse();

    const toggleSort = (field: SortField) => {
        if (sortBy === field) setSortAsc((a) => !a);
        else { setSortBy(field); setSortAsc(true); }
    };

    return (
        <>
            <PageBackground page="menu" />
            <div className="relative z-10 px-3 py-4 md:px-5 md:py-6">
            <div className="flex flex-col gap-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--gp-text)' }}>Food Menu</h1>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--gp-muted)' }}>
                        Browse nutrition data for all foods · per 100 g
                    </p>
                </div>

                {/* Search + sort bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gp-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search foods…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-orange-400"
                            style={{
                                background: 'var(--gp-card)',
                                borderColor: 'var(--gp-border)',
                                color: 'var(--gp-text)',
                            }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--gp-muted)' }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {SORT_OPTIONS.map((s) => (
                            <button key={s.value} onClick={() => toggleSort(s.value)}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black border transition-all"
                                style={{
                                    background: sortBy === s.value ? 'var(--gp-orange)' : 'var(--gp-bg)',
                                    borderColor: sortBy === s.value ? 'var(--gp-orange)' : 'var(--gp-border)',
                                    color: sortBy === s.value ? '#fff' : 'var(--gp-muted)',
                                }}>
                                {s.label}
                                {sortBy === s.value && (sortAsc
                                    ? <ChevronUp size={12} />
                                    : <ChevronDown size={12} />)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Group filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {ALL_GROUPS.map((g) => {
                        const active = group === g.value;
                        const color  = g.value !== 'all' ? GROUP_COLORS[g.value as FoodGroup] : 'var(--gp-orange)';
                        return (
                            <button key={g.value} onClick={() => setGroup(g.value)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-black border transition-all"
                                style={{
                                    background: active ? color : 'var(--gp-bg)',
                                    borderColor: active ? color : 'var(--gp-border)',
                                    color: active ? '#fff' : 'var(--gp-muted)',
                                }}>
                                {g.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                        {displayed.length} food{displayed.length !== 1 ? 's' : ''} found
                    </p>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton rounded-2xl h-40" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="rounded-xl p-6 text-center border" style={{ background: '#FFF0EF', borderColor: '#FECACA' }}>
                        <p className="font-bold text-sm" style={{ color: 'var(--gp-red)' }}>Failed to load: {error}</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="rounded-2xl p-10 flex flex-col items-center gap-3 border"
                        style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}>
                        <span style={{ fontSize: 40, opacity: 0.4 }}>🍽️</span>
                        <p className="font-bold text-sm text-center" style={{ color: 'var(--gp-muted)' }}>
                            No foods match your filters.<br />Try a different search or group.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayed.map((food, i) => {
                                const gc = GROUP_COLORS[food.food_group as FoodGroup] ?? '#A0A0A0';
                                const gl = GROUP_LABELS[food.food_group as FoodGroup] ?? food.food_group;
                                return (
                                    <motion.div
                                        key={food.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ delay: Math.min(i, 8) * 0.03 }}
                                        className="rounded-2xl p-4 border flex flex-col gap-3"
                                        style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                                    >
                                        {/* Name + group */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-black text-sm leading-snug" style={{ color: 'var(--gp-text)' }}>
                                                {food.name}
                                            </h3>
                                            <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ background: gc + '20', color: gc }}>
                                                {gl}
                                            </span>
                                        </div>

                                        {/* Calorie highlight */}
                                        <div className="rounded-xl px-3 py-2 flex items-baseline gap-1"
                                            style={{ background: 'var(--gp-bg)' }}>
                                            <span className="text-2xl font-black" style={{ color: 'var(--gp-text)' }}>
                                                {Math.round(food.calories_kcal)}
                                            </span>
                                            <span className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>kcal</span>
                                        </div>

                                        {/* Macros grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Protein', val: food.protein_g, unit: 'g', color: '#E8504A' },
                                                { label: 'Carbs',   val: food.carbs_g,   unit: 'g', color: '#F5C842' },
                                                { label: 'Fat',     val: food.fat_g,     unit: 'g', color: '#B47FE8' },
                                            ].map((m) => (
                                                <div key={m.label} className="flex flex-col items-center gap-0.5">
                                                    <span className="text-sm font-black" style={{ color: m.color }}>
                                                        {Math.round(m.val * 10) / 10}
                                                        <span className="text-xs font-bold">{m.unit}</span>
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--gp-muted)' }}>{m.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Fiber */}
                                        <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                            Fiber: {Math.round(food.fiber_g * 10) / 10}g
                                            {food.source ? ` · ${food.source}` : ''}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </div>
            </div>
        </>
    );
}
