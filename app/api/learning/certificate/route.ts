import {NextRequest,NextResponse} from 'next/server';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {hasLearningAccess} from '@/lib/learning/server';
import {courseCompletion} from '@/lib/learning/completion';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
export const dynamic='force-dynamic';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
async function context(request:NextRequest){
 let user;try{user=await requireAuthenticatedUser(request)}catch{return {response:NextResponse.json({error:'Sign in is required.'},{status:401})}}
 const slug=request.nextUrl.searchParams.get('course')||'';
 if(!await hasLearningAccess(user.id,slug))return {response:NextResponse.json({error:'Course access is required.'},{status:403})};
 const completion=await courseCompletion(user.id,slug);if(!completion)return {response:NextResponse.json({error:'Course not found.'},{status:404})};
 return {user,slug,completion};
}
export async function GET(request:NextRequest){try{const ctx=await context(request);if(ctx.response)return ctx.response;return NextResponse.json({eligible:ctx.completion!.eligible,completed:ctx.completion!.completed.length,total:ctx.completion!.required.length},{headers:{'Cache-Control':'private, no-store'}})}catch{return NextResponse.json({error:'Unable to verify completion.'},{status:503})}}
export async function POST(request:NextRequest){try{
 const ctx=await context(request);if(ctx.response)return ctx.response;
 if(!ctx.completion!.eligible)return NextResponse.json({error:'Complete every lesson in this course before generating a certificate.',completed:ctx.completion!.completed.length,total:ctx.completion!.required.length},{status:409});
 const db=getSupabaseAdmin(),user=ctx.user!;
 const name=String(user.user_metadata?.full_name||[user.user_metadata?.first_name,user.user_metadata?.last_name].filter(Boolean).join(' ')||'TCF Learn Learner').slice(0,160);
 const saved=await db.from('learning_certificates').upsert({user_id:user.id,course_slug:ctx.slug,learner_name:name},{onConflict:'user_id,course_slug',ignoreDuplicates:true});if(saved.error)throw saved.error;
 const {data:certificate,error}=await db.from('learning_certificates').select('id,learner_name,issued_at').eq('user_id',user.id).eq('course_slug',ctx.slug!).single();if(error)throw error;
 const course=escape(ctx.completion!.course.title),date=new Date(certificate.issued_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'America/New_York'});
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>${course} — Certificate of Completion</title><style>@page{size:landscape;margin:.5in}body{font-family:Arial,sans-serif;background:#fff;color:#171717;margin:0;padding:30px}.certificate{border:10px solid #191919;outline:2px solid #b58b38;outline-offset:-23px;padding:65px 45px;text-align:center;min-height:480px;box-sizing:border-box}h1{font-family:Georgia,serif;font-size:44px}h2{font-size:32px}small{display:block;margin-top:24px;color:#555}button{margin-bottom:20px;padding:12px 18px;background:#191919;color:white;border:0}@media print{button{display:none}body{padding:0}}</style><button onclick="window.print()">Print / Save as PDF</button><main class="certificate"><strong>TCF LEARN</strong><h1>Certificate of Completion</h1><p>Presented to</p><h2>${escape(certificate.learner_name)}</h2><p>For completing every lesson in</p><h2>${course}</h2><p>${ctx.completion!.required.length} lessons completed · ${escape(date)}</p><small>Certificate ID: ${escape(certificate.id)}</small><small>Changing the narrative. Changing lives.</small></main></html>`;
 return NextResponse.json({certificate,html},{headers:{'Cache-Control':'private, no-store'}});
}catch{return NextResponse.json({error:'Unable to generate your certificate. Please try again.'},{status:503})}}
