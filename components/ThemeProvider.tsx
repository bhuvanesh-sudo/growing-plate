'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: () => {},
    toggleTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

const STORAGE_KEY = 'gp-theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    // Remove the transition class after the transition ends to avoid
    // slowing down other interactions.
    setTimeout(() => root.classList.remove('theme-transition'), 300);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Read stored preference on mount
    useEffect(() => {
        const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
        setThemeState(stored);
        const resolved = stored === 'system' ? getSystemTheme() : stored;
        setResolvedTheme(resolved);
        applyTheme(resolved);
        setMounted(true);
    }, []);

    // Listen for system changes when theme === 'system'
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const resolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(resolved);
            applyTheme(resolved);
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next);
        setThemeState(next);
        const resolved = next === 'system' ? getSystemTheme() : next;
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    // Prevent flash: render nothing until we've read localStorage
    if (!mounted) return null;

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
