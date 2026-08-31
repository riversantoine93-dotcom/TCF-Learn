# Modules 2-8 Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete interactive frameworks for Turning Forward Modules 2-8, with three sequential lessons and one weekly challenge per module, while preserving Module 1 and existing authentication/progress behavior.

**Architecture:** Keep the existing dynamic `/course/turning-forward/[module]` route, but move reusable module definitions into a structured course-content data file so Modules 2-8 can share one renderer. Preserve Module 1's Mux video and current behavior, while using video placeholders for later modules until embeds are supplied. Continue using the existing localStorage + Supabase `ProgressData` system with module-prefixed keys so progress is isolated per module.

**Tech Stack:** Next.js 16, React, TypeScript, Supabase, existing CSS system, Vercel.

**Spec:** Approved in chat on 2026-08-31.

## Global Constraints

- Each module contains exactly 3 lessons plus 1 weekly challenge.
- Lesson 1 is open by default; Lesson 2, Lesson 3, and Challenge unlock sequentially.
- Every lesson has required written interaction fields.
- Every lesson has 4 knowledge-check questions.
- Every knowledge-check question has 4 choices: 1 correct and 3 incorrect.
- Selecting any answer shows immediate explanatory feedback.
- Complete Lesson remains disabled until required fields and all quiz questions are answered.
- Preserve existing authentication, Supabase syncing, local progress, and Module 1 Mux embed.
- Use existing black/cream/gold visual system.
- Modules 2-8 use video placeholders until embeds are provided.

---

## File Structure

- `lib/course.ts` — course overview metadata and availability flags.
- `lib/course-content.ts` — structured definitions for Modules 2-8, lessons, activities, quizzes, and challenges.
- `app/course/turning-forward/[module]/page.tsx` — shared renderer, sequential progress logic, Module 1 special-case Mux video, quiz feedback, and challenge handling.
- `app/course-layout.css` — only if new generic module elements require styling.

## Task 1: Establish course-content contracts

- [ ] Write a failing source-contract check proving Modules 2-8 do not yet have interactive content definitions.
- [ ] Add typed content structures for module, lesson, activity, quiz, and challenge data.
- [ ] Add Module 2-8 definitions with three lessons and one challenge each.
- [ ] Verify every lesson has 4 quiz questions and every question has 4 choices.
- [ ] Verify each question includes feedback for all answer choices.
- [ ] Commit.

## Task 2: Generalize the dynamic module renderer

- [ ] Write a failing source-contract check proving the route currently rejects Modules 2-8 as coming soon.
- [ ] Update the dynamic route to resolve Module 2-8 content from `lib/course-content.ts`.
- [ ] Preserve Module 1's current custom lesson content and Mux video.
- [ ] Add reusable lesson and challenge renderers for Modules 2-8.
- [ ] Prefix all Module 2-8 progress keys with module identifiers to avoid collisions.
- [ ] Preserve sequential unlocking and auto-advance behavior.
- [ ] Verify required fields plus all quiz answers gate each Complete Lesson button.
- [ ] Commit.

## Task 3: Make Modules 2-8 available in the course overview

- [ ] Write a failing source-contract check proving Modules 2-8 are currently marked unavailable.
- [ ] Set Modules 2-8 to available in `lib/course.ts`.
- [ ] Verify all module links point to the existing dynamic route.
- [ ] Commit.

## Task 4: Verification and deployment

- [ ] Fetch committed source and run source-contract checks for all 8 modules.
- [ ] Verify Module 1 still contains the supplied Mux playback URL.
- [ ] Verify Modules 2-8 each expose 3 lessons and 1 challenge.
- [ ] Verify every Module 2-8 lesson has 4 questions × 4 choices and explanatory feedback.
- [ ] Verify Vercel production deployment reaches READY.
- [ ] Fetch at least one Module 2 route and Module 8 route from the deployment to verify they render instead of returning “coming soon.”
