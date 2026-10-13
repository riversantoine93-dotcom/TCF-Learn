import {getSupabaseAdmin} from '@/lib/supabase-admin';
export async function hasLearningAccess(userId:string,slug:string){
 const db=getSupabaseAdmin();
 const {data:enrollments,error}=await db.from('enrollments').select('organization_id').eq('user_id',userId).eq('course_slug',slug).eq('active',true);
 if(error)throw error;
 if(enrollments?.some(row=>!row.organization_id))return true;
 for(const row of enrollments||[]){
  const [org,member,access]=await Promise.all([
   db.from('organizations').select('id').eq('id',row.organization_id).eq('status','active').maybeSingle(),
   db.from('organization_memberships').select('id').eq('organization_id',row.organization_id).eq('user_id',userId).eq('status','active').maybeSingle(),
   db.from('organization_course_access').select('course_slug').eq('organization_id',row.organization_id).eq('course_slug',slug).eq('active',true).maybeSingle(),
  ]);
  if(org.error||member.error||access.error)throw org.error||member.error||access.error;
  if(org.data&&member.data&&access.data)return true;
 }
 return false;
}
export async function accessibleLearningSlugs(userId:string){
 const db=getSupabaseAdmin();
 const [{data:enrollments,error},{data:members,error:memberError}]=await Promise.all([
  db.from('enrollments').select('course_slug,organization_id').eq('user_id',userId).eq('active',true),
  db.from('organization_memberships').select('organization_id').eq('user_id',userId).eq('status','active'),
 ]);
 if(error||memberError)throw error||memberError;
 const orgIds=[...new Set((members||[]).map(m=>m.organization_id))];
 const permitted=new Set((enrollments||[]).filter(e=>!e.organization_id).map(e=>e.course_slug));
 if(orgIds.length){
  const {data:orgs,error:orgError}=await db.from('organizations').select('id').in('id',orgIds).eq('status','active');if(orgError)throw orgError;
  const active=(orgs||[]).map(o=>o.id);
  if(active.length){const {data:access,error:accessError}=await db.from('organization_course_access').select('organization_id,course_slug').in('organization_id',active).eq('active',true);if(accessError)throw accessError;
   for(const e of enrollments||[])if(access?.some(a=>a.organization_id===e.organization_id&&a.course_slug===e.course_slug))permitted.add(e.course_slug);
  }
 }
 return permitted;
}
