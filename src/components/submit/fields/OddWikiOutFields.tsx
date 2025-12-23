// Wiki Guesser - Odd Wiki Out Fields
import styles from '../QuestionForm.module.css';

export function OddWikiOutFields({ data, updateData }: any) {
    return (
        <>
            <div className={styles.formGroup}>
                <label className={styles.label}>4 Items (3 related, 1 impostor)</label>
                <div className={styles.optionsGrid}>
                    {data.items.map((item: string, i: number) => (
                        <div key={i} className={styles.optionInput}>
                            <div className={styles.optionLabel}>
                                <span className={styles.helperText}>Item {i + 1}</span>
                                {data.impostorIndex === i && <span className={styles.correctLabel}>IMPOSTOR</span>}
                            </div>
                            <input
                                className={styles.input}
                                value={item}
                                onChange={(e) => {
                                    const newItems = [...data.items];
                                    newItems[i] = e.target.value;
                                    updateData({ items: newItems });
                                }}
                                placeholder={`Item ${i + 1}`}
                                required
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Who is the Impostor?</label>
                <select
                    className={styles.select}
                    value={data.impostorIndex}
                    onChange={(e) => updateData({ impostorIndex: parseInt(e.target.value) })}
                    required
                >
                    {data.items.map((item: string, i: number) => (
                        <option key={i} value={i}>Item {i + 1}: {item || '(Empty)'}</option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Connection Explanation (Why 3 are related?)</label>
                <textarea
                    className={styles.textarea}
                    value={data.connection}
                    onChange={(e) => updateData({ connection: e.target.value })}
                    placeholder="e.g., These 3 are all from the 19th century, while the impostor is from the 20th."
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Topic</label>
                <input
                    className={styles.input}
                    value={data.topic}
                    onChange={(e) => updateData({ topic: e.target.value })}
                    placeholder="e.g., History, Music, Geography"
                    required
                />
            </div>
        </>
    );
}
