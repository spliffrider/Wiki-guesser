// Wiki Guesser - Theme Hook

'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Apply theme to document
    const applyTheme = useCallback((newTheme: Theme) => {
        const root = document.documentElement;

        if (newTheme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
            setResolvedTheme('dark');
        } else if (newTheme === 'light') {
            root.classList.add('light');
            root.classList.remove('dark');
            setResolvedTheme('light');
        } else {
            // System preference
            root.classList.remove('light', 'dark');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setResolvedTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Initialize from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem('wiki-guesser-theme') as Theme | null;
        const initialTheme = saved || 'system';
        setTheme(initialTheme);
        applyTheme(initialTheme);

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [applyTheme, theme]);

    const setThemeValue = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('wiki-guesser-theme', newTheme);
        applyTheme(newTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        const next = resolvedTheme === 'dark' ? 'light' : 'dark';
        setThemeValue(next);
    }, [resolvedTheme, setThemeValue]);

    return {
        theme,
        resolvedTheme,
        setTheme: setThemeValue,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
    };
}
