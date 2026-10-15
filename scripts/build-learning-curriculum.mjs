import fs from 'node:fs';
import { buildPDFLessons } from './build-pdf-lessons.mjs';
import { build } from 'esbuild';
import { lessonKnowledge, validateKnowledge, writeLegacyKnowledge } from './build-lesson-knowledge.mjs';
await build({entryPoints:['scripts/build-scenario-art.ts'],bundle:true,platform:'node',format:'esm',outfile:'/tmp/tcf-scenario-art.mjs'});
const {writeScenarioArt}=await import('/tmp/tcf-scenario-art.mjs');writeScenarioArt();
buildPDFLessons(JSON.parse(fs.readFileSync('lib/learning/catalog.json','utf8')),JSON.parse(fs.readFileSync('lib/learning/pdf-sources.json','utf8')));
const {selfPacedContent}=await import('./build-self-paced-lessons.mjs');
const courses=[];const lessons=[];
for (const category of ['trades','technology','reentry']) {
 const blocks=fs.readFileSync(`scripts/curriculum-${category}.txt`,'utf8').trim().split(/\n\s*\n/);
 for(const block of blocks){
  const [header,...lines]=block.split('\n');const [title,slug,description]=header.split('|');
  if(lines.length!==15) throw Error(`${slug}: ${lines.length} lessons`);
  const outline=lines.map((line,i)=>{const [title,teaching,practice]=line.split('|');if(!title||!teaching||!practice)throw Error(slug);return {number:i+1,title}});
  courses.push({slug,title,description,category,duration_minutes:225,lesson_count:15,outline,legacy_url:null});
  lines.forEach((line,i)=>{
   const [title,teaching,practice]=line.split('|');
   const correct=teaching.split(/(?<=\.)\s+/)[0];
   const options=[correct,'Skip verification and act on the first assumption.','Leave the task undocumented so mistakes cannot be traced.','Use the same approach in every situation without checking context.'];
   // Stable varied answer positions, with a server-only correct index.
   const rotation=i%4;const rotated=[...options.slice(rotation),...options.slice(0,rotation)];
   lessons.push({course_slug:slug,number:i+1,title,content:{knowledge:lessonKnowledge(slug,i+1),objective:`Apply ${title.toLowerCase()} to a realistic ${titleFor(category)} task.`,teaching,context:description,practice,reflection:`In your own words, explain ${title.toLowerCase()} and describe one situation where the idea would change your next action.`,actionPrompt:`Complete this practice: ${practice} Record your result, the information you checked, and one question you still need to resolve.`,question:`Which statement correctly applies the lesson on ${title.toLowerCase()}?`,options:rotated,correctIndex:rotated.indexOf(correct),feedback:`${correct} Check the lesson's conditions and verify your information before acting.`,minutes:15}});
  });
 }
}
function titleFor(c){return c==='trades'?'supervised workplace':c==='technology'?'digital-work':'return-home planning'}
await build({entryPoints:['scripts/legacy-curriculum.ts'],bundle:true,platform:'node',format:'esm',outfile:'/tmp/tcf-legacy-curriculum.mjs'});
const {legacyCourses,legacyLessons}=await import('/tmp/tcf-legacy-curriculum.mjs');
courses.unshift(...legacyCourses);lessons.push(...legacyLessons.map(l=>({...l,content:{...l.content,knowledge:lessonKnowledge(l.course_slug,l.number)}})));
validateKnowledge(courses);
if(courses.length!==30||new Set(courses.map(c=>c.slug)).size!==30)throw Error('Exactly thirty unique courses required');
for(const lesson of lessons) lesson.content=selfPacedContent(lesson,courses.find(c=>c.slug===lesson.course_slug));
writeLegacyKnowledge(lessons);
for(const course of courses)course.duration_minutes=course.lesson_count*20;
fs.writeFileSync('lib/learning/catalog.json',JSON.stringify(courses,null,2)+'\n');
fs.writeFileSync('scripts/learning-lessons.json',JSON.stringify(lessons,null,2)+'\n');
console.log(`${courses.length} courses; ${lessons.length} lessons; all courses have at least 15 lessons.`);
