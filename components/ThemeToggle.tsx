'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
    /** 'icon' = just the icon button (navbar usage), 'pill' = labeled pill */
    variant?: 'icon' | 'pill';
    className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    if (variant === 'pill') {
        return (
            <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-80 ${className}`}
                style={{
                    background: 'var(--gp-border)',
                    color: 'var(--gp-text)',
                }}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'moon' : 'sun'}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex' }}
                    >
                        {isDark ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
                    </motion.span>
                </AnimatePresence>
                {isDark ? 'Dark' : 'Light'}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:scale-95 ${className}`}
            style={{
                background: 'var(--gp-border)',
                color: 'var(--gp-muted)',
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex' }}
                >
                    {isDark ? <Moon size={17} strokeWidth={2} /> : <Sun size={17} strokeWidth={2} />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}
