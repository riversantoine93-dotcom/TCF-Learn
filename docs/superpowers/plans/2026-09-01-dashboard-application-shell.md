# TCF LEARN Dashboard Application Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing TCF LEARN dashboard to match the approved dark course-hub mockup while preserving real authentication, progress, course navigation, and profile functionality.

**Architecture:** Keep the dashboard as a client-rendered Next.js route backed by the existing AuthProvider and progress helpers. Add a dashboard-specific responsive stylesheet and reusable data-driven course cards. Only Dashboard, My Courses, and Profile appear in navigation because those are the currently functional destinations.

**Tech Stack:** Next.js 16, React, TypeScript, Supabase-backed auth/progress, CSS.

**Spec:** Approved in chat on 2026-09-01.

## Global Constraints
- Preserve existing Supabase authentication and progress syncing.
- Preserve Turning Forward course links and progress behavior.
- Show From Thought to Freedom: Correcting Criminal Thinking Errors as Coming Soon — December 2026.
- Only show working navigation: Dashboard, My Courses, Profile.
- Use the supplied Turning Forward and From Thought to Freedom artwork as course thumbnails.
- Keep the dashboard responsive for desktop and mobile.

---

### Task 1: Dashboard contract
- [ ] Add/update a contract test for the app shell, functional navigation, two course cards, thumbnail references, and coming-soon state.
- [ ] Run the test and verify it fails before production changes.

### Task 2: Dashboard shell and course cards
- [ ] Update `app/dashboard/page.tsx` with sidebar, welcome/stat header, course hub, data-driven cards, real progress, and functional links.
- [ ] Add `app/dashboard/dashboard.css` for the approved dark/gold responsive layout.
- [ ] Add supplied course thumbnail assets under `public/course-thumbnails/`.
- [ ] Run the contract test and build/type checks.

### Task 3: Production verification
- [ ] Commit changes.
- [ ] Verify Vercel production deployment reaches READY.
- [ ] Fetch the deployed dashboard route and check for runtime/build errors before claiming completion.
