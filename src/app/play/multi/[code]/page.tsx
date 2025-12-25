// Wiki Guesser - Multiplayer Room Page

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { Header } from '@/components/layout/Header';
import { redactExcerpt } from '@/lib/wikipedia';
import { getAvatarEmoji } from '@/lib/avatars';
import styles from './page.module.css';

export default function MultiplayerRoomPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const { user, profile, isLoading: authLoading } = useAuth();

    const {
        room,
        players,
        currentQuestion,
        phase,
        timeRemaining,
        hasAnswered,
        lastAnswer,
        error,
        isHost,
        myPlayer,
        setReady,
        startGame,
        answer,
        advanceRound,
        leave,
    } = useMultiplayerGame({
        roomCode: code,
        userId: user?.id || '',
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/play/multi');
        }
    }, [authLoading, user, router]);

    const handleLeave = async () => {
        await leave();
        router.push('/play/multi');
    };

    const handleStartGame = async () => {
        const result = await startGame();
        if (result.error) {
            alert(result.error);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        // Visual feedback is handled by CSS active state or could add a toast here
    };

    const allReady = players.length >= 2 && players.every(p => p.is_ready);

    if (authLoading || !user) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.errorPage}>
                    <h1>😢 Error</h1>
                    <p>{error}</p>
                    <button onClick={() => router.push('/play/multi')} className={styles.backBtn}>
                        Back to Lobby
                    </button>
                </div>
            </div>
        );
    }

    // LOBBY PHASE
    if (phase === 'lobby') {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.roomHeader}>
                        <h1>Room:</h1>
                        <div className={styles.roomCodeWrapper}>
                            <span className={styles.roomCode}>{code}</span>
                            <button onClick={handleCopyCode} className={styles.copyBtn} title="Copy Code">
                                📋
                            </button>
                        </div>
                        <p>Share this code with friends to join!</p>
                    </div>

                    <div className={styles.playersList}>
                        <h2>Players ({players.length}/{room?.max_players || 8})</h2>
                        {players.map(player => (
                            <div key={player.id} className={styles.playerCard}>
                                <span className={styles.playerName}>
                                    <span style={{ marginRight: '8px', fontSize: '1.2em' }}>
                                        {getAvatarEmoji(players.find(p => p.id === player.id)?.user_id === user.id ? (profile?.avatar_url ?? null) : null) || '👤'}
                                    </span>
                                    {player.is_host && '👑 '}
                                    {player.username}
                                    {player.user_id === user.id && ' (You)'}
                                </span>
                                <span className={`${styles.readyStatus} ${player.is_ready ? styles.ready : ''}`}>
                                    {player.is_ready ? '✓ Ready' : 'Not Ready'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.lobbyActions}>
                        {!myPlayer?.is_ready ? (
                            <button onClick={() => setReady(true)} className={styles.readyBtn}>
                                ✓ Ready Up
                            </button>
                        ) : (
                            <button onClick={() => setReady(false)} className={styles.unreadyBtn}>
                                Cancel Ready
                            </button>
                        )}

                        {isHost && (
                            <button
                                onClick={handleStartGame}
                                disabled={!allReady}
                                className={styles.startBtn}
                            >
                                {allReady ? '🚀 Start Game' : 'Waiting for players...'}
                            </button>
                        )}

                        <button onClick={handleLeave} className={styles.leaveBtn}>
                            Leave Room
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // COUNTDOWN PHASE
    if (phase === 'countdown') {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.countdown}>
                    <h1>Round {room?.current_round}</h1>
                    <div key={timeRemaining} className={styles.countdownNumber}>
                        {Math.ceil(timeRemaining / 1000) || 3}
                    </div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginTop: '1rem' }}>Get ready...</p>
                </main>
            </div>
        );
    }

    // PLAYING PHASE
    if (phase === 'playing' && currentQuestion) {
        const redactedText = currentQuestion.topic_excerpt
            ? redactExcerpt(currentQuestion.topic_excerpt, currentQuestion.correct_answer)
            : '';

        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.gameMain}>
                    <div className={styles.gameHeader}>
                        <span>Round {room?.current_round}/{room?.total_rounds}</span>
                        <span className={styles.timer}>
                            {Math.ceil(timeRemaining / 1000)}s
                        </span>
                    </div>

                    <div className={styles.questionCard}>
                        <p className={styles.excerpt}>{redactedText}</p>
                    </div>

                    {hasAnswered ? (
                        <div className={`${styles.answered} ${lastAnswer?.isCorrect ? styles.correct : styles.incorrect}`}>
                            <h2>{lastAnswer?.isCorrect ? '✓ Correct!' : '✗ Wrong!'}</h2>
                            <p>+{lastAnswer?.points || 0} points</p>
                            <p className={styles.waitingText}>Waiting for other players...</p>
                        </div>
                    ) : (
                        <div className={styles.options}>
                            {currentQuestion.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => answer(option)}
                                    className={styles.optionBtn}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.liveScores}>
                        <h3>Scores</h3>
                        {players.slice(0, 5).map((p, i) => (
                            <div key={p.id} className={styles.scoreRow}>
                                <span>{i + 1}. {p.username}</span>
                                <span>{p.score}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // RESULTS PHASE
    if (phase === 'results' && currentQuestion) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.resultsCard}>
                        <h1>Round {room?.current_round} Results</h1>
                        <div className={styles.correctAnswer}>
                            <span>The answer was:</span>
                            <h2>{currentQuestion.correct_answer}</h2>
                        </div>

                        <div className={styles.roundScores}>
                            {players.map((p, i) => (
                                <div key={p.id} className={styles.scoreRow}>
                                    <span className={styles.rank}>#{i + 1}</span>
                                    <span className={styles.name}>{p.username}</span>
                                    <span className={styles.score}>{p.score}</span>
                                </div>
                            ))}
                        </div>

                        {isHost && (
                            <button onClick={advanceRound} className={styles.nextBtn}>
                                {room?.current_round === room?.total_rounds
                                    ? 'See Final Results'
                                    : 'Next Round →'}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // FINISHED PHASE
    if (phase === 'finished') {
        const winner = players[0];

        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.finishedCard}>
                        <h1>🏆 Game Over!</h1>

                        {winner && (
                            <div className={styles.winner}>
                                <span className={styles.crown}>👑</span>
                                <h2>{winner.username}</h2>
                                <p className={styles.winnerScore}>{winner.score} points</p>
                            </div>
                        )}

                        <div className={styles.finalStandings}>
                            <h3>Final Standings</h3>
                            {players.map((p, i) => (
                                <div key={p.id} className={styles.standingRow}>
                                    <span className={styles.medal}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                    </span>
                                    <span className={styles.name}>{p.username}</span>
                                    <span className={styles.score}>{p.score}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.finishedActions}>
                            <button onClick={() => router.push('/play/multi')} className={styles.newGameBtn}>
                                New Game
                            </button>
                            <button onClick={() => router.push('/')} className={styles.homeBtn}>
                                Home
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.loading}>Loading game...</div>
        </div>
    );
}
