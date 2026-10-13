import {NextRequest,NextResponse} from 'next/server';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {accessibleLearningSlugs} from '@/lib/learning/server';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 try{
  const db=getSupabaseAdmin();
  const {data:courses,error}=await db.from('learning_courses').select('*').eq('published',true).order('sort_order');if(error)throw error;
  let access=new Set<string>();let newProgress:{course_slug:string;lesson_number:number}[]=[];let legacy:{course_slug:string;progress:Record<string,unknown>}[]=[];
  if(request.headers.get('authorization')){
   let user;try{user=await requireAuthenticatedUser(request)}catch{return NextResponse.json({error:'Your session expired. Sign in again.'},{status:401})}
   access=await accessibleLearningSlugs(user.id);
   const [a,b]=await Promise.all([db.from('learning_lesson_progress').select('course_slug,lesson_number').eq('user_id',user.id).not('completed_at','is',null),db.from('course_progress').select('course_slug,progress').eq('user_id',user.id)]);
   if(a.error||b.error)throw a.error||b.error;newProgress=a.data||[];legacy=b.data||[];
  }
  return NextResponse.json({courses:(courses||[]).map(c=>{
   const p=legacy.find(r=>r.course_slug===c.slug)?.progress||{};
   const complete=c.legacy_url?Object.entries(p).filter(([k,v])=>v===true&&/^(lesson[1-3]|m\d+lesson[1-3])$/.test(k)).length:newProgress.filter(r=>r.course_slug===c.slug).length;
   const completed=Math.min(c.lesson_count,complete);
   const numbers=new Set(newProgress.filter(r=>r.course_slug===c.slug).map(r=>r.lesson_number));let next=1;while(numbers.has(next)&&next<c.lesson_count)next++;
   return {...c,accessible:access.has(c.slug),completed,percent:Math.round(completed/c.lesson_count*100),nextLesson:next};
  })},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Unable to load courses. Please try again.'},{status:503})}
}
