'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { calcNutrientsForItem, toGrams, sumNutrients } from '@/lib/nutrition';
import type { FoodNutrients } from '@/lib/nutrition';
import type { DailyLog, Meal, MealItem, MealType, Food } from '@/lib/types';
import { toast } from 'sonner';

interface LoggedItem extends MealItem {
    food: Food;
    meal_type: MealType;
}

interface UseTodayLogReturn {
    log: DailyLog | null;
    meals: Meal[];
    items: LoggedItem[];
    totals: FoodNutrients;
    loading: boolean;
    addItem: (
        food: Food,
        quantityDisplay: number,
        unit: string,
        mealType: MealType
    ) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    refetch: () => Promise<void>;
}

const EMPTY_TOTALS: FoodNutrients = {
    calories_kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    calcium_mg: 0,
    iron_mg: 0,
    vitamin_d_mcg: 0,
    zinc_mg: 0,
};

export function useTodayLog(childId: string | null): UseTodayLogReturn {
    const [log, setLog] = useState<DailyLog | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [items, setItems] = useState<LoggedItem[]>([]);
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const refetch = useCallback(async () => {
        if (!childId) return;
        setLoading(true);
        try {
            const supabase = createClient();

            // Fetch or confirm daily_log
            const { data: logData } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('child_id', childId)
                .eq('log_date', today)
                .single();

            setLog(logData as DailyLog | null);

            if (!logData) {
                setMeals([]);
                setItems([]);
                return;
            }

            // Fetch meals
            const { data: mealData } = await supabase
                .from('meals')
                .select('*')
                .eq('daily_log_id', logData.id);

            setMeals((mealData as Meal[]) ?? []);

            if (!mealData || mealData.length === 0) {
                setItems([]);
                return;
            }

            const mealIds = mealData.map((m: Meal) => m.id);

            // Fetch meal items with food join
            const { data: itemData } = await supabase
                .from('meal_items')
                .select('*, food:foods(*)')
                .in('meal_id', mealIds);

            // Attach meal_type from meal lookup
            const mealMap: Record<string, MealType> = {};
            (mealData as Meal[]).forEach((m) => {
                mealMap[m.id] = m.meal_type;
            });

            const enriched: LoggedItem[] = ((itemData ?? []) as (MealItem & { food: Food })[]).map((it) => ({
                ...it,
                meal_type: mealMap[it.meal_id] ?? 'breakfast',
            }));

            setItems(enriched);
        } finally {
            setLoading(false);
        }
    }, [childId, today]);

    const addItem = useCallback(
        async (food: Food, quantityDisplay: number, unit: string, mealType: MealType) => {
            if (!childId) return;
            const supabase = createClient();

            const grams = toGrams(quantityDisplay, unit, food.grams_per_piece ?? undefined);
            const nutrients = calcNutrientsForItem(food, grams);

            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const optimisticItem: LoggedItem = {
                id: tempId,
                meal_id: '',
                food_id: food.id,
                quantity_g: grams,
                quantity_display: quantityDisplay,
                unit_display: unit,
                ...nutrients,
                logged_at: new Date().toISOString(),
                food,
                meal_type: mealType,
            };
            setItems((prev) => [...prev, optimisticItem]);
            setLog((prev) =>
                prev
                    ? {
                        ...prev,
                        total_calories: prev.total_calories + nutrients.calories_kcal,
                        total_protein_g: prev.total_protein_g + nutrients.protein_g,
                        total_carbs_g: prev.total_carbs_g + nutrients.carbs_g,
                        total_fat_g: prev.total_fat_g + nutrients.fat_g,
                        total_fiber_g: prev.total_fiber_g + nutrients.fiber_g,
                        total_iron_mg: prev.total_iron_mg + nutrients.iron_mg,
                        total_calcium_mg: prev.total_calcium_mg + nutrients.calcium_mg,
                    }
                    : null
            );

            try {
                // 1. Upsert daily_log
                const { data: logRow, error: logError } = await supabase
                    .from('daily_logs')
                    .upsert(
                        { child_id: childId, log_date: today },
                        { onConflict: 'child_id,log_date', ignoreDuplicates: false }
                    )
                    .select()
                    .single();

                if (logError || !logRow) throw logError ?? new Error('Failed to upsert daily_log');

                // 2. Upsert meal
                const { data: mealRow, error: mealError } = await supabase
                    .from('meals')
                    .upsert(
                        { daily_log_id: logRow.id, meal_type: mealType },
                        { onConflict: 'daily_log_id,meal_type', ignoreDuplicates: false }
                    )
                    .select()
                    .single();

                if (mealError || !mealRow) throw mealError ?? new Error('Failed to upsert meal');

                // 3. Insert meal_item
                const { error: itemError } = await supabase.from('meal_items').insert({
                    meal_id: mealRow.id,
                    food_id: food.id,
                    quantity_g: grams,
                    quantity_display: quantityDisplay,
                    unit_display: unit,
                    calories_kcal: nutrients.calories_kcal,
                    protein_g: nutrients.protein_g,
                    carbs_g: nutrients.carbs_g,
                    fat_g: nutrients.fat_g,
                    fiber_g: nutrients.fiber_g,
                    iron_mg: nutrients.iron_mg,
                    calcium_mg: nutrients.calcium_mg,
                });

                if (itemError) throw itemError;

                // 4. Call increment_daily_totals RPC
                await supabase.rpc('increment_daily_totals', {
                    p_daily_log_id: logRow.id,
                    p_calories: nutrients.calories_kcal,
                    p_protein: nutrients.protein_g,
                    p_carbs: nutrients.carbs_g,
                    p_fat: nutrients.fat_g,
                    p_fiber: nutrients.fiber_g,
                    p_iron: nutrients.iron_mg,
                    p_calcium: nutrients.calcium_mg,
                });

                // Refetch to get real IDs
                await refetch();
            } catch (err) {
                console.error('addItem failed:', err);
                toast.error('Could not save food item. Please try again.');
                // Roll back optimistic update
                setItems((prev) => prev.filter((i) => i.id !== tempId));
                await refetch();
            }
        },
        [childId, today, refetch]
    );

    const removeItem = useCallback(
        async (itemId: string) => {
            const supabase = createClient();
            // Find item for rollback
            const item = items.find((i) => i.id === itemId);

            // Optimistic removal
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            if (item) {
                setLog((prev) =>
                    prev
                        ? {
                            ...prev,
                            total_calories: Math.max(0, prev.total_calories - item.calories_kcal),
                            total_protein_g: Math.max(0, prev.total_protein_g - item.protein_g),
                            total_carbs_g: Math.max(0, prev.total_carbs_g - item.carbs_g),
                            total_fat_g: Math.max(0, prev.total_fat_g - item.fat_g),
                            total_fiber_g: Math.max(0, prev.total_fiber_g - item.fiber_g),
                            total_iron_mg: Math.max(0, prev.total_iron_mg - item.iron_mg),
                            total_calcium_mg: Math.max(0, prev.total_calcium_mg - item.calcium_mg),
                        }
                        : null
                );
            }

            try {
                const { error } = await supabase.from('meal_items').delete().eq('id', itemId);
                if (error) throw error;
                // Refetch to get accurate totals from DB
                await refetch();
            } catch (err) {
                console.error('removeItem failed:', err);
                toast.error('Could not remove item. Please try again.');
                await refetch();
            }
        },
        [items, refetch]
    );

    const totals =
        items.length > 0
            ? sumNutrients(
                items.map((i) => ({
                    calories_kcal: i.calories_kcal,
                    protein_g: i.protein_g,
                    carbs_g: i.carbs_g,
                    fat_g: i.fat_g,
                    fiber_g: i.fiber_g,
                    calcium_mg: i.calcium_mg,
                    iron_mg: i.iron_mg,
                    vitamin_d_mcg: 0,
                    zinc_mg: 0,
                }))
            )
            : EMPTY_TOTALS;

    return { log, meals, items, totals, loading, addItem, removeItem, refetch };
}
