export type PracticeReview={slug:string;number:number;title:string;plan:string;prompt:string;dueAt:number;practicedAt?:number};
export const reviewStorageKey=(userId:string)=>`tcf-practice-review:v1:${userId}`;
export function readReviews(raw:string|null):PracticeReview[]{
 try{const data=JSON.parse(raw||'[]');if(!Array.isArray(data))return [];return data.filter(r=>r&&typeof r.slug==='string'&&/^[a-z0-9-]+$/.test(r.slug)&&Number.isInteger(r.number)&&r.number>0&&typeof r.title==='string'&&typeof r.plan==='string'&&r.plan.length<=12000&&typeof r.prompt==='string'&&Number.isFinite(r.dueAt)&&(!r.practicedAt||Number.isFinite(r.practicedAt))).slice(0,100)}catch{return []}
}
export function scheduleReview(reviews:PracticeReview[],review:PracticeReview){return [review,...reviews.filter(r=>!(r.slug===review.slug&&r.number===review.number))].slice(0,100)}
export function buildHabitPlan(cue:string,routine:string,evidence:string){return `When ${cue.trim()}, I will ${routine.trim()}. I will check: ${evidence.trim()}. If I miss an opportunity, I will restart at the next suitable cue.`}
export function reviewDue(review:PracticeReview,now=Date.now()){return review.dueAt<=now}
