# Guided Story Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-lesson video dependence with an interactive teaching sequence that equips learners to complete activities and Knowledge Checks.

**Architecture:** Extend each lesson's structured content with a hook, scenario decision, teaching cards, optional Coach's Voice audio, and Stop & Apply prompt. Render these before the existing activity and Knowledge Check while preserving progress, lesson locking, module locking, and completion rules. Build Module 1 Lesson 1 as the reference experience first, then apply the pattern to all 24 lessons.

**Tech Stack:** Next.js 16, React, TypeScript, existing TCF LEARN course content/progress system.

**Spec:** Approved in chat on 2026-09-01: HOOK → SCENARIO → TEACHING CARDS → COACH'S VOICE (optional) → STOP & APPLY → KNOWLEDGE CHECK → COMPLETE LESSON.

## Global Constraints

- Do not require a video at the beginning of every lesson.
- Preserve existing written activities, Knowledge Checks, feedback, progress persistence, sequential lesson locking, and sequential module locking.
- Lesson teaching content must contain enough information to answer its Knowledge Check.
- Coach's Voice is optional and must not block lesson completion.
- Keep TCF LEARN's near-black, cream, muted-gold editorial visual language.
- Implement Module 1 Lesson 1 as the reference before converting the remaining lessons.

---

### Task 1: Extend the lesson content model

**Files:**
- Modify: `lib/course-content.ts`
- Modify: `lib/module-one-content.ts`
- Test: `tests/guided-story-lesson-contract.test.mjs`

**Interfaces:**
- Produces lesson fields for `hook`, `scenario`, `teachingCards`, optional `coachVoice`, and `applyPrompt`.

- [ ] Write a failing contract test requiring the new guided-story fields and renderer labels.
- [ ] Run it and confirm failure for the missing guided-story experience.
- [ ] Extend `LessonContent` with focused guided-story types.
- [ ] Populate Module 1 Lesson 1 with teaching content aligned to its four existing Knowledge Check concepts: integration, relationship with the past, identity before reputation, and responsibility without shame.
- [ ] Run the contract test.
- [ ] Commit.

### Task 2: Build the guided story renderer

**Files:**
- Modify: `app/course/turning-forward/[module]/page.tsx`
- Modify: `app/course-layout.css`
- Test: `tests/guided-story-lesson-contract.test.mjs`

**Interfaces:**
- Consumes the new structured lesson fields.
- Produces the visible sequence: Hook → Scenario → Teaching Cards → optional Coach's Voice → Stop & Apply.

- [ ] Add a scenario choice component with immediate explanatory feedback.
- [ ] Add teaching-card progression that is readable on desktop and mobile.
- [ ] Add an optional native audio player only when a Coach's Voice audio URL exists; otherwise show the written Coach's Voice takeaway without blocking progress.
- [ ] Add the Stop & Apply prompt immediately before the existing activity.
- [ ] Remove the video requirement from the normal lesson flow; preserve legacy embeds only as optional supplemental media if retained.
- [ ] Run the contract test and production build.
- [ ] Commit.

### Task 3: Validate Module 1 Lesson 1 as the reference lesson

**Files:**
- Modify as needed: `lib/module-one-content.ts`
- Modify as needed: `app/course-layout.css`

- [ ] Verify every Module 1 Lesson 1 Knowledge Check answer is explicitly taught in the guided content.
- [ ] Verify scenario feedback teaches rather than merely marks correct/incorrect.
- [ ] Verify the existing Identity Rewrite response requirements still work.
- [ ] Verify Complete Lesson remains disabled until required written responses and all Knowledge Check questions are answered.
- [ ] Verify mobile layout and accessibility labels.
- [ ] Commit any corrections.

### Task 4: Convert the remaining 23 lessons

**Files:**
- Modify: `lib/module-one-content.ts`
- Modify: `lib/course-content.ts`
- Test: `tests/guided-story-content-coverage.test.mjs`

- [ ] Add content-coverage tests requiring guided teaching content for every lesson.
- [ ] Convert Module 1 Lessons 2–3.
- [ ] Convert Modules 2–8 lesson content while preserving each lesson's terminology and quiz concepts.
- [ ] Ensure every scenario is specific to the lesson rather than generic repetition.
- [ ] Ensure every Knowledge Check concept is taught before it is tested.
- [ ] Run coverage test and build.
- [ ] Commit.

### Task 5: Production verification

- [ ] Verify the latest Git commit is deployed by Vercel.
- [ ] Confirm the production deployment reaches READY.
- [ ] Fetch the public course overview and authenticated lesson preview where available without bypassing access controls.
- [ ] Do not claim the feature live until fresh deployment evidence is READY.
