// Wiki Guesser - Anonymous Question Submission Page
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuestionCategory } from '@/types';
import { useUGC } from '@/hooks/useUGC';
import { QuestionForm } from '@/components/submit/QuestionForm';
import { WikiWhatFields } from '@/components/submit/fields/WikiWhatFields';
import { WikiOrFictionFields } from '@/components/submit/fields/WikiOrFictionFields';
import { OddWikiOutFields } from '@/components/submit/fields/OddWikiOutFields';
import { WhenInWikiFields } from '@/components/submit/fields/WhenInWikiFields';
import { WikiLinksFields } from '@/components/submit/fields/WikiLinksFields';
import styles from './page.module.css';

const CATEGORY_OPTIONS: Array<{ value: QuestionCategory; label: string; icon: string }> = [
    { value: 'wiki_what', label: 'Wiki What?', icon: '📝' },
    { value: 'wiki_or_fiction', label: 'Wiki or Fiction?', icon: '⚖️' },
    { value: 'odd_wiki_out', label: 'Odd Wiki Out', icon: '🔍' },
    { value: 'when_in_wiki', label: 'When in Wiki?', icon: '📅' },
    { value: 'wiki_links', label: 'Wiki Links', icon: '🔗' }
];

export default function AnonymousSubmitPage() {
    const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { submitAnonymousQuestion, isLoading } = useUGC();

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✅</div>
                    <h1 className={styles.successTitle}>Question Submitted!</h1>
                    <p className={styles.successText}>
                        Thanks for your contribution! Your question will be reviewed by our team.
                        If approved, it will appear in the game for players to enjoy.
                    </p>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={() => { setSubmitted(false); setSelectedCategory(null); }}
                            className={styles.primaryBtn}
                        >
                            Submit Another Question
                        </button>
                        <Link href="/" className={styles.secondaryBtn}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Contribute a Question</h1>
                    <p className={styles.subtitle}>
                        Help grow the Wiki Guesser question database! Submit a question anonymously.
                        No account required.
                    </p>
                </header>

                <div className={styles.categoryGrid}>
                    {CATEGORY_OPTIONS.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={styles.categoryCard}
                        >
                            <span className={styles.categoryIcon}>{cat.icon}</span>
                            <span className={styles.categoryLabel}>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.footer}>
                    <Link href="/" className={styles.backLink}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const catInfo = CATEGORY_OPTIONS.find(c => c.value === selectedCategory)!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFields = (props: any) => {
        switch (selectedCategory) {
            case 'wiki_what': return <WikiWhatFields {...props} />;
            case 'wiki_or_fiction': return <WikiOrFictionFields {...props} />;
            case 'odd_wiki_out': return <OddWikiOutFields {...props} />;
            case 'when_in_wiki': return <WhenInWikiFields {...props} />;
            case 'wiki_links': return <WikiLinksFields {...props} />;
            default: return null;
        }
    };

    const getInitialData = () => {
        switch (selectedCategory) {
            case 'wiki_what':
                return {
                    title: '',
                    excerpt: '',
                    imageUrl: '',
                    wrongOptions: ['', '', ''],
                    topic: ''
                };
            case 'wiki_or_fiction':
                return {
                    statement: '',
                    isTrue: true,
                    explanation: '',
                    topic: '',
                    source: ''
                };
            case 'odd_wiki_out':
                return {
                    items: ['', '', '', ''],
                    impostorIndex: 0,
                    connection: '',
                    topic: ''
                };
            case 'when_in_wiki':
                return {
                    event: '',
                    correctYear: new Date().getFullYear(),
                    yearOptions: [0, 0, 0, 0],
                    topic: ''
                };
            case 'wiki_links':
                return {
                    titles: ['', '', '', ''],
                    connection: '',
                    connectionOptions: ['', '', '', ''],
                    topic: ''
                };
            default: return {};
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validate = (data: any) => {
        switch (selectedCategory) {
            case 'wiki_what':
                return !!(data.title && data.excerpt && data.topic && data.wrongOptions.every((o: string) => !!o));
            case 'wiki_or_fiction':
                return !!(data.statement && data.explanation && data.topic);
            case 'odd_wiki_out':
                return !!(data.connection && data.topic && data.items.every((i: string) => !!i));
            case 'when_in_wiki':
                return !!(data.event && data.correctYear && data.topic);
            case 'wiki_links':
                return !!(data.connection && data.topic && data.titles.every((t: string) => !!t));
            default:
                return false;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (data: any) => {
        const result = await submitAnonymousQuestion({
            category: selectedCategory,
            questionData: data
        });

        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            setSubmitted(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={styles.backButton}
                >
                    ← Change Category
                </button>

                <QuestionForm
                    category={selectedCategory}
                    title={catInfo.label}
                    icon={catInfo.icon}
                    initialData={getInitialData()}
                    validate={validate}
                    onSubmitOverride={handleSubmit}
                    isAnonymous={true}
                >
                    {renderFields}
                </QuestionForm>
            </div>
        </div>
    );
}
