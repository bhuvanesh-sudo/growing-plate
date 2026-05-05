'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { NutrientStatus } from '@/lib/nutrition';

interface AlertBannerProps {
    statuses: NutrientStatus[];
}

export default function AlertBanner({ statuses }: AlertBannerProps) {
    const [open, setOpen] = useState(false);

    const alerts = statuses.filter((s) => s.severity !== 'green');
    if (alerts.length === 0) return null;

    const worstSeverity = alerts.some((a) => a.severity === 'red')
        ? 'red'
        : alerts.some((a) => a.severity === 'orange')
            ? 'orange'
            : 'yellow';

    const severityColor = {
        yellow: 'var(--gp-yellow)',
        orange: 'var(--gp-orange)',
        red:    'var(--gp-red)',
    }[worstSeverity];

    const severityBg = {
        yellow: 'var(--gp-yellow-soft)',
        orange: 'var(--gp-orange-soft)',
        red:    'var(--gp-red-soft)',
    }[worstSeverity];

    const Icon = worstSeverity === 'red' ? AlertCircle : AlertTriangle;

    return (
        // Border uses inset box-shadow to avoid `severityColor + '40'` string concat,
        // which produces invalid CSS when severityColor is a CSS var (not a hex string).
        <div
            className="rounded-xl overflow-hidden"
            style={{
                background: severityBg,
                boxShadow: `inset 0 0 0 1.5px ${severityColor}`,
            }}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 font-bold text-left"
            >
                <Icon size={18} style={{ color: severityColor, flexShrink: 0 }} />
                <span className="flex-1 text-sm" style={{ color: 'var(--gp-text)' }}>
                    {alerts.length} nutrient{alerts.length > 1 ? 's' : ''} need{alerts.length === 1 ? 's' : ''} attention
                </span>
                {open
                    ? <ChevronUp  size={16} style={{ color: 'var(--gp-muted)', flexShrink: 0 }} />
                    : <ChevronDown size={16} style={{ color: 'var(--gp-muted)', flexShrink: 0 }} />
                }
            </button>

            {/* Expandable content */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="alerts"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 px-4 pb-4">
                            {alerts.map((a) => {
                                const c = {
                                    yellow: 'var(--gp-yellow)',
                                    orange: 'var(--gp-orange)',
                                    red:    'var(--gp-red)',
                                }[a.severity as 'yellow' | 'orange' | 'red'];

                                return (
                                    <div key={a.nutrient} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                                            <span className="text-sm font-black" style={{ color: 'var(--gp-text)' }}>
                                                {a.label}
                                            </span>

                                            {/* Goal status badge */}
                                            {a.exceeded ? (
                                                <span
                                                    className="ml-auto text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0"
                                                    style={{
                                                        background: a.severity === 'green'
                                                            ? 'var(--gp-green-soft)'
                                                            : 'var(--gp-red-soft)',
                                                        color: a.severity === 'green'
                                                            ? 'var(--gp-green)'
                                                            : c,
                                                        boxShadow: `inset 0 0 0 1px ${c}`,
                                                    }}
                                                >
                                                    {a.severity === 'green'
                                                        ? <><CheckCircle2 size={11} /> Goal reached</>
                                                        : <><AlertCircle  size={11} /> Over goal &bull; {a.pct}%</>
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold ml-auto flex-shrink-0" style={{ color: c }}>
                                                    {a.pct}% of goal
                                                </span>
                                            )}
                                        </div>

                                        {a.suggestion && (
                                            <p className="text-xs font-bold pl-4" style={{ color: 'var(--gp-muted)' }}>
                                                {a.exceeded ? '⚠️' : '💡'} {a.suggestion}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}