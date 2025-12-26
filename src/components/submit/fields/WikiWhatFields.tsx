// Wiki Guesser - Wiki What Fields
'use client';

import styles from '../QuestionForm.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WikiWhatFields({ data, updateData }: any) {
    const hasPrefilledData = data.title || data.excerpt || data.topic;

    return (
        <>
            {hasPrefilledData && (
                <div className={styles.autoFilledNotice}>
                    ✅ Fields auto-filled from Wikipedia. Review and edit as needed.
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Correct Answer (Article Title)</label>
                <input
                    className={styles.input}
                    value={data.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    placeholder="e.g., Albert Einstein"
                    required
                />
                <span className={styles.helperText}>This will be the text on the correct answer button.</span>
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
