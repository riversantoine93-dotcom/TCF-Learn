import type { LessonKnowledge } from '@/lib/lesson-knowledge';
import { knowledgeSources } from '@/lib/knowledge-sources';
import styles from './LessonKnowledgeContent.module.css';

export default function LessonKnowledgeContent({knowledge,hideExample=false}:{knowledge?:LessonKnowledge;hideExample?:boolean}) {
  if (!knowledge) return null;
  return <div className={styles.knowledge} aria-label="Examples and practical knowledge">
    {!hideExample&&<div className={styles.example}><h4>Example in practice</h4><p>{knowledge.example}</p><small>Learning scenario. Sample people, amounts, and calculations are illustrative.</small></div>}
    {knowledge.softSkill && knowledge.focus ? <div><h4>Skill to practice: {knowledge.softSkill}</h4><p><strong>Focus point:</strong> {knowledge.focus}</p></div> : <div><h4>Practical tips</h4><ul>{knowledge.tips.map(tip=><li key={tip}>{tip}</li>)}</ul></div>}
    {knowledge.reset ? <details className={styles.reset}><summary>Optional focus and mindfulness reset</summary><p>{knowledge.reset}</p><small>Use only when safely at rest. This is an optional attention exercise, not treatment. Skip it if uncomfortable; qualified support can help with persistent distress.</small><p className={styles.sourceLinks}><a href={knowledgeSources['va-mindfulness'].url} target="_blank" rel="noreferrer">VA mindful breathing reference ↗</a><a href={knowledgeSources['nccih-mindfulness'].url} target="_blank" rel="noreferrer">NCCIH: effectiveness and safety ↗</a></p></details> : null}
    {knowledge.references.length ? <div className={styles.references}><h4>Regulations, standards &amp; references</h4>{knowledge.references.map(reference=>{
      const source=knowledgeSources[reference.sourceId];
      return <div className={styles.reference} key={reference.sourceId}><span>{source.kind}</span><p>{reference.note}</p>{source.url?<a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>:<strong>{source.title}</strong>}<small>{source.uploadedFile?'Uploaded reading reviewed':'Source checked'} {source.checked}. Confirm current requirements for your location and task.</small></div>;
    })}</div> : null}
  </div>;
}
