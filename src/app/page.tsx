// Wiki Guesser - Landing Page

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useUGC } from '@/hooks/useUGC';
import styles from './page.module.css';

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Full article excerpts + images + category hints' },
  { value: 'medium', label: 'Medium', description: 'Partial text + images, no categories' },
  { value: 'hard', label: 'Hard', description: 'Image only OR single sentence' },
  { value: 'expert', label: 'Expert', description: 'Heavily redacted text, key words removed' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { spendTokensForCurated, getCuratedGameCost } = useUGC();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [curatedCost, setCuratedCost] = useState(5);
  const [isSpending, setIsSpending] = useState(false);

  // Fetch curated game cost on mount
  useEffect(() => {
    getCuratedGameCost().then(cost => setCuratedCost(cost));
  }, [getCuratedGameCost]);

  const handlePlay = () => {
    router.push(`/play/single?difficulty=${selectedDifficulty}`);
  };

  const handleCuratedPlay = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/');
      return;
    }

    if ((profile?.reward_points || 0) < curatedCost) {
      // Not enough tokens - redirect to creator hub to earn more
      router.push('/submit');
      return;
    }

    setIsSpending(true);
    const result = await spendTokensForCurated();
    setIsSpending(false);

    if (result.success) {
      router.push(`/play/single?difficulty=${selectedDifficulty}&mode=curated`);
    } else {
      // Could show a toast here, but for now just log
      console.error('Failed to spend tokens:', result.error);
    }
  };

  const userBalance = profile?.reward_points || 0;
  const canAffordCurated = userBalance >= curatedCost;

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleWiki}>Wiki</span>
          <span className={styles.titleGuesser}>Guesser</span>
        </h1>
        <p className={styles.subtitle}>
          Can you guess the Wikipedia article from its content?
        </p>
      </div>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Choose Difficulty</h2>

          <div className={styles.difficultyGrid}>
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`${styles.difficultyButton} ${selectedDifficulty === diff.value ? styles.selected : ''}`}
              >
                <span className={styles.difficultyLabel}>{diff.label}</span>
                <span className={styles.difficultyDesc}>{diff.description}</span>
              </button>
            ))}
          </div>

          <div className={styles.playButtons}>
            <button onClick={handlePlay} className={styles.playButton}>
              Play Solo
            </button>
            <button onClick={() => router.push('/play/multi')} className={styles.multiplayerButton}>
              👥 Multiplayer
            </button>
          </div>

          <div className={styles.curatedSection}>
            <button
              onClick={handleCuratedPlay}
              className={`${styles.curatedButton} ${!canAffordCurated && user ? styles.disabled : ''}`}
              disabled={isSpending}
            >
              {isSpending ? (
                'Loading...'
              ) : (
                <>
                  ⭐ Curated Mode
                  <span className={styles.tokenCost}>
                    🪙 {curatedCost}
                  </span>
                </>
              )}
            </button>
            <p className={styles.curatedHint}>
              {!user ? (
                'Log in to play curated community questions'
              ) : !canAffordCurated ? (
                <>You need {curatedCost - userBalance} more tokens. <a href="/submit">Earn tokens →</a></>
              ) : (
                'Play hand-picked questions from our community'
              )}
            </p>
          </div>
        </div>

        <div className={styles.howToPlay}>
          <h3 className={styles.howToPlayTitle}>How to Play</h3>
          <ol className={styles.howToPlayList}>
            <li>You&apos;ll see content from a Wikipedia article (images, text, or both)</li>
            <li>Type your guess for what the article is about</li>
            <li>Earn points for correct answers - faster = more points!</li>
            <li>Build streaks for bonus multipliers 🔥</li>
          </ol>
        </div>

        <div className={styles.creatorHub}>
          <h3 className={styles.creatorHubTitle}>⭐ Creator Hub</h3>
          <p className={styles.creatorHubDescription}>
            Got a great quiz question idea? Submit your own questions and earn reward points when players answer them!
          </p>
          <a href="/submit" className={styles.creatorHubLink}>
            Open Creator Hub →
          </a>
        </div>

        <div className={styles.anonymousContribute}>
          <h3 className={styles.anonymousTitle}>📝 Contribute Anonymously</h3>
          <p className={styles.anonymousDescription}>
            Want to help without an account? Submit questions anonymously - no login required!
          </p>
          <a href="/submit-anonymous" className={styles.anonymousLink}>
            Submit a Question →
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://donate.wikimedia.org/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.donateButton}
        >
          ❤️ Donate to Wikipedia
        </a>
        <p>Powered by Wikipedia • Built with ❤️</p>
      </footer>
    </div>
  );
}

