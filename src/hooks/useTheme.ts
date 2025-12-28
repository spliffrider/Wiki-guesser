// Wiki Guesser - Theme Hook with Multiple Dark Theme Support

'use client';

import { useState, useEffect, useCallback } from 'react';

export type DarkTheme = 'dark-forest' | 'dark-navy' | 'dark-charcoal' | 'dark-library';
export type Theme = 'light' | DarkTheme | 'system';

const DARK_THEMES: DarkTheme[] = ['dark-library', 'dark-forest', 'dark-navy', 'dark-charcoal'];
const ALL_THEME_CLASSES = ['light', 'dark', ...DARK_THEMES];

export const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark-library', label: 'Library', icon: '📚' },
    { value: 'dark-charcoal', label: 'Charcoal', icon: '🌑' },
    { value: 'dark-navy', label: 'Navy', icon: '🌊' },
    { value: 'dark-forest', label: 'Forest', icon: '🌲' },
    { value: 'system', label: 'System', icon: '💻' },
];

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('system');
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Apply theme to document
    const applyTheme = useCallback((newTheme: Theme) => {
        const root = document.documentElement;

        // Remove all theme classes
        ALL_THEME_CLASSES.forEach(cls => root.classList.remove(cls));

        if (newTheme === 'light') {
            root.classList.add('light');
            setIsDark(false);
        } else if (DARK_THEMES.includes(newTheme as DarkTheme)) {
            root.classList.add(newTheme);
            setIsDark(true);
        } else {
            // System preference - default to charcoal for dark
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                // Don't add a class, let CSS media query handle it
                setIsDark(true);
            } else {
                root.classList.add('light');
                setIsDark(false);
            }
        }
    }, []);

    // Initialize from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem('wiki-guesser-theme') as Theme | null;
        const initialTheme = saved || 'system';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, [applyTheme]); // Removed 'theme' from dependencies - only run once on mount

    // Listen for system preference changes (separate effect)
    useEffect(() => {
        if (typeof window === 'undefined' || !mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            // Only update if using system theme
            const currentTheme = localStorage.getItem('wiki-guesser-theme') as Theme | null;
            if (currentTheme === 'system' || !currentTheme) {
                setIsDark(mediaQuery.matches);
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mounted, applyTheme]);

    const setThemeValue = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('wiki-guesser-theme', newTheme);
        applyTheme(newTheme);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        // Simple toggle between light and current dark theme (or charcoal as default)
        if (isDark) {
            setThemeValue('light');
        } else {
            // If coming from light, use the last dark theme or default to library
            const lastDark = localStorage.getItem('wiki-guesser-last-dark') as DarkTheme | null;
            setThemeValue(lastDark || 'dark-library');
        }
    }, [isDark, setThemeValue]);

    const setDarkTheme = useCallback((darkTheme: DarkTheme) => {
        localStorage.setItem('wiki-guesser-last-dark', darkTheme);
        setThemeValue(darkTheme);
    }, [setThemeValue]);

    return {
        theme,
        setTheme: setThemeValue,
        setDarkTheme,
        toggleTheme,
        isDark,
        mounted,
        darkThemes: DARK_THEMES,
        themeOptions: THEME_OPTIONS,
    };
}
