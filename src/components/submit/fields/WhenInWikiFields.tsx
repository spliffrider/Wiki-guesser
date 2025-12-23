// Wiki Guesser - When In Wiki Fields
import styles from '../QuestionForm.module.css';

export function WhenInWikiFields({ data, updateData }: any) {
    return (
        <>
            <div className={styles.formGroup}>
                <label className={styles.label}>The Event</label>
                <textarea
                    className={styles.textarea}
                    value={data.event}
                    onChange={(e) => updateData({ event: e.target.value })}
                    placeholder="Describe a notable historical event..."
                    required
                />
            </div>

            <div className={styles.fieldGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Correct Year</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={data.correctYear}
                        onChange={(e) => updateData({ correctYear: parseInt(e.target.value) })}
                        placeholder="e.g., 1776"
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Topic</label>
                    <input
                        className={styles.input}
                        value={data.topic}
                        onChange={(e) => updateData({ topic: e.target.value })}
                        placeholder="e.g., US History, Space Race"
                        required
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Random Year Options (Optional)</label>
                <div className={styles.optionsGrid}>
                    {[0, 1, 2, 3].map((i) => (
                        <input
                            key={i}
                            type="number"
                            className={styles.input}
                            value={data.yearOptions[i] || ''}
                            onChange={(e) => {
                                const newYears = [...data.yearOptions];
                                newYears[i] = parseInt(e.target.value);
                                updateData({ yearOptions: newYears });
                            }}
                            placeholder={`Year ${i + 1}`}
                        />
                    ))}
                </div>
                <span className={styles.helperText}>If left at 0, the game will generate random years near the correct one.</span>
            </div>
        </>
    );
}
