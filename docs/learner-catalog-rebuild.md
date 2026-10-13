# Learner catalog rebuild

The learner dashboard and catalog use a persistent sidebar, subject filters, search, progress filters, clear course cards, and a mobile menu. The reference informed the layout; course instruction is original TCF Learn material.

There are exactly 30 published courses: 10 trades, 10 technology, and 10 reentry. Turning Forward retains 24 lessons and its established eight-module route. Thought to Freedom retains 30 lessons and its established ten-module route. Each of the 28 new courses has 15 lessons, for 474 lessons in total.

New lessons include instruction, a topic-specific practice task, reflection, a recorded practice result, and a four-option knowledge check. Completion requires the correct answer and sufficient responses. The next lesson unlocks only after the previous lesson is complete. Progress is saved in Supabase; save failures keep text on screen for retry.

## Database

The connected Turning Forward Supabase project contains `learning_courses`, `learning_lessons`, and `learning_lesson_progress`. All three tables have RLS. Course metadata is public; lesson content requires enrollment. Completion writes are server-only. Organization access checks require active enrollment, active membership, an active organization, and active course authorization. Existing progress and learner records remain intact.

The generated seed is reproducible with `node scripts/build-learning-curriculum.mjs` followed by `node scripts/build-learning-seed.mjs`. Schema source is `supabase/learning-catalog.sql`. Do not grant catalog-wide access or replace assignments implicitly.

## Access decision still required

Automatic approval review rejected bulk granting all catalog courses to existing organizations and members because that shared-access scope was not explicit. Current assignments remain unchanged. The new courses are available as catalog outlines until learner access is explicitly approved and applied. The existing two-course license defaults remain unchanged pending that decision.

## Deployment

This change is prepared on an isolated GitHub branch and a Vercel preview. Production replacement is a separate action. Public Supabase configuration is enabled for preview using the same existing values. Server credentials remain in Vercel; no credentials are committed.

## Verification

The application build and TypeScript checks pass. Tests cover the 30-course category counts, unique identifiers, lesson counts and numbering, original-course routes, lesson requirements, wrong-answer rejection, and sequential unlocking. Database checks confirm 474 actual lessons, no count mismatches, RLS on all new tables, and no authenticated direct progress writes.

Browser visual testing was unavailable in this session. Course completion is not a trade license, degree, clinical service, or vocational certification. Estimated durations include practice and are not guaranteed contact hours.
