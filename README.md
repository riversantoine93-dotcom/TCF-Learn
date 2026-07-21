# Turning Forward Learning Portal

A GitHub- and Vercel-ready Next.js web course for **Turning Forward: The Work Beyond Fear**, branded with the uploaded Learn logo from The Conviction Fiction Podcast.

## Included

- Public course landing page
- Student registration and email/password sign-in
- Supabase authentication
- Student dashboard
- Eight-module course map
- Complete interactive Module 1
- Private journal fields, quizzes, fear map, structure builder, and weekly challenge
- Browser progress for guests
- Supabase cloud sync for authenticated students
- Mobile-responsive design
- Supabase Row Level Security SQL

## 1. Upload to GitHub

Create a new empty GitHub repository. Upload the **contents of this folder** so `package.json` is at the repository root.

The GitHub root must look like:

```text
app/
components/
lib/
public/
supabase/
package.json
next.config.ts
```

Do not place everything inside an extra folder.

## 2. Configure Supabase

Open the Supabase project at:

```text
https://hgcdchahcdncxbmzjfwk.supabase.co
```

In **SQL Editor**, run:

```text
supabase/schema.sql
```

In **Authentication > URL Configuration**, add your Vercel production URL to the allowed redirect URLs. After connecting the custom domain, also add:

```text
https://learn.theconvictionfictionpodcast.com/**
```

## 3. Deploy to Vercel

1. In Vercel, choose **Add New > Project**.
2. Import the GitHub repository.
3. Leave **Root Directory** blank.
4. Framework Preset should be **Next.js**.
5. Do not override Install, Build, or Output commands.
6. Add these environment variables for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL=https://hgcdchahcdncxbmzjfwk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ne89Tdh-ImkmhlsBT9ItbQ_k_TgpRAe
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://learn.theconvictionfictionpodcast.com
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
STRIPE_TURNING_FORWARD_PRICE_ID=price_1Tvf7pD9JGdKoOvuktXx2rHz
```

7. Deploy.

## 4. View as an end user

After deployment, open the Vercel URL. The end-user flow is:

```text
/                  public landing page
/register          create a student account
/login             student sign in
/dashboard         student dashboard
/course/turning-forward
/course/turning-forward/module-1
/profile
```

For a fast preview without creating an account, open `/course/turning-forward/module-1`. Guest answers save only in that browser. Authenticated student answers sync to Supabase.

## Important production note

This build provides student authentication and learning progress. This build uses Stripe Checkout for a one-time $97 enrollment and grants access through a verified `checkout.session.completed` webhook. In Stripe Workbench, add this production webhook endpoint:

```text
https://learn.theconvictionfictionpodcast.com/api/stripe/webhook
```

Subscribe it to `checkout.session.completed`, then place its `whsec_...` signing secret in Vercel as `STRIPE_WEBHOOK_SECRET`. Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` server-only; never prefix them with `NEXT_PUBLIC_`.

## Video replacement

Each lesson currently contains a branded video placeholder. Replace the `Video` component in:

```text
app/course/turning-forward/[module]/page.tsx
```

with protected Vimeo, Mux, or another video embed.
