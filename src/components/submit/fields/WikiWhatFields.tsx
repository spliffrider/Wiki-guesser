// Wiki Guesser - Wiki What Fields
'use client';

import { useState } from 'react';
import { fetchWikipediaArticle, isValidWikipediaUrl } from '@/lib/wikipediaApi';
import styles from '../QuestionForm.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WikiWhatFields({ data, updateData }: any) {
    const [wikiUrl, setWikiUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const handleFetchWikipedia = async () => {
        if (!wikiUrl.trim()) return;

        setIsFetching(true);
        setFetchError(null);

        try {
            const article = await fetchWikipediaArticle(wikiUrl);
            if (article) {
                updateData({
                    title: article.title,
                    excerpt: article.extract.length > 300
                        ? article.extract.substring(0, 297) + '...'
                        : article.extract,
                    imageUrl: article.thumbnail || '',
                    topic: article.description || ''
                });
                setHasFetched(true);
            }
        } catch (error) {
            setFetchError(error instanceof Error ? error.message : 'Failed to fetch article');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSkip = () => {
        setHasFetched(true);
    };

    // Step 1: Wikipedia URL input
    if (!hasFetched) {
        return (
            <div className={styles.urlStep}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>🔗 Start with a Wikipedia URL (Optional)</label>
                    <p className={styles.helperText} style={{ marginBottom: '0.75rem' }}>
                        Paste a Wikipedia article URL to auto-fill the form, or skip to fill manually.
                    </p>
                    <input
                        className={styles.input}
                        value={wikiUrl}
                        onChange={(e) => setWikiUrl(e.target.value)}
                        placeholder="https://en.wikipedia.org/wiki/Albert_Einstein"
                    />
                    {fetchError && <div className={styles.error}>{fetchError}</div>}
                </div>
                <div className={styles.urlActions}>
                    <button
                        type="button"
                        className={styles.fetchButton}
                        onClick={handleFetchWikipedia}
                        disabled={isFetching || !isValidWikipediaUrl(wikiUrl)}
                    >
                        {isFetching ? 'Fetching...' : '✨ Fetch Article Data'}
                    </button>
                    <button
                        type="button"
                        className={styles.skipButton}
                        onClick={handleSkip}
                    >
                        Skip → Fill Manually
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: Form fields
    return (
        <>
            {data.title && (
                <div className={styles.autoFilledNotice}>
                    ✅ Fields auto-filled from Wikipedia. Review and edit as needed.
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Article Title (The Answer)</label>
                <input
                    className={styles.input}
                    value={data.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    placeholder="e.g., Albert Einstein"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Excerpt (The Clue)</label>
                <textarea
                    className={styles.textarea}
                    value={data.excerpt}
                    onChange={(e) => updateData({ excerpt: e.target.value })}
                    placeholder="Provide a mysterious clue about the topic without revealing the name..."
                    required
                />
                <span className={styles.helperText}>Avoid using the title in the clue.</span>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Topic</label>
                <input
                    className={styles.input}
                    value={data.topic}
                    onChange={(e) => updateData({ topic: e.target.value })}
                    placeholder="e.g., Physics, History, Science"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Wrong Options</label>
                <div className={styles.optionsGrid}>
                    {data.wrongOptions.map((opt: string, i: number) => (
                        <input
                            key={i}
                            className={styles.input}
                            value={opt}
                            onChange={(e) => {
                                const newOpts = [...data.wrongOptions];
                                newOpts[i] = e.target.value;
                                updateData({ wrongOptions: newOpts });
                            }}
                            placeholder={`Wrong Option ${i + 1}`}
                            required
                        />
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Image URL (Optional)</label>
                <input
                    className={styles.input}
                    value={data.imageUrl}
                    onChange={(e) => updateData({ imageUrl: e.target.value })}
                    placeholder="https://..."
                />
                {data.imageUrl && (
                    <div className={styles.imagePreview}>
                        <img src={data.imageUrl} alt="Preview" />
                    </div>
                )}
            </div>
        </>
    );
}
