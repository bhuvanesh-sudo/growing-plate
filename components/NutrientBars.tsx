'use client';

import { motion } from 'framer-motion';
import { computeNutrientStatus } from '@/lib/nutrition';
import type { FoodNutrients, NutrientTargets, AlertSeverity } from '@/lib/nutrition';

interface NutrientBarsProps {
    totals: FoodNutrients;
    targets: NutrientTargets;
}

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
    green: 'var(--gp-green)',
    yellow: 'var(--gp-yellow)',
    orange: 'var(--gp-orange)',
    red: 'var(--gp-red)',
};

export default function NutrientBars({ totals, targets }: NutrientBarsProps) {
    const statuses = computeNutrientStatus(totals, targets);

    return (
        <div className="flex flex-col gap-3">
            {statuses.map((s) => {
                const barWidth = Math.min(s.pct, 150); // cap at 150% visually
                const color = SEVERITY_COLORS[s.severity];

                return (
                    <div key={s.nutrient} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold" style={{ color: 'var(--gp-text)' }}>
                                {s.label}
                            </span>
                            <span className="text-xs font-bold" style={{ color: 'var(--gp-muted)' }}>
                                {s.actual} / {s.target} {s.unit}
                            </span>
                        </div>

                        {/* Track */}
                        <div
                            className="relative h-2.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--gp-border)' }}
                        >
                            {/* Animated fill */}
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Percentage pill */}
                        <div className="flex items-center justify-end">
                            <span
                                className="text-xs font-black px-2 py-0.5 rounded-full"
                                style={{
                                    background: color + '20',
                                    color,
                                }}
                            >
                                {s.pct}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
