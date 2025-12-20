// Wiki Guesser - Update Password Page (after clicking reset link)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import styles from '../login/page.module.css';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    useEffect(() => {
        // Check if user has a valid session from the reset link
        const checkSession = async () => {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsValidSession(!!session);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000);
        }

        setIsLoading(false);
    };

    if (!isValidSession) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.logo}>
                            Wiki<span>Guesser</span>
                        </Link>
                        <h1 className={styles.title}>Invalid Link</h1>
                        <p className={styles.subtitle}>
                            This reset link has expired or is invalid.
                        </p>
                    </div>
                    <div className={styles.footer}>
                        <Link href="/auth/reset-password" className={styles.link}>
                            Request a new reset link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        Wiki<span>Guesser</span>
                    </Link>
                    <h1 className={styles.title}>Set New Password</h1>
                    <p className={styles.subtitle}>
                        Enter your new password below
                    </p>
                </div>

                {success ? (
                    <div className={styles.success}>
                        ✅ Password updated! Redirecting...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <div className={styles.field}>
                            <label htmlFor="password" className={styles.label}>New Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
