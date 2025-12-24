// Wiki Guesser - Wiki Or Fiction Fields
import styles from '../QuestionForm.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WikiOrFictionFields({ data, updateData }: any) {
    return (
        <>
            <div className={styles.formGroup}>
                <label className={styles.label}>The Statement</label>
                <textarea
                    className={styles.textarea}
                    value={data.statement}
                    onChange={(e) => updateData({ statement: e.target.value })}
                    placeholder="e.g., A shark's skin is roughly the texture of sandpaper."
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Is it True?</label>
                <select
                    className={styles.select}
                    value={data.isTrue ? "true" : "false"}
                    onChange={(e) => updateData({ isTrue: e.target.value === "true" })}
                    required
                >
                    <option value="true">True (Wikipedia Fact)</option>
                    <option value="false">False (Fiction)</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Explanation</label>
                <textarea
                    className={styles.textarea}
                    value={data.explanation}
                    onChange={(e) => updateData({ explanation: e.target.value })}
                    placeholder="Provide a brief explanation of why it is true or false..."
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Topic</label>
                <input
                    className={styles.input}
                    value={data.topic}
                    onChange={(e) => updateData({ topic: e.target.value })}
                    placeholder="e.g., Animals, Nature, Biology"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Source (Wikipedia URL)</label>
                <input
                    className={styles.input}
                    value={data.source}
                    onChange={(e) => updateData({ source: e.target.value })}
                    placeholder="https://en.wikipedia.org/wiki/..."
                />
            </div>
        </>
    );
}
