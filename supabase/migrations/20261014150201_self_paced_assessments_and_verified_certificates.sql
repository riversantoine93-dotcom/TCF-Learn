alter table public.learning_lesson_progress add column if not exists answers jsonb not null default '[]'::jsonb;
alter table public.learning_lesson_progress add column if not exists assessment_version text;
alter table public.learning_lesson_progress add column if not exists score integer not null default 0;
create table if not exists public.learning_certificates (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_slug text not null references public.learning_courses(slug),
 learner_name text not null,
 issued_at timestamptz not null default now(),
 unique(user_id,course_slug)
);
alter table public.learning_certificates enable row level security;
create policy "Learners read own course certificates" on public.learning_certificates for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.learning_certificates from anon,authenticated;
grant select on public.learning_certificates to authenticated;
grant all on public.learning_certificates to service_role;
create table if not exists public.learning_legacy_completions (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_slug text not null references public.learning_courses(slug),
 lesson_number integer not null,
 accepted_at timestamptz not null default now(),
 primary key(user_id,course_slug,lesson_number)
);
alter table public.learning_legacy_completions enable row level security;
create policy "Learners read historical completions" on public.learning_legacy_completions for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.learning_legacy_completions from anon,authenticated;
grant select on public.learning_legacy_completions to authenticated;
grant all on public.learning_legacy_completions to service_role;
insert into public.learning_legacy_completions(user_id,course_slug,lesson_number)
select p.user_id,p.course_slug,n from public.course_progress p
join public.learning_courses c on c.slug=p.course_slug
cross join lateral generate_series(1,c.lesson_count) n
where p.course_slug in ('turning-forward','thought-to-freedom')
and p.progress->>(case when p.course_slug='turning-forward' and n<=3 then 'lesson'||n::text else 'm'||(((n-1)/3)+1)::text||'lesson'||(((n-1)%3)+1)::text end)='true'
on conflict do nothing;
