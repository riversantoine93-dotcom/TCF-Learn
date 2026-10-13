export function validateLessonCompletion(body:Record<string,unknown>, correctIndex:number){
 if(typeof body.reflection!=='string'||body.reflection.trim().length<40)return 'Explain your reflection in at least 40 characters.';
 if(typeof body.action!=='string'||body.action.trim().length<30)return 'Record your practice result in at least 30 characters.';
 if(body.reflection.length>12000||body.action.length>12000)return 'Keep each response under 12,000 characters.';
 if(body.answer!==correctIndex)return 'Review the lesson and try the knowledge check again.';
 return null;
}
export function lessonIsUnlocked(number:number,completedNumbers:number[]){return number===1||completedNumbers.includes(number-1)}
