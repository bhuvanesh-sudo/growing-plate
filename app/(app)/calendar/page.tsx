'use client';

import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useChild } from '@/hooks/useChild';
import type { DailyLog, MealItem, Food, MealType } from '@/lib/types';
import { MEAL_LABELS, MEAL_EMOJIS } from '@/lib/types';
import PageBackground from '@/components/PageBackground';

const STATUS_COLORS: Record<string, string> = {
    green: 'var(--gp-green)',
    yellow: 'var(--gp-yellow)',
    orange: 'var(--gp-orange)',
    red: 'var(--gp-red)',
};

type LogByDate = Record<string, DailyLog>;

interface DaySummary {
    log: DailyLog;
    items: (MealItem & { food: Food; meal_type: MealType })[];
}

export default function CalendarPage() {
    const { child } = useChild();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [logs, setLogs] = useState<LogByDate>({});
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Build calendar days grid (include leading/trailing days to fill weeks)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Mon
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    // Fetch daily_logs for current month
    useEffect(() => {
        if (!child) return;
        const fetchLogs = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('child_id', child.id)
                .gte('log_date', format(monthStart, 'yyyy-MM-dd'))
                .lte('log_date', format(monthEnd, 'yyyy-MM-dd'));

            if (data) {
                const byDate: LogByDate = {};
                (data as DailyLog[]).forEach((l) => {
                    byDate[l.log_date] = l;
                });
                setLogs(byDate);
            }
        };
        fetchLogs();
    }, [child, currentMonth]);

    // Fetch day summary on select
    useEffect(() => {
        if (!selectedDay || !child) {
            setDaySummary(null);
            return;
        }
        const dateStr = format(selectedDay, 'yyyy-MM-dd');
        const log = logs[dateStr];
        if (!log) { setDaySummary(null); return; }

        const fetchSummary = async () => {
            setLoadingSummary(true);
            try {
                const supabase = createClient();
                const { data: mealData } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('daily_log_id', log.id);

                if (!mealData || mealData.length === 0) {
                    setDaySummary({ log, items: [] });
                    return;
                }

                const mealIds = mealData.map((m: { id: string }) => m.id);
                const mealTypeMap: Record<string, MealType> = {};
                (mealData as { id: string; meal_type: MealType }[]).forEach((m) => {
                    mealTypeMap[m.id] = m.meal_type;
                });

                const { data: itemData } = await supabase
                    .from('meal_items')
                    .select('*, food:foods(*)')
                    .in('meal_id', mealIds);

                const enriched = ((itemData ?? []) as (MealItem & { food: Food })[]).map((i) => ({
                    ...i,
                    meal_type: mealTypeMap[i.meal_id] ?? ('breakfast' as MealType),
                }));

                setDaySummary({ log, items: enriched });
            } finally {
                setLoadingSummary(false);
            }
        };
        fetchSummary();
    }, [selectedDay, logs, child]);

    const today = new Date();

    return (
        <>
            <PageBackground page="calendar" />
            <div className="relative z-10 px-4 py-6 md:px-8 md:py-8">
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--gp-text)' }}>
                    Calendar
                </h1>

                {/* Month navigation */}
                <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                >
                    {/* Month header */}
                    <div
                        className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: 'var(--gp-border)' }}
                    >
                        <button
                            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                            style={{ background: 'var(--gp-bg)' }}
                        >
                            <ChevronLeft size={18} style={{ color: 'var(--gp-text)' }} />
                        </button>

                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black" style={{ color: 'var(--gp-text)' }}>
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            {!isSameMonth(today, currentMonth) && (
                                <button
                                    onClick={() => setCurrentMonth(today)}
                                    className="text-xs font-black px-3 py-1 rounded-full"
                                    style={{ background: 'var(--gp-orange)', color: '#FFFFFF' }}
                                >
                                    Today
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                            style={{ background: 'var(--gp-bg)' }}
                        >
                            <ChevronRight size={18} style={{ color: 'var(--gp-text)' }} />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 px-3 pt-3">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div
                                key={i}
                                className="text-center text-xs font-black py-1"
                                style={{ color: 'var(--gp-muted)' }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 p-3 gap-1">
                        {days.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const log = logs[dateStr];
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodayDay = isToday(day);
                            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

                            return (
                                <motion.button
                                    key={dateStr}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => {
                                        setSelectedDay(isSelected ? null : day);
                                    }}
                                    className="relative flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                                    style={{
                                        opacity: isCurrentMonth ? 1 : 0.35,
                                        background: isSelected
                                            ? 'var(--gp-orange)'
                                            : isTodayDay
                                                ? '#FFF3E8'
                                                : 'transparent',
                                    }}
                                >
                                    <span
                                        className="text-sm font-black"
                                        style={{
                                            color: isSelected ? '#FFFFFF' : isTodayDay ? 'var(--gp-orange)' : 'var(--gp-text)',
                                        }}
                                    >
                                        {format(day, 'd')}
                                    </span>

                                    {/* Status dot */}
                                    {log ? (
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: STATUS_COLORS[log.overall_status] ?? '#A0A0A0' }}
                                        />
                                    ) : isCurrentMonth ? (
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: isSelected ? '#FFFFFF40' : 'var(--gp-border)' }}
                                        />
                                    ) : null}

                                    {/* Calorie hint */}
                                    {log && (
                                        <span
                                            className="text-xs font-bold leading-none"
                                            style={{ color: isSelected ? '#FFFFFF80' : 'var(--gp-muted)', fontSize: '9px' }}
                                        >
                                            {Math.round(log.total_calories)}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Day summary drawer */}
                <AnimatePresence>
                    {selectedDay && (
                        <motion.div
                            key="drawer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.25 }}
                            className="mt-4 rounded-2xl border overflow-hidden"
                            style={{ background: 'var(--gp-card)', borderColor: 'var(--gp-border)' }}
                        >
                            <div
                                className="flex items-center justify-between px-5 py-4 border-b"
                                style={{ borderColor: 'var(--gp-border)' }}
                            >
                                <h3 className="font-black" style={{ color: 'var(--gp-text)' }}>
                                    {format(selectedDay, 'EEEE, d MMMM')}
                                </h3>
                                <button onClick={() => setSelectedDay(null)}>
                                    <X size={18} style={{ color: 'var(--gp-muted)' }} />
                                </button>
                            </div>

                            <div className="p-5">
                                {loadingSummary ? (
                                    <div className="flex flex-col gap-2">
                                        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                                    </div>
                                ) : !daySummary ? (
                                    <div className="text-center py-6">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="text-sm font-bold" style={{ color: 'var(--gp-muted)' }}>
                                            No meals logged for this day
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {/* Day totals */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Calories', value: Math.round(daySummary.log.total_calories), unit: 'kcal' },
                                                { label: 'Protein', value: Math.round(daySummary.log.total_protein_g), unit: 'g' },
                                                { label: 'Iron', value: daySummary.log.total_iron_mg?.toFixed(1) ?? '0', unit: 'mg' },
                                            ].map(({ label, value, unit }) => (
                                                <div
                                                    key={label}
                                                    className="rounded-xl p-3 text-center"
                                                    style={{ background: 'var(--gp-bg)' }}
                                                >
                                                    <p className="font-black text-lg" style={{ color: 'var(--gp-text)' }}>
                                                        {value}
                                                        <span className="text-xs font-bold ml-0.5" style={{ color: 'var(--gp-muted)' }}>{unit}</span>
                                                    </p>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>{label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Meal groups */}
                                        {(['breakfast', 'snack', 'lunch', 'dinner'] as MealType[]).map((mt) => {
                                            const mealItems = daySummary.items.filter((i) => i.meal_type === mt);
                                            if (mealItems.length === 0) return null;
                                            return (
                                                <div key={mt}>
                                                    <p className="text-xs font-black mb-2" style={{ color: 'var(--gp-muted)' }}>
                                                        {MEAL_EMOJIS[mt]} {MEAL_LABELS[mt]}
                                                    </p>
                                                    <div className="flex flex-col gap-1">
                                                        {mealItems.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center gap-2 rounded-lg px-3 py-2"
                                                                style={{ background: 'var(--gp-bg)' }}
                                                            >
                                                                <span className="text-sm font-bold flex-1 truncate" style={{ color: 'var(--gp-text)' }}>
                                                                    {item.food.name}
                                                                </span>
                                                                <span className="text-xs" style={{ color: 'var(--gp-muted)' }}>
                                                                    {Math.round(item.calories_kcal)} kcal
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            </div>
        </>
    );
}
