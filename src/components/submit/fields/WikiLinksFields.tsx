// Wiki Guesser - Wiki Links Fields
import styles from '../QuestionForm.module.css';

export function WikiLinksFields({ data, updateData }: any) {
    return (
        <>
            <div className={styles.formGroup}>
                <label className={styles.label}>4 Wikipedia Article Titles</label>
                <div className={styles.optionsGrid}>
                    {data.titles.map((title: string, i: number) => (
                        <input
                            key={i}
                            className={styles.input}
                            value={title}
                            onChange={(e) => {
                                const newTitles = [...data.titles];
                                newTitles[i] = e.target.value;
                                updateData({ titles: newTitles });
                            }}
                            placeholder={`Article ${i + 1}`}
                            required
                        />
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>The Connection</label>
                <input
                    className={styles.input}
                    value={data.connection}
                    onChange={(e) => updateData({ connection: e.target.value })}
                    placeholder="e.g., They are all members of the original Avengers."
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Wrong Connection Options</label>
                <div className={styles.optionsGrid}>
                    {data.connectionOptions.map((opt: string, i: number) => (
                        <input
                            key={i}
                            className={styles.input}
                            value={opt}
                            onChange={(e) => {
                                const newOpts = [...data.connectionOptions];
                                newOpts[i] = e.target.value;
                                updateData({ connectionOptions: newOpts });
                            }}
                            placeholder={`Wrong Connection ${i + 1}`}
                            required
                        />
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Topic</label>
                <input
                    className={styles.input}
                    value={data.topic}
                    onChange={(e) => updateData({ topic: e.target.value })}
                    placeholder="e.g., Marvel Comics, Movies"
                    required
                />
            </div>
        </>
    );
}
