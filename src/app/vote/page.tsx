// Wiki Guesser - Community Voting Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUGC } from '@/hooks/useUGC';
import { CurationCandidateView } from '@/types/ugc';
import { QuestionCard } from '@/components/submit/QuestionCard';
import styles from './page.module.css';

export default function VotingPage() {
    const { getQuestionsForVoting, isLoading } = useUGC();
    const [questions, setQuestions] = useState<CurationCandidateView[]>([]);

    useEffect(() => {
        getQuestionsForVoting().then(setQuestions);
    }, [getQuestionsForVoting]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Community Review</h1>
                <p className={styles.subtitle}>
                    Vote on submissions to help us curate the best questions for the game!
                    Approved questions need a positive score to make it into the official game.
                </p>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{questions.length}</span>
                        <span className={styles.statLabel}>Questions to Review</span>
                    </div>
                </div>
            </header>

            <main className={styles.feed}>
                {isLoading ? (
                    <div className={styles.loading}>Loading candidates...</div>
                ) : questions.length > 0 ? (
                    questions.map((q) => (
                        <QuestionCard key={q.id} question={q} />
                    ))
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>✨</div>
                        <h3>All caught up!</h3>
                        <p>There are no more questions waiting for community review.</p>
                        <Link href="/submit" className={styles.submitLink}>
                            Submit Your Own
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
