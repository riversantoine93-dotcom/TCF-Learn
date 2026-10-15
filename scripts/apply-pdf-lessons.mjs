import notes from '../lib/learning/pdf-lessons.json' with {type:'json'};
import sources from '../lib/learning/pdf-sources.json' with {type:'json'};

export function applyPDFLesson(content,row){
 const note=notes[row.course_slug]?.[row.number-1];
 if(!note||note.number!==row.number||note.title!==row.title)throw Error(`Missing or mismatched PDF teaching: ${row.course_slug}/${row.number}`);
 const source=sources.find(s=>s.id===note.sourceId);
 if(!source)throw Error(`Missing PDF source: ${note.sourceId}`);
 const reference={sourceId:source.id,pdfReading:true,note:`${note.relationship==='matched-course'?'Matched course background':'Supporting skill background'}: uploaded ${source.uploadedFile}, PDF page${note.pages.length===1?'':'s'} ${note.pages.join(', ')}. ${source.scope} Teaching and practice examples are original TCF adaptations, not copied source exercises.`};
 const topics=content.topics.map((t,i)=>({...t,paragraphs:[...t.paragraphs,i===0?`From the course reading: ${note.teaching}`:i===1?`Short practice: ${note.practice}`:`Reading check: ${note.check}`]}));
 const retrieval=content.microlearning.retrieval.map((r,i)=>({...r,guide:`${r.guide} ${i===0?note.teaching:i===1?note.practice:note.check}`}));
 return {...content,pdfVersion:'pdf-reading-v1',pdfReading:{sourceId:note.sourceId,pages:note.pages,relationship:note.relationship},topics,
  knowledge:{...content.knowledge,references:[...content.knowledge.references.filter(r=>!r.pdfReading),reference]},
  microlearning:{...content.microlearning,retrieval},
 };
}
