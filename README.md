# TCF LEARN — Turning Forward + Supabase

This package connects the designed TCF LEARN course to Supabase while preserving the full Next.js/Vercel application and Module 1 video.

## What is connected
- Email/password account creation and sign-in through Supabase Auth
- User profile creation
- Module journal responses synced to Supabase
- Knowledge-check answers synced to Supabase
- Completed-module status synced to Supabase
- Dashboard combines local progress with cloud progress
- Local browser storage remains as a fallback for signed-out learners
- TCF LEARN visuals refreshed to echo The Conviction Fiction Podcast's editorial, documentary-style aesthetic

## 1. Run the database setup
Open the Supabase project:
`https://hgcdchahcdncxbmzjfwk.supabase.co`

Go to **SQL Editor**, create a new query, paste the contents of:

`supabase/setup.sql`

and run it once.

This creates:
- `profiles`
- `course_progress`
- Row Level Security policies
- new-user profile trigger

## 2. Supabase Auth settings
In Supabase go to **Authentication → URL Configuration**.

For local development:
`http://localhost:3000`

For production, set your Vercel site URL as the Site URL and add it to Redirect URLs.

If email confirmation is enabled, new users must confirm their email before signing in.

## 3. Vercel environment variables
The public values are included in `.env.production`, but you should also add these in Vercel:

`NEXT_PUBLIC_SUPABASE_URL=https://hgcdchahcdncxbmzjfwk.supabase.co`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ne89Tdh-ImkmhlsBT9ItbQ_k_TgpRAe`

No database password is needed for the browser app.

## 4. Important security note
Do NOT add the direct PostgreSQL connection string to client-side code. The database password belongs only in secure server-side environments when you actually need a direct DB connection.

## 5. Dependencies
The app expects:
- `@supabase/supabase-js`
- `@supabase/ssr`

The supplied `npx skills add supabase/agent-skills/` command is an agent/developer convenience and is not required for the deployed website.

## 6. Deploy to Vercel
Upload the contents of this folder to the root of your GitHub repo so GitHub immediately shows:

- `app/`
- `components/`
- `lib/`
- `public/`
- `supabase/`
- `package.json`

Then import the repo into Vercel as a Next.js project.

Root Directory: blank  
Build Command: default (`npm run build`)  
Node: 20+

## Suggested next phase
Once this connection is verified, the same Supabase project can support:
- Stripe enrollment/access control
- paid-course entitlement
- named certificates
- admin/facilitator dashboards
- cohort assignments
- organization licensing
- learner analytics
