import {NextRequest,NextResponse} from 'next/server';
import {selfPacedContent} from '../../../../scripts/build-self-paced-lessons.mjs';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {hasLearningAccess} from '@/lib/learning/server';
import {gradeKnowledgeCheck,validateLessonCompletion} from '@/lib/learning/validation';
import type {LearningContent} from '@/lib/learning/types';
export const dynamic='force-dynamic';
async function context(request:NextRequest){
 let user;try{user=await requireAuthenticatedUser(request)}catch{return {response:NextResponse.json({error:'Sign in to open your lessons.'},{status:401})}}
 const slug=request.nextUrl.searchParams.get('course')||'',number=Number(request.nextUrl.searchParams.get('number'));
 if(!Number.isInteger(number)||number<1||number>100)return {response:NextResponse.json({error:'Invalid lesson.'},{status:400})};
 const db=getSupabaseAdmin();if(!await hasLearningAccess(user.id,slug))return {response:NextResponse.json({error:'Active course access is required.'},{status:403})};
 const {data:course,error:courseError}=await db.from('learning_courses').select('*').eq('slug',slug).eq('published',true).maybeSingle();if(courseError)throw courseError;
 if(!course||number>course.lesson_count)return {response:NextResponse.json({error:'Course or lesson not found.'},{status:404})};
 const {data:lesson,error}=await db.from('learning_lessons').select('*').eq('course_slug',slug).eq('number',number).maybeSingle();if(error)throw error;if(!lesson)return {response:NextResponse.json({error:'Lesson not found.'},{status:404})};
 lesson.content=selfPacedContent(lesson,course);
 return {user,db,slug,number,lesson,course};
}
export async function GET(request:NextRequest){try{
 const ctx=await context(request);if(ctx.response)return ctx.response;
 const [saved,legacy,earlier]=await Promise.all([ctx.db!.from('learning_lesson_progress').select('reflection,action,answers,completed_at,assessment_version').eq('user_id',ctx.user!.id).eq('course_slug',ctx.slug!).eq('lesson_number',ctx.number!).maybeSingle(),ctx.db!.from('learning_legacy_completions').select('lesson_number').eq('user_id',ctx.user!.id).eq('course_slug',ctx.slug!).eq('lesson_number',ctx.number!).maybeSingle(),ctx.db!.from('course_progress').select('progress').eq('user_id',ctx.user!.id).eq('course_slug',ctx.slug!).maybeSingle()]);if(saved.error||legacy.error||earlier.error)throw saved.error||legacy.error||earlier.error;
 const {correctIndex,feedback,questions,quiz,blocks,...content}=ctx.lesson!.content as LearningContent&{quiz?:unknown;blocks?:unknown};
 const safeQuestions=(questions||[]).map(({correctIndex,feedback,...q})=>q);
 const previous=Boolean(legacy.data);
 const original=ctx.lesson!.content as Record<string,unknown>,oldProgress=earlier.data?.progress||{},m=Math.floor((ctx.number!-1)/3)+1,l=(ctx.number!-1)%3+1;
 const legacyNotes:{label:string;text:string}[]=[];
 if(ctx.slug==='turning-forward'&&Array.isArray(original.fields))for(const field of original.fields){const key=m===1?field.id:`m${m}l${l}${field.id}`,value=oldProgress[key];if(typeof value==='string'&&value.trim())legacyNotes.push({label:field.label,text:value})}
 if(ctx.slug==='thought-to-freedom'){const prefix=`thought-to-freedom:module-${m}:lesson-${l}:`;for(const [key,value] of Object.entries(oldProgress))if(key.startsWith(prefix)&&typeof value==='string'&&value.trim())legacyNotes.push({label:'Earlier lesson response',text:value})}
 return NextResponse.json({lesson:{...ctx.lesson,content:{...content,questions:safeQuestions}},progress:saved.data,previouslyCompleted:previous,legacyNotes},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to load this lesson. Try again.'},{status:503})}}
export async function POST(request:NextRequest){try{
 const ctx=await context(request);if(ctx.response)return ctx.response;const body=await request.json();const content=ctx.lesson!.content as LearningContent;
 const grade=gradeKnowledgeCheck(body.answers,content.questions||[]);const message=validateLessonCompletion(body,content.questions||[]);
 if(message)return NextResponse.json({error:message,...grade},{status:422});
 const {error}=await ctx.db!.from('learning_lesson_progress').upsert({user_id:ctx.user!.id,course_slug:ctx.slug,lesson_number:ctx.number,reflection:body.reflection.trim(),action:body.action.trim(),answer:body.answers[0],answers:body.answers,score:grade.score,assessment_version:'self-paced-v2',completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id,course_slug,lesson_number'});if(error)throw error;
 return NextResponse.json({completed:true,...grade},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to save your lesson. Your answers remain on screen; try again.'},{status:503})}}
