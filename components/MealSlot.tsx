'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { MealType, MealItem, Food, FoodGroup } from '@/lib/types';
import { GROUP_COLORS, GROUP_LABELS } from '@/lib/types';

interface LoggedItem extends MealItem {
    food: Food;
}

interface MealSlotProps {
    mealType: MealType;
    childName: string;
    items: LoggedItem[];
    onAddFood: () => void;
    onRemoveItem: (id: string) => void;
}

const MEAL_NAMES: Record<MealType, string> = {
    breakfast: 'Breakfast',
    snack: 'Snack',
    lunch: 'Lunch',
    dinner: 'Dinner',
};

export default function MealSlot({
    mealType,
    childName,
    items,
    onAddFood,
    onRemoveItem,
}: MealSlotProps) {
    const mealCalories = Math.round(items.reduce((sum, i) => sum + i.calories_kcal, 0));

    return (
        <div className="flex flex-col gap-3">
            {/* Calorie hint for this meal */}
            {items.length > 0 && (
                <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                    {mealCalories} kcal from {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Item list */}
            <AnimatePresence initial={false}>
                {items.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3 py-8 rounded-xl"
                        style={{ background: 'var(--gp-bg)' }}
                    >
                        <span className="text-4xl">🥣</span>
                        <p className="text-sm font-bold text-center" style={{ color: 'var(--gp-muted)' }}>
                            What did {childName} have for {MEAL_NAMES[mealType].toLowerCase()}?
                        </p>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                style={{ background: 'var(--gp-bg)' }}
                            >
                                {/* Group dot */}
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                        background: GROUP_COLORS[(item.food.food_group as FoodGroup)] ?? '#A0A0A0',
                                    }}
                                />

                                {/* Food info */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-bold truncate"
                                        style={{ color: 'var(--gp-text)' }}
                                    >
                                        {item.food.name}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--gp-muted)' }}>
                                        {item.quantity_display ?? item.quantity_g}
                                        {item.unit_display === 'g' ? 'g' : ` ${item.unit_display}`} ·{' '}
                                        {Math.round(item.calories_kcal)} kcal
                                    </p>
                                </div>

                                {/* Group badge */}
                                <span
                                    className="hidden sm:block text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: GROUP_COLORS[(item.food.food_group as FoodGroup)] + '20',
                                        color: GROUP_COLORS[(item.food.food_group as FoodGroup)],
                                    }}
                                >
                                    {GROUP_LABELS[item.food.food_group as FoodGroup]}
                                </span>

                                {/* Remove button */}
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: '#FFEEED', color: 'var(--gp-red)' }}
                                    aria-label={`Remove ${item.food.name}`}
                                >
                                    <X size={13} strokeWidth={2.5} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Add food button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAddFood}
                className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
            >
                <span className="text-base">+</span>
                Add Food
            </motion.button>
        </div>
    );
}
