// Wiki Guesser - Header Component

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, THEME_OPTIONS, Theme } from '@/hooks/useTheme';
import { getAvatarEmoji } from '@/lib/avatars';
import { RewardStar } from './RewardStar';
import styles from './Header.module.css';

export function Header() {
    const { user, profile, signOut, isLoading } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const { theme, setTheme, isDark, mounted } = useTheme();

    const handleSignOut = async () => {
        await signOut();
        setShowDropdown(false);
    };

    const handleThemeSelect = (newTheme: Theme) => {
        setTheme(newTheme);
        setShowThemeDropdown(false);
    };

    // Get current theme icon
    const currentThemeOption = THEME_OPTIONS.find(opt => opt.value === theme) || THEME_OPTIONS[0];

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Wiki<span>Guesser</span>
                </Link>

                <nav className={styles.nav}>
                    {user && <RewardStar />}

                    {/* Theme selector */}
                    <div className={styles.themeSelector}>
                        <button
                            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                            className={styles.themeToggle}
                            aria-label="Select theme"
                        >
                            {mounted ? (isDark ? '🌙' : '☀️') : '🌙'}
                        </button>

                        {showThemeDropdown && (
                            <div className={styles.themeDropdown}>
                                {THEME_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`${styles.themeOption} ${theme === option.value ? styles.active : ''}`}
                                        onClick={() => handleThemeSelect(option.value)}
                                    >
                                        <span className={styles.themeOptionIcon}>{option.icon}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : user ? (
                        <div className={styles.userMenu}>
                            <button
                                className={styles.userButton}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <span className={styles.avatarWrapper}>
                                    <span className={styles.avatar}>
                                        {getAvatarEmoji(profile?.avatar_url ?? null) || profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                                    </span>
                                    <span className={styles.loggedInIndicator}></span>
                                </span>
                                <span className={styles.username}>
                                    {profile?.username || 'User'}
                                </span>
                            </button>

                            {showDropdown && (
                                <div className={styles.dropdown}>
                                    <Link
                                        href="/profile"
                                        className={styles.dropdownItem}
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        👤 Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className={styles.dropdownItem}
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        ⚙️ Settings
                                    </Link>
                                    <Link
                                        href="/leaderboard"
                                        className={styles.dropdownItem}
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        🏆 Leaderboard
                                    </Link>
                                    <div className={styles.dropdownStats}>
                                        <span>🏆 {profile?.total_score?.toLocaleString() || 0}</span>
                                        <span>🎮 {profile?.games_played || 0} games</span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className={styles.signOutButton}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link href="/auth/login" className={styles.loginButton}>
                                Log In
                            </Link>
                            <Link href="/auth/signup" className={styles.signupButton}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
