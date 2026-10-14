import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {certificateEligible} from './validation';
export async function courseCompletion(userId:string,slug:string){
 const db=getSupabaseAdmin();
 const [course,lessons,progress,legacy]=await Promise.all([
 db.from('learning_courses').select('slug,title,lesson_count,published').eq('slug',slug).eq('published',true).maybeSingle(),
 db.from('learning_lessons').select('number').eq('course_slug',slug),
 db.from('learning_lesson_progress').select('lesson_number,completed_at,assessment_version,score,answers').eq('user_id',userId).eq('course_slug',slug).not('completed_at','is',null),
 db.from('learning_legacy_completions').select('lesson_number').eq('user_id',userId).eq('course_slug',slug)]);
 for(const r of [course,lessons,progress,legacy])if(r.error)throw r.error;
 if(!course.data)return null;
 const required=(lessons.data||[]).map(l=>l.number);const completed=[...new Set([...(progress.data||[]).filter(p=>p.assessment_version==='self-paced-v2'&&p.score>=5&&Array.isArray(p.answers)&&p.answers.length>=5).map(p=>p.lesson_number),...(legacy.data||[]).map(p=>p.lesson_number)])];
 return {course:course.data,required,completed,eligible:required.length===course.data.lesson_count&&certificateEligible(required,completed)};
}
