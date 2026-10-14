import styles from "./LessonIntroduction.module.css";
import type { LessonIntroductionContent } from "@/lib/lesson-introduction";

export default function LessonIntroduction({ overview, outcomes, why }: LessonIntroductionContent) {
  return <section className={styles.introduction} aria-label="Before you begin">
    <p className={styles.eyebrow}>Before you begin</p>
    <div className={styles.overview}><h3>Lesson overview</h3><p>{overview}</p></div>
    <div className={styles.details}>
      <div><h3>What you’ll learn</h3><ul>{outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></div>
      <div><h3>Why you’re learning this</h3><p>{why}</p></div>
    </div>
  </section>;
}
