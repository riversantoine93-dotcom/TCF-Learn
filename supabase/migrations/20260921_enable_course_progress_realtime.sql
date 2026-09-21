-- Publish learner course progress changes to Supabase Realtime.
-- Organization admins and co-admins are still restricted by the existing
-- course_progress SELECT RLS policy.
alter publication supabase_realtime add table public.course_progress;
