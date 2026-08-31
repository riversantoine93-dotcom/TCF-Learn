# TCF LEARN — Supabase + Vercel (pnpm deployment)

This package avoids the npm CLI entirely during Vercel installation.

## Why this version exists
Your previous Vercel deploy failed before the app build started with:

`npm error Exit handler never called!`

That is an npm CLI failure. This project now uses **pnpm** instead of npm for both installation and building.

## Vercel configuration
`vercel.json` forces:

Install:
`corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --no-frozen-lockfile`

Build:
`pnpm run build`

## Supabase
Add these in Vercel > Project Settings > Environment Variables:

NEXT_PUBLIC_SUPABASE_URL=https://hgcdchahcdncxbmzjfwk.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ne89Tdh-ImkmhlsBT9ItbQ_k_TgpRAe

Do not add the direct PostgreSQL password/connection string to browser code.

## Database setup
In Supabase > SQL Editor, run:

`supabase/setup.sql`

once.

## GitHub upload
Upload the CONTENTS of this folder to the repo root. You should immediately see:
- app/
- components/
- lib/
- public/
- supabase/
- package.json
- pnpm-workspace.yaml
- vercel.json

There should be no `package-lock.json`.

## Important Vercel setting
If your Vercel project has a manually configured Install Command from an earlier attempt, clear it or set it to the same pnpm command above. `vercel.json` should then control the install.

This version keeps the TCF LEARN course visuals, Supabase authentication/progress syncing, and Module 1 video.
