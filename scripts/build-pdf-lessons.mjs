import fs from 'node:fs';

// Only original editorial notes are published. The uploaded PDFs stay private.
export function buildPDFLessons(catalog,sources){
 const result={};const sourceMap=new Map(sources.map(s=>[s.id,s]));
 for(const file of fs.readdirSync('scripts/pdf-course-notes').sort()){
  if(!file.endsWith('.txt'))continue;
  for(const block of fs.readFileSync(`scripts/pdf-course-notes/${file}`,'utf8').trim().split(/\n\s*\n/)){
   const [header,...lines]=block.split('\n');const [slug,sourceId]=header.split('|');const course=catalog.find(c=>c.slug===slug),source=sourceMap.get(sourceId);
   if(!course||!source||result[slug]||lines.length!==course.lesson_count)throw Error(`Invalid PDF course mapping: ${slug}`);
   result[slug]=lines.map((line,i)=>{
    const [pageText,teaching,practice,check,...extra]=line.split('|'),pages=pageText.split(',').map(Number);
    if(extra.length||!teaching||!practice||!check||pages.some(p=>!Number.isInteger(p)||p<1||p>source.pageCount))throw Error(`Invalid PDF lesson: ${slug}/${i+1}`);
    return {number:i+1,title:course.outline[i].title,sourceId,pages,relationship:'matched-course',teaching,practice,check};
   });
  }
 }
 if(Object.keys(result).length!==27)throw Error('Expected twenty-seven directly matched PDF courses');
 // The other three courses have no like-named PDF. Add a clearly identified
 // supporting skill; retain their existing technical/primary-source teaching.
 const tradeMap={
  'welding-foundations':[1,12,12,13,13,5,11,4,4,10,12,2,13,15,15],
 };
 for(const [slug,numbers] of Object.entries(tradeMap)){
  const course=catalog.find(c=>c.slug===slug);
  result[slug]=numbers.map((n,i)=>{const note=result['facilities-maintenance'][n-1],title=course.outline[i].title;
   return {...note,number:i+1,title,relationship:'supporting-skill',
    teaching:`Supporting workplace skill for ${title.toLowerCase()}: ${note.teaching} Apply this coordination principle to the lesson's trade example; it does not supply technical operating instructions.`,
    practice:`Using the worked application for ${title.toLowerCase()}, write a brief handover naming the observed condition, who is responsible for the next authorized step, and one detail to confirm.`,
    check:`For ${title.toLowerCase()}, ${note.check.charAt(0).toLowerCase()+note.check.slice(1)} Keep the trade-specific specification and qualified supervision in control.`};
  });
 }
 const forward=[['stress-resilience',9],['stress-resilience',8],['reentry-planning',6],['stress-resilience',2],['stress-resilience',5],['stress-resilience',11],['stress-resilience',14],['stress-resilience',15],['reentry-planning',14],['relationships-boundaries',1],['relationships-boundaries',5],['relationships-boundaries',8],['personal-finance',1],['personal-finance',2],['reentry-planning',12],['purpose-leadership',3],['purpose-leadership',4],['relationships-boundaries',5],['purpose-leadership',11],['purpose-leadership',2],['purpose-leadership',1],['purpose-leadership',14],['reentry-planning',15],['stress-resilience',11]];
 const thought=[['stress-resilience',8],['relationships-boundaries',7],['stress-resilience',8],['purpose-leadership',2],['purpose-leadership',7],['purpose-leadership',8],['stress-resilience',8],['stress-resilience',11],['purpose-leadership',2],['stress-resilience',5],['reentry-planning',6],['stress-resilience',15],['purpose-leadership',1],['purpose-leadership',10],['purpose-leadership',5],['relationships-boundaries',4],['relationships-boundaries',8],['relationships-boundaries',14],['stress-resilience',3],['stress-resilience',4],['stress-resilience',10],['reentry-planning',12],['reentry-planning',14],['reentry-planning',15],['relationships-boundaries',4],['relationships-boundaries',2],['purpose-leadership',12],['stress-resilience',8],['purpose-leadership',9],['purpose-leadership',7]];
 for(const [slug,mapping] of [['turning-forward',forward],['thought-to-freedom',thought]]){
  const course=catalog.find(c=>c.slug===slug);
  result[slug]=mapping.map(([origin,n],i)=>{const note=result[origin][n-1],title=course.outline[i].title;return {...note,number:i+1,title,relationship:'supporting-skill',
   teaching:`Supporting skill for ${title.toLowerCase()}: ${note.teaching}`,
   practice:`Apply this supporting skill to the supplied ${title.toLowerCase()} scenario. ${note.practice}`,
   check:note.check+(slug==='thought-to-freedom'?' These general skills do not clinically validate the course\'s named thinking-pattern labels.':'')};});
 }
 for(const course of catalog)if(result[course.slug]?.length!==course.lesson_count)throw Error(`Missing PDF coverage: ${course.slug}`);
 fs.writeFileSync('lib/learning/pdf-lessons.json',JSON.stringify(result,null,2)+'\n');
 console.log('27 PDF course matches; 3 supporting-skill matches; 474 lesson additions.');
 return result;
}
