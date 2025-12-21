// Wiki Guesser - Main Game Board Component

'use client';

import { useState, useEffect } from 'react';
import { WikiTopic, Difficulty, DIFFICULTY_CONFIG, QuestionCategory, CategoryData } from '@/types';
import { redactExcerpt } from '@/lib/wikipedia';
import { useSound } from '@/hooks/useSound';
import { Timer } from './Timer';
import { MultipleChoice } from './MultipleChoice';
import { ScoreDisplay } from './ScoreDisplay';
import { RoundResult } from './RoundResult';
import { CategoryPrompt } from './CategoryPrompt';
import styles from './GameBoard.module.css';

interface GameBoardProps {
    topic: WikiTopic | null;
    options: string[];  // Multiple choice options
    difficulty: Difficulty;
    phase: 'playing' | 'between-rounds' | 'finished';
    currentRound: number;
    totalRounds: number;
    score: number;
    streak: number;
    timeRemaining: number;
    lastRound: {
        isCorrect: boolean;
        guess: string | null;
        pointsEarned: number;
    } | null;
    scoreBreakdown: {
        basePoints: number;
        timeBonus: number;
        streakMultiplier: number;
        difficultyMultiplier: number;
        totalPoints: number;
    } | null;
    onSubmitGuess: (guess: string) => void;
    onNextRound: () => void;
    onPlayAgain: () => void;
    longestStreak: number;
    // New props for category support
    category?: QuestionCategory;
    categoryData?: CategoryData;
    correctAnswer?: string;
}

export function GameBoard({
    topic,
    options,
    difficulty,
    phase,
    currentRound,
    totalRounds,
    score,
    streak,
    timeRemaining,
    lastRound,
    scoreBreakdown,
    onSubmitGuess,
    onNextRound,
    onPlayAgain,
    longestStreak,
    category = 'wiki_what',
    categoryData,
    correctAnswer,
}: GameBoardProps) {
    const config = DIFFICULTY_CONFIG[difficulty];
    const { toggleMute, isMuted } = useSound();
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Sync with stored preference
    useEffect(() => {
        setSoundEnabled(!isMuted());
    }, [isMuted]);

    const handleToggleSound = () => {
        toggleMute();
        setSoundEnabled(!soundEnabled);
    };

    // Determine MultipleChoice variant based on category
    const getChoiceVariant = () => {
        switch (category) {
            case 'wiki_or_fiction':
                return 'true_false';
            case 'when_in_wiki':
                return 'year';
            default:
                return 'standard';
        }
    };

    if (phase === 'finished') {
        const correctCount = longestStreak; // approximation for share text
        const shareText = `🎮 I scored ${score.toLocaleString()} points in Wiki Guesser!\n🔥 ${longestStreak} streak | ${difficulty} difficulty\n\nCan you beat my score? Play at:`;
        const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wikiguesser.com';

        const handleShare = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Wiki Guesser Score',
                        text: shareText,
                        url: shareUrl,
                    });
                } catch (err) {
                    // User cancelled or error
                }
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                alert('Score copied to clipboard!');
            }
        };

        return (
            <div className={styles.finishedContainer}>
                <div className={styles.finishedCard}>
                    <h1 className={styles.finishedTitle}>Game Over!</h1>

                    <div className={styles.finalScore}>
                        <span className={styles.finalScoreLabel}>Final Score</span>
                        <span className={styles.finalScoreValue}>{score.toLocaleString()}</span>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{totalRounds}</span>
                            <span className={styles.statLabel}>Rounds</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{longestStreak}</span>
                            <span className={styles.statLabel}>Best Streak</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{difficulty}</span>
                            <span className={styles.statLabel}>Difficulty</span>
                        </div>
                    </div>

                    <div className={styles.actionButtons}>
                        <button onClick={onPlayAgain} className={styles.playAgainButton}>
                            Play Again
                        </button>
                        <button onClick={handleShare} className={styles.shareButton}>
                            📤 Share Score
                        </button>
                    </div>

                    <div className={styles.dedicationBox}>
                        <p className={styles.dedicationText}>
                            This game was made out of love for Wikipedia, and in dedication to the people
                            that support it and make it better every day. Please support Wikipedia.
                        </p>
                        <a
                            href="https://wikimediafoundation.org/give/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.donateButton}
                        >
                            ❤️ Donate to Wikipedia
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'between-rounds' && lastRound && topic) {
        return (
            <div className={styles.container}>
                <ScoreDisplay
                    score={score}
                    streak={streak}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
                <RoundResult
                    isCorrect={lastRound.isCorrect}
                    topic={topic}
                    guess={lastRound.guess}
                    pointsEarned={lastRound.pointsEarned}
                    scoreBreakdown={scoreBreakdown}
                    onContinue={onNextRound}
                    isLastRound={currentRound + 1 >= totalRounds}
                />
            </div>
        );
    }

    if (!topic) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading topic...</p>
            </div>
        );
    }

    // Determine what content to show based on difficulty
    const showImage = config.showImage && topic.imageUrl;
    const showExcerpt = config.showExcerpt;
    const showCategories = config.showCategories;

    // ALWAYS redact the answer from excerpts to prevent giving away the answer
    // Expert mode shows redaction bars, other modes just remove the words
    const rawExcerpt = topic.excerpt.slice(0, config.excerptLength);
    const displayExcerpt = redactExcerpt(rawExcerpt, topic.title);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ScoreDisplay
                    score={score}
                    streak={streak}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
                <div className={styles.headerControls}>
                    <button
                        onClick={handleToggleSound}
                        className={styles.soundToggle}
                        aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                    >
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                    <div className={styles.timerWrapper}>
                        <Timer
                            timeRemaining={timeRemaining}
                            timeLimit={config.timeLimit}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.topicCard}>
                <div className={styles.difficultyBadge}>
                    {difficulty.toUpperCase()}
                </div>

                <CategoryPrompt
                    category={category}
                    topic={topic}
                    categoryData={categoryData}
                    displayExcerpt={displayExcerpt}
                    showImage={!!showImage}
                    showExcerpt={showExcerpt}
                    showCategories={showCategories}
                />
            </div>

            <div className={styles.inputSection}>
                <MultipleChoice
                    options={options}
                    correctAnswer={correctAnswer || topic.title}
                    onSelect={onSubmitGuess}
                    variant={getChoiceVariant()}
                />
            </div>
        </div>
    );
}

