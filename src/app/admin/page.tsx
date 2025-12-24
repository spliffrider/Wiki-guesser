// Wiki Guesser - Admin Moderation Dashboard
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUGC } from '@/hooks/useUGC';
import { PendingQuestionView } from '@/types/ugc';
import styles from './page.module.css';

export default function AdminPage() {
    const { user, profile, isLoading: authLoading } = useAuth();
    const { getQuestionsForModeration, reviewQuestion, isLoading: ugcLoading } = useUGC();
    const [questions, setQuestions] = useState<PendingQuestionView[]>([]);
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && (!user || profile?.is_admin !== true)) {
            // router.push('/'); // Uncomment to redirect non-admins
        }
    }, [user, profile, authLoading, router]);

    useEffect(() => {
        if (profile?.is_admin) {
            getQuestionsForModeration().then(setQuestions);
        }
    }, [profile, getQuestionsForModeration]);

    const handleReview = async (questionId: string, action: 'approve' | 'reject', notes?: string) => {
        setReviewingId(questionId);
        const result = await reviewQuestion({ questionId, action, notes });

        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            // Remove from local list
            setQuestions(prev => prev.filter(q => q.id !== questionId));
        }
        setReviewingId(null);
    };

    if (authLoading) return <div className={styles.loading}>Checking permissions...</div>;

    if (!profile?.is_admin) {
        return (
            <div className={styles.container}>
                <div className={styles.denied}>
                    <h1>Access Denied</h1>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Moderation Dashboard</h1>
                <p className={styles.subtitle}>Review user submissions</p>
                <div className={styles.stats}>
                    <span>Pending: {questions.length}</span>
                </div>
            </header>

            <main className={styles.feed}>
                {ugcLoading && questions.length === 0 ? (
                    <div className={styles.loading}>Loading submissions...</div>
                ) : questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q.id} className={styles.adminCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.badge}>{q.category}</span>
                                <span className={styles.meta}>by {q.submitter_username} at {new Date(q.submitted_at).toLocaleString()}</span>
                            </div>

                            <div className={styles.cardContent}>
                                <pre className={styles.jsonDump}>
                                    {JSON.stringify(q.question_data, null, 2)}
                                </pre>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    onClick={() => handleReview(q.id, 'approve')}
                                    disabled={reviewingId === q.id}
                                    className={`${styles.btn} ${styles.approve}`}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReview(q.id, 'reject')}
                                    disabled={reviewingId === q.id}
                                    className={`${styles.btn} ${styles.reject}`}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <h3>No pending submissions</h3>
                        <p>Good job! The queue is empty.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
