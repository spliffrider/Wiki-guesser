// Wiki Guesser - Multiplayer Lobby Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { createRoom, joinRoom } from '@/lib/multiplayer';
import styles from './page.module.css';

export default function MultiplayerLobbyPage() {
    const router = useRouter();
    const { user, profile, isLoading: authLoading } = useAuth();

    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!user || !profile) return;

        setIsCreating(true);
        setError(null);

        const { room, error: createError } = await createRoom(
            user.id,
            profile.username || 'Player'
        );

        if (createError) {
            setError(createError);
            setIsCreating(false);
            return;
        }

        if (room) {
            router.push(`/play/multi/${room.code}`);
        }
    };

    const handleJoin = async () => {
        if (!user || !profile || !joinCode.trim()) return;

        setIsJoining(true);
        setError(null);

        const { room, error: joinError } = await joinRoom(
            joinCode.trim(),
            user.id,
            profile.username || 'Player'
        );

        if (joinError) {
            setError(joinError);
            setIsJoining(false);
            return;
        }

        if (room) {
            router.push(`/play/multi/${room.code}`);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.authPrompt}>
                        <h1>🎮 Multiplayer Mode</h1>
                        <p>Sign in to play with friends!</p>
                        <div className={styles.authButtons}>
                            <Link href="/auth/login" className={styles.loginBtn}>
                                Log In
                            </Link>
                            <Link href="/auth/signup" className={styles.signupBtn}>
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <h1 className={styles.title}>🎮 Multiplayer</h1>
                <p className={styles.subtitle}>
                    Challenge your friends to a knowledge battle!
                </p>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.options}>
                    <div className={styles.optionCard}>
                        <h2>Create Room</h2>
                        <p>Start a new game and invite friends with a code</p>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className={styles.createBtn}
                        >
                            {isCreating ? 'Creating...' : '✨ Create Room'}
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <div className={styles.optionCard}>
                        <h2>Join Room</h2>
                        <p>Enter a 6-character room code</p>
                        <div className={styles.joinForm}>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className={styles.codeInput}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={isJoining || joinCode.length !== 6}
                                className={styles.joinBtn}
                            >
                                {isJoining ? 'Joining...' : 'Join →'}
                            </button>
                        </div>
                    </div>
                </div>

                <Link href="/" className={styles.backLink}>
                    ← Back to Home
                </Link>
            </main>
        </div>
    );
}
