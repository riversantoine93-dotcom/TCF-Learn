import {NextRequest,NextResponse} from 'next/server';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {accessibleLearningSlugs} from '@/lib/learning/server';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){try{
 const db=getSupabaseAdmin();const {data:courses,error}=await db.from('learning_courses').select('*').eq('published',true).order('sort_order');if(error)throw error;
 let access=new Set<string>(),progress:{course_slug:string;lesson_number:number}[]=[];
 if(request.headers.get('authorization')){
 let user;try{user=await requireAuthenticatedUser(request)}catch{return NextResponse.json({error:'Your session expired. Sign in again.'},{status:401})}
 access=await accessibleLearningSlugs(user.id);
 const [a,b]=await Promise.all([db.from('learning_lesson_progress').select('course_slug,lesson_number').eq('user_id',user.id).not('completed_at','is',null),db.from('learning_legacy_completions').select('course_slug,lesson_number').eq('user_id',user.id)]);if(a.error||b.error)throw a.error||b.error;progress=[...(a.data||[]),...(b.data||[])];
 }
 return NextResponse.json({courses:(courses||[]).map(c=>{const numbers=new Set(progress.filter(p=>p.course_slug===c.slug&&p.lesson_number<=c.lesson_count).map(p=>p.lesson_number));let next=1;while(numbers.has(next)&&next<c.lesson_count)next++;return {...c,accessible:access.has(c.slug),completed:numbers.size,percent:Math.round(numbers.size/c.lesson_count*100),nextLesson:next,completedLessons:[...numbers]}})},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to load courses. Please try again.'},{status:503})}}
