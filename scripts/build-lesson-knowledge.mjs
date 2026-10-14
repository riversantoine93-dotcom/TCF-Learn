import fs from 'node:fs';
export const focusResets = [
 'If it feels comfortable, sit or stand safely and notice two neutral objects around you. Feel the support beneath your feet or body. Then choose one small next action. Keep your eyes open if you prefer; stop or switch activities if uncomfortable.',
 'If comfortable, let your breathing stay natural and notice a few breaths without changing their depth or holding them. When attention wanders, gently return to the present task. You may keep your eyes open, use an external object instead, or skip the exercise.',
 'Pause in a safe place. Name what you can observe, distinguish it from a prediction, and identify the next action within your control. There is no need to clear your mind or eliminate a feeling. Stop if this increases discomfort.',
 'Choose a neutral object and notice its color, shape, and position for a few moments. If comfortable, return attention to one planned step. Use ordinary observation instead of inward attention if that suits you better; participation is optional.',
];
const references = JSON.parse(fs.readFileSync('scripts/key-ideas/references.json','utf8'));
const authored = {};
for (const category of ['trades','technology','reentry','legacy']) {
 const blocks = fs.readFileSync(`scripts/key-ideas/${category}.txt`,'utf8').trim().split(/\n@/);
 for (const block of blocks) {
  const [header,...lines] = block.split('\n');
  const slug = header.replace(/^@/,'');
  if (authored[slug]) throw Error(`Duplicate knowledge course: ${slug}`);
  authored[slug] = lines.map((line,index) => {
   const parts = line.split('|');
   if (parts.length !== 2 || parts.some(x => x.trim().length < 35)) throw Error(`Incomplete knowledge: ${slug}/${index+1}`);
   const [example,tip] = parts;
   const isReentry = category === 'reentry' || category === 'legacy';
   const colon = tip.indexOf(':');
   return {example,tips:[tip],...(isReentry ? {softSkill:tip.slice(0,colon),focus:tip.slice(colon+1).trim(),reset:focusResets[index % focusResets.length]} : {}),references:(references[slug]||[]).filter(r=>r.lessons.includes(index+1)).map(({sourceId,note})=>({sourceId,note}))};
  });
 }
}
export function lessonKnowledge(slug, number) {
 const knowledge = authored[slug]?.[number-1];
 if (!knowledge) throw Error(`Missing authored knowledge: ${slug}/${number}`);
 return knowledge;
}
export function validateKnowledge(courses) {
 for (const course of courses) if (authored[course.slug]?.length !== course.lesson_count) throw Error(`Knowledge count differs: ${course.slug}`);
 if (Object.keys(authored).length !== courses.length) throw Error('Knowledge course set differs from catalog');
}
export function writeLegacyKnowledge() {
 fs.writeFileSync('lib/legacy-lesson-knowledge.json', JSON.stringify(Object.fromEntries(['turning-forward','thought-to-freedom'].map(slug=>[slug,authored[slug]])),null,2)+'\n');
}
