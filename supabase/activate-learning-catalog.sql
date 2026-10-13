-- Authorized by Antoine Rivers on 2026-10-13: current and future active learner seats receive the 30-course catalog.
begin;
insert into public.organization_course_access(organization_id,course_slug,active)
select o.id,c.slug,true from public.organizations o cross join public.learning_courses c
where o.status='active' and c.published
on conflict(organization_id,course_slug) do update set active=true;
update public.enrollments e set active=true
from public.organization_memberships m, public.organizations o, public.learning_courses c
where m.organization_id=o.id and e.organization_id=o.id and e.user_id=m.user_id
and c.slug=e.course_slug and c.published and o.status='active' and m.status='active' and m.role='learner';
insert into public.enrollments(user_id,organization_id,course_slug,active,payment_status,amount_paid,currency)
select m.user_id,m.organization_id,c.course_slug,true,'organization',0,'usd'
from public.organization_memberships m
join public.organizations o on o.id=m.organization_id
join public.organization_course_access c on c.organization_id=o.id and c.active
join public.learning_courses catalog on catalog.slug=c.course_slug and catalog.published
where m.status='active' and m.role='learner' and m.user_id is not null and o.status='active'
and not exists(select 1 from public.enrollments e where e.user_id=m.user_id and e.course_slug=c.course_slug and e.organization_id=m.organization_id);
commit;
