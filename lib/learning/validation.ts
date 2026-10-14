export type AssessmentQuestion={id:string;prompt:string;options:string[];correctIndex:number;feedback:string};
export function gradeKnowledgeCheck(answers:unknown,questions:AssessmentQuestion[]){
 const selected=Array.isArray(answers)?answers:[];
 const results=questions.map((q,i)=>({id:q.id,correct:Number.isInteger(selected[i])&&selected[i]===q.correctIndex,feedback:q.feedback}));
 return {score:results.filter(r=>r.correct).length,total:questions.length,results,passed:questions.length>=5&&selected.length===questions.length&&results.every(r=>r.correct)};
}
export function validateLessonCompletion(body:Record<string,unknown>,questions:AssessmentQuestion[]){
 if(typeof body.reflection!=='string'||body.reflection.trim().length<40)return 'Explain your scenario reflection in at least 40 characters.';
 if(typeof body.action!=='string'||body.action.trim().length<30)return 'Explain your next step in the scenario in at least 30 characters.';
 if(body.reflection.length>12000||body.action.length>12000)return 'Keep each response under 12,000 characters.';
 if(!gradeKnowledgeCheck(body.answers,questions).passed)return 'Review the feedback and answer all five knowledge-check questions correctly to complete this lesson. You may still visit any other lesson.';
 return null;
}
export function lessonIsUnlocked(number:number,_completedNumbers:number[]=[]){return Number.isInteger(number)&&number>=1}
export function certificateEligible(requiredNumbers:number[],completedNumbers:number[]){const completed=new Set(completedNumbers);return requiredNumbers.length>0&&requiredNumbers.every(n=>completed.has(n))}

export function legacyCompletedNumbers(slug:string,p:Record<string,unknown>,count:number){
 if(!['turning-forward','thought-to-freedom'].includes(slug))return [];
 return Array.from({length:count},(_,i)=>i+1).filter(n=>{const m=Math.floor((n-1)/3)+1,l=(n-1)%3+1;return p[slug==='turning-forward'&&m===1?`lesson${l}`:`m${m}lesson${l}`]===true});
}
