'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useChild } from '@/hooks/useChild';
import { useTodayLog } from '@/hooks/useTodayLog';
import { computeNutrientStatus, getOverallSeverity } from '@/lib/nutrition';
import PlateVisualization from '@/components/PlateVisualization';
import NutrientBars from '@/components/NutrientBars';
import AlertBanner from '@/components/AlertBanner';
import MealSlot from '@/components/MealSlot';
import FoodSearchModal from '@/components/FoodSearchModal';
import type { MealType, Food } from '@/lib/types';
import { MEAL_LABELS, MEAL_EMOJIS } from '@/lib/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'snack', 'lunch', 'dinner'];

const STATUS_MESSAGES: Record<string, string> = {
    green: 'Looking great today! 🌟',
    yellow: 'Almost there — keep going!',
    orange: 'Some nutrients need attention',
    red: 'Log more meals to hit today\'s goals',
};

const STATUS_BG: Record<string, string> = {
    green: 'var(--gp-green)',
    yellow: 'var(--gp-yellow)',
    orange: 'var(--gp-orange)',
    red: 'var(--gp-red)',
};

export default function TodayPage() {
    const { child, loading: childLoading, targets } = useChild();
    const { log, items, totals, addItem, removeItem, refetch, loading: logLoading } = useTodayLog(child?.id ?? null);

    const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch on mount
    useEffect(() => {
        if (child?.id) refetch();
    }, [child?.id]);

    const mealItems = items.filter((i) => i.meal_type === activeMeal);
    const todayDate = format(new Date(), 'EEEE, d MMMM');

    const statuses = targets ? computeNutrientStatus(totals, targets) : [];
    const overallSeverity = statuses.length > 0 ? getOverallSeverity(statuses) : 'green';
    const totalCalories = Math.round(log?.total_calories ?? totals.calories_kcal);
    const targetCalories = targets?.calories_kcal ?? 0;

    const handleAddFood = async (food: Food, quantityDisplay: number, unit: string) => {
        await addItem(food, quantityDisplay, unit, activeMeal);
    };

    // ── Skeleton loading ──────────────────────────────────────────────────────
    if (childLoading) {
        return (
            <div className="p-6 flex flex-col gap-5">
                <div className="skeleton h-8 w-48 rounded-lg" />
                <div className="skeleton h-16 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-48 w-full rounded-xl" />
            </div>
        );
    }

    // ── No child registered ───────────────────────────────────────────────────
    if (!child) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-5xl mb-4">👶</div>
                    <h2 className="text-xl font-black mb-2" style={{ color: 'var(--gp-text)' }}>
                        No child profile found
                    </h2>
                    <p className="text-sm font-bold" style={{ color: 'var(--gp-muted)' }}>
                        Please complete signup to add a child profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-5xl mx-auto">
                {/* ── Desktop two-column / Mobile single column ── */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* ── Left column: Meal Logger ── */}
                    <div className="flex-1 flex flex-col gap-4">

                        {/* Header */}
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-black" style={{ color: 'var(--gp-text)' }}>
                                {child.name} <span className="text-base font-bold" style={{ color: 'var(--gp-muted)' }}>· {todayDate}</span>
                            </h1>
                            <p className="text-sm font-bold" style={{ color: 'var(--gp-muted)' }}>
                                {totalCalories} / {targetCalories} kcal today
                            </p>
                        </div>

                        {/* Status banner */}
                        <motion.div
                            layout
                            className="rounded-xl px-4 py-3 flex items-center gap-3"
                            style={{ background: STATUS_BG[overallSeverity] + '20', border: `1.5px solid ${STATUS_BG[overallSeverity]}40` }}
                        >
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ background: STATUS_BG[overallSeverity] }}
                            />
                            <p className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                {STATUS_MESSAGES[overallSeverity]}
                            </p>
                        </motion.div>

                        {/* Offline banner */}
                        {typeof navigator !== 'undefined' && !navigator.onLine && (
                            <div
                                className="rounded-xl px-4 py-2 text-xs font-bold text-center"
                                style={{ background: '#F5F0E8', color: 'var(--gp-muted)' }}
                            >
                                📴 You&apos;re offline. Changes will sync when reconnected.
                            </div>
                        )}

                        {/* Meal tabs */}
                        <div
                            className="flex rounded-xl p-1 gap-1"
                            style={{ background: 'var(--gp-bg)', border: '1.5px solid var(--gp-border)' }}
                        >
                            {MEAL_TYPES.map((m) => {
                                const mealCount = items.filter((i) => i.meal_type === m).length;
                                const isActive = m === activeMeal;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => setActiveMeal(m)}
                                        className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg font-black text-xs transition-all relative"
                                        style={{
                                            background: isActive ? 'var(--gp-orange)' : 'transparent',
                                            color: isActive ? '#FFFFFF' : 'var(--gp-muted)',
                                        }}
                                    >
                                        <span>{MEAL_EMOJIS[m]}</span>
                                        <span className="hidden sm:block">{MEAL_LABELS[m]}</span>
                                        {mealCount > 0 && (
                                            <span
                                                className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-black"
                                                style={{
                                                    background: isActive ? '#FFFFFF' : 'var(--gp-orange)',
                                                    color: isActive ? 'var(--gp-orange)' : '#FFFFFF',
                                                    fontSize: '9px',
                                                }}
                                            >
                                                {mealCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Meal card */}
                        <div
                            className="rounded-2xl p-4 border"
                            style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                        >
                            <h3 className="font-black mb-3" style={{ color: 'var(--gp-text)' }}>
                                {MEAL_EMOJIS[activeMeal]} {MEAL_LABELS[activeMeal]}
                            </h3>

                            {logLoading ? (
                                <div className="flex flex-col gap-2">
                                    {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                                </div>
                            ) : (
                                <MealSlot
                                    mealType={activeMeal}
                                    childName={child.name}
                                    items={mealItems as Parameters<typeof MealSlot>[0]['items']}
                                    onAddFood={() => setModalOpen(true)}
                                    onRemoveItem={removeItem}
                                />
                            )}
                        </div>

                        {/* Nutrient bars */}
                        {targets && (
                            <div
                                className="rounded-2xl p-4 border"
                                style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                            >
                                <h3 className="font-black mb-4" style={{ color: 'var(--gp-text)' }}>
                                    Nutrition Progress
                                </h3>
                                <NutrientBars totals={totals} targets={targets} />
                            </div>
                        )}

                        {/* Alerts */}
                        {statuses.length > 0 && <AlertBanner statuses={statuses} />}
                    </div>

                    {/* ── Right column: Plate visualization (sticky on desktop) ── */}
                    <div className="md:w-72 lg:w-80 flex flex-col gap-4">
                        <div
                            className="rounded-2xl p-5 border md:sticky md:top-8"
                            style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                        >
                            <h3 className="font-black mb-4" style={{ color: 'var(--gp-text)' }}>
                                Today&apos;s Plate
                            </h3>
                            <PlateVisualization
                                items={items.map((i) => ({
                                    food_group: i.food.food_group,
                                    calories_kcal: i.calories_kcal,
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Food search modal */}
            <FoodSearchModal
                open={modalOpen}
                mealType={activeMeal}
                childId={child.id}
                onClose={() => setModalOpen(false)}
                onAdd={handleAddFood}
            />
        </div>
    );
}
