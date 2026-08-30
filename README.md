# TCF LEARN — Turning Forward

A deployment-ready Next.js course experience for **Turning Forward: The Work Beyond Fear**.

## What is included

- 8 complete modules
- 24 written lessons
- Reflection journals
- Knowledge checks with instant feedback
- Weekly implementation challenges
- Browser-based progress tracking
- Completion page
- Video placeholders in every lesson
- Responsive mobile layout
- No API keys, database, Stripe, or Supabase required

This content-first build is intentionally independent from the earlier payment system so it can deploy cleanly on Vercel. Stripe, Supabase authentication, and server-side enrollment can be integrated later without rewriting the curriculum.

## Deploy to Vercel

1. Extract this ZIP.
2. Create a new GitHub repository.
3. Upload the **contents** of this folder so `package.json` is at the repository root.
4. In Vercel, select **Add New → Project** and import the repository.
5. Vercel should detect **Next.js** automatically.
6. Leave Root Directory and build settings at their defaults.
7. Deploy.

No environment variables are required.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Add your videos

Each lesson renders:

```tsx
<VideoPlaceholder moduleNumber={module.number} lessonTitle={lesson.title} />
```

The component is located at:

```text
components/VideoPlaceholder.tsx
```

You can replace the placeholder globally, or add a `videoUrl` property to individual lessons in `lib/course.ts` and render the correct embed.

### Basic YouTube/Vimeo iframe example

```tsx
<div className="video-embed">
  <iframe
    src="YOUR_EMBED_URL"
    title={lessonTitle}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
```

## Edit course content

All curriculum is contained in:

```text
lib/course.ts
```

Each module contains:

- `title`
- `subtitle`
- `duration`
- `objectives`
- `lessons`
- `challenge`
- `quiz`

## Important progress note

Student journal responses and completion progress are stored in the learner's browser using `localStorage`. This is ideal for immediate deployment and testing, but it does not synchronize across devices.

A later platform phase can add:

- Supabase user accounts
- cloud progress syncing
- Stripe enrollment protection
- certificates with learner names
- administrator reporting
- facilitator dashboards

## Branding update

The uploaded TCF Learn logo is included at `public/tcf-learn-logo.png` and is used in the header and footer.

## Podcast brand colors

Updated to match The Conviction Fiction Podcast visual direction: charcoal black, warm ivory, muted tan/gold, and neutral gray.
