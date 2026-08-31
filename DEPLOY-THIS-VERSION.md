# Deploy this exact version

The current GitHub repository is missing the application folders and Vercel is still choosing npm.

For a clean deployment:

1. Replace the repository contents with ALL files/folders from this ZIP.
2. At GitHub repo root, confirm these folders are visible:
   - app/
   - components/
   - lib/
   - public/
   - supabase/
3. Confirm `pnpm-lock.yaml` is visible at repo root.
4. Confirm there is NO `package-lock.json`.
5. Confirm there is NO `.npmrc`.
6. In Vercel Project Settings:
   - Framework Preset: Next.js
   - Root Directory: blank
   - Node.js Version: 22.x
   - Install Command: CLEAR/blank (do not enter npm install)
   - Build Command: leave default or `pnpm run build`
7. Add the Supabase environment variables.
8. Redeploy without build cache.

With `pnpm-lock.yaml` present, Vercel should detect pnpm instead of npm.
