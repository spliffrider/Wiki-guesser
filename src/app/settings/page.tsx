// Wiki Guesser - Settings Page

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AVATARS, getAvatarById } from '@/lib/avatars';
import { Header } from '@/components/layout/Header';
import styles from './page.module.css';

export default function SettingsPage() {
    const router = useRouter();
    const { user, profile, isLoading, updateProfile, updateEmail } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Initialize form with current values
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setSelectedAvatar(profile.avatar_url);
        }
        if (user) {
            setEmail(user.email || '');
        }
    }, [profile, user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            // Update profile (username and avatar)
            const profileUpdates: { username?: string; avatar_url?: string | null } = {};

            if (username !== (profile?.username || '')) {
                profileUpdates.username = username;
            }
            if (selectedAvatar !== profile?.avatar_url) {
                profileUpdates.avatar_url = selectedAvatar;
            }

            if (Object.keys(profileUpdates).length > 0) {
                const { error } = await updateProfile(profileUpdates);
                if (error) {
                    setMessage({ type: 'error', text: error.message });
                    setSaving(false);
                    return;
                }
            }

            // Update email if changed
            if (email !== user.email && email.trim()) {
                const { error } = await updateEmail(email);
                if (error) {
                    setMessage({ type: 'error', text: error.message });
                    setSaving(false);
                    return;
                }
                setMessage({
                    type: 'success',
                    text: 'Settings saved! Check your email to confirm the address change.'
                });
            } else {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    const currentAvatar = getAvatarById(selectedAvatar);

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Account Settings</h1>
                    <p className={styles.subtitle}>Manage your profile and preferences</p>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Avatar</h2>
                    <div className={styles.avatarSection}>
                        <div className={styles.currentAvatar}>
                            {currentAvatar ? (
                                <span className={styles.avatarEmoji}>{currentAvatar.emoji}</span>
                            ) : (
                                <span className={styles.avatarInitial}>
                                    {username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <div className={styles.avatarGrid}>
                            {AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    className={`${styles.avatarOption} ${selectedAvatar === avatar.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    title={avatar.label}
                                    type="button"
                                >
                                    {avatar.emoji}
                                </button>
                            ))}
                            <button
                                className={`${styles.avatarOption} ${selectedAvatar === null ? styles.selected : ''}`}
                                onClick={() => setSelectedAvatar(null)}
                                title="Use initial"
                                type="button"
                            >
                                <span className={styles.initialOption}>
                                    {username?.[0]?.toUpperCase() || '?'}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Profile</h2>
                    <div className={styles.field}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            placeholder="Enter your username"
                        />
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Email</h2>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="Enter your email"
                        />
                        <p className={styles.hint}>
                            Changing your email will require confirmation via the new address.
                        </p>
                    </div>
                </section>

                <div className={styles.actions}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={styles.saveButton}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link href="/profile" className={styles.cancelButton}>
                        Back to Profile
                    </Link>
                </div>
            </main>
        </div>
    );
}
