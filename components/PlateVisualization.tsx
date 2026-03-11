'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { FoodGroup } from '@/lib/types';
import { GROUP_COLORS, GROUP_LABELS } from '@/lib/types';

interface PlateItem {
    food_group: string;
    calories_kcal: number;
}

interface PlateVisualizationProps {
    items: PlateItem[];
}

interface GroupedData {
    name: string;
    value: number;
    color: string;
    group: FoodGroup;
}

export default function PlateVisualization({ items }: PlateVisualizationProps) {
    // Aggregate calories by food group
    const grouped = items.reduce<Record<string, number>>((acc, item) => {
        const g = item.food_group as FoodGroup;
        acc[g] = (acc[g] ?? 0) + item.calories_kcal;
        return acc;
    }, {});

    const chartData: GroupedData[] = Object.entries(grouped)
        .filter(([, val]) => val > 0)
        .map(([group, value]) => ({
            name: GROUP_LABELS[group as FoodGroup] ?? group,
            value: Math.round(value * 10) / 10,
            color: GROUP_COLORS[group as FoodGroup] ?? '#A0A0A0',
            group: group as FoodGroup,
        }));

    const totalCalories = Math.round(chartData.reduce((sum, d) => sum + d.value, 0));

    const isEmpty = chartData.length === 0;

    return (
        <motion.div
            layout
            className="flex flex-col items-center gap-4"
        >
            <AnimatePresence mode="wait">
                {isEmpty ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3 py-8"
                    >
                        <div
                            className="w-44 h-44 rounded-full flex items-center justify-center text-5xl"
                            style={{ background: '#F5F0E8' }}
                        >
                            🍽️
                        </div>
                        <p className="text-center font-bold" style={{ color: 'var(--gp-muted)' }}>
                            Start logging meals to see today&apos;s plate
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chart"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="relative w-full"
                    >
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={600}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                        fontFamily: 'var(--font-nunito)',
                                        fontWeight: 700,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black" style={{ color: 'var(--gp-text)' }}>
                                {totalCalories}
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                kcal today
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            {!isEmpty && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-x-6 gap-y-2 w-full px-2"
                >
                    {chartData.map((d) => (
                        <div key={d.group} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ background: d.color }}
                            />
                            <span className="text-xs font-bold truncate" style={{ color: 'var(--gp-text)' }}>
                                {d.name}
                            </span>
                            <span className="text-xs ml-auto" style={{ color: 'var(--gp-muted)' }}>
                                {d.value}
                            </span>
                        </div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
