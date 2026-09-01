# Guided Story Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-lesson video dependence with an interactive teaching sequence that equips learners to complete activities and Knowledge Checks.

**Architecture:** Store guided teaching in a dedicated `lib/guided-story-content.ts` map keyed by module and lesson, then render it through a reusable `GuidedStoryLesson` component before the existing activity and Knowledge Check. This keeps the original course-content file intact while converting all 24 lessons to the new experience.

**Tech Stack:** Next.js 16, React, TypeScript, CSS Modules, existing TCF LEARN course content/progress system.

**Spec:** Approved in chat on 2026-09-01: HOOK → SCENARIO → TEACHING CARDS → COACH'S VOICE (optional) → STOP & APPLY → KNOWLEDGE CHECK → COMPLETE LESSON.

## Global Constraints

- Do not require a video at the beginning of every lesson.
- Preserve existing written activities, Knowledge Checks, feedback, progress persistence, sequential lesson locking, and sequential module locking.
- Lesson teaching content must contain enough information to answer its Knowledge Check.
- Coach's Voice is optional and must not block lesson completion.
- Keep TCF LEARN's near-black, cream, muted-gold editorial visual language.
- Convert all 24 lessons across Modules 1–8.

---

### Task 1: Guided story content architecture

- [x] Add coverage tests for all 24 lessons.
- [x] Create `lib/guided-story-content.ts` with a lesson-specific hook, decision scenario, teaching cards, Coach's Voice, and Stop & Apply prompt for each lesson.

### Task 2: Guided story renderer

- [x] Create `components/GuidedStoryLesson.tsx`.
- [x] Add responsive editorial styling in `components/GuidedStoryLesson.module.css`.
- [x] Render the guided story before each lesson's existing written activity and Knowledge Check.
- [x] Remove the beginning-of-lesson video requirement from the lesson renderer.

### Task 3: Preserve course mechanics

- [x] Keep existing response requirements and quiz feedback.
- [x] Keep sequential lesson tabs and challenge completion flow.
- [x] Keep existing challenge PDF behavior.
- [x] Keep paid/module access gates outside the lesson renderer unchanged.

### Task 4: Verification

- [ ] Run contract tests in an environment with repository execution access.
- [ ] Verify production Vercel build reaches READY.
- [ ] Spot-check Module 1 Lesson 1 and at least one lesson in Modules 2–8 in production.
