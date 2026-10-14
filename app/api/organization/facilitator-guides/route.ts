import {NextRequest,NextResponse} from 'next/server';
import {requireAuthenticatedUser} from '@/lib/server-auth';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
import {getFacilitatorCourses,getFacilitatorGuides} from '@/lib/facilitator-guides';
import {facilitatorCourseHTML} from '@/lib/facilitator-export';
export const dynamic='force-dynamic';
const privateHeaders={'Cache-Control':'private, no-store'};
export async function GET(request:NextRequest){
 let user;try{user=await requireAuthenticatedUser(request)}catch{return NextResponse.json({error:'Administrator sign-in is required.'},{status:401,headers:privateHeaders})}
 try{
  const admin=getSupabaseAdmin();
  const {data:memberships,error}=await admin.from('organization_memberships').select('organization_id,role,status').eq('user_id',user.id).eq('status','active').in('role',['admin','co_admin']);
  if(error)throw error;
  if(!memberships?.length)return NextResponse.json({error:'Organization administrator access is required.'},{status:403,headers:privateHeaders});
  const orgIds=[...new Set(memberships.map(m=>m.organization_id))];
  const {data:orgs,error:orgError}=await admin.from('organizations').select('id').in('id',orgIds).eq('status','active');if(orgError)throw orgError;
  if(!orgs?.length)return NextResponse.json({error:'An active organization is required.'},{status:403,headers:privateHeaders});
  const {data:access,error:accessError}=await admin.from('organization_course_access').select('course_slug').in('organization_id',orgs.map(o=>o.id)).eq('active',true);if(accessError)throw accessError;
  const allowed=new Set(access?.map(a=>a.course_slug));const courses=getFacilitatorCourses().filter(c=>allowed.has(c.slug));
  const slug=request.nextUrl.searchParams.get('course')||courses[0]?.slug;const course=courses.find(c=>c.slug===slug);
  if(!course)return NextResponse.json({error:'This course is not available to your organization.'},{status:403,headers:privateHeaders});
  const guides=getFacilitatorGuides(course.slug);
  if(request.nextUrl.searchParams.get('format')==='html')return new NextResponse(facilitatorCourseHTML(course,guides),{headers:{...privateHeaders,'Content-Type':'text/html; charset=utf-8','Content-Disposition':`attachment; filename="TCF-${course.slug}-Facilitator-Guide.html"`,'X-Content-Type-Options':'nosniff'}});
  return NextResponse.json({adminRole:memberships.find(m=>orgs.some(o=>o.id===m.organization_id))?.role,courses,course:course.slug,guides},{headers:privateHeaders});
 }catch{return NextResponse.json({error:'Unable to load facilitator guides. Please try again.'},{status:503,headers:privateHeaders})}
}
