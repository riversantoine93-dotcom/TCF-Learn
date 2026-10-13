import {NextRequest,NextResponse} from 'next/server';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {hasLearningAccess} from '@/lib/learning/server';
import {lessonIsUnlocked,validateLessonCompletion} from '@/lib/learning/validation';
import type {LearningContent} from '@/lib/learning/types';
export const dynamic='force-dynamic';
async function context(request:NextRequest){
 let user;try{user=await requireAuthenticatedUser(request)}catch{return {response:NextResponse.json({error:'Sign in to open your lessons.'},{status:401})}}
 const slug=request.nextUrl.searchParams.get('course')||'';const number=Number(request.nextUrl.searchParams.get('number'));
 if(!Number.isInteger(number)||number<1||number>100)return {response:NextResponse.json({error:'Invalid lesson.'},{status:400})};
 const db=getSupabaseAdmin();
 if(!await hasLearningAccess(user.id,slug))return {response:NextResponse.json({error:'An active organization learner seat is required.'},{status:403})};
 const {data:course,error:courseError}=await db.from('learning_courses').select('slug,published,legacy_url,lesson_count').eq('slug',slug).eq('published',true).maybeSingle();
 if(courseError)throw courseError;
 if(!course||course.legacy_url)return {response:NextResponse.json({error:'Open this course through its course overview.'},{status:404})};
 const {data:completed,error}=await db.from('learning_lesson_progress').select('lesson_number').eq('user_id',user.id).eq('course_slug',slug).not('completed_at','is',null);if(error)throw error;
 if(!lessonIsUnlocked(number,(completed||[]).map(p=>p.lesson_number)))return {response:NextResponse.json({error:'Complete the previous lesson first.'},{status:409})};
 const {data:lesson,error:lessonError}=await db.from('learning_lessons').select('*').eq('course_slug',slug).eq('number',number).maybeSingle();if(lessonError)throw lessonError;
 if(!lesson)return {response:NextResponse.json({error:'Lesson not found.'},{status:404})};
 return {user,db,slug,number,lesson};
}
export async function GET(request:NextRequest){try{
 const ctx=await context(request);if(ctx.response)return ctx.response;
 const {data:progress,error}=await ctx.db!.from('learning_lesson_progress').select('reflection,action,answer,completed_at').eq('user_id',ctx.user!.id).eq('course_slug',ctx.slug!).eq('lesson_number',ctx.number!).maybeSingle();if(error)throw error;
 const {correctIndex,feedback,...content}=ctx.lesson!.content as LearningContent;
 return NextResponse.json({lesson:{...ctx.lesson,content},progress},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to load this lesson. Try again.'},{status:503})}}
export async function POST(request:NextRequest){try{
 const ctx=await context(request);if(ctx.response)return ctx.response;
 const body=await request.json();const content=ctx.lesson!.content as LearningContent;
 const message=validateLessonCompletion(body,content.correctIndex);if(message)return NextResponse.json({error:message},{status:422});
 const {error}=await ctx.db!.from('learning_lesson_progress').upsert({user_id:ctx.user!.id,course_slug:ctx.slug,lesson_number:ctx.number,reflection:body.reflection.trim(),action:body.action.trim(),answer:body.answer,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id,course_slug,lesson_number'});if(error)throw error;
 return NextResponse.json({completed:true,feedback:content.feedback},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to save your lesson. Your answers remain on screen; try again.'},{status:503})}}
