begin;
create table if not exists public.learning_courses (
 slug text primary key,title text not null,description text not null,
 category text not null check(category in ('trades','technology','reentry')),
 duration_minutes integer not null check(duration_minutes>0),lesson_count integer not null check(lesson_count>=15),
 outline jsonb not null,legacy_url text,published boolean not null default true,sort_order integer not null default 0
);
create table if not exists public.learning_lessons (
 course_slug text not null references public.learning_courses(slug),number integer not null check(number>0),
 title text not null,content jsonb not null,primary key(course_slug,number)
);
create table if not exists public.learning_lesson_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_slug text not null,lesson_number integer not null,
 reflection text not null default '',action text not null default '',answer integer,
 completed_at timestamptz,updated_at timestamptz not null default now(),
 primary key(user_id,course_slug,lesson_number),
 foreign key(course_slug,lesson_number) references public.learning_lessons(course_slug,number)
);
alter table public.learning_courses enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_lesson_progress enable row level security;
grant select on public.learning_courses to anon,authenticated;
grant select on public.learning_lessons,public.learning_lesson_progress to authenticated;
grant all on public.learning_courses,public.learning_lessons,public.learning_lesson_progress to service_role;
drop policy if exists "Published learning catalog" on public.learning_courses;
create policy "Published learning catalog" on public.learning_courses for select to anon,authenticated using(published);
drop policy if exists "Enrolled learning lessons" on public.learning_lessons;
create policy "Enrolled learning lessons" on public.learning_lessons for select to authenticated using(
 exists(select 1 from public.enrollments e where e.user_id=(select auth.uid()) and e.course_slug=learning_lessons.course_slug and e.active
 and (e.organization_id is null or exists(select 1 from public.organizations o join public.organization_memberships m on m.organization_id=o.id
 join public.organization_course_access a on a.organization_id=o.id and a.course_slug=e.course_slug
 where o.id=e.organization_id and o.status='active' and m.user_id=(select auth.uid()) and m.status='active' and a.active)))
);
drop policy if exists "Own learning responses" on public.learning_lesson_progress;
create policy "Own learning responses" on public.learning_lesson_progress for select to authenticated using(user_id=(select auth.uid()));
-- Completion writes are server-only and validate enrollment, sequence, reflection, practice and quiz.
revoke insert,update,delete on public.learning_lesson_progress from anon,authenticated;
commit;
